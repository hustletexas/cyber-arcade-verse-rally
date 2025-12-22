-- Fix token_transactions: Prevent NULL user_id transactions from being viewed
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.token_transactions;
CREATE POLICY "Users can view their own transactions" 
ON public.token_transactions 
FOR SELECT 
USING (user_id IS NOT NULL AND auth.uid() = user_id);

-- Fix chat_messages: Strengthen wallet authentication to prevent forgery
-- Remove the weak policy and add a stricter one
DROP POLICY IF EXISTS "Wallet authenticated users can insert messages" ON public.chat_messages;

-- Only allow authenticated users to insert messages with their own user_id
CREATE POLICY "Authenticated users can insert their own messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Add policy for wallet-authenticated users (verified via profiles table)
CREATE POLICY "Wallet users can insert messages via profile" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND wallet_address IS NOT NULL
  )
);