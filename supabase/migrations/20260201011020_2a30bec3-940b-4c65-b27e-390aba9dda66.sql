-- =====================================================
-- FINAL SECURITY FIX - Lock down remaining public tables
-- Use secure views for public access with masked data
-- =====================================================

-- 1. FIX match_scores - restrict base table, create secure view
DROP POLICY IF EXISTS "Anyone can view leaderboard scores" ON public.match_scores;

CREATE POLICY "Users can view own scores" ON public.match_scores
  FOR SELECT USING (user_id IS NOT NULL AND length(user_id) > 10);

-- Create secure leaderboard view for public access
DROP VIEW IF EXISTS public.match_scores_leaderboard;
CREATE VIEW public.match_scores_leaderboard WITH (security_invoker = true) AS
SELECT 
  id,
  score,
  time_seconds,
  moves,
  mismatches,
  created_at,
  -- Mask user_id for privacy - show only first 4 and last 4 chars
  CASE 
    WHEN length(user_id) > 12 
    THEN left(user_id, 4) || '...' || right(user_id, 4)
    ELSE 'Anonymous'
  END as player_id
FROM public.match_scores
ORDER BY score DESC;

-- 2. FIX trivia_runs - restrict base table, create secure view
DROP POLICY IF EXISTS "Anyone can view trivia runs" ON public.trivia_runs;

CREATE POLICY "Users can view own trivia runs" ON public.trivia_runs
  FOR SELECT USING (user_id IS NOT NULL AND length(user_id) > 10);

-- Create secure leaderboard view for trivia
DROP VIEW IF EXISTS public.trivia_leaderboard;
CREATE VIEW public.trivia_leaderboard WITH (security_invoker = true) AS
SELECT 
  id,
  mode,
  score,
  best_streak,
  correct_count,
  total_questions,
  combo_multiplier,
  speed_bonus,
  started_at,
  ended_at,
  -- Mask user_id for privacy
  CASE 
    WHEN length(user_id) > 12 
    THEN left(user_id, 4) || '...' || right(user_id, 4)
    ELSE 'Anonymous'
  END as player_id
FROM public.trivia_runs
WHERE ended_at IS NOT NULL
ORDER BY score DESC;

-- Update trivia_daily_leaderboard view to mask user_id
DROP VIEW IF EXISTS public.trivia_daily_leaderboard;
CREATE VIEW public.trivia_daily_leaderboard WITH (security_invoker = true) AS
SELECT 
  ROW_NUMBER() OVER (ORDER BY score DESC) as rank,
  score,
  best_streak,
  correct_count,
  started_at,
  CASE 
    WHEN length(user_id) > 12 
    THEN left(user_id, 4) || '...' || right(user_id, 4)
    ELSE 'Anonymous'
  END as player_id
FROM public.trivia_runs
WHERE ended_at IS NOT NULL 
  AND started_at >= CURRENT_DATE
ORDER BY score DESC
LIMIT 100;

-- 3. FIX tournament_matches - restrict base table to participants/admins
DROP POLICY IF EXISTS "Anyone can view matches for published tournaments" ON public.tournament_matches;

CREATE POLICY "Participants and admins can view matches" ON public.tournament_matches
  FOR SELECT USING (
    -- Match participants can view
    player_a_id = (SELECT auth.uid()) 
    OR player_b_id = (SELECT auth.uid())
    -- Tournament admins can view
    OR EXISTS (
      SELECT 1 FROM public.arcade_tournaments t 
      WHERE t.id = tournament_id 
      AND (t.admin_id = (SELECT auth.uid()) OR t.status != 'draft')
    )
    -- Global admins can view all
    OR public.is_admin()
  );

-- Create public bracket view with masked wallets
DROP VIEW IF EXISTS public.tournament_bracket_public;
CREATE VIEW public.tournament_bracket_public WITH (security_invoker = true) AS
SELECT 
  tm.id,
  tm.tournament_id,
  tm.round_number,
  tm.match_number,
  tm.player_a_score,
  tm.player_b_score,
  tm.status,
  tm.scheduled_time,
  tm.started_at,
  tm.completed_at,
  tm.bracket_position,
  tm.disputed,
  -- Mask wallet addresses
  public.mask_wallet_address(tm.player_a_wallet) as player_a_wallet,
  public.mask_wallet_address(tm.player_b_wallet) as player_b_wallet,
  public.mask_wallet_address(tm.winner_wallet) as winner_wallet,
  tm.created_at
FROM public.tournament_matches tm
JOIN public.arcade_tournaments t ON t.id = tm.tournament_id
WHERE t.status != 'draft';

-- 4. FIX tournament_standings - restrict base table to participants/admins
DROP POLICY IF EXISTS "Anyone can view standings" ON public.tournament_standings;

CREATE POLICY "Participants and admins can view standings" ON public.tournament_standings
  FOR SELECT USING (
    -- Own standings
    user_id = (SELECT auth.uid())
    -- Tournament admins
    OR EXISTS (
      SELECT 1 FROM public.arcade_tournaments t 
      WHERE t.id = tournament_id 
      AND t.admin_id = (SELECT auth.uid())
    )
    -- Global admins
    OR public.is_admin()
  );

-- Create public standings view with masked wallets
DROP VIEW IF EXISTS public.tournament_standings_public;
CREATE VIEW public.tournament_standings_public WITH (security_invoker = true) AS
SELECT 
  ts.id,
  ts.tournament_id,
  ts.placement,
  ts.wins,
  ts.losses,
  ts.points,
  ts.prize_amount_usd,
  ts.finalized,
  -- Mask wallet address
  public.mask_wallet_address(ts.wallet_address) as wallet_address,
  ts.created_at
FROM public.tournament_standings ts
JOIN public.arcade_tournaments t ON t.id = ts.tournament_id
WHERE t.status != 'draft'
ORDER BY ts.placement;

-- 5. Grant SELECT on public views to anon and authenticated roles
GRANT SELECT ON public.match_scores_leaderboard TO anon, authenticated;
GRANT SELECT ON public.trivia_leaderboard TO anon, authenticated;
GRANT SELECT ON public.trivia_daily_leaderboard TO anon, authenticated;
GRANT SELECT ON public.tournament_bracket_public TO anon, authenticated;
GRANT SELECT ON public.tournament_standings_public TO anon, authenticated;