
-- Create raffles table
CREATE TABLE public.raffles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  prize_type TEXT NOT NULL CHECK (prize_type IN ('nft', 'physical', 'token')),
  prize_name TEXT NOT NULL,
  prize_value INTEGER NOT NULL, -- in cents or token amount
  prize_image TEXT,
  ticket_price INTEGER NOT NULL DEFAULT 100, -- in CCTR tokens
  max_tickets INTEGER NOT NULL DEFAULT 1000,
  tickets_sold INTEGER NOT NULL DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended', 'cancelled')),
  winner_user_id UUID REFERENCES auth.users,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create raffle tickets table
CREATE TABLE public.raffle_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  raffle_id UUID NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(raffle_id, ticket_number)
);

-- Create token purchases table
CREATE TABLE public.token_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- CCTR tokens purchased
  payment_method TEXT NOT NULL CHECK (payment_method IN ('paypal', 'usdc', 'crypto')),
  payment_amount DECIMAL(10,2) NOT NULL, -- Amount paid in USD or crypto
  payment_currency TEXT NOT NULL DEFAULT 'USD',
  stripe_session_id TEXT,
  crypto_transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for raffles
ALTER TABLE public.raffles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active raffles" 
  ON public.raffles 
  FOR SELECT 
  USING (status = 'active' OR status = 'ended');

-- Add RLS policies for raffle tickets
ALTER TABLE public.raffle_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets" 
  ON public.raffle_tickets 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own tickets" 
  ON public.raffle_tickets 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Add RLS policies for token purchases
ALTER TABLE public.token_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own purchases" 
  ON public.token_purchases 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own purchases" 
  ON public.token_purchases 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

-- Create function to automatically draw raffle winner
CREATE OR REPLACE FUNCTION public.draw_raffle_winner(raffle_id_param UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  winning_ticket_number INTEGER;
  winner_id UUID;
BEGIN
  -- Get random ticket number
  SELECT FLOOR(RANDOM() * tickets_sold) + 1 INTO winning_ticket_number
  FROM public.raffles 
  WHERE id = raffle_id_param;
  
  -- Get winner user_id
  SELECT user_id INTO winner_id
  FROM public.raffle_tickets 
  WHERE raffle_id = raffle_id_param 
    AND ticket_number = winning_ticket_number;
  
  -- Update raffle with winner
  UPDATE public.raffles 
  SET winner_user_id = winner_id, 
      status = 'ended',
      updated_at = now()
  WHERE id = raffle_id_param;
  
  RETURN winner_id;
END;
$$;
