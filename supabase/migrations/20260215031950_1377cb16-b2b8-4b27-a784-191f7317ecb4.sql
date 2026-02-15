
-- 1. Fix play_cyberdrop: add authentication and wallet ownership verification
CREATE OR REPLACE FUNCTION public.play_cyberdrop(p_wallet_address text, p_is_paid boolean DEFAULT false)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_today date;
  v_plays_today int;
  v_max_free_plays int := 1;
  v_slot_index int;
  v_reward int;
  v_play_id uuid;
  v_balance int;
  v_auth_wallet text;
  v_slots int[] := ARRAY[0, 10, 25, 60, 140, 500, 250, 90, 40, 15, 5];
  v_weights int[] := ARRAY[12, 14, 14, 12, 10, 3, 5, 7, 8, 9, 6];
  v_total_weight int := 0;
  v_rand int;
  v_cumulative int := 0;
  i int;
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- Verify wallet ownership
  SELECT wallet_address INTO v_auth_wallet FROM public.profiles WHERE id = auth.uid();
  IF v_auth_wallet IS NULL OR v_auth_wallet != p_wallet_address THEN
    RETURN jsonb_build_object('success', false, 'error', 'Wallet address does not match authenticated user');
  END IF;

  v_today := (now() AT TIME ZONE 'America/Chicago')::date;

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
    UPDATE user_points
    SET balance = balance - 1, updated_at = now()
    WHERE user_id = p_wallet_address AND balance >= 1;

    IF NOT FOUND THEN
      RETURN jsonb_build_object('success', false, 'error', 'INSUFFICIENT_BALANCE');
    END IF;
  END IF;

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

  INSERT INTO cyberdrop_plays (user_id, played_on_date, slot_index, reward_amount, is_paid)
  VALUES (p_wallet_address, v_today, v_slot_index, v_reward, p_is_paid)
  RETURNING id INTO v_play_id;

  INSERT INTO user_points (user_id, balance, updated_at)
  VALUES (p_wallet_address, v_reward, now())
  ON CONFLICT (user_id) DO UPDATE
  SET balance = user_points.balance + v_reward, updated_at = now();

  SELECT balance INTO v_balance FROM user_points WHERE user_id = p_wallet_address;

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

-- 2. Fix avatar storage policies: restore path-restricted authenticated policies
DROP POLICY IF EXISTS "Allow avatar uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar updates" ON storage.objects;
DROP POLICY IF EXISTS "Allow avatar deletes" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
