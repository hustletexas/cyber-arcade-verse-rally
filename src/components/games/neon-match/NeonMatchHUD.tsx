import React from 'react';
import { Clock, Move, Trophy } from 'lucide-react';

interface NeonMatchHUDProps {
  timeSeconds: number;
  moves: number;
  matchedPairs: number;
  totalPairs: number;
}

export const NeonMatchHUD: React.FC<NeonMatchHUDProps> = ({
  timeSeconds,
  moves,
  matchedPairs,
  totalPairs,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-black/40 backdrop-blur-sm border border-cyan-500/30">
      {/* Timer */}
      <div className="flex items-center gap-2 text-cyan-400">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-mono text-lg sm:text-xl font-bold tracking-wider">
          {formatTime(timeSeconds)}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />

      {/* Moves */}
      <div className="flex items-center gap-2 text-pink-400">
        <Move className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-mono text-lg sm:text-xl font-bold">
          {moves}
        </span>
        <span className="text-xs text-pink-400/70 hidden sm:inline">moves</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gradient-to-b from-transparent via-pink-500/50 to-transparent" />

      {/* Matched Pairs */}
      <div className="flex items-center gap-2 text-green-400">
        <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="font-mono text-lg sm:text-xl font-bold">
          {matchedPairs}/{totalPairs}
        </span>
        <span className="text-xs text-green-400/70 hidden sm:inline">pairs</span>
      </div>
    </div>
  );
};
