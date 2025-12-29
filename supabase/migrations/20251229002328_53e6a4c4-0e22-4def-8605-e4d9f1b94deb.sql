-- Add composite indexes for common multi-column query patterns

-- User activity lookups (user + timestamp ordering)
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_created ON chat_messages(user_id, created_at DESC);

-- Tournament entry lookups
CREATE INDEX IF NOT EXISTS idx_solana_tournament_entries_tournament_score ON solana_tournament_entries(tournament_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_solana_tournament_entries_tournament_placement ON solana_tournament_entries(tournament_id, placement);
CREATE INDEX IF NOT EXISTS idx_solana_tournament_entries_user_joined ON solana_tournament_entries(user_id, joined_at DESC);

CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_placement ON tournament_participants(tournament_id, placement);

-- Status + date filtering (common admin queries)
CREATE INDEX IF NOT EXISTS idx_solana_tournaments_status_start ON solana_tournaments(status, start_time);
CREATE INDEX IF NOT EXISTS idx_tournaments_status_start ON tournaments(status, start_date);

CREATE INDEX IF NOT EXISTS idx_raffles_status_end ON raffles(status, end_date);

-- NFT order tracking
CREATE INDEX IF NOT EXISTS idx_nft_creation_orders_user_status ON nft_creation_orders(user_id, status);
CREATE INDEX IF NOT EXISTS idx_nft_creation_orders_status_created ON nft_creation_orders(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_nft_purchases_user_status ON nft_purchases(user_id, status);
CREATE INDEX IF NOT EXISTS idx_nft_purchases_status_created ON nft_purchases(status, created_at DESC);

-- Token purchase tracking
CREATE INDEX IF NOT EXISTS idx_token_purchases_user_status ON token_purchases(user_id, status);
CREATE INDEX IF NOT EXISTS idx_token_purchases_status_created ON token_purchases(status, created_at DESC);

-- Node rewards by user and date
CREATE INDEX IF NOT EXISTS idx_node_rewards_user_date ON node_rewards(user_id, reward_date DESC);
CREATE INDEX IF NOT EXISTS idx_node_rewards_wallet_date ON node_rewards(wallet_address, reward_date DESC);

-- Node purchases by user and type
CREATE INDEX IF NOT EXISTS idx_node_purchases_user_type ON node_purchases(user_id, node_type);
CREATE INDEX IF NOT EXISTS idx_node_purchases_wallet_type ON node_purchases(wallet_address, node_type);

-- User prizes tracking
CREATE INDEX IF NOT EXISTS idx_user_prizes_user_status ON user_prizes(user_id, redemption_status);
CREATE INDEX IF NOT EXISTS idx_user_prizes_status_won ON user_prizes(redemption_status, won_at DESC);

-- Raffle ticket lookups
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_raffle_ticket ON raffle_tickets(raffle_id, ticket_number);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_user_purchased ON raffle_tickets(user_id, purchased_at DESC);

-- Achievement progress tracking
CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_achievement ON achievement_progress(user_id, achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_earned ON user_achievements(user_id, earned_at DESC);

-- Songs filtering
CREATE INDEX IF NOT EXISTS idx_songs_purchasable_artist ON songs(is_purchasable, artist);
CREATE INDEX IF NOT EXISTS idx_songs_genre_artist ON songs(genre, artist);

-- User song purchases
CREATE INDEX IF NOT EXISTS idx_user_song_purchases_user_purchased ON user_song_purchases(user_id, purchased_at DESC);

-- Room participants activity
CREATE INDEX IF NOT EXISTS idx_room_participants_room_last_seen ON room_participants(room_id, last_seen DESC);

-- Token transactions by type
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_type ON token_transactions(user_id, transaction_type);
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_created ON token_transactions(user_id, created_at DESC);