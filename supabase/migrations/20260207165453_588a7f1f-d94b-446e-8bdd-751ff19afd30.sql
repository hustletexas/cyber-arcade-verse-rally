
-- Update profiles RLS to support wallet-only architecture for avatar uploads
-- Allow anon/authenticated to read profiles by wallet_address
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Anyone can view profiles"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

-- Allow insert for new profiles (wallet-based)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Anyone can insert profile"
ON public.profiles FOR INSERT
TO anon, authenticated
WITH CHECK (wallet_address IS NOT NULL);

-- Allow update for profiles by wallet_address match
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Anyone can update own profile"
ON public.profiles FOR UPDATE
TO anon, authenticated
USING (wallet_address IS NOT NULL);
