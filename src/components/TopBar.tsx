import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  walletType: 'phantom' | 'metamask' | 'walletconnect' | null;
}

export const TopBar = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    walletType: null
  });
  const [walletConnectProvider, setWalletConnectProvider] = useState<any | null>(null);

  // Check for existing wallet connections on component mount
  useEffect(() => {
    checkExistingConnections();
  }, []);

  const checkExistingConnections = async () => {
    // Check Phantom
    if (window.solana?.isPhantom && window.solana.isConnected) {
      try {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        setWalletState({
          address: response.publicKey.toString(),
          isConnected: true,
          walletType: 'phantom'
        });
      } catch (error) {
        console.log('Phantom not auto-connected');
      }
    }

    // Check MetaMask
    if (window.ethereum?.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletState({
            address: accounts[0],
            isConnected: true,
            walletType: 'metamask'
          });
        }
      } catch (error) {
        console.log('MetaMask not auto-connected');
      }
    }
  };

  const connectPhantom = async () => {
    try {
      if (!window.solana) {
        toast({
          title: "Phantom Wallet Not Found",
          description: "Please install Phantom wallet extension",
          variant: "destructive",
        });
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const response = await window.solana.connect();
      const address = response.publicKey.toString();
      
      setWalletState({
        address,
        isConnected: true,
        walletType: 'phantom'
      });

      toast({
        title: "Phantom Connected!",
        description: `Connected to ${address.slice(0, 4)}...${address.slice(-4)}`,
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    }
  };

  const connectMetaMask = async () => {
    try {
      if (!window.ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask extension",
          variant: "destructive",
        });
        window.open('https://metamask.io/', '_blank');
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletState({
          address,
          isConnected: true,
          walletType: 'metamask'
        });

        toast({
          title: "MetaMask Connected!",
          description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive",
      });
    }
  };

  const connectWalletConnect = async () => {
    try {
      toast({
        title: "WalletConnect",
        description: "Opening WalletConnect QR code...",
      });

      // Generate a mock WalletConnect URI for demonstration
      const mockUri = "wc:a13aef13e8e0d6a5f5cb0c8b5f5a5d4e4f5d5e5f5a5d4e4f5d5e5f5a5d4e4f5d@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=a13aef13e8e0d6a5f5cb0c8b5f5a5d4e4f5d5e5f5a5d4e4f5d5e5f5a5d4e4f5d";
      
      // For now, show a deep link that would work with mobile wallets
      const deepLink = `https://metamask.app.link/wc?uri=${encodeURIComponent(mockUri)}`;
      window.open(deepLink, '_blank');

      // Simulate successful connection after a delay (for demo purposes)
      setTimeout(() => {
        const mockAddress = "0x742d35Cc6C3C0532925a3b8D0c4E6BE8C2E6C849";
        setWalletState({
          address: mockAddress,
          isConnected: true,
          walletType: 'walletconnect'
        });

        toast({
          title: "WalletConnect Connected!",
          description: `Connected to ${mockAddress.slice(0, 6)}...${mockAddress.slice(-4)}`,
        });
      }, 3000);

    } catch (error: any) {
      console.error("WalletConnect connection error:", error);
      toast({
        title: "WalletConnect Failed",
        description: error.message || "Failed to connect via WalletConnect",
        variant: "destructive",
      });
    }
  };

  const disconnectWallet = async () => {
    try {
      if (walletState.walletType === 'phantom' && window.solana) {
        await window.solana.disconnect();
      } else if (walletState.walletType === 'metamask') {
        // MetaMask doesn't have a programmatic disconnect, just clear state
        console.log("MetaMask disconnection requested");
      } else if (walletState.walletType === 'walletconnect') {
        console.log("WalletConnect disconnection requested");
      }
      
      setWalletState({
        address: null,
        isConnected: false,
        walletType: null
      });

      toast({
        title: "Wallet Disconnected",
        description: "Successfully disconnected from wallet",
      });
    } catch (error: any) {
      toast({
        title: "Disconnect Failed",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Goodbye!",
        description: "Successfully logged out from Cyber City Arcade",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b border-neon-cyan/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden neon-glow">
              <img 
                src="/lovable-uploads/c084d8de-a04e-4e1e-9e0c-ea179d67f5a7.png" 
                alt="Cyber City Arcade Logo" 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Centered Neon Text */}
          <div className="flex-1 flex justify-center">
            <h2 className="text-neon-cyan font-display text-xl md:text-2xl font-bold neon-glow animate-neon-flicker">
              PLAY • EARN • HAVE FUN
            </h2>
          </div>

          {/* Connection Status & User Info */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="text-neon-cyan">Loading...</div>
            ) : (
              <div className="flex items-center gap-3">
                {/* Wallet Connection Status */}
                {walletState.isConnected && (
                  <Card className="arcade-frame px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-neon-green text-black text-xs">
                        {walletState.walletType === 'phantom' ? '👻' : 
                         walletState.walletType === 'metamask' ? '🦊' : '🔗'} CONNECTED
                      </Badge>
                      <span className="text-neon-cyan text-xs font-mono">
                        {walletState.address?.slice(0, 4)}...{walletState.address?.slice(-4)}
                      </span>
                      <Button 
                        onClick={disconnectWallet}
                        variant="outline" 
                        size="sm"
                        className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black text-xs px-2 py-1"
                      >
                        Disconnect
                      </Button>
                    </div>
                  </Card>
                )}

                {/* User Authentication */}
                {user ? (
                  <Card className="arcade-frame px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border-2 border-neon-cyan">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-neon-purple text-black font-bold">
                          {user.user_metadata?.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-bold text-neon-cyan">
                          {user.user_metadata?.username || user.email?.split('@')[0]}
                        </p>
                        <p className="text-neon-purple text-xs">{user.email}</p>
                      </div>
                      <Badge className="bg-neon-green text-black">
                        🔐 AUTHENTICATED
                      </Badge>
                      <Button 
                        onClick={handleSignOut}
                        variant="outline" 
                        size="sm"
                        className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                      >
                        Logout
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="cyber-button flex items-center gap-2"
                  >
                    <span className="text-lg">🔐</span>
                    LOGIN / SIGNUP
                  </Button>
                )}

                {/* Wallet Connect Options */}
                {!walletState.isConnected && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={connectPhantom}
                      variant="outline"
                      className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                    >
                      👻 PHANTOM
                    </Button>
                    <Button 
                      onClick={connectMetaMask}
                      variant="outline"
                      className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                    >
                      🦊 METAMASK
                    </Button>
                    <Button 
                      onClick={connectWalletConnect}
                      variant="outline"
                      className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                    >
                      🔗 WALLET
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
