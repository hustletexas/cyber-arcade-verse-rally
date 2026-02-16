import { useState, useEffect, useCallback } from 'react';
import { STELLAR_NETWORK } from '@/config/stellar';

type ChainType = 'stellar';

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

  // Fetch all Stellar balances (XLM and tokens)
  const fetchStellarBalances = async (address: string): Promise<{ xlmBalance: number; assets: StellarAsset[] }> => {
    try {
      const response = await fetch(`${STELLAR_HORIZON}/accounts/${address}`);
      if (!response.ok) {
        if (response.status === 404) {
          return { xlmBalance: 0, assets: [] };
        }
        throw new Error('Failed to fetch Stellar account');
      }
      const data = await response.json();
      
      const assets: StellarAsset[] = [];
      let xlmBalance = 0;
      
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

  // Fetch balance for a wallet
  const fetchBalance = async (wallet: WalletInput): Promise<WalletBalance> => {
    const baseBalance: WalletBalance = {
      address: wallet.address,
      chain: 'stellar',
      balance: 0,
      symbol: wallet.symbol || 'XLM',
      isLoading: true,
      stellarAssets: []
    };

    try {
      const stellarData = await fetchStellarBalances(wallet.address);
      return {
        ...baseBalance,
        balance: stellarData.xlmBalance,
        symbol: 'XLM',
        stellarAssets: stellarData.assets,
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

  const getBalance = useCallback((address: string): WalletBalance | null => {
    return balances[address] || null;
  }, [balances]);

  const getStellarAssets = useCallback((address: string): StellarAsset[] => {
    const walletBalance = balances[address];
    return walletBalance?.stellarAssets || [];
  }, [balances]);

  useEffect(() => {
    if (connectedWallets.length > 0) {
      refreshBalances();
    }
  }, [connectedWallets.length]);

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

export const formatBalance = (balance: number, decimals: number = 4): string => {
  if (balance === 0) return '0';
  if (balance < 0.0001) return '<0.0001';
  return balance.toFixed(decimals);
};
