
-- Create portal breaker scores table
CREATE TABLE public.portal_breaker_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portal_breaker_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can read leaderboard
CREATE POLICY "Portal breaker scores are publicly readable"
  ON public.portal_breaker_scores FOR SELECT
  USING (true);

-- Users can insert their own scores (wallet-based)
CREATE POLICY "Users can insert their own portal breaker scores"
  ON public.portal_breaker_scores FOR INSERT
  WITH CHECK (true);

-- Index for leaderboard queries
CREATE INDEX idx_portal_breaker_scores_score ON public.portal_breaker_scores (score DESC);
CREATE INDEX idx_portal_breaker_scores_user ON public.portal_breaker_scores (user_id);
