import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Clock, Move, Crown, Flame, Calendar } from 'lucide-react';
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

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/10 to-transparent border-l-2 border-l-yellow-400";
      case 2: return "bg-gradient-to-r from-gray-400/10 to-transparent border-l-2 border-l-gray-400";
      case 3: return "bg-gradient-to-r from-orange-500/10 to-transparent border-l-2 border-l-orange-400";
      default: return "bg-black/20";
    }
  };

  const LeaderboardList = ({ entries }: { entries: LeaderboardEntry[] }) => (
    <div className="space-y-2">
      {entries.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>No scores yet. Be the first!</p>
        </div>
      ) : (
        entries.slice(0, 5).map((entry) => (
          <div
            key={`${entry.rank}-${entry.displayName}`}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg transition-all hover:bg-black/30",
              getRankStyle(entry.rank)
            )}
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                "font-bold text-lg w-6",
                entry.rank === 1 ? "text-yellow-400" : 
                entry.rank === 2 ? "text-gray-300" :
                entry.rank === 3 ? "text-orange-400" : "text-gray-500"
              )}>
                #{entry.rank}
              </span>
              <div>
                <span className="text-sm text-gray-300">
                  {entry.displayName}
                </span>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(entry.time_seconds)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Move className="w-3 h-3" />
                    {entry.moves}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-neon-pink font-bold">{entry.score.toLocaleString()}</span>
              </div>
              {entry.best_streak > 0 && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-4 h-4" />
                  <span className="text-sm font-bold">{entry.best_streak}x</span>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Card className="cyber-glass-pink p-5">
      <h3 className="text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" /> Daily Leaderboard
      </h3>
      
      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-black/30 mb-4">
          <TabsTrigger 
            value="today"
            className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink"
          >
            <Calendar className="w-4 h-4 mr-1" />
            Today
          </TabsTrigger>
          <TabsTrigger 
            value="alltime"
            className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink"
          >
            <Crown className="w-4 h-4 mr-1" />
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
    </Card>
  );
};
