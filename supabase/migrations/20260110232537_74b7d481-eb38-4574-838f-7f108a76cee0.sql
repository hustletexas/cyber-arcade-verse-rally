-- Security Enhancement: Add wallet address masking and secure data access functions
-- This migration adds field-level masking for sensitive wallet/financial data

-- 1. Create a helper function to mask wallet addresses (shows first 4 and last 4 chars)
CREATE OR REPLACE FUNCTION public.mask_wallet_address(wallet_addr text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF wallet_addr IS NULL OR LENGTH(wallet_addr) < 12 THEN
    RETURN wallet_addr;
  END IF;
  RETURN LEFT(wallet_addr, 4) || '...' || RIGHT(wallet_addr, 4);
END;
$$;

-- 2. Create a helper function to mask transaction hashes (shows first 8 and last 4 chars)
CREATE OR REPLACE FUNCTION public.mask_transaction_hash(tx_hash text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF tx_hash IS NULL OR LENGTH(tx_hash) < 16 THEN
    RETURN tx_hash;
  END IF;
  RETURN LEFT(tx_hash, 8) || '...' || RIGHT(tx_hash, 4);
END;
$$;

-- 3. Create a helper function to mask Stripe session IDs
CREATE OR REPLACE FUNCTION public.mask_stripe_session(session_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF session_id IS NULL OR LENGTH(session_id) < 12 THEN
    RETURN session_id;
  END IF;
  RETURN LEFT(session_id, 8) || '...[masked]';
END;
$$;

-- 4. Create a helper function to mask shipping addresses (show only city/state)
CREATE OR REPLACE FUNCTION public.mask_shipping_address(addr text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF addr IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN '[Address on file - contact support for details]';
END;
$$;

-- 5. Create secure view for profiles (masks email for non-owners)
CREATE OR REPLACE VIEW public.profiles_secure AS
SELECT 
  id,
  CASE 
    WHEN id = auth.uid() THEN email 
    ELSE LEFT(email, 2) || '***@' || SPLIT_PART(email, '@', 2)
  END as email,
  username,
  avatar_url,
  CASE 
    WHEN id = auth.uid() THEN wallet_address 
    ELSE public.mask_wallet_address(wallet_address)
  END as wallet_address,
  created_at,
  updated_at
FROM public.profiles;

-- 6. Create secure view for node_rewards (masks wallet/tx data)
CREATE OR REPLACE VIEW public.node_rewards_secure AS
SELECT 
  id,
  user_id,
  reward_amount,
  reward_date,
  claimed_at,
  created_at,
  updated_at,
  public.mask_wallet_address(wallet_address) as wallet_address,
  public.mask_transaction_hash(transaction_hash) as transaction_hash
FROM public.node_rewards
WHERE user_id = auth.uid();

-- 7. Create secure view for node_purchases (masks wallet/tx data)
CREATE OR REPLACE VIEW public.node_purchases_secure AS
SELECT 
  id,
  user_id,
  node_type,
  quantity,
  price_sol,
  created_at,
  updated_at,
  public.mask_wallet_address(wallet_address) as wallet_address,
  public.mask_transaction_hash(transaction_hash) as transaction_hash,
  public.mask_wallet_address(mint_address) as mint_address
FROM public.node_purchases
WHERE user_id = auth.uid();

-- 8. Create secure view for nft_purchases (masks wallet/tx data)
CREATE OR REPLACE VIEW public.nft_purchases_secure AS
SELECT 
  id,
  user_id,
  nft_id,
  nft_name,
  price,
  currency,
  status,
  created_at,
  updated_at,
  public.mask_wallet_address(wallet_address) as wallet_address,
  public.mask_transaction_hash(transaction_hash) as transaction_hash
FROM public.nft_purchases
WHERE user_id = auth.uid();

-- 9. Create secure view for nft_mints (masks wallet/tx data)
CREATE OR REPLACE VIEW public.nft_mints_secure AS
SELECT 
  id,
  user_id,
  nft_name,
  status,
  metadata,
  created_at,
  updated_at,
  public.mask_wallet_address(wallet_address) as wallet_address,
  public.mask_wallet_address(mint_address) as mint_address,
  public.mask_transaction_hash(transaction_hash) as transaction_hash
FROM public.nft_mints
WHERE user_id = auth.uid();

-- 10. Create secure view for solana_tournament_entries (masks wallet/tx data)
CREATE OR REPLACE VIEW public.solana_tournament_entries_secure AS
SELECT 
  id,
  tournament_id,
  user_id,
  score,
  placement,
  reward_amount,
  reward_claimed,
  joined_at,
  created_at,
  updated_at,
  public.mask_wallet_address(wallet_address) as wallet_address,
  public.mask_transaction_hash(entry_transaction_hash) as entry_transaction_hash,
  public.mask_transaction_hash(reward_transaction_hash) as reward_transaction_hash
FROM public.solana_tournament_entries
WHERE user_id = auth.uid() OR user_id IS NULL;

-- 11. Create secure view for token_purchases (masks Stripe/tx data)
CREATE OR REPLACE VIEW public.token_purchases_secure AS
SELECT 
  id,
  user_id,
  amount,
  payment_amount,
  payment_currency,
  payment_method,
  status,
  created_at,
  updated_at,
  public.mask_stripe_session(stripe_session_id) as stripe_session_id,
  public.mask_transaction_hash(crypto_transaction_hash) as crypto_transaction_hash
FROM public.token_purchases
WHERE user_id = auth.uid();

-- 12. Create secure view for user_prizes (masks shipping/wallet data)
CREATE OR REPLACE VIEW public.user_prizes_secure AS
SELECT 
  id,
  user_id,
  prize_id,
  source_type,
  source_id,
  won_at,
  redeemed_at,
  redemption_status,
  created_at,
  updated_at,
  public.mask_wallet_address(wallet_address) as wallet_address,
  public.mask_shipping_address(shipping_address) as shipping_address,
  public.mask_transaction_hash(redemption_transaction_hash) as redemption_transaction_hash
FROM public.user_prizes
WHERE user_id = auth.uid();

-- 13. Grant SELECT access to authenticated users on secure views
GRANT SELECT ON public.profiles_secure TO authenticated;
GRANT SELECT ON public.node_rewards_secure TO authenticated;
GRANT SELECT ON public.node_purchases_secure TO authenticated;
GRANT SELECT ON public.nft_purchases_secure TO authenticated;
GRANT SELECT ON public.nft_mints_secure TO authenticated;
GRANT SELECT ON public.solana_tournament_entries_secure TO authenticated;
GRANT SELECT ON public.token_purchases_secure TO authenticated;
GRANT SELECT ON public.user_prizes_secure TO authenticated;

-- 14. Create a secure function to get full wallet address ONLY for verified owner
CREATE OR REPLACE FUNCTION public.get_own_wallet_address(table_name text, record_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result text;
  owner_id uuid;
BEGIN
  -- Verify the caller owns this record before returning unmasked data
  EXECUTE format('SELECT user_id, wallet_address FROM public.%I WHERE id = $1', table_name)
  INTO owner_id, result
  USING record_id;
  
  IF owner_id = auth.uid() THEN
    RETURN result;
  ELSE
    RETURN NULL;
  END IF;
END;
$$;

-- 15. Add comment documentation for security measures
COMMENT ON FUNCTION public.mask_wallet_address IS 'Masks wallet addresses to prevent correlation attacks. Shows only first 4 and last 4 characters.';
COMMENT ON FUNCTION public.mask_transaction_hash IS 'Masks transaction hashes to prevent blockchain correlation. Shows first 8 and last 4 characters.';
COMMENT ON VIEW public.profiles_secure IS 'Secure view of profiles with masked email and wallet addresses for non-owners.';
COMMENT ON VIEW public.node_rewards_secure IS 'Secure view of node rewards with masked sensitive data.';
COMMENT ON VIEW public.user_prizes_secure IS 'Secure view of user prizes with masked shipping addresses and wallet data.';