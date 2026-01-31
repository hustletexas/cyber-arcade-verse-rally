-- =============================================
-- CYBER TRIVIA CHALLENGE - PHASE 1 DATABASE
-- =============================================

-- Create enum for game modes
CREATE TYPE public.trivia_mode AS ENUM ('free_play', 'daily_run');

-- Create enum for cosmetic rarity
CREATE TYPE public.cosmetic_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Create enum for cosmetic types
CREATE TYPE public.cosmetic_type AS ENUM ('avatar_frame', 'banner', 'card_skin', 'button_skin', 'victory_fx');

-- =============================================
-- QUESTIONS TABLE (enhanced version)
-- =============================================
CREATE TABLE public.trivia_questions_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  question TEXT NOT NULL,
  answers JSONB NOT NULL, -- Array of 4 answer strings
  correct_index INTEGER NOT NULL CHECK (correct_index >= 0 AND correct_index <= 3),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trivia_questions_v2 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active questions"
ON public.trivia_questions_v2 FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage questions"
ON public.trivia_questions_v2 FOR ALL
USING (public.is_admin());

-- =============================================
-- TRIVIA RUNS TABLE (game sessions)
-- =============================================
CREATE TABLE public.trivia_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL, -- wallet address or anonymous ID
  mode public.trivia_mode NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  correct_count INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  lives_remaining INTEGER DEFAULT NULL, -- NULL for free_play, starts at 2 for daily_run
  combo_multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.0,
  speed_bonus INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trivia_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view runs"
ON public.trivia_runs FOR SELECT USING (true);

CREATE POLICY "Anyone can insert runs"
ON public.trivia_runs FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update own runs"
ON public.trivia_runs FOR UPDATE USING (true);

-- Index for leaderboard queries
CREATE INDEX idx_trivia_runs_daily ON public.trivia_runs (mode, started_at DESC, score DESC);
CREATE INDEX idx_trivia_runs_user ON public.trivia_runs (user_id, mode);

-- =============================================
-- RUN ANSWERS TABLE (answer history)
-- =============================================
CREATE TABLE public.trivia_run_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.trivia_runs(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.trivia_questions_v2(id),
  selected_index INTEGER,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_remaining NUMERIC(5,2) NOT NULL DEFAULT 0,
  points_earned INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trivia_run_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view run answers"
ON public.trivia_run_answers FOR SELECT USING (true);

CREATE POLICY "Anyone can insert run answers"
ON public.trivia_run_answers FOR INSERT WITH CHECK (true);

-- =============================================
-- USER TRIVIA STATS TABLE
-- =============================================
CREATE TABLE public.trivia_user_stats (
  user_id TEXT PRIMARY KEY, -- wallet address
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  total_runs INTEGER NOT NULL DEFAULT 0,
  tickets_balance INTEGER NOT NULL DEFAULT 0,
  best_daily_score INTEGER NOT NULL DEFAULT 0,
  last_login_date DATE,
  daily_spin_used_at TIMESTAMP WITH TIME ZONE,
  lifeline_5050_charges INTEGER NOT NULL DEFAULT 1,
  lifeline_time_charges INTEGER NOT NULL DEFAULT 1,
  lifeline_skip_charges INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trivia_user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view own stats"
ON public.trivia_user_stats FOR SELECT USING (true);

CREATE POLICY "Anyone can insert own stats"
ON public.trivia_user_stats FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update own stats"
ON public.trivia_user_stats FOR UPDATE USING (true);

-- =============================================
-- COSMETICS TABLE
-- =============================================
CREATE TABLE public.trivia_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type public.cosmetic_type NOT NULL,
  name TEXT NOT NULL,
  rarity public.cosmetic_rarity NOT NULL DEFAULT 'common',
  css_theme JSONB NOT NULL DEFAULT '{}', -- CSS variables/classes for the cosmetic
  preview_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trivia_cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active cosmetics"
ON public.trivia_cosmetics FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage cosmetics"
ON public.trivia_cosmetics FOR ALL USING (public.is_admin());

-- =============================================
-- USER COSMETICS (owned items)
-- =============================================
CREATE TABLE public.trivia_user_cosmetics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  cosmetic_id UUID NOT NULL REFERENCES public.trivia_cosmetics(id) ON DELETE CASCADE,
  owned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, cosmetic_id)
);

