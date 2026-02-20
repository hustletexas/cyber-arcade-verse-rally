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
  quantity?: number;
  customer_email?: string;
  wallet_address?: string;
}

serve(async (req) => {
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
    const { name, price, type, quantity = 1, customer_email, wallet_address } = body;

    // Strict input validation
    if (!name || typeof name !== "string" || name.length > 200) {
      throw new Error("Product name is required and must be under 200 characters");
    }
    if (!price || typeof price !== "number" || price <= 0 || price > 10000000) {
      throw new Error("Valid price required (1 cent to $100,000)");
    }
    if (!type || typeof type !== "string" || type.length > 50) {
      throw new Error("Product type is required and must be under 50 characters");
    }
    if (typeof quantity !== "number" || quantity < 1 || quantity > 100 || !Number.isInteger(quantity)) {
      throw new Error("Quantity must be an integer between 1 and 100");
    }

    console.log(`[CREATE-CHECKOUT] Creating session for: ${name.slice(0, 50)} at $${(price / 100).toFixed(2)}`);

    const origin = req.headers.get("origin") || "https://cybercityarcade.lovable.app";

    const sessionParams: any = {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: name.slice(0, 200),
            },
            unit_amount: Math.round(price),
          },
          quantity: quantity,
        },
      ],
      metadata: {
        type: type.slice(0, 50),
        wallet_address: wallet_address ? wallet_address.slice(0, 100) : "",
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      custom_text: {
        terms_of_service_acceptance: {
          message: `By purchasing, you agree to our [Refund Policy](${origin}/refund-policy).`,
        },
      },
      consent_collection: {
        terms_of_service: "required",
      },
    };

    // Add customer email if provided
    if (customer_email && typeof customer_email === "string" && customer_email.includes("@")) {
      sessionParams.customer_email = customer_email.slice(0, 200);
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

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
