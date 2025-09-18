-- Create chat rooms and messaging system
-- This will allow users to join different chat rooms and send messages in real-time

-- Create chat rooms table
CREATE TABLE public.chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_participants INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'system', 'image', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create room participants table for presence tracking
CREATE TABLE public.room_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  username TEXT NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for chat_rooms (everyone can view active rooms)
CREATE POLICY "Anyone can view active chat rooms" ON public.chat_rooms 
FOR SELECT USING (is_active = true);

-- Create policies for chat_messages (users can view messages in rooms they're in, authenticated users can insert)
CREATE POLICY "Users can view messages in active rooms" ON public.chat_messages 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr 
    WHERE cr.id = room_id AND cr.is_active = true
  )
);

CREATE POLICY "Authenticated users can insert messages" ON public.chat_messages 
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Create policies for room_participants
CREATE POLICY "Users can view participants in active rooms" ON public.room_participants 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.chat_rooms cr 
    WHERE cr.id = room_id AND cr.is_active = true
  )
);

CREATE POLICY "Users can manage their own participation" ON public.room_participants 
FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX idx_room_participants_room_id ON public.room_participants(room_id);
CREATE INDEX idx_room_participants_user_id ON public.room_participants(user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON public.chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.set_timestamp_updated_at();

-- Insert some default chat rooms
INSERT INTO public.chat_rooms (name, description) VALUES
('General', 'General discussion for all topics'),
('Gaming', 'Talk about your favorite games and strategies'),
('Music', 'Share and discuss music from the cyber dreams collection'),
('Trading', 'Discuss NFT trading and market trends'),
('Tech Talk', 'Technology and blockchain discussions'),
('Random', 'Random conversations and off-topic chat');

-- Enable realtime for all chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_participants;