
-- 1. Create helper function to resolve current user's wallet address from their profile
CREATE OR REPLACE FUNCTION public.get_current_wallet_address()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT wallet_address FROM public.profiles WHERE id = auth.uid() LIMIT 1
$$;

-- 2. FIX ERROR: trivia_user_stats - replace weak length-only checks with wallet ownership verification
DROP POLICY IF EXISTS "Users can view own stats" ON public.trivia_user_stats;
DROP POLICY IF EXISTS "Users can insert own stats" ON public.trivia_user_stats;
DROP POLICY IF EXISTS "Users can update own stats" ON public.trivia_user_stats;

CREATE POLICY "Users can view own stats"
ON public.trivia_user_stats
FOR SELECT
USING (user_id = (SELECT public.get_current_wallet_address()));

CREATE POLICY "Users can insert own stats"
ON public.trivia_user_stats
FOR INSERT
WITH CHECK (user_id = (SELECT public.get_current_wallet_address()));

CREATE POLICY "Users can update own stats"
ON public.trivia_user_stats
FOR UPDATE
USING (user_id = (SELECT public.get_current_wallet_address()));

-- 3. FIX WARNING: daily_limits - replace weak length-only checks with wallet ownership verification
DROP POLICY IF EXISTS "Users can view own daily limits" ON public.daily_limits;
DROP POLICY IF EXISTS "Users can insert own daily limits" ON public.daily_limits;
DROP POLICY IF EXISTS "Users can update own daily limits" ON public.daily_limits;

CREATE POLICY "Users can view own daily limits"
ON public.daily_limits
FOR SELECT
USING (user_id = (SELECT public.get_current_wallet_address()));

CREATE POLICY "Users can insert own daily limits"
ON public.daily_limits
FOR INSERT
WITH CHECK (user_id = (SELECT public.get_current_wallet_address()));

CREATE POLICY "Users can update own daily limits"
ON public.daily_limits
FOR UPDATE
USING (user_id = (SELECT public.get_current_wallet_address()));

-- 4. FIX ERROR: tournament_payouts - recreate secure view with masked sensitive data
DROP VIEW IF EXISTS public.tournament_payouts_secure;
CREATE VIEW public.tournament_payouts_secure
WITH (security_invoker = true)
AS
SELECT
  id,
  tournament_id,
  user_id,
  placement,
  amount_usd,
  amount_usdc,
  created_at,
  paid_at,
  deadline,
  status,
  payout_method,
  CASE 
    WHEN user_id = (SELECT auth.uid()) THEN wallet_address
    ELSE LEFT(wallet_address, 6) || '...' || RIGHT(wallet_address, 4)
  END as wallet_address,
  CASE 
    WHEN user_id = (SELECT auth.uid()) THEN transaction_hash
    ELSE NULL
  END as transaction_hash,
  CASE 
    WHEN user_id = (SELECT auth.uid()) THEN attestation_hash
    ELSE NULL
  END as attestation_hash,
  CASE 
    WHEN user_id = (SELECT auth.uid()) THEN nonce
    ELSE NULL
  END as nonce
FROM public.tournament_payouts;
