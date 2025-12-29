-- Drop duplicate SELECT policy on songs

DROP POLICY IF EXISTS "songs_public_read" ON songs;