-- Create table to track winner chest claims (1 free chest per winner per wallet)
CREATE TABLE public.winner_chest_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'game' or 'tournament'
  source_id TEXT NOT NULL, -- game name or tournament id
  claimed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reward_type TEXT,
  reward_value TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wallet_address, source_type, source_id)
);

-- Create table to track winner eligibility (granted when they win)
CREATE TABLE public.winner_chest_eligibility (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'game' or 'tournament'  
  source_id TEXT NOT NULL, -- game name or tournament id
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wallet_address, source_type, source_id)
);

-- Enable RLS
ALTER TABLE public.winner_chest_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winner_chest_eligibility ENABLE ROW LEVEL SECURITY;

-- RLS policies for winner_chest_claims
CREATE POLICY "Anyone can view their own claims"
  ON public.winner_chest_claims
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert claims"
  ON public.winner_chest_claims
  FOR INSERT
  WITH CHECK (true);

-- RLS policies for winner_chest_eligibility  
CREATE POLICY "Anyone can view eligibility"
  ON public.winner_chest_eligibility
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert eligibility"
  ON public.winner_chest_eligibility
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own eligibility"
  ON public.winner_chest_eligibility
  FOR UPDATE
  USING (true);