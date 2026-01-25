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

# Build CCTR Token
cd cctr-token && cargo build --target wasm32-unknown-unknown --release

# Build Node System
cd ../node-system && cargo build --target wasm32-unknown-unknown --release

# Build Liquidity Pool
cd ../liquidity-pool && cargo build --target wasm32-unknown-unknown --release

# Build Tournament & Raffle
cd ../tournament-raffle && cargo build --target wasm32-unknown-unknown --release
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

After deployment, update these addresses:

| Contract | Address |
|----------|---------|
| CCTR Token | `C...` |
| Node System | `C...` |
| Liquidity Pool | `C...` |
| Tournament & Raffle | `C...` |

## Token Addresses (Stellar)

| Token | Issuer |
|-------|--------|
| USDC | `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN` |
| XLM | Native |
| CCTR | Deploy using cctr-token contract |

## Security Considerations

1. **Admin Controls**: All admin functions require authentication
2. **Overflow Protection**: Enabled in release builds
3. **Reentrancy**: Not applicable (Soroban's execution model)
4. **Access Control**: Token transfers require caller auth
5. **Slippage Protection**: All swaps/liquidity ops have min output

## Testing

```bash
# Run tests for a specific contract
cd cctr-token
cargo test

# Run all tests with output
cargo test -- --nocapture
```

## Integration with Frontend

Use the Stellar SDK to interact with deployed contracts:

```typescript
import { Contract, Server } from '@stellar/stellar-sdk';

const server = new Server('https://soroban-testnet.stellar.org');
const contract = new Contract(CONTRACT_ID);

// Example: Get CCTR balance
const result = await server.simulateTransaction(
  contract.call('balance', userAddress)
);
```

## License

MIT - Cyber City Arcade
