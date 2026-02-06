import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wallet, Zap, Coins } from 'lucide-react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { cn } from '@/lib/utils';

interface CCCBalanceBarProps {
  className?: string;
  showChainBadge?: boolean;
}

export const CCCBalanceBar: React.FC<CCCBalanceBarProps> = ({ 
  className,
  showChainBadge = true
}) => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { balance, refetch, dailyBonusAwarded } = useUserBalance();
  const [showBonusAnimation, setShowBonusAnimation] = useState(false);

  // Show animation when daily bonus is awarded
  useEffect(() => {
    if (dailyBonusAwarded && dailyBonusAwarded > 0) {
      setShowBonusAnimation(true);
      const timer = setTimeout(() => setShowBonusAnimation(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [dailyBonusAwarded]);

  // Auto-refresh balance when wallet connects
  useEffect(() => {
    if (isWalletConnected && primaryWallet?.address) {
      refetch();
    }
  }, [isWalletConnected, primaryWallet?.address, refetch]);

  return (
    <div className={cn(
      "flex items-center justify-between p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-neon-cyan/20",
      className
    )}>
      <div className="flex items-center gap-3">
        {showChainBadge && (
          <>
            <Badge 
              variant="outline" 
              className="border-neon-cyan/50 text-neon-cyan flex items-center gap-1.5 px-3 py-1"
            >
              <Zap className="w-3 h-3" />
              <span className="text-xs font-medium">Stellar Powered</span>
            </Badge>
            <span className="text-xs text-muted-foreground">Soroban Smart Contract</span>
          </>
        )}
      </div>
      
      {isWalletConnected && primaryWallet ? (
        <div className="flex items-center gap-4">
          {/* CCC Balance */}
          <div className="flex items-center gap-2 relative">
            <Coins className="w-4 h-4 text-accent" />
            <span className="text-xs text-muted-foreground">CCC:</span>
            <span className={cn(
              "text-sm font-bold text-accent transition-all",
              showBonusAnimation && "animate-pulse scale-110"
            )}>
              {balance.cctr_balance?.toLocaleString() ?? '0'}
            </span>
            
            {/* Daily Bonus Indicator */}
            {showBonusAnimation && (
              <span className="absolute -top-2 -right-2 text-xs text-neon-green animate-bounce">
                +{dailyBonusAwarded}
              </span>
            )}
          </div>
          
          {/* Wallet Address */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
            <Wallet className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm text-neon-cyan font-mono">
              {primaryWallet.address.slice(0, 4)}...{primaryWallet.address.slice(-4)}
            </span>
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 border border-destructive/30">
          <Wallet className="w-4 h-4 text-destructive" />
          <span className="text-sm text-destructive">Connect Wallet to Play</span>
        </div>
      )}
    </div>
  );
};

export default CCCBalanceBar;
