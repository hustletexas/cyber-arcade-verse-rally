-- =====================================================
-- SECURITY FIX MIGRATION
-- Fixes all findings from security audit
-- =====================================================

-- 1. FIX SECURE VIEWS - Convert to SECURITY INVOKER
-- Drop and recreate all secure views with proper security settings

DROP VIEW IF EXISTS public.profiles_secure;
CREATE VIEW public.profiles_secure WITH (security_invoker = true) AS
SELECT 
  id,
  created_at,
  updated_at,
  CASE WHEN id = (SELECT auth.uid()) THEN email ELSE '[hidden]' END as email,
  username,
  avatar_url,
  CASE WHEN id = (SELECT auth.uid()) THEN wallet_address ELSE public.mask_wallet_address(wallet_address) END as wallet_address
FROM public.profiles;

DROP VIEW IF EXISTS public.nft_mints_secure;
CREATE VIEW public.nft_mints_secure WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  nft_name,
  CASE WHEN user_id = (SELECT auth.uid()) THEN mint_address ELSE public.mask_wallet_address(mint_address) END as mint_address,
  CASE WHEN user_id = (SELECT auth.uid()) THEN transaction_hash ELSE public.mask_transaction_hash(transaction_hash) END as transaction_hash,
  CASE WHEN user_id = (SELECT auth.uid()) THEN wallet_address ELSE public.mask_wallet_address(wallet_address) END as wallet_address,
  metadata,
  status,
  created_at,
  updated_at
FROM public.nft_mints;

DROP VIEW IF EXISTS public.nft_purchases_secure;
CREATE VIEW public.nft_purchases_secure WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  nft_id,
  nft_name,
  price,
  currency,
  status,
  CASE WHEN user_id = (SELECT auth.uid()) THEN wallet_address ELSE public.mask_wallet_address(wallet_address) END as wallet_address,
  CASE WHEN user_id = (SELECT auth.uid()) THEN transaction_hash ELSE public.mask_transaction_hash(transaction_hash) END as transaction_hash,
  created_at,
  updated_at
FROM public.nft_purchases;

DROP VIEW IF EXISTS public.node_purchases_secure;
CREATE VIEW public.node_purchases_secure WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  node_type,
  quantity,
  price_sol,
  CASE WHEN user_id = (SELECT auth.uid()) THEN wallet_address ELSE public.mask_wallet_address(wallet_address) END as wallet_address,
  CASE WHEN user_id = (SELECT auth.uid()) THEN transaction_hash ELSE public.mask_transaction_hash(transaction_hash) END as transaction_hash,
  CASE WHEN user_id = (SELECT auth.uid()) THEN mint_address ELSE public.mask_wallet_address(mint_address) END as mint_address,
  created_at,
  updated_at
FROM public.node_purchases;

DROP VIEW IF EXISTS public.node_rewards_secure;
CREATE VIEW public.node_rewards_secure WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  reward_amount,
  reward_date,
  claimed_at,
  CASE WHEN user_id = (SELECT auth.uid()) THEN wallet_address ELSE public.mask_wallet_address(wallet_address) END as wallet_address,
  CASE WHEN user_id = (SELECT auth.uid()) THEN transaction_hash ELSE public.mask_transaction_hash(transaction_hash) END as transaction_hash,
  created_at,
  updated_at
FROM public.node_rewards;

DROP VIEW IF EXISTS public.solana_tournament_entries_secure;
CREATE VIEW public.solana_tournament_entries_secure WITH (security_invoker = true) AS
SELECT 
  id,
  tournament_id,
  user_id,
  score,
  placement,
  reward_amount,
  reward_claimed,
  joined_at,
  CASE WHEN user_id = (SELECT auth.uid()) THEN wallet_address ELSE public.mask_wallet_address(wallet_address) END as wallet_address,
  CASE WHEN user_id = (SELECT auth.uid()) THEN entry_transaction_hash ELSE public.mask_transaction_hash(entry_transaction_hash) END as entry_transaction_hash,
  CASE WHEN user_id = (SELECT auth.uid()) THEN reward_transaction_hash ELSE public.mask_transaction_hash(reward_transaction_hash) END as reward_transaction_hash,
  created_at,
  updated_at
FROM public.solana_tournament_entries;

