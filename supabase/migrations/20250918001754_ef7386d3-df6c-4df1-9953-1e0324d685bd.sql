-- Simply allow public access to songs table
-- Remove any restrictive policies and add a public read policy

-- First check what policies exist and drop them
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can view purchasable songs" ON public.songs;
    DROP POLICY IF EXISTS "Allow public read access to songs" ON public.songs;
EXCEPTION 
    WHEN others THEN 
        NULL; -- Ignore errors if policies don't exist
END $$;

-- Create a simple public read policy
CREATE POLICY "songs_public_read" ON public.songs 
FOR SELECT USING (true);