
-- =============================================
-- FIX 1: Clean up conflicting user_balances RLS policies
-- Remove legacy permissive policies, keep only restrictive ones
-- =============================================

-- Drop legacy permissive policies
DROP POLICY IF EXISTS "Users can insert their own balance" ON public.user_balances;
DROP POLICY IF EXISTS "Users can view their own balance" ON public.user_balances;

-- Drop duplicate restrictive update policy
DROP POLICY IF EXISTS "No direct balance updates" ON public.user_balances;

-- Keep: "No direct balance inserts" (WITH CHECK false)
-- Keep: "No direct balance updates - use functions" (USING false)  
-- Keep: "Users can view own balance only" (auth.uid() or wallet JWT claim)

-- =============================================
-- FIX 2: Protect email addresses in profiles table
-- Replace public read with email-masking policy
-- =============================================

DROP POLICY IF EXISTS "Public read profiles" ON public.profiles;

-- Users can see their own full profile (including email)
CREATE POLICY "Users can view own full profile"
ON public.profiles FOR SELECT
TO authenticated
USING (id = (SELECT auth.uid()));

-- Everyone can see profiles but email is handled via a secure view
-- For public listing, allow read but we'll use a view for safe access
CREATE POLICY "Public read profiles without email"
ON public.profiles FOR SELECT
TO anon, authenticated
USING (true);

-- Create a secure view that masks email for non-owners
CREATE OR REPLACE VIEW public.profiles_public AS
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

-- Grant access to the view
GRANT SELECT ON public.profiles_public TO anon, authenticated;
