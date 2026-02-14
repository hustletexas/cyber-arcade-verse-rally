#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Map, String, Vec,
};
use soroban_token_sdk::TokenUtils;

/// Credit package for purchase
#[contracttype]
#[derive(Clone)]
pub struct CreditPackage {
    pub id: u32,
    pub credits: i128,
    pub price_usdc: i128,
    pub bonus_credits: i128,
    pub is_active: bool,
}

/// User credit info
#[contracttype]
#[derive(Clone)]
pub struct UserCredits {
    pub balance: i128,
    pub lifetime_earned: i128,
    pub lifetime_spent: i128,
    pub last_activity: u64,
}

/// Activity reward configuration
#[contracttype]
#[derive(Clone)]
pub struct ActivityReward {
    pub activity_type: ActivityType,
    pub reward_amount: i128,
    pub cooldown_seconds: u64,
    pub is_active: bool,
}

/// Supported activity types for earning CCC
#[contracttype]
#[derive(Clone, PartialEq)]
pub enum ActivityType {
    GamePlay,       // Playing arcade games (Cyber Match, Sequence, Trivia, etc.)
    RadioListen,    // Listening to radio/music player
    ChatMessage,    // Sending chat messages
    GameWin,        // Winning a game
    Achievement,    // Unlocking achievements
}

/// Credit transaction record
#[contracttype]
#[derive(Clone)]
pub struct CreditTransaction {
    pub id: u64,
    pub user: Address,
    pub amount: i128,
    pub tx_type: CreditTxType,
    pub description: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum CreditTxType {
    Purchase,
    Earn,       // From playing/achievements
    Spend,      // On tournaments/features
    Transfer,
    Burn,
    AdminMint,
    GameReward,     // Earned from playing games
    RadioReward,    // Earned from listening to radio
    ChatReward,     // Earned from chatting
}

#[contracttype]
pub enum DataKey {
    Admin,
    MinterRole,
    BurnerRole,
    USDCToken,
    TotalSupply,
    MaxSupply,
    DailyMintLimit,
    UserCredits(Address),
    UserDailyMint(Address, u64),
    UserActivityCooldown(Address, u32),  // (user, activity_type_id) -> last_reward_timestamp
    UserDailyActivityCount(Address, u64, u32), // (user, day, activity_type_id) -> count
    CreditPackage(u32),
    PackageCounter,
    Transaction(u64),
    TxCounter,
    Paused,
    // Activity reward configs
    ActivityRewardConfig(u32),  // activity_type_id -> ActivityReward
    DailyActivityCap(u32),     // activity_type_id -> max rewards per day
}

#[contract]
pub struct ComputeCreditsContract;

#[contractimpl]
impl ComputeCreditsContract {
    /// Initialize the Compute Credits contract
    pub fn initialize(
        env: Env,
        admin: Address,
        usdc_token: Address,
        max_supply: i128,
        daily_mint_limit: i128,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::USDCToken, &usdc_token);
        env.storage().instance().set(&DataKey::TotalSupply, &0i128);
        env.storage().instance().set(&DataKey::MaxSupply, &max_supply);
        env.storage().instance().set(&DataKey::DailyMintLimit, &daily_mint_limit);
        env.storage().instance().set(&DataKey::PackageCounter, &0u32);
        env.storage().instance().set(&DataKey::TxCounter, &0u64);
        env.storage().instance().set(&DataKey::Paused, &false);
        
        // Admin starts with minter/burner roles
        let mut minters = Vec::new(&env);
        let mut burners = Vec::new(&env);
        minters.push_back(admin.clone());
        burners.push_back(admin.clone());
        env.storage().instance().set(&DataKey::MinterRole, &minters);
        env.storage().instance().set(&DataKey::BurnerRole, &burners);
        
        // Create default packages
        Self::internal_create_package(&env, 100_0000000, 1_0000000, 0);
        Self::internal_create_package(&env, 500_0000000, 4_5000000, 50_0000000);
        Self::internal_create_package(&env, 1000_0000000, 8_0000000, 200_0000000);

