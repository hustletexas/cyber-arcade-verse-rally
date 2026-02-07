
-- Drop the foreign key constraint on token_transactions.user_id -> auth.users
-- This FK is incompatible with wallet-only architecture which uses deterministic UUIDs
-- that don't exist in the auth.users table
ALTER TABLE public.token_transactions 
DROP CONSTRAINT token_transactions_user_id_fkey;
