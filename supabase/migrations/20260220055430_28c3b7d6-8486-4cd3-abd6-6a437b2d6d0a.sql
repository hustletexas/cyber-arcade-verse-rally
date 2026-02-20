
-- FIX 9: winner_chest_eligibility INSERT - uses length check instead of ownership
DROP POLICY IF EXISTS "System can insert eligibility" ON public.winner_chest_eligibility;

CREATE POLICY "System can insert eligibility"
ON public.winner_chest_eligibility
FOR INSERT
TO authenticated
WITH CHECK (
  wallet_address = public.get_current_wallet_address()
);
