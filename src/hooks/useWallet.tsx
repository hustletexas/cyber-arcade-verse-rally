import { useState, useEffect } from 'react';

export interface WalletState {
  phantomConnected: boolean;
  coinbaseConnected: boolean;
  phantomAddress: string;
  coinbaseAddress: string;
  createdWallet: { publicKey: string; privateKey: string } | null;
}

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    phantomConnected: false,
    coinbaseConnected: false,
    phantomAddress: '',
    coinbaseAddress: '',
    createdWallet: null
  });

  useEffect(() => {
    // Check for existing wallet connections
    const checkConnections = async () => {
      // Check for created wallet
      try {
        const storedWallet = localStorage.getItem('cyberCityWallet');
        if (storedWallet) {
          const wallet = JSON.parse(storedWallet);
          setWalletState(prev => ({
            ...prev,
            createdWallet: wallet,
            phantomAddress: wallet.publicKey,
            phantomConnected: true
          }));
        }
      } catch (error) {
        console.error('Error loading stored wallet:', error);
      }

      // Check Phantom wallet
      if (window.solana && window.solana.isPhantom) {
        try {
          if (window.solana.isConnected) {
            const response = await window.solana.connect({ onlyIfTrusted: true });
            if (response?.publicKey) {
              setWalletState(prev => ({
                ...prev,
                phantomAddress: response.publicKey.toString(),
                phantomConnected: true
              }));
            }
          }
        } catch (error) {
          console.log('Phantom wallet not auto-connected');
        }
      }

      // Check Coinbase wallet
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ 
            method: 'eth_accounts' 
          });
          if (accounts && accounts.length > 0 && window.ethereum.isCoinbaseWallet) {
            setWalletState(prev => ({
              ...prev,
              coinbaseAddress: accounts[0],
              coinbaseConnected: true
            }));
          }
        } catch (error) {
          console.log('Coinbase wallet not auto-connected');
        }
      }
    };

    checkConnections();
  }, []);

  const getConnectedWallet = () => {
    if (walletState.phantomConnected && walletState.phantomAddress) {
      return {
        type: 'phantom',
        address: walletState.phantomAddress,
        isCreated: !!walletState.createdWallet
      };
    }
    if (walletState.coinbaseConnected && walletState.coinbaseAddress) {
      return {
        type: 'coinbase',
        address: walletState.coinbaseAddress,
        isCreated: false
      };
    }
    return null;
  };

  const isWalletConnected = () => {
    return walletState.phantomConnected || walletState.coinbaseConnected;
  };

  return {
    walletState,
    getConnectedWallet,
    isWalletConnected
  };
};