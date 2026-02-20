import React from 'react';
import { GameMode } from '@/types/cyber-sequence';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Zap, Heart } from 'lucide-react';
import { useSeasonPass, TIER_CONFIG } from '@/hooks/useSeasonPass';
import { cn } from '@/lib/utils';

interface CyberSequenceModeSelectProps {
  onSelectMode: (mode: GameMode) => void;
  cctrBalance: number;
  dailyPlaysRemaining?: number;
  walletConnected: boolean;
}

export const CyberSequenceModeSelect: React.FC<CyberSequenceModeSelectProps> = ({
  onSelectMode,
}) => {
  const { hasPass, tier, rewardMultiplier } = useSeasonPass();
  const tierConfig = tier !== 'none' ? TIER_CONFIG[tier] : null;
  const multiplierLabel = `${Math.round(rewardMultiplier * 100)}%`;

  return (
    <div className="max-w-md mx-auto space-y-6">
      {/* Season Pass Badge */}
      <div className="text-center">
        <Badge variant="outline" className={cn(
          "text-sm px-4 py-1",
          hasPass && tierConfig
            ? `${tierConfig.borderColor} ${tierConfig.color} ${tierConfig.bgColor}`
            : "border-muted-foreground/30 text-muted-foreground"
        )}>
          {hasPass && tierConfig
            ? `${tierConfig.emoji} ${tierConfig.label} Pass — ${multiplierLabel} Rewards`
            : '🎮 Free Play — 25% Rewards'}
        </Badge>
      </div>

      <div className="cyber-glass p-6 border-purple-500/30 bg-purple-950/20 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
          <Gamepad2 className="w-8 h-8 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">CYBER SEQUENCE</h2>
        <p className="text-muted-foreground text-sm">
          Free to play • Unlimited attempts • Build your streak
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="border-purple-400/50 text-purple-400">
            <Zap className="w-3 h-3 mr-1" /> No Entry Fee
          </Badge>
          <Badge variant="outline" className="border-purple-400/50 text-purple-400">
            <Heart className="w-3 h-3 mr-1" /> Unlimited Lives
          </Badge>
        </div>
        <Button
          variant="outline"
          onClick={() => onSelectMode('free')}
          className="w-full py-6 text-lg font-bold text-purple-400 border-purple-400/50 bg-transparent hover:bg-purple-400/10"
        >
          PLAY NOW
        </Button>
      </div>
    </div>
  );
};
