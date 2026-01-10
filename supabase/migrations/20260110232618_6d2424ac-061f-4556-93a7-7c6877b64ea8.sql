-- Fix SECURITY DEFINER views by converting to SECURITY INVOKER
-- These views will rely on the underlying RLS policies for access control

-- Drop existing views
DROP VIEW IF EXISTS public.profiles_secure;
DROP VIEW IF EXISTS public.node_rewards_secure;
DROP VIEW IF EXISTS public.node_purchases_secure;
DROP VIEW IF EXISTS public.nft_purchases_secure;
DROP VIEW IF EXISTS public.nft_mints_secure;
DROP VIEW IF EXISTS public.solana_tournament_entries_secure;
DROP VIEW IF EXISTS public.token_purchases_secure;
DROP VIEW IF EXISTS public.user_prizes_secure;

-- Recreate views with SECURITY INVOKER (which is the default and relies on RLS)
-- The masking is applied at the view level but access is controlled by RLS

-- 1. Secure view for profiles (masks email for display)
CREATE VIEW public.profiles_secure 
WITH (security_invoker = true)
AS
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

-- 2. Secure view for node_rewards (masks wallet/tx data)
CREATE VIEW public.node_rewards_secure 
WITH (security_invoker = true)
AS
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
FROM public.node_rewards;

-- 3. Secure view for node_purchases (masks wallet/tx data)
CREATE VIEW public.node_purchases_secure 
WITH (security_invoker = true)
AS
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
FROM public.node_purchases;

-- 4. Secure view for nft_purchases (masks wallet/tx data)
CREATE VIEW public.nft_purchases_secure 
WITH (security_invoker = true)
AS
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
FROM public.nft_purchases;

-- 5. Secure view for nft_mints (masks wallet/tx data)
CREATE VIEW public.nft_mints_secure 
WITH (security_invoker = true)
AS
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
FROM public.nft_mints;

-- 6. Secure view for solana_tournament_entries (masks wallet/tx data)
CREATE VIEW public.solana_tournament_entries_secure 
WITH (security_invoker = true)
AS
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
FROM public.solana_tournament_entries;

-- 7. Secure view for token_purchases (masks Stripe/tx data)
CREATE VIEW public.token_purchases_secure 
WITH (security_invoker = true)
AS
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
FROM public.token_purchases;

-- 8. Secure view for user_prizes (masks shipping/wallet data)
CREATE VIEW public.user_prizes_secure 
WITH (security_invoker = true)
AS
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
FROM public.user_prizes;

-- Re-grant SELECT access to authenticated users on secure views
GRANT SELECT ON public.profiles_secure TO authenticated;
GRANT SELECT ON public.node_rewards_secure TO authenticated;
GRANT SELECT ON public.node_purchases_secure TO authenticated;
GRANT SELECT ON public.nft_purchases_secure TO authenticated;
GRANT SELECT ON public.nft_mints_secure TO authenticated;
GRANT SELECT ON public.solana_tournament_entries_secure TO authenticated;
GRANT SELECT ON public.token_purchases_secure TO authenticated;
GRANT SELECT ON public.user_prizes_secure TO authenticated;