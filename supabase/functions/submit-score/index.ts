
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.78.0"

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
    const { playerPubkey, score, gameType } = await req.json();

    console.log('Received score submission:', { playerPubkey, score, gameType });

    // Initialize Solana connection
    const connection = new Connection("https://api.mainnet-beta.solana.com");

    // Validate the public key
    const playerPublicKey = new PublicKey(playerPubkey);
    console.log('Player public key validated:', playerPublicKey.toString());

    // For now, we'll simulate the smart contract interaction
    // In a real implementation, you would:
    // 1. Create a transaction to call your smart contract's award_rewards function
    // 2. Sign it with your program's keypair
    // 3. Send the transaction to the network

    // Calculate rewards based on score
    const tokensEarned = Math.floor(score / 10); // 1 token per 10 points
    
    // Simulate transaction hash (in real implementation, this would be the actual tx hash)
    const mockTxHash = `mock_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log('Tokens earned:', tokensEarned);
    console.log('Mock transaction hash:', mockTxHash);

    return new Response(
      JSON.stringify({
        success: true,
        txHash: mockTxHash,
        tokensEarned,
        playerPubkey: playerPublicKey.toString(),
        score
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing score submission:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
