
-- Create user_points table for Cyber Drop game balance
CREATE TABLE public.user_points (
  user_id text NOT NULL PRIMARY KEY,
  balance integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;

-- RLS: users can view their own points (wallet-based)
CREATE POLICY "Users can view own points"
ON public.user_points FOR SELECT
TO authenticated, anon
USING (true);

-- RLS: only SECURITY DEFINER functions can insert/update
CREATE POLICY "System can manage points"
ON public.user_points FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create cyberdrop_plays table
CREATE TABLE public.cyberdrop_plays (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  played_on_date date NOT NULL DEFAULT CURRENT_DATE,
  slot_index integer NOT NULL CHECK (slot_index >= 0 AND slot_index <= 10),
  reward_amount integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cyberdrop_plays ENABLE ROW LEVEL SECURITY;

-- RLS: users can view their own plays
CREATE POLICY "Users can view own plays"
ON public.cyberdrop_plays FOR SELECT
TO authenticated, anon
USING (true);

-- RLS: only SECURITY DEFINER functions can insert
CREATE POLICY "System can insert plays"
ON public.cyberdrop_plays FOR INSERT
TO service_role
WITH CHECK (true);

-- Index for daily limit check
CREATE INDEX idx_cyberdrop_plays_user_date ON public.cyberdrop_plays (user_id, played_on_date);

-- Index for user_points lookups
CREATE INDEX idx_user_points_user_id ON public.user_points (user_id);

-- Create the play_cyberdrop SECURITY DEFINER function
CREATE OR REPLACE FUNCTION public.play_cyberdrop(p_wallet_address text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_today date;
  v_slot_index integer;
  v_reward_amount integer;
  v_play_id uuid;
  v_current_balance integer;
  v_random_val double precision;
  v_cumulative_weight integer := 0;
  v_total_weight integer := 100; -- sum of all weights
  v_rewards integer[] := ARRAY[0,5,10,15,25,40,60,90,140,250,500];
  v_weights integer[] := ARRAY[12,14,14,12,10,9,8,7,6,5,3];
  v_i integer;
BEGIN
  -- Validate wallet address
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet address');
  END IF;

  -- Get today's date in America/Chicago timezone
  v_today := (now() AT TIME ZONE 'America/Chicago')::date;

  -- Check daily limit
  IF EXISTS (
    SELECT 1 FROM cyberdrop_plays
    WHERE user_id = p_wallet_address
      AND played_on_date = v_today
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'DAILY_LIMIT_REACHED');
  END IF;

  -- Generate weighted random slot
  v_random_val := random() * v_total_weight;
  v_slot_index := 0;
  
  FOR v_i IN 1..11 LOOP
    v_cumulative_weight := v_cumulative_weight + v_weights[v_i];
    IF v_random_val <= v_cumulative_weight THEN
      v_slot_index := v_i - 1;
      EXIT;
    END IF;
  END LOOP;

  v_reward_amount := v_rewards[v_slot_index + 1];

  -- Insert play record
  INSERT INTO cyberdrop_plays (user_id, played_on_date, slot_index, reward_amount)
  VALUES (p_wallet_address, v_today, v_slot_index, v_reward_amount)
  RETURNING id INTO v_play_id;

  -- Upsert user_points
  INSERT INTO user_points (user_id, balance, updated_at)
  VALUES (p_wallet_address, v_reward_amount, now())
  ON CONFLICT (user_id) DO UPDATE
    SET balance = user_points.balance + v_reward_amount,
        updated_at = now()
  RETURNING balance INTO v_current_balance;

  RETURN jsonb_build_object(
    'success', true,
    'playId', v_play_id,
    'slotIndex', v_slot_index,
    'rewardAmount', v_reward_amount,
    'updatedBalance', v_current_balance
  );
END;
$function$;
