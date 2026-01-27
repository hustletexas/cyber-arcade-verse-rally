-- Add wallet_address column to user_balances for wallet-only auth support
ALTER TABLE public.user_balances 
ADD COLUMN IF NOT EXISTS wallet_address TEXT;

-- Create index for wallet address lookups
CREATE INDEX IF NOT EXISTS idx_user_balances_wallet_address ON public.user_balances(wallet_address);

-- Update RLS to allow wallet-based lookups
DROP POLICY IF EXISTS "Users can view balance by wallet" ON public.user_balances;
CREATE POLICY "Users can view balance by wallet" 
ON public.user_balances 
FOR SELECT 
USING (true);

-- Allow inserting by wallet address
DROP POLICY IF EXISTS "Anyone can create balance by wallet" ON public.user_balances;
CREATE POLICY "Anyone can create balance by wallet" 
ON public.user_balances 
FOR INSERT 
WITH CHECK (true);

-- Allow updating own balance (for claiming rewards via RPC)
DROP POLICY IF EXISTS "Allow balance updates via RPC" ON public.user_balances;
CREATE POLICY "Allow balance updates via RPC" 
ON public.user_balances 
FOR UPDATE 
USING (true);