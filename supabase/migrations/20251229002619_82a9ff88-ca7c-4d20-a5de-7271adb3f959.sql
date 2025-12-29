-- Consolidate chat_messages INSERT policies into a single clear policy

DROP POLICY IF EXISTS "Authenticated users can insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Wallet users can insert messages via profile" ON chat_messages;

-- Single consolidated INSERT policy
CREATE POLICY "Authenticated users can insert their own messages" ON chat_messages
FOR INSERT
WITH CHECK (
  (SELECT auth.uid()) IS NOT NULL 
  AND (SELECT auth.uid()) = user_id
);