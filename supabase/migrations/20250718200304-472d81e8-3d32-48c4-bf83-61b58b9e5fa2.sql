
-- Create tournaments table for Solana tournament system
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  format TEXT NOT NULL CHECK (format IN ('top_5_split', 'winner_takes_all')),
  entry_fee DECIMAL(10,4) NOT NULL DEFAULT 0,
  prize_pool DECIMAL(10,4) NOT NULL DEFAULT 0,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  admin_wallet TEXT NOT NULL,
  max_players INTEGER NOT NULL DEFAULT 100,
  current_players INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entries table for tournament participants
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  wallet TEXT NOT NULL,
  epic_name TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  kills INTEGER NOT NULL DEFAULT 0,
  placement INTEGER,
  screenshot_url TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for tournaments
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

-- Anyone can view tournaments
CREATE POLICY "Anyone can view tournaments" 
  ON public.tournaments 
  FOR SELECT 
  USING (true);

-- Only admins can create tournaments (we'll handle this in the app logic)
CREATE POLICY "Admins can create tournaments" 
  ON public.tournaments 
  FOR INSERT 
  WITH CHECK (true);

-- Only admins can update tournaments
CREATE POLICY "Admins can update tournaments" 
  ON public.tournaments 
  FOR UPDATE 
  USING (true);

-- Only admins can delete tournaments
CREATE POLICY "Admins can delete tournaments" 
  ON public.tournaments 
  FOR DELETE 
  USING (true);

-- Add RLS policies for entries
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Anyone can view entries
CREATE POLICY "Anyone can view entries" 
  ON public.entries 
  FOR SELECT 
  USING (true);

-- Users can insert their own entries
CREATE POLICY "Users can insert entries" 
  ON public.entries 
  FOR INSERT 
  WITH CHECK (true);

-- Users can update their own entries
CREATE POLICY "Users can update their entries" 
  ON public.entries 
  FOR UPDATE 
  USING (true);

-- Admins can delete entries
CREATE POLICY "Admins can delete entries" 
  ON public.entries 
  FOR DELETE 
  USING (true);

-- Create function to complete tournament and distribute prizes
CREATE OR REPLACE FUNCTION public.complete_tournament(tournament_id_param UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  -- Update tournament status to completed
  UPDATE public.tournaments 
  SET status = 'completed', updated_at = now()
  WHERE id = tournament_id_param;
  
  -- Here you could add logic to calculate and assign placements
  -- based on scores, but for now we'll keep it simple
END;
$function$;
