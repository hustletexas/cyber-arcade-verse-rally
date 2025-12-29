-- Drop the inefficient policy
DROP POLICY IF EXISTS "Admin can update tournaments" ON public.solana_tournaments;

-- Recreate with optimized auth function call using subselect
CREATE POLICY "Admin can update tournaments" 
ON public.solana_tournaments 
FOR UPDATE
USING (
  (admin_wallet = (SELECT auth.jwt() ->> 'wallet_address'::text)) 
  OR ((SELECT auth.jwt() ->> 'role'::text) = 'admin'::text)
);