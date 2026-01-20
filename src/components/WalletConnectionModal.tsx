import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ExternalLink, AlertCircle } from 'lucide-react';
import { ChainType, WalletType, CHAINS, WALLETS, WalletInfo } from '@/types/wallet';

interface WalletOption extends WalletInfo {
  isInstalled: boolean;
  connect: () => Promise<void>;
}

interface WalletConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletConnected: (walletType: WalletType, address: string, chain: ChainType) => void;
}

export const WalletConnectionModal: React.FC<WalletConnectionModalProps> = ({
  isOpen,
  onClose,
  onWalletConnected
}) => {
  const { toast } = useToast();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ChainType>('solana');

  // Solana wallet connections
  const connectPhantom = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        onWalletConnected('phantom', address, 'solana');
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
        onWalletConnected('solflare', address, 'solana');
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
        onWalletConnected('backpack', address, 'solana');
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

  // EVM wallet connections
  const connectMetaMask = async () => {
    try {
      if (window.ethereum && window.ethereum.isMetaMask) {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          onWalletConnected('metamask', address, 'ethereum');
          onClose();
          toast({
            title: "MetaMask Connected!",
            description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
          });
        }
      } else {
        throw new Error('MetaMask not found');
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect to MetaMask wallet",
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
          onWalletConnected('coinbase', address, 'ethereum');
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

  // Stellar wallet connection
  const connectFreighter = async () => {
    try {
      // Check both old and new Freighter API
      const freighterApi = window.freighterApi || window.freighter;
      
      if (freighterApi) {
        // Check if Freighter is connected
        const isConnected = await freighterApi.isConnected();
        if (!isConnected) {
          throw new Error('Freighter is not connected. Please open the extension.');
        }

        // Request permission if not already allowed
        const isAllowed = await freighterApi.isAllowed();
        if (!isAllowed) {
          await freighterApi.setAllowed();
        }

        // Get the public key
        const publicKey = await freighterApi.getPublicKey();
        if (publicKey) {
          onWalletConnected('freighter', publicKey, 'stellar');
          onClose();
          toast({
            title: "Freighter Connected!",
            description: `Connected to ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`,
          });
        }
      } else {
        throw new Error('Freighter not found');
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect to Freighter wallet",
        variant: "destructive",
      });
    }
  };

  const getWalletOptions = (): Record<ChainType, WalletOption[]> => ({
    solana: [
      {
        ...WALLETS.find(w => w.id === 'phantom')!,
        isInstalled: !!(window.solana && window.solana.isPhantom),
        connect: connectPhantom
      },
      {
        ...WALLETS.find(w => w.id === 'solflare')!,
        isInstalled: !!(window.solflare && window.solflare.isSolflare),
        connect: connectSolflare
      },
      {
        ...WALLETS.find(w => w.id === 'backpack')!,
        isInstalled: !!(window.backpack && window.backpack.isBackpack),
        connect: connectBackpack
      }
    ],
    ethereum: [
      {
        ...WALLETS.find(w => w.id === 'metamask')!,
        isInstalled: !!(window.ethereum && window.ethereum.isMetaMask),
        connect: connectMetaMask
      },
      {
        ...WALLETS.find(w => w.id === 'coinbase')!,
        isInstalled: !!(window.ethereum && window.ethereum.isCoinbaseWallet),
        connect: connectCoinbase
      }
    ],
    stellar: [
      {
        ...WALLETS.find(w => w.id === 'freighter')!,
        isInstalled: !!(window.freighterApi || window.freighter),
        connect: connectFreighter
      }
    ]
  });

  const walletOptions = getWalletOptions();

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

  const renderWalletCard = (wallet: WalletOption) => (
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
  );

  // Get all wallets flattened with chain info
  const getAllWallets = () => {
    const allWallets: (WalletOption & { chain: ChainType })[] = [];
    
    (Object.keys(walletOptions) as ChainType[]).forEach(chain => {
      walletOptions[chain].forEach(wallet => {
        allWallets.push({ ...wallet, chain });
      });
    });
    
    return allWallets;
  };

  const allWallets = getAllWallets();

  const renderAllWalletsCard = (wallet: WalletOption & { chain: ChainType }) => {
    const chain = CHAINS[wallet.chain];
    return (
      <Card 
        key={wallet.id} 
        className={`cursor-pointer transition-all duration-200 hover:border-neon-cyan/50 ${
          wallet.isInstalled 
            ? 'bg-card hover:bg-card/80' 
            : 'bg-muted/50 border-muted-foreground/20'
        }`}
      >
        <CardContent className="p-3">
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
                  <Badge 
                    variant="outline" 
                    className="text-[10px] px-1.5 py-0"
                    style={{ borderColor: chain.color, color: chain.color }}
                  >
                    {chain.symbol}
                  </Badge>
                  {wallet.isInstalled ? (
                    <Badge className="bg-neon-green text-black text-[10px] px-1.5 py-0">
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-neon-pink text-neon-pink">
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
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md arcade-frame max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl text-neon-cyan font-display flex items-center gap-2">
            <Wallet size={24} />
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          <div className="text-sm text-muted-foreground text-center">
            Select a wallet to connect • Multi-chain supported
          </div>

          {/* Chain Legend */}
          <div className="flex justify-center gap-4 text-xs">
            {Object.entries(CHAINS).map(([key, chain]) => (
              <div key={key} className="flex items-center gap-1">
                <span style={{ color: chain.color }}>{chain.icon}</span>
                <span className="text-muted-foreground">{chain.name}</span>
              </div>
            ))}
          </div>

          {/* All Wallets List */}
          <div className="space-y-2 overflow-y-auto flex-1 pr-1">
            {allWallets.map(renderAllWalletsCard)}
          </div>

          <Card className="bg-neon-cyan/10 border-neon-cyan/30 flex-shrink-0">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-neon-cyan mt-0.5" />
                <div className="text-xs">
                  <p className="font-semibold text-neon-cyan mb-1">Multi-Chain Support</p>
                  <p className="text-muted-foreground">
                    Connect wallets from Solana, Ethereum, and Stellar networks.
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
