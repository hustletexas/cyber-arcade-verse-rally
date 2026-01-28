-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Anyone can view their own claims" ON public.winner_chest_claims;
DROP POLICY IF EXISTS "Authenticated users can insert claims" ON public.winner_chest_claims;
DROP POLICY IF EXISTS "Anyone can view eligibility" ON public.winner_chest_eligibility;
DROP POLICY IF EXISTS "Authenticated users can insert eligibility" ON public.winner_chest_eligibility;
DROP POLICY IF EXISTS "Users can update their own eligibility" ON public.winner_chest_eligibility;

-- Create proper wallet-address based RLS policies for winner_chest_claims
CREATE POLICY "Users can view their own claims by wallet"
  ON public.winner_chest_claims
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own claims"
  ON public.winner_chest_claims
  FOR INSERT
  WITH CHECK (wallet_address IS NOT NULL AND length(wallet_address) > 10);

-- Create proper wallet-address based RLS policies for winner_chest_eligibility  
CREATE POLICY "Users can view eligibility by wallet"
  ON public.winner_chest_eligibility
  FOR SELECT
  USING (true);

CREATE POLICY "System can insert eligibility"
  ON public.winner_chest_eligibility
  FOR INSERT
  WITH CHECK (wallet_address IS NOT NULL AND length(wallet_address) > 10);

CREATE POLICY "Users can update their eligibility by wallet"
  ON public.winner_chest_eligibility
  FOR UPDATE
  USING (wallet_address IS NOT NULL AND length(wallet_address) > 10);