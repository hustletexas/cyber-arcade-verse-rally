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
      "flex flex-col sm:flex-row items-start sm:items-center justify-between p-2 sm:p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-neon-cyan/20 gap-2 sm:gap-0",
      className
    )}>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        {showChainBadge && (
          <>
            <Badge 
              variant="outline" 
              className="border-neon-cyan/50 text-neon-cyan flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1"
            >
              <Zap className="w-3 h-3" />
              <span className="text-[10px] sm:text-xs font-medium">Stellar</span>
            </Badge>
          </>
        )}
      </div>
      
      {isWalletConnected && primaryWallet ? (
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap w-full sm:w-auto">
          {/* CCC Balance */}
          <div className="flex items-center gap-1.5 sm:gap-2 relative">
            <Coins className="w-3 h-3 sm:w-4 sm:h-4 text-accent" />
            <span className="text-[10px] sm:text-xs text-muted-foreground">CCC:</span>
            <span className={cn(
              "text-xs sm:text-sm font-bold text-accent transition-all",
              showBonusAnimation && "animate-pulse scale-110"
            )}>
              {balance.cctr_balance?.toLocaleString() ?? '0'}
            </span>
            
            {showBonusAnimation && (
              <span className="absolute -top-2 -right-2 text-[10px] sm:text-xs text-neon-green animate-bounce">
                +{dailyBonusAwarded}
              </span>
            )}
          </div>
          
          {/* Wallet Address */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30">
            <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-neon-cyan" />
            <span className="text-xs sm:text-sm text-neon-cyan font-mono">
              {primaryWallet.address.slice(0, 4)}...{primaryWallet.address.slice(-4)}
            </span>
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-neon-green animate-pulse" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-destructive/10 border border-destructive/30">
          <Wallet className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
          <span className="text-xs sm:text-sm text-destructive">Connect Wallet to Play</span>
        </div>
      )}
    </div>
  );
};

export default CCCBalanceBar;
