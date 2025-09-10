-- Create a secure public view for tournament leaderboards that excludes sensitive data
CREATE OR REPLACE VIEW public.tournament_leaderboard AS
SELECT 
  ste.id,
  ste.tournament_id,
  ste.placement,
  ste.score,
  ste.reward_amount,
  ste.joined_at,
  -- Use a masked/anonymous identifier instead of wallet address
  CONCAT('Player #', ROW_NUMBER() OVER (PARTITION BY ste.tournament_id ORDER BY ste.placement NULLS LAST)) as player_identifier,
  st.name as tournament_name,
  st.status as tournament_status
FROM public.solana_tournament_entries ste
JOIN public.solana_tournaments st ON ste.tournament_id = st.id
WHERE 
  ste.placement IS NOT NULL 
  AND st.status = 'completed';

-- Enable RLS on the view
ALTER VIEW public.tournament_leaderboard SET (security_invoker = true);

-- Remove the problematic public policy that exposes wallet addresses
DROP POLICY IF EXISTS "Public can view completed tournament results" ON public.solana_tournament_entries;

-- Create a more restrictive policy - only allow viewing own entries or admin access
CREATE POLICY "Users can view own tournament entries" 
ON public.solana_tournament_entries 
FOR SELECT 
USING (
  user_id = auth.uid() 
  OR 
  (auth.jwt() ->> 'role'::text) = 'admin'::text
);

-- Allow public access to the safe leaderboard view
GRANT SELECT ON public.tournament_leaderboard TO anon, authenticated;

-- Create RLS policy for the leaderboard view
CREATE POLICY "Public can view tournament leaderboards" 
ON public.tournament_leaderboard 
FOR SELECT 
USING (true);