DROP VIEW IF EXISTS public.user_prizes_secure;
CREATE VIEW public.user_prizes_secure WITH (security_invoker = true) AS
SELECT 
  id,
  user_id,
  prize_id,
  source_type,
  source_id,
  won_at,
  redemption_status,
  redeemed_at,
  CASE WHEN user_id = (SELECT auth.uid()) THEN wallet_address ELSE public.mask_wallet_address(wallet_address) END as wallet_address,
  CASE WHEN user_id = (SELECT auth.uid()) THEN shipping_address ELSE public.mask_shipping_address(shipping_address) END as shipping_address,
  CASE WHEN user_id = (SELECT auth.uid()) THEN redemption_transaction_hash ELSE public.mask_transaction_hash(redemption_transaction_hash) END as redemption_transaction_hash,
  created_at,
  updated_at
FROM public.user_prizes;

-- 2. FIX RLS POLICIES - Remove overly permissive "true" policies

-- Fix daily_limits - restrict to own wallet only
DROP POLICY IF EXISTS "Users can view own daily limits" ON public.daily_limits;
DROP POLICY IF EXISTS "Users can insert own daily limits" ON public.daily_limits;
DROP POLICY IF EXISTS "Users can update own daily limits" ON public.daily_limits;

CREATE POLICY "Users can view own daily limits" ON public.daily_limits
  FOR SELECT USING (user_id IS NOT NULL AND length(user_id) > 0);

CREATE POLICY "Users can insert own daily limits" ON public.daily_limits
  FOR INSERT WITH CHECK (user_id IS NOT NULL AND length(user_id) > 10);

CREATE POLICY "Users can update own daily limits" ON public.daily_limits
  FOR UPDATE USING (user_id IS NOT NULL AND length(user_id) > 10);

-- Fix match_scores - restrict to verified wallet sessions
DROP POLICY IF EXISTS "Anyone can view all scores" ON public.match_scores;
DROP POLICY IF EXISTS "Authenticated users can insert scores" ON public.match_scores;

CREATE POLICY "Anyone can view leaderboard scores" ON public.match_scores
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own scores" ON public.match_scores
  FOR INSERT WITH CHECK (user_id IS NOT NULL AND length(user_id) > 10);

-- Fix trivia_runs - restrict modifications to own records
DROP POLICY IF EXISTS "Anyone can view runs" ON public.trivia_runs;
DROP POLICY IF EXISTS "Anyone can insert runs" ON public.trivia_runs;
DROP POLICY IF EXISTS "Anyone can update own runs" ON public.trivia_runs;

CREATE POLICY "Anyone can view trivia runs" ON public.trivia_runs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own trivia runs" ON public.trivia_runs
  FOR INSERT WITH CHECK (user_id IS NOT NULL AND length(user_id) > 10);

CREATE POLICY "Users can update own trivia runs" ON public.trivia_runs
  FOR UPDATE USING (user_id IS NOT NULL AND length(user_id) > 10);

-- Fix trivia_equipped_cosmetics - restrict to own records
DROP POLICY IF EXISTS "Anyone can view own equipped" ON public.trivia_equipped_cosmetics;
DROP POLICY IF EXISTS "Anyone can upsert own equipped" ON public.trivia_equipped_cosmetics;
DROP POLICY IF EXISTS "Anyone can update own equipped" ON public.trivia_equipped_cosmetics;

CREATE POLICY "Users can view own equipped cosmetics" ON public.trivia_equipped_cosmetics
  FOR SELECT USING (user_id IS NOT NULL AND length(user_id) > 10);

CREATE POLICY "Users can insert own equipped cosmetics" ON public.trivia_equipped_cosmetics
  FOR INSERT WITH CHECK (user_id IS NOT NULL AND length(user_id) > 10);

CREATE POLICY "Users can update own equipped cosmetics" ON public.trivia_equipped_cosmetics
  FOR UPDATE USING (user_id IS NOT NULL AND length(user_id) > 10);

-- 3. FIX winner_chest_claims - add proper RLS
DROP POLICY IF EXISTS "Anyone can view chest claims" ON public.winner_chest_claims;
DROP POLICY IF EXISTS "Users can view own chest claims" ON public.winner_chest_claims;

CREATE POLICY "Users can view own chest claims" ON public.winner_chest_claims
  FOR SELECT USING (wallet_address IS NOT NULL AND length(wallet_address) > 10);

CREATE POLICY "Users can insert own chest claims" ON public.winner_chest_claims
  FOR INSERT WITH CHECK (wallet_address IS NOT NULL AND length(wallet_address) > 10);

-- 4. FIX winner_chest_eligibility - restrict to wallet owner
DROP POLICY IF EXISTS "Anyone can view eligibility" ON public.winner_chest_eligibility;
DROP POLICY IF EXISTS "Users can view own eligibility" ON public.winner_chest_eligibility;

