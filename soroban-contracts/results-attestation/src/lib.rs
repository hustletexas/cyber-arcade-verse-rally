#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, Map, String, Vec,
};

/// Match result attestation
#[contracttype]
#[derive(Clone)]
pub struct MatchAttestation {
    pub tournament_id: BytesN<32>,
    pub match_id: BytesN<32>,
    pub result_hash: BytesN<32>,    // Hash of final results (computed off-chain)
    pub winner: Address,
    pub participants: Vec<Address>,
    pub scores: Map<Address, i64>,
    pub metadata_hash: BytesN<32>,  // Hash of additional metadata (replays, etc.)
    pub attested_at: u64,
    pub attested_by: Address,       // Attestation key that signed
}

/// Tournament summary attestation
#[contracttype]
#[derive(Clone)]
pub struct TournamentAttestation {
    pub tournament_id: BytesN<32>,
    pub final_results_hash: BytesN<32>,
    pub total_matches: u32,
    pub winner: Address,
    pub runner_up: Address,
    pub prize_distribution_hash: BytesN<32>,
    pub finalized_at: u64,
    pub finalized_by: Address,
}

/// Dispute record
#[contracttype]
#[derive(Clone)]
pub struct Dispute {
    pub id: u64,
    pub match_id: BytesN<32>,
    pub challenger: Address,
    pub reason_hash: BytesN<32>,
    pub created_at: u64,
    pub resolved: bool,
    pub resolution_hash: BytesN<32>,
    pub resolved_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    AttestationKeys,                // Vec<Address> - authorized attesters
    Match(BytesN<32>),              // match_id -> MatchAttestation
    Tournament(BytesN<32>),         // tournament_id -> TournamentAttestation
    TournamentMatches(BytesN<32>),  // tournament_id -> Vec<match_id>
    Dispute(u64),
    DisputeCounter,
    MatchDisputes(BytesN<32>),      // match_id -> Vec<dispute_id>
    Paused,
}

#[contract]
pub struct ResultsAttestationContract;

