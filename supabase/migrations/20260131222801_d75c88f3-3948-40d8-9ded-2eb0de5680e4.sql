-- Add two more upcoming tournaments using the existing admin_id
INSERT INTO arcade_tournaments (id, admin_id, title, description, game, format, max_players, min_players, start_time, entry_fee_usd, entry_fee_usdc, prize_pool_usd, payout_schema, requires_pass, status)
VALUES 
  (
    '22222222-2222-2222-2222-222222222222',
    'ae654cb2-d28b-4841-a2c0-72f3dffcf627',
    'ARCADE SHOWDOWN',
    'Classic arcade games battle royale',
    'pacman',
    'single_elimination',
    16,
    8,
    NOW() + INTERVAL '2 days',
    5,
    5,
    100,
    'top_3',
    false,
    'registration_open'
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'ae654cb2-d28b-4841-a2c0-72f3dffcf627',
    'GALAGA MASTERS',
    'Prove your space combat skills',
    'galaga',
    'single_elimination',
    32,
    8,
    NOW() + INTERVAL '5 days',
    10,
    10,
    500,
    'top_5',
    true,
    'registration_open'
  )
ON CONFLICT (id) DO NOTHING;