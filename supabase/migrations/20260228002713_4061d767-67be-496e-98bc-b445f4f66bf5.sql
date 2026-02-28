
CREATE TABLE public.pinball_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  balls_used INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pinball_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pinball scores" ON public.pinball_scores
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert pinball scores" ON public.pinball_scores
  FOR INSERT WITH CHECK (true);
