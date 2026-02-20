import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

interface ClaimRequest {
  source_type: string   // 'tournament' | 'weekly_leaderboard' | 'achievement' | 'raffle' | 'chest'
  source_id: string     // the specific tournament ID, week ID, etc.
  wallet_address: string
}

const VALID_SOURCE_TYPES = ['tournament', 'weekly_leaderboard', 'achievement', 'raffle', 'chest']

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // ── Step 1: Verify the request is real (auth check) ──
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'Missing or invalid auth token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // User-scoped client for auth verification
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Service-role client for privileged writes (bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Verify JWT and get user
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await userClient.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub as string
    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized', details: 'No user ID in token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Step 2: Parse and validate request body ──
    const body: ClaimRequest = await req.json()
    const { source_type, source_id, wallet_address } = body

    if (!source_type || !VALID_SOURCE_TYPES.includes(source_type)) {
      return new Response(
        JSON.stringify({ error: 'Bad request', details: `Invalid source_type. Must be one of: ${VALID_SOURCE_TYPES.join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!source_id || source_id.length > 255) {
      return new Response(
        JSON.stringify({ error: 'Bad request', details: 'Invalid or missing source_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!wallet_address || wallet_address.length < 10 || wallet_address.length > 100) {
      return new Response(
        JSON.stringify({ error: 'Bad request', details: 'Invalid wallet address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify wallet belongs to this user
    const { data: profile } = await adminClient
      .from('profiles')
      .select('wallet_address')
      .eq('id', userId)
      .single()

    if (profile?.wallet_address && profile.wallet_address !== wallet_address) {
      return new Response(
        JSON.stringify({ error: 'Forbidden', details: 'Wallet address does not match your profile' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Step 3: Prevent double-claim ──
    const { data: existingClaim } = await adminClient
      .from('reward_claims')
      .select('id, status, created_at')
      .eq('user_id', userId)
      .eq('source_type', source_type)
      .eq('source_id', source_id)
      .maybeSingle()

    if (existingClaim) {
      return new Response(
        JSON.stringify({
          error: 'Already claimed',
          details: `You already claimed this reward on ${existingClaim.created_at}`,
          claim_id: existingClaim.id,
          status: existingClaim.status,
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Step 4: Confirm user is eligible (check source records) ──
    let claimAmount = 0
    let currency = 'CCC'
    let claimReason = ''

    if (source_type === 'tournament') {
      // Check solana_tournament_entries or tournament_standings for placement
      const { data: entry } = await adminClient
        .from('solana_tournament_entries')
        .select('placement, reward_amount, wallet_address, solana_tournaments(name)')
        .eq('tournament_id', source_id)
        .eq('user_id', userId)
        .maybeSingle()

      if (!entry) {
        // Try arcade tournament standings
        const { data: standing } = await adminClient
          .from('tournament_standings')
          .select('placement, prize_amount_usd, prize_amount_usdc, wallet_address')
          .eq('tournament_id', source_id)
          .eq('user_id', userId)
          .maybeSingle()

        if (!standing) {
          return new Response(
            JSON.stringify({ error: 'Not eligible', details: 'No tournament entry found for this user' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!standing.placement || standing.placement > 3) {
          return new Response(
            JSON.stringify({ error: 'Not eligible', details: 'Only top 3 placements can claim rewards' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        claimAmount = standing.prize_amount_usdc || standing.prize_amount_usd || 0
        currency = standing.prize_amount_usdc ? 'USDC' : 'USD'
        claimReason = `#${standing.placement} place - Arcade Tournament`
      } else {
        if (!entry.reward_amount || entry.reward_amount <= 0) {
          return new Response(
            JSON.stringify({ error: 'Not eligible', details: 'No reward amount for this tournament entry' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        claimAmount = entry.reward_amount
        currency = 'SOL'
        const tournamentName = (entry as any).solana_tournaments?.name || 'Tournament'
        claimReason = `#${entry.placement || '?'} place - ${tournamentName}`
      }
    } else if (source_type === 'weekly_leaderboard') {
      // Check weekly_reward_distributions
      const { data: dist } = await adminClient
        .from('weekly_reward_distributions')
        .select('*')
        .eq('wallet_address', wallet_address)
        .eq('week_start', source_id)
        .maybeSingle()

      if (!dist) {
        return new Response(
          JSON.stringify({ error: 'Not eligible', details: 'No weekly reward found for this wallet' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      claimAmount = dist.ccc_awarded || 0
      currency = 'CCC'
      claimReason = `#${dist.placement} weekly leaderboard (${dist.week_start} to ${dist.week_end})`
    } else if (source_type === 'chest') {
      // Check winner_chest_eligibility
      const { data: chest } = await adminClient
        .from('winner_chest_eligibility')
        .select('*')
        .eq('wallet_address', wallet_address)
        .eq('source_id', source_id)
        .eq('is_claimed', false)
        .maybeSingle()

      if (!chest) {
        return new Response(
          JSON.stringify({ error: 'Not eligible', details: 'No unclaimed chest found' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      claimAmount = 0 // Chest rewards are determined at open time
      currency = 'CHEST'
      claimReason = `Winner chest from ${chest.source_type}`
    } else if (source_type === 'achievement') {
      // Check user_achievements
      const { data: achievement } = await adminClient
        .from('user_achievements')
        .select('achievement_id, achievements(name, points)')
        .eq('user_id', userId)
        .eq('achievement_id', source_id)
        .maybeSingle()

      if (!achievement) {
        return new Response(
          JSON.stringify({ error: 'Not eligible', details: 'Achievement not earned' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      claimAmount = (achievement as any).achievements?.points || 0
      currency = 'CCC'
      claimReason = `Achievement: ${(achievement as any).achievements?.name || 'Unknown'}`
    } else if (source_type === 'raffle') {
      // Check raffles winner
      const { data: raffle } = await adminClient
        .from('raffles')
        .select('*')
        .eq('id', source_id)
        .eq('winner_user_id', userId)
        .maybeSingle()

      if (!raffle) {
        return new Response(
          JSON.stringify({ error: 'Not eligible', details: 'You are not the winner of this raffle' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      claimAmount = raffle.prize_value || 0
      currency = raffle.prize_type || 'CCC'
      claimReason = `Raffle winner: ${raffle.title}`
    }

    if (claimAmount <= 0 && currency !== 'CHEST') {
      return new Response(
        JSON.stringify({ error: 'Not eligible', details: 'No reward amount to claim' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Step 5: Record the claim (status = "approved" for manual payout) ──
    const { data: claim, error: insertError } = await adminClient
      .from('reward_claims')
      .insert({
        user_id: userId,
        wallet_address,
        source_type,
        source_id,
        amount: claimAmount,
        currency,
        status: 'approved',
        claim_reason: claimReason,
      })
      .select()
      .single()

    if (insertError) {
      // Handle unique constraint violation (race condition double-claim)
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'Already claimed', details: 'This reward was already claimed (concurrent request)' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      throw insertError
    }

    // Mark chest as claimed if applicable
    if (source_type === 'chest') {
      await adminClient
        .from('winner_chest_eligibility')
        .update({ is_claimed: true })
        .eq('wallet_address', wallet_address)
        .eq('source_id', source_id)
    }

    // Mark tournament reward as claimed if applicable
    if (source_type === 'tournament') {
      await adminClient
        .from('solana_tournament_entries')
        .update({ reward_claimed: true })
        .eq('tournament_id', source_id)
        .eq('user_id', userId)
    }

    console.log(`[claim-reward] Approved: user=${userId} source=${source_type}/${source_id} amount=${claimAmount} ${currency}`)

    return new Response(
      JSON.stringify({
        success: true,
        claim_id: claim.id,
        status: 'approved',
        amount: claimAmount,
        currency,
        reason: claimReason,
        message: 'Reward claim approved. Payout will be processed by an admin.',
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[claim-reward] Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: 'Something went wrong processing your claim' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
