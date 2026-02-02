import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Horizon,
  Keypair,
  Networks,
  Asset,
  TransactionBuilder,
  Operation,
  Claimant,
  Memo,
} from "npm:@stellar/stellar-sdk@12.3.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// NFT Asset configuration
const NFT_ASSET_CODE = "CYBERCITYARC";
const NFT_ASSET_ISSUER = "GCAXJENV47EZLLRCHRRILSYBH5IPJU2DCQV6H45T6EJBREUA5FGZD64C";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { claimantPublicKey, nftName, metadata, userId } = await req.json();

    console.log('[mint-nft-claimable] Request received:', { 
      claimantPublicKey: claimantPublicKey?.slice(0, 8) + '...', 
      nftName,
      userId: userId?.slice(0, 8) + '...'
    });

    // Validate inputs
    if (!claimantPublicKey || !claimantPublicKey.startsWith('G') || claimantPublicKey.length !== 56) {
      console.error('[mint-nft-claimable] Invalid claimant public key');
      return new Response(
        JSON.stringify({ error: 'Invalid claimant public key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!nftName || typeof nftName !== 'string') {
      console.error('[mint-nft-claimable] Invalid NFT name');
      return new Response(
        JSON.stringify({ error: 'Invalid NFT name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get issuer secret from environment
    const issuerSecret = Deno.env.get('STELLAR_NFT_ISSUER_SECRET');
    if (!issuerSecret) {
      console.error('[mint-nft-claimable] STELLAR_NFT_ISSUER_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Issuer secret not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client for database operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if wallet already has an NFT mint (enforce 1-per-wallet rule)
    const { data: existingMint, error: checkError } = await supabase
      .from('nft_mints')
      .select('id')
      .eq('wallet_address', claimantPublicKey)
      .maybeSingle();

    if (checkError) {
      console.error('[mint-nft-claimable] Error checking existing mint:', checkError);
      return new Response(
        JSON.stringify({ error: 'Database error checking mint eligibility' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingMint) {
      console.log('[mint-nft-claimable] Wallet already has NFT:', claimantPublicKey.slice(0, 8));
      return new Response(
        JSON.stringify({ error: 'This wallet has already claimed an NFT (limit: 1 per wallet)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stellar SDK (Mainnet)
    const server = new Horizon.Server("https://horizon.stellar.org");
    
    // Load issuer keypair
    const issuerKeypair = Keypair.fromSecret(issuerSecret);
    const issuerPublicKey = issuerKeypair.publicKey();

    console.log('[mint-nft-claimable] Issuer public key:', issuerPublicKey.slice(0, 8) + '...');

    // Load issuer account
    const account = await server.loadAccount(issuerPublicKey);
    console.log('[mint-nft-claimable] Issuer account loaded, sequence:', account.sequence);

    // Create the NFT asset
    const asset = new Asset(NFT_ASSET_CODE, NFT_ASSET_ISSUER);

    // Create claimant with unconditional predicate (user can claim immediately)
    const claimant = new Claimant(claimantPublicKey);

    // Build the claimable balance transaction
    const baseFee = await server.fetchBaseFee();
    console.log('[mint-nft-claimable] Base fee:', baseFee);

    const memoText = `CCA NFT: ${nftName.slice(0, 20)}`;
    
    const tx = new TransactionBuilder(account, {
      fee: String(baseFee),
      networkPassphrase: Networks.PUBLIC,
    })
      .addMemo(Memo.text(memoText.slice(0, 28)))
      .addOperation(
        Operation.createClaimableBalance({
          asset: asset,
          amount: "1",
          claimants: [claimant],
        })
      )
      .setTimeout(60)
      .build();

    // Sign the transaction
    tx.sign(issuerKeypair);
    console.log('[mint-nft-claimable] Transaction signed');

    // Submit the transaction
    const result = await server.submitTransaction(tx);
    console.log('[mint-nft-claimable] Transaction submitted successfully:', result.hash);

    // Extract the claimable balance ID from the result
    // The claimable balance ID is in result.successful and result.hash
    const transactionHash = result.hash;
    const ledger = result.ledger;

    // Generate a unique mint address (claimable balance reference)
    const mintAddress = `CB${transactionHash.slice(0, 54)}`;

    // Record the mint in database using service role (bypasses RLS)
    const { error: insertError } = await supabase
      .from('nft_mints')
      .insert({
        user_id: userId,
        wallet_address: claimantPublicKey,
        nft_name: nftName,
        mint_address: mintAddress,
        transaction_hash: transactionHash,
        metadata: metadata || {},
        status: 'claimable'
      });

    if (insertError) {
      console.error('[mint-nft-claimable] Error recording mint:', insertError);
      // Transaction was successful on-chain, but DB recording failed
      // Still return success with the hash so user can claim
      return new Response(
        JSON.stringify({
          success: true,
          transactionHash,
          mintAddress,
          ledger,
          warning: 'NFT created on-chain but database record failed'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[mint-nft-claimable] Mint recorded successfully');

    return new Response(
      JSON.stringify({
        success: true,
        transactionHash,
        mintAddress,
        ledger,
        claimantPublicKey
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[mint-nft-claimable] Error:', error);
    
    let errorMessage = 'Failed to create claimable balance';
    const errorDetails = error instanceof Error ? error.message : String(error);
    
    // Handle specific Stellar errors
    if (errorDetails.includes('tx_insufficient_balance')) {
      errorMessage = 'Issuer has insufficient XLM for transaction';
    } else if (errorDetails.includes('tx_bad_auth')) {
      errorMessage = 'Transaction authentication failed';
    } else if (errorDetails.includes('op_no_trust')) {
      errorMessage = 'Trust line issue with NFT asset';
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
