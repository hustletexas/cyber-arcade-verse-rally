-- Create secure function to claim rewards
CREATE OR REPLACE FUNCTION public.claim_user_rewards()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_balance_record RECORD;
  claimed_amount INTEGER;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Get current user balance
  SELECT * INTO user_balance_record
  FROM public.user_balances
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;

  -- Check if there are rewards to claim
  IF COALESCE(user_balance_record.claimable_rewards, 0) <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'No rewards to claim');
  END IF;

  claimed_amount := user_balance_record.claimable_rewards;

  -- Transfer rewards to main balance
  UPDATE public.user_balances
  SET 
    cctr_balance = COALESCE(cctr_balance, 0) + claimed_amount,
    claimable_rewards = 0,
    updated_at = now()
  WHERE user_id = auth.uid();

  -- Record the transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    description
  ) VALUES (
    auth.uid(),
    claimed_amount,
    'claim',
    'Claimed accumulated rewards'
  );

  RETURN json_build_object(
    'success', true, 
    'claimed_amount', claimed_amount,
    'new_balance', COALESCE(user_balance_record.cctr_balance, 0) + claimed_amount
  );
END;
$$;

-- Create secure function for trivia game entry
CREATE OR REPLACE FUNCTION public.deduct_trivia_entry_fee(category_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_balance_record RECORD;
  entry_fee INTEGER := 1;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate category (basic input validation)
  IF category_param IS NULL OR length(category_param) > 100 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid category');
  END IF;

  -- Get current user balance
  SELECT * INTO user_balance_record
  FROM public.user_balances
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;

  -- Check sufficient balance
  IF COALESCE(user_balance_record.cctr_balance, 0) < entry_fee THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient CCTR balance');
  END IF;

  -- Deduct entry fee
  UPDATE public.user_balances
  SET 
    cctr_balance = cctr_balance - entry_fee,
    updated_at = now()
  WHERE user_id = auth.uid();

  -- Record the transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    description
  ) VALUES (
    auth.uid(),
    -entry_fee,
    'trivia_entry',
    category_param || ' trivia game entry fee'
  );

  RETURN json_build_object(
    'success', true, 
    'deducted', entry_fee,
    'remaining_balance', user_balance_record.cctr_balance - entry_fee
  );
END;
$$;

-- Create secure function for awarding trivia rewards
CREATE OR REPLACE FUNCTION public.award_trivia_rewards(
  correct_answers_param integer,
  total_questions_param integer,
  category_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_balance_record RECORD;
  reward_amount INTEGER;
  max_reward INTEGER := 10; -- Maximum reward per game
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate inputs
  IF correct_answers_param < 0 OR correct_answers_param > 20 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid answer count');
  END IF;

  IF total_questions_param < 1 OR total_questions_param > 20 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid question count');
  END IF;

  IF correct_answers_param > total_questions_param THEN
    RETURN json_build_object('success', false, 'error', 'Invalid score');
  END IF;

  -- Calculate reward (1 CCTR per correct answer, max 10)
  reward_amount := LEAST(correct_answers_param, max_reward);

  IF reward_amount <= 0 THEN
    RETURN json_build_object('success', true, 'reward', 0, 'message', 'No rewards earned');
  END IF;

  -- Get current user balance
  SELECT * INTO user_balance_record
  FROM public.user_balances
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;

  -- Add rewards to balance
  UPDATE public.user_balances
  SET 
    cctr_balance = COALESCE(cctr_balance, 0) + reward_amount,
    updated_at = now()
  WHERE user_id = auth.uid();

  -- Record the transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    description
  ) VALUES (
    auth.uid(),
    reward_amount,
    'trivia_reward',
    category_param || ' trivia: ' || correct_answers_param || '/' || total_questions_param || ' correct, ' || reward_amount || ' CCTR earned'
  );

  RETURN json_build_object(
    'success', true, 
    'reward', reward_amount,
    'new_balance', COALESCE(user_balance_record.cctr_balance, 0) + reward_amount
  );
END;
$$;

