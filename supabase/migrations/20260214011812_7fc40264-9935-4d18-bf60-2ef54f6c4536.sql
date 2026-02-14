
-- Fix overly permissive INSERT policy on portal_breaker_scores
-- Currently allows anyone to insert any record with WITH CHECK (true)
DROP POLICY IF EXISTS "Users can insert their own portal breaker scores" ON public.portal_breaker_scores;

CREATE POLICY "Users can insert their own portal breaker scores"
ON public.portal_breaker_scores
FOR INSERT
WITH CHECK (
  user_id = (SELECT public.get_current_wallet_address())
  OR user_id = auth.uid()::text
);
