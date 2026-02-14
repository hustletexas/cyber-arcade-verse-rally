import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Reward tiers for top 3
const REWARD_TIERS = [
  { placement: 1, ccc: 50, label: "1st Place" },
  { placement: 2, ccc: 50, label: "2nd Place" },
  { placement: 3, ccc: 50, label: "3rd Place" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Authenticate - require admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(
      authHeader.replace("Bearer ", "")
    );
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role via service role client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: adminCheck } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", claimsData.claims.sub)
      .eq("role", "admin")
      .maybeSingle();

    if (!adminCheck) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Calculate the previous week's date range (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    
    const lastMonday = new Date(now);
    lastMonday.setUTCDate(now.getUTCDate() - daysToLastMonday - 7);
    lastMonday.setUTCHours(0, 0, 0, 0);

    const lastSunday = new Date(lastMonday);
    lastSunday.setUTCDate(lastMonday.getUTCDate() + 7);
    lastSunday.setUTCHours(0, 0, 0, 0);

    const weekStartStr = lastMonday.toISOString();
    const weekEndStr = lastSunday.toISOString();
    const weekStartDate = lastMonday.toISOString().split("T")[0];
    const weekEndDate = lastSunday.toISOString().split("T")[0];

    console.log(`[Weekly Rewards] Processing week: ${weekStartDate} to ${weekEndDate}`);

    // Check if rewards already distributed
    const { data: existingRewards } = await supabase
      .from("weekly_reward_distributions")
      .select("id")
      .eq("week_start", weekStartDate)
      .limit(1);

    if (existingRewards && existingRewards.length > 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Rewards already distributed for this week",
          week: weekStartDate,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get combined weekly leaderboard
    const { data: leaderboard, error: leaderboardError } = await supabase.rpc(
      "get_combined_weekly_leaderboard",
      { p_week_start: weekStartStr, p_week_end: weekEndStr }
    );

    if (leaderboardError) {
      throw new Error(`Failed to get leaderboard: ${leaderboardError.message}`);
    }

    if (!leaderboard || leaderboard.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No players found for this week",
          week: weekStartDate,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: Array<{
      placement: number;
      wallet: string;
      score: number;
      ccc: number;
      success: boolean;
    }> = [];

    for (const tier of REWARD_TIERS) {
      const player = leaderboard[tier.placement - 1];
      if (!player) continue;

      const { data: distributed, error: distError } = await supabase.rpc(
        "distribute_weekly_rewards",
        {
          p_week_start: weekStartDate,
          p_week_end: weekEndDate,
          p_wallet: player.wallet_address,
          p_placement: tier.placement,
          p_total_score: player.total_score,
          p_ccc_amount: tier.ccc,
        }
      );

      results.push({
        placement: tier.placement,
        wallet: player.wallet_address,
        score: Number(player.total_score),
        ccc: tier.ccc,
        success: !distError && !!distributed,
      });
    }

    const successCount = results.filter((r) => r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        week: weekStartDate,
        distributed: results,
        total_rewarded: successCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Weekly Rewards] Fatal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
