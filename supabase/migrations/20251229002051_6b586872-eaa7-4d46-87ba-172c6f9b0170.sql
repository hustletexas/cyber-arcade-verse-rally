-- Fix solana_tournaments policies
DROP POLICY IF EXISTS "Authenticated users can view basic tournament info" ON public.solana_tournaments;
CREATE POLICY "Authenticated users can view basic tournament info" 
ON public.solana_tournaments FOR SELECT
USING ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Tournament admins can view all tournament details" ON public.solana_tournaments;
CREATE POLICY "Tournament admins can view all tournament details" 
ON public.solana_tournaments FOR SELECT
USING (
  ((SELECT auth.uid()) IS NOT NULL) 
  AND (
    (admin_wallet = ((SELECT auth.jwt()) ->> 'wallet_address'::text)) 
    OR (((SELECT auth.jwt()) ->> 'role'::text) = 'admin'::text)
  )
);

-- Fix solana_tournament_entries policies
DROP POLICY IF EXISTS "Users can view their own tournament entries" ON public.solana_tournament_entries;
CREATE POLICY "Users can view their own tournament entries" 
ON public.solana_tournament_entries FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users or admins can update entries" ON public.solana_tournament_entries;
CREATE POLICY "Users or admins can update entries" 
ON public.solana_tournament_entries FOR UPDATE
USING (((SELECT auth.uid()) = user_id) OR is_admin());

-- Fix chat_messages policies
DROP POLICY IF EXISTS "Authenticated users can insert their own messages" ON public.chat_messages;
CREATE POLICY "Authenticated users can insert their own messages" 
ON public.chat_messages FOR INSERT
WITH CHECK (((SELECT auth.uid()) IS NOT NULL) AND ((SELECT auth.uid()) = user_id));

DROP POLICY IF EXISTS "Wallet users can insert messages via profile" ON public.chat_messages;
CREATE POLICY "Wallet users can insert messages via profile" 
ON public.chat_messages FOR INSERT
WITH CHECK (
  ((SELECT auth.uid()) IS NOT NULL) 
  AND (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = (SELECT auth.uid()) AND profiles.wallet_address IS NOT NULL
  ))
);

-- Fix room_participants policy
DROP POLICY IF EXISTS "Users can manage their own participation" ON public.room_participants;
CREATE POLICY "Users can manage their own participation" 
ON public.room_participants FOR ALL
USING ((SELECT auth.uid()) = user_id);

-- Fix node_rewards policies
DROP POLICY IF EXISTS "Users can create their own node rewards" ON public.node_rewards;
CREATE POLICY "Users can create their own node rewards" 
ON public.node_rewards FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own node rewards" ON public.node_rewards;
CREATE POLICY "Users can update their own node rewards" 
ON public.node_rewards FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own node rewards" ON public.node_rewards;
CREATE POLICY "Users can view their own node rewards" 
ON public.node_rewards FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix node_purchases policies
DROP POLICY IF EXISTS "Users can create their own node purchases" ON public.node_purchases;
CREATE POLICY "Users can create their own node purchases" 
ON public.node_purchases FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own node purchases" ON public.node_purchases;
CREATE POLICY "Users can update their own node purchases" 
ON public.node_purchases FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own node purchases" ON public.node_purchases;
CREATE POLICY "Users can view their own node purchases" 
ON public.node_purchases FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix token_transactions policy
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.token_transactions;
CREATE POLICY "Users can view their own transactions" 
ON public.token_transactions FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix raffle_tickets policies
DROP POLICY IF EXISTS "Users can insert their own tickets" ON public.raffle_tickets;
CREATE POLICY "Users can insert their own tickets" 
ON public.raffle_tickets FOR INSERT
WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view their own tickets" ON public.raffle_tickets;
CREATE POLICY "Users can view their own tickets" 
ON public.raffle_tickets FOR SELECT
USING (user_id = (SELECT auth.uid()));

