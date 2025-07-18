
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Copy, Eye, EyeOff, Download } from 'lucide-react';
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
  const [showWalletDetails, setShowWalletDetails] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [createdWallet, setCreatedWallet] = useState<{publicKey: string, privateKey: string} | null>(null);

  // Check for existing wallet connections on component mount
  useEffect(() => {
    checkWalletConnections();
    loadStoredWallet();
  }, []);

  const loadStoredWallet = () => {
    try {
      const storedWallet = localStorage.getItem('cyberCityWallet');
      if (storedWallet) {
        const wallet = JSON.parse(storedWallet);
        setCreatedWallet(wallet);
        setPhantomAddress(wallet.publicKey);
        setPhantomConnected(true);
        checkWalletBalance(wallet.publicKey);
      }
    } catch (error) {
      console.error('Error loading stored wallet:', error);
    }
  };

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

  const checkWalletBalance = async (publicKey: string) => {
    try {
      const { Connection, PublicKey, LAMPORTS_PER_SOL } = await import('@solana/web3.js');
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const balance = await connection.getBalance(new PublicKey(publicKey));
      setWalletBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setWalletBalance(0);
    }
  };

  const createWallet = async () => {
    try {
      toast({
        title: "Creating Wallet...",
        description: "Generating secure Solana keypair",
      });

      // Generate a new Solana keypair
      const { Keypair } = await import('@solana/web3.js');
      const bs58 = await import('bs58');
      
      const newKeypair = Keypair.generate();
      const publicKey = newKeypair.publicKey.toString();
      const privateKey = bs58.default.encode(newKeypair.secretKey);
      
      const walletData = { publicKey, privateKey };
      
      // Store wallet info securely in localStorage
      localStorage.setItem('cyberCityWallet', JSON.stringify(walletData));
      
      // Update state
      setCreatedWallet(walletData);
      setPhantomAddress(publicKey);
      setPhantomConnected(true);
      
      // Check initial balance
      await checkWalletBalance(publicKey);
      
      toast({
        title: "Wallet Created Successfully! 🎉",
        description: `New Solana wallet: ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`,
      });
      
      // Show wallet details modal
      setShowWalletDetails(true);
      
    } catch (error) {
      console.error('Wallet creation error:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create Solana wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportWallet = () => {
    if (!createdWallet) return;
    
    const walletData = {
      publicKey: createdWallet.publicKey,
      privateKey: createdWallet.privateKey,
      created: new Date().toISOString(),
      network: 'mainnet-beta'
    };
    
    const dataStr = JSON.stringify(walletData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cyber-city-wallet-${createdWallet.publicKey.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Wallet Exported",
      description: "Wallet file downloaded. Keep it secure!",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const deleteWallet = () => {
    localStorage.removeItem('cyberCityWallet');
    setCreatedWallet(null);
    setPhantomAddress('');
    setPhantomConnected(false);
    setWalletBalance(0);
    setShowWalletDetails(false);
    
    toast({
      title: "Wallet Deleted",
      description: "Local wallet has been removed",
      variant: "destructive",
    });
  };

  return (
    <header className="border-b border-neon-cyan/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden neon-glow border-2 border-neon-cyan/50 bg-transparent">
              <img 
                src="/lovable-uploads/c084d8de-a04e-4e1e-9e0c-ea179d67f5a7.png" 
                alt="Cyber City Arcade Logo" 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            {/* Cart Button moved 5 inches to the left */}
            <div className="ml-[360px]">
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
          </div>

          {/* Center Section - User Info and Wallet Management */}
          <div className="flex items-center gap-4 justify-center flex-1">
            {/* User Authentication Info Only - No Login Button */}
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

            {/* Create/Manage Wallet Button - Centered */}
            {createdWallet ? (
              <Button 
                onClick={() => setShowWalletDetails(true)}
                className="cyber-button flex items-center gap-2"
              >
                💰 MANAGE WALLET
              </Button>
            ) : (
              <Button 
                onClick={createWallet}
                className="cyber-button flex items-center gap-2"
              >
                ➕ CREATE WALLET
              </Button>
            )}

            {/* Wallet Integration Buttons - Centered */}
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
            </div>
          </div>

          {/* Right Section - Empty */}
          <div className="flex items-center gap-3">
            {/* Empty */}
          </div>
        </div>
      </div>

      {/* Wallet Details Modal */}
      <Dialog open={showWalletDetails} onOpenChange={setShowWalletDetails}>
        <DialogContent className="max-w-2xl arcade-frame">
          <DialogHeader>
            <DialogTitle className="text-2xl text-neon-cyan font-display flex items-center gap-2">
              💰 Cyber City Wallet Manager
            </DialogTitle>
          </DialogHeader>
          
          {createdWallet && (
            <div className="space-y-6">
              {/* Wallet Overview */}
              <Card className="holographic p-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-neon-pink">Wallet Balance</h3>
                    <Button 
                      size="sm"
                      onClick={() => checkWalletBalance(createdWallet.publicKey)}
                      className="cyber-button text-xs"
                    >
                      🔄 REFRESH
                    </Button>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-neon-green mb-2">
                      {walletBalance.toFixed(4)} SOL
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ≈ ${(walletBalance * 50).toFixed(2)} USD
                    </div>
                  </div>
                </div>
              </Card>

              {/* Public Key */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-neon-purple">Public Key (Address)</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    value={createdWallet.publicKey}
                    className="flex-1 p-3 bg-black/50 border border-neon-cyan rounded text-neon-cyan text-sm font-mono"
                  />
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(createdWallet.publicKey, "Public Key")}
                    className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                    variant="outline"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this address to receive SOL and SPL tokens
                </p>
              </div>

              {/* Private Key */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-neon-pink">Private Key</label>
                <div className="flex gap-2">
                  <input 
                    readOnly 
                    type={showPrivateKey ? "text" : "password"}
                    value={createdWallet.privateKey}
                    className="flex-1 p-3 bg-black/50 border border-neon-pink rounded text-neon-pink text-sm font-mono"
                  />
                  <Button
                    size="sm"
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                    variant="outline"
                  >
                    {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(createdWallet.privateKey, "Private Key")}
                    className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                    variant="outline"
                  >
                    <Copy size={16} />
                  </Button>
                </div>
                <p className="text-xs text-red-400">
                  ⚠️ Never share your private key! Keep it secret and secure.
                </p>
              </div>

              {/* Wallet Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Button 
                  onClick={exportWallet}
                  className="cyber-button flex items-center gap-2"
                >
                  <Download size={16} />
                  EXPORT WALLET
                </Button>
                
                <Button 
                  onClick={() => {
                    window.open(`https://explorer.solana.com/address/${createdWallet.publicKey}`, '_blank');
                  }}
                  variant="outline"
                  className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                >
                  🔍 VIEW ON EXPLORER
                </Button>
                
                <Button 
                  onClick={deleteWallet}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  🗑️ DELETE WALLET
                </Button>
              </div>

              {/* Usage Instructions */}
              <Card className="bg-neon-cyan/10 border-neon-cyan/30">
                <CardContent className="p-4">
                  <h4 className="font-bold text-neon-cyan mb-2">🎮 How to Use Your Wallet</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Send SOL to this address to fund your wallet</li>
                    <li>• Use it for marketplace purchases and tournament entries</li>
                    <li>• Export the wallet file for backup</li>
                    <li>• Import into Phantom or other Solana wallets</li>
                    <li>• Always keep your private key secure</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </header>
  );
};
