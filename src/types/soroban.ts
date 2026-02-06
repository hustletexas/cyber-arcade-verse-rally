// Soroban Contract Types

export type NodeTier = 'basic' | 'premium' | 'legendary';

export type TournamentStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

// === NFT Pass Types ===
export type PassTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface PassInfo {
  id: number;
  owner: string;
  tier: PassTier;
  issuedAt: number;
  expiresAt: number;
  isSoulbound: boolean;
  metadataUri: string;
  traits: Record<string, string>;
}

export interface AccessGate {
  gateId: string;
  requiredTier: PassTier;
  requiredTraits: string[];
  isActive: boolean;
}

// === Rewards Vault Types ===
export interface TournamentEscrow {
  tournamentId: string;
  totalDeposited: bigint;
  entryFee: bigint;
  maxPayoutCap: bigint;
  entriesCount: number;
  isFinalized: boolean;
  createdAt: number;
  deadline: number;
}

export interface PayoutRecord {
  claimId: number;
  tournamentId: string;
  recipient: string;
  amount: bigint;
  nonce: number;
  deadline: number;
  paid: boolean;
  paidAt: number;
}

export interface PendingWithdrawal {
  id: number;
  token: string;
  amount: bigint;
  recipient: string;
  approvalCount: number;
  threshold: number;
  executed: boolean;
}

// === Results Attestation Types ===
export interface MatchAttestation {
  tournamentId: string;
  matchId: string;
  resultHash: string;
  winner: string;
  participants: string[];
  scores: Record<string, number>;
  metadataHash: string;
  attestedAt: number;
  attestedBy: string;
}

export interface TournamentAttestation {
  tournamentId: string;
  finalResultsHash: string;
  totalMatches: number;
  winner: string;
  runnerUp: string;
  prizeDistributionHash: string;
  finalizedAt: number;
}

export interface Dispute {
  id: number;
  matchId: string;
  challenger: string;
  reasonHash: string;
  createdAt: number;
  resolved: boolean;
  resolutionHash: string;
  resolvedAt: number;
}

// === Compute Credits Types ===
export interface CreditPackage {
  id: number;
  credits: bigint;
  priceUsdc: bigint;
  bonusCredits: bigint;
  isActive: boolean;
}

export interface UserCredits {
  balance: bigint;
  lifetimeEarned: bigint;
  lifetimeSpent: bigint;
  lastActivity: number;
}

export type CreditTxType = 'purchase' | 'earn' | 'spend' | 'transfer' | 'burn' | 'admin_mint';

// === Host Rewards Types ===
export interface HostProvider {
  address: string;
  stakeAmount: bigint;
  registeredAt: number;
  totalEarnings: bigint;
  totalJobsCompleted: number;
  reputationScore: number;
  isActive: boolean;
  lastHeartbeat: number;
}

export type JobType = 'tournament_server' | 'game_relay' | 'content_delivery' | 'custom';
export type JobStatus = 'pending' | 'active' | 'completed' | 'disputed' | 'cancelled';

export interface ComputeJob {
  jobId: string;
  host: string;
  requester: string;
  jobType: JobType;
  rewardAmount: bigint;
  startedAt: number;
  completedAt: number;
  status: JobStatus;
  proofHash: string;
}

export interface PayoutClaim {
  claimId: number;
  jobId: string;
  host: string;
  amount: bigint;
  nonce: number;
  deadline: number;
  attestationHash: string;
  paid: boolean;
  paidAt: number;
}

// === Existing Types ===
/** @deprecated Use CCCBalance instead */
export type CCTRBalance = CCCBalance;

export interface CCCBalance {
  balance: bigint;
  formatted: string;
}

export interface NodeInfo {
  tier: NodeTier;
  purchaseTime: number;
  lastClaimTime: number;
  totalRewardsClaimed: bigint;
}

export interface NodeTierConfig {
  price: bigint;
  dailyReward: bigint;
  maxSupply: number;
  currentSupply: number;
}

export interface PoolInfo {
  tokenA: string;
  tokenB: string;
  reserveA: bigint;
  reserveB: bigint;
  totalShares: bigint;
  swapFee: number;
}

export interface PoolPair {
  tokenA: string;
  tokenB: string;
  name: string;
}

export interface LPStakeInfo {
  amount: bigint;
  startTime: number;
  lockDays: number;
  rewardRate: number;
}

export interface TournamentInfo {
  id: number;
  name: string;
  entryFee: bigint;
  prizePool: bigint;
  maxPlayers: number;
  currentPlayers: number;
  startTime: number;
  endTime: number;
  status: TournamentStatus;
}

