
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

    const { amount, payment_method, payment_currency = 'USD' } = await req.json()

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

    // Create token purchase record
    const { data: purchase, error: purchaseError } = await supabase
      .from('token_purchases')
      .insert({
        user_id: user.id,
        amount: amount,
        payment_method: payment_method,
        payment_amount: payment_method === 'usdc' ? amount * 0.045 : amount * 0.045, // $0.045 per token
        payment_currency: payment_currency,
        status: 'pending'
      })
      .select()
      .single()

    if (purchaseError) {
      throw purchaseError
    }

    // For demo purposes, simulate payment processing
    let paymentUrl = ''
    
    if (payment_method === 'paypal') {
      // In production, integrate with PayPal API
      paymentUrl = `https://www.paypal.com/checkoutnow?token=demo_${purchase.id}`
    } else if (payment_method === 'usdc') {
      // In production, integrate with USDC payment processor
      paymentUrl = `https://pay.coinbase.com/checkout/${purchase.id}`
    }

    console.log(`Payment created for user ${user.id}: ${amount} tokens via ${payment_method}`)

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
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
