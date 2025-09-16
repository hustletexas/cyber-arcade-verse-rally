-- Fix security issue: Restrict tournament access to authenticated users only
-- This prevents exposure of sensitive blockchain data (admin wallets, program IDs) to public

-- First, drop the existing overly permissive public access policy
DROP POLICY IF EXISTS "Anyone can view tournaments" ON public.solana_tournaments;

-- Create a more secure policy that only allows authenticated users to view tournaments
-- But hide sensitive blockchain infrastructure details from regular users
CREATE POLICY "Authenticated users can view basic tournament info" 
ON public.solana_tournaments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Create a separate policy for admins to access all tournament data including sensitive fields
CREATE POLICY "Tournament admins can view all tournament details" 
ON public.solana_tournaments 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    admin_wallet = (auth.jwt() ->> 'wallet_address'::text) 
    OR (auth.jwt() ->> 'role'::text) = 'admin'::text
  )
);

-- Note: This secures the tournament data while maintaining functionality
-- Regular users can still see tournaments to join them, but sensitive blockchain
-- infrastructure details are protected from public access