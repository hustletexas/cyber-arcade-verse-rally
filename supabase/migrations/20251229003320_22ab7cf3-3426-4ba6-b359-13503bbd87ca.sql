-- Consolidate solana_tournaments SELECT policies into one

DROP POLICY IF EXISTS "Anyone can view solana tournaments" ON solana_tournaments;
DROP POLICY IF EXISTS "Authenticated users can view basic tournament info" ON solana_tournaments;
DROP POLICY IF EXISTS "Tournament admins can view all tournament details" ON solana_tournaments;

-- Single SELECT policy - tournaments are publicly viewable
CREATE POLICY "Anyone can view solana tournaments" ON solana_tournaments
FOR SELECT
USING (true);