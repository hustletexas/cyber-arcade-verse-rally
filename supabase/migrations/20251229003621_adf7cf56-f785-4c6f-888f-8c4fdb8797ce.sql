-- Consolidate solana_tournaments INSERT policies into one

DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON solana_tournaments;
DROP POLICY IF EXISTS "Only admins can create solana tournaments" ON solana_tournaments;

-- Single INSERT policy - only admins can create tournaments
CREATE POLICY "Only admins can create solana tournaments" ON solana_tournaments
FOR INSERT
WITH CHECK (is_admin());