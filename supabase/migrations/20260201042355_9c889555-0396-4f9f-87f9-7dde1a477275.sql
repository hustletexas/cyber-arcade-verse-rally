-- =====================================================
-- SECURITY FIX: Server-side game entry fee deduction
-- =====================================================

-- Create a SECURITY DEFINER function to deduct game entry fees
CREATE OR REPLACE FUNCTION public.deduct_game_entry_fee(
  p_wallet_address TEXT,
  p_game_type TEXT,
  p_amount INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
  v_result JSONB;
BEGIN
  -- Validate inputs
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet address');
  END IF;
  
  IF p_amount <= 0 OR p_amount > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
  END IF;
  
  IF p_game_type NOT IN ('cyber-match', 'neon-match', 'trivia', 'ai-coach') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid game type');
  END IF;
  
  -- Check rate limit (10 deductions per hour per wallet)
  IF NOT check_rate_limit(p_wallet_address::uuid, 'deduct_game_entry_fee', 10, INTERVAL '1 hour') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Rate limit exceeded');
  END IF;
  
  -- Get current balance and validate
  SELECT cctr_balance INTO v_current_balance
  FROM user_balances
  WHERE wallet_address = p_wallet_address
  FOR UPDATE;
  
  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet not found');
  END IF;
  
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient balance', 'current_balance', v_current_balance);
  END IF;
  
  -- Deduct the balance atomically
  UPDATE user_balances
  SET cctr_balance = cctr_balance - p_amount,
      updated_at = now()
  WHERE wallet_address = p_wallet_address
    AND cctr_balance >= p_amount;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Failed to deduct balance');
  END IF;
  
  -- Log the transaction
  INSERT INTO token_transactions (user_id, amount, transaction_type, description)
  SELECT ub.user_id, -p_amount, 'game_entry', p_game_type || ' entry fee'
  FROM user_balances ub
  WHERE ub.wallet_address = p_wallet_address;
  
  RETURN jsonb_build_object(
    'success', true, 
    'new_balance', v_current_balance - p_amount,
    'deducted', p_amount
  );
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.deduct_game_entry_fee(TEXT, TEXT, INTEGER) TO authenticated, anon;

-- =====================================================
-- SECURITY FIX: Create secure view for tournament_payouts
-- =====================================================

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
  status,
  payout_method,
  created_at,
  paid_at,
  deadline,
  -- Mask wallet address for non-owners
  CASE 
    WHEN user_id = auth.uid() THEN wallet_address
    ELSE LEFT(wallet_address, 6) || '...' || RIGHT(wallet_address, 4)
  END AS wallet_address,
  -- Hide transaction details from non-owners
  CASE 
    WHEN user_id = auth.uid() THEN transaction_hash
    ELSE NULL
  END AS transaction_hash,
  CASE 
    WHEN user_id = auth.uid() THEN attestation_hash
    ELSE NULL
  END AS attestation_hash,
  CASE 
    WHEN user_id = auth.uid() THEN nonce
    ELSE NULL
  END AS nonce
FROM tournament_payouts;

-- =====================================================
-- SECURITY FIX: Create secure view for tournament_matches
-- =====================================================

DROP VIEW IF EXISTS public.tournament_matches_secure CASCADE;

CREATE VIEW public.tournament_matches_secure
WITH (security_invoker = true)
AS
SELECT
  id,
  tournament_id,
  round_number,
  match_number,
  player_a_id,
  player_b_id,
  player_a_score,
  player_b_score,
  winner_id,
  status,
  scheduled_time,
  started_at,
  completed_at,
  disputed,
  match_metadata,
  created_at,
  updated_at,
  bracket_position,
  match_code,
  dispute_reason,
  -- Mask wallet addresses - only show to participants, admins, or tournament owners
  CASE 
    WHEN player_a_id = auth.uid() OR player_b_id = auth.uid() OR is_admin() OR
         EXISTS (SELECT 1 FROM arcade_tournaments t WHERE t.id = tournament_matches.tournament_id AND t.admin_id = auth.uid())
    THEN player_a_wallet
    ELSE LEFT(COALESCE(player_a_wallet, ''), 6) || '...' || RIGHT(COALESCE(player_a_wallet, ''), 4)
  END AS player_a_wallet,
  CASE 
    WHEN player_a_id = auth.uid() OR player_b_id = auth.uid() OR is_admin() OR
         EXISTS (SELECT 1 FROM arcade_tournaments t WHERE t.id = tournament_matches.tournament_id AND t.admin_id = auth.uid())
    THEN player_b_wallet
    ELSE LEFT(COALESCE(player_b_wallet, ''), 6) || '...' || RIGHT(COALESCE(player_b_wallet, ''), 4)
  END AS player_b_wallet,
  CASE 
    WHEN player_a_id = auth.uid() OR player_b_id = auth.uid() OR is_admin() OR
         EXISTS (SELECT 1 FROM arcade_tournaments t WHERE t.id = tournament_matches.tournament_id AND t.admin_id = auth.uid())
    THEN winner_wallet
    ELSE LEFT(COALESCE(winner_wallet, ''), 6) || '...' || RIGHT(COALESCE(winner_wallet, ''), 4)
  END AS winner_wallet
FROM tournament_matches;

-- =====================================================
-- SECURITY FIX: Tighten profiles access
-- =====================================================

-- Drop any overly permissive policies on profiles
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON profiles;

-- Ensure only owner can view their profile (keep existing policy)
-- The existing "Users can view own profile only" policy is correct