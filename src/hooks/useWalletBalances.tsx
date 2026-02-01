import { useState, useEffect, useCallback } from 'react';
import { STELLAR_NETWORK } from '@/config/stellar';

type ChainType = 'solana' | 'ethereum' | 'stellar';

interface WalletInput {
  address: string;
  chain?: ChainType;
  symbol?: string;
  type?: string;
}

interface StellarAsset {
  code: string;
  issuer?: string;
  balance: number;
  assetType: string;
}

interface WalletBalance {
  address: string;
  chain: ChainType;
  balance: number;
  symbol: string;
  usdValue?: number;
  isLoading: boolean;
  error?: string;
  stellarAssets?: StellarAsset[];
}

interface UseWalletBalancesReturn {
  balances: Record<string, WalletBalance>;
  isLoading: boolean;
  refreshBalances: () => Promise<void>;
  getBalance: (address: string) => WalletBalance | null;
  getStellarAssets: (address: string) => StellarAsset[];
}

// RPC endpoints - using centralized config
const STELLAR_HORIZON = STELLAR_NETWORK.horizonUrl;

export const useWalletBalances = (connectedWallets: WalletInput[]): UseWalletBalancesReturn => {
  const [balances, setBalances] = useState<Record<string, WalletBalance>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Fetch Solana balance using public RPC with fallback
  const fetchSolanaBalance = async (address: string): Promise<number> => {
    try {
      // Use Helius free tier or other CORS-friendly RPC
      const rpcs = [
        'https://solana-mainnet.g.alchemy.com/v2/demo',
        'https://rpc.ankr.com/solana'
      ];
      
      for (const rpc of rpcs) {
        try {
          const response = await fetch(rpc, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getBalance',
              params: [address]
            })
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.result?.value !== undefined) {
              return data.result.value / 1e9; // Convert lamports to SOL
            }
          }
        } catch {
          continue;
        }
      }
      return 0;
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      return 0;
    }
  };

  // Fetch Ethereum balance
  const fetchEthereumBalance = async (address: string): Promise<number> => {
    try {
      // Use window.ethereum if available, otherwise use a public RPC
      const provider = window.ethereum;
      if (provider) {
        const balanceHex = await provider.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        // Convert from wei (hex) to ETH
        const balanceWei = parseInt(balanceHex, 16);
        return balanceWei / 1e18;
      }
      
      // Fallback to public RPC
      const response = await fetch('https://eth.llamarpc.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1
        })
      });
      const data = await response.json();
      if (data.result) {
        const balanceWei = parseInt(data.result, 16);
        return balanceWei / 1e18;
      }
      return 0;
    } catch (error) {
      console.error('Error fetching ETH balance:', error);
      return 0;
    }
  };

  // Fetch all Stellar balances (XLM and tokens)
  const fetchStellarBalances = async (address: string): Promise<{ xlmBalance: number; assets: StellarAsset[] }> => {
    try {
      const response = await fetch(`${STELLAR_HORIZON}/accounts/${address}`);
      if (!response.ok) {
        if (response.status === 404) {
          // Account not funded yet
          return { xlmBalance: 0, assets: [] };
        }
        throw new Error('Failed to fetch Stellar account');
      }
      const data = await response.json();
      
      const assets: StellarAsset[] = [];
      let xlmBalance = 0;
      
      // Parse all balances from Horizon response
      if (data.balances && Array.isArray(data.balances)) {
        for (const b of data.balances) {
          if (b.asset_type === 'native') {
            xlmBalance = parseFloat(b.balance);
            assets.push({
              code: 'XLM',
              balance: xlmBalance,
              assetType: 'native'
            });
          } else {
            // Credit alphanum tokens (e.g., USDC, CCTR)
            assets.push({
              code: b.asset_code || 'Unknown',
              issuer: b.asset_issuer,
              balance: parseFloat(b.balance),
              assetType: b.asset_type
            });
          }
        }
      }
      
      return { xlmBalance, assets };
    } catch (error) {
      console.error('Error fetching Stellar balances:', error);
      return { xlmBalance: 0, assets: [] };
    }
  };

  // Fetch balance based on chain type
  const fetchBalance = async (wallet: WalletInput): Promise<WalletBalance> => {
    const chain = wallet.chain || 'solana';
    const baseBalance: WalletBalance = {
      address: wallet.address,
      chain,
      balance: 0,
      symbol: wallet.symbol || '',
      isLoading: true,
      stellarAssets: []
    };

    try {
      let balance = 0;
      let symbol = '';
      let stellarAssets: StellarAsset[] = [];

      switch (wallet.chain) {
        case 'solana':
          balance = await fetchSolanaBalance(wallet.address);
          symbol = 'SOL';
          break;
        case 'ethereum':
          balance = await fetchEthereumBalance(wallet.address);
          symbol = 'ETH';
          break;
        case 'stellar':
          const stellarData = await fetchStellarBalances(wallet.address);
          balance = stellarData.xlmBalance;
          stellarAssets = stellarData.assets;
          symbol = 'XLM';
          break;
      }

      return {
        ...baseBalance,
        balance,
        symbol,
        stellarAssets,
        isLoading: false
      };
    } catch (error: any) {
      return {
        ...baseBalance,
        isLoading: false,
        error: error.message
      };
    }
  };

  // Refresh all balances
  const refreshBalances = useCallback(async () => {
    if (connectedWallets.length === 0) return;

    setIsLoading(true);

    try {
      const balancePromises = connectedWallets.map(async (wallet) => {
        const balance = await fetchBalance(wallet);
        return { address: wallet.address, balance };
      });

      const results = await Promise.all(balancePromises);
      
      const newBalances: Record<string, WalletBalance> = {};
      results.forEach(({ address, balance }) => {
        newBalances[address] = balance;
      });

      setBalances(newBalances);
    } catch (error) {
      console.error('Error refreshing balances:', error);
    } finally {
      setIsLoading(false);
    }
  }, [connectedWallets]);

  // Get balance for a specific address
  const getBalance = useCallback((address: string): WalletBalance | null => {
    return balances[address] || null;
  }, [balances]);

  // Get Stellar assets for a specific address
  const getStellarAssets = useCallback((address: string): StellarAsset[] => {
    const walletBalance = balances[address];
    return walletBalance?.stellarAssets || [];
  }, [balances]);

  // Fetch balances when wallets change
  useEffect(() => {
    if (connectedWallets.length > 0) {
      refreshBalances();
    }
  }, [connectedWallets.length]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (connectedWallets.length === 0) return;

    const interval = setInterval(() => {
      refreshBalances();
    }, 30000);

    return () => clearInterval(interval);
  }, [connectedWallets.length, refreshBalances]);

  return {
    balances,
    isLoading,
    refreshBalances,
    getBalance,
    getStellarAssets
  };
};

export type { StellarAsset };

// Format balance for display
export const formatBalance = (balance: number, decimals: number = 4): string => {
  if (balance === 0) return '0';
  if (balance < 0.0001) return '<0.0001';
  return balance.toFixed(decimals);
};
