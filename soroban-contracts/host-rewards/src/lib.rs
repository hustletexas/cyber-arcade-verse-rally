#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, Address, BytesN, Env, Map, Vec,
};

/// Host provider registration info
#[contracttype]
#[derive(Clone)]
pub struct HostProvider {
    pub address: Address,
    pub stake_amount: i128,         // CCTR staked
    pub registered_at: u64,
    pub total_earnings: i128,
    pub total_jobs_completed: u64,
    pub reputation_score: u32,      // 0-1000
    pub is_active: bool,
    pub last_heartbeat: u64,
}

/// Compute job/session
#[contracttype]
#[derive(Clone)]
pub struct ComputeJob {
    pub job_id: BytesN<32>,
    pub host: Address,
    pub requester: Address,
    pub job_type: JobType,
    pub reward_amount: i128,
    pub started_at: u64,
    pub completed_at: u64,
    pub status: JobStatus,
    pub proof_hash: BytesN<32>,     // Proof of compute
}

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum JobType {
    TournamentServer,
    GameRelay,
    ContentDelivery,
    Custom,
}

#[contracttype]
#[derive(Clone, PartialEq)]
pub enum JobStatus {
    Pending,
    Active,
    Completed,
    Disputed,
    Cancelled,
}

/// Payout claim with security checks
#[contracttype]
#[derive(Clone)]
pub struct PayoutClaim {
    pub claim_id: u64,
    pub job_id: BytesN<32>,
    pub host: Address,
    pub amount: i128,
    pub nonce: u64,
    pub deadline: u64,              // Signature expires after this
    pub attestation_hash: BytesN<32>,
    pub paid: bool,
    pub paid_at: u64,
}

#[contracttype]
pub enum DataKey {
    Admin,
    AttestationKey,
    CCTRToken,
    MinStake,
    MaxPayoutPerJob,
    TotalPaidOut,
    Host(Address),
    Job(BytesN<32>),
    Claim(u64),
    ClaimCounter,
    UsedNonces(u64),                // nonce -> used
    HostJobs(Address),              // host -> Vec<job_id>
    Paused,
}

#[contract]
pub struct HostRewardsContract;

