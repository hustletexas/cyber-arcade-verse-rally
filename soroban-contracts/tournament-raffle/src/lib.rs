#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Vec, String, BytesN,
};

/// Tournament status
#[derive(Clone, Copy, PartialEq, Eq)]
#[contracttype]
#[repr(u32)]
pub enum TournamentStatus {
    Upcoming = 0,
    Active = 1,
    Completed = 2,
    Cancelled = 3,
}

/// Tournament configuration
#[derive(Clone)]
#[contracttype]
pub struct Tournament {
    pub id: u64,
    pub name: String,
    pub entry_fee: i128,           // USDC entry fee
    pub prize_pool: i128,          // Total prize pool
    pub max_players: u32,
    pub current_players: u32,
    pub start_time: u64,
    pub end_time: u64,
    pub status: TournamentStatus,
    pub winner: Option<Address>,
    pub payment_token: Address,    // USDC address
}

/// Player entry
#[derive(Clone)]
#[contracttype]
pub struct PlayerEntry {
    pub player: Address,
    pub score: i128,
    pub joined_at: u64,
    pub placement: u32,
    pub reward_claimed: bool,
}

/// Raffle configuration
#[derive(Clone)]
#[contracttype]
pub struct Raffle {
    pub id: u64,
    pub name: String,
    pub ticket_price: i128,        // CCTR price per ticket
    pub max_tickets: u32,
    pub tickets_sold: u32,
    pub prize_value: i128,
    pub end_time: u64,
    pub winner: Option<Address>,
    pub payment_token: Address,    // CCTR address
    pub is_active: bool,
}

/// User's raffle tickets
#[derive(Clone)]
#[contracttype]
pub struct UserTickets {
    pub raffle_id: u64,
    pub ticket_count: u32,
    pub first_ticket_number: u32,
}

/// Storage keys
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Treasury,
    USDCToken,
    CCTRToken,
    Tournament(u64),
    TournamentPlayers(u64),
    TournamentEntry(u64, Address),
    TournamentCount,
    Raffle(u64),
    RaffleTickets(u64),
    UserRaffleTickets(Address, u64),
    RaffleCount,
    Initialized,
}

/// Tournament and Raffle Contract
#[contract]
pub struct TournamentRaffle;

