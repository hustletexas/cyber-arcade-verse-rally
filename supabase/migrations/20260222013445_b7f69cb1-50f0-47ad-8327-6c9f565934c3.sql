
-- ============================================================
-- FIX 1: Harden profiles RLS policies
-- Remove dangerous anon-accessible wallet-based policies
-- ============================================================

-- Drop the dangerous policies that allow anon access
DROP POLICY IF EXISTS "Wallet insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Wallet update profile" ON public.profiles;

-- Recreate with proper auth checks
CREATE POLICY "Authenticated users can insert own profile" 
ON public.profiles FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Authenticated users can update own profile" 
ON public.profiles FOR UPDATE
TO authenticated
USING ((SELECT auth.uid()) = id);

-- ============================================================
-- FIX 2: Harden tournament_payouts RLS policies
-- Restrict to authenticated role only
-- ============================================================

DROP POLICY IF EXISTS "Users can view own payouts only" ON public.tournament_payouts;
DROP POLICY IF EXISTS "Admins can delete payouts" ON public.tournament_payouts;
DROP POLICY IF EXISTS "Admins can insert payouts" ON public.tournament_payouts;
DROP POLICY IF EXISTS "Admins can update payouts" ON public.tournament_payouts;
DROP POLICY IF EXISTS "Users can view their own payouts" ON public.tournament_payouts;
DROP POLICY IF EXISTS "Admins can manage payouts" ON public.tournament_payouts;

CREATE POLICY "Authenticated users view own payouts"
ON public.tournament_payouts FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_admin());

CREATE POLICY "Admins insert payouts"
ON public.tournament_payouts FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

CREATE POLICY "Admins update payouts"
ON public.tournament_payouts FOR UPDATE
TO authenticated
USING (public.is_admin());

CREATE POLICY "Admins delete payouts"
ON public.tournament_payouts FOR DELETE
TO authenticated
USING (public.is_admin());

-- ============================================================
-- FIX 3: Tighten submit_tournament_score rate limit
-- Reduce from 30/min to 10/hour + add session time check
-- ============================================================

CREATE OR REPLACE FUNCTION public.submit_tournament_score(tournament_id_param uuid, score_param integer, game_type_param text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  existing_participant RECORD;
  max_score INTEGER;
  tokens_awarded INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 10 score submissions per hour (tightened from 30/min)
  IF NOT public.check_rate_limit('submit_tournament_score', 10, 3600) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded. Please try again later.');
  END IF;

  -- Validate game_type to prevent injection
  IF game_type_param NOT IN ('tetris', 'pacman', 'galaga', 'cyber-match', 'trivia', 'cyber-sequence', 'portal-breaker') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid game type');
  END IF;

  max_score := CASE game_type_param
    WHEN 'tetris' THEN 100000
    WHEN 'pacman' THEN 50000
    WHEN 'galaga' THEN 150000
    WHEN 'cyber-match' THEN 50000
    WHEN 'trivia' THEN 10000
    WHEN 'cyber-sequence' THEN 50000
    WHEN 'portal-breaker' THEN 100000
    ELSE 50000
  END;

  IF score_param < 0 OR score_param > max_score THEN
    RETURN json_build_object('success', false, 'error', 'Invalid score for game type');
  END IF;

  SELECT * INTO existing_participant
  FROM public.tournament_participants
  WHERE tournament_id = tournament_id_param AND user_id = (SELECT auth.uid());

  IF FOUND THEN
    IF score_param <= COALESCE(existing_participant.placement, 0) THEN
      RETURN json_build_object('success', true, 'message', 'Score not higher than existing', 'awarded', 0);
    END IF;

    UPDATE public.tournament_participants
    SET placement = score_param
    WHERE tournament_id = tournament_id_param AND user_id = (SELECT auth.uid());
  ELSE
    INSERT INTO public.tournament_participants (
      tournament_id,
      user_id,
      placement
    ) VALUES (
      tournament_id_param,
      (SELECT auth.uid()),
      score_param
    );
  END IF;

  -- Cap token rewards at 50 per submission (reduced from 100)
  tokens_awarded := LEAST(score_param / 10, 50);

  IF tokens_awarded > 0 THEN
    UPDATE public.user_balances
    SET 
      cctr_balance = COALESCE(cctr_balance, 0) + tokens_awarded,
      updated_at = now()
    WHERE user_id = (SELECT auth.uid());

    INSERT INTO public.token_transactions (
      user_id,
      amount,
      transaction_type,
      description,
      tournament_id
    ) VALUES (
      (SELECT auth.uid()),
      tokens_awarded,
      'tournament_win',
      'High score in ' || game_type_param || ' tournament: ' || score_param,
      tournament_id_param
    );
  END IF;

  RETURN json_build_object(
    'success', true, 
    'score', score_param,
    'tokens_awarded', tokens_awarded
  );
END;
$function$;
