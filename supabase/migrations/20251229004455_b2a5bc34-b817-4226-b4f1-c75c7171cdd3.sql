-- Create rate limit tracking table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  function_name TEXT NOT NULL,
  called_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_function_time 
ON public.rate_limits (user_id, function_name, called_at DESC);

-- Enable RLS
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own rate limit records
CREATE POLICY "Users can view own rate limits"
ON public.rate_limits FOR SELECT
USING (auth.uid() = user_id);

-- Auto-cleanup old rate limit records (older than 1 day)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.rate_limits 
  WHERE called_at < NOW() - INTERVAL '1 day';
END;
$$;

-- Rate limit checker function
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  function_name_param TEXT,
  max_calls INTEGER,
  time_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  call_count INTEGER;
  time_window INTERVAL;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  time_window := (time_window_seconds || ' seconds')::INTERVAL;

  -- Count recent calls
  SELECT COUNT(*) INTO call_count
  FROM public.rate_limits
  WHERE user_id = auth.uid()
    AND function_name = function_name_param
    AND called_at > NOW() - time_window;

  -- Check if limit exceeded
  IF call_count >= max_calls THEN
    RETURN FALSE;
  END IF;

  -- Record this call
  INSERT INTO public.rate_limits (user_id, function_name, called_at)
  VALUES (auth.uid(), function_name_param, NOW());

  -- Opportunistic cleanup (1% chance per call)
  IF random() < 0.01 THEN
    PERFORM public.cleanup_old_rate_limits();
  END IF;

  RETURN TRUE;
END;
$$;

