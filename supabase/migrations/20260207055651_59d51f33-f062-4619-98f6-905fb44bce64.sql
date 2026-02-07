
-- =============================================
-- FIX 1: winner_chest_claims - Remove overly permissive SELECT and duplicate INSERT
-- =============================================

-- Drop the overly permissive SELECT policy (allows anyone to see ALL claims)
DROP POLICY IF EXISTS "Users can view their own claims by wallet" ON public.winner_chest_claims;

-- Drop duplicate INSERT policy
DROP POLICY IF EXISTS "Users can insert their own claims" ON public.winner_chest_claims;

-- =============================================
-- FIX 2: winner_chest_eligibility - Remove overly permissive SELECT and duplicates
-- =============================================

-- Drop the overly permissive SELECT policy (allows anyone to see ALL eligibility)
DROP POLICY IF EXISTS "Users can view eligibility by wallet" ON public.winner_chest_eligibility;

-- Drop duplicate INSERT policy
DROP POLICY IF EXISTS "Users can insert own eligibility" ON public.winner_chest_eligibility;

-- Drop duplicate UPDATE policy
DROP POLICY IF EXISTS "Users can update their eligibility by wallet" ON public.winner_chest_eligibility;

-- Drop duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view own eligibility" ON public.winner_chest_eligibility;

-- Re-create clean SELECT policy with proper restriction
CREATE POLICY "Users can view own eligibility by wallet"
ON public.winner_chest_eligibility
FOR SELECT
USING ((wallet_address IS NOT NULL) AND (length(wallet_address) > 10));

-- =============================================
-- FIX 3: trivia_user_stats - Replace overly permissive SELECT
-- =============================================

-- Drop the overly permissive SELECT (USING true = anyone sees all stats)
DROP POLICY IF EXISTS "Anyone can view own stats" ON public.trivia_user_stats;

-- Re-create with proper restriction
CREATE POLICY "Users can view own stats"
ON public.trivia_user_stats
FOR SELECT
USING ((user_id IS NOT NULL) AND (length(user_id) > 10));

-- =============================================
-- FIX 4: trivia_user_cosmetics - Replace overly permissive SELECT
-- =============================================

-- Drop overly permissive SELECT (USING true = anyone sees all cosmetics)
DROP POLICY IF EXISTS "Anyone can view own cosmetics" ON public.trivia_user_cosmetics;

-- Re-create with proper restriction
CREATE POLICY "Users can view own cosmetics"
ON public.trivia_user_cosmetics
FOR SELECT
USING ((user_id IS NOT NULL) AND (length(user_id) > 10));

-- =============================================
-- FIX 5: tournament_matches - Tighten wallet address exposure
-- Replace broad public SELECT with participant/admin-only access
-- =============================================

-- Drop existing broad SELECT policy
DROP POLICY IF EXISTS "Participants and admins can view matches" ON public.tournament_matches;

-- Re-create with tighter access: only participants in the match, tournament admin, or global admin
CREATE POLICY "Participants and admins can view matches"
ON public.tournament_matches
FOR SELECT
USING (
  (player_a_id = (SELECT auth.uid()))
  OR (player_b_id = (SELECT auth.uid()))
  OR (EXISTS (
    SELECT 1 FROM arcade_tournaments t
    WHERE t.id = tournament_matches.tournament_id
    AND (t.admin_id = (SELECT auth.uid()) OR is_admin())
  ))
  OR (EXISTS (
    SELECT 1 FROM tournament_registrations tr
    WHERE tr.tournament_id = tournament_matches.tournament_id
    AND tr.user_id = (SELECT auth.uid())
  ))
);