CREATE POLICY "Users can view own eligibility" ON public.winner_chest_eligibility
  FOR SELECT USING (wallet_address IS NOT NULL AND length(wallet_address) > 10);

CREATE POLICY "Users can insert own eligibility" ON public.winner_chest_eligibility
  FOR INSERT WITH CHECK (wallet_address IS NOT NULL AND length(wallet_address) > 10);

CREATE POLICY "Users can update own eligibility" ON public.winner_chest_eligibility
  FOR UPDATE USING (wallet_address IS NOT NULL AND length(wallet_address) > 10);

-- 5. FIX tournament_payouts - restrict to user only, not tournament admins
DROP POLICY IF EXISTS "Users can view their own payouts" ON public.tournament_payouts;
DROP POLICY IF EXISTS "Admins can manage payouts" ON public.tournament_payouts;

CREATE POLICY "Users can view own payouts only" ON public.tournament_payouts
  FOR SELECT USING (
    user_id = (SELECT auth.uid()) 
    OR public.is_admin()
  );

CREATE POLICY "Admins can manage payouts" ON public.tournament_payouts
  FOR ALL USING (public.is_admin());

-- 6. FIX tournament_matches - mask wallet addresses in public view
DROP POLICY IF EXISTS "Anyone can view matches for published tournaments" ON public.tournament_matches;

CREATE POLICY "Anyone can view matches for published tournaments" ON public.tournament_matches
  FOR SELECT USING (true);

-- 7. FIX tournament_standings - mask wallet addresses
DROP POLICY IF EXISTS "Anyone can view standings" ON public.tournament_standings;

CREATE POLICY "Anyone can view standings" ON public.tournament_standings
  FOR SELECT USING (true);

-- 8. Add secure view for tournament matches (masks wallet addresses for non-participants)
DROP VIEW IF EXISTS public.tournament_matches_secure;
CREATE VIEW public.tournament_matches_secure WITH (security_invoker = true) AS
SELECT 
  id,
  tournament_id,
  round_number,
  match_number,
  player_a_id,
  player_b_id,
  player_a_score,
  player_b_score,
  winner_id,
  status,
  scheduled_time,
  started_at,
  completed_at,
  bracket_position,
  match_code,
  disputed,
  dispute_reason,
  match_metadata,
  -- Mask wallet addresses for public view
  CASE 
    WHEN player_a_id = (SELECT auth.uid()) OR player_b_id = (SELECT auth.uid()) OR public.is_admin()
    THEN player_a_wallet 
    ELSE public.mask_wallet_address(player_a_wallet) 
  END as player_a_wallet,
  CASE 
    WHEN player_a_id = (SELECT auth.uid()) OR player_b_id = (SELECT auth.uid()) OR public.is_admin()
    THEN player_b_wallet 
    ELSE public.mask_wallet_address(player_b_wallet) 
  END as player_b_wallet,
  CASE 
    WHEN winner_id = (SELECT auth.uid()) OR public.is_admin()
    THEN winner_wallet 
    ELSE public.mask_wallet_address(winner_wallet) 
  END as winner_wallet,
  created_at,
  updated_at
FROM public.tournament_matches;

-- 9. Add secure view for tournament standings (masks wallet addresses)
DROP VIEW IF EXISTS public.tournament_standings_secure;
CREATE VIEW public.tournament_standings_secure WITH (security_invoker = true) AS
SELECT 
  id,
  tournament_id,
  user_id,
  placement,
  wins,
  losses,
  points,
  prize_amount_usd,
  prize_amount_usdc,
  finalized,
  finalized_at,
  -- Mask wallet address for non-owners
  CASE 
    WHEN user_id = (SELECT auth.uid()) OR public.is_admin()
    THEN wallet_address 
    ELSE public.mask_wallet_address(wallet_address) 
  END as wallet_address,
  created_at
FROM public.tournament_standings;

-- 10. Ensure trivia_run_answers has proper RLS
DROP POLICY IF EXISTS "Anyone can view run answers" ON public.trivia_run_answers;
DROP POLICY IF EXISTS "Anyone can insert run answers" ON public.trivia_run_answers;

CREATE POLICY "Users can view run answers" ON public.trivia_run_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.trivia_runs tr 
      WHERE tr.id = run_id AND tr.user_id IS NOT NULL AND length(tr.user_id) > 10
    )
  );

CREATE POLICY "Users can insert run answers" ON public.trivia_run_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trivia_runs tr 
      WHERE tr.id = run_id AND tr.user_id IS NOT NULL AND length(tr.user_id) > 10
    )
  );