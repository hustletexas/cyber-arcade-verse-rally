// Stellar-only multi-chain wallet hook (simplified)
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import freighterApi from '@stellar/freighter-api';
import { 
  WalletType, 
  ChainType, 
  ConnectedWallet, 
  CHAINS, 
  getChainForWallet 
} from '@/types/wallet';

export const useMultiChainWallet = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [primaryWallet, setPrimaryWallet] = useState<ConnectedWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // Stellar is the only supported chain
  const [activeChain] = useState<ChainType>('stellar');

  // Check for existing wallet connections on load
  useEffect(() => {
    checkExistingConnections();
  }, []);

  const checkExistingConnections = async () => {
    const wallets: ConnectedWallet[] = [];

    // Check localStorage for stored Stellar wallets
    try {
      const storedWallets = localStorage.getItem('cyberCity_connectedWallets');
      if (storedWallets) {
        const parsed = JSON.parse(storedWallets);
        // Only restore Stellar wallets
        for (const wallet of parsed) {
          if (wallet.type === 'lobstr' || wallet.type === 'freighter') {
            wallets.push({
              type: wallet.type,
              chain: 'stellar',
              address: wallet.address,
              isConnected: true,
              symbol: 'XLM'
            });
          }
        }
      }
    } catch (error) {
      console.error('Error loading stored wallets:', error);
    }

    // Auto-connect Freighter if available (using @stellar/freighter-api)
    try {
      const connResult = await freighterApi.isConnected();
      if (connResult.isConnected) {
        const allowedResult = await freighterApi.isAllowed();
        if (allowedResult.isAllowed) {
          const addrResult = await freighterApi.getAddress();
          if (addrResult.address && !wallets.find(w => w.type === 'freighter')) {
            wallets.push({
              type: 'freighter',
              chain: 'stellar',
              address: addrResult.address,
              isConnected: true,
              symbol: 'XLM'
            });
          }
        }
      }
    } catch (error) {
      // Freighter not available
    }

    setConnectedWallets(wallets);
    if (wallets.length > 0 && !primaryWallet) {
      // Prefer LOBSTR as primary
      const lobstr = wallets.find(w => w.type === 'lobstr');
      const selectedWallet = lobstr || wallets[0];
      setPrimaryWallet(selectedWallet);
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
    const chain = getChainForWallet(type);
    const chainInfo = CHAINS[chain];
    
    const newWallet: ConnectedWallet = {
      type,
      chain,
      address,
      isConnected: true,
      symbol: chainInfo.symbol
    };

    setConnectedWallets(prev => {
      const filtered = prev.filter(w => w.type !== type);
      return [...filtered, newWallet];
    });

    // Set as primary if it's the first wallet or LOBSTR
    if (!primaryWallet || type === 'lobstr') {
      setPrimaryWallet(newWallet);
    }

    // Link wallet to user profile if logged in
    if (user) {
      await linkWalletToProfile(address);
    }

    toast({
      title: "Wallet Connected!",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} wallet on ${chainInfo.name} connected`,
    });
  }, [primaryWallet, toast, user]);

  const disconnectWallet = useCallback(async (type: WalletType) => {
    try {
      setConnectedWallets(prev => prev.filter(w => w.type !== type));
      
      // Update primary wallet if disconnected
      if (primaryWallet?.type === type) {
        const remaining = connectedWallets.filter(w => w.type !== type);
        if (remaining.length > 0) {
          setPrimaryWallet(remaining[0]);
        } else {
          setPrimaryWallet(null);
        }
      }

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
    
    // Update profile with new primary wallet
    if (user) {
      await linkWalletToProfile(wallet.address);
    }
    
    toast({
      title: "Primary Wallet Changed",
      description: `Switched to ${wallet.type} wallet on ${CHAINS[wallet.chain].name}`,
    });
  }, [toast, user]);

  const switchChain = useCallback((chain: ChainType) => {
    // No-op - only Stellar is supported
  }, []);

  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'lobstr': return '🌟';
      case 'freighter': return '🚀';
      case 'created': return '💰';
      default: return '🔗';
    }
  };

  const getChainIcon = (chain: ChainType) => CHAINS[chain].icon;

  const getWalletsByChain = (chain: ChainType) => {
    return connectedWallets.filter(w => w.chain === chain);
  };

  const isWalletConnected = connectedWallets.length > 0;
  const hasMultipleWallets = connectedWallets.length > 1;
  const hasMultipleChains = false; // Stellar only

  return {
    connectedWallets,
    primaryWallet,
    activeChain,
    isWalletConnected,
    hasMultipleWallets,
    hasMultipleChains,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchPrimaryWallet,
    switchChain,
    getWalletIcon,
    getChainIcon,
    getWalletsByChain,
    checkExistingConnections,
    CHAINS
  };
};
