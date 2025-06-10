
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

interface WalletInfo {
  address: string;
  balance: number;
  type: 'phantom' | 'metamask' | 'walletconnect';
}

export const WalletConnector = () => {
  const [connectedWallet, setConnectedWallet] = useState<WalletInfo | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const { toast } = useToast();

  const connectPhantom = async () => {
    setConnecting('phantom');
    try {
      // Check if Phantom is installed
      if (!window.solana || !window.solana.isPhantom) {
        toast({
          title: "Phantom Wallet Not Found",
          description: "Please install Phantom wallet to continue",
          variant: "destructive",
        });
        window.open('https://phantom.app/', '_blank');
        return;
      }

      // Connect to Phantom
      const response = await window.solana.connect();
      const balance = await window.solana.getBalance();
      
      setConnectedWallet({
        address: response.publicKey.toString(),
        balance: balance / 1000000000, // Convert lamports to SOL
        type: 'phantom'
      });

      toast({
        title: "Phantom Connected!",
        description: `Connected to ${response.publicKey.toString().slice(0, 8)}...`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const connectMetaMask = async () => {
    setConnecting('metamask');
    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to continue",
          variant: "destructive",
        });
        window.open('https://metamask.io/', '_blank');
        return;
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Get balance
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [accounts[0], 'latest'],
      });

      setConnectedWallet({
        address: accounts[0],
        balance: parseFloat((parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4)),
        type: 'metamask'
      });

      toast({
        title: "MetaMask Connected!",
        description: `Connected to ${accounts[0].slice(0, 8)}...`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive",
      });
    } finally {
      setConnecting(null);
    }
  };

  const connectWalletConnect = () => {
    setConnecting('walletconnect');
    toast({
      title: "WalletConnect",
      description: "WalletConnect integration coming soon!",
    });
    setConnecting(null);
  };

  const disconnect = () => {
    setConnectedWallet(null);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'phantom': return '👻';
      case 'metamask': return '🦊';
      case 'walletconnect': return '🔗';
      default: return '💼';
    }
  };

  const getCurrency = (type: string) => {
    switch (type) {
      case 'phantom': return 'SOL';
      case 'metamask': return 'ETH';
      default: return 'TOKEN';
    }
  };

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
              {connectedWallet.balance} {getCurrency(connectedWallet.type)}
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
            onClick={connectMetaMask}
            disabled={connecting === 'metamask'}
            variant="outline"
            className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black flex items-center gap-3 justify-start"
          >
            <span className="text-2xl">🦊</span>
            <div className="text-left">
              <div className="font-bold">MetaMask</div>
              <div className="text-xs opacity-80">Ethereum Network</div>
            </div>
            {connecting === 'metamask' && (
              <div className="ml-auto animate-pulse">Connecting...</div>
            )}
          </Button>

          <Button 
            onClick={connectWalletConnect}
            disabled={connecting === 'walletconnect'}
            variant="outline"
            className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black flex items-center gap-3 justify-start"
          >
            <span className="text-2xl">🔗</span>
            <div className="text-left">
              <div className="font-bold">WalletConnect</div>
              <div className="text-xs opacity-80">Multi-Chain Support</div>
            </div>
            {connecting === 'walletconnect' && (
              <div className="ml-auto animate-pulse">Connecting...</div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Add TypeScript declarations for wallet objects
declare global {
  interface Window {
    solana?: {
      isPhantom: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      getBalance: () => Promise<number>;
    };
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
    };
  }
}
