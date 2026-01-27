#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, BytesN, Env, Map, Vec,
};

/// Tournament escrow info
#[contracttype]
#[derive(Clone)]
pub struct TournamentEscrow {
    pub tournament_id: BytesN<32>,
    pub total_deposited: i128,
    pub entry_fee: i128,
    pub max_payout_cap: i128,       // Security: max payout per tournament
    pub entries: Map<Address, i128>, // player -> entry amount
    pub is_finalized: bool,
    pub created_at: u64,
    pub deadline: u64,              // Deadline for payouts
}

/// Payout record with nonce for replay protection
#[contracttype]
#[derive(Clone)]
pub struct PayoutRecord {
    pub nonce: u64,
    pub tournament_id: BytesN<32>,
    pub recipient: Address,
    pub amount: i128,
    pub paid_at: u64,
}

/// Multisig signer info
#[contracttype]
#[derive(Clone)]
pub struct MultisigConfig {
    pub signers: Vec<Address>,
    pub threshold: u32,             // Required signatures
}

/// Pending multisig withdrawal
#[contracttype]
#[derive(Clone)]
pub struct PendingWithdrawal {
    pub id: u64,
    pub token: Address,
    pub amount: i128,
    pub recipient: Address,
    pub approvals: Vec<Address>,
    pub created_at: u64,
    pub executed: bool,
}

#[contracttype]
pub enum DataKey {
    Admin,
    AttestationKey,
    MultisigConfig,
    GlobalNonce,
    PayoutNonce(BytesN<32>),        // tournament_id -> last nonce
    UsedNonces(BytesN<32>, u64),    // (tournament_id, nonce) -> used
    Tournament(BytesN<32>),
    TreasuryBalance(Address),       // token -> balance
    TotalPaidOut,
    MaxPayoutCap,
    PendingWithdrawal(u64),
    WithdrawalCounter,
    Paused,
}

#[contract]
pub struct RewardsVaultContract;

#[contractimpl]
impl RewardsVaultContract {
    /// Initialize the Rewards Vault
    pub fn initialize(
        env: Env,
        admin: Address,
        attestation_key: Address,
        max_payout_cap: i128,
        multisig_signers: Vec<Address>,
        multisig_threshold: u32,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        
        if multisig_threshold as usize > multisig_signers.len() as usize {
            panic!("Threshold exceeds signer count");
        }
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::AttestationKey, &attestation_key);
        env.storage().instance().set(&DataKey::MaxPayoutCap, &max_payout_cap);
        env.storage().instance().set(&DataKey::GlobalNonce, &0u64);
        env.storage().instance().set(&DataKey::TotalPaidOut, &0i128);
        env.storage().instance().set(&DataKey::WithdrawalCounter, &0u64);
        env.storage().instance().set(&DataKey::Paused, &false);
        
