
-- Remove duplicate user_balances rows, keeping the one with highest balance
DELETE FROM user_balances a
USING user_balances b
WHERE a.wallet_address = b.wallet_address
  AND a.wallet_address IS NOT NULL
  AND a.cctr_balance < b.cctr_balance;

-- Also clean up NULL wallet duplicates - keep one
DELETE FROM user_balances
WHERE wallet_address IS NULL
  AND user_id NOT IN (
    SELECT user_id FROM user_balances WHERE wallet_address IS NULL ORDER BY updated_at DESC LIMIT 1
  );

-- Add unique constraint on wallet_address to prevent future duplicates
-- (drop if exists first)
ALTER TABLE user_balances DROP CONSTRAINT IF EXISTS user_balances_wallet_address_unique;
ALTER TABLE user_balances ADD CONSTRAINT user_balances_wallet_address_unique UNIQUE (wallet_address);

-- Fix the initialize_wallet_balance function to use LIMIT 1
CREATE OR REPLACE FUNCTION public.initialize_wallet_balance(p_wallet_address TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_balance INTEGER;
  v_rewards INTEGER;
  v_existing RECORD;
  v_daily_bonus INTEGER := 0;
  v_created BOOLEAN := false;
BEGIN
  -- Validate input
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet address');
  END IF;

  -- Generate deterministic UUID from wallet address
  v_user_id := uuid_generate_v5(uuid_ns_url(), p_wallet_address);

  -- Check if balance record exists (use LIMIT 1 to prevent multi-row error)
  SELECT cctr_balance, claimable_rewards, updated_at
  INTO v_existing
  FROM user_balances
  WHERE wallet_address = p_wallet_address
  LIMIT 1
  FOR UPDATE;

  IF FOUND THEN
    -- Existing user - check for daily login bonus
    IF v_existing.updated_at::date < CURRENT_DATE THEN
      -- Award daily login bonus
      v_daily_bonus := 5;
      UPDATE user_balances
      SET cctr_balance = cctr_balance + v_daily_bonus,
          updated_at = now()
      WHERE wallet_address = p_wallet_address;

      -- Log the daily bonus transaction
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

    -- Log starter bonus
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
