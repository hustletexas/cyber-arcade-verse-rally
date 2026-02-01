import React from 'react';
import { LeaderboardEntry } from '@/types/cyber-sequence';
import { Trophy, Target, Flame } from 'lucide-react';

interface CyberSequenceLeaderboardProps {
  entries: LeaderboardEntry[];
  currentPlayerRank?: number;
  isLoading?: boolean;
}

export const CyberSequenceLeaderboard: React.FC<CyberSequenceLeaderboardProps> = ({
  entries,
  currentPlayerRank,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="sequence-glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Daily Leaderboard
        </h3>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="sequence-glass-panel p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Daily Leaderboard
        </h3>
        <p className="text-gray-400 text-center py-4">
          No scores yet today. Be the first!
        </p>
      </div>
    );
  }

  return (
    <div className="sequence-glass-panel p-6">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        Daily Leaderboard
      </h3>
      
      {/* Header */}
      <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase mb-2 px-3">
        <span className="col-span-1">#</span>
        <span className="col-span-5">Player</span>
        <span className="col-span-2 text-right">Score</span>
        <span className="col-span-2 text-right">Seq</span>
        <span className="col-span-2 text-right">Streak</span>
      </div>

      <div className="sequence-leaderboard">
        {entries.map((entry, idx) => {
          const isCurrentPlayer = currentPlayerRank === entry.rank;
          
          return (
            <div
              key={entry.rank}
              className={`sequence-leaderboard-entry ${isCurrentPlayer ? 'ring-2 ring-cyan-400' : ''}`}
            >
              <div className="grid grid-cols-12 gap-2 items-center w-full">
                <span className={`col-span-1 font-bold ${
                  idx === 0 ? 'text-yellow-400' :
                  idx === 1 ? 'text-gray-300' :
                  idx === 2 ? 'text-orange-400' :
                  'text-gray-500'
                }`}>
                  {entry.rank}
                </span>
                
                <span className="col-span-5 text-sm text-gray-300 truncate">
                  {entry.displayName}
                  {isCurrentPlayer && <span className="ml-2 text-cyan-400">(You)</span>}
                </span>
                
                <span className="col-span-2 text-right text-sm text-white font-medium">
                  {entry.score.toLocaleString()}
                </span>
                
                <span className="col-span-2 text-right text-sm text-purple-400 flex items-center justify-end gap-1">
                  <Target className="w-3 h-3" />
                  {entry.max_sequence}
                </span>
                
                <span className="col-span-2 text-right text-sm text-orange-400 flex items-center justify-end gap-1">
                  <Flame className="w-3 h-3" />
                  {entry.best_streak}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
