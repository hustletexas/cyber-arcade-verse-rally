-- Create the chat rooms that the frontend expects
INSERT INTO public.chat_rooms (id, name, description, max_participants, is_active) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Crypto', 'Crypto discussions and trading talk', 100, true),
  ('00000000-0000-0000-0000-000000000002', 'Gamers', 'Gaming discussions and tournaments', 100, true),
  ('00000000-0000-0000-0000-000000000003', 'Social', 'General social conversations', 100, true)
ON CONFLICT (id) DO NOTHING;