ALTER TABLE public.trivia_user_cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view own cosmetics"
ON public.trivia_user_cosmetics FOR SELECT USING (true);

CREATE POLICY "Anyone can insert own cosmetics"
ON public.trivia_user_cosmetics FOR INSERT WITH CHECK (true);

-- =============================================
-- EQUIPPED COSMETICS
-- =============================================
CREATE TABLE public.trivia_equipped_cosmetics (
  user_id TEXT PRIMARY KEY,
  avatar_frame_id UUID REFERENCES public.trivia_cosmetics(id),
  banner_id UUID REFERENCES public.trivia_cosmetics(id),
  card_skin_id UUID REFERENCES public.trivia_cosmetics(id),
  button_skin_id UUID REFERENCES public.trivia_cosmetics(id),
  victory_fx_id UUID REFERENCES public.trivia_cosmetics(id),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.trivia_equipped_cosmetics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view own equipped"
ON public.trivia_equipped_cosmetics FOR SELECT USING (true);

CREATE POLICY "Anyone can upsert own equipped"
ON public.trivia_equipped_cosmetics FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update own equipped"
ON public.trivia_equipped_cosmetics FOR UPDATE USING (true);

-- =============================================
-- DAILY LEADERBOARD VIEW
-- =============================================
CREATE OR REPLACE VIEW public.trivia_daily_leaderboard AS
SELECT 
  tr.user_id,
  tr.score,
  tr.best_streak,
  tr.correct_count,
  tr.started_at,
  ROW_NUMBER() OVER (ORDER BY tr.score DESC, tr.best_streak DESC) as rank
FROM public.trivia_runs tr
WHERE tr.mode = 'daily_run'
  AND tr.ended_at IS NOT NULL
  AND tr.started_at >= CURRENT_DATE
  AND tr.started_at < CURRENT_DATE + INTERVAL '1 day'
ORDER BY tr.score DESC, tr.best_streak DESC
LIMIT 100;

-- =============================================
-- INSERT DEFAULT VICTORY EFFECTS
-- =============================================
INSERT INTO public.trivia_cosmetics (type, name, rarity, css_theme) VALUES
('victory_fx', 'Neon Pulse', 'common', '{"animation": "neon-pulse", "color": "#00ffff"}'),
('victory_fx', 'Fire Burst', 'rare', '{"animation": "fire-burst", "color": "#ff6b00"}'),
('victory_fx', 'Electric Storm', 'epic', '{"animation": "electric-storm", "color": "#9b59b6"}'),
('victory_fx', 'Cyber Matrix', 'legendary', '{"animation": "cyber-matrix", "color": "#00ff00"}');

-- =============================================
-- SEED SAMPLE QUESTIONS
-- =============================================
INSERT INTO public.trivia_questions_v2 (category, difficulty, question, answers, correct_index) VALUES
('Gaming', 'easy', 'What year was the original Super Mario Bros released?', '["1983", "1985", "1987", "1989"]', 1),
('Gaming', 'easy', 'Which company created the PlayStation?', '["Nintendo", "Sega", "Sony", "Microsoft"]', 2),
('Gaming', 'medium', 'What is the best-selling video game of all time?', '["Tetris", "Minecraft", "GTA V", "Wii Sports"]', 1),
('Gaming', 'medium', 'In what game would you find the character Master Chief?', '["Gears of War", "Halo", "Destiny", "Call of Duty"]', 1),
('Gaming', 'hard', 'What was the first video game console to use a CD-ROM?', '["Sega CD", "PlayStation", "3DO", "TurboGrafx-CD"]', 3),
('Entertainment', 'easy', 'Who directed the movie Inception?', '["Steven Spielberg", "Christopher Nolan", "James Cameron", "Ridley Scott"]', 1),
('Entertainment', 'easy', 'What streaming service produces Stranger Things?', '["Amazon Prime", "Hulu", "Netflix", "Disney+"]', 2),
('Entertainment', 'medium', 'Which band performed the song "Bohemian Rhapsody"?', '["The Beatles", "Led Zeppelin", "Queen", "Pink Floyd"]', 2),
('Entertainment', 'medium', 'What year did the first Star Wars film release?', '["1975", "1977", "1979", "1981"]', 1),
('Entertainment', 'hard', 'Who composed the score for the movie Interstellar?', '["John Williams", "Hans Zimmer", "Danny Elfman", "Howard Shore"]', 1);