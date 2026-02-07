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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Calculate the previous week's date range (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0 = Sunday
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

    // Check if rewards already distributed for this week
    const { data: existingRewards } = await supabase
      .from("weekly_reward_distributions")
      .select("id")
      .eq("week_start", weekStartDate)
      .limit(1);

    if (existingRewards && existingRewards.length > 0) {
      console.log("[Weekly Rewards] Already distributed for this week, skipping");
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
      {
        p_week_start: weekStartStr,
        p_week_end: weekEndStr,
      }
    );

    if (leaderboardError) {
      console.error("[Weekly Rewards] Leaderboard error:", leaderboardError);
      throw new Error(`Failed to get leaderboard: ${leaderboardError.message}`);
    }

    if (!leaderboard || leaderboard.length === 0) {
      console.log("[Weekly Rewards] No players found for this week");
      return new Response(
        JSON.stringify({
          success: true,
          message: "No players found for this week",
          week: weekStartDate,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Weekly Rewards] Found ${leaderboard.length} players. Top 3:`);

    const results: Array<{
      placement: number;
      wallet: string;
      score: number;
      ccc: number;
      success: boolean;
    }> = [];

    // Distribute rewards to top 3
    for (const tier of REWARD_TIERS) {
      const player = leaderboard[tier.placement - 1];
      if (!player) {
        console.log(`[Weekly Rewards] No player for ${tier.label}, skipping`);
        continue;
      }

      console.log(
        `[Weekly Rewards] ${tier.label}: ${player.wallet_address} (score: ${player.total_score})`
      );

      // Call the distribute function
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

      if (distError) {
        console.error(
          `[Weekly Rewards] Error distributing to ${tier.label}:`,
          distError
        );
        results.push({
          placement: tier.placement,
          wallet: player.wallet_address,
          score: Number(player.total_score),
          ccc: tier.ccc,
          success: false,
        });
      } else {
        console.log(
          `[Weekly Rewards] ✅ ${tier.label} rewarded: ${tier.ccc} CCC + chest + raffle ticket`
        );
        results.push({
          placement: tier.placement,
          wallet: player.wallet_address,
          score: Number(player.total_score),
          ccc: tier.ccc,
          success: !!distributed,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(
      `[Weekly Rewards] Distribution complete. ${successCount}/${results.length} successful.`
    );

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
