#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, String, Symbol,
};
use soroban_token_sdk::metadata::TokenMetadata;
use soroban_token_sdk::TokenUtils;

/// Storage keys for the contract
#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    TotalSupply,
    Balance(Address),
    Allowance(Address, Address),
    Initialized,
    Decimals,
    Name,
    Symbol,
}

/// CCTR Token Contract - Native token for Cyber City Arcade
#[contract]
pub struct CCTRToken;

#[contractimpl]
impl CCTRToken {
    /// Initialize the CCTR token with admin and initial supply
    pub fn initialize(env: Env, admin: Address, initial_supply: i128) {
        // Ensure not already initialized
        if env.storage().instance().has(&DataKey::Initialized) {
            panic!("already initialized");
        }
        
        admin.require_auth();
        
        // Set metadata
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Decimals, &7u32);
        env.storage().instance().set(&DataKey::Name, &String::from_str(&env, "Cyber City Token"));
        env.storage().instance().set(&DataKey::Symbol, &String::from_str(&env, "CCTR"));
        env.storage().instance().set(&DataKey::TotalSupply, &initial_supply);
        env.storage().instance().set(&DataKey::Initialized, &true);
        
        // Mint initial supply to admin
        env.storage().persistent().set(&DataKey::Balance(admin.clone()), &initial_supply);
        
        // Emit mint event
        env.events().publish(
            (symbol_short!("mint"), admin.clone()),
            initial_supply,
        );
    }
    
    /// Get token name
    pub fn name(env: Env) -> String {
        env.storage().instance().get(&DataKey::Name).unwrap_or(String::from_str(&env, "CCTR"))
    }
    
    /// Get token symbol
    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&DataKey::Symbol).unwrap_or(String::from_str(&env, "CCTR"))
    }
    
    /// Get decimals
    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::Decimals).unwrap_or(7u32)
    }
    
    /// Get total supply
    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0)
    }
    
    /// Get balance of an address
    pub fn balance(env: Env, id: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Balance(id)).unwrap_or(0)
    }
    
    /// Get allowance
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Allowance(from, spender)).unwrap_or(0)
    }
    
    /// Approve spender to spend tokens
    pub fn approve(env: Env, from: Address, spender: Address, amount: i128, expiration_ledger: u32) {
        from.require_auth();
        
        if amount < 0 {
            panic!("amount cannot be negative");
        }
        
        env.storage().persistent().set(&DataKey::Allowance(from.clone(), spender.clone()), &amount);
        
        // Set expiration for the allowance
        env.storage().persistent().extend_ttl(
            &DataKey::Allowance(from.clone(), spender.clone()),
            expiration_ledger,
            expiration_ledger,
        );
        
        env.events().publish(
            (symbol_short!("approve"), from, spender),
            amount,
        );
    }
    
    /// Transfer tokens from sender to recipient
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        
        Self::spend_balance(&env, from.clone(), amount);
        Self::receive_balance(&env, to.clone(), amount);
        
        env.events().publish(
            (symbol_short!("transfer"), from, to),
            amount,
        );
    }
    
    /// Transfer tokens using allowance
    pub fn transfer_from(env: Env, spender: Address, from: Address, to: Address, amount: i128) {
        spender.require_auth();
        
        // Check and reduce allowance
        let allowance = Self::allowance(env.clone(), from.clone(), spender.clone());
        if allowance < amount {
            panic!("insufficient allowance");
        }
        
        let new_allowance = allowance - amount;
        env.storage().persistent().set(&DataKey::Allowance(from.clone(), spender.clone()), &new_allowance);
        
        Self::spend_balance(&env, from.clone(), amount);
        Self::receive_balance(&env, to.clone(), amount);
        
        env.events().publish(
            (symbol_short!("transfer"), from, to),
            amount,
        );
    }
    
    /// Mint new tokens (admin only)
    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        if amount < 0 {
            panic!("amount cannot be negative");
        }
        
        let total: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(total + amount));
        
        Self::receive_balance(&env, to.clone(), amount);
        
        env.events().publish(
            (symbol_short!("mint"), to),
            amount,
        );
    }
    
    /// Burn tokens
    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        
        if amount < 0 {
            panic!("amount cannot be negative");
        }
        
        Self::spend_balance(&env, from.clone(), amount);
        
        let total: i128 = env.storage().instance().get(&DataKey::TotalSupply).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSupply, &(total - amount));
        
        env.events().publish(
            (symbol_short!("burn"), from),
            amount,
        );
    }
    
    /// Set admin (admin only)
    pub fn set_admin(env: Env, new_admin: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        
        env.events().publish(
            (symbol_short!("set_adm"), new_admin.clone()),
            0i128,
        );
    }
    
    /// Get admin address
    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&DataKey::Admin).unwrap()
    }
    
    // Internal helper: spend balance
    fn spend_balance(env: &Env, from: Address, amount: i128) {
        if amount < 0 {
            panic!("amount cannot be negative");
        }
        
        let balance = env.storage().persistent().get(&DataKey::Balance(from.clone())).unwrap_or(0i128);
        if balance < amount {
            panic!("insufficient balance");
        }
        
        env.storage().persistent().set(&DataKey::Balance(from), &(balance - amount));
    }
    
    // Internal helper: receive balance
    fn receive_balance(env: &Env, to: Address, amount: i128) {
        let balance = env.storage().persistent().get(&DataKey::Balance(to.clone())).unwrap_or(0i128);
        env.storage().persistent().set(&DataKey::Balance(to), &(balance + amount));
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_initialize() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CCTRToken);
        let client = CCTRTokenClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let initial_supply = 1_000_000_000_0000000i128; // 1 billion with 7 decimals
        
        env.mock_all_auths();
        client.initialize(&admin, &initial_supply);
        
        assert_eq!(client.name(), String::from_str(&env, "Cyber City Token"));
        assert_eq!(client.symbol(), String::from_str(&env, "CCTR"));
        assert_eq!(client.decimals(), 7);
        assert_eq!(client.total_supply(), initial_supply);
        assert_eq!(client.balance(&admin), initial_supply);
    }

    #[test]
    fn test_transfer() {
        let env = Env::default();
        let contract_id = env.register_contract(None, CCTRToken);
        let client = CCTRTokenClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let user = Address::generate(&env);
        let initial_supply = 1_000_000_0000000i128;
        
        env.mock_all_auths();
        client.initialize(&admin, &initial_supply);
        
        let transfer_amount = 100_0000000i128;
        client.transfer(&admin, &user, &transfer_amount);
        
        assert_eq!(client.balance(&admin), initial_supply - transfer_amount);
        assert_eq!(client.balance(&user), transfer_amount);
    }
}
