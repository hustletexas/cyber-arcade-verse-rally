#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, Env, Map, String, Symbol, Vec,
};

/// Pass tiers with different access levels
#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum PassTier {
    Bronze,    // Basic tournament access
    Silver,    // Premium servers + tournaments
    Gold,      // VIP perks + all access
    Platinum,  // Season pass + exclusive events
}

/// Pass metadata and ownership info
#[contracttype]
#[derive(Clone)]
pub struct PassInfo {
    pub owner: Address,
    pub tier: PassTier,
    pub issued_at: u64,
    pub expires_at: u64,         // 0 = never expires
    pub is_soulbound: bool,      // Non-transferable if true
    pub metadata_uri: String,
    pub traits: Map<Symbol, String>,
}

/// Access gate for specific features/tournaments
#[contracttype]
#[derive(Clone)]
pub struct AccessGate {
    pub required_tier: PassTier,
    pub required_traits: Vec<Symbol>,
    pub is_active: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    AttestationKey,     // Separate signing key for attestations
    PassCounter,
    Pass(u64),          // pass_id -> PassInfo
    OwnerPasses(Address), // owner -> Vec<pass_id>
    AccessGate(Symbol),   // gate_id -> AccessGate
    TierPrice(PassTier),  // tier -> price in CCTR
    Paused,
}

#[contract]
pub struct NFTPassContract;

#[contractimpl]
impl NFTPassContract {
    /// Initialize the NFT Pass contract
    pub fn initialize(
        env: Env,
        admin: Address,
        attestation_key: Address,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::AttestationKey, &attestation_key);
        env.storage().instance().set(&DataKey::PassCounter, &0u64);
        env.storage().instance().set(&DataKey::Paused, &false);
        
