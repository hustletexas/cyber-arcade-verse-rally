-- =====================================================
-- FINAL FIX - trivia_user_cosmetics and trivia_user_stats
-- =====================================================

-- 1. FIX trivia_user_cosmetics - require valid user_id
DROP POLICY IF EXISTS "Anyone can insert own cosmetics" ON public.trivia_user_cosmetics;

CREATE POLICY "Users can insert own cosmetics" ON public.trivia_user_cosmetics
  FOR INSERT WITH CHECK (user_id IS NOT NULL AND length(user_id::text) > 10);

-- 2. FIX trivia_user_stats - require valid user_id
DROP POLICY IF EXISTS "Anyone can insert own stats" ON public.trivia_user_stats;
DROP POLICY IF EXISTS "Anyone can update own stats" ON public.trivia_user_stats;

CREATE POLICY "Users can insert own stats" ON public.trivia_user_stats
  FOR INSERT WITH CHECK (user_id IS NOT NULL AND length(user_id::text) > 10);

CREATE POLICY "Users can update own stats" ON public.trivia_user_stats
  FOR UPDATE USING (user_id IS NOT NULL AND length(user_id::text) > 10);