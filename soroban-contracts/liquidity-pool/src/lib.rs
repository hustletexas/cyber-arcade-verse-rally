#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Vec, BytesN,
};

/// Pool pair configuration
#[derive(Clone)]
#[contracttype]
pub struct PoolConfig {
    pub token_a: Address,
    pub token_b: Address,
    pub reserve_a: i128,
    pub reserve_b: i128,
    pub total_shares: i128,
    pub fee_bps: u32,  // Fee in basis points (e.g., 30 = 0.3%)
}

/// User's LP position
#[derive(Clone)]
#[contracttype]
pub struct LPPosition {
    pub shares: i128,
    pub deposited_at: u64,
}

/// Staking pool for LP tokens
#[derive(Clone)]
#[contracttype]
pub struct StakingPool {
    pub lp_token: BytesN<32>,
    pub reward_token: Address,
    pub total_staked: i128,
    pub reward_rate: i128,      // Rewards per day
    pub lock_period: u64,       // Lock period in seconds
}

/// User's staking position
#[derive(Clone)]
#[contracttype]
pub struct StakingPosition {
    pub amount: i128,
    pub staked_at: u64,
    pub last_claim: u64,
    pub rewards_claimed: i128,
}

/// Storage keys
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Pool(BytesN<32>),           // Pool ID -> PoolConfig
    UserLP(Address, BytesN<32>), // User + Pool ID -> LPPosition
    StakingPool(BytesN<32>),    // Staking Pool ID -> StakingPool
    UserStake(Address, BytesN<32>), // User + Pool ID -> StakingPosition
    TotalPools,
    Initialized,
}

/// Liquidity Pool Contract
#[contract]
pub struct LiquidityPool;

