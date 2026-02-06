import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Flame, Zap, Target, Star, Loader2 } from 'lucide-react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';
import { PlayerStats, SCORING } from '@/types/cyber-match';

export const CyberMatchPlayerStats: React.FC = () => {
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;
  
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPlayerStats = useCallback(async () => {
    if (!walletAddress) {
      setStats(null);
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('match_scores')
        .select('score, moves, mismatches')
        .eq('user_id', walletAddress);

      if (data && data.length > 0) {
        const playerStats: PlayerStats = {
          bestScore: Math.max(...data.map((d: any) => d.score)),
          bestStreak: 0,
          totalMatches: data.reduce((sum: number, d: any) => sum + (18 - d.mismatches), 0),
          totalRuns: data.length,
          perfectRuns: data.filter((d: any) => d.mismatches === 0).length,
          ticketsEarned: data.length * SCORING.ticketsPerRun,
        };
        setStats(playerStats);
      } else {
        // New player - set default stats
        setStats({
          bestScore: 0,
          bestStreak: 0,
          totalMatches: 0,
          totalRuns: 0,
          perfectRuns: 0,
          ticketsEarned: 0,
        });
      }
    } catch (err) {
      console.error('Error fetching player stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Auto-fetch on wallet connection
  useEffect(() => {
    fetchPlayerStats();
  }, [fetchPlayerStats]);

  // Subscribe to realtime updates for live stats
  useEffect(() => {
    if (!walletAddress) return;

    const channel = supabase
      .channel('match_scores_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'match_scores',
          filter: `user_id=eq.${walletAddress}`,
        },
        () => {
          fetchPlayerStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletAddress, fetchPlayerStats]);

  const statItems = stats ? [
    { icon: Trophy, label: 'Best Score', value: stats.bestScore.toLocaleString(), color: 'text-yellow-400' },
    { icon: Flame, label: 'Best Streak', value: stats.bestStreak.toString(), color: 'text-orange-400' },
    { icon: Zap, label: 'Total Matches', value: stats.totalMatches.toString(), color: 'text-neon-cyan' },
    { icon: Star, label: 'Perfect Clears', value: stats.perfectRuns.toString(), color: 'text-neon-green' },
  ] : [];

  return (
    <Card className="cyber-glass p-6">
      <h3 className="text-lg font-bold text-neon-cyan mb-4 flex items-center gap-2">
        <Target className="w-5 h-5" /> Your Stats
        {isWalletConnected && (
          <span className="ml-auto text-xs text-neon-green flex items-center gap-1">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
            Live
          </span>
        )}
      </h3>
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
        </div>
      ) : isWalletConnected && stats ? (
        <div className="grid grid-cols-2 gap-3">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="text-center p-3 rounded-lg bg-black/30 hover:bg-black/40 transition-colors"
            >
              <div className={`flex items-center justify-center gap-1.5 text-2xl font-bold ${item.color}`}>
                <item.icon className="w-5 h-5" />
                {item.value}
              </div>
              <div className="text-xs text-gray-500 mt-1">{item.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Connect wallet to track stats</p>
        </div>
      )}
    </Card>
  );
};
