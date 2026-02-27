// Multi-chain wallet types

export type ChainType = 'stellar' | 'solana';

export type WalletType = 
  | 'lobstr'
  | 'freighter'
  | 'hotwallet'
  | 'phantom'
  | 'created';

export interface ChainInfo {
  id: ChainType;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  logoUrl?: string;
  usdcSupported?: boolean;
}

export interface WalletInfo {
  id: WalletType;
  name: string;
  icon: string;
  logoUrl: string;
  chain: ChainType;
  downloadUrl: string;
  description: string;
  isPopular?: boolean;
}

export interface ConnectedWallet {
  type: WalletType;
  chain: ChainType;
  address: string;
  isConnected: boolean;
  balance?: number;
  symbol?: string;
}

export const CHAINS: Record<ChainType, ChainInfo> = {
  stellar: {
    id: 'stellar',
    name: 'Stellar',
    symbol: 'XLM',
    icon: '✦',
    color: 'rgb(20, 185, 255)',
    logoUrl: '/images/wallets/stellar.png',
    usdcSupported: true
  },
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    color: 'rgb(153, 69, 255)',
    logoUrl: '/images/wallets/solana.png',
    usdcSupported: true
  },
};

// Default wallet for new users - LOBSTR is the primary wallet
export const DEFAULT_WALLET: WalletType = 'lobstr';

export const WALLETS: WalletInfo[] = [
  // Stellar wallets
  {
    id: 'lobstr',
    name: 'LOBSTR',
    icon: '🌟',
    logoUrl: '/images/wallets/lobstr.png?v=2',
    chain: 'stellar',
    downloadUrl: 'https://lobstr.co/',
    description: 'The most popular Stellar wallet (Recommended)',
    isPopular: true
  },
  {
    id: 'freighter',
    name: 'Freighter',
    icon: '🚀',
    logoUrl: '/images/wallets/freighter.png?v=3',
    chain: 'stellar',
    downloadUrl: 'https://www.freighter.app/',
    description: 'Stellar wallet browser extension'
  },
  {
    id: 'hotwallet',
    name: 'Hot Wallet',
    icon: '🔥',
    logoUrl: '/images/wallets/hotwallet.png?v=2',
    chain: 'stellar',
    downloadUrl: 'https://hotwallet.app/',
    description: 'Fast and simple Stellar wallet'
  },
  // Solana wallet
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    logoUrl: '/images/wallets/phantom.png',
    chain: 'solana',
    downloadUrl: 'https://phantom.app/',
    description: 'The #1 Solana wallet with USDC support',
    isPopular: true
  },
];

export const getChainForWallet = (walletType: WalletType): ChainType => {
  const wallet = WALLETS.find(w => w.id === walletType);
  return wallet?.chain || 'stellar';
};

// Default chain - Stellar primary
export const DEFAULT_CHAIN: ChainType = 'stellar';

// Payment configuration - multi-chain USDC architecture
export const PAYMENT_CONFIG = {
  // Tournament entry fees paid in USDC
  entryFeeCurrency: 'USDC',
  
  // Payouts distributed in USDC
  payoutCurrency: 'USDC',
  
  // CCC rewards token on Soroban (Stellar smart contracts)
  rewardsChain: 'stellar' as ChainType,
  rewardsToken: 'CCC',
  
  // Pass gating using Soroban smart contracts
  passGatingChain: 'stellar' as ChainType,
  
  // Supported USDC chains
  usdcChains: ['stellar', 'solana'] as ChainType[],
};

export const getWalletsByChain = (chain: ChainType): WalletInfo[] => {
  return WALLETS.filter(w => w.chain === chain);
};
