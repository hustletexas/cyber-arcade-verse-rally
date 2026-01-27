-- Create match_scores table for leaderboard
CREATE TABLE public.match_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  time_seconds INTEGER NOT NULL,
  moves INTEGER NOT NULL,
  mismatches INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_limits table for play tracking
CREATE TABLE public.daily_limits (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  plays_today INTEGER NOT NULL DEFAULT 0,
  last_play_date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Enable Row Level Security
ALTER TABLE public.match_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_limits ENABLE ROW LEVEL SECURITY;

-- RLS Policies for match_scores
-- Allow authenticated users to insert their own scores
CREATE POLICY "Users can insert their own scores"
ON public.match_scores
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Allow all authenticated users to view scores (for leaderboard)
CREATE POLICY "Authenticated users can view all scores"
ON public.match_scores
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for daily_limits
-- Users can only view their own daily limits
CREATE POLICY "Users can view their own daily limits"
ON public.daily_limits
FOR SELECT
TO authenticated
USING ((SELECT auth.uid()) = user_id);

-- Users can insert their own daily limits record
CREATE POLICY "Users can insert their own daily limits"
ON public.daily_limits
FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own daily limits
CREATE POLICY "Users can update their own daily limits"
ON public.daily_limits
FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = user_id)
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_match_scores_user_id ON public.match_scores(user_id);
CREATE INDEX idx_match_scores_score ON public.match_scores(score DESC);
CREATE INDEX idx_match_scores_created_at ON public.match_scores(created_at DESC);