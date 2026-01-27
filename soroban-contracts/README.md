# Cyber City Arcade - Soroban Smart Contracts

This directory contains all Soroban smart contracts for the Cyber City Arcade platform.

## Contracts Overview

### 1. CCTR Token (`cctr-token/`)
The native utility token for the Cyber City Arcade ecosystem.

**Features:**
- SEP-41 compatible token standard
- Mint/burn functionality (admin only)
- Transfer and allowance management
- 7 decimal precision
- 1 billion initial supply

**Key Functions:**
```rust
initialize(admin, initial_supply)
transfer(from, to, amount)
approve(from, spender, amount, expiration)
mint(to, amount)  // Admin only
burn(from, amount)
```

### 2. Node System (`node-system/`)
Validator node purchase and rewards distribution system.

**Node Tiers:**
| Tier | Price (CCTR) | Daily Reward | Max Supply |
|------|-------------|--------------|------------|
| Basic | 1,000 | 5 CCTR | 5,000 |
| Premium | 10,000 | 60 CCTR | 2,000 |
| Legendary | 100,000 | 700 CCTR | 100 |

**Key Functions:**
```rust
initialize(admin, cctr_token, treasury)
purchase_node(buyer, tier)
claim_rewards(user)
pending_rewards(user)
get_user_nodes(user)
```

### 3. Liquidity Pool (`liquidity-pool/`)
AMM-style liquidity pools with LP staking.

**Features:**
- Constant product market maker (x * y = k)
- Configurable swap fees (basis points)
- LP token minting/burning
- LP staking with CCTR rewards
- Swap quotes and slippage protection

**Key Functions:**
```rust
create_pool(token_a, token_b, fee_bps)
add_liquidity(user, pool_id, amount_a, amount_b, min_shares)
remove_liquidity(user, pool_id, shares, min_a, min_b)
swap(user, pool_id, token_in, amount_in, min_out)
stake_lp(user, pool_id, amount)
claim_staking_rewards(user, pool_id)
```

### 4. Tournament & Raffle (`tournament-raffle/`)
Gaming tournaments with USDC entry and CCTR raffles.

**Tournament Features:**
- USDC entry fees
- Automatic prize pool accumulation
- Score submission (admin)
- 90% prize to winner, 10% to treasury

**Raffle Features:**
- CCTR ticket purchases
- Pseudo-random winner selection
- Configurable ticket limits
- Time-based ending

**Key Functions:**
```rust
// Tournaments
create_tournament(name, entry_fee, max_players, start_time, end_time)
join_tournament(player, tournament_id)
submit_score(tournament_id, player, score)
complete_tournament(tournament_id, winner)

// Raffles
create_raffle(name, ticket_price, max_tickets, prize_value, end_time)
purchase_tickets(buyer, raffle_id, quantity)
draw_winner(raffle_id)
```

### 5. NFT Pass (`nft-pass/`) 🆕
Gate access to tournaments, premium servers, and VIP perks.

**Pass Tiers:**
| Tier | Price (CCTR) | Access Level |
|------|-------------|--------------|
| Bronze | 100 | Basic tournaments |
| Silver | 500 | Premium servers |
| Gold | 2,000 | VIP perks + all access |
| Platinum | 10,000 | Season pass + exclusive |

**Features:**
- Tiered access control with traits
- **Soulbound option** for non-transferable passes
- Configurable access gates
- Admin key rotation

**Key Functions:**
```rust
initialize(admin, attestation_key)
mint_pass(recipient, tier, is_soulbound, expires_at, metadata_uri, cctr_token)
transfer(pass_id, from, to)  // Fails if soulbound
check_access(user, gate_id)
add_trait(pass_id, trait_key, trait_value)
create_gate(gate_id, required_tier, required_traits)
rotate_admin(new_admin)
```

### 6. Rewards Vault (`rewards-vault/`) 🆕
Secure escrow for tournament payouts that no one can "mess with."

**Two Patterns:**
1. **Treasury → Distribution**: Admin funds vault, vault pays winners
2. **Per-Tournament Escrow**: Entry funds go into escrow, then paid out

