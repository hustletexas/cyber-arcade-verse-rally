-- Fix the initialize_wallet_balance function to use proper UUID generation
-- The uuid_nil() function requires the uuid-ossp extension

-- First enable the uuid-ossp extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Recreate the function with the fixed UUID generation
CREATE OR REPLACE FUNCTION public.initialize_wallet_balance(p_wallet_address text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_result RECORD;
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
    RETURN jsonb_build_object(
      'success', true, 
      'cctr_balance', v_result.cctr_balance,
      'claimable_rewards', v_result.claimable_rewards,
      'created', false
    );
  END IF;
  
  -- Generate a deterministic UUID from wallet address using uuid-ossp
  v_user_id := uuid_generate_v5(uuid_ns_dns(), p_wallet_address);
  
  -- Insert new balance record with starter tokens
  INSERT INTO user_balances (user_id, wallet_address, cctr_balance, claimable_rewards, updated_at)
  VALUES (v_user_id, p_wallet_address, 100, 0, now())
  ON CONFLICT (user_id) DO UPDATE 
    SET wallet_address = EXCLUDED.wallet_address
  RETURNING cctr_balance, claimable_rewards INTO v_result;
  
  RETURN jsonb_build_object(
    'success', true, 
    'cctr_balance', v_result.cctr_balance,
    'claimable_rewards', v_result.claimable_rewards,
    'created', true
  );
END;
$function$;