#[contractimpl]
impl TournamentRaffle {
    /// Initialize the contract
    pub fn initialize(
        env: Env,
        admin: Address,
        treasury: Address,
        usdc_token: Address,
        cctr_token: Address,
    ) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("already initialized");
        }
        
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Treasury, &treasury);
        env.storage().instance().set(&DataKey::USDCToken, &usdc_token);
        env.storage().instance().set(&DataKey::CCTRToken, &cctr_token);
        env.storage().instance().set(&DataKey::TournamentCount, &0u64);
        env.storage().instance().set(&DataKey::RaffleCount, &0u64);
        env.storage().instance().set(&DataKey::Initialized, &true);
    }
    
    // ============ TOURNAMENT FUNCTIONS ============
    
    /// Create a new tournament
    pub fn create_tournament(
        env: Env,
        name: String,
        entry_fee: i128,
        max_players: u32,
        start_time: u64,
        end_time: u64,
    ) -> u64 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let usdc_token: Address = env.storage().instance().get(&DataKey::USDCToken).unwrap();
        
        let count: u64 = env.storage().instance().get(&DataKey::TournamentCount).unwrap_or(0);
        let tournament_id = count + 1;
        
        let tournament = Tournament {
            id: tournament_id,
            name,
            entry_fee,
            prize_pool: 0,
            max_players,
            current_players: 0,
            start_time,
            end_time,
            status: TournamentStatus::Upcoming,
            winner: None,
            payment_token: usdc_token,
        };
        
        env.storage().persistent().set(&DataKey::Tournament(tournament_id), &tournament);
        env.storage().persistent().set(&DataKey::TournamentPlayers(tournament_id), &Vec::<Address>::new(&env));
        env.storage().instance().set(&DataKey::TournamentCount, &tournament_id);
        
        env.events().publish(
            (symbol_short!("tour_new"), tournament_id),
            entry_fee,
        );
        
        tournament_id
    }
    
    /// Join a tournament
    pub fn join_tournament(env: Env, player: Address, tournament_id: u64) {
        player.require_auth();
        
        let mut tournament: Tournament = env.storage().persistent()
            .get(&DataKey::Tournament(tournament_id))
            .expect("tournament not found");
        
        if tournament.status != TournamentStatus::Upcoming {
            panic!("tournament not accepting entries");
        }
        
        if tournament.current_players >= tournament.max_players {
            panic!("tournament full");
        }
        
        // Check if already joined
        if env.storage().persistent().has(&DataKey::TournamentEntry(tournament_id, player.clone())) {
            panic!("already joined");
        }
        
        // Transfer entry fee
        let token_client = token::Client::new(&env, &tournament.payment_token);
        token_client.transfer(&player, &env.current_contract_address(), &tournament.entry_fee);
        
        // Update tournament
        tournament.prize_pool += tournament.entry_fee;
        tournament.current_players += 1;
        
        // Add player entry
        let entry = PlayerEntry {
            player: player.clone(),
            score: 0,
            joined_at: env.ledger().timestamp(),
            placement: 0,
            reward_claimed: false,
        };
        
        env.storage().persistent().set(&DataKey::TournamentEntry(tournament_id, player.clone()), &entry);
        env.storage().persistent().set(&DataKey::Tournament(tournament_id), &tournament);
        
        // Add to players list
        let mut players: Vec<Address> = env.storage().persistent()
            .get(&DataKey::TournamentPlayers(tournament_id))
            .unwrap_or(Vec::new(&env));
        players.push_back(player.clone());
        env.storage().persistent().set(&DataKey::TournamentPlayers(tournament_id), &players);
        
        env.events().publish(
            (symbol_short!("tour_jn"), tournament_id, player),
            tournament.entry_fee,
        );
    }
    
    /// Submit score (admin only, from game server)
    pub fn submit_score(env: Env, tournament_id: u64, player: Address, score: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut entry: PlayerEntry = env.storage().persistent()
            .get(&DataKey::TournamentEntry(tournament_id, player.clone()))
            .expect("player not in tournament");
        
        entry.score = score;
        env.storage().persistent().set(&DataKey::TournamentEntry(tournament_id, player.clone()), &entry);
        
        env.events().publish(
            (symbol_short!("score"), tournament_id, player),
            score,
        );
    }
    
    /// Complete tournament and distribute prizes
    pub fn complete_tournament(env: Env, tournament_id: u64, winner: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut tournament: Tournament = env.storage().persistent()
            .get(&DataKey::Tournament(tournament_id))
            .expect("tournament not found");
        
        if tournament.status != TournamentStatus::Upcoming && tournament.status != TournamentStatus::Active {
            panic!("tournament not active");
        }
        
        // Calculate prize distribution (90% to winner, 10% to treasury)
        let winner_prize = (tournament.prize_pool * 90) / 100;
        let treasury_fee = tournament.prize_pool - winner_prize;
        
        let token_client = token::Client::new(&env, &tournament.payment_token);
        let treasury: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();
        
        // Transfer prizes
        token_client.transfer(&env.current_contract_address(), &winner, &winner_prize);
        token_client.transfer(&env.current_contract_address(), &treasury, &treasury_fee);
        
        // Update tournament
        tournament.status = TournamentStatus::Completed;
        tournament.winner = Some(winner.clone());
        tournament.end_time = env.ledger().timestamp();
        
        env.storage().persistent().set(&DataKey::Tournament(tournament_id), &tournament);
        
        // Update winner's entry
        let mut winner_entry: PlayerEntry = env.storage().persistent()
            .get(&DataKey::TournamentEntry(tournament_id, winner.clone()))
            .expect("winner not in tournament");
        winner_entry.placement = 1;
        winner_entry.reward_claimed = true;
        env.storage().persistent().set(&DataKey::TournamentEntry(tournament_id, winner.clone()), &winner_entry);
        
        env.events().publish(
            (symbol_short!("tour_end"), tournament_id, winner),
            winner_prize,
        );
    }
    
    // ============ RAFFLE FUNCTIONS ============
    
    /// Create a new raffle
    pub fn create_raffle(
        env: Env,
        name: String,
        ticket_price: i128,
        max_tickets: u32,
        prize_value: i128,
        end_time: u64,
    ) -> u64 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let cctr_token: Address = env.storage().instance().get(&DataKey::CCTRToken).unwrap();
        
        let count: u64 = env.storage().instance().get(&DataKey::RaffleCount).unwrap_or(0);
        let raffle_id = count + 1;
        
        let raffle = Raffle {
            id: raffle_id,
            name,
            ticket_price,
            max_tickets,
            tickets_sold: 0,
            prize_value,
            end_time,
            winner: None,
            payment_token: cctr_token,
            is_active: true,
        };
        
        env.storage().persistent().set(&DataKey::Raffle(raffle_id), &raffle);
        env.storage().persistent().set(&DataKey::RaffleTickets(raffle_id), &Vec::<Address>::new(&env));
        env.storage().instance().set(&DataKey::RaffleCount, &raffle_id);
        
        env.events().publish(
            (symbol_short!("rfl_new"), raffle_id),
            ticket_price,
        );
        
        raffle_id
    }
    
    /// Purchase raffle tickets
    pub fn purchase_tickets(env: Env, buyer: Address, raffle_id: u64, quantity: u32) {
        buyer.require_auth();
        
        let mut raffle: Raffle = env.storage().persistent()
            .get(&DataKey::Raffle(raffle_id))
            .expect("raffle not found");
        
        if !raffle.is_active {
            panic!("raffle not active");
        }
        
        if raffle.tickets_sold + quantity > raffle.max_tickets {
            panic!("not enough tickets available");
        }
        
        let current_time = env.ledger().timestamp();
        if current_time > raffle.end_time {
            panic!("raffle ended");
        }
        
        // Calculate total cost
        let total_cost = raffle.ticket_price * (quantity as i128);
        
        // Transfer CCTR
        let token_client = token::Client::new(&env, &raffle.payment_token);
        token_client.transfer(&buyer, &env.current_contract_address(), &total_cost);
        
        // Record tickets
        let first_ticket = raffle.tickets_sold + 1;
        raffle.tickets_sold += quantity;
        
        let user_tickets = UserTickets {
            raffle_id,
            ticket_count: quantity,
            first_ticket_number: first_ticket,
        };
        
        env.storage().persistent().set(&DataKey::UserRaffleTickets(buyer.clone(), raffle_id), &user_tickets);
        env.storage().persistent().set(&DataKey::Raffle(raffle_id), &raffle);
        
        // Add buyer to ticket holders list (for each ticket)
        let mut ticket_holders: Vec<Address> = env.storage().persistent()
            .get(&DataKey::RaffleTickets(raffle_id))
            .unwrap_or(Vec::new(&env));
        
        for _ in 0..quantity {
            ticket_holders.push_back(buyer.clone());
        }
        
        env.storage().persistent().set(&DataKey::RaffleTickets(raffle_id), &ticket_holders);
        
        env.events().publish(
            (symbol_short!("rfl_buy"), raffle_id, buyer),
            quantity,
        );
    }
    
    /// Draw raffle winner
    pub fn draw_winner(env: Env, raffle_id: u64) -> Address {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut raffle: Raffle = env.storage().persistent()
            .get(&DataKey::Raffle(raffle_id))
            .expect("raffle not found");
        
        if raffle.winner.is_some() {
            panic!("winner already drawn");
        }
        
        let ticket_holders: Vec<Address> = env.storage().persistent()
            .get(&DataKey::RaffleTickets(raffle_id))
            .expect("no tickets sold");
        
        if ticket_holders.is_empty() {
            panic!("no tickets sold");
        }
        
        // Generate pseudo-random winner index using ledger data
        let random_seed = env.ledger().timestamp() 
            ^ env.ledger().sequence() as u64
            ^ (raffle.tickets_sold as u64 * 31337);
        
        let winner_index = (random_seed % ticket_holders.len() as u64) as u32;
        let winner = ticket_holders.get(winner_index).unwrap();
        
        // Update raffle
        raffle.winner = Some(winner.clone());
        raffle.is_active = false;
        
        env.storage().persistent().set(&DataKey::Raffle(raffle_id), &raffle);
        
        // Transfer CCTR prize (ticket sales) to winner
        let token_client = token::Client::new(&env, &raffle.payment_token);
        let total_pool = raffle.ticket_price * (raffle.tickets_sold as i128);
        let winner_prize = (total_pool * 90) / 100;
        let treasury: Address = env.storage().instance().get(&DataKey::Treasury).unwrap();
        
        token_client.transfer(&env.current_contract_address(), &winner, &winner_prize);
        token_client.transfer(&env.current_contract_address(), &treasury, &(total_pool - winner_prize));
        
        env.events().publish(
            (symbol_short!("rfl_win"), raffle_id, winner.clone()),
            winner_prize,
        );
        
        winner
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /// Get tournament details
    pub fn get_tournament(env: Env, tournament_id: u64) -> Tournament {
        env.storage().persistent().get(&DataKey::Tournament(tournament_id)).expect("not found")
    }
    
    /// Get player entry in tournament
    pub fn get_player_entry(env: Env, tournament_id: u64, player: Address) -> PlayerEntry {
        env.storage().persistent()
            .get(&DataKey::TournamentEntry(tournament_id, player))
            .expect("not found")
    }
    
    /// Get raffle details
    pub fn get_raffle(env: Env, raffle_id: u64) -> Raffle {
        env.storage().persistent().get(&DataKey::Raffle(raffle_id)).expect("not found")
    }
    
    /// Get user's raffle tickets
    pub fn get_user_tickets(env: Env, user: Address, raffle_id: u64) -> UserTickets {
        env.storage().persistent()
            .get(&DataKey::UserRaffleTickets(user, raffle_id))
            .unwrap_or(UserTickets {
                raffle_id,
                ticket_count: 0,
                first_ticket_number: 0,
            })
    }
    
    /// Get tournament count
    pub fn tournament_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::TournamentCount).unwrap_or(0)
    }
    
    /// Get raffle count
    pub fn raffle_count(env: Env) -> u64 {
        env.storage().instance().get(&DataKey::RaffleCount).unwrap_or(0)
    }
}
