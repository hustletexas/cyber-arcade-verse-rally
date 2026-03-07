-- Fix user_points: drop existing policies first, then recreate
DROP POLICY IF EXISTS "Users can view own points" ON public.user_points;
DROP POLICY IF EXISTS "System can manage points" ON public.user_points;
DROP POLICY IF EXISTS "Authenticated users can insert points" ON public.user_points;
DROP POLICY IF EXISTS "Authenticated users can update points" ON public.user_points;

CREATE POLICY "Users can view own points"
  ON public.user_points FOR SELECT
  TO authenticated
  USING (true);
CREATE POLICY "Authenticated users can insert points"
  ON public.user_points FOR INSERT
  TO authenticated
  WITH CHECK (true);
CREATE POLICY "Authenticated users can update points"
  ON public.user_points FOR UPDATE
  TO authenticated
  USING (true);