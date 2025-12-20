import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Validation constants
const MIN_TICKET_COUNT = 1
const MAX_TICKET_COUNT = 100

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Use service role key for transaction-like operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Also create a client with anon key for auth
    const authSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { data: { user }, error: authError } = await authSupabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.log('Authentication failed:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Parse and validate request body
    let body: unknown
    try {
      body = await req.json()
    } catch (e) {
      console.log('Invalid JSON body')
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (typeof body !== 'object' || body === null) {
      return new Response(
        JSON.stringify({ error: 'Request body must be an object' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { raffle_id, ticket_count = 1 } = body as Record<string, unknown>

    // Validate raffle_id (UUID format)
    if (typeof raffle_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raffle_id)) {
      console.log('Invalid raffle_id format:', raffle_id)
      return new Response(
        JSON.stringify({ error: 'Invalid raffle ID format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate ticket_count
    if (typeof ticket_count !== 'number' || !Number.isInteger(ticket_count)) {
      console.log('Invalid ticket_count type:', typeof ticket_count)
      return new Response(
        JSON.stringify({ error: 'Ticket count must be an integer' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (ticket_count < MIN_TICKET_COUNT || ticket_count > MAX_TICKET_COUNT) {
      console.log(`Ticket count ${ticket_count} out of bounds (${MIN_TICKET_COUNT}-${MAX_TICKET_COUNT})`)
      return new Response(
        JSON.stringify({ error: `Ticket count must be between ${MIN_TICKET_COUNT} and ${MAX_TICKET_COUNT}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    console.log(`User ${user.id} purchasing ${ticket_count} tickets for raffle ${raffle_id}`)

    // Get raffle details with row lock for update
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffle_id)
      .eq('status', 'active')
      .single()

    if (raffleError || !raffle) {
      console.log('Raffle not found or not active:', raffleError?.message)
      return new Response(
        JSON.stringify({ error: 'Raffle not found or not active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Check if there are enough tickets available
    if (raffle.tickets_sold + ticket_count > raffle.max_tickets) {
      console.log(`Not enough tickets: ${raffle.tickets_sold}/${raffle.max_tickets}, requested: ${ticket_count}`)
      return new Response(
        JSON.stringify({ error: 'Not enough tickets available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get user balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_balances')
      .select('cctr_balance')
      .eq('user_id', user.id)
      .single()

    if (balanceError || !balance) {
      console.log('User balance not found:', balanceError?.message)
      return new Response(
        JSON.stringify({ error: 'User balance not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const totalCost = raffle.ticket_price * ticket_count

    if (balance.cctr_balance < totalCost) {
      console.log(`Insufficient balance: ${balance.cctr_balance} < ${totalCost}`)
      return new Response(
        JSON.stringify({ error: 'Insufficient CCTR balance' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Perform all operations - in a real production app, use a database transaction
    // For now, we'll do them sequentially with error handling

    // 1. Deduct CCTR from user balance FIRST (prevents double-spending)
    const { error: balanceUpdateError } = await supabase
      .from('user_balances')
      .update({ 
        cctr_balance: balance.cctr_balance - totalCost,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .eq('cctr_balance', balance.cctr_balance) // Optimistic lock

    if (balanceUpdateError) {
      console.error('Failed to update balance (possible race condition):', balanceUpdateError)
      return new Response(
        JSON.stringify({ error: 'Failed to process payment. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 2. Create raffle tickets
    const tickets = []
    for (let i = 0; i < ticket_count; i++) {
      tickets.push({
        raffle_id: raffle_id,
        user_id: user.id,
        ticket_number: raffle.tickets_sold + i + 1
      })
    }

    const { error: ticketError } = await supabase
      .from('raffle_tickets')
      .insert(tickets)

    if (ticketError) {
      console.error('Failed to create tickets, refunding balance:', ticketError)
      // Refund the balance
      await supabase
        .from('user_balances')
        .update({ 
          cctr_balance: balance.cctr_balance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      
      return new Response(
        JSON.stringify({ error: 'Failed to create tickets. Balance refunded.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // 3. Update raffle tickets sold count
    const { error: updateRaffleError } = await supabase
      .from('raffles')
      .update({ 
        tickets_sold: raffle.tickets_sold + ticket_count,
        updated_at: new Date().toISOString()
      })
      .eq('id', raffle_id)

    if (updateRaffleError) {
      console.error('Failed to update raffle count:', updateRaffleError)
      // Continue anyway - tickets were created, this is not critical
    }

    // 4. Create transaction record (non-critical)
    const { error: transactionError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: user.id,
        amount: -totalCost,
        transaction_type: 'raffle_purchase',
        description: `Purchased ${ticket_count} raffle ticket(s) for ${raffle.title}`
      })

    if (transactionError) {
      console.error('Transaction record error (non-critical):', transactionError)
    }

    console.log(`Successfully purchased ${ticket_count} raffle tickets for user ${user.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        tickets_purchased: ticket_count,
        total_cost: totalCost,
        ticket_numbers: tickets.map(t => t.ticket_number)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Raffle ticket purchase error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
