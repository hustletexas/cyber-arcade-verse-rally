-- Create achievements system tables

-- Create achievements table to store all available achievements
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'common',
  points INTEGER NOT NULL DEFAULT 10,
  requirements JSONB,
  unlock_condition TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table to track earned achievements
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  progress INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create achievement_progress table for tracking progress on achievements
CREATE TABLE public.achievement_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  target_progress INTEGER NOT NULL DEFAULT 1,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on achievements tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievement_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (public read access)
CREATE POLICY "Anyone can view active achievements" 
ON public.achievements 
FOR SELECT 
USING (is_active = true);

-- RLS policies for user_achievements
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS policies for achievement_progress
CREATE POLICY "Users can view their own achievement progress" 
ON public.achievement_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievement progress" 
ON public.achievement_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievement progress" 
ON public.achievement_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to update achievement progress
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
  user_id_param UUID,
  achievement_type TEXT,
  increment_amount INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  achievement_record RECORD;
  progress_record RECORD;
  new_progress INTEGER;
  achievement_earned BOOLEAN := false;
BEGIN
  -- Find matching achievements of the specified type
  FOR achievement_record IN 
    SELECT * FROM public.achievements 
    WHERE unlock_condition = achievement_type AND is_active = true
  LOOP
    -- Get or create progress record
    SELECT * INTO progress_record
    FROM public.achievement_progress 
    WHERE user_id = user_id_param AND achievement_id = achievement_record.id;
    
    IF NOT FOUND THEN
      -- Create new progress record
      INSERT INTO public.achievement_progress (
        user_id, achievement_id, current_progress, target_progress
      ) VALUES (
        user_id_param, achievement_record.id, increment_amount, 
        COALESCE((achievement_record.requirements->>'target')::INTEGER, 1)
      ) RETURNING * INTO progress_record;
      
      new_progress := increment_amount;
    ELSE
      -- Update existing progress
      new_progress := progress_record.current_progress + increment_amount;
      
      UPDATE public.achievement_progress 
      SET 
        current_progress = new_progress,
        last_updated = now()
      WHERE id = progress_record.id;
    END IF;
    
    -- Check if achievement is earned
    IF new_progress >= progress_record.target_progress THEN
      -- Insert achievement if not already earned
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (user_id_param, achievement_record.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
      
      achievement_earned := true;
    END IF;
  END LOOP;
  
  RETURN json_build_object('success', true, 'achievement_earned', achievement_earned);
END;
$function$;

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, category, difficulty, points, unlock_condition, requirements) VALUES
('First Steps', 'Welcome to Cyber City Arcade! Complete your first action.', '🎮', 'getting_started', 'common', 10, 'first_login', '{"target": 1}'),
('Music Lover', 'Listen to 10 tracks in the music player.', '🎵', 'music', 'common', 25, 'tracks_played', '{"target": 10}'),
('Gaming Enthusiast', 'Play 5 different games.', '🕹️', 'gaming', 'common', 30, 'games_played', '{"target": 5}'),
('NFT Collector', 'Mint your first NFT.', '🔨', 'nft', 'common', 50, 'nft_minted', '{"target": 1}'),
('Tournament Warrior', 'Join 3 tournaments.', '⚔️', 'tournament', 'uncommon', 75, 'tournaments_joined', '{"target": 3}'),
('Trivia Master', 'Answer 50 trivia questions correctly.', '🧠', 'trivia', 'uncommon', 100, 'trivia_correct', '{"target": 50}'),
('Token Holder', 'Purchase 1000 CCTR tokens.', '💎', 'token', 'uncommon', 100, 'tokens_purchased', '{"target": 1000}'),
('Social Butterfly', 'Use 10 social features.', '🦋', 'social', 'rare', 150, 'social_actions', '{"target": 10}'),
('Raffle Winner', 'Win your first raffle.', '🎰', 'raffle', 'rare', 200, 'raffle_won', '{"target": 1}'),
('Cyber Legend', 'Complete 100 total activities in the arcade.', '👑', 'legend', 'legendary', 500, 'total_activities', '{"target": 100}');

-- Create trigger to update achievement updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_achievements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_achievements_updated_at
  BEFORE UPDATE ON public.achievements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_achievements_updated_at();