-- Fix achievement_progress policies
DROP POLICY IF EXISTS "Users can insert their own achievement progress" ON public.achievement_progress;
CREATE POLICY "Users can insert their own achievement progress" 
ON public.achievement_progress FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own achievement progress" ON public.achievement_progress;
CREATE POLICY "Users can update their own achievement progress" 
ON public.achievement_progress FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own achievement progress" ON public.achievement_progress;
CREATE POLICY "Users can view their own achievement progress" 
ON public.achievement_progress FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix nft_creation_orders policies
DROP POLICY IF EXISTS "Users can create their own NFT orders" ON public.nft_creation_orders;
CREATE POLICY "Users can create their own NFT orders" 
ON public.nft_creation_orders FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own NFT orders" ON public.nft_creation_orders;
CREATE POLICY "Users can update their own NFT orders" 
ON public.nft_creation_orders FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own NFT orders" ON public.nft_creation_orders;
CREATE POLICY "Users can view their own NFT orders" 
ON public.nft_creation_orders FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix nft_purchases policies
DROP POLICY IF EXISTS "Users can create their own purchases" ON public.nft_purchases;
CREATE POLICY "Users can create their own purchases" 
ON public.nft_purchases FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own purchases" ON public.nft_purchases;
CREATE POLICY "Users can update their own purchases" 
ON public.nft_purchases FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own nft purchases" ON public.nft_purchases;
CREATE POLICY "Users can view their own nft purchases" 
ON public.nft_purchases FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix nft_mints policies
DROP POLICY IF EXISTS "Users can create their own mints" ON public.nft_mints;
CREATE POLICY "Users can create their own mints" 
ON public.nft_mints FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own mints" ON public.nft_mints;
CREATE POLICY "Users can update their own mints" 
ON public.nft_mints FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own mints" ON public.nft_mints;
CREATE POLICY "Users can view their own mints" 
ON public.nft_mints FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix user_song_purchases policies
DROP POLICY IF EXISTS "Users can insert their own song purchases" ON public.user_song_purchases;
CREATE POLICY "Users can insert their own song purchases" 
ON public.user_song_purchases FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own song purchases" ON public.user_song_purchases;
CREATE POLICY "Users can view their own song purchases" 
ON public.user_song_purchases FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix tournament_participants policies
DROP POLICY IF EXISTS "Users can insert their own participations" ON public.tournament_participants;
CREATE POLICY "Users can insert their own participations" 
ON public.tournament_participants FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can update their own participations" ON public.tournament_participants;
CREATE POLICY "Users can update their own participations" 
ON public.tournament_participants FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own participations" ON public.tournament_participants;
CREATE POLICY "Users can view their own participations" 
ON public.tournament_participants FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix user_roles policies
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" 
ON public.user_roles FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix token_purchases policies
DROP POLICY IF EXISTS "Users can insert their own purchases" ON public.token_purchases;
CREATE POLICY "Users can insert their own purchases" 
ON public.token_purchases FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own purchases" ON public.token_purchases;
CREATE POLICY "Users can view their own purchases" 
ON public.token_purchases FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix user_prizes policies
DROP POLICY IF EXISTS "Users can update their own prizes" ON public.user_prizes;
CREATE POLICY "Users can update their own prizes" 
ON public.user_prizes FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own prizes" ON public.user_prizes;
CREATE POLICY "Users can view their own prizes" 
ON public.user_prizes FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix user_balances policies
DROP POLICY IF EXISTS "Users can insert their own balance" ON public.user_balances;
CREATE POLICY "Users can insert their own balance" 
ON public.user_balances FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own balance" ON public.user_balances;
CREATE POLICY "Users can view their own balance" 
ON public.user_balances FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix user_achievements policies
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;
CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can view their own achievements" ON public.user_achievements;
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements FOR SELECT
USING ((SELECT auth.uid()) = user_id);

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT
WITH CHECK ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE
USING ((SELECT auth.uid()) = id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT
USING ((SELECT auth.uid()) = id);