import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Flame, Calendar, Crown, Loader2 } from 'lucide-react';
import { LeaderboardEntry } from '@/types/cyber-sequence';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const CyberSequenceLeaderboard: React.FC = () => {
  const { primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;

  const [todayLeaderboard, setTodayLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatEntries = (data: any[]): LeaderboardEntry[] => {
    return (data || []).map((entry, index) => ({
      rank: index + 1,
      displayName: entry.user_id
        ? `${entry.user_id.slice(0, 6)}...${entry.user_id.slice(-4)}`
        : 'Anon',
      score: entry.score,
      max_sequence: entry.level || 0,
      best_streak: entry.best_streak || 0,
    }));
  };

  const fetchLeaderboards = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const [todayResult, allTimeResult] = await Promise.all([
        supabase
          .from('sequence_scores')
          .select('user_id, score, level, best_streak, created_at')
          .gte('created_at', todayStr)
          .order('score', { ascending: false })
          .limit(20),
        supabase
          .from('sequence_scores')
          .select('user_id, score, level, best_streak, created_at')
          .order('score', { ascending: false })
          .limit(20),
      ]);

      setTodayLeaderboard(formatEntries(todayResult.data || []));
      setAllTimeLeaderboard(formatEntries(allTimeResult.data || []));
    } catch (err) {
      console.error('Error fetching sequence leaderboards:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboards();
  }, [fetchLeaderboards]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('sequence_scores_leaderboard')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sequence_scores' },
        () => fetchLeaderboards()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [fetchLeaderboards]);

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
        entries.slice(0, 5).map((entry) => {
          const isYou = walletAddress && entry.displayName.includes(walletAddress.slice(0, 6));
          return (
            <div
              key={`${entry.rank}-${entry.displayName}`}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all hover:bg-black/30",
                getRankStyle(entry.rank),
                isYou && "ring-1 ring-neon-cyan/50"
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
                    {isYou && <span className="ml-2 text-neon-cyan">(You)</span>}
                  </span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Lvl {entry.max_sequence}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {entry.best_streak}x
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-neon-cyan font-bold">{entry.score.toLocaleString()}</span>
            </div>
          );
        })
      )}
    </div>
  );

  return (
    <Card className="cyber-glass p-5">
      <h3 className="text-lg font-bold text-neon-cyan mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" /> Leaderboard
        <span className="ml-auto text-xs text-neon-green flex items-center gap-1">
          <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
          Live
        </span>
      </h3>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
        </div>
      ) : (
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/30 mb-4">
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
            >
              <Calendar className="w-4 h-4 mr-1" />
              Today
            </TabsTrigger>
            <TabsTrigger
              value="alltime"
              className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan"
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
      )}
    </Card>
  );
};
