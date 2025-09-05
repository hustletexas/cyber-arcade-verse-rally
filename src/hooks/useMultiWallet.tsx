
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type WalletType = 'phantom' | 'solflare' | 'backpack' | 'coinbase' | 'created';

export interface ConnectedWallet {
  type: WalletType;
  address: string;
  isConnected: boolean;
  balance?: number;
}

export const useMultiWallet = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [connectedWallets, setConnectedWallets] = useState<ConnectedWallet[]>([]);
  const [primaryWallet, setPrimaryWallet] = useState<ConnectedWallet | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for existing wallet connections on load
  useEffect(() => {
    checkExistingConnections();
  }, []);

  const checkExistingConnections = async () => {
    const wallets: ConnectedWallet[] = [];

    // Check for created wallet
    try {
      const storedWallet = localStorage.getItem('cyberCityWallet');
      if (storedWallet) {
        const wallet = JSON.parse(storedWallet);
        wallets.push({
          type: 'created',
          address: wallet.publicKey,
          isConnected: true
        });
      }
    } catch (error) {
      console.error('Error loading stored wallet:', error);
    }

    // Check Phantom
    if (window.solana && window.solana.isPhantom && window.solana.isConnected) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response?.publicKey) {
          wallets.push({
            type: 'phantom',
            address: response.publicKey.toString(),
            isConnected: true
          });
        }
      } catch (error) {
        // Phantom wallet not auto-connected
      }
    }

    // Check Solflare
    if (window.solflare && window.solflare.isSolflare && window.solflare.isConnected) {
      try {
        const response = await window.solflare.connect();
        if (response?.publicKey) {
          wallets.push({
            type: 'solflare',
            address: response.publicKey.toString(),
            isConnected: true
          });
        }
      } catch (error) {
        // Solflare wallet not auto-connected
      }
    }

    // Check Backpack
    if (window.backpack && window.backpack.isBackpack && window.backpack.isConnected) {
      try {
        const response = await window.backpack.connect();
        if (response?.publicKey) {
          wallets.push({
            type: 'backpack',
            address: response.publicKey.toString(),
            isConnected: true
          });
        }
      } catch (error) {
        // Backpack wallet not auto-connected
      }
    }

    // Check Coinbase
    if (window.ethereum && window.ethereum.isCoinbaseWallet) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          wallets.push({
            type: 'coinbase',
            address: accounts[0],
            isConnected: true
          });
        }
      } catch (error) {
        // Coinbase wallet not auto-connected
      }
    }

    setConnectedWallets(wallets);
    if (wallets.length > 0 && !primaryWallet) {
      setPrimaryWallet(wallets[0]);
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
    const newWallet: ConnectedWallet = {
      type,
      address,
      isConnected: true
    };

    setConnectedWallets(prev => {
      const filtered = prev.filter(w => w.type !== type);
      return [...filtered, newWallet];
    });

    // Set as primary if it's the first wallet
    if (!primaryWallet) {
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
        case 'solflare':
          if (window.solflare) await window.solflare.disconnect();
          break;
        case 'backpack':
          if (window.backpack) await window.backpack.disconnect();
          break;
        case 'created':
          // Created wallets don't have external disconnection
          break;
      }

      setConnectedWallets(prev => prev.filter(w => w.type !== type));
      
      // Update primary wallet if disconnected
      if (primaryWallet?.type === type) {
        const remaining = connectedWallets.filter(w => w.type !== type);
        setPrimaryWallet(remaining.length > 0 ? remaining[0] : null);
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
      description: `Switched to ${wallet.type} wallet`,
    });
  }, [toast, user]);

  const getWalletIcon = (type: WalletType) => {
    switch (type) {
      case 'phantom': return '👻';
      case 'solflare': return '🔥';
      case 'backpack': return '🎒';
      case 'coinbase': return '🔵';
      case 'created': return '💰';
      default: return '🔗';
    }
  };

  const isWalletConnected = connectedWallets.length > 0;
  const hasMultipleWallets = connectedWallets.length > 1;

  return {
    connectedWallets,
    primaryWallet,
    isWalletConnected,
    hasMultipleWallets,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchPrimaryWallet,
    getWalletIcon,
    checkExistingConnections
  };
};
