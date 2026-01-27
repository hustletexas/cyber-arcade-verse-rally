-- Fix overly permissive RLS policies on user_balances table
-- Remove the public access policies that were incorrectly added

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Users can view balance by wallet" ON public.user_balances;
DROP POLICY IF EXISTS "Anyone can create balance by wallet" ON public.user_balances;
DROP POLICY IF EXISTS "Allow balance updates via RPC" ON public.user_balances;

-- Create restrictive policies for user_balances
-- Users can only view their own balance (by user_id or wallet_address)
CREATE POLICY "Users can view own balance only" 
ON public.user_balances 
FOR SELECT 
USING (
  (user_id = (SELECT auth.uid())) 
  OR (wallet_address IS NOT NULL AND wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address')
);

-- Only allow inserts via SECURITY DEFINER functions (the handle_new_user trigger)
-- Block direct inserts from users
CREATE POLICY "No direct balance inserts" 
ON public.user_balances 
FOR INSERT 
WITH CHECK (false);

-- Block all direct updates - force use of SECURITY DEFINER functions
CREATE POLICY "No direct balance updates - use functions" 
ON public.user_balances 
FOR UPDATE 
USING (false);

-- Fix profiles table to ensure users can only view their own profile
-- First drop any overly permissive policies if they exist
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;

-- Ensure users can only view their own profile (protects email)
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (id = (SELECT auth.uid()));

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (id = (SELECT auth.uid()));

-- Admins can view all profiles for support purposes
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.is_admin());