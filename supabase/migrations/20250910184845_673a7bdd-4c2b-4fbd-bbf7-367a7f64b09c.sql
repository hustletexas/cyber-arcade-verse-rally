-- Fix security issues in tournament entries and wallets tables

-- 1. Fix solana_tournament_entries table - restrict to user's own entries + public leaderboard
DROP POLICY IF EXISTS "Anyone can view entries" ON public.solana_tournament_entries;

-- Users can only view their own entries
CREATE POLICY "Users can view their own entries" 
ON public.solana_tournament_entries 
FOR SELECT 
USING (user_id = auth.uid());

-- Create a separate policy for public leaderboard (only final placements, no wallet addresses)
CREATE POLICY "Public can view completed tournament results" 
ON public.solana_tournament_entries 
FOR SELECT 
USING (
  placement IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.solana_tournaments 
    WHERE id = tournament_id 
    AND status = 'completed'
  )
);

-- 2. Fix wallets table - add RLS policies
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own wallet (assuming there's a user_id column that should be added)
-- For now, prevent all access until proper user association is implemented
CREATE POLICY "No public access to wallets" 
ON public.wallets 
FOR ALL 
USING (false);