
-- DJ Cues table: hot cues saved per user per track
CREATE TABLE public.dj_cues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  track_id text NOT NULL,
  cue_index integer NOT NULL CHECK (cue_index >= 1 AND cue_index <= 8),
  time_position numeric NOT NULL DEFAULT 0,
  label text,
  color text DEFAULT '#00ffff',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, track_id, cue_index)
);

ALTER TABLE public.dj_cues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own cues"
  ON public.dj_cues FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own cues"
  ON public.dj_cues FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own cues"
  ON public.dj_cues FOR UPDATE
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own cues"
  ON public.dj_cues FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- DJ Sets table: recorded mixes
CREATE TABLE public.dj_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Mix',
  mix_url text NOT NULL,
  duration_seconds integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.dj_sets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sets"
  ON public.dj_sets FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create their own sets"
  ON public.dj_sets FOR INSERT
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can delete their own sets"
  ON public.dj_sets FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

-- Storage bucket for DJ mixes
INSERT INTO storage.buckets (id, name, public) VALUES ('dj-mixes', 'dj-mixes', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload DJ mixes"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dj-mixes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view DJ mixes"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dj-mixes');

CREATE POLICY "Users can delete their own DJ mixes"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'dj-mixes' AND auth.uid()::text = (storage.foldername(name))[1]);
