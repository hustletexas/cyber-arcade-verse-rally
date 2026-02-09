
-- Update play_cyberdrop to allow 3 plays per day instead of 1
-- Also update slot rewards to pyramid order (highest in center)
CREATE OR REPLACE FUNCTION public.play_cyberdrop(p_wallet_address text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today text;
  v_plays_today int;
  v_max_plays int := 3;
  v_slot_index int;
  v_reward int;
  v_play_id uuid;
  v_balance numeric;
  v_rand float;
  v_cumulative float := 0;
  -- Rewards in pyramid order: lowest on edges, highest in center
  v_rewards int[] := ARRAY[0, 10, 25, 60, 140, 500, 250, 90, 40, 15, 5];
  -- Corresponding weights
  v_weights int[] := ARRAY[12, 14, 10, 8, 6, 3, 5, 7, 9, 12, 14];
  v_total_weight int := 100;
BEGIN
  -- Get today's date in Chicago timezone
  v_today := (now() AT TIME ZONE 'America/Chicago')::date::text;

  -- Count plays today
  SELECT count(*) INTO v_plays_today
  FROM cyberdrop_plays
  WHERE user_id = p_wallet_address
    AND played_on_date = v_today;

  IF v_plays_today >= v_max_plays THEN
    RETURN jsonb_build_object('success', false, 'error', 'DAILY_LIMIT_REACHED');
  END IF;

  -- Pick random slot using weighted probabilities
  v_rand := random() * v_total_weight;
  FOR i IN 1..array_length(v_weights, 1) LOOP
    v_cumulative := v_cumulative + v_weights[i];
    IF v_rand <= v_cumulative THEN
      v_slot_index := i - 1;
      v_reward := v_rewards[i];
      EXIT;
    END IF;
  END LOOP;

  -- Fallback
  IF v_slot_index IS NULL THEN
    v_slot_index := 0;
    v_reward := 0;
  END IF;

  -- Insert play record
  INSERT INTO cyberdrop_plays (user_id, slot_index, reward_amount, played_on_date)
  VALUES (p_wallet_address, v_slot_index, v_reward, v_today)
  RETURNING id INTO v_play_id;

  -- Upsert user points
  INSERT INTO user_points (user_id, balance)
  VALUES (p_wallet_address, v_reward)
  ON CONFLICT (user_id) DO UPDATE
  SET balance = user_points.balance + v_reward,
      updated_at = now();

  SELECT balance INTO v_balance FROM user_points WHERE user_id = p_wallet_address;

  RETURN jsonb_build_object(
    'success', true,
    'playId', v_play_id,
    'slotIndex', v_slot_index,
    'rewardAmount', v_reward,
    'updatedBalance', v_balance,
    'playsRemaining', v_max_plays - v_plays_today - 1
  );
END;
$$;
