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
}

#[contracttype]
pub enum DataKey {
    Admin,
    MinterRole,                     // Addresses that can mint credits
    BurnerRole,                     // Addresses that can burn credits
    USDCToken,
    TotalSupply,
    MaxSupply,                      // Supply cap
    DailyMintLimit,                 // Per-user daily mint cap
    UserCredits(Address),
    UserDailyMint(Address, u64),    // (user, day) -> minted amount
    CreditPackage(u32),
    PackageCounter,
    Transaction(u64),
    TxCounter,
    Paused,
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
        Self::internal_create_package(&env, 100_0000000, 1_0000000, 0);           // 100 credits = $1
        Self::internal_create_package(&env, 500_0000000, 4_5000000, 50_0000000);  // 550 credits = $4.50
        Self::internal_create_package(&env, 1000_0000000, 8_0000000, 200_0000000); // 1200 credits = $8
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
        
        // Check supply cap
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        let max_supply: i128 = env.storage().instance().get(&DataKey::MaxSupply).unwrap();
        if total_supply + total_credits > max_supply {
            panic!("Would exceed max supply");
        }
        
        // Transfer USDC
        let usdc: Address = env.storage().instance().get(&DataKey::USDCToken).unwrap();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        let token_client = token::Client::new(&env, &usdc);
        token_client.transfer(&buyer, &admin, &package.price_usdc);
        
        // Credit user
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
        
        // Check daily mint limit
        let day = env.ledger().timestamp() / 86400;
        let daily_key = DataKey::UserDailyMint(recipient.clone(), day);
        let today_minted: i128 = env.storage().temporary().get(&daily_key).unwrap_or(0);
        let daily_limit: i128 = env.storage().instance().get(&DataKey::DailyMintLimit).unwrap();
        
        if today_minted + amount > daily_limit {
            panic!("Would exceed daily mint limit");
        }
        
        // Check supply cap
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        let max_supply: i128 = env.storage().instance().get(&DataKey::MaxSupply).unwrap();
        if total_supply + amount > max_supply {
            panic!("Would exceed max supply");
        }
        
        // Update daily mint tracker
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
        
        // Reduce total supply
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap();
        env.storage().instance().set(&DataKey::TotalSupply, &(total_supply - amount));
        
        env.events().publish((symbol_short!("burn"), user), amount);
    }

    // === Admin Functions ===

    /// Create credit package
    pub fn create_package(
        env: Env,
        credits: i128,
        price_usdc: i128,
        bonus_credits: i128,
    ) -> u32 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        Self::internal_create_package(&env, credits, price_usdc, bonus_credits)
    }

    /// Update package
    pub fn update_package(
        env: Env,
        package_id: u32,
        credits: i128,
        price_usdc: i128,
        bonus_credits: i128,
        is_active: bool,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let package = CreditPackage {
            id: package_id,
            credits,
            price_usdc,
            bonus_credits,
            is_active,
        };
        
        env.storage().persistent().set(&DataKey::CreditPackage(package_id), &package);
    }

    /// Add minter role
    pub fn add_minter(env: Env, minter: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut minters: Vec<Address> = env.storage().instance().get(&DataKey::MinterRole).unwrap();
        minters.push_back(minter.clone());
        env.storage().instance().set(&DataKey::MinterRole, &minters);
        
        env.events().publish((symbol_short!("minter"),), minter);
    }

    /// Remove minter role
    pub fn remove_minter(env: Env, minter: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let minters: Vec<Address> = env.storage().instance().get(&DataKey::MinterRole).unwrap();
        let mut new_minters = Vec::new(&env);
        for i in 0..minters.len() {
            let m = minters.get(i).unwrap();
            if m != minter {
                new_minters.push_back(m);
            }
        }
        env.storage().instance().set(&DataKey::MinterRole, &new_minters);
    }

    /// Add burner role
    pub fn add_burner(env: Env, burner: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut burners: Vec<Address> = env.storage().instance().get(&DataKey::BurnerRole).unwrap();
        burners.push_back(burner.clone());
        env.storage().instance().set(&DataKey::BurnerRole, &burners);
    }

    /// Update limits
    pub fn set_limits(env: Env, max_supply: i128, daily_mint_limit: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::MaxSupply, &max_supply);
        env.storage().instance().set(&DataKey::DailyMintLimit, &daily_mint_limit);
    }

    /// Rotate admin
    pub fn rotate_admin(env: Env, new_admin: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        env.events().publish((symbol_short!("admin"),), new_admin);
    }

    /// Pause/unpause
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
                balance: 0,
                lifetime_earned: 0,
                lifetime_spent: 0,
                last_activity: 0,
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

    fn internal_create_package(env: &Env, credits: i128, price_usdc: i128, bonus_credits: i128) -> u32 {
        let counter: u32 = env.storage().instance().get(&DataKey::PackageCounter).unwrap_or(0);
        let new_id = counter + 1;
        
        let package = CreditPackage {
            id: new_id,
            credits,
            price_usdc,
            bonus_credits,
            is_active: true,
        };
        
        env.storage().persistent().set(&DataKey::CreditPackage(new_id), &package);
        env.storage().instance().set(&DataKey::PackageCounter, &new_id);
        
        new_id
    }

    fn internal_credit_user(env: &Env, user: &Address, amount: i128, tx_type: CreditTxType, description: String) {
        let mut credits: UserCredits = env.storage().persistent()
            .get(&DataKey::UserCredits(user.clone()))
            .unwrap_or(UserCredits {
                balance: 0,
                lifetime_earned: 0,
                lifetime_spent: 0,
                last_activity: 0,
            });
        
        credits.balance += amount;
        credits.lifetime_earned += amount;
        credits.last_activity = env.ledger().timestamp();
        
        env.storage().persistent().set(&DataKey::UserCredits(user.clone()), &credits);
        
        // Update total supply
        let total_supply: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(total_supply + amount));
        
        // Record transaction
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
        
        let tx = CreditTransaction {
            id: new_id,
            user,
            amount,
            tx_type,
            description,
            timestamp: env.ledger().timestamp(),
        };
        
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
            if &minters.get(i).unwrap() == addr {
                is_minter = true;
                break;
            }
        }
        if !is_minter {
            panic!("Not a minter");
        }
    }

    fn require_burner(env: &Env, addr: &Address) {
        let burners: Vec<Address> = env.storage().instance().get(&DataKey::BurnerRole).unwrap();
        let mut is_burner = false;
        for i in 0..burners.len() {
            if &burners.get(i).unwrap() == addr {
                is_burner = true;
                break;
            }
        }
        if !is_burner {
            panic!("Not a burner");
        }
    }
}
