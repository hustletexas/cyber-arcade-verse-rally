-- Fix Race Condition in Balance Operations
-- Add CHECK constraint to prevent negative balances
ALTER TABLE public.user_balances 
ADD CONSTRAINT positive_cctr_balance CHECK (cctr_balance >= 0);

-- Fix purchase_song function with atomic balance check
CREATE OR REPLACE FUNCTION public.purchase_song(song_id_param uuid, user_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  song_record RECORD;
  purchase_id UUID;
  rows_updated INTEGER;
BEGIN
  IF auth.uid() != user_id_param THEN
    RAISE EXCEPTION 'Unauthorized: Cannot purchase songs for other users';
  END IF;

  -- Rate limit: max 20 song purchases per hour
  IF NOT public.check_rate_limit('purchase_song', 20, 3600) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded. Please try again later.');
  END IF;

  SELECT * INTO song_record FROM public.songs WHERE id = song_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Song not found');
  END IF;
  
  IF NOT song_record.is_purchasable THEN
    RETURN json_build_object('success', false, 'error', 'Song is not available for purchase');
  END IF;
  
  IF song_record.is_free THEN
    INSERT INTO public.user_song_purchases (user_id, song_id, purchase_price)
    VALUES (user_id_param, song_id_param, 0)
    RETURNING id INTO purchase_id;
    
    RETURN json_build_object('success', true, 'purchase_id', purchase_id, 'cost', 0);
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM public.user_song_purchases 
    WHERE user_id = user_id_param AND song_id = song_id_param
  ) THEN
    RETURN json_build_object('success', false, 'error', 'You already own this song');
  END IF;
  
  -- ATOMIC: Deduct balance only if sufficient funds exist
  UPDATE public.user_balances 
  SET cctr_balance = cctr_balance - song_record.price_cctr,
      updated_at = now()
  WHERE user_id = user_id_param 
    AND cctr_balance >= song_record.price_cctr;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  IF rows_updated = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient CCTR balance');
  END IF;
  
  INSERT INTO public.user_song_purchases (user_id, song_id, purchase_price)
  VALUES (user_id_param, song_id_param, song_record.price_cctr)
  RETURNING id INTO purchase_id;
  
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
  
  UPDATE public.songs 
  SET play_count = play_count + 1,
      updated_at = now()
  WHERE id = song_id_param;
  
  RETURN json_build_object(
    'success', true, 
    'purchase_id', purchase_id, 
    'cost', song_record.price_cctr,
    'song_title', song_record.title
  );
END;
$$;

-- Fix purchase_nft_with_cctr function with atomic balance check
CREATE OR REPLACE FUNCTION public.purchase_nft_with_cctr(nft_id_param text, nft_name_param text, price_param integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_updated INTEGER;
  new_balance INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 10 NFT purchases per hour
  IF NOT public.check_rate_limit('purchase_nft_with_cctr', 10, 3600) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded. Please try again later.');
  END IF;

  IF price_param <= 0 OR price_param > 1000000 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid price');
  END IF;

  IF nft_id_param IS NULL OR length(nft_id_param) > 255 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid NFT ID');
  END IF;

  IF nft_name_param IS NULL OR length(nft_name_param) > 255 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid NFT name');
  END IF;

  -- ATOMIC: Deduct balance only if sufficient funds exist
  UPDATE public.user_balances
  SET 
    cctr_balance = cctr_balance - price_param,
    updated_at = now()
  WHERE user_id = auth.uid()
    AND cctr_balance >= price_param
  RETURNING cctr_balance INTO new_balance;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  IF rows_updated = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient CCTR balance');
  END IF;

  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    description
  ) VALUES (
    auth.uid(),
    -price_param,
    'nft_purchase',
    'NFT Purchase: ' || nft_name_param
  );

  RETURN json_build_object(
    'success', true, 
    'price_paid', price_param,
    'remaining_balance', new_balance
  );
END;
$$;

-- Fix deduct_trivia_entry_fee function with atomic balance check
CREATE OR REPLACE FUNCTION public.deduct_trivia_entry_fee(category_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  entry_fee INTEGER := 1;
  rows_updated INTEGER;
  new_balance INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Rate limit: max 15 trivia entries per hour
  IF NOT public.check_rate_limit('deduct_trivia_entry_fee', 15, 3600) THEN
    RETURN json_build_object('success', false, 'error', 'Rate limit exceeded. Please try again later.');
  END IF;

  IF category_param IS NULL OR length(category_param) > 100 THEN
    RETURN json_build_object('success', false, 'error', 'Invalid category');
  END IF;

  -- ATOMIC: Deduct balance only if sufficient funds exist
  UPDATE public.user_balances
  SET 
    cctr_balance = cctr_balance - entry_fee,
    updated_at = now()
  WHERE user_id = auth.uid()
    AND cctr_balance >= entry_fee
  RETURNING cctr_balance INTO new_balance;
  
  GET DIAGNOSTICS rows_updated = ROW_COUNT;
  
  IF rows_updated = 0 THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient CCTR balance');
  END IF;

  INSERT INTO public.token_transactions (
    user_id,
    amount,
    transaction_type,
    description
  ) VALUES (
    auth.uid(),
    -entry_fee,
    'trivia_entry',
    category_param || ' trivia game entry fee'
  );

  RETURN json_build_object(
    'success', true, 
    'deducted', entry_fee,
    'remaining_balance', new_balance
  );
END;
$$;