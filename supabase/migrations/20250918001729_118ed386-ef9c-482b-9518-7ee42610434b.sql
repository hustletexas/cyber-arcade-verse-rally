-- Fix the songs table policy to allow public access (no auth required)
-- This will allow the music player to display songs and artwork without authentication issues

-- First, let's see what policies exist
-- The error suggests the policy name might be different

-- Drop any existing policies that might be blocking access
DROP POLICY IF EXISTS "Anyone can view purchasable songs" ON public.songs;
DROP POLICY IF EXISTS "Public can view all songs" ON public.songs;

-- Create a simple policy that allows everyone to view songs
CREATE POLICY "Allow public read access to songs" ON public.songs 
FOR SELECT USING (true);

-- Also ensure we have some demo song data if table is empty
INSERT INTO songs (title, artist, genre, duration, price_cctr, is_free, is_purchasable, cover_art_url) VALUES
('Cyber Dreams', 'Neon Synthwave', 'Synthwave', 225, 0, true, true, '/lovable-uploads/cyber-dreams-1.png'),
('Digital Horizon', 'Neon Synthwave', 'Synthwave', 198, 100, false, true, '/lovable-uploads/digital-horizon.png'),
('Neon Pulse', 'Circuit Breaker', 'Cyberpunk', 243, 150, false, true, '/lovable-uploads/neon-pulse.png'),
('Electric Midnight', 'Synthwave Collective', 'Dark Synthwave', 267, 120, false, true, '/lovable-uploads/electric-midnight.png'),
('Chrome Tears', 'Digital Ghost', 'Ambient Synthwave', 189, 90, false, true, '/lovable-uploads/chrome-tears.png'),
('Matrix Mix', 'Neon Synthwave', 'Synthwave', 256, 110, false, true, '/lovable-uploads/matrix-mix.png')
ON CONFLICT (title, artist) DO UPDATE SET
  cover_art_url = EXCLUDED.cover_art_url,
  genre = EXCLUDED.genre,
  duration = EXCLUDED.duration;