#[contractimpl]
impl ResultsAttestationContract {
    /// Initialize the Results Attestation contract
    pub fn initialize(env: Env, admin: Address, attestation_keys: Vec<Address>) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        
        if attestation_keys.is_empty() {
            panic!("Must have at least one attestation key");
        }
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::AttestationKeys, &attestation_keys);
        env.storage().instance().set(&DataKey::DisputeCounter, &0u64);
        env.storage().instance().set(&DataKey::Paused, &false);
    }

    /// Attest a match result (creates immutable record)
    pub fn attest_match(
        env: Env,
        attester: Address,
        tournament_id: BytesN<32>,
        match_id: BytesN<32>,
        result_hash: BytesN<32>,
        winner: Address,
        participants: Vec<Address>,
        scores: Map<Address, i64>,
        metadata_hash: BytesN<32>,
    ) {
        attester.require_auth();
        Self::require_attestation_key(&env, &attester);
        Self::require_not_paused(&env);
        
        // Check match doesn't already exist (immutable)
        if env.storage().persistent().has(&DataKey::Match(match_id.clone())) {
            panic!("Match already attested - results are immutable");
        }
        
        let attestation = MatchAttestation {
            tournament_id: tournament_id.clone(),
            match_id: match_id.clone(),
            result_hash,
            winner: winner.clone(),
            participants,
            scores,
            metadata_hash,
            attested_at: env.ledger().timestamp(),
            attested_by: attester.clone(),
        };
        
        // Store attestation (immutable)
        env.storage().persistent().set(&DataKey::Match(match_id.clone()), &attestation);
        
        // Add to tournament's match list
        let mut tournament_matches: Vec<BytesN<32>> = env.storage().persistent()
            .get(&DataKey::TournamentMatches(tournament_id.clone()))
            .unwrap_or(Vec::new(&env));
        tournament_matches.push_back(match_id.clone());
        env.storage().persistent().set(&DataKey::TournamentMatches(tournament_id.clone()), &tournament_matches);
        
        env.events().publish((symbol_short!("match"), tournament_id, match_id), winner);
    }

    /// Attest tournament final results
    pub fn attest_tournament(
        env: Env,
        attester: Address,
        tournament_id: BytesN<32>,
        final_results_hash: BytesN<32>,
        total_matches: u32,
        winner: Address,
        runner_up: Address,
        prize_distribution_hash: BytesN<32>,
    ) {
        attester.require_auth();
        Self::require_attestation_key(&env, &attester);
        Self::require_not_paused(&env);
        
        if env.storage().persistent().has(&DataKey::Tournament(tournament_id.clone())) {
            panic!("Tournament already attested");
        }
        
        let attestation = TournamentAttestation {
            tournament_id: tournament_id.clone(),
            final_results_hash,
            total_matches,
            winner: winner.clone(),
            runner_up,
            prize_distribution_hash,
            finalized_at: env.ledger().timestamp(),
            finalized_by: attester,
        };
        
        env.storage().persistent().set(&DataKey::Tournament(tournament_id.clone()), &attestation);
        
        env.events().publish((symbol_short!("tourney"), tournament_id), winner);
    }

    /// File a dispute against a match result
    pub fn file_dispute(
        env: Env,
        challenger: Address,
        match_id: BytesN<32>,
        reason_hash: BytesN<32>,
    ) -> u64 {
        challenger.require_auth();
        Self::require_not_paused(&env);
        
        // Verify match exists
        if !env.storage().persistent().has(&DataKey::Match(match_id.clone())) {
            panic!("Match not found");
        }
        
        let counter: u64 = env.storage().instance().get(&DataKey::DisputeCounter).unwrap_or(0);
        let dispute_id = counter + 1;
        
        let dispute = Dispute {
            id: dispute_id,
            match_id: match_id.clone(),
            challenger: challenger.clone(),
            reason_hash,
            created_at: env.ledger().timestamp(),
            resolved: false,
            resolution_hash: BytesN::from_array(&env, &[0u8; 32]),
            resolved_at: 0,
        };
        
        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);
        env.storage().instance().set(&DataKey::DisputeCounter, &dispute_id);
        
        // Add to match's dispute list
        let mut match_disputes: Vec<u64> = env.storage().persistent()
            .get(&DataKey::MatchDisputes(match_id.clone()))
            .unwrap_or(Vec::new(&env));
        match_disputes.push_back(dispute_id);
        env.storage().persistent().set(&DataKey::MatchDisputes(match_id), &match_disputes);
        
        env.events().publish((symbol_short!("dispute"), dispute_id), challenger);
        
        dispute_id
    }

    /// Resolve a dispute (admin/attester only)
    pub fn resolve_dispute(
        env: Env,
        resolver: Address,
        dispute_id: u64,
        resolution_hash: BytesN<32>,
    ) {
        resolver.require_auth();
        
        // Must be admin or attestation key
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        if resolver != admin {
            Self::require_attestation_key(&env, &resolver);
        }
        
        let mut dispute: Dispute = env.storage().persistent()
            .get(&DataKey::Dispute(dispute_id))
            .expect("Dispute not found");
        
        if dispute.resolved {
            panic!("Dispute already resolved");
        }
        
        dispute.resolved = true;
        dispute.resolution_hash = resolution_hash;
        dispute.resolved_at = env.ledger().timestamp();
        
        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);
        
        env.events().publish((symbol_short!("resolve"), dispute_id), resolver);
    }

    // === Admin Functions ===

    /// Add attestation key
    pub fn add_attestation_key(env: Env, new_key: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut keys: Vec<Address> = env.storage().instance().get(&DataKey::AttestationKeys).unwrap();
        
        // Check not already added
        for i in 0..keys.len() {
            if keys.get(i).unwrap() == new_key {
                panic!("Key already exists");
            }
        }
        
        keys.push_back(new_key.clone());
        env.storage().instance().set(&DataKey::AttestationKeys, &keys);
        
        env.events().publish((symbol_short!("add_key"),), new_key);
    }

    /// Remove attestation key
    pub fn remove_attestation_key(env: Env, key_to_remove: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let keys: Vec<Address> = env.storage().instance().get(&DataKey::AttestationKeys).unwrap();
        let mut new_keys = Vec::new(&env);
        
        for i in 0..keys.len() {
            let key = keys.get(i).unwrap();
            if key != key_to_remove {
                new_keys.push_back(key);
            }
        }
        
        if new_keys.is_empty() {
            panic!("Cannot remove last attestation key");
        }
        
        env.storage().instance().set(&DataKey::AttestationKeys, &new_keys);
        
        env.events().publish((symbol_short!("rem_key"),), key_to_remove);
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

    pub fn get_match(env: Env, match_id: BytesN<32>) -> MatchAttestation {
        env.storage().persistent().get(&DataKey::Match(match_id)).expect("Match not found")
    }

    pub fn get_tournament(env: Env, tournament_id: BytesN<32>) -> TournamentAttestation {
        env.storage().persistent().get(&DataKey::Tournament(tournament_id)).expect("Tournament not found")
    }

    pub fn get_tournament_matches(env: Env, tournament_id: BytesN<32>) -> Vec<BytesN<32>> {
        env.storage().persistent().get(&DataKey::TournamentMatches(tournament_id)).unwrap_or(Vec::new(&env))
    }

    pub fn get_dispute(env: Env, dispute_id: u64) -> Dispute {
        env.storage().persistent().get(&DataKey::Dispute(dispute_id)).expect("Dispute not found")
    }

    pub fn get_match_disputes(env: Env, match_id: BytesN<32>) -> Vec<u64> {
        env.storage().persistent().get(&DataKey::MatchDisputes(match_id)).unwrap_or(Vec::new(&env))
    }

    pub fn get_attestation_keys(env: Env) -> Vec<Address> {
        env.storage().instance().get(&DataKey::AttestationKeys).unwrap_or(Vec::new(&env))
    }

    /// Verify a result hash matches the attested record
    pub fn verify_result(env: Env, match_id: BytesN<32>, result_hash: BytesN<32>) -> bool {
        match env.storage().persistent().get::<_, MatchAttestation>(&DataKey::Match(match_id)) {
            Some(attestation) => attestation.result_hash == result_hash,
            None => false,
        }
    }

    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&DataKey::Paused).unwrap_or(false)
    }

    // === Internal Functions ===

    fn require_not_paused(env: &Env) {
        if env.storage().instance().get(&DataKey::Paused).unwrap_or(false) {
            panic!("Contract is paused");
        }
    }

    fn require_attestation_key(env: &Env, key: &Address) {
        let keys: Vec<Address> = env.storage().instance().get(&DataKey::AttestationKeys).unwrap();
        let mut is_valid = false;
        for i in 0..keys.len() {
            if &keys.get(i).unwrap() == key {
                is_valid = true;
                break;
            }
        }
        if !is_valid {
            panic!("Not an authorized attestation key");
        }
    }
}
