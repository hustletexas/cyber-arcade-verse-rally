
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ExternalLink, AlertCircle } from 'lucide-react';

interface WalletOption {
  id: string;
  name: string;
  icon: string;
  description: string;
  downloadUrl: string;
  isInstalled: boolean;
  connect: () => Promise<void>;
}

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (walletType: string, address: string) => void;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected
}) => {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);

  const connectPhantom = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        onWalletConnected('phantom', address);
        onClose();
        toast({
          title: "Phantom Connected!",
          description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
        });
      } else {
        throw new Error('Phantom not found');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    }
  };

  const connectSolflare = async () => {
    try {
      if (window.solflare && window.solflare.isSolflare) {
        const response = await window.solflare.connect();
        const address = response.publicKey.toString();
        onWalletConnected('solflare', address);
        onClose();
        toast({
          title: "Solflare Connected!",
          description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
        });
      } else {
        throw new Error('Solflare not found');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Solflare wallet",
        variant: "destructive",
      });
    }
  };

  const connectBackpack = async () => {
    try {
      if (window.backpack && window.backpack.isBackpack) {
        const response = await window.backpack.connect();
        const address = response.publicKey.toString();
        onWalletConnected('backpack', address);
        onClose();
        toast({
          title: "Backpack Connected!",
          description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
        });
      } else {
        throw new Error('Backpack not found');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Backpack wallet",
        variant: "destructive",
      });
    }
  };

  const connectCoinbase = async () => {
    try {
      if (window.ethereum && window.ethereum.isCoinbaseWallet) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          onWalletConnected('coinbase', address);
          onClose();
          toast({
            title: "Coinbase Connected!",
            description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
          });
        }
      } else {
        throw new Error('Coinbase Wallet not found');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Coinbase wallet",
        variant: "destructive",
      });
    }
  };

  const walletOptions: WalletOption[] = [
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Connect using Phantom wallet',
      downloadUrl: 'https://phantom.app/',
      isInstalled: !!(window.solana && window.solana.isPhantom),
      connect: connectPhantom
    },
    {
      id: 'solflare',
      name: 'Solflare',
      icon: '🔥',
      description: 'Connect using Solflare wallet',
      downloadUrl: 'https://solflare.com/',
      isInstalled: !!(window.solflare && window.solflare.isSolflare),
      connect: connectSolflare
    },
    {
      id: 'backpack',
      name: 'Backpack',
      icon: '🎒',
      description: 'Connect using Backpack wallet',
      downloadUrl: 'https://backpack.app/',
      isInstalled: !!(window.backpack && window.backpack.isBackpack),
      connect: connectBackpack
    },
    {
      id: 'coinbase',
      name: 'Coinbase Wallet',
      icon: '🔵',
      description: 'Connect using Coinbase Wallet (Ethereum/Base)',
      downloadUrl: 'https://www.coinbase.com/wallet',
      isInstalled: !!(window.ethereum && window.ethereum.isCoinbaseWallet),
      connect: connectCoinbase
    }
  ];

  const handleWalletConnect = async (wallet: WalletOption) => {
    if (!wallet.isInstalled) {
      window.open(wallet.downloadUrl, '_blank');
      return;
    }

    setConnecting(wallet.id);
    try {
      await wallet.connect();
    } catch (error) {
      console.error(`Failed to connect to ${wallet.name}:`, error);
    } finally {
      setConnecting(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md arcade-frame">
        <DialogHeader>
          <DialogTitle className="text-xl text-neon-cyan font-display flex items-center gap-2">
            <Wallet size={24} />
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="text-sm text-muted-foreground text-center">
            Choose your preferred wallet to connect to Cyber City Arcade
          </div>

          <div className="space-y-3">
            {walletOptions.map((wallet) => (
              <Card 
                key={wallet.id} 
                className={`cursor-pointer transition-all duration-200 hover:border-neon-cyan/50 ${
                  wallet.isInstalled 
                    ? 'bg-card hover:bg-card/80' 
                    : 'bg-muted/50 border-muted-foreground/20'
                }`}
              >
                <CardContent className="p-4">
                  <Button
                    variant="ghost"
                    className="w-full h-auto p-0 hover:bg-transparent"
                    onClick={() => handleWalletConnect(wallet)}
                    disabled={connecting === wallet.id}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-neon-cyan">
                            {wallet.name}
                          </span>
                          {wallet.isInstalled ? (
                            <Badge className="bg-neon-green text-black text-xs">
                              Installed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs border-neon-pink text-neon-pink">
                              Install
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {wallet.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {connecting === wallet.id && (
                          <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                        )}
                        {!wallet.isInstalled && <ExternalLink size={16} />}
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-neon-cyan/10 border-neon-cyan/30">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-neon-cyan mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-neon-cyan mb-1">New to wallets?</p>
                  <p className="text-muted-foreground">
                    Wallets are used to send, receive, and store digital assets like NFTs and tokens securely.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