        let multisig = MultisigConfig {
            signers: multisig_signers,
            threshold: multisig_threshold,
        };
        env.storage().instance().set(&DataKey::MultisigConfig, &multisig);
    }

    // === Treasury Functions (Admin Funded) ===

    /// Fund the treasury (admin deposits for distributions)
    pub fn fund_treasury(env: Env, funder: Address, token: Address, amount: i128) {
        funder.require_auth();
        Self::require_not_paused(&env);
        
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&funder, &env.current_contract_address(), &amount);
        
        let current: i128 = env.storage().persistent()
            .get(&DataKey::TreasuryBalance(token.clone()))
            .unwrap_or(0);
        env.storage().persistent().set(&DataKey::TreasuryBalance(token.clone()), &(current + amount));
        
        env.events().publish((symbol_short!("fund"), token), amount);
    }

    /// Withdraw from treasury (multisig required)
    pub fn propose_withdrawal(
        env: Env,
        proposer: Address,
        token: Address,
        amount: i128,
        recipient: Address,
    ) -> u64 {
        proposer.require_auth();
        Self::require_multisig_signer(&env, &proposer);
        Self::require_not_paused(&env);
        
        let counter: u64 = env.storage().instance().get(&DataKey::WithdrawalCounter).unwrap_or(0);
        let new_id = counter + 1;
        
        let mut approvals = Vec::new(&env);
        approvals.push_back(proposer.clone());
        
        let pending = PendingWithdrawal {
            id: new_id,
            token,
            amount,
            recipient,
            approvals,
            created_at: env.ledger().timestamp(),
            executed: false,
        };
        
        env.storage().persistent().set(&DataKey::PendingWithdrawal(new_id), &pending);
        env.storage().instance().set(&DataKey::WithdrawalCounter, &new_id);
        
        env.events().publish((symbol_short!("propose"),), new_id);
        
        new_id
    }

    /// Approve a pending withdrawal
    pub fn approve_withdrawal(env: Env, signer: Address, withdrawal_id: u64) {
        signer.require_auth();
        Self::require_multisig_signer(&env, &signer);
        Self::require_not_paused(&env);
        
        let mut pending: PendingWithdrawal = env.storage().persistent()
            .get(&DataKey::PendingWithdrawal(withdrawal_id))
            .expect("Withdrawal not found");
        
        if pending.executed {
            panic!("Already executed");
        }
        
        // Check if already approved by this signer
        for i in 0..pending.approvals.len() {
            if pending.approvals.get(i).unwrap() == signer {
                panic!("Already approved");
            }
        }
        
        pending.approvals.push_back(signer.clone());
        
        let multisig: MultisigConfig = env.storage().instance().get(&DataKey::MultisigConfig).unwrap();
        
        if pending.approvals.len() >= multisig.threshold {
            // Execute withdrawal
            let token_client = token::Client::new(&env, &pending.token);
            token_client.transfer(&env.current_contract_address(), &pending.recipient, &pending.amount);
            
            // Update treasury balance
            let current: i128 = env.storage().persistent()
                .get(&DataKey::TreasuryBalance(pending.token.clone()))
                .unwrap_or(0);
            env.storage().persistent().set(&DataKey::TreasuryBalance(pending.token.clone()), &(current - pending.amount));
            
            pending.executed = true;
            
            env.events().publish((symbol_short!("executed"), pending.recipient.clone()), pending.amount);
        }
        
        env.storage().persistent().set(&DataKey::PendingWithdrawal(withdrawal_id), &pending);
    }

    // === Per-Tournament Escrow Functions ===

    /// Create a tournament escrow
    pub fn create_tournament_escrow(
        env: Env,
        tournament_id: BytesN<32>,
        entry_fee: i128,
        max_payout_cap: i128,
        deadline: u64,
    ) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        Self::require_not_paused(&env);
        
        if env.storage().persistent().has(&DataKey::Tournament(tournament_id.clone())) {
            panic!("Tournament already exists");
        }
        
        let global_cap: i128 = env.storage().instance().get(&DataKey::MaxPayoutCap).unwrap();
        if max_payout_cap > global_cap {
            panic!("Payout cap exceeds global maximum");
        }
        
        let escrow = TournamentEscrow {
            tournament_id: tournament_id.clone(),
            total_deposited: 0,
            entry_fee,
            max_payout_cap,
            entries: Map::new(&env),
            is_finalized: false,
            created_at: env.ledger().timestamp(),
            deadline,
        };
        
        env.storage().persistent().set(&DataKey::Tournament(tournament_id.clone()), &escrow);
        env.storage().persistent().set(&DataKey::PayoutNonce(tournament_id.clone()), &0u64);
        
        env.events().publish((symbol_short!("escrow"),), tournament_id);
    }

    /// Player enters tournament (funds go into escrow)
    pub fn enter_tournament(
        env: Env,
        player: Address,
        tournament_id: BytesN<32>,
        token: Address,
    ) {
        player.require_auth();
        Self::require_not_paused(&env);
        
        let mut escrow: TournamentEscrow = env.storage().persistent()
            .get(&DataKey::Tournament(tournament_id.clone()))
            .expect("Tournament not found");
        
        if escrow.is_finalized {
            panic!("Tournament is finalized");
        }
        
        if escrow.entries.contains_key(player.clone()) {
            panic!("Already entered");
        }
        
        // Transfer entry fee to contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&player, &env.current_contract_address(), &escrow.entry_fee);
        
        escrow.total_deposited += escrow.entry_fee;
        escrow.entries.set(player.clone(), escrow.entry_fee);
        
        env.storage().persistent().set(&DataKey::Tournament(tournament_id.clone()), &escrow);
        
        env.events().publish((symbol_short!("entry"), tournament_id), player);
    }

    /// Payout winner with nonce and deadline check
    pub fn payout(
        env: Env,
        tournament_id: BytesN<32>,
        recipient: Address,
        amount: i128,
        nonce: u64,
        token: Address,
    ) {
        let attestation_key: Address = env.storage().instance().get(&DataKey::AttestationKey).unwrap();
        attestation_key.require_auth();
        Self::require_not_paused(&env);
        
        let escrow: TournamentEscrow = env.storage().persistent()
            .get(&DataKey::Tournament(tournament_id.clone()))
            .expect("Tournament not found");
        
        // Check deadline (10 minute window from signing to execution)
        if env.ledger().timestamp() > escrow.deadline {
            panic!("Payout deadline exceeded");
        }
        
        // Check payout cap
        if amount > escrow.max_payout_cap {
            panic!("Amount exceeds max payout cap");
        }
        
        // Check nonce (prevent replay)
        let nonce_key = DataKey::UsedNonces(tournament_id.clone(), nonce);
        if env.storage().persistent().has(&nonce_key) {
            panic!("Nonce already used");
        }
        
        // Verify nonce is sequential
        let last_nonce: u64 = env.storage().persistent()
            .get(&DataKey::PayoutNonce(tournament_id.clone()))
            .unwrap_or(0);
        if nonce != last_nonce + 1 {
            panic!("Invalid nonce sequence");
        }
        
        // Check sufficient funds
        if amount > escrow.total_deposited {
            panic!("Insufficient escrow funds");
        }
        
        // Mark nonce as used
        env.storage().persistent().set(&nonce_key, &true);
        env.storage().persistent().set(&DataKey::PayoutNonce(tournament_id.clone()), &nonce);
        
        // Execute payout
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &recipient, &amount);
        
        // Update totals
        let total_paid: i128 = env.storage().instance().get(&DataKey::TotalPaidOut).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalPaidOut, &(total_paid + amount));
        
        env.events().publish((symbol_short!("payout"), tournament_id, nonce), (recipient.clone(), amount));
    }

    /// Finalize tournament (prevent further entries/payouts)
    pub fn finalize_tournament(env: Env, tournament_id: BytesN<32>) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut escrow: TournamentEscrow = env.storage().persistent()
            .get(&DataKey::Tournament(tournament_id.clone()))
            .expect("Tournament not found");
        
        escrow.is_finalized = true;
        env.storage().persistent().set(&DataKey::Tournament(tournament_id.clone()), &escrow);
        
        env.events().publish((symbol_short!("finalize"),), tournament_id);
    }

    /// Refund all entries (emergency)
    pub fn emergency_refund(env: Env, tournament_id: BytesN<32>, token: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let escrow: TournamentEscrow = env.storage().persistent()
            .get(&DataKey::Tournament(tournament_id.clone()))
            .expect("Tournament not found");
        
        let token_client = token::Client::new(&env, &token);
        
        // Refund all entries
        for entry in escrow.entries.iter() {
            let (player, amount) = entry;
            token_client.transfer(&env.current_contract_address(), &player, &amount);
        }
        
        // Clear escrow
        let cleared = TournamentEscrow {
            tournament_id: tournament_id.clone(),
            total_deposited: 0,
            entry_fee: escrow.entry_fee,
            max_payout_cap: escrow.max_payout_cap,
            entries: Map::new(&env),
            is_finalized: true,
            created_at: escrow.created_at,
            deadline: escrow.deadline,
        };
        env.storage().persistent().set(&DataKey::Tournament(tournament_id.clone()), &cleared);
        
        env.events().publish((symbol_short!("refund"),), tournament_id);
    }

    // === Admin Functions ===

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

    /// Update multisig configuration
    pub fn update_multisig(env: Env, signers: Vec<Address>, threshold: u32) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        if threshold as usize > signers.len() as usize {
            panic!("Threshold exceeds signer count");
        }
        
        let multisig = MultisigConfig { signers, threshold };
        env.storage().instance().set(&DataKey::MultisigConfig, &multisig);
    }

    /// Update global max payout cap
    pub fn set_max_payout_cap(env: Env, cap: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::MaxPayoutCap, &cap);
    }

    /// Pause/unpause
    pub fn set_paused(env: Env, paused: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Paused, &paused);
    }

    // === View Functions ===

    pub fn get_tournament(env: Env, tournament_id: BytesN<32>) -> TournamentEscrow {
        env.storage().persistent().get(&DataKey::Tournament(tournament_id)).expect("Not found")
    }

    pub fn get_treasury_balance(env: Env, token: Address) -> i128 {
        env.storage().persistent().get(&DataKey::TreasuryBalance(token)).unwrap_or(0)
    }

    pub fn get_total_paid_out(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalPaidOut).unwrap_or(0)
    }

    pub fn get_payout_nonce(env: Env, tournament_id: BytesN<32>) -> u64 {
        env.storage().persistent().get(&DataKey::PayoutNonce(tournament_id)).unwrap_or(0)
    }

    pub fn get_pending_withdrawal(env: Env, id: u64) -> PendingWithdrawal {
        env.storage().persistent().get(&DataKey::PendingWithdrawal(id)).expect("Not found")
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

    fn require_multisig_signer(env: &Env, signer: &Address) {
        let multisig: MultisigConfig = env.storage().instance().get(&DataKey::MultisigConfig).unwrap();
        let mut is_signer = false;
        for i in 0..multisig.signers.len() {
            if &multisig.signers.get(i).unwrap() == signer {
                is_signer = true;
                break;
            }
        }
        if !is_signer {
            panic!("Not a multisig signer");
        }
    }
}
