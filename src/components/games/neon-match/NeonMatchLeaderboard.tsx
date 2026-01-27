import React, { useState } from 'react';
import { LeaderboardEntry } from '@/types/neon-match';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, Move, Medal } from 'lucide-react';

interface NeonMatchLeaderboardProps {
  todayLeaderboard: LeaderboardEntry[];
  allTimeLeaderboard: LeaderboardEntry[];
}

export const NeonMatchLeaderboard: React.FC<NeonMatchLeaderboardProps> = ({
  todayLeaderboard,
  allTimeLeaderboard,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="w-5 h-5 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 text-center font-mono text-cyan-400">{rank}</span>;
  };

  const renderLeaderboard = (entries: LeaderboardEntry[]) => {
    if (entries.length === 0) {
      return (
        <div className="text-center py-8 text-cyan-400/60">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No scores yet. Be the first!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 px-3 py-2 text-xs text-cyan-400/70 border-b border-cyan-500/20">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-3 text-right">Score</div>
          <div className="col-span-2 text-right">Time</div>
          <div className="col-span-2 text-right">Moves</div>
        </div>

        {/* Entries */}
        {entries.map((entry, index) => (
          <div
            key={index}
            className={`grid grid-cols-12 gap-2 px-3 py-2 rounded-lg transition-all ${
              entry.rank <= 3
                ? 'bg-gradient-to-r from-cyan-500/10 to-pink-500/10 border border-cyan-500/20'
                : 'bg-black/20 hover:bg-black/40'
            }`}
          >
            <div className="col-span-1 flex items-center">
              {getRankIcon(entry.rank)}
            </div>
            <div className="col-span-4 flex items-center font-medium text-white truncate">
              {entry.displayName}
            </div>
            <div className="col-span-3 flex items-center justify-end font-mono font-bold text-green-400">
              {entry.score.toLocaleString()}
            </div>
            <div className="col-span-2 flex items-center justify-end gap-1 text-cyan-400 text-sm">
              <Clock className="w-3 h-3" />
              {formatTime(entry.time_seconds)}
            </div>
            <div className="col-span-2 flex items-center justify-end gap-1 text-pink-400 text-sm">
              <Move className="w-3 h-3" />
              {entry.moves}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mt-8 p-4 sm:p-6 rounded-2xl bg-black/40 backdrop-blur-sm border border-cyan-500/30">
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
        🏆 Leaderboard
      </h2>

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-black/40 border border-cyan-500/20">
          <TabsTrigger 
            value="today"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-cyan-400"
          >
            Today
          </TabsTrigger>
          <TabsTrigger 
            value="alltime"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-cyan-400"
          >
            All Time
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="today" className="mt-0">
          {renderLeaderboard(todayLeaderboard)}
        </TabsContent>
        
        <TabsContent value="alltime" className="mt-0">
          {renderLeaderboard(allTimeLeaderboard)}
        </TabsContent>
      </Tabs>
    </div>
  );
};
