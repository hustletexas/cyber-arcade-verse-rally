-- Consolidate solana_tournament_entries SELECT policies into one

DROP POLICY IF EXISTS "Admins can view all tournament entries" ON solana_tournament_entries;
DROP POLICY IF EXISTS "Users can view their own tournament entries" ON solana_tournament_entries;

-- Single consolidated SELECT policy
CREATE POLICY "Users can view own entries or admins view all" ON solana_tournament_entries
FOR SELECT
USING (
  (SELECT auth.uid()) = user_id
  OR is_admin()
);