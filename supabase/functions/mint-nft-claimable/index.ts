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

const NFT_ASSET_CODE = "CYBERCITYARC";
const NFT_ASSET_ISSUER = "GCAXJENV47EZLLRCHRRILSYBH5IPJU2DCQV6H45T6EJBREUA5FGZD64C";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(
      authHeader.replace('Bearer ', '')
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authenticatedUserId = claimsData.claims.sub;

    const { claimantPublicKey, nftName, metadata } = await req.json();

    console.log('[mint-nft-claimable] Authenticated user:', authenticatedUserId);

    // Validate inputs
    if (!claimantPublicKey || !claimantPublicKey.startsWith('G') || claimantPublicKey.length !== 56) {
      return new Response(
        JSON.stringify({ error: 'Invalid claimant public key' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!nftName || typeof nftName !== 'string' || nftName.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Invalid NFT name (max 100 chars)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const issuerSecret = Deno.env.get('STELLAR_NFT_ISSUER_SECRET');
    if (!issuerSecret) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Issuer secret not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role for DB operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if wallet already has an NFT mint
    const { data: existingMint, error: checkError } = await supabase
      .from('nft_mints')
      .select('id')
      .eq('wallet_address', claimantPublicKey)
      .maybeSingle();

    if (checkError) {
      return new Response(
        JSON.stringify({ error: 'Database error checking mint eligibility' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingMint) {
      return new Response(
        JSON.stringify({ error: 'This wallet has already claimed an NFT (limit: 1 per wallet)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Stellar SDK (Mainnet)
    const server = new Horizon.Server("https://horizon.stellar.org");
    const issuerKeypair = Keypair.fromSecret(issuerSecret);
    const issuerPublicKey = issuerKeypair.publicKey();

    const account = await server.loadAccount(issuerPublicKey);
    const asset = new Asset(NFT_ASSET_CODE, NFT_ASSET_ISSUER);
    const claimant = new Claimant(claimantPublicKey);
    const baseFee = await server.fetchBaseFee();
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

    tx.sign(issuerKeypair);
    const result = await server.submitTransaction(tx);
    const transactionHash = result.hash;
    const ledger = result.ledger;
    const mintAddress = `CB${transactionHash.slice(0, 54)}`;

    // Record the mint using authenticated user ID
    const { error: insertError } = await supabase
      .from('nft_mints')
      .insert({
        user_id: authenticatedUserId,
        wallet_address: claimantPublicKey,
        nft_name: nftName.slice(0, 100),
        mint_address: mintAddress,
        transaction_hash: transactionHash,
        metadata: metadata || {},
        status: 'claimable'
      });

    if (insertError) {
      console.error('[mint-nft-claimable] Error recording mint:', insertError);
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
