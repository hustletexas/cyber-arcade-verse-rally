-- Fix JWT role checks in RLS policies by replacing with secure is_admin() function
-- This prevents privilege escalation via manipulated JWT claims

-- Drop and recreate affected policies on solana_tournament_entries
DROP POLICY IF EXISTS "Users can view own entries or admins view all" ON public.solana_tournament_entries;
DROP POLICY IF EXISTS "Admin can view all entries" ON public.solana_tournament_entries;
DROP POLICY IF EXISTS "Users can update own entries or admins update all" ON public.solana_tournament_entries;

-- Create secure policies for solana_tournament_entries
CREATE POLICY "Users can view own entries or admins view all"
ON public.solana_tournament_entries
FOR SELECT
USING (
  user_id = (SELECT auth.uid())
  OR public.is_admin()
);

CREATE POLICY "Users can update own entries or admins update all"
ON public.solana_tournament_entries
FOR UPDATE
USING (
  user_id = (SELECT auth.uid())
  OR public.is_admin()
);

-- Drop and recreate affected policies on solana_tournaments
DROP POLICY IF EXISTS "Admins can update tournaments" ON public.solana_tournaments;
DROP POLICY IF EXISTS "Admin can update tournaments" ON public.solana_tournaments;
DROP POLICY IF EXISTS "Tournament admins can update their tournaments" ON public.solana_tournaments;

-- Create secure policy for solana_tournaments UPDATE
CREATE POLICY "Admins can update tournaments"
ON public.solana_tournaments
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Drop and recreate any legacy tournament policies with JWT role checks
DROP POLICY IF EXISTS "Admins can view all tournament participants" ON public.tournament_participants;
DROP POLICY IF EXISTS "Admins can manage tournament participants" ON public.tournament_participants;

-- Create secure policies for tournament_participants if table exists
CREATE POLICY "Admins can view all tournament participants"
ON public.tournament_participants
FOR SELECT
USING (
  user_id = (SELECT auth.uid())
  OR public.is_admin()
);

CREATE POLICY "Admins can manage tournament participants"
ON public.tournament_participants
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());