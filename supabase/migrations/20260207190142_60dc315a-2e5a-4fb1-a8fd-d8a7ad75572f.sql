
-- ============================================
-- 1. Create sequence_scores table for Cyber Sequence
-- ============================================
CREATE TABLE public.sequence_scores (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id text NOT NULL,
  score integer NOT NULL,
  level integer NOT NULL DEFAULT 1,
  best_streak integer NOT NULL DEFAULT 0,
  mistakes integer NOT NULL DEFAULT 0,
  mode text NOT NULL DEFAULT 'normal',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sequence_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own sequence scores"
  ON public.sequence_scores FOR INSERT
  WITH CHECK (user_id IS NOT NULL AND length(user_id) > 10);

CREATE POLICY "Users can view own sequence scores"
  ON public.sequence_scores FOR SELECT
  USING (user_id IS NOT NULL AND length(user_id) > 10);

-- Index for weekly queries
CREATE INDEX idx_sequence_scores_created_at ON public.sequence_scores (created_at DESC);
CREATE INDEX idx_sequence_scores_user_id ON public.sequence_scores (user_id);

-- ============================================
-- 2. Create weekly_reward_distributions table
-- ============================================
CREATE TABLE public.weekly_reward_distributions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start date NOT NULL,
  week_end date NOT NULL,
  wallet_address text NOT NULL,
  placement integer NOT NULL,
  total_score bigint NOT NULL DEFAULT 0,
  ccc_awarded integer NOT NULL DEFAULT 0,
  raffle_ticket_awarded boolean NOT NULL DEFAULT false,
  chest_awarded boolean NOT NULL DEFAULT false,
  distributed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.weekly_reward_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own weekly rewards"
  ON public.weekly_reward_distributions FOR SELECT
  USING (wallet_address IS NOT NULL AND length(wallet_address) > 10);

-- Prevent duplicate distributions for same week/wallet
CREATE UNIQUE INDEX idx_weekly_rewards_unique 
  ON public.weekly_reward_distributions (week_start, wallet_address);

CREATE INDEX idx_weekly_rewards_week ON public.weekly_reward_distributions (week_start DESC);

-- ============================================
-- 3. Create function to get combined weekly leaderboard
-- ============================================
CREATE OR REPLACE FUNCTION public.get_combined_weekly_leaderboard(
  p_week_start timestamp with time zone DEFAULT (date_trunc('week', now())),
  p_week_end timestamp with time zone DEFAULT now()
)
RETURNS TABLE (
  wallet_address text,
  match_best_score bigint,
  trivia_best_score bigint,
  sequence_best_score bigint,
  total_score bigint,
  rank bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH match_scores_week AS (
    SELECT 
      user_id AS wallet,
      COALESCE(MAX(score), 0)::bigint AS best_score
    FROM match_scores
    WHERE created_at >= p_week_start AND created_at < p_week_end
    GROUP BY user_id
  ),
  trivia_scores_week AS (
    SELECT 
      user_id AS wallet,
      COALESCE(MAX(score), 0)::bigint AS best_score
    FROM trivia_runs
    WHERE started_at >= p_week_start AND started_at < p_week_end
      AND is_active = false
    GROUP BY user_id
  ),
  sequence_scores_week AS (
    SELECT 
      user_id AS wallet,
      COALESCE(MAX(score), 0)::bigint AS best_score
    FROM sequence_scores
    WHERE created_at >= p_week_start AND created_at < p_week_end
    GROUP BY user_id
  ),
  all_wallets AS (
    SELECT wallet FROM match_scores_week
    UNION
    SELECT wallet FROM trivia_scores_week
    UNION
    SELECT wallet FROM sequence_scores_week
  ),
  combined AS (
    SELECT
      aw.wallet AS wallet_address,
      COALESCE(ms.best_score, 0) AS match_best_score,
      COALESCE(ts.best_score, 0) AS trivia_best_score,
      COALESCE(ss.best_score, 0) AS sequence_best_score,
      (COALESCE(ms.best_score, 0) + COALESCE(ts.best_score, 0) + COALESCE(ss.best_score, 0)) AS total_score
    FROM all_wallets aw
    LEFT JOIN match_scores_week ms ON ms.wallet = aw.wallet
    LEFT JOIN trivia_scores_week ts ON ts.wallet = aw.wallet
    LEFT JOIN sequence_scores_week ss ON ss.wallet = aw.wallet
  )
  SELECT
    c.wallet_address,
    c.match_best_score,
    c.trivia_best_score,
    c.sequence_best_score,
    c.total_score,
    ROW_NUMBER() OVER (ORDER BY c.total_score DESC) AS rank
  FROM combined c
  ORDER BY c.total_score DESC
  LIMIT 50;
$$;

-- ============================================
-- 4. Create function to distribute weekly rewards (called by edge function)
-- ============================================
CREATE OR REPLACE FUNCTION public.distribute_weekly_rewards(
  p_week_start date,
  p_week_end date,
  p_wallet text,
  p_placement integer,
  p_total_score bigint,
  p_ccc_amount integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Generate deterministic UUID from wallet
  v_user_id := extensions.uuid_generate_v5(
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    p_wallet
  );

  -- Check if already distributed for this week
  IF EXISTS (
    SELECT 1 FROM weekly_reward_distributions
    WHERE week_start = p_week_start AND wallet_address = p_wallet
  ) THEN
    RETURN false;
  END IF;

  -- Award CCC to user_balances
  UPDATE user_balances
  SET cctr_balance = COALESCE(cctr_balance, 0) + p_ccc_amount,
      updated_at = now()
  WHERE user_id = v_user_id;

  -- If no balance record exists, create one
  IF NOT FOUND THEN
    INSERT INTO user_balances (user_id, cctr_balance, wallet_address, updated_at)
    VALUES (v_user_id, p_ccc_amount, p_wallet, now())
    ON CONFLICT (user_id) DO UPDATE
    SET cctr_balance = COALESCE(user_balances.cctr_balance, 0) + p_ccc_amount,
        updated_at = now();
  END IF;

  -- Record CCC transaction
  INSERT INTO token_transactions (user_id, amount, transaction_type, description)
  VALUES (v_user_id, p_ccc_amount, 'weekly_reward', 
    'Weekly leaderboard reward - Place #' || p_placement || ' (Week ' || p_week_start || ')');

  -- Award cyber chest eligibility
  INSERT INTO winner_chest_eligibility (wallet_address, source_type, source_id, earned_at)
  VALUES (p_wallet, 'weekly_leaderboard', p_week_start::text || '_' || p_placement, now());

  -- Record the distribution
  INSERT INTO weekly_reward_distributions (
    week_start, week_end, wallet_address, placement, total_score,
    ccc_awarded, raffle_ticket_awarded, chest_awarded
  ) VALUES (
    p_week_start, p_week_end, p_wallet, p_placement, p_total_score,
    p_ccc_amount, true, true
  );

  RETURN true;
END;
$$;
