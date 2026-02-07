
-- Drop ALL remaining old auth-based policies on profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can insert profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can update own profile" ON public.profiles;

-- Create clean wallet-based policies
CREATE POLICY "Public read profiles"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Wallet insert profile"
ON public.profiles FOR INSERT
TO anon, authenticated
WITH CHECK (wallet_address IS NOT NULL);

CREATE POLICY "Wallet update profile"
ON public.profiles FOR UPDATE
TO anon, authenticated
USING (wallet_address IS NOT NULL);

-- Make email column nullable so wallet-only users can create profiles
ALTER TABLE public.profiles ALTER COLUMN email DROP NOT NULL;

-- Add unique constraint on wallet_address for upsert to work
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_wallet_address_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_wallet_address_key UNIQUE (wallet_address);
  END IF;
END $$;
