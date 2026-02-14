
-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create rewards_ledger table
CREATE TABLE public.rewards_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  reward_name TEXT NOT NULL,
  reward_source TEXT NOT NULL,
  requirement TEXT,
  reward_type TEXT NOT NULL DEFAULT 'badge',
  status TEXT NOT NULL DEFAULT 'claimable',
  description TEXT,
  unlock_info TEXT,
  icon TEXT DEFAULT '🏆',
  expires_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rewards_ledger ENABLE ROW LEVEL SECURITY;

-- Users can only view their own rewards
CREATE POLICY "Users can view own rewards"
ON public.rewards_ledger FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Users can update their own rewards (for claiming)
CREATE POLICY "Users can update own rewards"
ON public.rewards_ledger FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

-- System/admin can insert rewards
CREATE POLICY "System can insert rewards"
ON public.rewards_ledger FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id OR is_admin());

-- Timestamp trigger
CREATE TRIGGER update_rewards_ledger_updated_at
BEFORE UPDATE ON public.rewards_ledger
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
