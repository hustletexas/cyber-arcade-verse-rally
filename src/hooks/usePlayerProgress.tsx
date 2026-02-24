import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from './useMultiWallet';

interface GameStats {
  name: string;
  gamesPlayed: number;
  bestScore: number;
  gamesThisWeek: number;
}

interface RecentGame {
  game: string;
  score: number;
  playedAt: string;
}

interface PlayerProgressData {
  cccBalance: number;
  totalGamesPlayed: number;
  totalGamesThisWeek: number;
  weeklyBestTotal: number;
  gameStats: GameStats[];
  recentGames: RecentGame[];
  isLoading: boolean;
}

export const usePlayerProgress = (): PlayerProgressData & { refetch: () => void } => {
  const { primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;

  const [data, setData] = useState<PlayerProgressData>({
    cccBalance: 0,
    totalGamesPlayed: 0,
    totalGamesThisWeek: 0,
    weeklyBestTotal: 0,
    gameStats: [],
    recentGames: [],
    isLoading: true,
  });

  const fetchProgress = useCallback(async () => {
    if (!walletAddress) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    setData(prev => ({ ...prev, isLoading: true }));

    try {
      // Calculate week start (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - mondayOffset);
      weekStart.setHours(0, 0, 0, 0);
      const weekStartISO = weekStart.toISOString();

      // Fetch all data in parallel
      const [
        balanceRes,
        matchAllRes,
        matchWeekRes,
        triviaAllRes,
        triviaWeekRes,
        seqAllRes,
        seqWeekRes,
        galaxyAllRes,
        galaxyWeekRes,
        recentMatchRes,
        recentTriviaRes,
        recentSeqRes,
        recentGalaxyRes,
      ] = await Promise.all([
        // CCC Balance
        supabase
          .from('user_balances')
          .select('cctr_balance')
          .eq('wallet_address', walletAddress)
          .maybeSingle(),
        // Match scores - all time
        supabase
          .from('match_scores')
          .select('id, score', { count: 'exact', head: true })
          .eq('user_id', walletAddress),
        // Match scores - this week
        supabase
          .from('match_scores')
          .select('score')
          .eq('user_id', walletAddress)
          .gte('created_at', weekStartISO)
          .order('score', { ascending: false })
          .limit(1),
        // Trivia runs - all time
        supabase
          .from('trivia_runs')
          .select('id, score', { count: 'exact', head: true })
          .eq('user_id', walletAddress)
          .eq('is_active', false),
        // Trivia runs - this week
        supabase
          .from('trivia_runs')
          .select('score')
          .eq('user_id', walletAddress)
          .eq('is_active', false)
          .gte('started_at', weekStartISO)
          .order('score', { ascending: false })
          .limit(1),
        // Sequence scores - all time
        supabase
          .from('sequence_scores')
          .select('id, score', { count: 'exact', head: true })
          .eq('user_id', walletAddress),
        // Sequence scores - this week
        supabase
          .from('sequence_scores')
          .select('score')
          .eq('user_id', walletAddress)
          .gte('created_at', weekStartISO)
          .order('score', { ascending: false })
          .limit(1),
        // Galaxy scores - all time
        supabase
          .from('galaxy_scores')
          .select('id, score', { count: 'exact', head: true })
          .eq('user_id', walletAddress),
        // Galaxy scores - this week
        supabase
          .from('galaxy_scores')
          .select('score')
          .eq('user_id', walletAddress)
          .gte('created_at', weekStartISO)
          .order('score', { ascending: false })
          .limit(1),
        // Recent match games
        supabase
          .from('match_scores')
          .select('score, created_at')
          .eq('user_id', walletAddress)
          .order('created_at', { ascending: false })
          .limit(3),
        // Recent trivia runs
        supabase
          .from('trivia_runs')
          .select('score, started_at')
          .eq('user_id', walletAddress)
          .eq('is_active', false)
          .order('started_at', { ascending: false })
          .limit(3),
        // Recent sequence games
        supabase
          .from('sequence_scores')
          .select('score, created_at')
          .eq('user_id', walletAddress)
          .order('created_at', { ascending: false })
          .limit(3),
        // Recent galaxy games
        supabase
          .from('galaxy_scores')
          .select('score, created_at')
          .eq('user_id', walletAddress)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      const cccBalance = balanceRes.data?.cctr_balance ?? 0;

      const matchCount = matchAllRes.count ?? 0;
      const triviaCount = triviaAllRes.count ?? 0;
      const seqCount = seqAllRes.count ?? 0;
      const galaxyCount = galaxyAllRes.count ?? 0;
      const totalGamesPlayed = matchCount + triviaCount + seqCount + galaxyCount;

      // Weekly counts
      const matchWeekCount = matchWeekRes.data?.length ?? 0;
      const triviaWeekCount = triviaWeekRes.data?.length ?? 0;
      const seqWeekCount = seqWeekRes.data?.length ?? 0;
      const galaxyWeekCount = galaxyWeekRes.data?.length ?? 0;

      const matchWeekBest = matchWeekRes.data?.[0]?.score ?? 0;
      const triviaWeekBest = triviaWeekRes.data?.[0]?.score ?? 0;
      const seqWeekBest = seqWeekRes.data?.[0]?.score ?? 0;
      const galaxyWeekBest = galaxyWeekRes.data?.[0]?.score ?? 0;

      const gameStats: GameStats[] = [
        {
          name: 'Cyber Match',
          gamesPlayed: matchCount,
          bestScore: matchWeekBest,
          gamesThisWeek: matchWeekCount,
        },
        {
          name: 'Cyber Trivia',
          gamesPlayed: triviaCount,
          bestScore: triviaWeekBest,
          gamesThisWeek: triviaWeekCount,
        },
        {
          name: 'Cyber Sequence',
          gamesPlayed: seqCount,
          bestScore: seqWeekBest,
          gamesThisWeek: seqWeekCount,
        },
        {
          name: 'Cyber Galaxy',
          gamesPlayed: galaxyCount,
          bestScore: galaxyWeekBest,
          gamesThisWeek: galaxyWeekCount,
        },
      ];

      // Build recent games list, sorted by date
      const recentGames: RecentGame[] = [];

      recentMatchRes.data?.forEach(r => {
        recentGames.push({
          game: 'Cyber Match',
          score: r.score,
          playedAt: r.created_at,
        });
      });
      recentTriviaRes.data?.forEach(r => {
        recentGames.push({
          game: 'Cyber Trivia',
          score: r.score,
          playedAt: r.started_at,
        });
      });
      recentSeqRes.data?.forEach(r => {
        recentGames.push({
          game: 'Cyber Sequence',
          score: r.score,
          playedAt: r.created_at,
        });
      });
      recentGalaxyRes.data?.forEach(r => {
        recentGames.push({
          game: 'Cyber Galaxy',
          score: r.score,
          playedAt: r.created_at,
        });
      });

      // Sort by most recent
      recentGames.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());

      setData({
        cccBalance,
        totalGamesPlayed,
        totalGamesThisWeek: matchWeekCount + triviaWeekCount + seqWeekCount + galaxyWeekCount,
        weeklyBestTotal: matchWeekBest + triviaWeekBest + seqWeekBest + galaxyWeekBest,
        gameStats,
        recentGames: recentGames.slice(0, 5),
        isLoading: false,
      });
    } catch (err) {
      console.error('[PlayerProgress] Failed to fetch stats:', err);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Subscribe to real-time updates on game score tables
  useEffect(() => {
    if (!walletAddress) return;

    const channel = supabase
      .channel('player-progress-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'match_scores' }, () => fetchProgress())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'trivia_runs' }, () => fetchProgress())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sequence_scores' }, () => fetchProgress())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'galaxy_scores' }, () => fetchProgress())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'user_balances' }, () => fetchProgress())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [walletAddress, fetchProgress]);

  return { ...data, refetch: fetchProgress };
};
