-- Drop existing admin policy first
DROP POLICY IF EXISTS "Admins can manage payouts" ON public.tournament_payouts;

-- Recreate with proper separation of concerns
CREATE POLICY "Admins can insert payouts"
ON public.tournament_payouts
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update payouts"
ON public.tournament_payouts
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete payouts"
ON public.tournament_payouts
FOR DELETE
USING (public.is_admin());