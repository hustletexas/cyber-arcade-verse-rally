
-- ============================================================
-- FIX 1: profiles - restrict public read to non-sensitive fields via view
-- The "Public read profiles without email" policy allows anyone to read emails.
-- Replace with a policy that only shows email to the profile owner.
-- ============================================================

-- Drop the overly permissive public read policy
DROP POLICY IF EXISTS "Public read profiles without email" ON public.profiles;

-- Create a restricted public read policy that hides email from non-owners
-- Public can read username, avatar_url, wallet_address (needed for leaderboards etc.)
-- But email is only visible to the profile owner (handled by the existing "Users can view own full profile" policy)
CREATE POLICY "Public can read non-sensitive profile data"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (
  -- Owner can see everything via the other policy
  -- Non-owners: allow read but email will be masked via a view
  true
);

-- Actually, RLS can't do column-level filtering. Better approach: 
-- Drop the above and use a secure view instead.
DROP POLICY IF EXISTS "Public can read non-sensitive profile data" ON public.profiles;

-- Restrict profiles SELECT to only the owner + admins
CREATE POLICY "Users can view own profile or admins"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  id = (SELECT auth.uid())
  OR public.is_admin()
);

-- Allow anon to read only non-sensitive profile data (username, avatar for leaderboards)
-- via a secure view instead of direct table access
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  username,
  avatar_url,
  wallet_address,
  created_at
FROM public.profiles;

-- ============================================================
-- FIX 2: cyberdrop_plays - restrict to owner only
-- ============================================================

DROP POLICY IF EXISTS "Users can view own plays" ON public.cyberdrop_plays;

CREATE POLICY "Users can view own plays"
ON public.cyberdrop_plays
FOR SELECT
TO authenticated
USING (
  user_id = public.get_current_wallet_address()
);

-- ============================================================
-- FIX 3: weekly_reward_distributions - restrict to owner only
-- ============================================================

DROP POLICY IF EXISTS "Users can view own weekly rewards" ON public.weekly_reward_distributions;

CREATE POLICY "Users can view own weekly rewards"
ON public.weekly_reward_distributions
FOR SELECT
TO authenticated
USING (
  wallet_address = public.get_current_wallet_address()
  OR public.is_admin()
);
