-- Insert the 3 specific chat rooms
INSERT INTO public.chat_rooms (name, description, max_participants) VALUES
('Crypto Hub', 'Discuss cryptocurrency, trading, and blockchain technology', 100),
('Gamers Lounge', 'Connect with fellow gamers, share tips, and discuss gaming', 150),
('Social Circle', 'General discussions, meet new people, and socialize', 200)
ON CONFLICT (name) DO NOTHING;