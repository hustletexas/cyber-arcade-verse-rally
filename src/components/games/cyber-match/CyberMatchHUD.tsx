import React from 'react';
import { Clock, Move, Trophy, Flame, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameMode } from '@/types/cyber-match';
import { Card } from '@/components/ui/card';

interface CyberMatchHUDProps {
  timeSeconds: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
  streak: number;
  comboMultiplier: number;
  mistakesRemaining: number | null;
  mismatches: number;
  totalScore: number;
  gameMode: GameMode | null;
  comboPulse?: boolean;
}

export const CyberMatchHUD: React.FC<CyberMatchHUDProps> = ({
  timeSeconds,
  moves,
  matchedPairs,
  totalPairs,
  streak,
  comboMultiplier,
  mistakesRemaining,
  mismatches,
  totalScore,
  gameMode,
  comboPulse = false,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Main Stats Bar */}
      <Card className="cyber-glass p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Timer */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-neon-cyan/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <span className="font-mono text-xl font-bold text-neon-cyan tracking-wider">
                {formatTime(timeSeconds)}
              </span>
              <div className="text-xs text-gray-500">Time</div>
            </div>
          </div>

          {/* Streak Meter - moved next to Time */}
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-300",
              streak === 0 && "bg-gray-500/10",
              streak >= 1 && streak < 3 && "bg-orange-500/10",
              streak >= 3 && "bg-red-500/10"
            )}>
              <Flame className={cn(
                "w-5 h-5 transition-all duration-300",
                streak === 0 && "text-gray-500",
                streak === 1 && "text-orange-400",
                streak === 2 && "text-orange-500",
                streak >= 3 && "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
              )} />
              {streak >= 3 && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <span className={cn(
                "font-mono text-xl font-bold transition-colors",
                streak === 0 && "text-gray-500",
                streak >= 1 && streak < 3 && "text-orange-400",
                streak >= 3 && "text-red-400"
              )}>
                {streak}x
              </span>
              <div className="text-xs text-gray-500">Streak</div>
            </div>
          </div>

          {/* Score */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <span className={cn(
                "font-mono text-xl font-bold text-yellow-400",
                comboPulse && "combo-glow"
              )}>
                {totalScore.toLocaleString()}
              </span>
              <div className="text-xs text-gray-500">Score</div>
            </div>
          </div>

          {/* Matched Pairs */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-neon-green/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <span className="font-mono text-xl font-bold text-neon-green">
                {matchedPairs}/{totalPairs}
              </span>
              <div className="text-xs text-gray-500">Matched</div>
            </div>
          </div>

          {/* Mistakes (Daily mode only) */}
          {gameMode === 'daily' && mistakesRemaining !== null && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <X className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <span className="font-mono text-xl font-bold text-red-400">
                  {mistakesRemaining}
                </span>
                <div className="text-xs text-gray-500">Lives</div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Combo & Moves Bar */}
      <Card className={cn(
        "p-3 transition-all duration-300",
        comboMultiplier > 1 
          ? "cyber-glass-pink" 
          : "cyber-glass"
      )}>
        <div className="flex items-center justify-center gap-6">
          {/* Combo Multiplier */}
          <div className={cn(
            "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300",
            comboMultiplier > 1 
              ? "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/50" 
              : "bg-black/30"
          )}>
            <div>
              <span className={cn(
                "font-mono font-bold text-2xl",
                comboMultiplier === 1 && "text-gray-400",
                comboMultiplier > 1 && comboMultiplier < 2 && "text-purple-400",
                comboMultiplier >= 2 && comboMultiplier < 3 && "text-pink-400",
                comboMultiplier >= 3 && "text-yellow-400 combo-glow"
              )}>
                {comboMultiplier.toFixed(2)}x
              </span>
              <div className="text-xs text-gray-500">Combo</div>
            </div>
          </div>

          <div className="w-px h-10 bg-gradient-to-b from-transparent via-gray-600 to-transparent" />

          {/* Moves counter */}
          <div className="flex items-center gap-2">
            <Move className="w-5 h-5 text-gray-400" />
            <div>
              <span className="font-mono text-lg text-gray-300">{moves}</span>
              <div className="text-xs text-gray-500">Moves</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
