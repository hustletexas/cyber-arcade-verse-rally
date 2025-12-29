-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view own rate limits" ON public.rate_limits;

-- Recreate with optimized auth function call
CREATE POLICY "Users can view own rate limits" 
ON public.rate_limits 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);