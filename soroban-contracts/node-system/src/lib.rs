#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Vec, Map,
};

/// Node tiers with prices in CCTR (7 decimals)
#[derive(Clone, Copy, PartialEq, Eq)]
#[contracttype]
#[repr(u32)]
pub enum NodeTier {
    Basic = 0,
    Premium = 1,
    Legendary = 2,
}

/// Node configuration
#[derive(Clone)]
#[contracttype]
pub struct NodeConfig {
    pub price: i128,           // Price in CCTR
    pub daily_reward: i128,    // Daily reward in CCTR
    pub max_supply: u32,       // Maximum nodes available
    pub current_supply: u32,   // Currently minted nodes
}

/// User's node holding
#[derive(Clone)]
#[contracttype]
pub struct UserNode {
    pub tier: NodeTier,
    pub purchased_at: u64,
    pub last_claim: u64,
    pub total_claimed: i128,
}

/// Storage keys
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    CCTRToken,
    NodeConfig(NodeTier),
    UserNodes(Address),
    TotalNodes,
    TotalRewardsDistributed,
    Initialized,
    TreasuryAddress,
}

/// Node System Contract for purchasing and managing validator nodes
#[contract]
pub struct NodeSystem;

#[contractimpl]
impl NodeSystem {
    /// Initialize the node system
    pub fn initialize(env: Env, admin: Address, cctr_token: Address, treasury: Address) {
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("already initialized");
        }
        
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::CCTRToken, &cctr_token);
        env.storage().instance().set(&DataKey::TreasuryAddress, &treasury);
        env.storage().instance().set(&DataKey::TotalNodes, &0u32);
        env.storage().instance().set(&DataKey::TotalRewardsDistributed, &0i128);
        env.storage().instance().set(&DataKey::Initialized, &true);
        
        // Initialize node configurations (prices in CCTR with 7 decimals)
        // Basic: 1,000 CCTR, 5 CCTR/day
        env.storage().instance().set(&DataKey::NodeConfig(NodeTier::Basic), &NodeConfig {
            price: 1_000_0000000i128,
            daily_reward: 5_0000000i128,
            max_supply: 5000,
            current_supply: 0,
        });
        
        // Premium: 10,000 CCTR, 60 CCTR/day
        env.storage().instance().set(&DataKey::NodeConfig(NodeTier::Premium), &NodeConfig {
            price: 10_000_0000000i128,
            daily_reward: 60_0000000i128,
            max_supply: 2000,
            current_supply: 0,
        });
        
        // Legendary: 100,000 CCTR, 700 CCTR/day
        env.storage().instance().set(&DataKey::NodeConfig(NodeTier::Legendary), &NodeConfig {
            price: 100_000_0000000i128,
            daily_reward: 700_0000000i128,
            max_supply: 100,
            current_supply: 0,
        });
    }
    
    /// Purchase a node
    pub fn purchase_node(env: Env, buyer: Address, tier: NodeTier) {
        buyer.require_auth();
        
        // Get node config
        let mut config: NodeConfig = env.storage().instance()
            .get(&DataKey::NodeConfig(tier.clone()))
            .unwrap();
        
        // Check supply
        if config.current_supply >= config.max_supply {
            panic!("node tier sold out");
        }
        
        // Get CCTR token contract
        let cctr_token: Address = env.storage().instance().get(&DataKey::CCTRToken).unwrap();
        let treasury: Address = env.storage().instance().get(&DataKey::TreasuryAddress).unwrap();
        
        // Transfer CCTR from buyer to treasury
        let token_client = token::Client::new(&env, &cctr_token);
        token_client.transfer(&buyer, &treasury, &config.price);
        
        // Update node config
        config.current_supply += 1;
        env.storage().instance().set(&DataKey::NodeConfig(tier.clone()), &config);
        
        // Create or update user node
        let current_time = env.ledger().timestamp();
        let mut user_nodes: Vec<UserNode> = env.storage().persistent()
            .get(&DataKey::UserNodes(buyer.clone()))
            .unwrap_or(Vec::new(&env));
        
        user_nodes.push_back(UserNode {
            tier: tier.clone(),
            purchased_at: current_time,
            last_claim: current_time,
            total_claimed: 0,
        });
        
        env.storage().persistent().set(&DataKey::UserNodes(buyer.clone()), &user_nodes);
        
        // Update total nodes
        let total: u32 = env.storage().instance().get(&DataKey::TotalNodes).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalNodes, &(total + 1));
        
        env.events().publish(
            (symbol_short!("node_buy"), buyer, tier as u32),
            config.price,
        );
    }
    
    /// Claim rewards for all nodes owned by user
    pub fn claim_rewards(env: Env, user: Address) -> i128 {
        user.require_auth();
        
        let mut user_nodes: Vec<UserNode> = env.storage().persistent()
            .get(&DataKey::UserNodes(user.clone()))
            .unwrap_or(Vec::new(&env));
        
        if user_nodes.is_empty() {
            panic!("no nodes owned");
        }
        
        let current_time = env.ledger().timestamp();
        let mut total_rewards: i128 = 0;
        let seconds_per_day: u64 = 86400;
        
        // Calculate and update rewards for each node
        let mut updated_nodes: Vec<UserNode> = Vec::new(&env);
        
        for i in 0..user_nodes.len() {
            let mut node = user_nodes.get(i).unwrap();
            let config: NodeConfig = env.storage().instance()
                .get(&DataKey::NodeConfig(node.tier.clone()))
                .unwrap();
            
            // Calculate days since last claim
            let time_elapsed = current_time - node.last_claim;
            let days_elapsed = time_elapsed / seconds_per_day;
            
            if days_elapsed > 0 {
                let reward = (days_elapsed as i128) * config.daily_reward;
                total_rewards += reward;
                node.last_claim = current_time;
                node.total_claimed += reward;
            }
            
            updated_nodes.push_back(node);
        }
        
        if total_rewards == 0 {
            panic!("no rewards available yet");
        }
        
        // Update user nodes
        env.storage().persistent().set(&DataKey::UserNodes(user.clone()), &updated_nodes);
        
        // Mint rewards to user from CCTR token
        let cctr_token: Address = env.storage().instance().get(&DataKey::CCTRToken).unwrap();
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        
        // Note: In production, this would call mint on the CCTR contract
        // For now, transfer from treasury
        let treasury: Address = env.storage().instance().get(&DataKey::TreasuryAddress).unwrap();
        let token_client = token::Client::new(&env, &cctr_token);
        token_client.transfer(&treasury, &user, &total_rewards);
        
        // Update total distributed
        let total_distributed: i128 = env.storage().instance()
            .get(&DataKey::TotalRewardsDistributed)
            .unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalRewardsDistributed, &(total_distributed + total_rewards));
        
        env.events().publish(
            (symbol_short!("claim"), user),
            total_rewards,
        );
        
        total_rewards
    }
    
    /// Get pending rewards for a user
    pub fn pending_rewards(env: Env, user: Address) -> i128 {
        let user_nodes: Vec<UserNode> = env.storage().persistent()
            .get(&DataKey::UserNodes(user))
            .unwrap_or(Vec::new(&env));
        
        let current_time = env.ledger().timestamp();
        let seconds_per_day: u64 = 86400;
        let mut total_rewards: i128 = 0;
        
        for i in 0..user_nodes.len() {
            let node = user_nodes.get(i).unwrap();
            let config: NodeConfig = env.storage().instance()
                .get(&DataKey::NodeConfig(node.tier.clone()))
                .unwrap();
            
            let time_elapsed = current_time - node.last_claim;
            let days_elapsed = time_elapsed / seconds_per_day;
            
            if days_elapsed > 0 {
                total_rewards += (days_elapsed as i128) * config.daily_reward;
            }
        }
        
        total_rewards
    }
    
    /// Get user's nodes
    pub fn get_user_nodes(env: Env, user: Address) -> Vec<UserNode> {
        env.storage().persistent()
            .get(&DataKey::UserNodes(user))
            .unwrap_or(Vec::new(&env))
    }
    
    /// Get node configuration for a tier
    pub fn get_node_config(env: Env, tier: NodeTier) -> NodeConfig {
        env.storage().instance().get(&DataKey::NodeConfig(tier)).unwrap()
    }
    
    /// Get total nodes sold
    pub fn total_nodes(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::TotalNodes).unwrap_or(0)
    }
    
    /// Get total rewards distributed
    pub fn total_rewards_distributed(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalRewardsDistributed).unwrap_or(0)
    }
    
    /// Update node config (admin only)
    pub fn update_node_config(env: Env, tier: NodeTier, price: i128, daily_reward: i128, max_supply: u32) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut config: NodeConfig = env.storage().instance()
            .get(&DataKey::NodeConfig(tier.clone()))
            .unwrap();
        
        config.price = price;
        config.daily_reward = daily_reward;
        config.max_supply = max_supply;
        
        env.storage().instance().set(&DataKey::NodeConfig(tier), &config);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, NodeSystem);
        let client = NodeSystemClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let cctr_token = Address::generate(&env);
        let treasury = Address::generate(&env);
        
        env.mock_all_auths();
        client.initialize(&admin, &cctr_token, &treasury);
        
        let basic_config = client.get_node_config(&NodeTier::Basic);
        assert_eq!(basic_config.price, 1_000_0000000i128);
        assert_eq!(basic_config.max_supply, 5000);
    }
}
