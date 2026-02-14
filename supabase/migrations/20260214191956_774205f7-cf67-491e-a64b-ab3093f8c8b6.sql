
-- Track daily radio listening sessions
CREATE TABLE public.radio_listen_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  listen_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_seconds INTEGER NOT NULL DEFAULT 0,
  session_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listen_date)
);

-- Track cumulative streak data
CREATE TABLE public.radio_streaks (
  user_id TEXT NOT NULL PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_listen_days INTEGER NOT NULL DEFAULT 0,
  total_listen_seconds INTEGER NOT NULL DEFAULT 0,
  last_listen_date DATE,
  tier TEXT NOT NULL DEFAULT 'bronze',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track claimed milestone rewards
CREATE TABLE public.radio_milestone_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  milestone_type TEXT NOT NULL,
  milestone_value INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  reward_description TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  transaction_hash TEXT,
  UNIQUE(user_id, milestone_type, milestone_value)
);

-- Enable RLS
ALTER TABLE public.radio_listen_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.radio_milestone_claims ENABLE ROW LEVEL SECURITY;

-- RLS policies for radio_listen_sessions
CREATE POLICY "Users can view own listen sessions"
  ON public.radio_listen_sessions FOR SELECT
  USING (user_id = (SELECT get_current_wallet_address()));

CREATE POLICY "Users can insert own listen sessions"
  ON public.radio_listen_sessions FOR INSERT
  WITH CHECK (user_id = (SELECT get_current_wallet_address()));

CREATE POLICY "Users can update own listen sessions"
  ON public.radio_listen_sessions FOR UPDATE
  USING (user_id = (SELECT get_current_wallet_address()));

-- RLS policies for radio_streaks
CREATE POLICY "Users can view own streaks"
  ON public.radio_streaks FOR SELECT
  USING (user_id = (SELECT get_current_wallet_address()));

CREATE POLICY "Users can insert own streaks"
  ON public.radio_streaks FOR INSERT
  WITH CHECK (user_id = (SELECT get_current_wallet_address()));

CREATE POLICY "Users can update own streaks"
  ON public.radio_streaks FOR UPDATE
  USING (user_id = (SELECT get_current_wallet_address()));

-- RLS policies for radio_milestone_claims
CREATE POLICY "Users can view own milestone claims"
  ON public.radio_milestone_claims FOR SELECT
  USING (user_id = (SELECT get_current_wallet_address()));

CREATE POLICY "Users can insert own milestone claims"
  ON public.radio_milestone_claims FOR INSERT
  WITH CHECK (user_id = (SELECT get_current_wallet_address()));

-- Server-side function to record listen time and update streaks
CREATE OR REPLACE FUNCTION public.record_radio_listen(p_wallet_address TEXT, p_seconds INTEGER)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_streak RECORD;
  v_new_streak INTEGER;
  v_yesterday DATE := v_today - INTERVAL '1 day';
  v_tier TEXT;
  v_total_seconds INTEGER;
BEGIN
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet');
  END IF;
  
  IF p_seconds <= 0 OR p_seconds > 3600 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid duration');
  END IF;

  -- Upsert listen session for today
  INSERT INTO radio_listen_sessions (user_id, listen_date, total_seconds, session_count)
  VALUES (p_wallet_address, v_today, p_seconds, 1)
  ON CONFLICT (user_id, listen_date) DO UPDATE
  SET total_seconds = radio_listen_sessions.total_seconds + p_seconds,
      session_count = radio_listen_sessions.session_count + 1,
      updated_at = now();

  -- Get or create streak record
  SELECT * INTO v_streak FROM radio_streaks WHERE user_id = p_wallet_address FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO radio_streaks (user_id, current_streak, longest_streak, total_listen_days, total_listen_seconds, last_listen_date, tier)
    VALUES (p_wallet_address, 1, 1, 1, p_seconds, v_today, 'bronze');
    
    RETURN jsonb_build_object(
      'success', true,
      'current_streak', 1,
      'longest_streak', 1,
      'total_days', 1,
      'total_seconds', p_seconds,
      'tier', 'bronze'
    );
  END IF;

  -- Calculate streak
  IF v_streak.last_listen_date = v_today THEN
    -- Already listened today, just update seconds
    v_new_streak := v_streak.current_streak;
  ELSIF v_streak.last_listen_date = v_yesterday THEN
    -- Consecutive day!
    v_new_streak := v_streak.current_streak + 1;
  ELSE
    -- Streak broken, start fresh
    v_new_streak := 1;
  END IF;

  v_total_seconds := v_streak.total_listen_seconds + p_seconds;

  -- Determine tier based on total listen days
  v_tier := CASE
    WHEN v_streak.total_listen_days + (CASE WHEN v_streak.last_listen_date != v_today THEN 1 ELSE 0 END) >= 30 THEN 'diamond'
    WHEN v_streak.total_listen_days + (CASE WHEN v_streak.last_listen_date != v_today THEN 1 ELSE 0 END) >= 14 THEN 'gold'
    WHEN v_streak.total_listen_days + (CASE WHEN v_streak.last_listen_date != v_today THEN 1 ELSE 0 END) >= 7 THEN 'silver'
    ELSE 'bronze'
  END;

  UPDATE radio_streaks
  SET current_streak = v_new_streak,
      longest_streak = GREATEST(v_streak.longest_streak, v_new_streak),
      total_listen_days = v_streak.total_listen_days + (CASE WHEN v_streak.last_listen_date != v_today THEN 1 ELSE 0 END),
      total_listen_seconds = v_total_seconds,
      last_listen_date = v_today,
      tier = v_tier,
      updated_at = now()
  WHERE user_id = p_wallet_address;

  RETURN jsonb_build_object(
    'success', true,
    'current_streak', v_new_streak,
    'longest_streak', GREATEST(v_streak.longest_streak, v_new_streak),
    'total_days', v_streak.total_listen_days + (CASE WHEN v_streak.last_listen_date != v_today THEN 1 ELSE 0 END),
    'total_seconds', v_total_seconds,
    'tier', v_tier
  );
