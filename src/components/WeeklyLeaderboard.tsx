import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Crown, Flame, Gamepad2, Brain, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { cn } from '@/lib/utils';

interface WeeklyEntry {
  wallet_address: string;
  match_best_score: number;
  trivia_best_score: number;
  sequence_best_score: number;
  total_score: number;
  rank: number;
}

export const WeeklyLeaderboard: React.FC = () => {
  const { primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_combined_weekly_leaderboard');
      if (error) {
        console.error('Weekly leaderboard error:', error);
        return;
      }
      setEntries((data as WeeklyEntry[]) || []);
    } catch (err) {
      console.error('Failed to fetch weekly leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    // Refresh every 60 seconds
    const interval = setInterval(fetchLeaderboard, 60000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/15 to-transparent border-l-2 border-l-yellow-400";
      case 2: return "bg-gradient-to-r from-gray-400/10 to-transparent border-l-2 border-l-gray-400";
      case 3: return "bg-gradient-to-r from-orange-500/10 to-transparent border-l-2 border-l-orange-400";
      default: return "bg-black/20";
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const maskWallet = (addr: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Anon';

  return (
    <Card className="arcade-frame">
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-neon-cyan flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            Weekly Leaderboard
          </h2>
          <span className="text-xs text-neon-green flex items-center gap-1">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            Live
          </span>
        </div>

        <p className="text-sm text-gray-400">
          Top 3 players win <span className="text-neon-cyan font-bold">50 CCC</span> + 
          <span className="text-purple-400 font-bold"> Cyber Chest</span> + 
          <span className="text-yellow-400 font-bold"> Raffle Ticket</span> every Monday
        </p>

        {/* Column Headers */}
        <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase px-3 pt-2">
          <span className="col-span-1">#</span>
          <span className="col-span-3">Player</span>
          <span className="col-span-2 text-center flex items-center justify-center gap-1">
            <Gamepad2 className="w-3 h-3" /> Match
          </span>
          <span className="col-span-2 text-center flex items-center justify-center gap-1">
            <Zap className="w-3 h-3" /> Seq
          </span>
          <span className="col-span-2 text-center flex items-center justify-center gap-1">
            <Brain className="w-3 h-3" /> Trivia
          </span>
          <span className="col-span-2 text-right">Total</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No scores this week yet. Play to claim the top spot!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.slice(0, 10).map((entry) => {
              const isYou = walletAddress && entry.wallet_address === walletAddress;
              return (
                <div
                  key={entry.wallet_address}
                  className={cn(
                    "grid grid-cols-12 gap-2 items-center p-3 rounded-lg transition-all",
                    getRankStyle(entry.rank),
                    isYou && "ring-1 ring-neon-cyan/50"
                  )}
                >
                  <span className={cn(
                    "col-span-1 font-bold text-lg",
                    entry.rank === 1 ? "text-yellow-400" :
                    entry.rank === 2 ? "text-gray-300" :
                    entry.rank === 3 ? "text-orange-400" : "text-gray-500"
                  )}>
                    {getRankIcon(entry.rank)}
                  </span>
                  <span className="col-span-3 text-sm text-gray-300 truncate">
                    {maskWallet(entry.wallet_address)}
                    {isYou && <span className="ml-1 text-neon-cyan text-xs">(You)</span>}
                  </span>
                  <span className="col-span-2 text-center text-sm text-neon-pink font-medium">
                    {entry.match_best_score > 0 ? entry.match_best_score.toLocaleString() : '-'}
                  </span>
                  <span className="col-span-2 text-center text-sm text-purple-400 font-medium">
                    {entry.sequence_best_score > 0 ? entry.sequence_best_score.toLocaleString() : '-'}
                  </span>
                  <span className="col-span-2 text-center text-sm text-neon-cyan font-medium">
                    {entry.trivia_best_score > 0 ? entry.trivia_best_score.toLocaleString() : '-'}
                  </span>
                  <span className="col-span-2 text-right text-sm text-white font-bold">
                    {entry.total_score.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Reward Tiers */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-neon-cyan/10">
          {[
            { place: '1st', emoji: '🥇', reward: '50 CCC + Chest + Ticket' },
            { place: '2nd', emoji: '🥈', reward: '50 CCC + Chest + Ticket' },
            { place: '3rd', emoji: '🥉', reward: '50 CCC + Chest + Ticket' },
          ].map((tier) => (
            <div key={tier.place} className="text-center p-2 rounded-lg bg-black/20">
              <div className="text-xl">{tier.emoji}</div>
              <div className="text-xs text-gray-400 mt-1">{tier.reward}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
