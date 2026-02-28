
-- Fix 1: Weekly leaderboard integer vs bigint type mismatch
CREATE OR REPLACE FUNCTION public.get_combined_weekly_leaderboard(p_week_start timestamp with time zone DEFAULT NULL::timestamp with time zone, p_week_end timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS TABLE(wallet_address text, match_best_score bigint, trivia_best_score bigint, sequence_best_score bigint, total_score bigint, rank bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_week_start TIMESTAMPTZ;
  v_week_end TIMESTAMPTZ;
BEGIN
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
    SELECT ms.user_id AS uid, MAX(ms.score)::bigint AS best
    FROM match_scores ms
    WHERE ms.created_at >= v_week_start AND ms.created_at < v_week_end
    GROUP BY ms.user_id
  ),
  trivia AS (
    SELECT tr.user_id AS uid, MAX(tr.score)::bigint AS best
    FROM trivia_runs tr
    WHERE tr.is_active = false
      AND tr.started_at >= v_week_start AND tr.started_at < v_week_end
    GROUP BY tr.user_id
  ),
  seq AS (
    SELECT ss.user_id AS uid, MAX(ss.score)::bigint AS best
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
      COALESCE(m.best, 0::bigint) AS match_best_score,
      COALESCE(t.best, 0::bigint) AS trivia_best_score,
      COALESCE(s.best, 0::bigint) AS sequence_best_score,
      (COALESCE(m.best, 0::bigint) + COALESCE(t.best, 0::bigint) + COALESCE(s.best, 0::bigint)) AS total_score
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
$function$;

-- Fix 2: Profiles email exposure - drop the overly permissive policy and replace
DROP POLICY IF EXISTS "Users can view own profile or admins" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (public.is_admin());
