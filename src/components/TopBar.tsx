
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const TopBar = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [phantomConnected, setPhantomConnected] = useState(false);
  const [coinbaseConnected, setCoinbaseConnected] = useState(false);
  const [phantomAddress, setPhantomAddress] = useState('');
  const [coinbaseAddress, setCoinbaseAddress] = useState('');

  // Check for existing wallet connections on component mount
  useEffect(() => {
    checkWalletConnections();
  }, []);

  const checkWalletConnections = async () => {
    // Check Phantom wallet
    if (window.solana && window.solana.isPhantom) {
      try {
        if (window.solana.isConnected) {
          const response = await window.solana.connect({ onlyIfTrusted: true });
          if (response?.publicKey) {
            setPhantomAddress(response.publicKey.toString());
            setPhantomConnected(true);
          }
        }
      } catch (error) {
        console.log('Phantom wallet not auto-connected');
      }
    }

    // Check Coinbase wallet
    if (window.ethereum && window.ethereum.isCoinbaseWallet) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts && accounts.length > 0) {
          setCoinbaseAddress(accounts[0]);
          setCoinbaseConnected(true);
        }
      } catch (error) {
        console.log('Coinbase wallet not auto-connected');
      }
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

  const connectPhantom = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        setPhantomAddress(address);
        setPhantomConnected(true);
        toast({
          title: "Phantom Connected!",
          description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
        });
      } else {
        toast({
          title: "Phantom Not Found",
          description: "Please install Phantom wallet extension",
          variant: "destructive",
        });
        // Open Phantom website
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('Phantom connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    }
  };

  const connectCoinbase = async () => {
    try {
      // Check if Coinbase Wallet is installed
      if (window.ethereum && window.ethereum.isCoinbaseWallet) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        if (accounts && accounts.length > 0) {
          setCoinbaseAddress(accounts[0]);
          setCoinbaseConnected(true);
          toast({
            title: "Coinbase Connected!",
            description: `Connected to ${accounts[0].slice(0, 8)}...${accounts[0].slice(-4)}`,
          });
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts: string[]) => {
            if (accounts.length === 0) {
              disconnectCoinbase();
            } else {
              setCoinbaseAddress(accounts[0]);
              toast({
                title: "Account Changed",
                description: `Switched to ${accounts[0].slice(0, 8)}...${accounts[0].slice(-4)}`,
              });
            }
          });
        }
      } else if (window.ethereum && !window.ethereum.isCoinbaseWallet) {
        // MetaMask or other wallet detected
        toast({
          title: "Wrong Wallet",
          description: "Please use Coinbase Wallet extension, not MetaMask",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Coinbase Wallet Not Found",
          description: "Please install Coinbase Wallet extension",
          variant: "destructive",
        });
        // Open Coinbase Wallet website
        window.open('https://www.coinbase.com/wallet', '_blank');
      }
    } catch (error: any) {
      console.error('Coinbase connection error:', error);
      let errorMessage = "Failed to connect to Coinbase wallet";
      
      if (error.code === 4001) {
        errorMessage = "Connection request was rejected";
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending";
      }
      
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const disconnectPhantom = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
        setPhantomConnected(false);
        setPhantomAddress('');
        toast({
          title: "Phantom Disconnected",
          description: "Successfully disconnected from Phantom wallet",
        });
      }
    } catch (error) {
      console.error('Phantom disconnection error:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect from Phantom wallet",
        variant: "destructive",
      });
    }
  };

  const disconnectCoinbase = () => {
    setCoinbaseConnected(false);
    setCoinbaseAddress('');
    
    // Remove event listeners
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', () => {});
    }
    
    toast({
      title: "Coinbase Disconnected",
      description: "Successfully disconnected from Coinbase wallet",
    });
  };

  return (
    <header className="border-b border-neon-cyan/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo, Authentication, and Wallet Section */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden neon-glow border-2 border-neon-cyan/50 bg-transparent">
              <img 
                src="/lovable-uploads/c084d8de-a04e-4e1e-9e0c-ea179d67f5a7.png" 
                alt="Cyber City Arcade Logo" 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* User Authentication */}
            {loading ? (
              <div className="text-neon-cyan">Loading...</div>
            ) : (
              <div className="flex items-center gap-3">
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
              </div>
            )}

            {/* Wallet Integration Buttons */}
            <div className="flex items-center gap-2">
              {/* Phantom Wallet */}
              {phantomConnected ? (
                <Button 
                  onClick={disconnectPhantom}
                  variant="outline"
                  size="sm"
                  className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                >
                  👻 {phantomAddress.slice(0, 6)}...
                </Button>
              ) : (
                <Button 
                  onClick={connectPhantom}
                  className="cyber-button flex items-center gap-2"
                  size="sm"
                >
                  👻 PHANTOM
                </Button>
              )}

              {/* Coinbase Wallet */}
              {coinbaseConnected ? (
                <Button 
                  onClick={disconnectCoinbase}
                  variant="outline"
                  size="sm"
                  className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                >
                  🔵 {coinbaseAddress.slice(0, 6)}...
                </Button>
              ) : (
                <Button 
                  onClick={connectCoinbase}
                  className="cyber-button flex items-center gap-2"
                  size="sm"
                >
                  🔵 COINBASE
                </Button>
              )}
            </div>
          </div>

          {/* Empty space for balance */}
          <div></div>
        </div>
      </div>
    </header>
  );
};
