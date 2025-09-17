-- Create songs table for purchasable music tracks
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER, -- in seconds
  price_cctr INTEGER NOT NULL DEFAULT 100,
  audio_url TEXT,
  cover_art_url TEXT,
  genre TEXT,
  release_date DATE,
  is_purchasable BOOLEAN NOT NULL DEFAULT true,
  is_free BOOLEAN NOT NULL DEFAULT false,
  play_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

-- Create policy for viewing songs
CREATE POLICY "Anyone can view purchasable songs" 
ON public.songs 
FOR SELECT 
USING (is_purchasable = true);

-- Create user song purchases table
CREATE TABLE public.user_song_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  song_id UUID NOT NULL REFERENCES public.songs(id),
  purchase_price INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure users can't buy the same song twice
  UNIQUE(user_id, song_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_song_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies for user song purchases
CREATE POLICY "Users can insert their own song purchases" 
ON public.user_song_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own song purchases" 
ON public.user_song_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to handle song purchases
CREATE OR REPLACE FUNCTION public.purchase_song(
  song_id_param UUID,
  user_id_param UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  song_record RECORD;
  user_balance_record RECORD;
  purchase_id UUID;
BEGIN
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
    -- Insert purchase record with 0 cost
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
  
  -- Check if user has enough CCTR
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
  
  -- Update song play count (optional)
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

-- Insert some sample songs for the Cyber City Radio
INSERT INTO public.songs (title, artist, album, duration, price_cctr, genre, is_purchasable, is_free, cover_art_url) VALUES
('Neon Dreams', 'Synthwave Collective', 'Cyber City Nights', 240, 100, 'Synthwave', true, false, '/lovable-uploads/synthwave1.jpg'),
('Digital Highway', 'Chrome Vector', 'Electric Future', 195, 100, 'Cyberpunk', true, false, '/lovable-uploads/cyberpunk1.jpg'),
('Retro Arcade', 'Pixel Sound', '8-Bit Memories', 180, 100, 'Chiptune', true, false, '/lovable-uploads/chiptune1.jpg'),
('Cyber City Anthem', 'Radio Station', 'Station Classics', 220, 0, 'Synthwave', true, true, '/lovable-uploads/anthem.jpg'),
('Binary Sunset', 'Data Stream', 'Virtual Reality', 300, 100, 'Ambient', true, false, '/lovable-uploads/ambient1.jpg'),
('Laser Grid', 'Neon Warrior', 'Combat Protocol', 165, 100, 'Industrial', true, false, '/lovable-uploads/industrial1.jpg'),
('Matrix Rain', 'Code Runner', 'System Override', 210, 100, 'Techno', true, false, '/lovable-uploads/techno1.jpg'),
('Hologram Love', 'Virtual Romance', 'Digital Hearts', 250, 100, 'Synthpop', true, false, '/lovable-uploads/synthpop1.jpg');

-- Create trigger for updating timestamps
CREATE TRIGGER update_songs_updated_at
BEFORE UPDATE ON public.songs
FOR EACH ROW
EXECUTE FUNCTION public.set_timestamp_updated_at();

CREATE TRIGGER update_user_song_purchases_updated_at
BEFORE UPDATE ON public.user_song_purchases
FOR EACH ROW
EXECUTE FUNCTION public.set_timestamp_updated_at();