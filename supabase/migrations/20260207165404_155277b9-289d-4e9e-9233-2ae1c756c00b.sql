
-- Drop old auth-based storage policies that won't work with wallet-only architecture
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Allow anyone to upload to avatars bucket (wallet identity is enforced at app level)
CREATE POLICY "Allow avatar uploads"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow anyone to update avatars
CREATE POLICY "Allow avatar updates"
ON storage.objects FOR UPDATE
TO anon, authenticated
USING (bucket_id = 'avatars');

-- Allow anyone to delete from avatars
CREATE POLICY "Allow avatar deletes"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'avatars');
