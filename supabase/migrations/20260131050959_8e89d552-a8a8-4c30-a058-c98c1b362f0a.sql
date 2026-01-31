
-- Insert demo tournament for bracket preview testing
INSERT INTO arcade_tournaments (id, title, game, status, admin_id, start_time, max_players, min_players, format, payout_schema)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'NEON CHAMPIONS CUP', 'Tetris', 'in_progress', 'ae654cb2-d28b-4841-a2c0-72f3dffcf627', now(), 8, 2, 'single_elimination', 'top_3')
ON CONFLICT (id) DO NOTHING;

-- Insert demo matches for the bracket
INSERT INTO tournament_matches (id, tournament_id, round_number, match_number, player_a_wallet, player_b_wallet, player_a_score, player_b_score, winner_wallet, status)
VALUES 
  -- Round 1 (Quarters)
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 1, 1, 'G4n2rPTQMEx8K', '7xKpWn3rQHm5J', 3, 1, 'G4n2rPTQMEx8K', 'completed'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 1, 2, 'B8mNh5wRFeq2L', 'J9sYp4tXWzv7D', 2, 3, 'J9sYp4tXWzv7D', 'completed'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 1, 3, 'H3cLm7nPAsr4W', 'F6vBk8xQJuy1N', 3, 0, 'H3cLm7nPAsr4W', 'completed'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 1, 4, 'T2dRs9fCAep6M', 'K5wYx1gDHnz3Q', NULL, NULL, NULL, 'in_progress'),
  -- Round 2 (Semis)  
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 2, 1, 'G4n2rPTQMEx8K', 'J9sYp4tXWzv7D', NULL, NULL, NULL, 'pending'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '11111111-1111-1111-1111-111111111111', 2, 2, 'H3cLm7nPAsr4W', NULL, NULL, NULL, NULL, 'pending'),
  -- Round 3 (Finals)
  ('00000000-1111-2222-3333-444444444444', '11111111-1111-1111-1111-111111111111', 3, 1, NULL, NULL, NULL, NULL, NULL, 'pending')
ON CONFLICT (id) DO NOTHING;
