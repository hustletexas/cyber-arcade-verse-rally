
-- Create tournaments table
CREATE TABLE public.tournaments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  format text NOT NULL CHECK (format IN ('top_5_split', 'winner_takes_all')),
  entry_fee numeric NOT NULL DEFAULT 0,
  prize_pool numeric NOT NULL DEFAULT 0,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  admin_wallet text NOT NULL,
  max_players integer DEFAULT 100,
  current_players integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create entries table
CREATE TABLE public.entries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  wallet text NOT NULL,
  epic_name text NOT NULL,
  score integer DEFAULT 0,
  kills integer DEFAULT 0,
  placement integer,
  screenshot_url text,
  approved boolean DEFAULT false,
  submitted_at timestamp with time zone DEFAULT now(),
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, wallet)
);

-- Create payouts table
CREATE TABLE public.payouts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id uuid REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  wallet text NOT NULL,
  amount numeric NOT NULL,
  tx_hash text,
  placement integer NOT NULL,
  payout_percentage numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tournaments
CREATE POLICY "Anyone can view tournaments" 
  ON public.tournaments 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage tournaments" 
  ON public.tournaments 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for entries
CREATE POLICY "Anyone can view approved entries" 
  ON public.entries 
  FOR SELECT 
  USING (approved = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can create their own entries" 
  ON public.entries 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own entries" 
  ON public.entries 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- RLS Policies for payouts
CREATE POLICY "Users can view their own payouts" 
  ON public.payouts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage payouts" 
  ON public.payouts 
  FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Create function to calculate and create payouts
CREATE OR REPLACE FUNCTION public.calculate_tournament_payouts(tournament_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tournament_record RECORD;
  entry_record RECORD;
  total_prize numeric;
  payout_amount numeric;
  payout_percentage numeric;
BEGIN
  -- Get tournament details
  SELECT * INTO tournament_record 
  FROM public.tournaments 
  WHERE id = tournament_id_param;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tournament not found';
  END IF;
  
  total_prize := tournament_record.prize_pool;
  
  -- Calculate payouts based on format
  FOR entry_record IN 
    SELECT * FROM public.entries 
    WHERE tournament_id = tournament_id_param 
    AND approved = true 
    AND placement IS NOT NULL
    ORDER BY placement ASC
  LOOP
    -- Calculate payout percentage based on format and placement
    IF tournament_record.format = 'winner_takes_all' THEN
      IF entry_record.placement = 1 THEN
        payout_percentage := 100;
      ELSE
        payout_percentage := 0;
      END IF;
    ELSIF tournament_record.format = 'top_5_split' THEN
      CASE entry_record.placement
        WHEN 1 THEN payout_percentage := 40;
        WHEN 2 THEN payout_percentage := 25;
        WHEN 3 THEN payout_percentage := 15;
        WHEN 4 THEN payout_percentage := 12;
        WHEN 5 THEN payout_percentage := 8;
        ELSE payout_percentage := 0;
      END CASE;
    END IF;
    
    payout_amount := (total_prize * payout_percentage / 100);
    
    -- Insert payout record if amount > 0
    IF payout_amount > 0 THEN
      INSERT INTO public.payouts (
        tournament_id, 
        wallet, 
        amount, 
        placement, 
        payout_percentage
      ) VALUES (
        tournament_id_param,
        entry_record.wallet,
        payout_amount,
        entry_record.placement,
        payout_percentage
      );
    END IF;
  END LOOP;
END;
$$;

-- Create function to update tournament status
CREATE OR REPLACE FUNCTION public.complete_tournament(tournament_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update tournament status
  UPDATE public.tournaments 
  SET status = 'completed', 
      end_time = now(),
      updated_at = now()
  WHERE id = tournament_id_param;
  
  -- Calculate payouts
  PERFORM public.calculate_tournament_payouts(tournament_id_param);
END;
$$;
