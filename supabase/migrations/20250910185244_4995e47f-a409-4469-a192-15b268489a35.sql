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

-- Create a secure function to get public tournament leaderboards without exposing wallet addresses
CREATE OR REPLACE FUNCTION public.get_tournament_leaderboard(tournament_id_param uuid DEFAULT NULL)
RETURNS TABLE (
  tournament_id uuid,
  tournament_name text,
  placement integer,
  score integer,
  reward_amount numeric,
  player_identifier text,
  joined_at timestamp with time zone
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ste.tournament_id,
    st.name as tournament_name,
    ste.placement,
    ste.score,
    ste.reward_amount,
    -- Create anonymous player identifier instead of exposing wallet
    CONCAT('Player #', ROW_NUMBER() OVER (PARTITION BY ste.tournament_id ORDER BY ste.placement NULLS LAST))::text as player_identifier,
    ste.joined_at
  FROM solana_tournament_entries ste
  JOIN solana_tournaments st ON ste.tournament_id = st.id
  WHERE 
    ste.placement IS NOT NULL 
    AND st.status = 'completed'
    AND (tournament_id_param IS NULL OR ste.tournament_id = tournament_id_param)
  ORDER BY ste.tournament_id, ste.placement NULLS LAST;
$$;

-- Grant access to the function for public use
GRANT EXECUTE ON FUNCTION public.get_tournament_leaderboard(uuid) TO anon, authenticated;