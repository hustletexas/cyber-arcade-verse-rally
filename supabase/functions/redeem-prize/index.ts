import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from 'https://esm.sh/@solana/web3.js@1.78.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_prize_id, wallet_address, shipping_address } = await req.json()

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (userError || !user) {
      throw new Error('Invalid user')
    }

    // Get user prize details
    const { data: userPrize, error: userPrizeError } = await supabase
      .from('user_prizes')
      .select(`
        *,
        prize:prizes(*)
      `)
      .eq('id', user_prize_id)
      .eq('user_id', user.id)
      .eq('redemption_status', 'pending')
      .single()

    if (userPrizeError || !userPrize) {
      throw new Error('Prize not found or already redeemed')
    }

    console.log('Processing prize redemption for user:', user.id, 'prize:', userPrize.prize.name)

    let transactionHash = null
    let redemptionData = {
      redeemed_at: new Date().toISOString(),
      wallet_address,
      redemption_status: 'redeemed'
    }

    // Handle different prize types
    if (userPrize.prize.prize_type === 'digital') {
      // For digital prizes (NFTs), create a Solana transaction
      try {
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed')
        
        // Create a simple transaction for NFT minting/transfer
        // This is a placeholder - in production, you would integrate with your NFT program
        const transaction = new Transaction()
        const fromPubkey = new PublicKey(wallet_address)
        
        // Add a memo instruction to mark the NFT redemption
        const memoInstruction = SystemProgram.transfer({
          fromPubkey,
          toPubkey: fromPubkey, // Self-transfer as placeholder
          lamports: 1, // Minimal lamports for transaction
        })
        
        transaction.add(memoInstruction)
        
        // In production, you would:
        // 1. Create or mint the NFT
        // 2. Transfer it to the user's wallet
        // 3. Set metadata with prize information
        
        transactionHash = 'simulated_tx_' + Date.now() // Placeholder for actual transaction
        
        console.log('Digital prize redemption simulated:', transactionHash)
        
      } catch (error) {
        console.error('Solana transaction error:', error)
        throw new Error('Failed to process digital prize redemption')
      }
    } else if (userPrize.prize.prize_type === 'physical') {
      // For physical prizes, require shipping address
      if (!shipping_address) {
        throw new Error('Shipping address required for physical prizes')
      }
      
      redemptionData.shipping_address = shipping_address
      redemptionData.redemption_status = 'processing' // Will be updated when shipped
      
      console.log('Physical prize redemption initiated for shipping')
    }

    // Update user prize record
    const { error: updateError } = await supabase
      .from('user_prizes')
      .update({
        ...redemptionData,
        redemption_transaction_hash: transactionHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_prize_id)

    if (updateError) {
      throw new Error('Failed to update redemption status')
    }

    // Create transaction record for digital prizes
    if (userPrize.prize.prize_type === 'digital' && transactionHash) {
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: 0, // No CCTR cost for prize redemption
          transaction_type: 'prize_redemption',
          description: `Redeemed ${userPrize.prize.name} - ${userPrize.prize.prize_type} prize`
        })

      if (transactionError) {
        console.error('Transaction record error:', transactionError)
      }
    }

    console.log(`Prize redemption successful for user ${user.id}: ${userPrize.prize.name}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully redeemed ${userPrize.prize.name}`,
        prize_type: userPrize.prize.prize_type,
        transaction_hash: transactionHash,
        redemption_status: redemptionData.redemption_status
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Prize redemption error:', error)
    return new Response(
      JSON.stringify({
        error: error.message || 'An error occurred during prize redemption'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})