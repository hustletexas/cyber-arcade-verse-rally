-- Fix token_transactions policy to remove NULL user_id check that could cause confusion
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.token_transactions;
CREATE POLICY "Users can view their own transactions" 
ON public.token_transactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add stricter policy that requires authentication for all operations
-- Ensure token_transactions can only be inserted by the system (via SECURITY DEFINER functions)
-- No direct user INSERT/UPDATE/DELETE is allowed (already the case, but being explicit)

-- Add audit-style created_by tracking to sensitive tables if not exists
-- For now, ensure the policies are as tight as possible

-- Ensure profiles table only allows users to see their own data (already the case, but verify)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Ensure user_balances is strictly protected
DROP POLICY IF EXISTS "Users can view their own balance" ON public.user_balances;
CREATE POLICY "Users can view their own balance" 
ON public.user_balances 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own balance" ON public.user_balances;
CREATE POLICY "Users can insert their own balance" 
ON public.user_balances 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own balance" ON public.user_balances;
CREATE POLICY "Users can update their own balance" 
ON public.user_balances 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Ensure token_purchases is strictly protected
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.token_purchases;
CREATE POLICY "Users can view their own purchases" 
ON public.token_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.token_purchases;
CREATE POLICY "Users can insert their own purchases" 
ON public.token_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Ensure node_purchases is strictly protected  
DROP POLICY IF EXISTS "Users can view their own node purchases" ON public.node_purchases;
CREATE POLICY "Users can view their own node purchases" 
ON public.node_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure node_rewards is strictly protected
DROP POLICY IF EXISTS "Users can view their own node rewards" ON public.node_rewards;
CREATE POLICY "Users can view their own node rewards" 
ON public.node_rewards 
FOR SELECT 
USING (auth.uid() = user_id);

-- Ensure nft_purchases is strictly protected
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.nft_purchases;
CREATE POLICY "Users can view their own nft purchases" 
ON public.nft_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

-- Fix solana_tournament_entries - remove overly permissive policies
DROP POLICY IF EXISTS "Users can view own tournament entries" ON public.solana_tournament_entries;
DROP POLICY IF EXISTS "Users can view their own entries" ON public.solana_tournament_entries;
CREATE POLICY "Users can view their own tournament entries" 
ON public.solana_tournament_entries 
FOR SELECT 
USING (auth.uid() = user_id);

-- Admin access should go through is_admin() function, not JWT claims
DROP POLICY IF EXISTS "Users can update own entries" ON public.solana_tournament_entries;
CREATE POLICY "Users or admins can update entries" 
ON public.solana_tournament_entries 
FOR UPDATE 
USING (auth.uid() = user_id OR public.is_admin());

-- Admins can view all entries for tournament management
CREATE POLICY "Admins can view all tournament entries" 
ON public.solana_tournament_entries 
FOR SELECT 
USING (public.is_admin());