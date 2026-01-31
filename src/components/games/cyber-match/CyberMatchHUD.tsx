import React from 'react';
import { Clock, Move, Trophy, Flame, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GameMode } from '@/types/cyber-match';

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
    <div className="space-y-3 mb-4 sm:mb-6">
      {/* Main Stats Bar */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 p-3 sm:p-4 rounded-xl bg-black/50 backdrop-blur-md border border-neon-cyan/30">
        {/* Timer */}
        <div className="flex items-center gap-2 text-neon-cyan">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-mono text-lg sm:text-xl font-bold tracking-wider">
            {formatTime(timeSeconds)}
          </span>
        </div>

        <div className="w-px h-6 bg-gradient-to-b from-transparent via-neon-cyan/50 to-transparent" />

        {/* Score */}
        <div className="flex items-center gap-2 text-yellow-400">
          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-mono text-lg sm:text-xl font-bold">
            {totalScore.toLocaleString()}
          </span>
        </div>

        <div className="w-px h-6 bg-gradient-to-b from-transparent via-yellow-500/50 to-transparent" />

        {/* Matched Pairs */}
        <div className="flex items-center gap-2 text-neon-green">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-mono text-lg sm:text-xl font-bold">
            {matchedPairs}/{totalPairs}
          </span>
        </div>

        {/* Mistakes (Daily mode only) */}
        {gameMode === 'daily' && mistakesRemaining !== null && (
          <>
            <div className="w-px h-6 bg-gradient-to-b from-transparent via-red-500/50 to-transparent" />
            <div className="flex items-center gap-2 text-red-400">
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-mono text-lg sm:text-xl font-bold">
                {mistakesRemaining}
              </span>
              <span className="text-xs text-red-400/70 hidden sm:inline">left</span>
            </div>
          </>
        )}
      </div>

      {/* Streak & Combo Bar */}
      <div className={cn(
        "flex items-center justify-center gap-4 sm:gap-6 p-2 sm:p-3 rounded-lg transition-all duration-300",
        streak > 0 
          ? "bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 border border-orange-500/40" 
          : "bg-black/30 border border-gray-700/30"
      )}>
        {/* Streak Meter with Flame */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "relative transition-all duration-300",
            streak > 0 && "animate-pulse"
          )}>
            <Flame className={cn(
              "w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300",
              streak === 0 && "text-gray-500",
              streak === 1 && "text-orange-400",
              streak === 2 && "text-orange-500",
              streak >= 3 && "text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]"
            )} />
            {streak >= 3 && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-ping" />
            )}
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "font-bold text-sm sm:text-base transition-colors",
              streak === 0 && "text-gray-500",
              streak >= 1 && "text-orange-400",
              streak >= 3 && "text-red-400"
            )}>
              {streak}x STREAK
            </span>
            <span className="text-xs text-gray-500">
              Best: {streak}
            </span>
          </div>
        </div>

        <div className="w-px h-8 bg-gradient-to-b from-transparent via-orange-500/30 to-transparent" />

        {/* Combo Multiplier */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-300",
          comboPulse && "animate-pulse scale-110",
          comboMultiplier > 1 
            ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/50" 
            : "bg-gray-800/50"
        )}>
          <span className={cn(
            "font-mono font-bold text-lg sm:text-xl",
            comboMultiplier === 1 && "text-gray-400",
            comboMultiplier > 1 && comboMultiplier < 2 && "text-purple-400",
            comboMultiplier >= 2 && comboMultiplier < 3 && "text-pink-400",
            comboMultiplier >= 3 && "text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]"
          )}>
            {comboMultiplier.toFixed(2)}x
          </span>
          <span className="text-xs text-gray-400 hidden sm:inline">COMBO</span>
        </div>

        {/* Moves counter (minimal) */}
        <div className="flex items-center gap-1 text-gray-400">
          <Move className="w-4 h-4" />
          <span className="font-mono text-sm">{moves}</span>
        </div>
      </div>
    </div>
  );
};
