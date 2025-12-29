-- Fix RLS policy on solana_tournaments table to use subselect for auth.jwt()

DROP POLICY IF EXISTS "Admin can update tournaments" ON solana_tournaments;

CREATE POLICY "Admin can update tournaments" ON solana_tournaments
FOR UPDATE
USING (
  (admin_wallet = ((SELECT auth.jwt()) ->> 'wallet_address'::text))
  OR (((SELECT auth.jwt()) ->> 'role'::text) = 'admin'::text)
);