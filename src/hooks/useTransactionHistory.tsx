import { useState, useEffect, useCallback } from 'react';
import { STELLAR_NETWORK } from '@/config/stellar';

type ChainType = 'solana' | 'ethereum' | 'stellar';

export interface Transaction {
  id: string;
  hash: string;
  type: 'send' | 'receive' | 'swap' | 'unknown';
  amount: number;
  symbol: string;
  from: string;
  to: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
  chain: ChainType;
  fee?: number;
}

interface WalletInput {
  address: string;
  chain?: ChainType;
  symbol?: string;
}

interface UseTransactionHistoryReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  refreshHistory: () => Promise<void>;
}

// Stellar Horizon API - using centralized config
const STELLAR_HORIZON = STELLAR_NETWORK.horizonUrl;

export const useTransactionHistory = (connectedWallets: WalletInput[]): UseTransactionHistoryReturn => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Solana transactions using public API
  const fetchSolanaTransactions = async (address: string): Promise<Transaction[]> => {
    try {
      // Use Solana FM API which is more CORS-friendly
      const response = await fetch(
        `https://api.solana.fm/v0/accounts/${address}/transactions?limit=10`,
        {
          headers: {
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        // Fallback: return empty array if API fails
        console.log('Solana FM API not available, using fallback');
        return [];
      }

      const data = await response.json();
      
      if (!data.result || !Array.isArray(data.result)) {
        return [];
      }

      return data.result.slice(0, 10).map((tx: any) => ({
        id: tx.signature || tx.transactionHash,
        hash: tx.signature || tx.transactionHash,
        type: 'unknown' as const,
        amount: 0,
        symbol: 'SOL',
        from: address,
        to: '',
        timestamp: new Date(tx.blockTime * 1000 || Date.now()),
        status: tx.status === 'Success' ? 'success' : 'failed',
        chain: 'solana' as ChainType
      }));
    } catch (error) {
      console.error('Error fetching Solana transactions:', error);
      return [];
    }
  };

  // Fetch Ethereum transactions - using a simple approach
  const fetchEthereumTransactions = async (address: string): Promise<Transaction[]> => {
    try {
      // Use Blockscout API which is CORS-friendly
      const response = await fetch(
        `https://eth.blockscout.com/api/v2/addresses/${address}/transactions?limit=10`
      );
      
      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      
      if (!data.items || !Array.isArray(data.items)) {
        return [];
      }

      return data.items.slice(0, 10).map((tx: any) => {
        const isReceive = tx.to?.hash?.toLowerCase() === address.toLowerCase();
        const value = parseInt(tx.value || '0') / 1e18;
        
        return {
          id: tx.hash,
          hash: tx.hash,
          type: isReceive ? 'receive' : 'send',
          amount: value,
          symbol: 'ETH',
          from: tx.from?.hash || '',
          to: tx.to?.hash || '',
          timestamp: new Date(tx.timestamp || Date.now()),
          status: tx.status === 'ok' ? 'success' : tx.status === 'error' ? 'failed' : 'pending',
          chain: 'ethereum' as ChainType,
          fee: tx.fee ? parseInt(tx.fee.value || '0') / 1e18 : undefined
        };
      });
    } catch (error) {
      console.error('Error fetching Ethereum transactions:', error);
      return [];
    }
  };

  // Fetch Stellar transactions
  const fetchStellarTransactions = async (address: string): Promise<Transaction[]> => {
    try {
      const response = await fetch(
        `${STELLAR_HORIZON}/accounts/${address}/transactions?limit=10&order=desc`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          // Account not funded
          return [];
        }
        throw new Error('Failed to fetch Stellar transactions');
      }

      const data = await response.json();
      
      if (!data._embedded?.records) {
        return [];
      }

      // Get operations for each transaction
      const txPromises = data._embedded.records.map(async (tx: any) => {
        try {
          const opsResponse = await fetch(`${STELLAR_HORIZON}/transactions/${tx.hash}/operations?limit=1`);
          const opsData = await opsResponse.json();
          const op = opsData._embedded?.records?.[0];
          
          let type: 'send' | 'receive' | 'unknown' = 'unknown';
          let amount = 0;
          let from = tx.source_account;
          let to = '';
          
          if (op) {
            if (op.type === 'payment' || op.type === 'create_account') {
              amount = parseFloat(op.amount || op.starting_balance || '0');
              to = op.to || op.account || '';
              type = op.source_account === address ? 'send' : 'receive';
            }
          }

          return {
            id: tx.id,
            hash: tx.hash,
            type,
            amount,
            symbol: 'XLM',
            from,
            to,
            timestamp: new Date(tx.created_at),
            status: tx.successful ? 'success' : 'failed',
            chain: 'stellar' as ChainType,
            fee: parseInt(tx.fee_charged || '0') / 10000000
          };
        } catch {
          return {
            id: tx.id,
            hash: tx.hash,
            type: 'unknown' as const,
            amount: 0,
            symbol: 'XLM',
            from: tx.source_account,
            to: '',
            timestamp: new Date(tx.created_at),
            status: tx.successful ? 'success' : 'failed',
            chain: 'stellar' as ChainType
          };
        }
      });

      return Promise.all(txPromises);
    } catch (error) {
      console.error('Error fetching Stellar transactions:', error);
      return [];
    }
  };

  // Fetch all transactions
  const fetchTransactions = async (wallet: WalletInput): Promise<Transaction[]> => {
    const chain = wallet.chain || 'solana';
    
    switch (chain) {
      case 'solana':
        return fetchSolanaTransactions(wallet.address);
      case 'ethereum':
        return fetchEthereumTransactions(wallet.address);
      case 'stellar':
        return fetchStellarTransactions(wallet.address);
      default:
        return [];
    }
  };

  // Refresh all transaction history
  const refreshHistory = useCallback(async () => {
    if (connectedWallets.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const allTransactions: Transaction[] = [];
      
      for (const wallet of connectedWallets) {
        const txs = await fetchTransactions(wallet);
        allTransactions.push(...txs);
      }

      // Sort by timestamp descending
      allTransactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setTransactions(allTransactions.slice(0, 20)); // Keep last 20
    } catch (err: any) {
      setError(err.message || 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [connectedWallets]);

  // Fetch on mount and wallet changes
  useEffect(() => {
    if (connectedWallets.length > 0) {
      refreshHistory();
    }
  }, [connectedWallets.length]);

  return {
    transactions,
    isLoading,
    error,
    refreshHistory
  };
};

// Format transaction hash for display
export const formatTxHash = (hash: string): string => {
  if (!hash) return '';
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
};

// Get explorer URL for transaction
export const getExplorerUrl = (hash: string, chain: ChainType): string => {
  switch (chain) {
    case 'solana':
      return `https://solscan.io/tx/${hash}`;
    case 'ethereum':
      return `https://etherscan.io/tx/${hash}`;
    case 'stellar':
      return `https://stellar.expert/explorer/public/tx/${hash}`;
    default:
      return '#';
  }
};
