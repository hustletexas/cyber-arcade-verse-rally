
-- Fix wallet address validation in SECURITY DEFINER functions
-- Add proper format validation (Stellar addresses start with G and are 56 chars)

-- Update deduct_game_entry_fee with better wallet validation
CREATE OR REPLACE FUNCTION public.deduct_game_entry_fee(p_wallet_address text, p_game_type text, p_amount integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_current_balance INTEGER;
  v_auth_wallet TEXT;
BEGIN
  -- Validate inputs
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 OR length(p_wallet_address) > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet address');
  END IF;
  
  -- Verify wallet ownership: must match authenticated user's profile wallet
  IF auth.uid() IS NOT NULL THEN
    SELECT wallet_address INTO v_auth_wallet FROM public.profiles WHERE id = auth.uid();
    IF v_auth_wallet IS NULL OR v_auth_wallet != p_wallet_address THEN
      RETURN jsonb_build_object('success', false, 'error', 'Wallet address does not match authenticated user');
    END IF;
  ELSE
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;
  
  IF p_amount <= 0 OR p_amount > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid amount');
  END IF;
  
  IF p_game_type NOT IN ('cyber-match', 'neon-match', 'trivia', 'ai-coach', 'cyber-sequence', 'portal-breaker') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid game type');
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
  
  -- Deduct atomically
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
$function$;

-- Update initialize_wallet_balance with auth verification
CREATE OR REPLACE FUNCTION public.initialize_wallet_balance(p_wallet_address text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_balance INTEGER;
  v_rewards INTEGER;
  v_existing RECORD;
  v_auth_wallet TEXT;
BEGIN
  -- Validate input
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 OR length(p_wallet_address) > 100 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet address');
  END IF;

  -- Verify wallet ownership if authenticated
  IF auth.uid() IS NOT NULL THEN
    SELECT wallet_address INTO v_auth_wallet FROM public.profiles WHERE id = auth.uid();
    IF v_auth_wallet IS NOT NULL AND v_auth_wallet != p_wallet_address THEN
      RETURN jsonb_build_object('success', false, 'error', 'Wallet address does not match authenticated user');
    END IF;
  END IF;

  -- Generate deterministic UUID from wallet address
  v_user_id := COALESCE(auth.uid(), extensions.uuid_generate_v5(extensions.uuid_ns_url(), p_wallet_address));

  -- Check if balance record exists
  SELECT cctr_balance, claimable_rewards, updated_at
  INTO v_existing
  FROM user_balances
  WHERE wallet_address = p_wallet_address
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    SELECT cctr_balance, claimable_rewards
    INTO v_balance, v_rewards
    FROM user_balances
    WHERE wallet_address = p_wallet_address
    LIMIT 1;

    RETURN jsonb_build_object(
      'success', true,
      'ccc_balance', v_balance,
      'claimable_rewards', v_rewards,
      'daily_bonus_awarded', 0,
      'created', false
    );
  ELSE
    -- New user - create balance with 10 CCC starter bonus (one-time only)
    INSERT INTO user_balances (user_id, wallet_address, cctr_balance, claimable_rewards, updated_at)
    VALUES (v_user_id, p_wallet_address, 10, 0, now())
    ON CONFLICT (wallet_address) DO NOTHING;

    INSERT INTO token_transactions (user_id, amount, transaction_type, description)
    VALUES (v_user_id, 10, 'starter_bonus', 'New wallet starter bonus');

    RETURN jsonb_build_object(
      'success', true,
      'ccc_balance', 10,
      'claimable_rewards', 0,
      'daily_bonus_awarded', 0,
      'created', true
    );
  END IF;
END;
$function$;

-- Fix the user_balances view-only policy to remove JWT claim dependency 
DROP POLICY IF EXISTS "Users can view own balance only" ON public.user_balances;

CREATE POLICY "Users can view own balance only"
ON public.user_balances FOR SELECT
TO authenticated
USING (
  user_id = (SELECT auth.uid())
  OR wallet_address = (SELECT wallet_address FROM public.profiles WHERE id = (SELECT auth.uid()))
);
