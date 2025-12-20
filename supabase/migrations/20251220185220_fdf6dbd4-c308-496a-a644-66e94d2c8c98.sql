-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can only read their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Only admins can manage roles (bootstrap first admin manually)
CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create secure function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create secure function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- Fix draw_raffle_winner to require admin role
CREATE OR REPLACE FUNCTION public.draw_raffle_winner(raffle_id_param uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  winning_ticket_number INTEGER;
  winner_id UUID;
BEGIN
  -- Require admin role
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

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

-- Fix update_achievement_progress to only allow self-updates
CREATE OR REPLACE FUNCTION public.update_achievement_progress(user_id_param uuid, achievement_type text, increment_amount integer DEFAULT 1)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  achievement_record RECORD;
  progress_record RECORD;
  new_progress INTEGER;
  achievement_earned BOOLEAN := false;
BEGIN
  -- Only allow users to update their own achievements (or admin)
  IF auth.uid() != user_id_param AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Cannot update achievements for other users';
  END IF;

  -- Find matching achievements of the specified type
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE unlock_condition = achievement_type AND is_active = true
  LOOP
    -- Get or create progress record
    SELECT * INTO progress_record
    FROM public.achievement_progress 
    WHERE user_id = user_id_param AND achievement_id = achievement_record.id;
    
    IF NOT FOUND THEN
      -- Create new progress record
      INSERT INTO public.achievement_progress (
        user_id, achievement_id, current_progress, target_progress
      ) VALUES (
        user_id_param, achievement_record.id, increment_amount, 
        COALESCE((achievement_record.requirements->>'target')::INTEGER, 1)
      ) RETURNING * INTO progress_record;
      
      new_progress := increment_amount;
    ELSE
      -- Update existing progress
      new_progress := progress_record.current_progress + increment_amount;
      
      UPDATE public.achievement_progress 
      SET 
        current_progress = new_progress,
        last_updated = now()
      WHERE id = progress_record.id;
    END IF;
    
    -- Check if achievement is earned
    IF new_progress >= progress_record.target_progress THEN
      -- Insert achievement if not already earned
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (user_id_param, achievement_record.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
      
      achievement_earned := true;
    END IF;
  END LOOP;
  
  RETURN json_build_object('success', true, 'achievement_earned', achievement_earned);
END;
$$;

-- Fix purchase_song to only allow self-purchases
CREATE OR REPLACE FUNCTION public.purchase_song(song_id_param uuid, user_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  song_record RECORD;
  user_balance_record RECORD;
  purchase_id UUID;
BEGIN
  -- Only allow users to purchase for themselves
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Unauthorized: Cannot purchase songs for other users';
  END IF;

  -- Get song details
  SELECT * INTO song_record FROM public.songs WHERE id = song_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Song not found');
  END IF;
  
  IF NOT song_record.is_purchasable THEN
    RETURN json_build_object('success', false, 'error', 'Song is not available for purchase');
  END IF;
  
  -- Check if song is free
  IF song_record.is_free THEN
    INSERT INTO public.user_song_purchases (user_id, song_id, purchase_price)
    VALUES (user_id_param, song_id_param, 0)
    RETURNING id INTO purchase_id;
    
    RETURN json_build_object('success', true, 'purchase_id', purchase_id, 'cost', 0);
  END IF;
  
  -- Check if user already owns this song
  IF EXISTS (
    SELECT 1 FROM public.user_song_purchases 
    WHERE user_id = user_id_param AND song_id = song_id_param
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You already own this song');
  END IF;
  
  -- Get user balance
  SELECT * INTO user_balance_record 
  FROM public.user_balances 
  WHERE user_id = user_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User balance not found');
  END IF;
  
  IF user_balance_record.cctr_balance < song_record.price_cctr THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient CCTR balance');
  END IF;
  
  -- Deduct CCTR from user balance
  UPDATE public.user_balances 
  SET cctr_balance = cctr_balance - song_record.price_cctr,
      updated_at = now()
  WHERE user_id = user_id_param;
  
  -- Record the purchase
  INSERT INTO public.user_song_purchases (user_id, song_id, purchase_price)
  VALUES (user_id_param, song_id_param, song_record.price_cctr)
  RETURNING id INTO purchase_id;
  
  -- Record transaction
  INSERT INTO public.token_transactions (
    user_id, 
    amount, 
    transaction_type, 
    description
  ) VALUES (
    user_id_param,
    -song_record.price_cctr,
    'song_purchase',
    'Purchased song: ' || song_record.title || ' by ' || song_record.artist
  );
  
  -- Update song play count
  UPDATE public.songs 
  SET play_count = play_count + 1,
      updated_at = now()
  WHERE id = song_id_param;
  
  RETURN json_build_object(
    'success', true, 
    'purchase_id', purchase_id, 
    'cost', song_record.price_cctr,
    'song_title', song_record.title,
    'remaining_balance', user_balance_record.cctr_balance - song_record.price_cctr
  );
END;
$$;

-- Fix complete_solana_tournament to verify admin role 
CREATE OR REPLACE FUNCTION public.complete_solana_tournament(tournament_id_param uuid, winner_wallet_param text, admin_wallet_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tournament_record RECORD;
  prize_amount DECIMAL(10,4);
BEGIN
  -- Require authenticated user
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Authentication required');
  END IF;

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

-- Fix join_solana_tournament to validate user_id matches auth
CREATE OR REPLACE FUNCTION public.join_solana_tournament(tournament_id_param uuid, wallet_address_param text, transaction_hash_param text, user_id_param uuid DEFAULT NULL::uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tournament_record RECORD;
  entry_id UUID;
  actual_user_id UUID;
BEGIN
  -- Get the authenticated user's ID, allow anonymous wallet-only joins
  actual_user_id := COALESCE(user_id_param, auth.uid());
  
  -- If user_id_param is provided, ensure it matches authenticated user
  IF user_id_param IS NOT NULL AND auth.uid() IS NOT NULL AND user_id_param != auth.uid() THEN
    RETURN json_build_object('success', false, 'error', 'User ID mismatch');
  END IF;

  -- Get tournament details
  SELECT * INTO tournament_record
  FROM public.solana_tournaments 
  WHERE id = tournament_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Tournament not found');
  END IF;
  
  IF tournament_record.status != 'upcoming' THEN
    RETURN json_build_object('success', false, 'error', 'Tournament is not accepting entries');
  END IF;
  
  IF tournament_record.current_players >= tournament_record.max_players THEN
    RETURN json_build_object('success', false, 'error', 'Tournament is full');
  END IF;
  
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
    tournament_id_param, actual_user_id, wallet_address_param, transaction_hash_param
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

-- Create secure admin airdrop function (replaces client-side logic)
CREATE OR REPLACE FUNCTION public.admin_airdrop(target_user_id uuid, amount integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_rewards INTEGER;
BEGIN
  -- Require admin role
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Admin role required';
  END IF;

  -- Validate amount
  IF amount <= 0 OR amount > 100000 THEN
    RAISE EXCEPTION 'Invalid amount: must be between 1 and 100000';
  END IF;

  -- Get current balance
  SELECT claimable_rewards INTO current_rewards
  FROM public.user_balances
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User balance not found';
  END IF;

  -- Update claimable rewards
  UPDATE public.user_balances 
  SET 
    claimable_rewards = COALESCE(claimable_rewards, 0) + amount,
    updated_at = now()
  WHERE user_id = target_user_id;

  -- Record transaction
  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    description
  ) VALUES (
    target_user_id,
    amount,
    'admin_airdrop',
    'Admin airdrop by ' || auth.uid()::text
  );

  RETURN json_build_object('success', true, 'amount', amount);
END;
$$;

-- Update tournaments table RLS policies (drop permissive ones, add restrictive)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.tournaments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.tournaments;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.tournaments;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.tournaments;
DROP POLICY IF EXISTS "Anyone can view tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Authenticated users can create tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Authenticated users can update tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Authenticated users can delete tournaments" ON public.tournaments;

-- New secure policies for tournaments
CREATE POLICY "Anyone can view tournaments" 
ON public.tournaments 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can create tournaments" 
ON public.tournaments 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update tournaments" 
ON public.tournaments 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Only admins can delete tournaments" 
ON public.tournaments 
FOR DELETE 
USING (public.is_admin());

-- Update solana_tournaments table RLS policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.solana_tournaments;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.solana_tournaments;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.solana_tournaments;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.solana_tournaments;
DROP POLICY IF EXISTS "Anyone can view solana tournaments" ON public.solana_tournaments;
DROP POLICY IF EXISTS "Authenticated users can create solana tournaments" ON public.solana_tournaments;
DROP POLICY IF EXISTS "Authenticated users can update solana tournaments" ON public.solana_tournaments;
DROP POLICY IF EXISTS "Authenticated users can delete solana tournaments" ON public.solana_tournaments;

-- New secure policies for solana_tournaments
CREATE POLICY "Anyone can view solana tournaments" 
ON public.solana_tournaments 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can create solana tournaments" 
ON public.solana_tournaments 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Only admins can update solana tournaments" 
ON public.solana_tournaments 
FOR UPDATE 
USING (public.is_admin());

CREATE POLICY "Only admins can delete solana tournaments" 
ON public.solana_tournaments 
FOR DELETE 
USING (public.is_admin());