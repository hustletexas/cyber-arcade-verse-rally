-- Fix security findings: profiles RLS and profiles_secure RLS

-- 1. Drop the overly permissive "Admins can view all profiles" policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- 2. Ensure profiles table only allows users to see their own profile
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Create strict own-profile-only SELECT policy
CREATE POLICY "Users can view own profile only"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Admin access via security definer function for support purposes
CREATE POLICY "Admins can view all profiles securely"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.has_role((SELECT auth.uid()), 'admin'));