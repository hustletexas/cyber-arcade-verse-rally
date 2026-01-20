// Multi-chain wallet types

export type ChainType = 'solana' | 'ethereum' | 'stellar';

export type WalletType = 
  | 'phantom' 
  | 'solflare' 
  | 'backpack' 
  | 'metamask'
  | 'coinbase' 
  | 'freighter'
  | 'created';

export interface ChainInfo {
  id: ChainType;
  name: string;
  symbol: string;
  icon: string;
  color: string;
}

export interface WalletInfo {
  id: WalletType;
  name: string;
  icon: string;
  chain: ChainType;
  downloadUrl: string;
  description: string;
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
    color: 'rgb(156, 106, 222)'
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    color: 'rgb(98, 126, 234)'
  },
  stellar: {
    id: 'stellar',
    name: 'Stellar',
    symbol: 'XLM',
    icon: '✦',
    color: 'rgb(20, 185, 255)'
  }
};

export const WALLETS: WalletInfo[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    chain: 'solana',
    downloadUrl: 'https://phantom.app/',
    description: 'Popular Solana wallet with built-in swaps'
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    chain: 'ethereum',
    downloadUrl: 'https://metamask.io/',
    description: 'Leading Ethereum & EVM wallet'
  },
  {
    id: 'freighter',
    name: 'Freighter',
    icon: '🚀',
    chain: 'stellar',
    downloadUrl: 'https://www.freighter.app/',
    description: 'Stellar network wallet for XLM & tokens'
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: '🔥',
    chain: 'solana',
    downloadUrl: 'https://solflare.com/',
    description: 'Secure Solana wallet with staking'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    chain: 'ethereum',
    downloadUrl: 'https://www.coinbase.com/wallet',
    description: 'Coinbase self-custody wallet'
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: '🎒',
    chain: 'solana',
    downloadUrl: 'https://backpack.app/',
    description: 'Multi-chain wallet for Solana & more'
  }
];

export const getChainForWallet = (walletType: WalletType): ChainType => {
  const wallet = WALLETS.find(w => w.id === walletType);
  return wallet?.chain || 'solana';
};

export const getWalletsByChain = (chain: ChainType): WalletInfo[] => {
  return WALLETS.filter(w => w.chain === chain);
};
