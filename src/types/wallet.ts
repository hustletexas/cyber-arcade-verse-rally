// Multi-chain wallet types

export type ChainType = 'solana' | 'ethereum' | 'stellar';

export type WalletType = 
  | 'phantom' 
  | 'metamask'
  | 'coinbase' 
  | 'lobstr'
  | 'freighter'
  | 'leap'
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
  solana: {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    color: 'rgb(156, 106, 222)',
    logoUrl: '/images/wallets/solana.png'
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    color: 'rgb(98, 126, 234)',
    logoUrl: '/images/wallets/ethereum.png'
  },
  stellar: {
    id: 'stellar',
    name: 'Stellar',
    symbol: 'XLM',
    icon: '✦',
    color: 'rgb(20, 185, 255)',
    logoUrl: '/images/wallets/stellar.png'
  }
};

export const WALLETS: WalletInfo[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    logoUrl: '/images/wallets/phantom.png',
    chain: 'solana',
    downloadUrl: 'https://phantom.app/',
    description: 'The friendly crypto wallet',
    isPopular: true
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    logoUrl: '/images/wallets/metamask.png',
    chain: 'ethereum',
    downloadUrl: 'https://metamask.io/',
    description: 'The crypto wallet & gateway to Web3',
    isPopular: true
  },
  {
    id: 'lobstr',
    name: 'LOBSTR',
    icon: '🌟',
    logoUrl: '/images/wallets/lobstr.png?v=2',
    chain: 'stellar',
    downloadUrl: 'https://lobstr.co/',
    description: 'The most popular Stellar wallet',
    isPopular: true
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    logoUrl: '/images/wallets/coinbase.png',
    chain: 'ethereum',
    downloadUrl: 'https://www.coinbase.com/wallet',
    description: 'Your key to the world of crypto'
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
    id: 'leap',
    name: 'Leap',
    icon: '🐸',
    logoUrl: '/images/wallets/leap.png?v=2',
    chain: 'ethereum',
    downloadUrl: 'https://www.leapwallet.io/',
    description: 'Multi-chain Cosmos & EVM wallet'
  }
];

export const getChainForWallet = (walletType: WalletType): ChainType => {
  const wallet = WALLETS.find(w => w.id === walletType);
  return wallet?.chain || 'solana';
};

export const getWalletsByChain = (chain: ChainType): WalletInfo[] => {
  return WALLETS.filter(w => w.chain === chain);
};
