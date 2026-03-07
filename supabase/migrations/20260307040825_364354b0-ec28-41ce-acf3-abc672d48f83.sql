-- Fix public views that expose sensitive data

-- 1. Drop the unsafe public_profiles view (exposes raw wallet_address)
DROP VIEW IF EXISTS public.public_profiles;

-- 2. Recreate public_profiles with masked wallet address
CREATE VIEW public.public_profiles 
WITH (security_invoker = true) AS
SELECT 
  id,
  username,
  avatar_url,
  mask_wallet_address(wallet_address) AS wallet_address,
  created_at
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO authenticated;

-- 3. Revoke anon from profiles_public too (if not already done)
REVOKE ALL ON public.profiles_public FROM anon;