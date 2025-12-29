-- Consolidate room_participants policies to avoid multiple permissive SELECT policies

DROP POLICY IF EXISTS "Users can manage their own participation" ON room_participants;
DROP POLICY IF EXISTS "Users can view participants in active rooms" ON room_participants;

-- Single SELECT policy that covers both cases
CREATE POLICY "Users can view participants in active rooms" ON room_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM chat_rooms cr
    WHERE cr.id = room_participants.room_id AND cr.is_active = true
  )
);

-- Separate policies for INSERT, UPDATE, DELETE on own records
CREATE POLICY "Users can insert their own participation" ON room_participants
FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own participation" ON room_participants
FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own participation" ON room_participants
FOR DELETE
USING ((SELECT auth.uid()) = user_id);