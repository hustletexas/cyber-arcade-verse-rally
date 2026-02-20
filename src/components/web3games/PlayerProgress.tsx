import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlayerProgress } from '@/hooks/usePlayerProgress';
import { useNavigate } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { TournamentStats } from './TournamentStats';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

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

export const PlayerProgress = () => {
  const {
    cccBalance,
    totalGamesPlayed,
    totalGamesThisWeek,
    weeklyBestTotal,
    gameStats,
    recentGames,
    isLoading,
    refetch,
  } = usePlayerProgress();
  const navigate = useNavigate();

  // Weekly goal: 500 combined score
  const weeklyGoal = 500;
  const progressPercentage = Math.min((weeklyBestTotal / weeklyGoal) * 100, 100);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="holographic text-center p-4">
              <Skeleton className="h-8 w-8 mx-auto mb-2 rounded-full" />
              <Skeleton className="h-6 w-16 mx-auto mb-1" />
              <Skeleton className="h-3 w-20 mx-auto" />
            </Card>
          ))}
        </div>
        <Card className="arcade-frame">
          <CardContent className="p-6">
            <Skeleton className="h-40 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Indicator + Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-green opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-green" />
          </span>
          <span className="text-xs text-neon-green font-display tracking-wider">LIVE STATS</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={refetch}
          className="text-muted-foreground hover:text-neon-cyan"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Player Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-xl font-bold text-neon-cyan">{cccBalance.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">CCC Balance</p>
        </Card>
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">🎮</div>
          <div className="text-xl font-bold text-neon-green">{totalGamesPlayed}</div>
          <p className="text-xs text-muted-foreground">Games Played</p>
        </Card>
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">📅</div>
          <div className="text-xl font-bold text-neon-purple">{totalGamesThisWeek}</div>
          <p className="text-xs text-muted-foreground">This Week</p>
        </Card>
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-xl font-bold text-neon-pink">{weeklyBestTotal.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Weekly Best Total</p>
        </Card>
      </div>

      {/* Tournament Stats */}
      <TournamentStats />

      {/* Weekly Progress */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            📊 WEEKLY PROGRESS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Weekly Score Goal</span>
              <span className="font-bold text-neon-green">
                {weeklyBestTotal.toLocaleString()} / {weeklyGoal.toLocaleString()}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-neon-purple">{totalGamesThisWeek}</div>
                <div className="text-xs text-muted-foreground">Games This Week</div>
              </div>
              <div>
                <div className="text-lg font-bold text-neon-cyan">{totalGamesPlayed}</div>
                <div className="text-xs text-muted-foreground">Total Played</div>
              </div>
              <div>
                <div className="text-lg font-bold text-neon-pink">{Math.round(progressPercentage)}%</div>
                <div className="text-xs text-muted-foreground">Goal Progress</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Breakdown */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            🕹️ GAME BREAKDOWN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {gameStats.map((game) => (
              <div
                key={game.name}
                className="flex items-center justify-between p-4 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
                onClick={() => navigate(gameRoute[game.name] || '/')}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{gameEmoji[game.name] || '🎮'}</span>
                  <div>
                    <div className="font-semibold text-neon-cyan">{game.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {game.gamesPlayed} games total · {game.gamesThisWeek} this week
                    </div>
                  </div>
                </div>
                <Badge className="bg-neon-green/20 text-neon-green">
                  Best: {game.bestScore.toLocaleString()}
                </Badge>
              </div>
            ))}
            {gameStats.every(g => g.gamesPlayed === 0) && (
              <p className="text-center text-muted-foreground py-4">
                No games played yet — jump into an arcade game to start tracking!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-pink">
            ⚡ RECENT ACTIVITY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentGames.length > 0 ? (
              recentGames.map((game, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{gameEmoji[game.game] || '🎮'}</span>
                    <div>
                      <div className="font-semibold text-foreground/90 text-sm">{game.game}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(game.playedAt)}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-neon-purple/50 text-neon-purple">
                    {game.score.toLocaleString()} pts
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                No recent games — play a round to see your activity here!
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button className="cyber-button" onClick={() => navigate('/cyber-match')}>
          🃏 Play Cyber Match
        </Button>
        <Button
          variant="outline"
          className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
          onClick={() => navigate('/cyber-trivia')}
        >
          🧠 Play Trivia
        </Button>
        <Button
          variant="outline"
          className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
          onClick={() => navigate('/cyber-sequence')}
        >
          🔢 Play Sequence
        </Button>
      </div>
    </div>
  );
};
