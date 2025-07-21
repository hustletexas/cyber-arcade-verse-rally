
-- Create Solana tournaments table
CREATE TABLE public.solana_tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  entry_fee DECIMAL(10,4) NOT NULL DEFAULT 0.1,
  prize_pool DECIMAL(10,4) NOT NULL DEFAULT 0,
  max_players INTEGER NOT NULL DEFAULT 32,
  current_players INTEGER NOT NULL DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  winner_wallet TEXT,
  admin_wallet TEXT NOT NULL,
  program_id TEXT NOT NULL,
  tournament_account TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament entries table
CREATE TABLE public.solana_tournament_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.solana_tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  wallet_address TEXT NOT NULL,
  entry_transaction_hash TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  score INTEGER DEFAULT 0,
  placement INTEGER,
  reward_amount DECIMAL(10,4) DEFAULT 0,
  reward_claimed BOOLEAN DEFAULT false,
  reward_transaction_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, wallet_address)
);

-- Add RLS policies for solana_tournaments
ALTER TABLE public.solana_tournaments ENABLE ROW LEVEL SECURITY;

-- Anyone can view tournaments
CREATE POLICY "Anyone can view tournaments" 
  ON public.solana_tournaments 
  FOR SELECT 
  USING (true);

-- Only authenticated users can create tournaments (admin check in app)
CREATE POLICY "Authenticated users can create tournaments" 
  ON public.solana_tournaments 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Only tournament admin can update tournaments
CREATE POLICY "Admin can update tournaments" 
  ON public.solana_tournaments 
  FOR UPDATE 
  TO authenticated
  USING (admin_wallet = auth.jwt() ->> 'wallet_address' OR auth.jwt() ->> 'role' = 'admin');

-- Add RLS policies for solana_tournament_entries
ALTER TABLE public.solana_tournament_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can view entries
CREATE POLICY "Anyone can view entries" 
  ON public.solana_tournament_entries 
  FOR SELECT 
  USING (true);

-- Users can insert their own entries
CREATE POLICY "Users can insert entries" 
  ON public.solana_tournament_entries 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Users can update their own entries
CREATE POLICY "Users can update own entries" 
  ON public.solana_tournament_entries 
  FOR UPDATE 
  TO authenticated
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'admin');

-- Function to join tournament with player limit check
CREATE OR REPLACE FUNCTION public.join_solana_tournament(
  tournament_id_param UUID,
  wallet_address_param TEXT,
  transaction_hash_param TEXT,
  user_id_param UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tournament_record RECORD;
  entry_id UUID;
  result JSON;
BEGIN
  -- Get tournament details
  SELECT * INTO tournament_record
  FROM public.solana_tournaments 
  WHERE id = tournament_id_param;
  
  -- Check if tournament exists
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Tournament not found');
  END IF;
  
  -- Check if tournament is accepting entries
  IF tournament_record.status != 'upcoming' THEN
    RETURN json_build_object('success', false, 'error', 'Tournament is not accepting entries');
  END IF;
  
  -- Check player limit
  IF tournament_record.current_players >= tournament_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Tournament is full');
  END IF;
  
  -- Check if wallet already joined
  IF EXISTS (
    SELECT 1 FROM public.solana_tournament_entries 
    WHERE tournament_id = tournament_id_param AND wallet_address = wallet_address_param
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Wallet already joined this tournament');
  END IF;
  
  -- Insert entry
  INSERT INTO public.solana_tournament_entries (
    tournament_id, user_id, wallet_address, entry_transaction_hash
  ) VALUES (
    tournament_id_param, user_id_param, wallet_address_param, transaction_hash_param
  ) RETURNING id INTO entry_id;
  
  -- Update tournament player count and prize pool
  UPDATE public.solana_tournaments 
  SET 
    current_players = current_players + 1,
    prize_pool = prize_pool + entry_fee,
    updated_at = now()
  WHERE id = tournament_id_param;
  
  RETURN json_build_object('success', true, 'entry_id', entry_id);
END;
$$;

-- Function to complete tournament and set winner
CREATE OR REPLACE FUNCTION public.complete_solana_tournament(
  tournament_id_param UUID,
  winner_wallet_param TEXT,
  admin_wallet_param TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tournament_record RECORD;
  prize_amount DECIMAL(10,4);
BEGIN
  -- Get tournament details
  SELECT * INTO tournament_record
  FROM public.solana_tournaments 
  WHERE id = tournament_id_param;
  
  -- Check if tournament exists and admin has permission
  IF NOT FOUND OR tournament_record.admin_wallet != admin_wallet_param THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized or tournament not found');
  END IF;
  
  -- Calculate winner's prize (90% of prize pool, 10% goes to admin)
  prize_amount := tournament_record.prize_pool * 0.9;
  
  -- Update tournament status and winner
  UPDATE public.solana_tournaments 
  SET 
    status = 'completed',
    winner_wallet = winner_wallet_param,
    end_time = now(),
    updated_at = now()
  WHERE id = tournament_id_param;
  
  -- Update winner's entry with reward
  UPDATE public.solana_tournament_entries 
  SET 
    placement = 1,
    reward_amount = prize_amount,
    updated_at = now()
  WHERE tournament_id = tournament_id_param AND wallet_address = winner_wallet_param;
  
  RETURN json_build_object('success', true, 'prize_amount', prize_amount);
END;
$$;