#[contractimpl]
impl LiquidityPool {
    /// Initialize the liquidity pool contract
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("already initialized");
        }
        
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::TotalPools, &0u32);
        env.storage().instance().set(&DataKey::Initialized, &true);
    }
    
    /// Create a new liquidity pool
    pub fn create_pool(
        env: Env,
        token_a: Address,
        token_b: Address,
        fee_bps: u32,
    ) -> BytesN<32> {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        // Generate pool ID from token addresses
        let pool_id = env.crypto().sha256(&(token_a.clone(), token_b.clone()).into());
        
        let config = PoolConfig {
            token_a: token_a.clone(),
            token_b: token_b.clone(),
            reserve_a: 0,
            reserve_b: 0,
            total_shares: 0,
            fee_bps,
        };
        
        env.storage().persistent().set(&DataKey::Pool(pool_id.clone()), &config);
        
        let total: u32 = env.storage().instance().get(&DataKey::TotalPools).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalPools, &(total + 1));
        
        env.events().publish(
            (symbol_short!("pool_new"), token_a, token_b),
            fee_bps,
        );
        
        pool_id
    }
    
    /// Add liquidity to a pool
    pub fn add_liquidity(
        env: Env,
        user: Address,
        pool_id: BytesN<32>,
        amount_a: i128,
        amount_b: i128,
        min_shares: i128,
    ) -> i128 {
        user.require_auth();
        
        let mut config: PoolConfig = env.storage().persistent()
            .get(&DataKey::Pool(pool_id.clone()))
            .expect("pool not found");
        
        // Calculate shares to mint
        let shares = if config.total_shares == 0 {
            // Initial liquidity
            Self::sqrt((amount_a * amount_b) as u128) as i128
        } else {
            // Proportional to existing liquidity
            let shares_a = (amount_a * config.total_shares) / config.reserve_a;
            let shares_b = (amount_b * config.total_shares) / config.reserve_b;
            if shares_a < shares_b { shares_a } else { shares_b }
        };
        
        if shares < min_shares {
            panic!("slippage too high");
        }
        
        // Transfer tokens from user
        let token_a_client = token::Client::new(&env, &config.token_a);
        let token_b_client = token::Client::new(&env, &config.token_b);
        
        token_a_client.transfer(&user, &env.current_contract_address(), &amount_a);
        token_b_client.transfer(&user, &env.current_contract_address(), &amount_b);
        
        // Update pool reserves
        config.reserve_a += amount_a;
        config.reserve_b += amount_b;
        config.total_shares += shares;
        
        env.storage().persistent().set(&DataKey::Pool(pool_id.clone()), &config);
        
        // Update user LP position
        let mut position: LPPosition = env.storage().persistent()
            .get(&DataKey::UserLP(user.clone(), pool_id.clone()))
            .unwrap_or(LPPosition {
                shares: 0,
                deposited_at: env.ledger().timestamp(),
            });
        
        position.shares += shares;
        env.storage().persistent().set(&DataKey::UserLP(user.clone(), pool_id.clone()), &position);
        
        env.events().publish(
            (symbol_short!("add_liq"), user, pool_id),
            shares,
        );
        
        shares
    }
    
    /// Remove liquidity from a pool
    pub fn remove_liquidity(
        env: Env,
        user: Address,
        pool_id: BytesN<32>,
        shares: i128,
        min_a: i128,
        min_b: i128,
    ) -> (i128, i128) {
        user.require_auth();
        
        let mut config: PoolConfig = env.storage().persistent()
            .get(&DataKey::Pool(pool_id.clone()))
            .expect("pool not found");
        
        let mut position: LPPosition = env.storage().persistent()
            .get(&DataKey::UserLP(user.clone(), pool_id.clone()))
            .expect("no LP position");
        
        if position.shares < shares {
            panic!("insufficient shares");
        }
        
        // Calculate tokens to return
        let amount_a = (shares * config.reserve_a) / config.total_shares;
        let amount_b = (shares * config.reserve_b) / config.total_shares;
        
        if amount_a < min_a || amount_b < min_b {
            panic!("slippage too high");
        }
        
        // Transfer tokens to user
        let token_a_client = token::Client::new(&env, &config.token_a);
        let token_b_client = token::Client::new(&env, &config.token_b);
        
        token_a_client.transfer(&env.current_contract_address(), &user, &amount_a);
        token_b_client.transfer(&env.current_contract_address(), &user, &amount_b);
        
        // Update pool
        config.reserve_a -= amount_a;
        config.reserve_b -= amount_b;
        config.total_shares -= shares;
        
        env.storage().persistent().set(&DataKey::Pool(pool_id.clone()), &config);
        
        // Update user position
        position.shares -= shares;
        env.storage().persistent().set(&DataKey::UserLP(user.clone(), pool_id.clone()), &position);
        
        env.events().publish(
            (symbol_short!("rem_liq"), user, pool_id),
            shares,
        );
        
        (amount_a, amount_b)
    }
    
    /// Swap tokens
    pub fn swap(
        env: Env,
        user: Address,
        pool_id: BytesN<32>,
        token_in: Address,
        amount_in: i128,
        min_out: i128,
    ) -> i128 {
        user.require_auth();
        
        let mut config: PoolConfig = env.storage().persistent()
            .get(&DataKey::Pool(pool_id.clone()))
            .expect("pool not found");
        
        let (reserve_in, reserve_out, is_a_to_b) = if token_in == config.token_a {
            (config.reserve_a, config.reserve_b, true)
        } else if token_in == config.token_b {
            (config.reserve_b, config.reserve_a, false)
        } else {
            panic!("invalid token");
        };
        
        // Calculate output with fee
        let amount_in_with_fee = amount_in * (10000 - config.fee_bps as i128) / 10000;
        let amount_out = (amount_in_with_fee * reserve_out) / (reserve_in + amount_in_with_fee);
        
        if amount_out < min_out {
            panic!("slippage too high");
        }
        
        // Transfer tokens
        let token_in_client = token::Client::new(&env, &token_in);
        token_in_client.transfer(&user, &env.current_contract_address(), &amount_in);
        
        let token_out = if is_a_to_b { config.token_b.clone() } else { config.token_a.clone() };
        let token_out_client = token::Client::new(&env, &token_out);
        token_out_client.transfer(&env.current_contract_address(), &user, &amount_out);
        
        // Update reserves
        if is_a_to_b {
            config.reserve_a += amount_in;
            config.reserve_b -= amount_out;
        } else {
            config.reserve_b += amount_in;
            config.reserve_a -= amount_out;
        }
        
        env.storage().persistent().set(&DataKey::Pool(pool_id.clone()), &config);
        
        env.events().publish(
            (symbol_short!("swap"), user, pool_id),
            (amount_in, amount_out),
        );
        
        amount_out
    }
    
    /// Create LP staking pool
    pub fn create_staking_pool(
        env: Env,
        pool_id: BytesN<32>,
        reward_token: Address,
        reward_rate: i128,
        lock_period: u64,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let staking_pool = StakingPool {
            lp_token: pool_id.clone(),
            reward_token,
            total_staked: 0,
            reward_rate,
            lock_period,
        };
        
        env.storage().persistent().set(&DataKey::StakingPool(pool_id.clone()), &staking_pool);
    }
    
    /// Stake LP tokens
    pub fn stake_lp(env: Env, user: Address, pool_id: BytesN<32>, amount: i128) {
        user.require_auth();
        
        let position: LPPosition = env.storage().persistent()
            .get(&DataKey::UserLP(user.clone(), pool_id.clone()))
            .expect("no LP position");
        
        if position.shares < amount {
            panic!("insufficient LP tokens");
        }
        
        let mut staking_pool: StakingPool = env.storage().persistent()
            .get(&DataKey::StakingPool(pool_id.clone()))
            .expect("staking pool not found");
        
        let current_time = env.ledger().timestamp();
        
        // Create or update staking position
        let mut stake: StakingPosition = env.storage().persistent()
            .get(&DataKey::UserStake(user.clone(), pool_id.clone()))
            .unwrap_or(StakingPosition {
                amount: 0,
                staked_at: current_time,
                last_claim: current_time,
                rewards_claimed: 0,
            });
        
        stake.amount += amount;
        staking_pool.total_staked += amount;
        
        env.storage().persistent().set(&DataKey::UserStake(user.clone(), pool_id.clone()), &stake);
        env.storage().persistent().set(&DataKey::StakingPool(pool_id.clone()), &staking_pool);
        
        env.events().publish(
            (symbol_short!("stake"), user, pool_id),
            amount,
        );
    }
    
    /// Claim staking rewards
    pub fn claim_staking_rewards(env: Env, user: Address, pool_id: BytesN<32>) -> i128 {
        user.require_auth();
        
        let staking_pool: StakingPool = env.storage().persistent()
            .get(&DataKey::StakingPool(pool_id.clone()))
            .expect("staking pool not found");
        
        let mut stake: StakingPosition = env.storage().persistent()
            .get(&DataKey::UserStake(user.clone(), pool_id.clone()))
            .expect("no staking position");
        
        let current_time = env.ledger().timestamp();
        let seconds_per_day: u64 = 86400;
        let time_elapsed = current_time - stake.last_claim;
        let days_elapsed = time_elapsed / seconds_per_day;
        
        if days_elapsed == 0 {
            panic!("no rewards available");
        }
        
        // Calculate rewards proportional to stake
        let user_share = (stake.amount * 10000) / staking_pool.total_staked;
        let rewards = (staking_pool.reward_rate * days_elapsed as i128 * user_share) / 10000;
        
        // Transfer rewards
        let token_client = token::Client::new(&env, &staking_pool.reward_token);
        token_client.transfer(&env.current_contract_address(), &user, &rewards);
        
        stake.last_claim = current_time;
        stake.rewards_claimed += rewards;
        
        env.storage().persistent().set(&DataKey::UserStake(user.clone(), pool_id.clone()), &stake);
        
        env.events().publish(
            (symbol_short!("stake_rw"), user, pool_id),
            rewards,
        );
        
        rewards
    }
    
    /// Get pool configuration
    pub fn get_pool(env: Env, pool_id: BytesN<32>) -> PoolConfig {
        env.storage().persistent().get(&DataKey::Pool(pool_id)).expect("pool not found")
    }
    
    /// Get user LP position
    pub fn get_lp_position(env: Env, user: Address, pool_id: BytesN<32>) -> LPPosition {
        env.storage().persistent()
            .get(&DataKey::UserLP(user, pool_id))
            .unwrap_or(LPPosition { shares: 0, deposited_at: 0 })
    }
    
    /// Get user staking position
    pub fn get_staking_position(env: Env, user: Address, pool_id: BytesN<32>) -> StakingPosition {
        env.storage().persistent()
            .get(&DataKey::UserStake(user, pool_id))
            .unwrap_or(StakingPosition {
                amount: 0,
                staked_at: 0,
                last_claim: 0,
                rewards_claimed: 0,
            })
    }
    
    /// Get quote for swap
    pub fn get_swap_quote(
        env: Env,
        pool_id: BytesN<32>,
        token_in: Address,
        amount_in: i128,
    ) -> i128 {
        let config: PoolConfig = env.storage().persistent()
            .get(&DataKey::Pool(pool_id))
            .expect("pool not found");
        
        let (reserve_in, reserve_out) = if token_in == config.token_a {
            (config.reserve_a, config.reserve_b)
        } else {
            (config.reserve_b, config.reserve_a)
        };
        
        let amount_in_with_fee = amount_in * (10000 - config.fee_bps as i128) / 10000;
        (amount_in_with_fee * reserve_out) / (reserve_in + amount_in_with_fee)
    }
    
    // Helper: integer square root
    fn sqrt(n: u128) -> u128 {
        if n == 0 { return 0; }
        let mut x = n;
        let mut y = (x + 1) / 2;
        while y < x {
            x = y;
            y = (x + n / x) / 2;
        }
        x
    }
}