-- Create secure function for NFT purchase with CCTR
CREATE OR REPLACE FUNCTION public.purchase_nft_with_cctr(
  nft_id_param text,
  nft_name_param text,
  price_param integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_balance_record RECORD;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate inputs
  IF price_param <= 0 OR price_param > 1000000 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid price');
  END IF;

  IF nft_id_param IS NULL OR length(nft_id_param) > 255 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid NFT ID');
  END IF;

  IF nft_name_param IS NULL OR length(nft_name_param) > 255 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid NFT name');
  END IF;

  -- Get current user balance
  SELECT * INTO user_balance_record
  FROM public.user_balances
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;

  -- Check sufficient balance
  IF COALESCE(user_balance_record.cctr_balance, 0) < price_param THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient CCTR balance');
  END IF;

  -- Deduct CCTR tokens
  UPDATE public.user_balances
  SET 
    cctr_balance = cctr_balance - price_param,
    updated_at = now()
  WHERE user_id = auth.uid();

  -- Record the transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    description
  ) VALUES (
    auth.uid(),
    -price_param,
    'nft_purchase',
    'NFT Purchase: ' || nft_name_param
  );

  RETURN json_build_object(
    'success', true, 
    'price_paid', price_param,
    'remaining_balance', user_balance_record.cctr_balance - price_param
  );
END;
$$;

-- Create secure function for tournament score submission
CREATE OR REPLACE FUNCTION public.submit_tournament_score(
  tournament_id_param uuid,
  score_param integer,
  game_type_param text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_participant RECORD;
  max_score INTEGER;
  tokens_awarded INTEGER;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate score based on game type (reasonable limits)
  max_score := CASE game_type_param
    WHEN 'tetris' THEN 100000
    WHEN 'pacman' THEN 50000
    WHEN 'galaga' THEN 150000
    ELSE 100000
  END;

  IF score_param < 0 OR score_param > max_score THEN
    RETURN json_build_object('success', false, 'error', 'Invalid score for game type');
  END IF;

  -- Check if participant already exists
  SELECT * INTO existing_participant
  FROM public.tournament_participants
  WHERE tournament_id = tournament_id_param AND user_id = auth.uid();

  IF FOUND THEN
    -- Only update if new score is higher
    IF score_param <= COALESCE(existing_participant.placement, 0) THEN
      RETURN json_build_object('success', true, 'message', 'Score not higher than existing', 'awarded', 0);
    END IF;

    UPDATE public.tournament_participants
    SET placement = score_param
    WHERE tournament_id = tournament_id_param AND user_id = auth.uid();
  ELSE
    -- Insert new participant
    INSERT INTO public.tournament_participants (
      tournament_id,
      user_id,
      placement
    ) VALUES (
      tournament_id_param,
      auth.uid(),
      score_param
    );
  END IF;

  -- Award tokens (1 per 10 points, max 100 tokens per submission)
  tokens_awarded := LEAST(score_param / 10, 100);

  IF tokens_awarded > 0 THEN
    -- Update user balance
    UPDATE public.user_balances
    SET 
      cctr_balance = COALESCE(cctr_balance, 0) + tokens_awarded,
      updated_at = now()
    WHERE user_id = auth.uid();

    -- Record the transaction
    INSERT INTO public.token_transactions (
      user_id,
      amount,
      transaction_type,
      description,
      tournament_id
    ) VALUES (
      auth.uid(),
      tokens_awarded,
      'tournament_win',
      'High score in ' || game_type_param || ' tournament: ' || score_param,
      tournament_id_param
    );
  END IF;

  RETURN json_build_object(
    'success', true, 
    'score', score_param,
    'tokens_awarded', tokens_awarded
  );
END;
$$;

-- Remove direct UPDATE access to user_balances for regular users
-- Keep only the secure functions for balance modifications
DROP POLICY IF EXISTS "Users can update their own balance" ON public.user_balances;

-- Create a more restrictive policy that only allows updates through SECURITY DEFINER functions
-- (Since we're using SECURITY DEFINER functions, no direct UPDATE policy is needed)
CREATE POLICY "No direct balance updates" ON public.user_balances
FOR UPDATE USING (false);