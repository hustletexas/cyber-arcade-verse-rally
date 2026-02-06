-- Drop the old restrictive check constraint
ALTER TABLE public.token_transactions DROP CONSTRAINT token_transactions_transaction_type_check;

-- Add updated constraint with all valid transaction types
ALTER TABLE public.token_transactions ADD CONSTRAINT token_transactions_transaction_type_check 
CHECK (transaction_type = ANY (ARRAY[
  'reward', 'airdrop', 'tournament_win', 'purchase', 'claim',
  'starter_bonus', 'daily_login', 'trivia_entry', 'trivia_reward',
  'game_entry', 'nft_purchase', 'song_purchase', 'admin_airdrop',
  'weekly_trivia_bonus'
]));