END;
$$;

-- Function to claim a milestone reward
CREATE OR REPLACE FUNCTION public.claim_radio_milestone(p_wallet_address TEXT, p_milestone_type TEXT, p_milestone_value INTEGER, p_reward_type TEXT, p_reward_description TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_streak RECORD;
  v_actual_value INTEGER;
  v_ccc_reward INTEGER := 0;
BEGIN
  IF p_wallet_address IS NULL OR length(p_wallet_address) < 10 THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid wallet');
  END IF;

  -- Check if already claimed
  IF EXISTS (SELECT 1 FROM radio_milestone_claims WHERE user_id = p_wallet_address AND milestone_type = p_milestone_type AND milestone_value = p_milestone_value) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Already claimed');
  END IF;

  -- Verify eligibility
  SELECT * INTO v_streak FROM radio_streaks WHERE user_id = p_wallet_address;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'No listen data found');
  END IF;

  -- Check the milestone requirement
  v_actual_value := CASE p_milestone_type
    WHEN 'streak' THEN v_streak.current_streak
    WHEN 'total_days' THEN v_streak.total_listen_days
    WHEN 'total_hours' THEN v_streak.total_listen_seconds / 3600
    ELSE 0
  END;

  IF v_actual_value < p_milestone_value THEN
    RETURN jsonb_build_object('success', false, 'error', 'Milestone not reached', 'current', v_actual_value, 'required', p_milestone_value);
  END IF;

  -- Determine CCC reward
  v_ccc_reward := CASE
    WHEN p_milestone_type = 'streak' AND p_milestone_value = 3 THEN 5
    WHEN p_milestone_type = 'streak' AND p_milestone_value = 7 THEN 15
    WHEN p_milestone_type = 'streak' AND p_milestone_value = 14 THEN 30
    WHEN p_milestone_type = 'streak' AND p_milestone_value = 30 THEN 75
    WHEN p_milestone_type = 'total_hours' AND p_milestone_value = 1 THEN 5
    WHEN p_milestone_type = 'total_hours' AND p_milestone_value = 5 THEN 15
    WHEN p_milestone_type = 'total_hours' AND p_milestone_value = 10 THEN 25
    WHEN p_milestone_type = 'total_hours' AND p_milestone_value = 24 THEN 50
    WHEN p_milestone_type = 'total_days' AND p_milestone_value = 7 THEN 10
    WHEN p_milestone_type = 'total_days' AND p_milestone_value = 30 THEN 50
    ELSE 5
  END;

  -- Record claim
  INSERT INTO radio_milestone_claims (user_id, milestone_type, milestone_value, reward_type, reward_description)
  VALUES (p_wallet_address, p_milestone_type, p_milestone_value, p_reward_type, p_reward_description);

  -- Award CCC
  UPDATE user_balances
  SET cctr_balance = COALESCE(cctr_balance, 0) + v_ccc_reward, updated_at = now()
  WHERE wallet_address = p_wallet_address;

  IF NOT FOUND THEN
    INSERT INTO user_balances (user_id, wallet_address, cctr_balance, claimable_rewards, updated_at)
    VALUES (
      extensions.uuid_generate_v5(extensions.uuid_ns_url(), p_wallet_address),
      p_wallet_address, v_ccc_reward, 0, now()
    )
    ON CONFLICT (wallet_address) DO UPDATE
    SET cctr_balance = COALESCE(user_balances.cctr_balance, 0) + v_ccc_reward, updated_at = now();
  END IF;

  -- Record transaction
  INSERT INTO token_transactions (user_id, amount, transaction_type, description)
  VALUES (
    extensions.uuid_generate_v5(extensions.uuid_ns_url(), p_wallet_address),
    v_ccc_reward,
    'radio_milestone',
    'Radio milestone: ' || p_milestone_type || ' ' || p_milestone_value || ' - ' || p_reward_description
  );

  RETURN jsonb_build_object(
    'success', true,
    'ccc_awarded', v_ccc_reward,
    'milestone_type', p_milestone_type,
    'milestone_value', p_milestone_value,
    'reward_type', p_reward_type
  );
END;
$$;
