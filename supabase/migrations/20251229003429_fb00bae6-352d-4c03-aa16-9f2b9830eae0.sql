-- Consolidate solana_tournaments UPDATE policies into one

DROP POLICY IF EXISTS "Admin can update tournaments" ON solana_tournaments;
DROP POLICY IF EXISTS "Only admins can update solana tournaments" ON solana_tournaments;

-- Single UPDATE policy using is_admin()
CREATE POLICY "Only admins can update solana tournaments" ON solana_tournaments
FOR UPDATE
USING (is_admin());