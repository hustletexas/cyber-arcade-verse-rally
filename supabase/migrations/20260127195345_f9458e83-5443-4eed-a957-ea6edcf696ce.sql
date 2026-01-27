-- Create tournament format enum
CREATE TYPE public.tournament_format AS ENUM ('single_elimination', 'double_elimination', 'round_robin', 'swiss');

-- Create tournament status enum  
CREATE TYPE public.tournament_status AS ENUM ('draft', 'published', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled');

-- Create payout schema enum
CREATE TYPE public.payout_schema AS ENUM ('winner_takes_all', 'top_3', 'top_5', 'top_10', 'custom');

-- Create match status enum
CREATE TYPE public.match_status AS ENUM ('pending', 'in_progress', 'completed', 'disputed', 'cancelled');

-- Tournaments table
CREATE TABLE public.arcade_tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  game TEXT NOT NULL,
  format tournament_format NOT NULL DEFAULT 'single_elimination',
  max_players INTEGER NOT NULL DEFAULT 32,
  min_players INTEGER NOT NULL DEFAULT 2,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  entry_fee_usd NUMERIC(10,2) DEFAULT 0,
  entry_fee_usdc NUMERIC(10,7) DEFAULT 0,
  prize_pool_usd NUMERIC(10,2) DEFAULT 0,
  payout_schema payout_schema NOT NULL DEFAULT 'top_3',
  custom_payout_percentages JSONB,
  requires_pass BOOLEAN DEFAULT false,
  required_pass_tier TEXT,
  status tournament_status NOT NULL DEFAULT 'draft',
  rules TEXT,
  bracket_data JSONB,
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tournament registrations
CREATE TABLE public.tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.arcade_tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  payment_transaction_id TEXT,
  pass_verified BOOLEAN DEFAULT false,
  pass_tier TEXT,
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  seed_number INTEGER,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Tournament matches
CREATE TABLE public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.arcade_tournaments(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  bracket_position TEXT,
  player_a_id UUID REFERENCES auth.users(id),
  player_a_wallet TEXT,
  player_b_id UUID REFERENCES auth.users(id),
  player_b_wallet TEXT,
  player_a_score INTEGER,
  player_b_score INTEGER,
  winner_id UUID REFERENCES auth.users(id),
  winner_wallet TEXT,
  status match_status DEFAULT 'pending',
  match_code TEXT,
  scheduled_time TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  reported_by UUID REFERENCES auth.users(id),
  reported_at TIMESTAMP WITH TIME ZONE,
  disputed BOOLEAN DEFAULT false,
  dispute_reason TEXT,
  match_metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tournament standings
CREATE TABLE public.tournament_standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.arcade_tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  placement INTEGER NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  prize_amount_usd NUMERIC(10,2) DEFAULT 0,
  prize_amount_usdc NUMERIC(10,7) DEFAULT 0,
  finalized BOOLEAN DEFAULT false,
  finalized_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Tournament payouts
CREATE TABLE public.tournament_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.arcade_tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  wallet_address TEXT NOT NULL,
  placement INTEGER NOT NULL,
  amount_usd NUMERIC(10,2) DEFAULT 0,
  amount_usdc NUMERIC(10,7) DEFAULT 0,
  payout_method TEXT,
  status TEXT DEFAULT 'pending',
  transaction_hash TEXT,
  attestation_hash TEXT,
  nonce TEXT,
  deadline TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(tournament_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.arcade_tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_standings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_payouts ENABLE ROW LEVEL SECURITY;

-- Arcade Tournaments policies
CREATE POLICY "Anyone can view published tournaments" ON public.arcade_tournaments
  FOR SELECT USING (status != 'draft' OR admin_id = (SELECT auth.uid()));

CREATE POLICY "Admins can create tournaments" ON public.arcade_tournaments
  FOR INSERT WITH CHECK (public.is_admin() OR admin_id = (SELECT auth.uid()));

CREATE POLICY "Admins can update their tournaments" ON public.arcade_tournaments
  FOR UPDATE USING (public.is_admin() OR admin_id = (SELECT auth.uid()));

CREATE POLICY "Admins can delete their tournaments" ON public.arcade_tournaments
  FOR DELETE USING (public.is_admin() OR admin_id = (SELECT auth.uid()));

-- Registration policies
CREATE POLICY "Users can view registrations for published tournaments" ON public.tournament_registrations
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR 
    EXISTS (SELECT 1 FROM public.arcade_tournaments t WHERE t.id = tournament_id AND (t.admin_id = (SELECT auth.uid()) OR public.is_admin()))
  );

CREATE POLICY "Users can register for tournaments" ON public.tournament_registrations
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update their own registration" ON public.tournament_registrations
  FOR UPDATE USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- Match policies
CREATE POLICY "Anyone can view matches for published tournaments" ON public.tournament_matches
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage matches" ON public.tournament_matches
  FOR ALL USING (
    public.is_admin() OR 
    EXISTS (SELECT 1 FROM public.arcade_tournaments t WHERE t.id = tournament_id AND t.admin_id = (SELECT auth.uid()))
  );

-- Standings policies  
CREATE POLICY "Anyone can view standings" ON public.tournament_standings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage standings" ON public.tournament_standings
  FOR ALL USING (
    public.is_admin() OR 
    EXISTS (SELECT 1 FROM public.arcade_tournaments t WHERE t.id = tournament_id AND t.admin_id = (SELECT auth.uid()))
  );

-- Payout policies
CREATE POLICY "Users can view their own payouts" ON public.tournament_payouts
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) OR 
    public.is_admin() OR
    EXISTS (SELECT 1 FROM public.arcade_tournaments t WHERE t.id = tournament_id AND t.admin_id = (SELECT auth.uid()))
  );

CREATE POLICY "Admins can manage payouts" ON public.tournament_payouts
  FOR ALL USING (
    public.is_admin() OR 
    EXISTS (SELECT 1 FROM public.arcade_tournaments t WHERE t.id = tournament_id AND t.admin_id = (SELECT auth.uid()))
  );

-- Create indexes for performance
CREATE INDEX idx_arcade_tournaments_status ON public.arcade_tournaments(status);
CREATE INDEX idx_arcade_tournaments_start_time ON public.arcade_tournaments(start_time);
CREATE INDEX idx_tournament_registrations_tournament ON public.tournament_registrations(tournament_id);
CREATE INDEX idx_tournament_matches_tournament ON public.tournament_matches(tournament_id);
CREATE INDEX idx_tournament_standings_tournament ON public.tournament_standings(tournament_id);
CREATE INDEX idx_tournament_payouts_tournament ON public.tournament_payouts(tournament_id);

-- Trigger for updated_at
CREATE TRIGGER update_arcade_tournaments_updated_at
  BEFORE UPDATE ON public.arcade_tournaments
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();

CREATE TRIGGER update_tournament_matches_updated_at
  BEFORE UPDATE ON public.tournament_matches
  FOR EACH ROW EXECUTE FUNCTION public.set_timestamp_updated_at();