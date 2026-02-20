
-- Create reward_claims table for tracking all reward claims
CREATE TABLE public.reward_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'tournament', 'weekly_leaderboard', 'achievement', 'raffle', etc.
  source_id TEXT NOT NULL,   -- tournament_id, week identifier, achievement_id, etc.
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'CCC', -- 'CCC', 'XLM', 'USDC'
  status TEXT NOT NULL DEFAULT 'approved', -- 'approved', 'paid', 'rejected', 'expired'
  claim_reason TEXT, -- why they're eligible (e.g. "1st place - Tournament X")
  admin_notes TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Prevent double claims: one claim per user per source
  CONSTRAINT unique_claim_per_source UNIQUE (user_id, source_type, source_id)
);

-- Enable RLS
ALTER TABLE public.reward_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users can view own claims"
  ON public.reward_claims
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only server-side (edge functions via service role) can insert/update
-- No direct insert/update/delete policies for regular users
-- Admins can view all claims
CREATE POLICY "Admins can view all claims"
  ON public.reward_claims
  FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can update claims"
  ON public.reward_claims
  FOR UPDATE
  USING (public.is_admin());

-- Index for fast lookups
CREATE INDEX idx_reward_claims_user ON public.reward_claims (user_id);
CREATE INDEX idx_reward_claims_source ON public.reward_claims (source_type, source_id);
CREATE INDEX idx_reward_claims_status ON public.reward_claims (status);

-- Timestamp trigger
CREATE TRIGGER update_reward_claims_updated_at
  BEFORE UPDATE ON public.reward_claims
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
