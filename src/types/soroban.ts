// Soroban Contract Types

export type NodeTier = 'basic' | 'premium' | 'legendary';

export type TournamentStatus = 'upcoming' | 'active' | 'completed' | 'cancelled';

export interface CCTRBalance {
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
  cctrToken: string;
  nodeSystem: string;
  liquidityPool: string;
  tournamentRaffle: string;
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
    issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', // Circle USDC on Testnet
    decimals: 7,
    name: 'USD Coin',
  },
  CCTR: {
    code: 'CCTR',
    issuer: '', // Will be set after deployment
    contractId: '', // Soroban contract ID
    decimals: 7,
    name: 'Cyber City Token',
  },
  PYUSD: {
    code: 'PYUSD',
    issuer: '', // PayPal USD issuer
    decimals: 7,
    name: 'PayPal USD',
  },
};

// Node tier pricing and rewards
export const NODE_TIERS: Record<NodeTier, NodeTierConfig> = {
  basic: {
    price: BigInt(1_000_0000000), // 1,000 CCTR
    dailyReward: BigInt(5_0000000), // 5 CCTR/day
    maxSupply: 5000,
    currentSupply: 0,
  },
  premium: {
    price: BigInt(10_000_0000000), // 10,000 CCTR
    dailyReward: BigInt(60_0000000), // 60 CCTR/day
    maxSupply: 2000,
    currentSupply: 0,
  },
  legendary: {
    price: BigInt(100_000_0000000), // 100,000 CCTR
    dailyReward: BigInt(700_0000000), // 700 CCTR/day
    maxSupply: 100,
    currentSupply: 0,
  },
};

// Pool pairs configuration
export const POOL_PAIRS: PoolPair[] = [
  { tokenA: 'USDC', tokenB: 'XLM', name: 'USDC/XLM' },
  { tokenA: 'PYUSD', tokenB: 'XLM', name: 'PYUSD/XLM' },
  { tokenA: 'PYUSD', tokenB: 'USDC', name: 'PYUSD/USDC' },
  { tokenA: 'XLM', tokenB: 'CCTR', name: 'XLM/CCTR' },
  { tokenA: 'CCTR', tokenB: 'USDC', name: 'CCTR/USDC' },
  { tokenA: 'PYUSD', tokenB: 'CCTR', name: 'PYUSD/CCTR' },
];

// Staking lock periods and APY
export const STAKING_PERIODS = [
  { days: 7, apy: 15 },
  { days: 14, apy: 25 },
  { days: 30, apy: 40 },
];

// Helper functions
export const formatCCTR = (amount: bigint): string => {
  return (Number(amount) / 10_000_000).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseCCTR = (amount: string | number): bigint => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return BigInt(Math.floor(numAmount * 10_000_000));
};

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
