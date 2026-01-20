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
    logoUrl: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  },
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    icon: '⟠',
    color: 'rgb(98, 126, 234)',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png'
  },
  stellar: {
    id: 'stellar',
    name: 'Stellar',
    symbol: 'XLM',
    icon: '✦',
    color: 'rgb(20, 185, 255)',
    logoUrl: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/stellar/info/logo.png'
  }
};

export const WALLETS: WalletInfo[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    icon: '👻',
    logoUrl: 'https://phantom.app/img/phantom-logo.svg',
    chain: 'solana',
    downloadUrl: 'https://phantom.app/',
    description: 'The friendly crypto wallet',
    isPopular: true
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg',
    chain: 'ethereum',
    downloadUrl: 'https://metamask.io/',
    description: 'The crypto wallet & gateway to Web3',
    isPopular: true
  },
  {
    id: 'freighter',
    name: 'Freighter',
    icon: '🚀',
    logoUrl: 'https://www.freighter.app/freighter-logo.svg',
    chain: 'stellar',
    downloadUrl: 'https://www.freighter.app/',
    description: 'A stellar wallet in your browser',
    isPopular: true
  },
  {
    id: 'solflare',
    name: 'Solflare',
    icon: '🔥',
    logoUrl: 'https://solflare.com/assets/logo.svg',
    chain: 'solana',
    downloadUrl: 'https://solflare.com/',
    description: 'The safest way to Solana'
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    logoUrl: 'https://altcoinsbox.com/wp-content/uploads/2022/12/coinbase-logo.svg',
    chain: 'ethereum',
    downloadUrl: 'https://www.coinbase.com/wallet',
    description: 'Your key to the world of crypto'
  },
  {
    id: 'backpack',
    name: 'Backpack',
    icon: '🎒',
    logoUrl: 'https://backpack.app/icon.png',
    chain: 'solana',
    downloadUrl: 'https://backpack.app/',
    description: 'A home for your xNFTs'
  }
];

export const getChainForWallet = (walletType: WalletType): ChainType => {
  const wallet = WALLETS.find(w => w.id === walletType);
  return wallet?.chain || 'solana';
};

export const getWalletsByChain = (chain: ChainType): WalletInfo[] => {
  return WALLETS.filter(w => w.chain === chain);
};
