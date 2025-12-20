import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Valid payment methods
const VALID_PAYMENT_METHODS = ['paypal', 'usdc', 'card'] as const
type PaymentMethod = typeof VALID_PAYMENT_METHODS[number]

// Token pricing
const TOKEN_PRICE_USD = 0.045
const MIN_AMOUNT = 10
const MAX_AMOUNT = 1000000

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

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.log('Authentication failed:', authError?.message)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    // Parse request body
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

    // Type check and validate
    if (typeof body !== 'object' || body === null) {
      return new Response(
        JSON.stringify({ error: 'Request body must be an object' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { amount, payment_method, payment_currency = 'USD' } = body as Record<string, unknown>

    // Validate amount
    if (typeof amount !== 'number' || !Number.isFinite(amount) || !Number.isInteger(amount)) {
      console.log('Invalid amount type:', typeof amount, amount)
      return new Response(
        JSON.stringify({ error: 'Amount must be a valid integer' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
      console.log(`Amount ${amount} out of bounds (${MIN_AMOUNT}-${MAX_AMOUNT})`)
      return new Response(
        JSON.stringify({ error: `Amount must be between ${MIN_AMOUNT} and ${MAX_AMOUNT} tokens` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate payment method
    if (typeof payment_method !== 'string' || !VALID_PAYMENT_METHODS.includes(payment_method as PaymentMethod)) {
      console.log('Invalid payment method:', payment_method)
      return new Response(
        JSON.stringify({ error: `Invalid payment method. Must be one of: ${VALID_PAYMENT_METHODS.join(', ')}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Validate currency
    if (typeof payment_currency !== 'string' || payment_currency.length > 10) {
      console.log('Invalid currency:', payment_currency)
      return new Response(
        JSON.stringify({ error: 'Invalid payment currency' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const paymentAmount = amount * TOKEN_PRICE_USD

    console.log(`Creating payment for user ${user.id}: ${amount} tokens via ${payment_method}`)

    // Create token purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('token_purchases')
      .insert({
        user_id: user.id,
        amount: amount,
        payment_method: payment_method,
        payment_amount: paymentAmount,
        payment_currency: payment_currency,
        status: 'pending'
      })
      .select()
      .single()

    if (purchaseError) {
      console.error('Failed to create purchase record:', purchaseError)
      return new Response(
        JSON.stringify({ error: 'Failed to create purchase record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Generate payment URL based on method (demo URLs)
    let paymentUrl = ''
    
    if (payment_method === 'paypal') {
      paymentUrl = `https://www.paypal.com/checkoutnow?token=demo_${purchase.id}`
    } else if (payment_method === 'usdc') {
      paymentUrl = `https://pay.coinbase.com/checkout/${purchase.id}`
    } else if (payment_method === 'card') {
      paymentUrl = `https://checkout.stripe.com/demo/${purchase.id}`
    }

    console.log(`Payment created successfully: ${purchase.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        purchase_id: purchase.id,
        payment_url: paymentUrl,
        amount: amount,
        payment_amount: purchase.payment_amount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Payment creation error:', error)
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
