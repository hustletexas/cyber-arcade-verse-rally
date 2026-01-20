-- Fix SQL injection vulnerability in get_own_wallet_address function
-- Add strict table name validation with whitelist

CREATE OR REPLACE FUNCTION public.get_own_wallet_address(table_name text, record_id uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result text;
  current_user_id uuid;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Return NULL if not authenticated
  IF current_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- SECURITY: Strict whitelist validation to prevent SQL injection
  IF table_name NOT IN (
    'node_rewards', 
    'node_purchases', 
    'nft_purchases', 
    'nft_mints', 
    'solana_tournament_entries', 
    'token_purchases', 
    'user_prizes',
    'profiles'
  ) THEN
    RAISE EXCEPTION 'Invalid table name: %', table_name;
  END IF;
  
  -- Execute query with validated table name
  EXECUTE format(
    'SELECT wallet_address FROM public.%I WHERE id = $1 AND user_id = $2',
    table_name
  )
  INTO result
  USING record_id, current_user_id;
  
  RETURN result;
END;
$$;