        // Configure default activity rewards
        // GamePlay: 2 CCC per game, 60s cooldown, max 20/day
        Self::internal_set_activity_reward(&env, 0, 2_0000000, 60, true, 20);
        // RadioListen: 1 CCC per session, 300s cooldown (5 min), max 10/day
        Self::internal_set_activity_reward(&env, 1, 1_0000000, 300, true, 10);
        // ChatMessage: 1 CCC per message batch, 120s cooldown, max 15/day
        Self::internal_set_activity_reward(&env, 2, 1_0000000, 120, true, 15);
        // GameWin: 5 CCC per win, 0s cooldown, max 10/day
        Self::internal_set_activity_reward(&env, 3, 5_0000000, 0, true, 10);
        // Achievement: 10 CCC per achievement, 0s cooldown, max 5/day
        Self::internal_set_activity_reward(&env, 4, 10_0000000, 0, true, 5);
    }

    // === Activity Earning Functions ===

    /// Reward a user for an activity (minter role required)
    /// activity_type_id: 0=GamePlay, 1=RadioListen, 2=ChatMessage, 3=GameWin, 4=Achievement
    pub fn reward_activity(
        env: Env,
        minter: Address,
        user: Address,
        activity_type_id: u32,
    ) -> i128 {
        minter.require_auth();
        Self::require_minter(&env, &minter);
        Self::require_not_paused(&env);

        // Get activity reward config
        let reward: ActivityReward = env.storage().persistent()
            .get(&DataKey::ActivityRewardConfig(activity_type_id))
            .expect("Activity type not configured");

        if !reward.is_active {
            panic!("Activity reward is disabled");
        }

        let now = env.ledger().timestamp();
        let day = now / 86400;

        // Check cooldown
        if reward.cooldown_seconds > 0 {
            let last_reward: u64 = env.storage().temporary()
                .get(&DataKey::UserActivityCooldown(user.clone(), activity_type_id))
                .unwrap_or(0);
            if now - last_reward < reward.cooldown_seconds {
                panic!("Activity on cooldown");
            }
        }

        // Check daily cap
        let daily_cap: u32 = env.storage().persistent()
            .get(&DataKey::DailyActivityCap(activity_type_id))
            .unwrap_or(100);
        let daily_count: u32 = env.storage().temporary()
            .get(&DataKey::UserDailyActivityCount(user.clone(), day, activity_type_id))
            .unwrap_or(0);
        if daily_count >= daily_cap {
            panic!("Daily activity cap reached");
        }

        // Check supply cap
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        let max_supply: i128 = env.storage().instance().get(&DataKey::MaxSupply).unwrap();
        if total_supply + reward.reward_amount > max_supply {
            panic!("Would exceed max supply");
        }

        // Check daily mint limit
        let daily_mint_key = DataKey::UserDailyMint(user.clone(), day);
        let today_minted: i128 = env.storage().temporary().get(&daily_mint_key).unwrap_or(0);
        let daily_limit: i128 = env.storage().instance().get(&DataKey::DailyMintLimit).unwrap();
        if today_minted + reward.reward_amount > daily_limit {
            panic!("Would exceed daily mint limit");
        }

        // Update trackers
        env.storage().temporary().set(
            &DataKey::UserActivityCooldown(user.clone(), activity_type_id),
            &now,
        );
        env.storage().temporary().set(
            &DataKey::UserDailyActivityCount(user.clone(), day, activity_type_id),
            &(daily_count + 1),
        );
        env.storage().temporary().set(&daily_mint_key, &(today_minted + reward.reward_amount));

        // Determine tx type based on activity
        let tx_type = match activity_type_id {
            0 | 3 => CreditTxType::GameReward,
            1 => CreditTxType::RadioReward,
            2 => CreditTxType::ChatReward,
            _ => CreditTxType::Earn,
        };

        let description = match activity_type_id {
            0 => String::from_str(&env, "Game play reward"),
            1 => String::from_str(&env, "Radio listening reward"),
            2 => String::from_str(&env, "Chat participation reward"),
            3 => String::from_str(&env, "Game win bonus"),
            4 => String::from_str(&env, "Achievement unlock reward"),
            _ => String::from_str(&env, "Activity reward"),
        };

        Self::internal_credit_user(&env, &user, reward.reward_amount, tx_type, description);

        env.events().publish((symbol_short!("activity"), user, activity_type_id), reward.reward_amount);

        reward.reward_amount
    }

