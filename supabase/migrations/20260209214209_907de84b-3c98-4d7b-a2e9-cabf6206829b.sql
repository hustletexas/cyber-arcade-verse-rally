
-- Enable the uuid-ossp extension for uuid_generate_v5 and uuid_ns_url
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;

-- Recreate the function using the correct schema-qualified call
CREATE OR REPLACE FUNCTION public.initialize_wallet_balance(p_wallet_address TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_user_id UUID;
  v_balance INTEGER;
  v_rewards INTEGER;
  v_existing RECORD;
  v_daily_bonus INTEGER := 0;
BEGIN
  -- Validate input
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet address');
  END IF;

  -- Generate deterministic UUID from wallet address
  v_user_id := extensions.uuid_generate_v5(extensions.uuid_ns_url(), p_wallet_address);

  -- Check if balance record exists
  SELECT cctr_balance, claimable_rewards, updated_at
  INTO v_existing
  FROM user_balances
  WHERE wallet_address = p_wallet_address
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    -- Existing user - check for daily login bonus
    IF v_existing.updated_at::date < CURRENT_DATE THEN
      v_daily_bonus := 5;
      UPDATE user_balances
      SET cctr_balance = cctr_balance + v_daily_bonus,
          updated_at = now()
      WHERE wallet_address = p_wallet_address;

      INSERT INTO token_transactions (user_id, amount, transaction_type, description)
      VALUES (v_user_id, v_daily_bonus, 'daily_login', 'Daily login bonus');
    END IF;

    SELECT cctr_balance, claimable_rewards
    INTO v_balance, v_rewards
    FROM user_balances
    WHERE wallet_address = p_wallet_address
    LIMIT 1;

    RETURN jsonb_build_object(
      'success', true,
      'ccc_balance', v_balance,
      'claimable_rewards', v_rewards,
      'daily_bonus_awarded', v_daily_bonus,
      'created', false
    );
  ELSE
    -- New user - create balance with starter bonus
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
$$;

GRANT EXECUTE ON FUNCTION public.initialize_wallet_balance(TEXT) TO authenticated, anon;
