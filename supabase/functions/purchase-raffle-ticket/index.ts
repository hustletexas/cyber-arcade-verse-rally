
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { raffle_id, ticket_count = 1 } = await req.json()

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get raffle details
    const { data: raffle, error: raffleError } = await supabase
      .from('raffles')
      .select('*')
      .eq('id', raffle_id)
      .eq('status', 'active')
      .single()

    if (raffleError || !raffle) {
      throw new Error('Raffle not found or not active')
    }

    // Check if there are enough tickets available
    if (raffle.tickets_sold + ticket_count > raffle.max_tickets) {
      throw new Error('Not enough tickets available')
    }

    // Get user balance
    const { data: balance, error: balanceError } = await supabase
      .from('user_balances')
      .select('cctr_balance')
      .eq('user_id', user.id)
      .single()

    if (balanceError || !balance) {
      throw new Error('User balance not found')
    }

    const totalCost = raffle.ticket_price * ticket_count

    if (balance.cctr_balance < totalCost) {
      throw new Error('Insufficient CCTR balance')
    }

    // Create raffle tickets
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
      throw ticketError
    }

    // Update raffle tickets sold count
    const { error: updateRaffleError } = await supabase
      .from('raffles')
      .update({ 
        tickets_sold: raffle.tickets_sold + ticket_count,
        updated_at: new Date().toISOString()
      })
      .eq('id', raffle_id)

    if (updateRaffleError) {
      throw updateRaffleError
    }

    // Deduct CCTR from user balance
    const { error: balanceUpdateError } = await supabase
      .from('user_balances')
      .update({ 
        cctr_balance: balance.cctr_balance - totalCost,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (balanceUpdateError) {
      throw balanceUpdateError
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('token_transactions')
      .insert({
        user_id: user.id,
        amount: -totalCost,
        transaction_type: 'raffle_purchase',
        description: `Purchased ${ticket_count} raffle ticket(s) for ${raffle.title}`
      })

    if (transactionError) {
      console.error('Transaction record error:', transactionError)
    }

    console.log(`User ${user.id} purchased ${ticket_count} raffle tickets for ${raffle.title}`)

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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