    /// Admin: configure an activity reward
    pub fn set_activity_reward(
        env: Env,
        activity_type_id: u32,
        reward_amount: i128,
        cooldown_seconds: u64,
        is_active: bool,
        daily_cap: u32,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let activity_type = match activity_type_id {
            0 => ActivityType::GamePlay,
            1 => ActivityType::RadioListen,
            2 => ActivityType::ChatMessage,
            3 => ActivityType::GameWin,
            4 => ActivityType::Achievement,
            _ => panic!("Invalid activity type"),
        };

        Self::internal_set_activity_reward(&env, activity_type_id, reward_amount, cooldown_seconds, is_active, daily_cap);
    }

    /// View: get activity reward config
    pub fn get_activity_reward(env: Env, activity_type_id: u32) -> ActivityReward {
        env.storage().persistent()
            .get(&DataKey::ActivityRewardConfig(activity_type_id))
            .expect("Activity type not configured")
    }

    /// View: get user's daily activity count
    pub fn get_daily_activity_count(env: Env, user: Address, activity_type_id: u32) -> u32 {
        let day = env.ledger().timestamp() / 86400;
        env.storage().temporary()
            .get(&DataKey::UserDailyActivityCount(user, day, activity_type_id))
            .unwrap_or(0)
    }

    // === Purchase Functions ===

    /// Buy credits with USDC
    pub fn buy_credits(env: Env, buyer: Address, package_id: u32) {
        buyer.require_auth();
        Self::require_not_paused(&env);
        
        let package: CreditPackage = env.storage().persistent()
            .get(&DataKey::CreditPackage(package_id))
            .expect("Package not found");
        
        if !package.is_active {
            panic!("Package is not active");
        }
        
        let total_credits = package.credits + package.bonus_credits;
        
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        let max_supply: i128 = env.storage().instance().get(&DataKey::MaxSupply).unwrap();
        if total_supply + total_credits > max_supply {
            panic!("Would exceed max supply");
        }
        
        let usdc: Address = env.storage().instance().get(&DataKey::USDCToken).unwrap();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        let token_client = token::Client::new(&env, &usdc);
        token_client.transfer(&buyer, &admin, &package.price_usdc);
        
        Self::internal_credit_user(&env, &buyer, total_credits, CreditTxType::Purchase, 
            String::from_str(&env, "Credit package purchase"));
        
        env.events().publish((symbol_short!("buy"), buyer), total_credits);
    }

    // === Earn/Spend Functions ===

    /// Award credits (minter role required)
    pub fn award_credits(
        env: Env,
        minter: Address,
        recipient: Address,
        amount: i128,
        description: String,
    ) {
        minter.require_auth();
        Self::require_minter(&env, &minter);
        Self::require_not_paused(&env);
        
        let day = env.ledger().timestamp() / 86400;
        let daily_key = DataKey::UserDailyMint(recipient.clone(), day);
        let today_minted: i128 = env.storage().temporary().get(&daily_key).unwrap_or(0);
        let daily_limit: i128 = env.storage().instance().get(&DataKey::DailyMintLimit).unwrap();
        
        if today_minted + amount > daily_limit {
            panic!("Would exceed daily mint limit");
        }
        
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        let max_supply: i128 = env.storage().instance().get(&DataKey::MaxSupply).unwrap();
        if total_supply + amount > max_supply {
            panic!("Would exceed max supply");
        }
        
        env.storage().temporary().set(&daily_key, &(today_minted + amount));
        
        Self::internal_credit_user(&env, &recipient, amount, CreditTxType::Earn, description);
        
        env.events().publish((symbol_short!("award"), recipient), amount);
    }

    /// Spend credits
    pub fn spend_credits(
        env: Env,
        user: Address,
        amount: i128,
        description: String,
    ) {
        user.require_auth();
        Self::require_not_paused(&env);
        
        Self::internal_debit_user(&env, &user, amount, CreditTxType::Spend, description);
        
        env.events().publish((symbol_short!("spend"), user), amount);
    }

