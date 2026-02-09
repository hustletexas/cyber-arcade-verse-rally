
-- Add is_paid flag to cyberdrop_plays so we know which count for leaderboard
ALTER TABLE public.cyberdrop_plays ADD COLUMN IF NOT EXISTS is_paid boolean NOT NULL DEFAULT false;

-- Update play_cyberdrop to support paid plays
CREATE OR REPLACE FUNCTION public.play_cyberdrop(p_wallet_address text, p_is_paid boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_today date;
  v_plays_today int;
  v_max_free_plays int := 1;
  v_slot_index int;
  v_reward int;
  v_play_id uuid;
  v_balance int;
  v_slots int[] := ARRAY[0, 10, 25, 60, 140, 500, 250, 90, 40, 15, 5];
  v_weights int[] := ARRAY[12, 14, 14, 12, 10, 3, 5, 7, 8, 9, 6];
  v_total_weight int := 0;
  v_rand int;
  v_cumulative int := 0;
  i int;
BEGIN
  v_today := (now() AT TIME ZONE 'America/Chicago')::date;

  -- If free play, check daily limit
  IF NOT p_is_paid THEN
    SELECT count(*) INTO v_plays_today
    FROM cyberdrop_plays
    WHERE user_id = p_wallet_address
      AND played_on_date = v_today
      AND is_paid = false;

    IF v_plays_today >= v_max_free_plays THEN
      RETURN jsonb_build_object('success', false, 'error', 'DAILY_LIMIT_REACHED');
    END IF;
  ELSE
    -- Paid play: deduct 1 CCC from user_points
    UPDATE user_points
    SET balance = balance - 1, updated_at = now()
    WHERE user_id = p_wallet_address AND balance >= 1;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_BALANCE');
    END IF;
  END IF;

  -- Weighted random slot selection
  FOR i IN 1..array_length(v_weights, 1) LOOP
    v_total_weight := v_total_weight + v_weights[i];
  END LOOP;

  v_rand := floor(random() * v_total_weight)::int;
  FOR i IN 1..array_length(v_weights, 1) LOOP
    v_cumulative := v_cumulative + v_weights[i];
    IF v_rand < v_cumulative THEN
      v_slot_index := i - 1;
      EXIT;
    END IF;
  END LOOP;

  v_reward := v_slots[v_slot_index + 1];

  -- Record the play
  INSERT INTO cyberdrop_plays (user_id, played_on_date, slot_index, reward_amount, is_paid)
  VALUES (p_wallet_address, v_today, v_slot_index, v_reward, p_is_paid)
  RETURNING id INTO v_play_id;

  -- Award points
  INSERT INTO user_points (user_id, balance, updated_at)
  VALUES (p_wallet_address, v_reward, now())
  ON CONFLICT (user_id) DO UPDATE
  SET balance = user_points.balance + v_reward, updated_at = now();

  -- Get updated balance
  SELECT balance INTO v_balance FROM user_points WHERE user_id = p_wallet_address;

  -- Count remaining free plays today
  SELECT count(*) INTO v_plays_today
  FROM cyberdrop_plays
  WHERE user_id = p_wallet_address
    AND played_on_date = v_today
    AND is_paid = false;

  RETURN jsonb_build_object(
    'success', true,
    'playId', v_play_id,
    'slotIndex', v_slot_index,
    'rewardAmount', v_reward,
    'updatedBalance', v_balance,
    'freePlaysRemaining', GREATEST(0, v_max_free_plays - v_plays_today),
    'isPaid', p_is_paid
  );
END;
$$;
