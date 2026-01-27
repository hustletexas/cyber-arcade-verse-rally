-- First drop the foreign key constraints
ALTER TABLE public.match_scores DROP CONSTRAINT IF EXISTS match_scores_user_id_fkey;
ALTER TABLE public.daily_limits DROP CONSTRAINT IF EXISTS daily_limits_user_id_fkey;

-- Drop existing restrictive RLS policies on match_scores and daily_limits
DROP POLICY IF EXISTS "Users can insert their own scores" ON public.match_scores;
DROP POLICY IF EXISTS "Authenticated users can view all scores" ON public.match_scores;
DROP POLICY IF EXISTS "Users can view their own daily limits" ON public.daily_limits;
DROP POLICY IF EXISTS "Users can insert their own daily limits" ON public.daily_limits;
DROP POLICY IF EXISTS "Users can update their own daily limits" ON public.daily_limits;

-- Update match_scores to use text user_id (wallet address) instead of uuid
ALTER TABLE public.match_scores 
  ALTER COLUMN user_id TYPE text USING user_id::text;

-- Update daily_limits to use text user_id (wallet address) instead of uuid  
ALTER TABLE public.daily_limits
  ALTER COLUMN user_id TYPE text USING user_id::text;

-- Create new permissive policies for match_scores (public game, anyone can play with wallet)
CREATE POLICY "Anyone can view all scores"
  ON public.match_scores FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert scores"
  ON public.match_scores FOR INSERT
  WITH CHECK (true);

-- Create new permissive policies for daily_limits
CREATE POLICY "Anyone can view daily limits"
  ON public.daily_limits FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert daily limits"
  ON public.daily_limits FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update daily limits"
  ON public.daily_limits FOR UPDATE
  USING (true);