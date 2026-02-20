
-- ============================================================
-- FIX 4: user_points - "Users can view own points" uses USING(true)
-- ============================================================
DROP POLICY IF EXISTS "Users can view own points" ON public.user_points;

CREATE POLICY "Users can view own points"
ON public.user_points
FOR SELECT
TO authenticated
USING (
  user_id = public.get_current_wallet_address()
);

-- ============================================================
-- FIX 5: winner_chest_eligibility - only checks wallet length, not ownership
-- ============================================================
DROP POLICY IF EXISTS "Users can view own eligibility by wallet" ON public.winner_chest_eligibility;

CREATE POLICY "Users can view own eligibility by wallet"
ON public.winner_chest_eligibility
FOR SELECT
TO authenticated
USING (
  wallet_address = public.get_current_wallet_address()
);

DROP POLICY IF EXISTS "Users can update own eligibility" ON public.winner_chest_eligibility;

CREATE POLICY "Users can update own eligibility"
ON public.winner_chest_eligibility
FOR UPDATE
TO authenticated
USING (
  wallet_address = public.get_current_wallet_address()
);

-- ============================================================
-- FIX 6: winner_chest_claims - only checks wallet length, not ownership
-- ============================================================
DROP POLICY IF EXISTS "Users can view own chest claims" ON public.winner_chest_claims;

CREATE POLICY "Users can view own chest claims"
ON public.winner_chest_claims
FOR SELECT
TO authenticated
USING (
  wallet_address = public.get_current_wallet_address()
);

DROP POLICY IF EXISTS "Users can insert own chest claims" ON public.winner_chest_claims;

CREATE POLICY "Users can insert own chest claims"
ON public.winner_chest_claims
FOR INSERT
TO authenticated
WITH CHECK (
  wallet_address = public.get_current_wallet_address()
);

-- ============================================================
-- FIX 7: match_scores - only checks length, not ownership
-- ============================================================
DROP POLICY IF EXISTS "Users can view own scores" ON public.match_scores;

CREATE POLICY "Users can view own scores"
ON public.match_scores
FOR SELECT
TO authenticated
USING (
  user_id = public.get_current_wallet_address()
);

DROP POLICY IF EXISTS "Users can insert own scores" ON public.match_scores;

CREATE POLICY "Users can insert own scores"
ON public.match_scores
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = public.get_current_wallet_address()
);

-- ============================================================
-- FIX 8: trivia_user_cosmetics - only checks length, not ownership
-- ============================================================
DROP POLICY IF EXISTS "Users can view own cosmetics" ON public.trivia_user_cosmetics;

CREATE POLICY "Users can view own cosmetics"
ON public.trivia_user_cosmetics
FOR SELECT
TO authenticated
USING (
  user_id = public.get_current_wallet_address()
);

DROP POLICY IF EXISTS "Users can insert own cosmetics" ON public.trivia_user_cosmetics;

CREATE POLICY "Users can insert own cosmetics"
ON public.trivia_user_cosmetics
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = public.get_current_wallet_address()
);
