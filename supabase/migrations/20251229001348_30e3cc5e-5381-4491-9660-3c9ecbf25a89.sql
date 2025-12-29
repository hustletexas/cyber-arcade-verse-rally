-- Create SECURITY DEFINER function to atomically claim weekly trivia bonus
CREATE OR REPLACE FUNCTION public.claim_weekly_trivia_bonus()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  last_claim TIMESTAMP WITH TIME ZONE;
  reward_amount INTEGER := 100;
  user_balance_record RECORD;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Check last claim atomically (prevents race condition)
  SELECT MAX(created_at) INTO last_claim
  FROM public.token_transactions
  WHERE user_id = auth.uid() 
    AND transaction_type = 'weekly_trivia_bonus';
  
  IF last_claim IS NOT NULL AND last_claim > NOW() - INTERVAL '7 days' THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Already claimed this week',
      'next_claim_available', last_claim + INTERVAL '7 days'
    );
  END IF;
  
  -- Get current user balance
  SELECT * INTO user_balance_record
  FROM public.user_balances
  WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;
  
  -- Update balance atomically
  UPDATE public.user_balances 
  SET 
    cctr_balance = COALESCE(cctr_balance, 0) + reward_amount,
    updated_at = now()
  WHERE user_id = auth.uid();
  
  -- Record transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    description
  ) VALUES (
    auth.uid(),
    reward_amount,
    'weekly_trivia_bonus',
    'Weekly trivia participation bonus'
  );
  
  RETURN json_build_object(
    'success', true, 
    'claimed', reward_amount,
    'new_balance', COALESCE(user_balance_record.cctr_balance, 0) + reward_amount
  );
END;
$$;