-- Fix remaining security errors

-- 1. profiles_public view: revoke anon access (only authenticated should use it)
REVOKE SELECT ON public.profiles_public FROM anon;

-- 2. tournament_matches: change role from public to authenticated
DROP POLICY IF EXISTS "Participants and admins can view matches" ON public.tournament_matches;
CREATE POLICY "Participants and admins can view matches"
  ON public.tournament_matches FOR SELECT
  TO authenticated
  USING (
    (player_a_id = (SELECT auth.uid())) OR 
    (player_b_id = (SELECT auth.uid())) OR 
    (EXISTS (SELECT 1 FROM arcade_tournaments t WHERE t.id = tournament_matches.tournament_id AND (t.admin_id = (SELECT auth.uid()) OR is_admin()))) OR 
    (EXISTS (SELECT 1 FROM tournament_registrations tr WHERE tr.tournament_id = tournament_matches.tournament_id AND tr.user_id = (SELECT auth.uid())))
  );

-- 3. tournament_registrations: change role from public to authenticated
DROP POLICY IF EXISTS "Users can view registrations for published tournaments" ON public.tournament_registrations;
CREATE POLICY "Users can view registrations for published tournaments"
  ON public.tournament_registrations FOR SELECT
  TO authenticated
  USING (
    (user_id = (SELECT auth.uid())) OR 
    (EXISTS (SELECT 1 FROM arcade_tournaments t WHERE t.id = tournament_registrations.tournament_id AND (t.admin_id = (SELECT auth.uid()) OR is_admin())))
  );

-- 4. tournament_standings: change role from public to authenticated
DROP POLICY IF EXISTS "Participants and admins can view standings" ON public.tournament_standings;
CREATE POLICY "Participants and admins can view standings"
  ON public.tournament_standings FOR SELECT
  TO authenticated
  USING (
    (user_id = (SELECT auth.uid())) OR 
    (EXISTS (SELECT 1 FROM arcade_tournaments t WHERE t.id = tournament_standings.tournament_id AND t.admin_id = (SELECT auth.uid()))) OR 
    is_admin()
  );

-- 5. user_balances: remove wallet_address matching, use only user_id
DROP POLICY IF EXISTS "Users can view own balance only" ON public.user_balances;
CREATE POLICY "Users can view own balance only"
  ON public.user_balances FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));