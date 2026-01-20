import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
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
  const [activeChain, setActiveChain] = useState<ChainType>('solana');

  // Check for existing wallet connections on load
  useEffect(() => {
    checkExistingConnections();
  }, []);

  const checkExistingConnections = async () => {
    const wallets: ConnectedWallet[] = [];

    // Check for created wallet (Solana)
    try {
      const storedWallet = localStorage.getItem('cyberCityWallet');
      if (storedWallet) {
        const wallet = JSON.parse(storedWallet);
        wallets.push({
          type: 'created',
          chain: 'solana',
          address: wallet.publicKey,
          isConnected: true,
          symbol: 'SOL'
        });
      }
    } catch (error) {
      console.error('Error loading stored wallet:', error);
    }

    // Check Phantom (Solana)
    if (window.solana && window.solana.isPhantom && window.solana.isConnected) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response?.publicKey) {
          wallets.push({
            type: 'phantom',
            chain: 'solana',
            address: response.publicKey.toString(),
            isConnected: true,
            symbol: 'SOL'
          });
        }
      } catch (error) {
        // Phantom wallet not auto-connected
      }
    }

    // Check Solflare (Solana)
    if (window.solflare && window.solflare.isSolflare && window.solflare.isConnected) {
      try {
        const response = await window.solflare.connect();
        if (response?.publicKey) {
          wallets.push({
            type: 'solflare',
            chain: 'solana',
            address: response.publicKey.toString(),
            isConnected: true,
            symbol: 'SOL'
          });
        }
      } catch (error) {
        // Solflare wallet not auto-connected
      }
    }

    // Check Backpack (Solana)
    if (window.backpack && window.backpack.isBackpack && window.backpack.isConnected) {
      try {
        const response = await window.backpack.connect();
        if (response?.publicKey) {
          wallets.push({
            type: 'backpack',
            chain: 'solana',
            address: response.publicKey.toString(),
            isConnected: true,
            symbol: 'SOL'
          });
        }
      } catch (error) {
        // Backpack wallet not auto-connected
      }
    }

    // Check MetaMask (Ethereum)
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          wallets.push({
            type: 'metamask',
            chain: 'ethereum',
            address: accounts[0],
            isConnected: true,
            symbol: 'ETH'
          });
        }
      } catch (error) {
        // MetaMask wallet not auto-connected
      }
    }

    // Check Coinbase (Ethereum)
    if (window.ethereum && window.ethereum.isCoinbaseWallet) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          wallets.push({
            type: 'coinbase',
            chain: 'ethereum',
            address: accounts[0],
            isConnected: true,
            symbol: 'ETH'
          });
        }
      } catch (error) {
        // Coinbase wallet not auto-connected
      }
    }

    // Note: LOBSTR uses WalletConnect, so we don't auto-detect it on page load
    // Users will connect manually through the modal

    setConnectedWallets(wallets);
    if (wallets.length > 0 && !primaryWallet) {
      setPrimaryWallet(wallets[0]);
      setActiveChain(wallets[0].chain);
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

    // Set as primary if it's the first wallet
    if (!primaryWallet) {
      setPrimaryWallet(newWallet);
      setActiveChain(chain);
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
      // Handle specific wallet disconnection
      switch (type) {
        case 'phantom':
          if (window.solana) await window.solana.disconnect();
          break;
        case 'solflare':
          if (window.solflare) await window.solflare.disconnect();
          break;
        case 'backpack':
          if (window.backpack) await window.backpack.disconnect();
          break;
        case 'metamask':
        case 'coinbase':
          // EVM wallets don't have a disconnect method, we just remove from state
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

      setConnectedWallets(prev => prev.filter(w => w.type !== type));
      
      // Update primary wallet if disconnected
      if (primaryWallet?.type === type) {
        const remaining = connectedWallets.filter(w => w.type !== type);
        if (remaining.length > 0) {
          setPrimaryWallet(remaining[0]);
          setActiveChain(remaining[0].chain);
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
    setActiveChain(wallet.chain);
    
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
    setActiveChain(chain);
    
    // Find a wallet on the new chain and set as primary
    const walletOnChain = connectedWallets.find(w => w.chain === chain);
    if (walletOnChain) {
      setPrimaryWallet(walletOnChain);
    }
  }, [connectedWallets]);

  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'phantom': return '👻';
      case 'solflare': return '🔥';
      case 'backpack': return '🎒';
      case 'metamask': return '🦊';
      case 'coinbase': return '🔵';
      case 'lobstr': return '🌟';
      case 'freighter': return '🚀';
      case 'leap': return '🐸';
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
  const hasMultipleChains = new Set(connectedWallets.map(w => w.chain)).size > 1;

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
