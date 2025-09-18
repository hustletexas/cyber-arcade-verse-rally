-- Enable email auth provider (this might need to be done in Supabase dashboard)
-- But first let's check if we have any auth issues in our functions

-- Ensure RLS policies allow proper access for authenticated users
-- Update existing policies if needed

-- Check songs table policy
ALTER POLICY "Anyone can view purchasable songs" ON public.songs 
RENAME TO "Anyone can view songs";

-- Make songs viewable without authentication to fix display issues
DROP POLICY IF EXISTS "Anyone can view songs" ON public.songs;
CREATE POLICY "Public can view all songs" ON public.songs 
FOR SELECT USING (true);