        // Default tier prices (in CCTR with 7 decimals)
        env.storage().instance().set(&DataKey::TierPrice(PassTier::Bronze), &100_0000000i128);
        env.storage().instance().set(&DataKey::TierPrice(PassTier::Silver), &500_0000000i128);
        env.storage().instance().set(&DataKey::TierPrice(PassTier::Gold), &2000_0000000i128);
        env.storage().instance().set(&DataKey::TierPrice(PassTier::Platinum), &10000_0000000i128);
    }

    /// Mint a new NFT pass
    pub fn mint_pass(
        env: Env,
        recipient: Address,
        tier: PassTier,
        is_soulbound: bool,
        expires_at: u64,
        metadata_uri: String,
        cctr_token: Address,
    ) -> u64 {
        recipient.require_auth();
        Self::require_not_paused(&env);
        
        let price: i128 = env.storage().instance().get(&DataKey::TierPrice(tier.clone())).unwrap();
        
        // Transfer CCTR payment
        let token_client = token::Client::new(&env, &cctr_token);
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        token_client.transfer(&recipient, &admin, &price);
        
        // Generate pass ID
        let pass_id: u64 = env.storage().instance().get(&DataKey::PassCounter).unwrap_or(0);
        let new_pass_id = pass_id + 1;
        
        let pass_info = PassInfo {
            owner: recipient.clone(),
            tier,
            issued_at: env.ledger().timestamp(),
            expires_at,
            is_soulbound,
            metadata_uri,
            traits: Map::new(&env),
        };
        
        // Store pass
        env.storage().persistent().set(&DataKey::Pass(new_pass_id), &pass_info);
        
        // Update owner's passes list
        let mut owner_passes: Vec<u64> = env.storage().persistent()
            .get(&DataKey::OwnerPasses(recipient.clone()))
            .unwrap_or(Vec::new(&env));
        owner_passes.push_back(new_pass_id);
        env.storage().persistent().set(&DataKey::OwnerPasses(recipient.clone()), &owner_passes);
        
        env.storage().instance().set(&DataKey::PassCounter, &new_pass_id);
        
        env.events().publish((symbol_short!("mint"), recipient), new_pass_id);
        
        new_pass_id
    }

    /// Admin mint (free mint for airdrops/rewards)
    pub fn admin_mint(
        env: Env,
        recipient: Address,
        tier: PassTier,
        is_soulbound: bool,
        expires_at: u64,
        metadata_uri: String,
    ) -> u64 {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        Self::require_not_paused(&env);
        
        let pass_id: u64 = env.storage().instance().get(&DataKey::PassCounter).unwrap_or(0);
        let new_pass_id = pass_id + 1;
        
        let pass_info = PassInfo {
            owner: recipient.clone(),
            tier,
            issued_at: env.ledger().timestamp(),
            expires_at,
            is_soulbound,
            metadata_uri,
            traits: Map::new(&env),
        };
        
        env.storage().persistent().set(&DataKey::Pass(new_pass_id), &pass_info);
        
        let mut owner_passes: Vec<u64> = env.storage().persistent()
            .get(&DataKey::OwnerPasses(recipient.clone()))
            .unwrap_or(Vec::new(&env));
        owner_passes.push_back(new_pass_id);
        env.storage().persistent().set(&DataKey::OwnerPasses(recipient.clone()), &owner_passes);
        
        env.storage().instance().set(&DataKey::PassCounter, &new_pass_id);
        
        env.events().publish((symbol_short!("admin_mnt"), recipient), new_pass_id);
        
        new_pass_id
    }

    /// Transfer a pass (fails if soulbound)
    pub fn transfer(env: Env, pass_id: u64, from: Address, to: Address) {
        from.require_auth();
        Self::require_not_paused(&env);
        
        let mut pass_info: PassInfo = env.storage().persistent()
            .get(&DataKey::Pass(pass_id))
            .expect("Pass not found");
        
        if pass_info.owner != from {
            panic!("Not the owner");
        }
        
        if pass_info.is_soulbound {
            panic!("Pass is soulbound and cannot be transferred");
        }
        
        // Check expiration
        if pass_info.expires_at > 0 && env.ledger().timestamp() > pass_info.expires_at {
            panic!("Pass has expired");
        }
        
        // Update ownership
        pass_info.owner = to.clone();
        env.storage().persistent().set(&DataKey::Pass(pass_id), &pass_info);
        
        // Update from's pass list
        let mut from_passes: Vec<u64> = env.storage().persistent()
            .get(&DataKey::OwnerPasses(from.clone()))
            .unwrap_or(Vec::new(&env));
        
        let mut new_from_passes = Vec::new(&env);
        for i in 0..from_passes.len() {
            let pid = from_passes.get(i).unwrap();
            if pid != pass_id {
                new_from_passes.push_back(pid);
            }
        }
        env.storage().persistent().set(&DataKey::OwnerPasses(from.clone()), &new_from_passes);
        
        // Update to's pass list
        let mut to_passes: Vec<u64> = env.storage().persistent()
            .get(&DataKey::OwnerPasses(to.clone()))
            .unwrap_or(Vec::new(&env));
        to_passes.push_back(pass_id);
        env.storage().persistent().set(&DataKey::OwnerPasses(to.clone()), &to_passes);
        
        env.events().publish((symbol_short!("transfer"), from, to), pass_id);
    }

    /// Add trait to a pass (admin only)
    pub fn add_trait(env: Env, pass_id: u64, trait_key: Symbol, trait_value: String) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut pass_info: PassInfo = env.storage().persistent()
            .get(&DataKey::Pass(pass_id))
            .expect("Pass not found");
        
        pass_info.traits.set(trait_key.clone(), trait_value);
        env.storage().persistent().set(&DataKey::Pass(pass_id), &pass_info);
        
        env.events().publish((symbol_short!("trait"), pass_id), trait_key);
    }

    /// Check if address has access through a specific gate
    pub fn check_access(env: Env, user: Address, gate_id: Symbol) -> bool {
        let gate: AccessGate = match env.storage().persistent().get(&DataKey::AccessGate(gate_id)) {
            Some(g) => g,
            None => return false,
        };
        
        if !gate.is_active {
            return false;
        }
        
        let owner_passes: Vec<u64> = env.storage().persistent()
            .get(&DataKey::OwnerPasses(user))
            .unwrap_or(Vec::new(&env));
        
        for i in 0..owner_passes.len() {
            let pass_id = owner_passes.get(i).unwrap();
            let pass_info: PassInfo = match env.storage().persistent().get(&DataKey::Pass(pass_id)) {
                Some(p) => p,
                None => continue,
            };
            
            // Check expiration
            if pass_info.expires_at > 0 && env.ledger().timestamp() > pass_info.expires_at {
                continue;
            }
            
            // Check tier
            if Self::tier_to_level(&pass_info.tier) >= Self::tier_to_level(&gate.required_tier) {
                // Check required traits
                let mut has_all_traits = true;
                for j in 0..gate.required_traits.len() {
                    let required_trait = gate.required_traits.get(j).unwrap();
                    if !pass_info.traits.contains_key(required_trait) {
                        has_all_traits = false;
                        break;
                    }
                }
                
                if has_all_traits {
                    return true;
                }
            }
        }
        
        false
    }

    /// Create an access gate (admin only)
    pub fn create_gate(
        env: Env,
        gate_id: Symbol,
        required_tier: PassTier,
        required_traits: Vec<Symbol>,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let gate = AccessGate {
            required_tier,
            required_traits,
            is_active: true,
        };
        
        env.storage().persistent().set(&DataKey::AccessGate(gate_id.clone()), &gate);
        
        env.events().publish((symbol_short!("gate"),), gate_id);
    }

    /// Toggle gate status (admin only)
    pub fn toggle_gate(env: Env, gate_id: Symbol, is_active: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut gate: AccessGate = env.storage().persistent()
            .get(&DataKey::AccessGate(gate_id.clone()))
            .expect("Gate not found");
        
        gate.is_active = is_active;
        env.storage().persistent().set(&DataKey::AccessGate(gate_id), &gate);
    }

    /// Update tier price (admin only)
    pub fn set_tier_price(env: Env, tier: PassTier, price: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::TierPrice(tier), &price);
    }

    /// Rotate admin key
    pub fn rotate_admin(env: Env, new_admin: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Admin, &new_admin);
        
        env.events().publish((symbol_short!("admin"),), new_admin);
    }

    /// Rotate attestation key
    pub fn rotate_attestation_key(env: Env, new_key: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::AttestationKey, &new_key);
        
        env.events().publish((symbol_short!("attest_k"),), new_key);
    }

    /// Pause/unpause contract (admin only)
    pub fn set_paused(env: Env, paused: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Paused, &paused);
    }

    // === View Functions ===

    pub fn get_pass(env: Env, pass_id: u64) -> PassInfo {
        env.storage().persistent().get(&DataKey::Pass(pass_id)).expect("Pass not found")
    }

    pub fn get_owner_passes(env: Env, owner: Address) -> Vec<u64> {
        env.storage().persistent().get(&DataKey::OwnerPasses(owner)).unwrap_or(Vec::new(&env))
    }

    pub fn get_tier_price(env: Env, tier: PassTier) -> i128 {
        env.storage().instance().get(&DataKey::TierPrice(tier)).unwrap_or(0)
    }

    pub fn get_gate(env: Env, gate_id: Symbol) -> AccessGate {
        env.storage().persistent().get(&DataKey::AccessGate(gate_id)).expect("Gate not found")
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
    }

    // === Internal Functions ===

    fn require_not_paused(env: &Env) {
        let paused: bool = env.storage().instance().get(&DataKey::Paused).unwrap_or(false);
        if paused {
            panic!("Contract is paused");
        }
    }

    fn tier_to_level(tier: &PassTier) -> u32 {
        match tier {
            PassTier::Bronze => 1,
            PassTier::Silver => 2,
            PassTier::Gold => 3,
            PassTier::Platinum => 4,
        }
    }
}
