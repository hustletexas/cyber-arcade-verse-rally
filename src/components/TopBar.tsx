
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Copy, Eye, EyeOff, Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const TopBar = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTotalItems, setIsOpen } = useCart();
  const [phantomConnected, setPhantomConnected] = useState(false);
  const [coinbaseConnected, setCoinbaseConnected] = useState(false);
  const [phantomAddress, setPhantomAddress] = useState('');
  const [coinbaseAddress, setCoinbaseAddress] = useState('');

  useEffect(() => {
    checkWalletConnections();
  }, []);

  const checkWalletConnections = async () => {
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

    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_accounts' 
        });
        if (accounts && accounts.length > 0) {
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
      
      if (!window.ethereum) {
        toast({
          title: "No Wallet Found",
          description: "Please install Coinbase Wallet extension",
          variant: "destructive",
        });
        window.open('https://www.coinbase.com/wallet', '_blank');
        return;
      }

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

          window.ethereum.on('chainChanged', (chainId: string) => {
            console.log('Chain changed:', chainId);
            if (chainId === '0x2105' || chainId === '0x14a33') {
              toast({
                title: "Base Network Connected",
                description: "Connected to Base network",
              });
            }
          });
        }

        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }],
          });
        } catch (switchError: any) {
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
    
    if (window.ethereum && window.ethereum.removeListener) {
      window.ethereum.removeListener('accountsChanged', () => {});
      window.ethereum.removeListener('chainChanged', () => {});
    }
    
    toast({
      title: "Base Wallet Disconnected",
      description: "Successfully disconnected from Base wallet",
    });
  };

  return (
    <header className="border-b border-neon-cyan/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              onClick={() => setIsOpen(true)}
              className="cyber-button flex items-center gap-2 relative"
            >
              <ShoppingCart size={16} />
              CART
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-neon-pink text-black min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden neon-glow border-2 border-neon-cyan/50 bg-transparent">
              <img 
                src="/lovable-uploads/c084d8de-a04e-4e1e-9e0c-ea179d67f5a7.png" 
                alt="Cyber City Arcade Logo" 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {loading ? (
              <div className="text-neon-cyan">Loading...</div>
            ) : (
              user && (
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
              )
            )}

            <div className="flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
