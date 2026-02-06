-- Fix the initialize_wallet_balance function - uuid_ns_dns() doesn't exist
-- Use a fixed namespace UUID instead, and set starter bonus to 10 CCC as requested

DROP FUNCTION IF EXISTS public.initialize_wallet_balance(text);

CREATE OR REPLACE FUNCTION public.initialize_wallet_balance(p_wallet_address text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_result RECORD;
  v_last_login DATE;
  v_today DATE := CURRENT_DATE;
  v_daily_bonus INTEGER := 10;
  v_starter_bonus INTEGER := 10;  -- Changed from 100 to 10 CCC
  v_bonus_awarded INTEGER := 0;
  -- Fixed namespace UUID for wallet address hashing (DNS namespace from RFC 4122)
  v_namespace UUID := '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
BEGIN
  -- Validate wallet address
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet address');
  END IF;
  
  -- Check if wallet already has a balance record
  SELECT user_id, cctr_balance, claimable_rewards INTO v_result
  FROM user_balances
  WHERE wallet_address = p_wallet_address;
  
  IF FOUND THEN
    -- Existing user - check for daily login bonus
    SELECT last_login_date INTO v_last_login
    FROM trivia_user_stats
    WHERE user_id = v_result.user_id::text;
    
    -- Award daily 10 CCC if they haven't logged in today
    IF v_last_login IS NULL OR v_last_login < v_today THEN
      -- Update balance with daily bonus
      UPDATE user_balances
      SET cctr_balance = COALESCE(cctr_balance, 0) + v_daily_bonus,
          updated_at = now()
      WHERE wallet_address = p_wallet_address
      RETURNING cctr_balance INTO v_result.cctr_balance;
      
      -- Update last login date
      INSERT INTO trivia_user_stats (user_id, last_login_date, updated_at)
      VALUES (v_result.user_id::text, v_today, now())
      ON CONFLICT (user_id) DO UPDATE
        SET last_login_date = v_today, updated_at = now();
      
      -- Log the transaction
      INSERT INTO token_transactions (user_id, amount, transaction_type, description)
      VALUES (v_result.user_id, v_daily_bonus, 'daily_login', 'Daily CCC login bonus');
      
      v_bonus_awarded := v_daily_bonus;
    END IF;
    
    RETURN jsonb_build_object(
      'success', true, 
      'ccc_balance', v_result.cctr_balance,
      'claimable_rewards', v_result.claimable_rewards,
      'daily_bonus_awarded', v_bonus_awarded,
      'created', false
    );
  END IF;
  
  -- Generate a deterministic UUID from wallet address using uuid_generate_v5 with fixed namespace
  v_user_id := uuid_generate_v5(v_namespace, p_wallet_address);
  
  -- Insert new balance record with starter tokens (10 CCC)
  INSERT INTO user_balances (user_id, wallet_address, cctr_balance, claimable_rewards, updated_at)
  VALUES (v_user_id, p_wallet_address, v_starter_bonus, 0, now())
  ON CONFLICT (user_id) DO UPDATE 
    SET wallet_address = EXCLUDED.wallet_address,
        cctr_balance = COALESCE(user_balances.cctr_balance, 0) + v_starter_bonus
  RETURNING cctr_balance, claimable_rewards INTO v_result;
  
  -- Initialize trivia stats with today's login
  INSERT INTO trivia_user_stats (user_id, last_login_date, updated_at)
  VALUES (v_user_id::text, v_today, now())
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Log the starter bonus transaction
  INSERT INTO token_transactions (user_id, amount, transaction_type, description)
  VALUES (v_user_id, v_starter_bonus, 'starter_bonus', 'Welcome bonus - 10 CCC');
  
  RETURN jsonb_build_object(
    'success', true, 
    'ccc_balance', v_result.cctr_balance,
    'claimable_rewards', v_result.claimable_rewards,
    'daily_bonus_awarded', v_starter_bonus,
    'created', true
  );
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.initialize_wallet_balance(TEXT) TO anon, authenticated;