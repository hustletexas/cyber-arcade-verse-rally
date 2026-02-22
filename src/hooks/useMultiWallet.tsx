// Stellar-only multi-wallet hook
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

// Stellar-only wallet types
export type WalletType = 'lobstr' | 'freighter' | 'hotwallet' | 'created';

export interface ConnectedWallet {
  type: WalletType;
  address: string;
  isConnected: boolean;
  balance?: number;
  chain: 'stellar';
  symbol: 'XLM';
}

export const useMultiWallet = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [primaryWallet, setPrimaryWallet] = useState<ConnectedWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeChain] = useState<'stellar'>('stellar');

  // Wallet storage key for cross-tab sync
  const WALLET_STORAGE_KEY = 'cyberCity_connectedWallets';
  const PRIMARY_WALLET_KEY = 'cyberCity_primaryWallet';

  // Load wallets from localStorage for cross-tab persistence
  const loadStoredWallets = (): ConnectedWallet[] => {
    try {
      const stored = localStorage.getItem(WALLET_STORAGE_KEY);
      if (stored) {
        const wallets = JSON.parse(stored);
        // Filter to only Stellar wallets
        const stellarWalletTypes = ['lobstr', 'freighter', 'hotwallet', 'created'];
        return wallets.filter((w: any) => 
          stellarWalletTypes.includes(w.type)
        ).map((w: any) => ({
          ...w,
          chain: 'stellar' as const,
          symbol: 'XLM' as const
        }));
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
        const wallet = JSON.parse(stored);
        // Only return if it's a Stellar wallet
        const stellarWalletTypes = ['lobstr', 'freighter', 'hotwallet', 'created'];
        if (stellarWalletTypes.includes(wallet.type)) {
          return {
            ...wallet,
            chain: 'stellar' as const,
            symbol: 'XLM' as const
          };
        }
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
          const stellarWalletTypes = ['lobstr', 'freighter', 'hotwallet', 'created'];
          setConnectedWallets(wallets.filter((w: any) => 
            stellarWalletTypes.includes(w.type)
          ));
        } catch (error) {
          console.error('Error syncing wallets:', error);
        }
      }
      if (e.key === PRIMARY_WALLET_KEY && e.newValue) {
        try {
          const primary = JSON.parse(e.newValue);
          const stellarWalletTypes = ['lobstr', 'freighter', 'hotwallet', 'created'];
          if (stellarWalletTypes.includes(primary.type)) {
            setPrimaryWallet(primary);
          }
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

  const autoConnectFreighter = async (): Promise<ConnectedWallet | null> => {
    try {
      const freighterApi = (window as any).freighter;
      if (!freighterApi) {
        console.log('Freighter extension not detected');
        return null;
      }

      const isConnected = await freighterApi.isConnected();
      if (!isConnected) {
        console.log('Freighter not previously approved');
        return null;
      }

      const publicKey = await freighterApi.getPublicKey();
      if (publicKey) {
        console.log('Freighter auto-connected:', publicKey.substring(0, 8) + '...');
        return {
          type: 'freighter',
          address: publicKey,
          isConnected: true,
          chain: 'stellar',
          symbol: 'XLM'
        };
      }
    } catch (error) {
      console.log('Freighter auto-connect failed:', error);
    }
    return null;
  };

  const autoConnectLobstr = async (): Promise<ConnectedWallet | null> => {
    try {
      const storedWallets = loadStoredWallets();
      const storedLobstr = storedWallets.find(w => w.type === 'lobstr');
      
      if (storedLobstr && storedLobstr.address) {
        console.log('LOBSTR restored from storage:', storedLobstr.address.substring(0, 8) + '...');
        return {
          type: 'lobstr',
          address: storedLobstr.address,
          isConnected: true,
          chain: 'stellar',
          symbol: 'XLM'
        };
      }
    } catch (error) {
      console.log('LOBSTR auto-connect failed:', error);
    }
    return null;
  };

  const checkExistingConnections = async () => {
    setIsLoading(true);
    
    try {
      const storedWallets = loadStoredWallets();
      const storedPrimary = loadPrimaryWallet();
      
      if (storedWallets.length > 0) {
        const hasStoredLobstr = storedWallets.some(w => w.type === 'lobstr');
        const hasStoredFreighter = storedWallets.some(w => w.type === 'freighter');
        
        let updatedWallets = [...storedWallets];
        let stellarWallet: ConnectedWallet | null = null;
        
        if (hasStoredLobstr) {
          const lobstrWallet = await autoConnectLobstr();
          if (lobstrWallet) {
            updatedWallets = updatedWallets.map(w => 
              w.type === 'lobstr' ? lobstrWallet : w
            );
            stellarWallet = lobstrWallet;
          }
        }
        
        if (hasStoredFreighter) {
          const freighterWallet = await autoConnectFreighter();
          if (freighterWallet) {
            updatedWallets = updatedWallets.map(w => 
              w.type === 'freighter' ? freighterWallet : w
            );
            if (!stellarWallet) {
              stellarWallet = freighterWallet;
            }
          } else {
            updatedWallets = updatedWallets.filter(w => w.type !== 'freighter');
          }
        }
        
        // Ensure all wallets have correct chain data
        updatedWallets = updatedWallets.map(w => ({
          ...w,
          chain: 'stellar' as const,
          symbol: 'XLM' as const
        }));
        
        setConnectedWallets(updatedWallets);
        
        let primary: ConnectedWallet | null = null;
        if (stellarWallet) {
          primary = stellarWallet;
        } else if (storedPrimary && updatedWallets.some(w => w.type === storedPrimary.type)) {
          primary = updatedWallets.find(w => w.type === storedPrimary.type) || null;
        } else {
          primary = updatedWallets[0] || null;
        }
        
        setPrimaryWallet(primary);
        saveWalletsToStorage(updatedWallets, primary);
        setIsLoading(false);
        return;
      }

      // No stored wallets - try auto-connecting Stellar wallets
      const wallets: ConnectedWallet[] = [];
      
      const lobstrWallet = await autoConnectLobstr();
      if (lobstrWallet) {
        wallets.push(lobstrWallet);
      }
      
      const freighterWallet = await autoConnectFreighter();
      if (freighterWallet) {
        wallets.push(freighterWallet);
      }

      setConnectedWallets(wallets);
      if (wallets.length > 0) {
        const lobstr = wallets.find(w => w.type === 'lobstr');
        const primary = lobstr || wallets[0];
        setPrimaryWallet(primary);
        saveWalletsToStorage(wallets, primary);
      }
    } finally {
      setIsLoading(false);
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
    } catch (error) {
      console.error('Error linking wallet to profile:', error);
    }
  };

  const connectWallet = useCallback(async (type: WalletType, address: string) => {
    const newWallet: ConnectedWallet = {
      type,
      address,
      isConnected: true,
      chain: 'stellar',
      symbol: 'XLM'
    };

    setConnectedWallets(prev => {
      const filtered = prev.filter(w => w.type !== type);
      const updated = [...filtered, newWallet];
      
      // Prefer LOBSTR as primary
      let newPrimary = newWallet;
      if (type !== 'lobstr' && updated.some(w => w.type === 'lobstr')) {
        newPrimary = updated.find(w => w.type === 'lobstr')!;
      }
      
      saveWalletsToStorage(updated, newPrimary);
      return updated;
    });

    // Set as primary if it's the first wallet or LOBSTR
    if (!primaryWallet || type === 'lobstr') {
      setPrimaryWallet(newWallet);
    }

    if (user) {
      await linkWalletToProfile(address);
    }

    toast({
      title: "Wallet Connected!",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} wallet connected on Stellar`,
    });
  }, [primaryWallet, toast, user]);

  const disconnectWallet = useCallback(async (type: WalletType) => {
    try {
      const updatedWallets = connectedWallets.filter(w => w.type !== type);
      setConnectedWallets(updatedWallets);
      
      let newPrimary: ConnectedWallet | null = null;
      if (primaryWallet?.type === type) {
        newPrimary = updatedWallets.length > 0 ? updatedWallets[0] : null;
        setPrimaryWallet(newPrimary);
      } else {
        newPrimary = primaryWallet;
      }

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
    saveWalletsToStorage(connectedWallets, wallet);
    
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
      case 'lobstr': return '🌟';
      case 'freighter': return '🚀';
      case 'hotwallet': return '🔥';
      case 'created': return '💰';
      default: return '🔗';
    }
  };

  const getChainIcon = () => {
    return '✦'; // Stellar icon
  };

  const isWalletConnected = connectedWallets.length > 0;
  const hasMultipleWallets = connectedWallets.length > 1;
  const hasMultipleChains = false; // Stellar only

  return {
    connectedWallets,
    primaryWallet,
    isWalletConnected,
    hasMultipleWallets,
    hasMultipleChains,
    isLoading,
    activeChain,
    setActiveChain: () => {}, // No-op since we only support Stellar
    connectWallet,
    disconnectWallet,
    switchPrimaryWallet,
    getWalletIcon,
    getChainIcon,
    checkExistingConnections
  };
};
