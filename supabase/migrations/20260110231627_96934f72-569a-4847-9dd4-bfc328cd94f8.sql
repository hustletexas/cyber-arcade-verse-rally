-- Fix permissive INSERT policy on solana_tournament_entries
-- The current policy uses WITH CHECK (true) which allows any authenticated user 
-- to create entries for other users

-- Drop the existing permissive policy
DROP POLICY IF EXISTS "Users can insert entries" ON public.solana_tournament_entries;

-- Create a more restrictive policy that ensures users can only insert entries for themselves
-- Allows user_id to match auth.uid() OR be NULL (for wallet-only entries)
CREATE POLICY "Users can insert own entries" 
  ON public.solana_tournament_entries 
  FOR INSERT 
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);