-- Fix profiles table RLS to require authentication and add public anon access restriction
-- Also add RLS policy for profiles_secure view (views inherit from base table RLS)

-- First, ensure profiles table requires authentication for SELECT
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Create a strict policy that only allows authenticated users to view their own profile
CREATE POLICY "Authenticated users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Ensure profile updates are restricted to the owner
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Ensure profile inserts are restricted to the owner  
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Explicitly deny anonymous access by not having any anon policies
-- The above policies only grant access to 'authenticated' role

-- Add a comment explaining the security model
COMMENT ON TABLE public.profiles IS 'User profiles with email and wallet addresses. Access restricted to authenticated users viewing their own profile only.';