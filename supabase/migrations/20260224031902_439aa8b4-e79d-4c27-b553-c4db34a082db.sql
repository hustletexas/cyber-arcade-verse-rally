
-- Create galaxy_scores table (matches portal_breaker_scores pattern)
CREATE TABLE public.galaxy_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  wave INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.galaxy_scores ENABLE ROW LEVEL SECURITY;

-- Anyone can read scores (for leaderboard)
CREATE POLICY "Anyone can view galaxy scores"
  ON public.galaxy_scores FOR SELECT USING (true);

-- Users can insert their own scores
CREATE POLICY "Users can insert own galaxy scores"
  ON public.galaxy_scores FOR INSERT WITH CHECK (true);

-- Index for leaderboard queries
CREATE INDEX idx_galaxy_scores_score ON public.galaxy_scores (score DESC);
CREATE INDEX idx_galaxy_scores_user ON public.galaxy_scores (user_id);
CREATE INDEX idx_galaxy_scores_created ON public.galaxy_scores (created_at DESC);

-- Update the combined weekly leaderboard function to include galaxy scores
CREATE OR REPLACE FUNCTION public.get_combined_weekly_leaderboard(
  p_week_start TIMESTAMPTZ DEFAULT NULL,
  p_week_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE(
  wallet_address TEXT,
  match_best_score BIGINT,
  trivia_best_score BIGINT,
  sequence_best_score BIGINT,
  total_score BIGINT,
  rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_week_start TIMESTAMPTZ;
  v_week_end TIMESTAMPTZ;
BEGIN
  -- Default to current week (Monday to Sunday)
  IF p_week_start IS NULL THEN
    v_week_start := date_trunc('week', now());
  ELSE
    v_week_start := p_week_start;
  END IF;

  IF p_week_end IS NULL THEN
    v_week_end := v_week_start + INTERVAL '7 days';
  ELSE
    v_week_end := p_week_end;
  END IF;

  RETURN QUERY
  WITH match AS (
    SELECT ms.user_id AS uid, MAX(ms.score) AS best
    FROM match_scores ms
    WHERE ms.created_at >= v_week_start AND ms.created_at < v_week_end
    GROUP BY ms.user_id
  ),
  trivia AS (
    SELECT tr.user_id AS uid, MAX(tr.score) AS best
    FROM trivia_runs tr
    WHERE tr.is_active = false
      AND tr.started_at >= v_week_start AND tr.started_at < v_week_end
    GROUP BY tr.user_id
  ),
  seq AS (
    SELECT ss.user_id AS uid, MAX(ss.score) AS best
    FROM sequence_scores ss
    WHERE ss.created_at >= v_week_start AND ss.created_at < v_week_end
    GROUP BY ss.user_id
  ),
  all_users AS (
    SELECT uid FROM match
    UNION SELECT uid FROM trivia
    UNION SELECT uid FROM seq
  ),
  combined AS (
    SELECT
      au.uid AS wallet_address,
      COALESCE(m.best, 0) AS match_best_score,
      COALESCE(t.best, 0) AS trivia_best_score,
      COALESCE(s.best, 0) AS sequence_best_score,
      (COALESCE(m.best, 0) + COALESCE(t.best, 0) + COALESCE(s.best, 0)) AS total_score
    FROM all_users au
    LEFT JOIN match m ON m.uid = au.uid
    LEFT JOIN trivia t ON t.uid = au.uid
    LEFT JOIN seq s ON s.uid = au.uid
  )
  SELECT
    c.wallet_address,
    c.match_best_score,
    c.trivia_best_score,
    c.sequence_best_score,
    c.total_score,
    ROW_NUMBER() OVER (ORDER BY c.total_score DESC) AS rank
  FROM combined c
  ORDER BY c.total_score DESC
  LIMIT 50;
END;
$$;
