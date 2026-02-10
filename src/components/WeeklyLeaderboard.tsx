import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Crown, Gamepad2, Brain, Zap, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface WeeklyEntry {
  wallet_address: string;
  match_best_score: number;
  trivia_best_score: number;
  sequence_best_score: number;
  total_score: number;
  rank: number;
}

type TabId = 'leaderboard' | 'progress' | 'activity';

const gameEmoji: Record<string, string> = {
  'Cyber Match': '🃏',
  'Cyber Trivia': '🧠',
  'Cyber Sequence': '🔢',
};

const gameRoute: Record<string, string> = {
  'Cyber Match': '/cyber-match',
  'Cyber Trivia': '/cyber-trivia',
  'Cyber Sequence': '/cyber-sequence',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const WeeklyLeaderboard: React.FC = () => {
  const { primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('leaderboard');
  const [entries, setEntries] = useState<WeeklyEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    cccBalance,
    totalGamesPlayed,
    totalGamesThisWeek,
    weeklyBestTotal,
    gameStats,
    recentGames,
    isLoading: progressLoading,
    refetch: refetchProgress,
  } = usePlayerProgress();

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

  const weeklyGoal = 500;
  const progressPercentage = Math.min((weeklyBestTotal / weeklyGoal) * 100, 100);

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'leaderboard', label: 'Leaderboard', icon: '👑' },
    { id: 'progress', label: 'My Progress', icon: '📊' },
    { id: 'activity', label: 'Activity', icon: '⚡' },
  ];

  return (
    <Card className="arcade-frame">
      <div className="p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-neon-cyan flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            Weekly Hub
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { fetchLeaderboard(); refetchProgress(); }}
              className="text-muted-foreground hover:text-neon-cyan h-8 w-8 p-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <span className="text-xs text-neon-green flex items-center gap-1">
              <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
              Live
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-black/30 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2 px-3 rounded-md text-xs sm:text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30"
                  : "text-gray-400 hover:text-gray-300 hover:bg-black/20"
              )}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Top 3 earn rewards every Monday (min <span className="text-neon-cyan font-bold">5 players</span>)
            </p>

            {/* Column Headers */}
            <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 uppercase px-3">
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
                { place: '1st', emoji: '🥇', reward: '50 CCC' },
                { place: '2nd', emoji: '🥈', reward: '25 CCC' },
                { place: '3rd', emoji: '🥉', reward: '10 CCC' },
              ].map((tier) => (
                <div key={tier.place} className="text-center p-2 rounded-lg bg-black/20">
                  <div className="text-xl">{tier.emoji}</div>
                  <div className="text-xs text-gray-400 mt-1">{tier.reward}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-4">
            {progressLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
              </div>
            ) : (
              <>
                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-3 rounded-lg bg-black/20">
                    <div className="text-lg">💰</div>
                    <div className="text-lg font-bold text-neon-cyan">{cccBalance.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">CCC Balance</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-black/20">
                    <div className="text-lg">🎮</div>
                    <div className="text-lg font-bold text-neon-green">{totalGamesPlayed}</div>
                    <p className="text-xs text-muted-foreground">Games Played</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-black/20">
                    <div className="text-lg">📅</div>
                    <div className="text-lg font-bold text-neon-purple">{totalGamesThisWeek}</div>
                    <p className="text-xs text-muted-foreground">This Week</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-black/20">
                    <div className="text-lg">🏆</div>
                    <div className="text-lg font-bold text-neon-pink">{weeklyBestTotal.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Weekly Best</p>
                  </div>
                </div>

                {/* Weekly Progress Bar */}
                <div className="space-y-2 p-4 rounded-lg bg-black/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Weekly Score Goal</span>
                    <span className="font-bold text-neon-green text-sm">
                      {weeklyBestTotal.toLocaleString()} / {weeklyGoal.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="text-right text-xs text-muted-foreground">{Math.round(progressPercentage)}% complete</div>
                </div>

                {/* Game Breakdown */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-neon-purple uppercase tracking-wider">🕹️ Game Breakdown</h3>
                  {gameStats.map((game) => (
                    <div
                      key={game.name}
                      className="flex items-center justify-between p-3 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
                      onClick={() => navigate(gameRoute[game.name] || '/')}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{gameEmoji[game.name] || '🎮'}</span>
                        <div>
                          <div className="font-semibold text-neon-cyan text-sm">{game.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {game.gamesPlayed} total · {game.gamesThisWeek} this week
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-neon-green/20 text-neon-green text-xs">
                        Best: {game.bestScore.toLocaleString()}
                      </Badge>
                    </div>
                  ))}
                  {gameStats.every(g => g.gamesPlayed === 0) && (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      No games played yet — jump in to start tracking!
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-3">
            {progressLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : recentGames.length > 0 ? (
              recentGames.map((game, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{gameEmoji[game.game] || '🎮'}</span>
                    <div>
                      <div className="font-semibold text-foreground/90 text-sm">{game.game}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(game.playedAt)}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-neon-purple/50 text-neon-purple text-xs">
                    {game.score.toLocaleString()} pts
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Gamepad2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No recent games — play a round to see activity here!</p>
              </div>
            )}

            {/* Quick Play Buttons */}
            <div className="flex flex-wrap gap-2 justify-center pt-2 border-t border-neon-cyan/10">
              <Button size="sm" className="cyber-button text-xs" onClick={() => navigate('/cyber-match')}>
                🃏 Cyber Match
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black text-xs"
                onClick={() => navigate('/cyber-trivia')}
              >
                🧠 Trivia
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black text-xs"
                onClick={() => navigate('/cyber-sequence')}
              >
                🔢 Sequence
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
