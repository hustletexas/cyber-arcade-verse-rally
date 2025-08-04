
-- Create trivia questions table
CREATE TABLE public.trivia_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trivia game sessions table
CREATE TABLE public.trivia_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category TEXT NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  speed_bonus INTEGER NOT NULL DEFAULT 0,
  session_type TEXT NOT NULL DEFAULT 'single' CHECK (session_type IN ('single', 'multiplayer', 'private')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trivia answers table to track individual question responses
CREATE TABLE public.trivia_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.trivia_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.trivia_questions(id) NOT NULL,
  user_answer TEXT CHECK (user_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL DEFAULT false,
  response_time INTEGER NOT NULL, -- time in seconds
  points_awarded INTEGER NOT NULL DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trivia leaderboard view for easy querying
CREATE OR REPLACE VIEW public.trivia_leaderboard AS
SELECT 
  ts.user_id,
  p.username,
  p.wallet_address,
  ts.category,
  ts.total_score,
  ts.correct_answers,
  ts.total_questions,
  ROUND((ts.correct_answers::float / NULLIF(ts.total_questions, 0)) * 100, 2) as accuracy_percentage,
  ts.speed_bonus,
  ts.completed_at,
  ROW_NUMBER() OVER (PARTITION BY ts.category ORDER BY ts.total_score DESC, ts.completed_at ASC) as rank
FROM public.trivia_sessions ts
JOIN public.profiles p ON ts.user_id = p.id
WHERE ts.status = 'completed'
ORDER BY ts.total_score DESC, ts.completed_at ASC;

-- Add RLS policies
ALTER TABLE public.trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trivia_answers ENABLE ROW LEVEL SECURITY;

-- Policy for trivia questions - anyone can read
CREATE POLICY "Anyone can view trivia questions" 
  ON public.trivia_questions 
  FOR SELECT 
  USING (true);

-- Policy for trivia sessions - users can manage their own sessions
CREATE POLICY "Users can view their own trivia sessions" 
  ON public.trivia_sessions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trivia sessions" 
  ON public.trivia_sessions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trivia sessions" 
  ON public.trivia_sessions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy for trivia answers - users can manage their own answers
CREATE POLICY "Users can view their own trivia answers" 
  ON public.trivia_answers 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.trivia_sessions ts 
    WHERE ts.id = trivia_answers.session_id AND ts.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own trivia answers" 
  ON public.trivia_answers 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.trivia_sessions ts 
    WHERE ts.id = session_id AND ts.user_id = auth.uid()
  ));

-- Insert sample trivia questions
INSERT INTO public.trivia_questions (category, question, option_a, option_b, option_c, option_d, correct_answer, difficulty) VALUES
-- Game History Category
('Game History', 'Which company developed the original Super Mario Bros?', 'Sega', 'Nintendo', 'Atari', 'Capcom', 'B', 'easy'),
('Game History', 'What year was Pac-Man first released?', '1978', '1980', '1982', '1984', 'B', 'medium'),
('Game History', 'Which was the first commercially successful home video game console?', 'Atari 2600', 'Magnavox Odyssey', 'Intellivision', 'ColecoVision', 'B', 'hard'),
('Game History', 'What game is considered the first first-person shooter?', 'Doom', 'Wolfenstein 3D', 'Maze War', 'Quake', 'C', 'hard'),

-- Characters Category
('Characters', 'What is the name of the princess in The Legend of Zelda series?', 'Peach', 'Zelda', 'Daisy', 'Rosalina', 'B', 'easy'),
('Characters', 'Which character is known for saying "Waka waka waka"?', 'Mario', 'Sonic', 'Pac-Man', 'Mega Man', 'C', 'easy'),
('Characters', 'What is Master Chief''s real name in the Halo series?', 'John-117', 'Marcus Fenix', 'Gordon Freeman', 'Sam Fisher', 'A', 'medium'),
('Characters', 'Which Final Fantasy character wields a sword called the Buster Sword?', 'Squall', 'Cloud', 'Sephiroth', 'Zack', 'B', 'medium'),

-- Developers Category
('Developers', 'Who created the Metal Gear series?', 'Shigeru Miyamoto', 'Hideo Kojima', 'Satoshi Tajiri', 'Hideki Kamiya', 'B', 'medium'),
('Developers', 'Which company developed Fortnite?', 'Riot Games', 'Epic Games', 'Valve', 'Blizzard', 'B', 'easy'),
('Developers', 'Who is the creator of Minecraft?', 'Markus Persson', 'John Carmack', 'Gabe Newell', 'Will Wright', 'A', 'easy'),
('Developers', 'Which studio developed The Witcher 3: Wild Hunt?', 'BioWare', 'Bethesda', 'CD Projekt Red', 'Obsidian', 'C', 'medium'),

-- Gaming Technology Category
('Technology', 'What does GPU stand for in gaming?', 'Game Processing Unit', 'Graphics Processing Unit', 'General Processing Unit', 'Gaming Performance Unit', 'B', 'easy'),
('Technology', 'Which technology allows for real-time lighting in modern games?', 'Ray Tracing', 'Pixel Shading', 'Texture Mapping', 'Anti-Aliasing', 'A', 'medium'),
('Technology', 'What is the maximum refresh rate of most gaming monitors?', '60Hz', '120Hz', '240Hz', '360Hz', 'D', 'hard'),
('Technology', 'Which VR headset was developed by Facebook (Meta)?', 'HTC Vive', 'PlayStation VR', 'Oculus Rift', 'Valve Index', 'C', 'medium');

-- Create function to calculate trivia scores
CREATE OR REPLACE FUNCTION public.calculate_trivia_score(
  response_time INTEGER,
  is_correct BOOLEAN,
  difficulty TEXT DEFAULT 'medium'
) RETURNS INTEGER AS $$
DECLARE
  base_points INTEGER := 0;
  speed_multiplier DECIMAL := 1.0;
  difficulty_multiplier DECIMAL := 1.0;
  final_score INTEGER := 0;
BEGIN
  -- Only award points for correct answers
  IF NOT is_correct THEN
    RETURN 0;
  END IF;
  
  -- Base points by difficulty
  CASE difficulty
    WHEN 'easy' THEN base_points := 100;
    WHEN 'medium' THEN base_points := 200;
    WHEN 'hard' THEN base_points := 300;
    ELSE base_points := 200;
  END CASE;
  
  -- Speed bonus: extra points for answering within 10 seconds
  IF response_time <= 10 THEN
    speed_multiplier := 1.5;
  ELSIF response_time <= 20 THEN
    speed_multiplier := 1.2;
  ELSE
    speed_multiplier := 1.0;
  END IF;
  
  final_score := ROUND(base_points * speed_multiplier);
  
  RETURN final_score;
END;
$$ LANGUAGE plpgsql;