**Security Features:**
- ✅ **Nonce per match payout** (prevents replay attacks)
- ✅ **Deadline enforcement** (10-minute window for signed payloads)
- ✅ **Max payout caps** per tournament
- ✅ **Admin key rotation**
- ✅ **Multisig for vault withdrawals** (configurable threshold)

**Key Functions:**
```rust
initialize(admin, attestation_key, max_payout_cap, multisig_signers, threshold)
fund_treasury(funder, token, amount)
create_tournament_escrow(tournament_id, entry_fee, max_payout_cap, deadline)
enter_tournament(player, tournament_id, token)
payout(tournament_id, recipient, amount, nonce, token)  // Attestation key only
propose_withdrawal(proposer, token, amount, recipient)  // Multisig
approve_withdrawal(signer, withdrawal_id)
emergency_refund(tournament_id, token)  // Admin only
rotate_admin(new_admin)
rotate_attestation_key(new_key)
```

### 7. Results Attestation (`results-attestation/`) 🆕
Lightweight contract for immutable game result audit trail.

**Purpose:** Prevent disputes without putting gameplay on-chain.
**Important:** Does NOT compute results—just records/attests to them.

**Features:**
- Immutable match attestations (once recorded, cannot be changed)
- Tournament-level attestations
- Dispute filing and resolution system
- Multiple attestation keys (rotation supported)
- One-purpose signing key (separate from treasury)

**Key Functions:**
```rust
initialize(admin, attestation_keys)
attest_match(attester, tournament_id, match_id, result_hash, winner, participants, scores, metadata_hash)
attest_tournament(attester, tournament_id, final_results_hash, total_matches, winner, runner_up, prize_distribution_hash)
file_dispute(challenger, match_id, reason_hash)
resolve_dispute(resolver, dispute_id, resolution_hash)
verify_result(match_id, result_hash)  // Returns true if hash matches
add_attestation_key(new_key)
remove_attestation_key(key_to_remove)
```

### 8. Compute Credits (`compute-credits/`) 🆕
CCC/credits as a real on-chain asset (earn/buy/spend).

**Strategy:** Start off-chain (fast, cheap) → Bridge to on-chain for power users/hosts.

**Features:**
- Purchasable credit packages with bonuses
- Earn credits (gameplay/achievements)
- Spend credits (tournaments/features)
- Transfer between users
- Role-based minting/burning
- Daily mint limits (prevents abuse)
- Max supply cap

**Key Functions:**
```rust
initialize(admin, usdc_token, max_supply, daily_mint_limit)
buy_credits(buyer, package_id)  // Uses USDC
award_credits(minter, recipient, amount, description)  // Minter role
spend_credits(user, amount, description)
transfer_credits(from, to, amount)
burn_credits(burner, user, amount)  // Burner role
create_package(credits, price_usdc, bonus_credits)
add_minter(minter)
add_burner(burner)
set_limits(max_supply, daily_mint_limit)
```

### 9. Host Rewards (`host-rewards/`) 🆕
Pay people who provide compute nodes / server capacity.

**Purpose:** Transparent rules for decentralized compute providers.

**Security Features:**
- ✅ **One-purpose attestation key** (not treasury key)
- ✅ **Nonce per payout** (prevents replay)
- ✅ **Deadline enforcement**
- ✅ **Max payout caps** per job
- ✅ **Admin key rotation**
- ✅ Stake slashing for misbehavior

**Host Features:**
- Stake CCTR to register as provider
- Reputation scoring (0-1000)
- Heartbeat for liveness proof
- Job tracking and completion proofs

**Key Functions:**
```rust
initialize(admin, attestation_key, cctr_token, min_stake, max_payout_per_job)
register_host(host, stake_amount)
add_stake(host, amount)
withdraw_stake(host, amount)
heartbeat(host)
create_job(job_id, host, requester, job_type, reward_amount)  // Attestation key
complete_job(job_id, proof_hash)  // Attestation key
claim_payout(job_id, nonce, deadline, attestation_hash, token)  // With security checks
slash_stake(host, amount, reason_hash)  // Admin only
rotate_admin(new_admin)
rotate_attestation_key(new_key)
```

