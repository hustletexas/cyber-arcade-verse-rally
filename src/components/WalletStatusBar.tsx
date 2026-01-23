import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { WalletConnectionModal } from '@/components/WalletConnectionModal';
import { CheckCircle, Wallet } from 'lucide-react';
import { CHAINS, ChainType } from '@/types/wallet';

interface WalletStatusBarProps {
  showChainSelector?: boolean;
  compact?: boolean;
}

export const WalletStatusBar = ({ showChainSelector = true, compact = false }: WalletStatusBarProps) => {
  const { 
    isWalletConnected, 
    primaryWallet, 
    getWalletIcon, 
    connectWallet,
    activeChain,
    setActiveChain,
    connectedWallets 
  } = useMultiWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleWalletConnected = (walletType: string, address: string) => {
    connectWallet(walletType as any, address);
    setShowWalletModal(false);
  };

  const availableChains = [...new Set(connectedWallets.map(w => w.chain))];

  if (compact) {
    return (
      <>
        <div className="flex items-center gap-2 p-2 rounded-lg border border-neon-cyan/20 bg-card/50">
          {isWalletConnected && primaryWallet ? (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-neon-green" />
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-xs">
                {getWalletIcon(primaryWallet.type)} {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
              </Badge>
              {showChainSelector && availableChains.length > 1 && (
                <Select value={activeChain} onValueChange={(v) => setActiveChain(v as ChainType)}>
                  <SelectTrigger className="h-6 w-20 text-xs border-neon-cyan/30 bg-card/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-neon-cyan/30 z-50">
                    {availableChains.map(chain => (
                      <SelectItem key={chain} value={chain} className="text-xs">
                        {CHAINS[chain].icon} {chain.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <Button
              onClick={() => setShowWalletModal(true)}
              size="sm"
              className="h-6 text-xs cyber-button"
            >
              <Wallet className="w-3 h-3 mr-1" />
              Connect
            </Button>
          )}
        </div>
        <WalletConnectionModal
          isOpen={showWalletModal}
          onClose={() => setShowWalletModal(false)}
          onWalletConnected={handleWalletConnected}
        />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between p-3 rounded-lg border border-neon-cyan/20 bg-card/50">
        <div className="flex items-center gap-3">
          {isWalletConnected && primaryWallet ? (
            <>
              <CheckCircle className="w-5 h-5 text-neon-green" />
              <span className="text-neon-green font-medium">Wallet Connected</span>
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                {getWalletIcon(primaryWallet.type)} {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}
              </Badge>
              <Badge className="bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30">
                {CHAINS[primaryWallet.chain]?.icon} {primaryWallet.chain?.toUpperCase()}
              </Badge>
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded-full border-2 border-neon-pink animate-pulse"></div>
              <span className="text-neon-pink font-medium">Wallet Not Connected</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {showChainSelector && isWalletConnected && availableChains.length > 0 && (
            <Select value={activeChain} onValueChange={(v) => setActiveChain(v as ChainType)}>
              <SelectTrigger className="h-8 w-32 text-xs border-neon-cyan/30 bg-card/80">
                <SelectValue placeholder="Select Chain" />
              </SelectTrigger>
              <SelectContent className="bg-card border-neon-cyan/30 z-50">
                {Object.values(CHAINS).map(chain => (
                  <SelectItem 
                    key={chain.id} 
                    value={chain.id}
                    disabled={!availableChains.includes(chain.id)}
                    className="text-xs"
                  >
                    <span className="flex items-center gap-2">
                      {chain.icon} {chain.name}
                      {availableChains.includes(chain.id) && (
                        <CheckCircle className="w-3 h-3 text-neon-green" />
                      )}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {!isWalletConnected && (
            <Button
              onClick={() => setShowWalletModal(true)}
              className="cyber-button"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={handleWalletConnected}
      />
    </>
  );
};
