-- Remove duplicate profile SELECT policy
DROP POLICY IF EXISTS "Users can view own full profile" ON public.profiles;