## Development Setup

### Prerequisites
1. Install Rust: https://www.rust-lang.org/tools/install
2. Install Soroban CLI:
```bash
cargo install --locked soroban-cli
```

3. Add WASM target:
```bash
rustup target add wasm32-unknown-unknown
```

4. Configure Stellar testnet:
```bash
soroban network add testnet \
  --rpc-url https://soroban-testnet.stellar.org:443 \
  --network-passphrase "Test SDF Network ; September 2015"
```

### Building Contracts

```bash
# Build all contracts
cd soroban-contracts

# Build each contract
for contract in cctr-token node-system liquidity-pool tournament-raffle nft-pass rewards-vault results-attestation compute-credits host-rewards; do
  cd $contract && cargo build --target wasm32-unknown-unknown --release && cd ..
done
```

### Optimizing WASM

```bash
soroban contract optimize --wasm target/wasm32-unknown-unknown/release/cctr_token.wasm
```

### Deploying to Testnet

```bash
# Generate deployer identity
soroban keys generate deployer --network testnet

# Fund account
soroban keys fund deployer --network testnet

# Deploy CCTR Token
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/cctr_token.wasm \
  --source deployer \
  --network testnet

# Initialize after deployment
soroban contract invoke \
  --id <CONTRACT_ID> \
  --source deployer \
  --network testnet \
  -- \
  initialize \
  --admin <ADMIN_ADDRESS> \
  --initial_supply 10000000000000000
```

## Contract Addresses (Testnet)

After deployment, update environment variables:

| Contract | Env Variable |
|----------|---------|
| CCTR Token | `VITE_CCTR_TOKEN_CONTRACT` |
| Node System | `VITE_NODE_SYSTEM_CONTRACT` |
| Liquidity Pool | `VITE_LIQUIDITY_POOL_CONTRACT` |
| Tournament & Raffle | `VITE_TOURNAMENT_RAFFLE_CONTRACT` |
| NFT Pass | `VITE_NFT_PASS_CONTRACT` |
| Rewards Vault | `VITE_REWARDS_VAULT_CONTRACT` |
| Results Attestation | `VITE_RESULTS_ATTESTATION_CONTRACT` |
| Compute Credits | `VITE_COMPUTE_CREDITS_CONTRACT` |
| Host Rewards | `VITE_HOST_REWARDS_CONTRACT` |

## Token Addresses (Stellar)

| Token | Issuer |
|-------|--------|
| USDC | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| XLM | Native |
| CCTR | Deploy using cctr-token contract |

## Security Architecture

### Key Separation
- **Admin Key**: Full contract control, key rotation
- **Attestation Key**: Single-purpose signing for results/payouts
- **Multisig**: Treasury withdrawals require multiple signatures

### Replay Protection
- Nonce-per-payout for all reward distributions
- Sequential nonce validation
- Nonce usage tracking

### Time-Based Security
- Deadline enforcement (10-minute windows)
- Expired payloads are rejected
- Prevents indefinite signature validity

### Financial Guards
- Max payout caps per tournament/job
- Daily mint limits for credits
- Stake requirements for hosts
- Slashing for misbehavior

## Testing

```bash
# Run tests for a specific contract
cd cctr-token
cargo test

# Run all tests with output
cargo test -- --nocapture
```

## Integration with Frontend

Use the `useSorobanContracts` hook:

```typescript
import { useSorobanContracts } from '@/hooks/useSorobanContracts';

function MyComponent() {
  const { 
    mintPass,
    checkPassAccess,
    enterTournamentEscrow,
    verifyResult,
    buyCredits,
    registerHost
  } = useSorobanContracts();

  // Example: Check tournament access
  const hasAccess = await checkPassAccess('premium_tournament');
  
  // Example: Buy compute credits
  await buyCredits(1); // Package ID 1
}
```

## License

MIT - Cyber City Arcade