    /// Transfer credits between users
    pub fn transfer_credits(
        env: Env,
        from: Address,
        to: Address,
        amount: i128,
    ) {
        from.require_auth();
        Self::require_not_paused(&env);
        
        if amount <= 0 {
            panic!("Amount must be positive");
        }
        
        Self::internal_debit_user(&env, &from, amount, CreditTxType::Transfer, 
            String::from_str(&env, "Transfer out"));
        Self::internal_credit_user(&env, &to, amount, CreditTxType::Transfer, 
            String::from_str(&env, "Transfer in"));
        
        env.events().publish((symbol_short!("transfer"), from, to), amount);
    }

    /// Burn credits (burner role required)
    pub fn burn_credits(env: Env, burner: Address, user: Address, amount: i128) {
        burner.require_auth();
        Self::require_burner(&env, &burner);
        Self::require_not_paused(&env);
        
        Self::internal_debit_user(&env, &user, amount, CreditTxType::Burn, 
            String::from_str(&env, "Credits burned"));
        
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        env.storage().instance().set(&DataKey::TotalSupply, &(total_supply - amount));
        
        env.events().publish((symbol_short!("burn"), user), amount);
    }

    // === Admin Functions ===

    pub fn create_package(env: Env, credits: i128, price_usdc: i128, bonus_credits: i128) -> u32 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        Self::internal_create_package(&env, credits, price_usdc, bonus_credits)
    }

    pub fn update_package(env: Env, package_id: u32, credits: i128, price_usdc: i128, bonus_credits: i128, is_active: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        let package = CreditPackage { id: package_id, credits, price_usdc, bonus_credits, is_active };
        env.storage().persistent().set(&DataKey::CreditPackage(package_id), &package);
    }

    pub fn add_minter(env: Env, minter: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        let mut minters: Vec<Address> = env.storage().instance().get(&DataKey::MinterRole).unwrap();
        minters.push_back(minter.clone());
        env.storage().instance().set(&DataKey::MinterRole, &minters);
        env.events().publish((symbol_short!("minter"),), minter);
    }

    pub fn remove_minter(env: Env, minter: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        let minters: Vec<Address> = env.storage().instance().get(&DataKey::MinterRole).unwrap();
        let mut new_minters = Vec::new(&env);
        for i in 0..minters.len() {
            let m = minters.get(i).unwrap();
            if m != minter { new_minters.push_back(m); }
        }
        env.storage().instance().set(&DataKey::MinterRole, &new_minters);
    }

    pub fn add_burner(env: Env, burner: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        let mut burners: Vec<Address> = env.storage().instance().get(&DataKey::BurnerRole).unwrap();
        burners.push_back(burner.clone());
        env.storage().instance().set(&DataKey::BurnerRole, &burners);
    }

    pub fn set_limits(env: Env, max_supply: i128, daily_mint_limit: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::MaxSupply, &max_supply);
        env.storage().instance().set(&DataKey::DailyMintLimit, &daily_mint_limit);
    }

    pub fn rotate_admin(env: Env, new_admin: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        env.events().publish((symbol_short!("admin"),), new_admin);
    }

    pub fn set_paused(env: Env, paused: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Paused, &paused);
    }

    // === View Functions ===

    pub fn get_balance(env: Env, user: Address) -> i128 {
        env.storage().persistent()
            .get::<_, UserCredits>(&DataKey::UserCredits(user))
            .map(|c| c.balance)
            .unwrap_or(0)
    }

    pub fn get_user_credits(env: Env, user: Address) -> UserCredits {
        env.storage().persistent()
            .get(&DataKey::UserCredits(user))
            .unwrap_or(UserCredits {
                balance: 0, lifetime_earned: 0, lifetime_spent: 0, last_activity: 0,
            })
    }

    pub fn get_package(env: Env, package_id: u32) -> CreditPackage {
        env.storage().persistent().get(&DataKey::CreditPackage(package_id)).expect("Package not found")
    }

    pub fn get_all_packages(env: Env) -> Vec<CreditPackage> {
        let counter: u32 = env.storage().instance().get(&DataKey::PackageCounter).unwrap_or(0);
        let mut packages = Vec::new(&env);
        for i in 1..=counter {
            if let Some(pkg) = env.storage().persistent().get::<_, CreditPackage>(&DataKey::CreditPackage(i)) {
                packages.push_back(pkg);
            }
        }
        packages
    }

    pub fn get_total_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }

    pub fn get_max_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::MaxSupply).unwrap_or(0)
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
    }

    // === Internal Functions ===

    fn internal_set_activity_reward(env: &Env, activity_type_id: u32, reward_amount: i128, cooldown_seconds: u64, is_active: bool, daily_cap: u32) {
        let activity_type = match activity_type_id {
            0 => ActivityType::GamePlay,
            1 => ActivityType::RadioListen,
            2 => ActivityType::ChatMessage,
            3 => ActivityType::GameWin,
            4 => ActivityType::Achievement,
            _ => panic!("Invalid activity type"),
        };

        let reward = ActivityReward {
            activity_type,
            reward_amount,
            cooldown_seconds,
            is_active,
        };

        env.storage().persistent().set(&DataKey::ActivityRewardConfig(activity_type_id), &reward);
        env.storage().persistent().set(&DataKey::DailyActivityCap(activity_type_id), &daily_cap);
    }

    fn internal_create_package(env: &Env, credits: i128, price_usdc: i128, bonus_credits: i128) -> u32 {
        let counter: u32 = env.storage().instance().get(&DataKey::PackageCounter).unwrap_or(0);
        let new_id = counter + 1;
        let package = CreditPackage { id: new_id, credits, price_usdc, bonus_credits, is_active: true };
        env.storage().persistent().set(&DataKey::CreditPackage(new_id), &package);
        env.storage().instance().set(&DataKey::PackageCounter, &new_id);
        new_id
    }

    fn internal_credit_user(env: &Env, user: &Address, amount: i128, tx_type: CreditTxType, description: String) {
        let mut credits: UserCredits = env.storage().persistent()
            .get(&DataKey::UserCredits(user.clone()))
            .unwrap_or(UserCredits {
                balance: 0, lifetime_earned: 0, lifetime_spent: 0, last_activity: 0,
            });
        
        credits.balance += amount;
        credits.lifetime_earned += amount;
        credits.last_activity = env.ledger().timestamp();
        
        env.storage().persistent().set(&DataKey::UserCredits(user.clone()), &credits);
        
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(total_supply + amount));
        
        Self::record_transaction(env, user.clone(), amount, tx_type, description);
    }

    fn internal_debit_user(env: &Env, user: &Address, amount: i128, tx_type: CreditTxType, description: String) {
        let mut credits: UserCredits = env.storage().persistent()
            .get(&DataKey::UserCredits(user.clone()))
            .expect("User has no credits");
        
        if credits.balance < amount {
            panic!("Insufficient credits");
        }
        
        credits.balance -= amount;
        credits.lifetime_spent += amount;
        credits.last_activity = env.ledger().timestamp();
        
        env.storage().persistent().set(&DataKey::UserCredits(user.clone()), &credits);
        
        Self::record_transaction(env, user.clone(), -amount, tx_type, description);
    }

    fn record_transaction(env: &Env, user: Address, amount: i128, tx_type: CreditTxType, description: String) {
        let counter: u64 = env.storage().instance().get(&DataKey::TxCounter).unwrap_or(0);
        let new_id = counter + 1;
        let tx = CreditTransaction { id: new_id, user, amount, tx_type, description, timestamp: env.ledger().timestamp() };
        env.storage().persistent().set(&DataKey::Transaction(new_id), &tx);
        env.storage().instance().set(&DataKey::TxCounter, &new_id);
    }

    fn require_not_paused(env: &Env) {
        if env.storage().instance().get(&DataKey::Paused).unwrap_or(false) {
            panic!("Contract is paused");
        }
    }

    fn require_minter(env: &Env, addr: &Address) {
        let minters: Vec<Address> = env.storage().instance().get(&DataKey::MinterRole).unwrap();
        let mut is_minter = false;
        for i in 0..minters.len() {
            if &minters.get(i).unwrap() == addr { is_minter = true; break; }
        }
        if !is_minter { panic!("Not a minter"); }
    }

    fn require_burner(env: &Env, addr: &Address) {
        let burners: Vec<Address> = env.storage().instance().get(&DataKey::BurnerRole).unwrap();
        let mut is_burner = false;
        for i in 0..burners.len() {
            if &burners.get(i).unwrap() == addr { is_burner = true; break; }
        }
        if !is_burner { panic!("Not a burner"); }
    }
}