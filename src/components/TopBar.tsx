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

    // Check Coinbase wallet (Base network compatible)
    if (window.ethereum) {
      try {
        // Check if it's specifically Coinbase Wallet or if we can connect to Base
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts && accounts.length > 0) {
          // Verify we're connected to Coinbase Wallet specifically
          if (window.ethereum.isCoinbaseWallet) {
            setCoinbaseAddress(accounts[0]);
            setCoinbaseConnected(true);
            console.log('Coinbase Wallet auto-connected:', accounts[0]);
          }
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
      console.log('Attempting Coinbase Wallet connection...');
      
      // Check if any Ethereum provider is available
      if (!window.ethereum) {
        toast({
          title: "No Wallet Found",
          description: "Please install Coinbase Wallet extension",
          variant: "destructive",
        });
        window.open('https://www.coinbase.com/wallet', '_blank');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setCoinbaseAddress(address);
        setCoinbaseConnected(true);
        
        console.log('Connected to wallet:', address);
        console.log('Is Coinbase Wallet:', window.ethereum.isCoinbaseWallet);
        
        toast({
          title: "Base Wallet Connected!",
          description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
        });

        // Listen for account changes
        if (window.ethereum.on) {
          window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
            console.log('Account changed:', newAccounts);
            if (newAccounts.length === 0) {
              disconnectCoinbase();
            } else {
              setCoinbaseAddress(newAccounts[0]);
              toast({
                title: "Account Changed",
                description: `Switched to ${newAccounts[0].slice(0, 8)}...${newAccounts[0].slice(-4)}`,
              });
            }
          });

          // Listen for chain changes
          window.ethereum.on('chainChanged', (chainId: string) => {
            console.log('Chain changed:', chainId);
            // Base mainnet is 0x2105, Base testnet is 0x14a33
            if (chainId === '0x2105' || chainId === '0x14a33') {
              toast({
                title: "Base Network Connected",
                description: "Connected to Base network",
              });
            }
          });
        }

        // Try to switch to Base network if not already connected
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // Base mainnet
          });
        } catch (switchError: any) {
          // If Base network is not added, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0x2105',
                  chainName: 'Base',
                  nativeCurrency: {
                    name: 'Ethereum',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  rpcUrls: ['https://mainnet.base.org'],
                  blockExplorerUrls: ['https://basescan.org'],
                }],
              });
            } catch (addError) {
              console.log('Could not add Base network:', addError);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Coinbase connection error:', error);
      let errorMessage = "Failed to connect to Base wallet";
      
      if (error.code === 4001) {
        errorMessage = "Connection request was rejected";
      } else if (error.code === -32002) {
        errorMessage = "Connection request already pending";
      } else if (error.code === -32603) {
        errorMessage = "Internal error occurred";
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
      window.ethereum.removeListener('chainChanged', () => {});
    }
    
    toast({
      title: "Base Wallet Disconnected",
      description: "Successfully disconnected from Base wallet",
    });
  };

  const mintFreeNFT = async () => {
    if (!phantomConnected && !coinbaseConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Minting NFT",
      description: "Free NFT mint in progress...",
    });

    // Simulate minting process
    setTimeout(() => {
      toast({
        title: "NFT Minted Successfully!",
        description: "Your free Cyber City Arcade NFT has been minted to your wallet",
      });
    }, 3000);
  };

  const createWallet = async () => {
    try {
      // Generate a new Solana keypair
      const { Keypair } = await import('@solana/web3.js');
      const newKeypair = Keypair.generate();
      const publicKey = newKeypair.publicKey.toString();
      const privateKey = Buffer.from(newKeypair.secretKey).toString('hex');
      
      // Store wallet info (in production, this should be more secure)
      localStorage.setItem('cyberCityWallet', JSON.stringify({
        publicKey,
        privateKey
      }));
      
      setPhantomAddress(publicKey);
      setPhantomConnected(true);
      
      toast({
        title: "Wallet Created!",
        description: `New wallet created: ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`,
      });
      
      // Show private key warning
      setTimeout(() => {
        toast({
          title: "⚠️ Important",
          description: "Wallet created! Keep your private key safe. This is just a demo wallet.",
        });
      }, 2000);
      
    } catch (error) {
      console.error('Wallet creation error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create wallet. Install Solana wallet extension for full functionality.",
        variant: "destructive",
      });
    }
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

              {/* Coinbase/Base Wallet */}
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
                  🔵 BASE WALLET
                </Button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button 
              onClick={createWallet}
              className="cyber-button flex items-center gap-2"
            >
              ➕ CREATE WALLET
            </Button>
            <Button 
              onClick={mintFreeNFT}
              className="cyber-button flex items-center gap-2"
            >
              🔨 MINT FREE NFT
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
