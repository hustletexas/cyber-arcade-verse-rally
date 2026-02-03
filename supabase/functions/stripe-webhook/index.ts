import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Get the signature from headers
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      console.error("[STRIPE-WEBHOOK] No signature found");
      return new Response(JSON.stringify({ error: "No signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get raw body for signature verification
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error("[STRIPE-WEBHOOK] Signature verification failed:", err);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[STRIPE-WEBHOOK] Received event: ${event.type}`);

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log(`[STRIPE-WEBHOOK] Processing checkout session: ${session.id}`);
      console.log(`[STRIPE-WEBHOOK] Payment status: ${session.payment_status}`);
      console.log(`[STRIPE-WEBHOOK] Metadata:`, session.metadata);

      // Extract metadata
      const metadata = session.metadata || {};
      const type = metadata.type;
      const userId = metadata.user_id;
      const email = metadata.email || session.customer_email;

      // Initialize Supabase client
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      // Handle different purchase types
      switch (type) {
        case "pass":
        case "season_pass":
          console.log(`[STRIPE-WEBHOOK] Processing pass purchase for: ${email}`);
          
          // Record the pass purchase
          const { error: passError } = await supabase
            .from("nft_mints")
            .insert({
              user_id: userId || session.id,
              wallet_address: metadata.wallet_address || "pending",
              nft_name: "Cyber City Arcade Pass",
              mint_address: `stripe_${session.id}`,
              transaction_hash: session.payment_intent as string || session.id,
              status: "completed",
              metadata: {
                stripe_session_id: session.id,
                amount_total: session.amount_total,
                currency: session.currency,
                email: email,
                type: type,
              },
            });

          if (passError) {
            console.error("[STRIPE-WEBHOOK] Error recording pass:", passError);
          } else {
            console.log("[STRIPE-WEBHOOK] Pass purchase recorded successfully");
          }
          break;

        case "merchandise":
        case "merch":
          console.log(`[STRIPE-WEBHOOK] Processing merch order for: ${email}`);
          
          // Record merch purchase
          const { error: merchError } = await supabase
            .from("nft_purchases")
            .insert({
              user_id: userId || session.id,
              wallet_address: metadata.wallet_address || "fiat_purchase",
              nft_id: `merch_${session.id}`,
              nft_name: metadata.product_name || "Merchandise",
              price: (session.amount_total || 0) / 100,
              currency: session.currency?.toUpperCase() || "USD",
              status: "completed",
              transaction_hash: session.payment_intent as string || session.id,
            });

          if (merchError) {
            console.error("[STRIPE-WEBHOOK] Error recording merch:", merchError);
          } else {
            console.log("[STRIPE-WEBHOOK] Merch order recorded successfully");
          }
          break;

        case "tokens":
        case "cctr":
          console.log(`[STRIPE-WEBHOOK] Processing token purchase for: ${email}`);
          
          const tokenAmount = parseInt(metadata.token_amount || "0");
          
          // Record token purchase
          const { error: tokenError } = await supabase
            .from("token_purchases")
            .insert({
              user_id: userId,
              amount: tokenAmount,
              payment_amount: (session.amount_total || 0) / 100,
              payment_currency: session.currency?.toUpperCase() || "USD",
              payment_method: "stripe",
              stripe_session_id: session.id,
              status: "completed",
            });

          if (tokenError) {
            console.error("[STRIPE-WEBHOOK] Error recording tokens:", tokenError);
          } else {
            console.log("[STRIPE-WEBHOOK] Token purchase recorded successfully");
            
            // Credit tokens to user balance if userId exists
            if (userId) {
              const { error: balanceError } = await supabase.rpc("initialize_wallet_balance", {
                p_wallet_address: metadata.wallet_address || userId,
              });
              
              if (balanceError) {
                console.error("[STRIPE-WEBHOOK] Error updating balance:", balanceError);
              }
            }
          }
          break;

        default:
          console.log(`[STRIPE-WEBHOOK] Unknown purchase type: ${type}`);
          // Still record generic purchase
          const { error: genericError } = await supabase
            .from("nft_purchases")
            .insert({
              user_id: userId || session.id,
              wallet_address: metadata.wallet_address || "fiat_purchase",
              nft_id: `purchase_${session.id}`,
              nft_name: metadata.product_name || type || "Purchase",
              price: (session.amount_total || 0) / 100,
              currency: session.currency?.toUpperCase() || "USD",
              status: "completed",
              transaction_hash: session.payment_intent as string || session.id,
            });

          if (genericError) {
            console.error("[STRIPE-WEBHOOK] Error recording purchase:", genericError);
          }
      }
    }

    // Return success
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[STRIPE-WEBHOOK] Error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
