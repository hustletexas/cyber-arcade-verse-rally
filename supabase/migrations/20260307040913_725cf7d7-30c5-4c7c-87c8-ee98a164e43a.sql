-- Fix remaining security errors

-- 1. profiles_public view: already masks email, but ensure no anon access and restrict wallet
DROP VIEW IF EXISTS public.profiles_public;
CREATE VIEW public.profiles_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  username,
  avatar_url,
  mask_wallet_address(wallet_address) AS wallet_address,
  CASE WHEN id = auth.uid() THEN email ELSE NULL END AS email,
  created_at,
  updated_at
FROM public.profiles;
GRANT SELECT ON public.profiles_public TO authenticated;

-- 2. tournament_standings_public: already masks wallets, restrict to authenticated
REVOKE ALL ON public.tournament_standings_public FROM anon;
GRANT SELECT ON public.tournament_standings_public TO authenticated;

-- 3. tournament_bracket_public: already masks wallets, restrict to authenticated
REVOKE ALL ON public.tournament_bracket_public FROM anon;
GRANT SELECT ON public.tournament_bracket_public TO authenticated;

-- 4. tournament_registrations INSERT: restrict to authenticated
DROP POLICY IF EXISTS "Users can register for tournaments" ON public.tournament_registrations;
CREATE POLICY "Users can register for tournaments"
  ON public.tournament_registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

-- 5. tournament_payouts: ensure role is authenticated only
DROP POLICY IF EXISTS "Authenticated users view own payouts" ON public.tournament_payouts;
CREATE POLICY "Authenticated users view own payouts"
  ON public.tournament_payouts FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()) OR is_admin());