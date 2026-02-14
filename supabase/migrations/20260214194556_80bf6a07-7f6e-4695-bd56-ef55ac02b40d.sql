
-- DJ track uploads table with approval workflow
CREATE TABLE public.dj_uploads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  genre TEXT,
  bpm INTEGER,
  status TEXT NOT NULL DEFAULT 'private' CHECK (status IN ('private', 'pending_approval', 'approved', 'rejected')),
  rejection_reason TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dj_uploads ENABLE ROW LEVEL SECURITY;

-- Users can see their own uploads
CREATE POLICY "Users can view own uploads"
ON public.dj_uploads FOR SELECT
USING (user_id = COALESCE(auth.uid()::text, ''));

-- Users can see approved uploads from others
CREATE POLICY "Anyone can view approved uploads"
ON public.dj_uploads FOR SELECT
USING (status = 'approved');

-- Authenticated users can insert their own uploads
CREATE POLICY "Users can insert own uploads"
ON public.dj_uploads FOR INSERT
WITH CHECK (user_id = auth.uid()::text);

-- Users can update their own uploads (e.g. submit for approval)
CREATE POLICY "Users can update own uploads"
ON public.dj_uploads FOR UPDATE
USING (user_id = auth.uid()::text);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
ON public.dj_uploads FOR DELETE
USING (user_id = auth.uid()::text);

-- Admins can manage all uploads
CREATE POLICY "Admins can manage all uploads"
ON public.dj_uploads FOR ALL
USING (public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_dj_uploads_updated_at
BEFORE UPDATE ON public.dj_uploads
FOR EACH ROW
EXECUTE FUNCTION public.set_timestamp_updated_at();

-- Storage bucket for DJ uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('dj-uploads', 'dj-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS for DJ uploads bucket
CREATE POLICY "Users can upload DJ tracks"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'dj-uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can read own DJ tracks"
ON storage.objects FOR SELECT
USING (bucket_id = 'dj-uploads' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own DJ tracks"
ON storage.objects FOR DELETE
USING (bucket_id = 'dj-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
