
-- Fix the SECURITY DEFINER view issue
-- Drop and recreate as SECURITY INVOKER (default)
DROP VIEW IF EXISTS public.profiles_public;

CREATE VIEW public.profiles_public 
WITH (security_invoker = true)
AS
SELECT 
  id,
  username,
  avatar_url,
  wallet_address,
  CASE 
    WHEN id = auth.uid() THEN email
    ELSE NULL
  END AS email,
  created_at,
  updated_at
FROM public.profiles;

GRANT SELECT ON public.profiles_public TO anon, authenticated;
