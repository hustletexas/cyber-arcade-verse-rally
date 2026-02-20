import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { Skeleton } from '@/components/ui/skeleton';

interface TournamentStatsData {
  totalMatches: number;
  tournamentsWon: number;
  winRate: number;
  totalUSDCWon: number;
  seasonPassTier: string;
  currentStreak: number;
  rankingPosition: number | null;
  totalTournaments: number;
}

const tierConfig: Record<string, { emoji: string; color: string; bgColor: string }> = {
  legendary: { emoji: '👑', color: 'text-yellow-400', bgColor: 'bg-yellow-400/20' },
  epic: { emoji: '💎', color: 'text-neon-purple', bgColor: 'bg-neon-purple/20' },
  rare: { emoji: '⚡', color: 'text-neon-cyan', bgColor: 'bg-neon-cyan/20' },
  common: { emoji: '🎫', color: 'text-neon-green', bgColor: 'bg-neon-green/20' },
  guest: { emoji: '👤', color: 'text-muted-foreground', bgColor: 'bg-muted/20' },
};

export const TournamentStats = () => {
  const { primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;
  const [stats, setStats] = useState<TournamentStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    if (!walletAddress) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Fetch tournament data in parallel
      const [
        matchesRes,
        standingsRes,
        payoutsRes,
        weeklyRes,
      ] = await Promise.all([
        // Total tournament matches played by this user
        supabase
          .from('tournament_matches')
          .select('id, winner_id', { count: 'exact', head: false })
          .or(`player_a_wallet.eq.${walletAddress},player_b_wallet.eq.${walletAddress}`),
        // Tournament standings (placements)
        supabase
          .from('tournament_standings')
          .select('placement, wins, losses, prize_amount_usd, prize_amount_usdc')
          .eq('wallet_address', walletAddress),
        // Tournament payouts
        supabase
          .from('tournament_payouts')
          .select('amount_usd, amount_usdc, status')
          .eq('wallet_address', walletAddress)
          .eq('status', 'paid'),
        // Weekly reward distributions for ranking
        supabase
          .from('weekly_reward_distributions')
          .select('placement, total_score')
          .eq('wallet_address', walletAddress)
          .order('week_start', { ascending: false })
          .limit(1),
      ]);

      const totalMatches = matchesRes.count ?? matchesRes.data?.length ?? 0;

      // Count wins from matches where this wallet won
      const matchWins = matchesRes.data?.filter(m => m.winner_id && m.winner_id === walletAddress).length ?? 0;

      // Tournaments won (placement === 1)
      const tournamentsWon = standingsRes.data?.filter(s => s.placement === 1).length ?? 0;
      const totalTournaments = standingsRes.data?.length ?? 0;

      // Win rate from match data
      const winRate = totalMatches > 0 ? Math.round((matchWins / totalMatches) * 100) : 0;

      // Total USDC won from paid payouts
      const totalUSDCWon = payoutsRes.data?.reduce((sum, p) => sum + (p.amount_usdc ?? p.amount_usd ?? 0), 0) ?? 0;

      // Current streak from standings wins
      let currentStreak = 0;
      if (standingsRes.data && standingsRes.data.length > 0) {
        const totalWins = standingsRes.data.reduce((sum, s) => sum + (s.wins ?? 0), 0);
        const totalLosses = standingsRes.data.reduce((sum, s) => sum + (s.losses ?? 0), 0);
        // Simple streak: consecutive wins from recent standings
        currentStreak = totalWins > totalLosses ? totalWins - totalLosses : 0;
      }

      // Ranking from latest weekly distribution
      const rankingPosition = weeklyRes.data?.[0]?.placement ?? null;

      // Season pass tier detection (from NFT purchases or default)
      let seasonPassTier = 'guest';
      const { data: nftData } = await supabase
        .from('nft_purchases')
        .select('nft_name')
        .eq('wallet_address', walletAddress)
        .eq('status', 'completed')
        .ilike('nft_name', '%pass%')
        .order('created_at', { ascending: false })
        .limit(1);

      if (nftData && nftData.length > 0) {
        const passName = nftData[0].nft_name.toLowerCase();
        if (passName.includes('legendary')) seasonPassTier = 'legendary';
        else if (passName.includes('epic')) seasonPassTier = 'epic';
        else if (passName.includes('rare')) seasonPassTier = 'rare';
        else seasonPassTier = 'common';
      }

      setStats({
        totalMatches,
        tournamentsWon,
        winRate,
        totalUSDCWon,
        seasonPassTier,
        currentStreak,
        rankingPosition,
        totalTournaments,
      });
    } catch (err) {
      console.error('[TournamentStats] Failed to fetch:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return (
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">🏆 TOURNAMENT STATS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="text-center p-3">
                <Skeleton className="h-6 w-6 mx-auto mb-2 rounded-full" />
                <Skeleton className="h-7 w-16 mx-auto mb-1" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const tier = tierConfig[stats.seasonPassTier] || tierConfig.guest;

  const statItems = [
    {
      emoji: '🎮',
      value: stats.totalMatches.toLocaleString(),
      label: 'Total Matches',
      color: 'text-neon-cyan',
    },
    {
      emoji: '🏆',
      value: stats.tournamentsWon.toLocaleString(),
      label: 'Tournaments Won',
      color: 'text-yellow-400',
    },
    {
      emoji: '💎',
      value: `${stats.winRate}%`,
      label: 'Win Rate',
      color: stats.winRate >= 60 ? 'text-neon-green' : stats.winRate >= 40 ? 'text-neon-cyan' : 'text-neon-pink',
    },
    {
      emoji: '💰',
      value: `$${stats.totalUSDCWon.toFixed(2)}`,
      label: 'Total USDC Won',
      color: 'text-neon-green',
    },
    {
      emoji: tier.emoji,
      value: stats.seasonPassTier.charAt(0).toUpperCase() + stats.seasonPassTier.slice(1),
      label: 'Season Pass',
      color: tier.color,
    },
    {
      emoji: '🔥',
      value: stats.currentStreak.toLocaleString(),
      label: 'Current Streak',
      color: stats.currentStreak >= 5 ? 'text-neon-pink' : 'text-neon-purple',
    },
    {
      emoji: '📊',
      value: stats.rankingPosition ? `#${stats.rankingPosition}` : '—',
      label: 'Ranking',
      color: 'text-neon-purple',
    },
    {
      emoji: '🎯',
      value: stats.totalTournaments.toLocaleString(),
      label: 'Tourneys Entered',
      color: 'text-neon-pink',
    },
  ];

  return (
    <Card className="arcade-frame relative overflow-hidden">
      {/* Subtle animated glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 via-transparent to-neon-purple/5 pointer-events-none" />

      <CardHeader>
        <CardTitle className="font-display text-xl text-neon-cyan flex items-center gap-3">
          🏆 TOURNAMENT STATS
          {stats.currentStreak >= 3 && (
            <Badge className="bg-neon-pink/20 text-neon-pink border border-neon-pink/30 animate-pulse">
              🔥 {stats.currentStreak} STREAK
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((item) => (
            <div
              key={item.label}
              className="text-center p-4 rounded-lg bg-black/30 border border-white/5 hover:border-neon-cyan/30 transition-all duration-300 hover:bg-black/40 group"
            >
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{item.emoji}</div>
              <div className={`text-xl font-black ${item.color}`}>{item.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Win Rate Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground font-display">WIN RATE</span>
            <span className="text-sm font-bold text-neon-green">{stats.winRate}%</span>
          </div>
          <Progress value={stats.winRate} className="h-2" />
        </div>

        {/* Season Pass Badge */}
        <div className="mt-4 flex items-center justify-center">
          <Badge className={`${tier.bgColor} ${tier.color} border border-current/20 px-4 py-2 text-sm font-display tracking-wider`}>
            {tier.emoji} {stats.seasonPassTier.toUpperCase()} PASS HOLDER
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
