-- Update chat_messages RLS policy to allow wallet-authenticated users
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.chat_messages;

CREATE POLICY "Wallet authenticated users can insert messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL) OR 
  (user_id LIKE 'wallet-%' AND user_id IS NOT NULL)
);