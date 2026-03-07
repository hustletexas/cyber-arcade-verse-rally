-- Fix remaining overly permissive INSERT policies

-- galaxy_scores: restrict to authenticated owner
DROP POLICY IF EXISTS "Users can insert own galaxy scores" ON public.galaxy_scores;
DROP POLICY IF EXISTS "Authenticated users can insert galaxy scores" ON public.galaxy_scores;
CREATE POLICY "Authenticated users can insert galaxy scores"
  ON public.galaxy_scores FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid())::text);

-- pinball_scores: restrict to authenticated owner
DROP POLICY IF EXISTS "Anyone can insert pinball scores" ON public.pinball_scores;
DROP POLICY IF EXISTS "Authenticated users can insert pinball scores" ON public.pinball_scores;
CREATE POLICY "Authenticated users can insert pinball scores"
  ON public.pinball_scores FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid())::text);

-- user_points: tighten INSERT/UPDATE
DROP POLICY IF EXISTS "Authenticated users can insert points" ON public.user_points;
CREATE POLICY "Authenticated users can insert own points"
  ON public.user_points FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Authenticated users can update points" ON public.user_points;
CREATE POLICY "Authenticated users can update own points"
  ON public.user_points FOR UPDATE
  TO authenticated
  USING (user_id = (SELECT auth.uid())::text);