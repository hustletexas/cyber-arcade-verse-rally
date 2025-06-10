
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

interface WalletInfo {
  address: string;
  balance: number;
  type: 'phantom' | 'coinbase' | 'stellar';
}

interface WalletConnectorProps {
  compact?: boolean;
}

export const WalletConnector = ({ compact = false }: WalletConnectorProps) => {
  const [connectedWallet, setConnectedWallet] = useState<WalletInfo | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showFullConnector, setShowFullConnector] = useState(false);
  const { toast } = useToast();

  // Check for existing wallet connections on mount
  useEffect(() => {
    checkExistingConnections();
  }, []);

  const checkExistingConnections = async () => {
    // Check Phantom
    if (window.solana?.isPhantom && window.solana.isConnected) {
      try {
        const publicKey = window.solana.publicKey;
        if (publicKey) {
          const balance = await window.solana.connection?.getBalance(publicKey) || 0;
          setConnectedWallet({
            address: publicKey.toString(),
            balance: balance / 1000000000,
            type: 'phantom'
          });
        }
      } catch (error) {
        console.log('Phantom auto-connect failed:', error);
      }
    }

    // Check Coinbase
    if (window.coinbaseSolana?.isConnected) {
      try {
        const accounts = await window.coinbaseSolana.getAccounts();
        if (accounts.length > 0) {
          setConnectedWallet({
            address: accounts[0],
            balance: 0, // Would need to fetch balance
            type: 'coinbase'
          });
        }
      } catch (error) {
        console.log('Coinbase auto-connect failed:', error);
      }
    }
  };

  const connectPhantom = async () => {
    setConnecting('phantom');
    try {
      if (!window.solana?.isPhantom) {
        toast({
          title: "Phantom Wallet Not Found",
          description: "Please install Phantom wallet to continue",
          variant: "destructive",
        });
        window.open('https://phantom.app/', '_blank');
        return;
      }

      const response = await window.solana.connect();
      console.log('Phantom connected:', response.publicKey.toString());
      
      // Get balance
      let balance = 0;
      try {
        if (window.solana.connection) {
          balance = await window.solana.connection.getBalance(response.publicKey);
          balance = balance / 1000000000; // Convert lamports to SOL
        }
      } catch (balanceError) {
        console.log('Could not fetch balance:', balanceError);
      }
      
      setConnectedWallet({
        address: response.publicKey.toString(),
        balance: balance,
        type: 'phantom'
      });

      toast({
        title: "Phantom Connected! 👻",
        description: `Welcome to Cyber City Arcade!`,
      });
      setShowFullConnector(false);
    } catch (error) {
      console.error('Phantom connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const connectCoinbase = async () => {
    setConnecting('coinbase');
    try {
      if (!window.coinbaseSolana) {
        toast({
          title: "Coinbase Wallet Not Found",
          description: "Please install Coinbase Wallet to continue",
          variant: "destructive",
        });
        window.open('https://www.coinbase.com/wallet', '_blank');
        return;
      }

      const accounts = await window.coinbaseSolana.connect();
      console.log('Coinbase connected:', accounts);
      
      setConnectedWallet({
        address: accounts[0],
        balance: 0, // Would need to implement balance fetching for Coinbase
        type: 'coinbase'
      });

      toast({
        title: "Coinbase Connected! 🔵",
        description: `Ready to compete in Cyber City Arcade!`,
      });
      setShowFullConnector(false);
    } catch (error) {
      console.error('Coinbase connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Coinbase wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const connectStellar = () => {
    setConnecting('stellar');
    toast({
      title: "Stellar Integration",
      description: "Stellar wallet integration coming soon! 🚀",
    });
    setConnecting(null);
  };

  const disconnect = async () => {
    try {
      if (connectedWallet?.type === 'phantom' && window.solana?.isPhantom) {
        await window.solana.disconnect();
      } else if (connectedWallet?.type === 'coinbase' && window.coinbaseSolana) {
        await window.coinbaseSolana.disconnect();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
    
    setConnectedWallet(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'phantom': return '👻';
      case 'coinbase': return '🔵';
      case 'stellar': return '⭐';
      default: return '💼';
    }
  };

  const getCurrency = (type: string) => {
    switch (type) {
      case 'phantom': return 'SOL';
      case 'coinbase': return 'SOL';
      case 'stellar': return 'XLM';
      default: return 'TOKEN';
    }
  };

  // Compact version for TopBar
  if (compact) {
    if (connectedWallet) {
      return (
        <Button 
          variant="outline"
          className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black h-[42px] px-4"
          onClick={() => setShowFullConnector(!showFullConnector)}
        >
          <Wallet className="w-4 h-4 mr-2" />
          {getWalletIcon(connectedWallet.type)} CONNECTED
        </Button>
      );
    }

    return (
      <Button 
        variant="outline"
        className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black h-[42px] px-4"
        onClick={() => setShowFullConnector(!showFullConnector)}
      >
        <Wallet className="w-4 h-4 mr-2" />
        CONNECT WALLET
      </Button>
    );
  }

  if (connectedWallet) {
    return (
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan flex items-center gap-3">
            <Wallet className="w-6 h-6" />
            CONNECTED WALLET
            <Badge className="bg-neon-green text-black">ACTIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-pink rounded-lg flex items-center justify-center text-2xl">
              {getWalletIcon(connectedWallet.type)}
            </div>
            <div className="flex-1">
              <div className="font-bold text-neon-cyan capitalize">
                {connectedWallet.type} Wallet
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                {connectedWallet.address.slice(0, 8)}...{connectedWallet.address.slice(-8)}
              </div>
            </div>
          </div>
          
          <div className="border border-neon-cyan/30 rounded-lg p-4 bg-neon-cyan/5">
            <div className="text-sm text-neon-purple mb-1">Balance</div>
            <div className="text-2xl font-bold text-neon-green font-mono">
              {connectedWallet.balance.toFixed(4)} {getCurrency(connectedWallet.type)}
            </div>
          </div>

          <Button 
            onClick={disconnect}
            variant="outline"
            className="w-full border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-xl text-neon-cyan flex items-center gap-3">
          <Wallet className="w-6 h-6" />
          CONNECT WALLET
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground mb-4">
          Connect your crypto wallet to participate in tournaments and claim NFT rewards
        </div>

        <div className="grid gap-3">
          <Button 
            onClick={connectPhantom}
            disabled={connecting === 'phantom'}
            className="cyber-button flex items-center gap-3 justify-start"
          >
            <span className="text-2xl">👻</span>
            <div className="text-left">
              <div className="font-bold">Phantom Wallet</div>
              <div className="text-xs opacity-80">Solana Network</div>
            </div>
            {connecting === 'phantom' && (
              <div className="ml-auto text-neon-cyan animate-pulse">Connecting...</div>
            )}
          </Button>

          <Button 
            onClick={connectCoinbase}
            disabled={connecting === 'coinbase'}
            variant="outline"
            className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black flex items-center gap-3 justify-start"
          >
            <span className="text-2xl">🔵</span>
            <div className="text-left">
              <div className="font-bold">Coinbase Wallet</div>
              <div className="text-xs opacity-80">Multi-Chain Support</div>
            </div>
            {connecting === 'coinbase' && (
              <div className="ml-auto animate-pulse">Connecting...</div>
            )}
          </Button>

          <Button 
            onClick={connectStellar}
            disabled={connecting === 'stellar'}
            variant="outline"
            className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black flex items-center gap-3 justify-start"
          >
            <span className="text-2xl">⭐</span>
            <div className="text-left">
              <div className="font-bold">Stellar Wallet</div>
              <div className="text-xs opacity-80">Stellar Network</div>
            </div>
            {connecting === 'stellar' && (
              <div className="ml-auto animate-pulse">Connecting...</div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Enhanced TypeScript declarations for wallet objects
declare global {
  interface Window {
    solana?: {
      isPhantom: boolean;
      isConnected: boolean;
      publicKey: any;
      connection: any;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      getBalance: () => Promise<number>;
    };
    coinbaseSolana?: {
      isConnected: boolean;
      connect: () => Promise<string[]>;
      disconnect: () => Promise<void>;
      getAccounts: () => Promise<string[]>;
    };
  }
}
