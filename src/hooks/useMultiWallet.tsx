// Re-export from the new multi-chain wallet hook for backward compatibility
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Legacy types for backward compatibility
export type WalletType = 'phantom' | 'coinbase' | 'metamask' | 'lobstr' | 'freighter' | 'leap' | 'created';

export interface ConnectedWallet {
  type: WalletType;
  address: string;
  isConnected: boolean;
  balance?: number;
  chain?: 'solana' | 'ethereum' | 'stellar';
  symbol?: string;
}

export const useMultiWallet = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [primaryWallet, setPrimaryWallet] = useState<ConnectedWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getChainForWallet = (type: WalletType): 'solana' | 'ethereum' | 'stellar' => {
    switch (type) {
      case 'metamask':
      case 'coinbase':
      case 'leap':
        return 'ethereum';
      case 'lobstr':
      case 'freighter':
        return 'stellar';
      default:
        // Default to Stellar for USDC payments and CCC rewards
        return 'stellar';
    }
  };

  const getSymbolForChain = (chain: 'solana' | 'ethereum' | 'stellar'): string => {
    switch (chain) {
      case 'ethereum': return 'ETH';
      case 'solana': return 'SOL';
      // Default to Stellar - primary chain for payments
      default: return 'XLM';
    }
  };

  // Wallet storage key for cross-tab sync
  const WALLET_STORAGE_KEY = 'cyberCity_connectedWallets';
  const PRIMARY_WALLET_KEY = 'cyberCity_primaryWallet';

  // Load wallets from localStorage for cross-tab persistence
  const loadStoredWallets = (): ConnectedWallet[] => {
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading stored wallets:', error);
    }
    return [];
  };

  const loadPrimaryWallet = (): ConnectedWallet | null => {
    try {
      const stored = localStorage.getItem(PRIMARY_WALLET_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading primary wallet:', error);
    }
    return null;
  };

  // Save wallets to localStorage for cross-tab persistence
  const saveWalletsToStorage = (wallets: ConnectedWallet[], primary: ConnectedWallet | null) => {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallets));
      if (primary) {
        localStorage.setItem(PRIMARY_WALLET_KEY, JSON.stringify(primary));
      } else {
        localStorage.removeItem(PRIMARY_WALLET_KEY);
      }
    } catch (error) {
      console.error('Error saving wallets:', error);
    }
  };

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WALLET_STORAGE_KEY && e.newValue) {
        try {
          const wallets = JSON.parse(e.newValue);
          setConnectedWallets(wallets);
        } catch (error) {
          console.error('Error syncing wallets:', error);
        }
      }
      if (e.key === PRIMARY_WALLET_KEY && e.newValue) {
        try {
          const primary = JSON.parse(e.newValue);
          setPrimaryWallet(primary);
        } catch (error) {
          console.error('Error syncing primary wallet:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check for existing wallet connections on load
  useEffect(() => {
    checkExistingConnections();
  }, []);

  const checkExistingConnections = async () => {
    // First, load from localStorage for consistent cross-tab experience
    const storedWallets = loadStoredWallets();
    const storedPrimary = loadPrimaryWallet();
    
    if (storedWallets.length > 0) {
      setConnectedWallets(storedWallets);
      setPrimaryWallet(storedPrimary || storedWallets[0]);
      return; // Use stored wallets, don't re-detect
    }

    // No stored wallets, detect connected ones
    const wallets: ConnectedWallet[] = [];

    // Check Phantom (auto-connect only if trusted)
    if (window.solana && window.solana.isPhantom && window.solana.isConnected) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response?.publicKey) {
          wallets.push({
            type: 'phantom',
            address: response.publicKey.toString(),
            isConnected: true,
            chain: 'solana',
            symbol: 'SOL'
          });
        }
      } catch (error) {
        // Phantom wallet not auto-connected
      }
    }

    // Check MetaMask
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          wallets.push({
            type: 'metamask',
            address: accounts[0],
            isConnected: true,
            chain: 'ethereum',
            symbol: 'ETH'
          });
        }
      } catch (error) {
        // MetaMask wallet not auto-connected
      }
    }

    // Check Coinbase
    const coinbaseProvider = (window as any).coinbaseWalletExtension || 
      ((window.ethereum as any)?.providers?.find((p: any) => p.isCoinbaseWallet)) ||
      (window.ethereum?.isCoinbaseWallet ? window.ethereum : null);
    
    if (coinbaseProvider) {
      try {
        const accounts = await coinbaseProvider.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          wallets.push({
            type: 'coinbase',
            address: accounts[0],
            isConnected: true,
            chain: 'ethereum',
            symbol: 'ETH'
          });
        }
      } catch (error) {
        // Coinbase wallet not auto-connected
      }
    }

    setConnectedWallets(wallets);
    if (wallets.length > 0) {
      // Prefer Stellar wallets as primary (for USDC payments and CCC rewards)
      const stellarWallet = wallets.find(w => w.chain === 'stellar');
      const primary = stellarWallet || wallets[0];
      setPrimaryWallet(primary);
      saveWalletsToStorage(wallets, primary);
    }
  };

  const linkWalletToProfile = async (walletAddress: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: walletAddress })
        .eq('id', user.id);

      if (error) throw error;
      
      // Wallet linked to profile successfully
    } catch (error) {
      console.error('Error linking wallet to profile:', error);
    }
  };

  const connectWallet = useCallback(async (type: WalletType, address: string) => {
    const chain = getChainForWallet(type);
    const symbol = getSymbolForChain(chain);
    
    const newWallet: ConnectedWallet = {
      type,
      address,
      isConnected: true,
      chain,
      symbol
    };

    setConnectedWallets(prev => {
      const filtered = prev.filter(w => w.type !== type);
      const updated = [...filtered, newWallet];
      
      // Save to localStorage for cross-tab sync
      const primary = primaryWallet || newWallet;
      saveWalletsToStorage(updated, primary);
      
      return updated;
    });

    // Set as primary if it's the first wallet or a Stellar wallet (preferred)
    if (!primaryWallet || chain === 'stellar') {
      setPrimaryWallet(newWallet);
    }

    // Link wallet to user profile if logged in
    if (user) {
      await linkWalletToProfile(address);
    }

    toast({
      title: "Wallet Connected!",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} wallet connected successfully`,
    });
  }, [primaryWallet, toast, user]);

  const disconnectWallet = useCallback(async (type: WalletType) => {
    try {
      // Handle specific wallet disconnection
      switch (type) {
        case 'phantom':
          if (window.solana) await window.solana.disconnect();
          break;
        case 'metamask':
        case 'coinbase':
          // EVM wallets don't have a disconnect method
          break;
        case 'lobstr':
          // LOBSTR uses WalletConnect, disconnect handled by the kit
          break;
        case 'freighter':
          // Freighter doesn't have a disconnect method
          break;
        case 'leap':
          // Leap doesn't have a standard disconnect
          break;
        case 'created':
          // Created wallets don't have external disconnection
          break;
      }

      const updatedWallets = connectedWallets.filter(w => w.type !== type);
      setConnectedWallets(updatedWallets);
      
      // Update primary wallet if disconnected
      let newPrimary: ConnectedWallet | null = null;
      if (primaryWallet?.type === type) {
        newPrimary = updatedWallets.length > 0 ? updatedWallets[0] : null;
        setPrimaryWallet(newPrimary);
      } else {
        newPrimary = primaryWallet;
      }

      // Save to localStorage for cross-tab sync
      saveWalletsToStorage(updatedWallets, newPrimary);

      toast({
        title: "Wallet Disconnected",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} wallet disconnected`,
      });
    } catch (error) {
      console.error(`Error disconnecting ${type}:`, error);
      toast({
        title: "Disconnection Error",
        description: `Failed to disconnect ${type} wallet`,
        variant: "destructive",
      });
    }
  }, [connectedWallets, primaryWallet, toast]);

  const switchPrimaryWallet = useCallback(async (wallet: ConnectedWallet) => {
    setPrimaryWallet(wallet);
    
    // Save to localStorage for cross-tab sync
    saveWalletsToStorage(connectedWallets, wallet);
    
    // Update profile with new primary wallet
    if (user) {
      await linkWalletToProfile(wallet.address);
    }
    
    toast({
      title: "Primary Wallet Changed",
      description: `Switched to ${wallet.type} wallet`,
    });
  }, [connectedWallets, toast, user]);

  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'phantom': return '👻';
      case 'metamask': return '🦊';
      case 'coinbase': return '🔵';
      case 'lobstr': return '🌟';
      case 'freighter': return '🚀';
      case 'leap': return '🐸';
      case 'created': return '💰';
      default: return '🔗';
    }
  };

  const getChainIcon = (chain?: 'solana' | 'ethereum' | 'stellar') => {
    switch (chain) {
      case 'ethereum': return '⟠';
      case 'stellar': return '✦';
      default: return '◎';
    }
  };

  const isWalletConnected = connectedWallets.length > 0;
  const hasMultipleWallets = connectedWallets.length > 1;
  const hasMultipleChains = new Set(connectedWallets.map(w => w.chain)).size > 1;

  return {
    connectedWallets,
    primaryWallet,
    isWalletConnected,
    hasMultipleWallets,
    hasMultipleChains,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchPrimaryWallet,
    getWalletIcon,
    getChainIcon,
    checkExistingConnections
  };
};
