import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Trophy, Crown } from 'lucide-react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface WeeklyEntry {
  wallet_address: string;
  match_best_score: number;
  trivia_best_score: number;
  sequence_best_score: number;
  total_score: number;
  rank: number;
}

interface GameLeaderboardEntry {
  user_id: string;
  score: number;
  rank: number;
}

type GameFilter = 'all' | 'match' | 'trivia' | 'sequence' | 'breaker' | 'galaxy';

const gameFilterConfig: Record<GameFilter, { label: string; emoji: string; activeClass: string; scoreClass: string }> = {
  all: { label: 'All Games', emoji: '🏆', activeClass: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50', scoreClass: 'text-neon-cyan' },
  match: { label: 'Cyber Match', emoji: '🃏', activeClass: 'bg-neon-pink/20 text-neon-pink border-neon-pink/50', scoreClass: 'text-neon-pink' },
  trivia: { label: 'Trivia', emoji: '🧠', activeClass: 'bg-purple-500/20 text-purple-400 border-purple-500/50', scoreClass: 'text-purple-400' },
  sequence: { label: 'Sequence', emoji: '🔢', activeClass: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50', scoreClass: 'text-neon-cyan' },
  breaker: { label: 'Cyber Breaker', emoji: '💥', activeClass: 'bg-neon-pink/20 text-neon-pink border-neon-pink/50', scoreClass: 'text-neon-pink' },
  galaxy: { label: 'Cyber Galaxy', emoji: '🌌', activeClass: 'bg-neon-green/20 text-neon-green border-neon-green/50', scoreClass: 'text-neon-green' },
};

export const RankingsSection = () => {
  const { primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;
  const { refetch: refetchProgress } = usePlayerProgress();

  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [gameFilter, setGameFilter] = useState<GameFilter>('all');
  const [gameEntries, setGameEntries] = useState<GameLeaderboardEntry[]>([]);
  const [gameLbLoading, setGameLbLoading] = useState(false);
  const [lbLoading, setLbLoading] = useState(true);

  const maskWallet = (addr: string) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : 'Anon';
  const getRankIcon = (rank: number) => { if (rank === 1) return '🥇'; if (rank === 2) return '🥈'; if (rank === 3) return '🥉'; return `#${rank}`; };
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return "bg-gradient-to-r from-yellow-500/15 to-transparent border-l-2 border-l-yellow-400";
      case 2: return "bg-gradient-to-r from-gray-400/10 to-transparent border-l-2 border-l-gray-400";
      case 3: return "bg-gradient-to-r from-orange-500/10 to-transparent border-l-2 border-l-orange-400";
      default: return "bg-black/20";
    }
  };

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_combined_weekly_leaderboard');
      if (error) { console.error('Weekly leaderboard error:', error); return; }
      setEntries((data as WeeklyEntry[]) || []);
    } catch (err) { console.error('Failed to fetch weekly leaderboard:', err); }
    finally { setLbLoading(false); }
  }, []);

  const fetchGameLeaderboard = useCallback(async (game: GameFilter) => {
    if (game === 'all') return;
    setGameLbLoading(true);
    try {
      let data: any[] = [];
      if (game === 'match') {
        const res = await supabase.from('match_scores').select('user_id, score').order('score', { ascending: false }).limit(20);
        data = res.data || [];
      } else if (game === 'trivia') {
        const res = await supabase.from('trivia_runs').select('user_id, score').eq('is_active', false).order('score', { ascending: false }).limit(20);
        data = res.data || [];
      } else if (game === 'sequence') {
        const res = await supabase.from('sequence_scores').select('user_id, score').order('score', { ascending: false }).limit(20);
        data = res.data || [];
      } else if (game === 'breaker') {
        const res = await supabase.from('portal_breaker_scores').select('user_id, score').order('score', { ascending: false }).limit(20);
        data = res.data || [];
      } else if (game === 'galaxy') {
        const res = await supabase.from('galaxy_scores').select('user_id, score').order('score', { ascending: false }).limit(20);
        data = res.data || [];
      }
      setGameEntries(data.map((e: any, i: number) => ({ user_id: e.user_id, score: e.score, rank: i + 1 })));
    } catch (err) { console.error('Game leaderboard error:', err); }
    finally { setGameLbLoading(false); }
  }, []);

  useEffect(() => { if (gameFilter !== 'all') fetchGameLeaderboard(gameFilter); }, [gameFilter, fetchGameLeaderboard]);
  useEffect(() => { fetchLeaderboard(); const iv = setInterval(fetchLeaderboard, 60000); return () => clearInterval(iv); }, [fetchLeaderboard]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-neon-cyan to-neon-pink mb-2">
          RANKINGS
        </h2>
        <p className="text-neon-green text-sm font-mono">
          Compete across all games • Weekly & All-Time
        </p>
      </div>

      <Card
        className="relative bg-black/30 backdrop-blur-md border-2 border-neon-cyan/40"
        style={{ boxShadow: '0 0 20px #00ffcc20, 0 0 40px #ff00ff15, inset 0 0 20px #00ffcc05' }}
      >
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Header Row */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-neon-cyan to-neon-pink flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Leaderboard
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => { fetchLeaderboard(); refetchProgress(); }}
                  className="text-muted-foreground hover:text-neon-cyan h-7 w-7 p-0"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
                <span className="text-xs text-neon-green flex items-center gap-1">
                  <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" /> Live
                </span>
              </div>
            </div>

            {/* Game Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 justify-center">
              {(Object.keys(gameFilterConfig) as GameFilter[]).map((key) => {
                const cfg = gameFilterConfig[key];
                const isActive = gameFilter === key;
                return (
                  <button
                    key={key}
                    onClick={() => setGameFilter(key)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border",
                      isActive
                        ? `${cfg.activeClass} shadow-[0_0_10px_rgba(0,255,204,0.15)]`
                        : "bg-black/20 text-gray-500 border-transparent hover:text-gray-300 hover:border-gray-600"
                    )}
                  >
                    {cfg.emoji} {cfg.label}
                  </button>
                );
              })}
            </div>

            {/* Combined Leaderboard (All Games) */}
            {gameFilter === 'all' && (
              <>
                {lbLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-neon-cyan" />
                  </div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No scores this week yet. Play to claim the top spot!</p>
                  </div>
                ) : (
                  <>
                    {/* TOP 3 PODIUM */}
                    <div className="flex items-end justify-center gap-2 sm:gap-3 py-4">
                      {entries.length >= 2 && (
                        <div className="flex flex-col items-center w-[30%] max-w-[120px]">
                          <div className="relative">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-gray-400 bg-gradient-to-br from-gray-600/30 to-gray-800/50 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(156,163,175,0.3)]">
                              <span className="text-2xl sm:text-3xl">🥈</span>
                            </div>
                            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-black shadow-lg">2</div>
                          </div>
                          <span className="text-[10px] sm:text-xs text-gray-300 mt-2 truncate w-full text-center font-medium">{maskWallet(entries[1].wallet_address)}</span>
                          <span className="text-sm sm:text-base font-black text-white">{entries[1].total_score.toLocaleString()}</span>
                          <span className="text-[9px] text-gray-500">pts</span>
                        </div>
                      )}
                      {entries.length >= 1 && (
                        <div className="flex flex-col items-center w-[34%] max-w-[140px] -mt-4">
                          <div className="text-yellow-400 text-lg mb-1">👑</div>
                          <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg border-2 border-yellow-400 bg-gradient-to-br from-yellow-500/20 to-amber-700/30 flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(250,204,21,0.4)] animate-pulse">
                              <span className="text-3xl sm:text-4xl">🥇</span>
                            </div>
                            <div className="absolute -top-2 -left-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black text-xs font-black shadow-lg">1</div>
                          </div>
                          <span className="text-xs sm:text-sm text-yellow-300 mt-2 truncate w-full text-center font-bold">{maskWallet(entries[0].wallet_address)}</span>
                          <span className="text-lg sm:text-xl font-black text-white">{entries[0].total_score.toLocaleString()}</span>
                          <span className="text-[9px] text-gray-500">pts</span>
                        </div>
                      )}
                      {entries.length >= 3 && (
                        <div className="flex flex-col items-center w-[30%] max-w-[120px]">
                          <div className="relative">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg border-2 border-orange-500 bg-gradient-to-br from-orange-600/20 to-orange-900/30 flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                              <span className="text-2xl sm:text-3xl">🥉</span>
                            </div>
                            <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-black shadow-lg">3</div>
                          </div>
                          <span className="text-[10px] sm:text-xs text-gray-300 mt-2 truncate w-full text-center font-medium">{maskWallet(entries[2].wallet_address)}</span>
                          <span className="text-sm sm:text-base font-black text-white">{entries[2].total_score.toLocaleString()}</span>
                          <span className="text-[9px] text-gray-500">pts</span>
                        </div>
                      )}
                    </div>

                    {/* TABLE HEADER */}
                    <div className="grid grid-cols-12 gap-1 text-[10px] text-gray-500 uppercase px-3 py-2 border-y border-neon-cyan/10 font-mono">
                      <span className="col-span-1">Rank</span>
                      <span className="col-span-3">Player</span>
                      <span className="col-span-2 text-center">Points</span>
                      <span className="col-span-2 text-center">Match</span>
                      <span className="col-span-2 text-center">Trivia</span>
                      <span className="col-span-2 text-center">Seq</span>
                    </div>

                    {/* PLAYER ROWS */}
                    <ScrollArea className="h-[220px]">
                      <div className="space-y-1">
                        {entries.slice(3, 15).map((entry) => {
                          const isYou = walletAddress && entry.wallet_address === walletAddress;
                          return (
                            <div
                              key={entry.wallet_address}
                              className={cn(
                                "grid grid-cols-12 gap-1 items-center px-3 py-2 rounded-lg transition-all hover:bg-white/5",
                                isYou ? "bg-neon-cyan/10 ring-1 ring-neon-cyan/40" : "bg-black/20"
                              )}
                            >
                              <span className={cn("col-span-1 font-black text-sm", entry.rank <= 5 ? "text-neon-pink" : "text-gray-500")}>
                                #{entry.rank}
                              </span>
                              <span className="col-span-3 text-xs text-gray-300 truncate font-medium">
                                {maskWallet(entry.wallet_address)}
                                {isYou && <span className="ml-1 text-neon-cyan text-[10px] font-bold">(You)</span>}
                              </span>
                              <span className="col-span-2 text-center text-xs text-white font-black">{entry.total_score.toLocaleString()}</span>
                              <span className="col-span-2 text-center text-xs text-neon-pink font-medium">{entry.match_best_score > 0 ? entry.match_best_score.toLocaleString() : '-'}</span>
                              <span className="col-span-2 text-center text-xs text-neon-cyan font-medium">{entry.trivia_best_score > 0 ? entry.trivia_best_score.toLocaleString() : '-'}</span>
                              <span className="col-span-2 text-center text-xs text-purple-400 font-medium">{entry.sequence_best_score > 0 ? entry.sequence_best_score.toLocaleString() : '-'}</span>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>

                    {/* YOUR RANK */}
                    {walletAddress && entries.find(e => e.wallet_address === walletAddress) && (() => {
                      const you = entries.find(e => e.wallet_address === walletAddress)!;
                      return (
                        <div className="grid grid-cols-12 gap-1 items-center px-3 py-2.5 rounded-lg bg-gradient-to-r from-neon-cyan/15 to-neon-pink/15 border border-neon-cyan/30 mt-1">
                          <span className="col-span-1 font-black text-sm text-neon-cyan">#{you.rank}</span>
                          <span className="col-span-3 text-xs text-neon-cyan font-bold truncate">{maskWallet(you.wallet_address)} (You)</span>
                          <span className="col-span-2 text-center text-xs text-white font-black">{you.total_score.toLocaleString()}</span>
                          <span className="col-span-2 text-center text-xs text-neon-pink">{you.match_best_score > 0 ? you.match_best_score.toLocaleString() : '-'}</span>
                          <span className="col-span-2 text-center text-xs text-neon-cyan">{you.trivia_best_score > 0 ? you.trivia_best_score.toLocaleString() : '-'}</span>
                          <span className="col-span-2 text-center text-xs text-purple-400">{you.sequence_best_score > 0 ? you.sequence_best_score.toLocaleString() : '-'}</span>
                        </div>
                      );
                    })()}
                  </>
                )}
              </>
            )}

            {/* Per-Game Leaderboard */}
            {gameFilter !== 'all' && (
              <div className="p-3 rounded-lg bg-black/30 border border-neon-cyan/10">
                <h4 className="text-sm font-bold text-center mb-3 flex items-center justify-center gap-2">
                  <span>{gameFilterConfig[gameFilter].emoji}</span>
                  <span className={gameFilterConfig[gameFilter].scoreClass}>
                    {gameFilterConfig[gameFilter].label} Leaderboard
                  </span>
                </h4>

                {gameLbLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-neon-cyan" />
                  </div>
                ) : gameEntries.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs">No scores yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="grid grid-cols-12 gap-1 text-[10px] text-gray-500 uppercase px-3 py-1.5 border-b border-neon-cyan/10 font-mono">
                      <span className="col-span-2">Rank</span>
                      <span className="col-span-6">Player</span>
                      <span className="col-span-4 text-right">Score</span>
                    </div>
                    <ScrollArea className="h-[200px]">
                      <div className="space-y-1">
                        {gameEntries.map((entry) => {
                          const isYou = walletAddress && entry.user_id === walletAddress;
                          return (
                            <div
                              key={`${entry.rank}-${entry.user_id}`}
                              className={cn(
                                "grid grid-cols-12 gap-1 items-center px-3 py-2 rounded-lg transition-all hover:bg-white/5",
                                entry.rank <= 3 ? getRankStyle(entry.rank) : "bg-black/20",
                                isYou && "ring-1 ring-neon-cyan/40 bg-neon-cyan/10"
                              )}
                            >
                              <span className={cn("col-span-2 font-black text-sm",
                                entry.rank === 1 ? "text-yellow-400" :
                                entry.rank === 2 ? "text-gray-300" :
                                entry.rank === 3 ? "text-orange-400" : "text-gray-500"
                              )}>
                                {entry.rank <= 3 ? getRankIcon(entry.rank) : `#${entry.rank}`}
                              </span>
                              <span className="col-span-6 text-xs text-gray-300 truncate font-medium">
                                {maskWallet(entry.user_id)}
                                {isYou && <span className="ml-1 text-neon-cyan text-[10px] font-bold">(You)</span>}
                              </span>
                              <span className={cn("col-span-4 text-right text-sm font-black", gameFilterConfig[gameFilter].scoreClass)}>
                                {entry.score.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
