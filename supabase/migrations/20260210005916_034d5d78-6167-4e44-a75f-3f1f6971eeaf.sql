CREATE OR REPLACE FUNCTION public.deduct_game_entry_fee(p_wallet_address TEXT, p_game_type TEXT, p_amount INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Validate inputs
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet address');
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