-- Update award_trivia_rewards with rate limiting (max 10 per hour)
CREATE OR REPLACE FUNCTION public.award_trivia_rewards(correct_answers_param integer, total_questions_param integer, category_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_balance_record RECORD;
  reward_amount INTEGER;
  max_reward INTEGER := 10;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 10 trivia games per hour
  IF NOT public.check_rate_limit('award_trivia_rewards', 10, 3600) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded. Please try again later.');
  END IF;

  IF correct_answers_param < 0 OR correct_answers_param > 20 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid answer count');
  END IF;

  IF total_questions_param < 1 OR total_questions_param > 20 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid question count');
  END IF;

  IF correct_answers_param > total_questions_param THEN
    RETURN json_build_object('success', false, 'error', 'Invalid score');
  END IF;

  reward_amount := LEAST(correct_answers_param, max_reward);

  IF reward_amount <= 0 THEN
    RETURN json_build_object('success', true, 'reward', 0, 'message', 'No rewards earned');
  END IF;

  SELECT * INTO user_balance_record
  FROM public.user_balances
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;

  UPDATE public.user_balances
  SET 
    cctr_balance = COALESCE(cctr_balance, 0) + reward_amount,
    updated_at = now()
  WHERE user_id = auth.uid();

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

-- Update submit_tournament_score with rate limiting (max 30 per minute)
CREATE OR REPLACE FUNCTION public.submit_tournament_score(tournament_id_param uuid, score_param integer, game_type_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  existing_participant RECORD;
  max_score INTEGER;
  tokens_awarded INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 30 score submissions per minute
  IF NOT public.check_rate_limit('submit_tournament_score', 30, 60) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded. Please try again later.');
  END IF;

  max_score := CASE game_type_param
    WHEN 'tetris' THEN 100000
    WHEN 'pacman' THEN 50000
    WHEN 'galaga' THEN 150000
    ELSE 100000
  END;

  IF score_param < 0 OR score_param > max_score THEN
    RETURN json_build_object('success', false, 'error', 'Invalid score for game type');
  END IF;

  SELECT * INTO existing_participant
  FROM public.tournament_participants
  WHERE tournament_id = tournament_id_param AND user_id = auth.uid();

  IF FOUND THEN
    IF score_param <= COALESCE(existing_participant.placement, 0) THEN
      RETURN json_build_object('success', true, 'message', 'Score not higher than existing', 'awarded', 0);
    END IF;

    UPDATE public.tournament_participants
    SET placement = score_param
    WHERE tournament_id = tournament_id_param AND user_id = auth.uid();
  ELSE
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

  tokens_awarded := LEAST(score_param / 10, 100);

  IF tokens_awarded > 0 THEN
    UPDATE public.user_balances
    SET 
      cctr_balance = COALESCE(cctr_balance, 0) + tokens_awarded,
      updated_at = now()
    WHERE user_id = auth.uid();

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

-- Update purchase_song with rate limiting (max 20 per hour)
CREATE OR REPLACE FUNCTION public.purchase_song(song_id_param uuid, user_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  song_record RECORD;
  user_balance_record RECORD;
  purchase_id UUID;
BEGIN
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Unauthorized: Cannot purchase songs for other users';
  END IF;

  -- Rate limit: max 20 song purchases per hour
  IF NOT public.check_rate_limit('purchase_song', 20, 3600) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded. Please try again later.');
  END IF;

  SELECT * INTO song_record FROM public.songs WHERE id = song_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Song not found');
  END IF;
  
  IF NOT song_record.is_purchasable THEN
    RETURN json_build_object('success', false, 'error', 'Song is not available for purchase');
  END IF;
  
  IF song_record.is_free THEN
    INSERT INTO public.user_song_purchases (user_id, song_id, purchase_price)
    VALUES (user_id_param, song_id_param, 0)
    RETURNING id INTO purchase_id;
    
    RETURN json_build_object('success', true, 'purchase_id', purchase_id, 'cost', 0);
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.user_song_purchases 
    WHERE user_id = user_id_param AND song_id = song_id_param
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You already own this song');
  END IF;
  
  SELECT * INTO user_balance_record 
  FROM public.user_balances 
  WHERE user_id = user_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;
  
  IF user_balance_record.cctr_balance < song_record.price_cctr THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient CCTR balance');
  END IF;
  
  UPDATE public.user_balances 
  SET cctr_balance = cctr_balance - song_record.price_cctr,
      updated_at = now()
  WHERE user_id = user_id_param;
  
  INSERT INTO public.user_song_purchases (user_id, song_id, purchase_price)
  VALUES (user_id_param, song_id_param, song_record.price_cctr)
  RETURNING id INTO purchase_id;
  
  INSERT INTO public.token_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    user_id_param,
    -song_record.price_cctr,
    'song_purchase',
    'Purchased song: ' || song_record.title || ' by ' || song_record.artist
  );
  
  UPDATE public.songs 
  SET play_count = play_count + 1,
      updated_at = now()
  WHERE id = song_id_param;
  
  RETURN json_build_object(
    'success', true, 
    'purchase_id', purchase_id, 
    'cost', song_record.price_cctr,
    'song_title', song_record.title,
    'remaining_balance', user_balance_record.cctr_balance - song_record.price_cctr
  );
END;
$$;

-- Update purchase_nft_with_cctr with rate limiting (max 10 per hour)
CREATE OR REPLACE FUNCTION public.purchase_nft_with_cctr(nft_id_param text, nft_name_param text, price_param integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_balance_record RECORD;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 10 NFT purchases per hour
  IF NOT public.check_rate_limit('purchase_nft_with_cctr', 10, 3600) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded. Please try again later.');
  END IF;

  IF price_param <= 0 OR price_param > 1000000 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid price');
  END IF;

  IF nft_id_param IS NULL OR length(nft_id_param) > 255 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid NFT ID');
  END IF;

  IF nft_name_param IS NULL OR length(nft_name_param) > 255 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid NFT name');
  END IF;

  SELECT * INTO user_balance_record
  FROM public.user_balances
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;

  IF COALESCE(user_balance_record.cctr_balance, 0) < price_param THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient CCTR balance');
  END IF;

  UPDATE public.user_balances
  SET 
    cctr_balance = cctr_balance - price_param,
    updated_at = now()
  WHERE user_id = auth.uid();

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

-- Update claim_user_rewards with rate limiting (max 5 per hour)
CREATE OR REPLACE FUNCTION public.claim_user_rewards()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_balance_record RECORD;
  claimed_amount INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 5 claims per hour
  IF NOT public.check_rate_limit('claim_user_rewards', 5, 3600) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded. Please try again later.');
  END IF;

  SELECT * INTO user_balance_record
  FROM public.user_balances
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;

  IF COALESCE(user_balance_record.claimable_rewards, 0) <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'No rewards to claim');
  END IF;

  claimed_amount := user_balance_record.claimable_rewards;

  UPDATE public.user_balances
  SET 
    cctr_balance = COALESCE(cctr_balance, 0) + claimed_amount,
    claimable_rewards = 0,
    updated_at = now()
  WHERE user_id = auth.uid();

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

-- Update deduct_trivia_entry_fee with rate limiting (max 15 per hour)
CREATE OR REPLACE FUNCTION public.deduct_trivia_entry_fee(category_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_balance_record RECORD;
  entry_fee INTEGER := 1;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 15 trivia entries per hour
  IF NOT public.check_rate_limit('deduct_trivia_entry_fee', 15, 3600) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded. Please try again later.');
  END IF;

  IF category_param IS NULL OR length(category_param) > 100 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid category');
  END IF;

  SELECT * INTO user_balance_record
  FROM public.user_balances
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;

  IF COALESCE(user_balance_record.cctr_balance, 0) < entry_fee THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient CCTR balance');
  END IF;

  UPDATE public.user_balances
  SET 
    cctr_balance = cctr_balance - entry_fee,
    updated_at = now()
  WHERE user_id = auth.uid();

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