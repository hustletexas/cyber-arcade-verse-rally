
export interface WalletConnectionResult {
  success: boolean;
  address?: string;
  error?: string;
}

// Phantom Wallet Integration
export const connectPhantom = async (): Promise<WalletConnectionResult> => {
  try {
    if (typeof window !== 'undefined' && window.solana && window.solana.isPhantom) {
      const response = await window.solana.connect();
      return {
        success: true,
        address: response.publicKey.toString()
      };
    } else {
      // Redirect to Phantom installation
      window.open('https://phantom.app/', '_blank');
      return {
        success: false,
        error: 'Phantom wallet not found. Please install Phantom.'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to connect to Phantom wallet'
    };
  }
};

// MetaMask Integration
export const connectMetaMask = async (): Promise<WalletConnectionResult> => {
  try {
    if (typeof window !== 'undefined' && window.ethereum) {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });
      
      if (accounts.length > 0) {
        return {
          success: true,
          address: accounts[0]
        };
      } else {
        return {
          success: false,
          error: 'No accounts found'
        };
      }
    } else {
      // Redirect to MetaMask installation
      window.open('https://metamask.io/download/', '_blank');
      return {
        success: false,
        error: 'MetaMask not found. Please install MetaMask.'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Failed to connect to MetaMask'
    };
  }
};

// WalletConnect Integration (simplified)
export const connectWalletConnect = async (): Promise<WalletConnectionResult> => {
  try {
    // For now, we'll simulate WalletConnect
    // In a real implementation, you'd use the WalletConnect library
    return {
      success: false,
      error: 'WalletConnect integration coming soon! Please use Phantom or MetaMask for now.'
    };
  } catch (error) {
    return {
      success: false,
      error: 'WalletConnect connection failed'
    };
  }
};

// Disconnect wallet
export const disconnectWallet = async (): Promise<void> => {
  try {
    if (window.solana && window.solana.disconnect) {
      await window.solana.disconnect();
    }
    // Clear any stored wallet data
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
  } catch (error) {
    console.error('Error disconnecting wallet:', error);
  }
};