export interface TournamentPlayer {
  address: string;
  score: number;
  joinedAt: number;
}

export interface RaffleInfo {
  id: number;
  ticketPrice: bigint;
  prizeAmount: bigint;
  totalTickets: number;
  ticketsSold: number;
  endTime: number;
  winner: string | null;
}

export interface RaffleTicket {
  raffleId: number;
  owner: string;
  ticketNumber: number;
}

// Contract addresses configuration
export interface SorobanContractAddresses {
  cccToken: string;
  nodeSystem: string;
  liquidityPool: string;
  tournamentRaffle: string;
  nftPass: string;
  rewardsVault: string;
  resultsAttestation: string;
  computeCredits: string;
  hostRewards: string;
}

// Supported token assets
export interface TokenAsset {
  code: string;
  issuer: string;
  contractId?: string;
  decimals: number;
  name: string;
  icon?: string;
}

// Default supported tokens
export const SUPPORTED_TOKENS: Record<string, TokenAsset> = {
  XLM: {
    code: 'XLM',
    issuer: 'native',
    decimals: 7,
    name: 'Stellar Lumens',
  },
  USDC: {
    code: 'USDC',
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
    decimals: 7,
    name: 'USD Coin',
  },
  CCC: {
    code: 'CCC',
    issuer: '', // Will be set after deployment
    contractId: '', // Soroban contract ID
    decimals: 7,
    name: 'Cyber City Credits',
  },
  PYUSD: {
    code: 'PYUSD',
    issuer: '',
    decimals: 7,
    name: 'PayPal USD',
  },
};

// Node tier pricing and rewards
export const NODE_TIERS: Record<NodeTier, NodeTierConfig> = {
  basic: {
    price: BigInt(1_000_0000000), // 1,000 CCC
    dailyReward: BigInt(5_0000000), // 5 CCC/day
    maxSupply: 5000,
    currentSupply: 0,
  },
  premium: {
    price: BigInt(10_000_0000000), // 10,000 CCC
    dailyReward: BigInt(60_0000000), // 60 CCC/day
    maxSupply: 2000,
    currentSupply: 0,
  },
  legendary: {
    price: BigInt(100_000_0000000), // 100,000 CCC
    dailyReward: BigInt(700_0000000), // 700 CCC/day
    maxSupply: 100,
    currentSupply: 0,
  },
};

// Pass tier pricing
export const PASS_TIERS: Record<PassTier, { price: bigint; name: string }> = {
  bronze: { price: BigInt(100_0000000), name: 'Bronze Pass' },
  silver: { price: BigInt(500_0000000), name: 'Silver Pass' },
  gold: { price: BigInt(2000_0000000), name: 'Gold Pass' },
  platinum: { price: BigInt(10000_0000000), name: 'Platinum Pass' },
};

// Pool pairs configuration
export const POOL_PAIRS: PoolPair[] = [
  { tokenA: 'USDC', tokenB: 'XLM', name: 'USDC/XLM' },
  { tokenA: 'PYUSD', tokenB: 'XLM', name: 'PYUSD/XLM' },
  { tokenA: 'PYUSD', tokenB: 'USDC', name: 'PYUSD/USDC' },
  { tokenA: 'XLM', tokenB: 'CCC', name: 'XLM/CCC' },
  { tokenA: 'CCC', tokenB: 'USDC', name: 'CCC/USDC' },
  { tokenA: 'PYUSD', tokenB: 'CCC', name: 'PYUSD/CCC' },
];

// Staking lock periods and APY
export const STAKING_PERIODS = [
  { days: 7, apy: 15 },
  { days: 14, apy: 25 },
  { days: 30, apy: 40 },
];

// Helper functions
export const formatCCC = (amount: bigint): string => {
  return (Number(amount) / 10_000_000).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/** @deprecated Use formatCCC instead */
export const formatCCTR = formatCCC;

export const parseCCC = (amount: string | number): bigint => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.floor(numAmount * 10_000_000));
};

/** @deprecated Use parseCCC instead */
export const parseCCTR = parseCCC;

export const formatUSDC = (amount: bigint): string => {
  return (Number(amount) / 10_000_000).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
};

export const parseUSDC = (amount: string | number): bigint => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.floor(numAmount * 10_000_000));
};

// Format credits with commas
export const formatCredits = (amount: bigint): string => {
  return (Number(amount) / 10_000_000).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

// Convert hash bytes to hex string
export const bytesToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

// Convert hex string to bytes
export const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};