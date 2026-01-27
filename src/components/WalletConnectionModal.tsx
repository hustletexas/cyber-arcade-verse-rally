import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ExternalLink, ChevronRight, Sparkles } from 'lucide-react';
import { ChainType, WalletType, CHAINS, WALLETS, WalletInfo } from '@/types/wallet';
import { StellarWalletsKit, WalletNetwork, allowAllModules, LOBSTR_ID } from '@creit.tech/stellar-wallets-kit';
import freighterApi from '@stellar/freighter-api';

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
  const [lobstrInstalled] = useState(true); // LOBSTR uses WalletConnect, always available
  const [freighterInstalled, setFreighterInstalled] = useState(false);

  // Check Freighter installation on mount
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        // First check if the Freighter extension is available in the window
        if (typeof window !== 'undefined' && (window as any).freighter) {
          setFreighterInstalled(true);
          return;
        }
        
        // Fallback: use the API to check
        const result = await freighterApi.isConnected();
        setFreighterInstalled(result.isConnected === true || result.error === undefined);
      } catch (e) {
        setFreighterInstalled(!!(window as any).freighter);
      }
    };
    if (isOpen) {
      checkFreighter();
    }
  }, [isOpen]);

  // Initialize Stellar Wallets Kit for LOBSTR
  const getStellarKit = () => {
    return new StellarWalletsKit({
      network: WalletNetwork.PUBLIC,
      selectedWalletId: LOBSTR_ID,
      modules: allowAllModules()
    });
  };

  // Stellar wallet connection using LOBSTR via Stellar Wallets Kit
  const connectLobstr = async () => {
    try {
      const kit = getStellarKit();
      
      // Open modal to connect LOBSTR
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
        }
      });

      // Get the address
      const { address } = await kit.getAddress();
      
      if (address) {
        onWalletConnected('lobstr', address, 'stellar');
        onClose();
        toast({
          title: "LOBSTR Connected!",
          description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect to LOBSTR wallet",
        variant: "destructive",
      });
    }
  };

  // Freighter wallet connection (Stellar browser extension) using official API
  const connectFreighter = async () => {
    try {
      // Check if Freighter is available via window object first
      const freighterWindow = (window as any).freighter;
      
      if (!freighterWindow) {
        const connectedResult = await freighterApi.isConnected();
        if (!connectedResult.isConnected && connectedResult.error) {
          throw new Error('Freighter not found. Please install the Freighter browser extension.');
        }
      }

      // Request access - this will prompt the user if not already allowed
      console.log('Requesting Freighter access...');
      const accessResult = await freighterApi.requestAccess();
      
      if (accessResult.error) {
        console.error('Freighter access error:', accessResult.error);
        throw new Error(accessResult.error.message || 'User denied access to Freighter');
      }

      console.log('Freighter access granted, getting address...');
      
      // Get the public address using the official API
      const addressResult = await freighterApi.getAddress();
      
      console.log('Freighter address result:', addressResult);
      
      if (addressResult.error) {
        throw new Error(addressResult.error.message || 'Failed to get address from Freighter');
      }

      if (addressResult.address) {
        onWalletConnected('freighter', addressResult.address, 'stellar');
        onClose();
        toast({
          title: "Freighter Connected!",
          description: `Connected to ${addressResult.address.slice(0, 8)}...${addressResult.address.slice(-4)}`,
        });
      } else {
        throw new Error('No address returned from Freighter. Please ensure you have an account set up.');
      }
    } catch (error: any) {
      console.error('Freighter connection error:', error);
      toast({
        title: "Connection Failed",
        description: error?.message || "Failed to connect to Freighter wallet. Please ensure the extension is unlocked.",
        variant: "destructive",
      });
    }
  };

  const getWalletOptions = (): WalletOption[] => {
    // LOBSTR at top (recommended), then Freighter
    return [
      {
        ...WALLETS.find(w => w.id === 'lobstr')!,
        isInstalled: lobstrInstalled,
        connect: connectLobstr
      },
      {
        ...WALLETS.find(w => w.id === 'freighter')!,
        isInstalled: freighterInstalled,
        connect: connectFreighter
      }
    ];
  };

  const walletOptions = getWalletOptions();
  const popularWallets = walletOptions.filter(w => w.isPopular);
  const otherWallets = walletOptions.filter(w => !w.isPopular);

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

  const WalletButton = ({ wallet }: { wallet: WalletOption }) => {
    const chain = CHAINS[wallet.chain];
    const isConnecting = connecting === wallet.id;
    
    return (
      <button
        onClick={() => handleWalletConnect(wallet)}
        disabled={isConnecting}
        className={`
          w-full flex items-center gap-4 p-4 rounded-xl
          transition-all duration-200 group
          ${wallet.isInstalled 
            ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20' 
            : 'bg-white/[0.02] border border-white/5 opacity-60 hover:opacity-80'
          }
        `}
      >
        {/* Wallet Logo */}
        <div className="relative w-10 h-10 rounded-xl bg-white/10 p-1.5 flex items-center justify-center overflow-hidden">
          <img 
            src={wallet.logoUrl} 
            alt={wallet.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden text-xl">{wallet.icon}</span>
        </div>

        {/* Wallet Info */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white text-sm">
              {wallet.name}
            </span>
            {wallet.isInstalled && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] px-1.5 py-0 font-medium">
                Detected
              </Badge>
            )}
            {wallet.id === 'lobstr' && (
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px] px-1.5 py-0 font-medium">
                Recommended
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {chain.logoUrl ? (
              <img src={chain.logoUrl} alt={chain.name} className="w-3 h-3 rounded-full" />
            ) : (
              <span className="text-[10px]" style={{ color: chain.color }}>{chain.icon}</span>
            )}
            <span className="text-xs text-white/50">{chain.name}</span>
          </div>
        </div>

        {/* Action */}
        <div className="flex items-center gap-2">
          {isConnecting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : wallet.isInstalled ? (
            <ChevronRight size={18} className="text-white/30 group-hover:text-white/60 transition-colors" />
          ) : (
            <ExternalLink size={16} className="text-white/30" />
          )}
        </div>
      </button>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[420px] bg-[#0f0f14] border-white/10 p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-white/5">
          <DialogTitle className="text-xl text-white font-semibold flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
              <Wallet size={20} className="text-white" />
            </div>
            Connect Stellar Wallet
          </DialogTitle>
          <p className="text-sm text-white/50 mt-2">
            Choose a Stellar wallet to connect to Cyber City Arcade
          </p>
        </DialogHeader>

        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Popular Wallets */}
          {popularWallets.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 px-1">
                <Sparkles size={14} className="text-yellow-500" />
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Recommended</span>
              </div>
              <div className="space-y-3">
                {popularWallets.map(wallet => (
                  <WalletButton key={wallet.id} wallet={wallet} />
                ))}
              </div>
            </div>
          )}

          {/* Other Wallets */}
          {otherWallets.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4 px-1">
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">More Wallets</span>
              </div>
              <div className="space-y-3">
                {otherWallets.map(wallet => (
                  <WalletButton key={wallet.id} wallet={wallet} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-white/[0.02]">
          <p className="text-xs text-white/30 text-center">
            New to Stellar?{' '}
            <a 
              href="https://lobstr.co/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Get LOBSTR wallet
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
