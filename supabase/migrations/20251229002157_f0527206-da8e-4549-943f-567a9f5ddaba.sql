-- Add indexes for frequently accessed columns to improve query performance

-- User-related indexes (most tables query by user_id)
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON user_balances(user_id);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);

CREATE INDEX IF NOT EXISTS idx_achievement_progress_user_id ON achievement_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_achievement_progress_achievement_id ON achievement_progress(achievement_id);

-- Tournament indexes
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments(start_date);

CREATE INDEX IF NOT EXISTS idx_solana_tournaments_status ON solana_tournaments(status);
CREATE INDEX IF NOT EXISTS idx_solana_tournaments_start_time ON solana_tournaments(start_time);
CREATE INDEX IF NOT EXISTS idx_solana_tournaments_admin_wallet ON solana_tournaments(admin_wallet);

CREATE INDEX IF NOT EXISTS idx_solana_tournament_entries_tournament_id ON solana_tournament_entries(tournament_id);
CREATE INDEX IF NOT EXISTS idx_solana_tournament_entries_user_id ON solana_tournament_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_solana_tournament_entries_wallet_address ON solana_tournament_entries(wallet_address);

CREATE INDEX IF NOT EXISTS idx_tournament_participants_tournament_id ON tournament_participants(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_participants_user_id ON tournament_participants(user_id);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);

-- NFT indexes
CREATE INDEX IF NOT EXISTS idx_nft_purchases_user_id ON nft_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_purchases_status ON nft_purchases(status);

CREATE INDEX IF NOT EXISTS idx_nft_mints_user_id ON nft_mints(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_mints_wallet_address ON nft_mints(wallet_address);

CREATE INDEX IF NOT EXISTS idx_nft_creation_orders_user_id ON nft_creation_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_nft_creation_orders_status ON nft_creation_orders(status);

-- Token/purchase indexes
CREATE INDEX IF NOT EXISTS idx_token_purchases_user_id ON token_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_token_purchases_status ON token_purchases(status);

CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_tournament_id ON token_transactions(tournament_id);

-- Node indexes
CREATE INDEX IF NOT EXISTS idx_node_purchases_user_id ON node_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_node_purchases_wallet_address ON node_purchases(wallet_address);

CREATE INDEX IF NOT EXISTS idx_node_rewards_user_id ON node_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_node_rewards_wallet_address ON node_rewards(wallet_address);
CREATE INDEX IF NOT EXISTS idx_node_rewards_reward_date ON node_rewards(reward_date);

-- Raffle indexes
CREATE INDEX IF NOT EXISTS idx_raffles_status ON raffles(status);
CREATE INDEX IF NOT EXISTS idx_raffles_end_date ON raffles(end_date);

CREATE INDEX IF NOT EXISTS idx_raffle_tickets_raffle_id ON raffle_tickets(raffle_id);
CREATE INDEX IF NOT EXISTS idx_raffle_tickets_user_id ON raffle_tickets(user_id);

-- Prize indexes
CREATE INDEX IF NOT EXISTS idx_user_prizes_user_id ON user_prizes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prizes_prize_id ON user_prizes(prize_id);
CREATE INDEX IF NOT EXISTS idx_user_prizes_redemption_status ON user_prizes(redemption_status);

-- Song indexes
CREATE INDEX IF NOT EXISTS idx_songs_artist ON songs(artist);
CREATE INDEX IF NOT EXISTS idx_songs_genre ON songs(genre);
CREATE INDEX IF NOT EXISTS idx_songs_is_purchasable ON songs(is_purchasable);

CREATE INDEX IF NOT EXISTS idx_user_song_purchases_user_id ON user_song_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_user_song_purchases_song_id ON user_song_purchases(song_id);

-- Achievement indexes
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_is_active ON achievements(is_active);

-- User roles index
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);