#[contractimpl]
impl HostRewardsContract {
    /// Initialize the Host Rewards contract
    pub fn initialize(
        env: Env,
        admin: Address,
        attestation_key: Address,
        cctr_token: Address,
        min_stake: i128,
        max_payout_per_job: i128,
    ) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::AttestationKey, &attestation_key);
        env.storage().instance().set(&DataKey::CCTRToken, &cctr_token);
        env.storage().instance().set(&DataKey::MinStake, &min_stake);
        env.storage().instance().set(&DataKey::MaxPayoutPerJob, &max_payout_per_job);
        env.storage().instance().set(&DataKey::TotalPaidOut, &0i128);
        env.storage().instance().set(&DataKey::ClaimCounter, &0u64);
        env.storage().instance().set(&DataKey::Paused, &false);
    }

    // === Host Registration ===

    /// Register as a compute host (stake CCTR)
    pub fn register_host(env: Env, host: Address, stake_amount: i128) {
        host.require_auth();
        Self::require_not_paused(&env);
        
        let min_stake: i128 = env.storage().instance().get(&DataKey::MinStake).unwrap();
        if stake_amount < min_stake {
            panic!("Stake below minimum");
        }
        
        if env.storage().persistent().has(&DataKey::Host(host.clone())) {
            panic!("Already registered");
        }
        
        // Transfer stake
        let cctr: Address = env.storage().instance().get(&DataKey::CCTRToken).unwrap();
        let token_client = token::Client::new(&env, &cctr);
        token_client.transfer(&host, &env.current_contract_address(), &stake_amount);
        
        let provider = HostProvider {
            address: host.clone(),
            stake_amount,
            registered_at: env.ledger().timestamp(),
            total_earnings: 0,
            total_jobs_completed: 0,
            reputation_score: 500, // Start at 50%
            is_active: true,
            last_heartbeat: env.ledger().timestamp(),
        };
        
        env.storage().persistent().set(&DataKey::Host(host.clone()), &provider);
        env.storage().persistent().set(&DataKey::HostJobs(host.clone()), &Vec::<BytesN<32>>::new(&env));
        
        env.events().publish((symbol_short!("register"),), host);
    }

    /// Add more stake
    pub fn add_stake(env: Env, host: Address, amount: i128) {
        host.require_auth();
        Self::require_not_paused(&env);
        
        let mut provider: HostProvider = env.storage().persistent()
            .get(&DataKey::Host(host.clone()))
            .expect("Host not registered");
        
        let cctr: Address = env.storage().instance().get(&DataKey::CCTRToken).unwrap();
        let token_client = token::Client::new(&env, &cctr);
        token_client.transfer(&host, &env.current_contract_address(), &amount);
        
        provider.stake_amount += amount;
        env.storage().persistent().set(&DataKey::Host(host.clone()), &provider);
        
        env.events().publish((symbol_short!("stake"), host), amount);
    }

    /// Withdraw stake (must have no active jobs)
    pub fn withdraw_stake(env: Env, host: Address, amount: i128) {
        host.require_auth();
        
        let mut provider: HostProvider = env.storage().persistent()
            .get(&DataKey::Host(host.clone()))
            .expect("Host not registered");
        
        let min_stake: i128 = env.storage().instance().get(&DataKey::MinStake).unwrap();
        if provider.stake_amount - amount < min_stake && provider.is_active {
            panic!("Would go below minimum stake while active");
        }
        
        // Check no active jobs
        let jobs: Vec<BytesN<32>> = env.storage().persistent()
            .get(&DataKey::HostJobs(host.clone()))
            .unwrap_or(Vec::new(&env));
        
        for i in 0..jobs.len() {
            let job_id = jobs.get(i).unwrap();
            let job: ComputeJob = env.storage().persistent().get(&DataKey::Job(job_id)).unwrap();
            if job.status == JobStatus::Active || job.status == JobStatus::Pending {
                panic!("Has active jobs");
            }
        }
        
        provider.stake_amount -= amount;
        if provider.stake_amount < min_stake {
            provider.is_active = false;
        }
        
        env.storage().persistent().set(&DataKey::Host(host.clone()), &provider);
        
        let cctr: Address = env.storage().instance().get(&DataKey::CCTRToken).unwrap();
        let token_client = token::Client::new(&env, &cctr);
        token_client.transfer(&env.current_contract_address(), &host, &amount);
        
        env.events().publish((symbol_short!("unstake"), host), amount);
    }

    /// Host heartbeat (proves host is online)
    pub fn heartbeat(env: Env, host: Address) {
        host.require_auth();
        
        let mut provider: HostProvider = env.storage().persistent()
            .get(&DataKey::Host(host.clone()))
            .expect("Host not registered");
        
        provider.last_heartbeat = env.ledger().timestamp();
        env.storage().persistent().set(&DataKey::Host(host), &provider);
    }

    // === Job Management ===

    /// Create a compute job (admin/attestation key)
    pub fn create_job(
        env: Env,
        job_id: BytesN<32>,
        host: Address,
        requester: Address,
        job_type: JobType,
        reward_amount: i128,
    ) {
        let attestation_key: Address = env.storage().instance().get(&DataKey::AttestationKey).unwrap();
        attestation_key.require_auth();
        Self::require_not_paused(&env);
        
        let max_payout: i128 = env.storage().instance().get(&DataKey::MaxPayoutPerJob).unwrap();
        if reward_amount > max_payout {
            panic!("Reward exceeds max per job");
        }
        
        // Verify host is registered and active
        let provider: HostProvider = env.storage().persistent()
            .get(&DataKey::Host(host.clone()))
            .expect("Host not registered");
        
        if !provider.is_active {
            panic!("Host is not active");
        }
        
        let job = ComputeJob {
            job_id: job_id.clone(),
            host: host.clone(),
            requester,
            job_type,
            reward_amount,
            started_at: env.ledger().timestamp(),
            completed_at: 0,
            status: JobStatus::Active,
            proof_hash: BytesN::from_array(&env, &[0u8; 32]),
        };
        
        env.storage().persistent().set(&DataKey::Job(job_id.clone()), &job);
        
        // Add to host's job list
        let mut host_jobs: Vec<BytesN<32>> = env.storage().persistent()
            .get(&DataKey::HostJobs(host.clone()))
            .unwrap_or(Vec::new(&env));
        host_jobs.push_back(job_id.clone());
        env.storage().persistent().set(&DataKey::HostJobs(host), &host_jobs);
        
        env.events().publish((symbol_short!("job"),), job_id);
    }

    /// Complete job with proof
    pub fn complete_job(
        env: Env,
        job_id: BytesN<32>,
        proof_hash: BytesN<32>,
    ) {
        let attestation_key: Address = env.storage().instance().get(&DataKey::AttestationKey).unwrap();
        attestation_key.require_auth();
        
        let mut job: ComputeJob = env.storage().persistent()
            .get(&DataKey::Job(job_id.clone()))
            .expect("Job not found");
        
        if job.status != JobStatus::Active {
            panic!("Job is not active");
        }
        
        job.status = JobStatus::Completed;
        job.completed_at = env.ledger().timestamp();
        job.proof_hash = proof_hash;
        
        env.storage().persistent().set(&DataKey::Job(job_id.clone()), &job);
        
        // Update host stats
        let mut provider: HostProvider = env.storage().persistent()
            .get(&DataKey::Host(job.host.clone()))
            .unwrap();
        provider.total_jobs_completed += 1;
        // Increase reputation slightly
        if provider.reputation_score < 1000 {
            provider.reputation_score += 1;
        }
        env.storage().persistent().set(&DataKey::Host(job.host.clone()), &provider);
        
        env.events().publish((symbol_short!("complete"),), job_id);
    }

    // === Payout with Security ===

    /// Claim payout with nonce and deadline
    pub fn claim_payout(
        env: Env,
        job_id: BytesN<32>,
        nonce: u64,
        deadline: u64,
        attestation_hash: BytesN<32>,
        token: Address,
    ) {
        let attestation_key: Address = env.storage().instance().get(&DataKey::AttestationKey).unwrap();
        attestation_key.require_auth();
        Self::require_not_paused(&env);
        
        // Check deadline
        if env.ledger().timestamp() > deadline {
            panic!("Claim deadline exceeded");
        }
        
        // Check nonce not used
        if env.storage().persistent().has(&DataKey::UsedNonces(nonce)) {
            panic!("Nonce already used");
        }
        
        let job: ComputeJob = env.storage().persistent()
            .get(&DataKey::Job(job_id.clone()))
            .expect("Job not found");
        
        if job.status != JobStatus::Completed {
            panic!("Job not completed");
        }
        
        // Mark nonce as used
        env.storage().persistent().set(&DataKey::UsedNonces(nonce), &true);
        
        // Create claim record
        let counter: u64 = env.storage().instance().get(&DataKey::ClaimCounter).unwrap_or(0);
        let claim_id = counter + 1;
        
        let claim = PayoutClaim {
            claim_id,
            job_id: job_id.clone(),
            host: job.host.clone(),
            amount: job.reward_amount,
            nonce,
            deadline,
            attestation_hash,
            paid: true,
            paid_at: env.ledger().timestamp(),
        };
        
        env.storage().persistent().set(&DataKey::Claim(claim_id), &claim);
        env.storage().instance().set(&DataKey::ClaimCounter, &claim_id);
        
        // Pay host
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &job.host, &job.reward_amount);
        
        // Update host earnings
        let mut provider: HostProvider = env.storage().persistent()
            .get(&DataKey::Host(job.host.clone()))
            .unwrap();
        provider.total_earnings += job.reward_amount;
        env.storage().persistent().set(&DataKey::Host(job.host.clone()), &provider);
        
        // Update total paid
        let total_paid: i128 = env.storage().instance().get(&DataKey::TotalPaidOut).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalPaidOut, &(total_paid + job.reward_amount));
        
        env.events().publish((symbol_short!("payout"), job_id, nonce), job.reward_amount);
    }

    // === Admin Functions ===

    /// Slash host stake (for misbehavior)
    pub fn slash_stake(env: Env, host: Address, amount: i128, reason_hash: BytesN<32>) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        let mut provider: HostProvider = env.storage().persistent()
            .get(&DataKey::Host(host.clone()))
            .expect("Host not registered");
        
        let slash_amount = if amount > provider.stake_amount {
            provider.stake_amount
        } else {
            amount
        };
        
        provider.stake_amount -= slash_amount;
        provider.reputation_score = provider.reputation_score.saturating_sub(100);
        
        if provider.stake_amount < env.storage().instance().get::<_, i128>(&DataKey::MinStake).unwrap() {
            provider.is_active = false;
        }
        
        env.storage().persistent().set(&DataKey::Host(host.clone()), &provider);
        
        env.events().publish((symbol_short!("slash"), host, reason_hash), slash_amount);
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

    /// Update limits
    pub fn set_limits(env: Env, min_stake: i128, max_payout_per_job: i128) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::MinStake, &min_stake);
        env.storage().instance().set(&DataKey::MaxPayoutPerJob, &max_payout_per_job);
    }

    /// Pause/unpause
    pub fn set_paused(env: Env, paused: bool) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        
        env.storage().instance().set(&DataKey::Paused, &paused);
    }

    // === View Functions ===

    pub fn get_host(env: Env, host: Address) -> HostProvider {
        env.storage().persistent().get(&DataKey::Host(host)).expect("Host not found")
    }

    pub fn get_job(env: Env, job_id: BytesN<32>) -> ComputeJob {
        env.storage().persistent().get(&DataKey::Job(job_id)).expect("Job not found")
    }

    pub fn get_host_jobs(env: Env, host: Address) -> Vec<BytesN<32>> {
        env.storage().persistent().get(&DataKey::HostJobs(host)).unwrap_or(Vec::new(&env))
    }

    pub fn get_claim(env: Env, claim_id: u64) -> PayoutClaim {
        env.storage().persistent().get(&DataKey::Claim(claim_id)).expect("Claim not found")
    }

    pub fn get_total_paid_out(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::TotalPaidOut).unwrap_or(0)
    }

    pub fn is_nonce_used(env: Env, nonce: u64) -> bool {
        env.storage().persistent().has(&DataKey::UsedNonces(nonce))
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
}
