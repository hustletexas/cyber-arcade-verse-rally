import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, Move, Crown, Flame } from 'lucide-react';
import { LeaderboardEntry } from '@/types/cyber-match';
import { cn } from '@/lib/utils';

interface CyberMatchLeaderboardProps {
  todayLeaderboard: LeaderboardEntry[];
  allTimeLeaderboard: LeaderboardEntry[];
}

export const CyberMatchLeaderboard: React.FC<CyberMatchLeaderboardProps> = ({
  todayLeaderboard,
  allTimeLeaderboard,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-300" />;
      case 3: return <Trophy className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-gray-500 font-mono text-sm">{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/20 to-amber-500/10 border-yellow-500/40";
      case 2: return "bg-gradient-to-r from-gray-400/20 to-gray-500/10 border-gray-400/40";
      case 3: return "bg-gradient-to-r from-amber-600/20 to-orange-600/10 border-amber-600/40";
      default: return "bg-black/30 border-gray-700/30";
    }
  };

  const LeaderboardList = ({ entries }: { entries: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No scores yet. Be the first!</p>
        </div>
      ) : (
        entries.map((entry) => (
          <div
            key={`${entry.rank}-${entry.displayName}`}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border transition-all hover:scale-[1.01]",
              getRankStyle(entry.rank)
            )}
          >
            <div className="flex-shrink-0">
              {getRankIcon(entry.rank)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">
                {entry.displayName}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(entry.time_seconds)}
                </span>
                <span className="flex items-center gap-1">
                  <Move className="w-3 h-3" />
                  {entry.moves}
                </span>
                {entry.best_streak > 0 && (
                  <span className="flex items-center gap-1 text-orange-400">
                    <Flame className="w-3 h-3" />
                    {entry.best_streak}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className={cn(
                "font-bold font-mono text-lg",
                entry.rank === 1 ? "text-yellow-400" : 
                entry.rank === 2 ? "text-gray-300" :
                entry.rank === 3 ? "text-amber-500" : "text-neon-cyan"
              )}>
                {entry.score.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">points</div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card className="mt-6 bg-black/40 backdrop-blur-md border-neon-cyan/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-neon-cyan">
          <Trophy className="w-5 h-5" />
          Daily Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/50 mb-4">
            <TabsTrigger 
              value="today"
              className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
            >
              Today
            </TabsTrigger>
            <TabsTrigger 
              value="alltime"
              className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink"
            >
              All Time
            </TabsTrigger>
          </TabsList>
          <TabsContent value="today">
            <LeaderboardList entries={todayLeaderboard} />
          </TabsContent>
          <TabsContent value="alltime">
            <LeaderboardList entries={allTimeLeaderboard} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
