// Stellar-only wallet types

export type ChainType = 'stellar';

export type WalletType = 
  | 'lobstr'
  | 'freighter'
  | 'created';

export interface ChainInfo {
  id: ChainType;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  logoUrl?: string;
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
    logoUrl: '/images/wallets/stellar.png'
  }
};

// Default wallet for new users - LOBSTR is the primary wallet
export const DEFAULT_WALLET: WalletType = 'lobstr';

export const WALLETS: WalletInfo[] = [
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
  }
];

export const getChainForWallet = (walletType: WalletType): ChainType => {
  return 'stellar';
};

// Default chain - Stellar only
export const DEFAULT_CHAIN: ChainType = 'stellar';

// Payment configuration - Stellar-first architecture
export const PAYMENT_CONFIG = {
  // Tournament entry fees paid in USDC on Stellar
  entryFeeChain: 'stellar' as ChainType,
  entryFeeCurrency: 'USDC',
  
  // Payouts distributed in USDC on Stellar
  payoutChain: 'stellar' as ChainType,
  payoutCurrency: 'USDC',
  
  // CCC rewards token on Soroban (Stellar smart contracts)
  rewardsChain: 'stellar' as ChainType,
  rewardsToken: 'CCC',
  
  // Pass gating using Soroban smart contracts
  passGatingChain: 'stellar' as ChainType,
};

export const getWalletsByChain = (chain: ChainType): WalletInfo[] => {
  return WALLETS.filter(w => w.chain === chain);
};
