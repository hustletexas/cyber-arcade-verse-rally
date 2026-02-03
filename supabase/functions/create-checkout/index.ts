import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CheckoutRequest {
  name: string;
  price: number; // in cents (e.g., 1999 = $19.99)
  type: string;
  user_id?: string;
  email?: string;
  quantity?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const body: CheckoutRequest = await req.json();
    const { name, price, type, user_id, email, quantity = 1 } = body;

    // Validate required fields
    if (!name || typeof name !== "string") {
      throw new Error("Product name is required");
    }
    if (!price || typeof price !== "number" || price <= 0) {
      throw new Error("Valid price (in cents) is required");
    }
    if (!type || typeof type !== "string") {
      throw new Error("Product type is required");
    }

    console.log(`[CREATE-CHECKOUT] Creating session for: ${name} at $${(price / 100).toFixed(2)}`);

    const origin = req.headers.get("origin") || "https://cybercityarcade.lovable.app";

    // Create checkout session with dynamic pricing
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: name,
            },
            unit_amount: price,
          },
          quantity: quantity,
        },
      ],
      metadata: {
        type: type,
        user_id: user_id || "",
        email: email || "",
      },
      customer_email: email || undefined,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
    });

    console.log(`[CREATE-CHECKOUT] Session created: ${session.id}`);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CREATE-CHECKOUT] Error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
