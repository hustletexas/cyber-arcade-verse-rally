-- ============================================================
-- Fix overpermissive trivia RLS policies
-- Replace weak length(user_id) > 10 checks with proper ownership
-- ============================================================

-- 1. trivia_runs: tighten INSERT/UPDATE to own wallet, SELECT allows own + completed (leaderboard)
DROP POLICY IF EXISTS "Users can insert own trivia runs" ON public.trivia_runs;
DROP POLICY IF EXISTS "Users can update own trivia runs" ON public.trivia_runs;
DROP POLICY IF EXISTS "Users can view own trivia runs" ON public.trivia_runs;

CREATE POLICY "Users can insert own trivia runs"
ON public.trivia_runs FOR INSERT
WITH CHECK (user_id = (SELECT public.get_current_wallet_address()));

CREATE POLICY "Users can update own trivia runs"
ON public.trivia_runs FOR UPDATE
USING (user_id = (SELECT public.get_current_wallet_address()));

CREATE POLICY "Users can view own trivia runs"
ON public.trivia_runs FOR SELECT
USING (
  user_id = (SELECT public.get_current_wallet_address())
  OR ended_at IS NOT NULL  -- completed runs visible for leaderboard
);

-- 2. trivia_run_answers: tighten to own runs only
DROP POLICY IF EXISTS "Users can insert run answers" ON public.trivia_run_answers;
DROP POLICY IF EXISTS "Users can view run answers" ON public.trivia_run_answers;

CREATE POLICY "Users can insert run answers"
ON public.trivia_run_answers FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.trivia_runs tr
  WHERE tr.id = trivia_run_answers.run_id
    AND tr.user_id = (SELECT public.get_current_wallet_address())
));

CREATE POLICY "Users can view run answers"
ON public.trivia_run_answers FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.trivia_runs tr
  WHERE tr.id = trivia_run_answers.run_id
    AND tr.user_id = (SELECT public.get_current_wallet_address())
));

-- 3. trivia_equipped_cosmetics: tighten to own wallet
DROP POLICY IF EXISTS "Users can insert own equipped cosmetics" ON public.trivia_equipped_cosmetics;
DROP POLICY IF EXISTS "Users can update own equipped cosmetics" ON public.trivia_equipped_cosmetics;
DROP POLICY IF EXISTS "Users can view own equipped cosmetics" ON public.trivia_equipped_cosmetics;

CREATE POLICY "Users can insert own equipped cosmetics"
ON public.trivia_equipped_cosmetics FOR INSERT
WITH CHECK (user_id = (SELECT public.get_current_wallet_address()));

CREATE POLICY "Users can update own equipped cosmetics"
ON public.trivia_equipped_cosmetics FOR UPDATE
USING (user_id = (SELECT public.get_current_wallet_address()));

CREATE POLICY "Users can view own equipped cosmetics"
ON public.trivia_equipped_cosmetics FOR SELECT
USING (user_id = (SELECT public.get_current_wallet_address()));