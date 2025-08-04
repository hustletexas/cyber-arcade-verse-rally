
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TriviaGameplay } from './trivia/TriviaGameplay';
import { TriviaLeaderboard } from './trivia/TriviaLeaderboard';
import { TriviaRewards } from './trivia/TriviaRewards';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TriviaSession } from '@/types/trivia';

export const TriviaGame = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'menu' | 'game' | 'leaderboard' | 'rewards'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [userStats, setUserStats] = useState({
    totalGames: 0,
    totalScore: 0,
    bestScore: 0,
    winRate: 0
  });

  const categories = [
    {
      id: 'Game History',
      name: '🎮 GAME HISTORY',
      description: 'Test your knowledge of gaming milestones and classic titles',
      icon: '🕹️',
      difficulty: 'medium'
    },
    {
      id: 'Characters',
      name: '👾 CHARACTERS',
      description: 'Iconic heroes, villains, and memorable game characters',
      icon: '🦸',
      difficulty: 'easy'
    },
    {
      id: 'Developers',
      name: '💻 DEVELOPERS',
      description: 'The masterminds behind your favorite games',
      icon: '👨‍💻',
      difficulty: 'hard'
    },
    {
      id: 'Technology',
      name: '⚡ TECHNOLOGY',
      description: 'Gaming hardware, engines, and technical innovations',
      icon: '🔧',
      difficulty: 'hard'
    }
  ];

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Use raw SQL query to avoid type issues with new tables
      const { data, error } = await supabase.rpc('get_trivia_stats', {
        p_user_id: user.id
      });

      if (error) {
        // Fallback: try direct query if RPC doesn't exist
        console.warn('RPC not found, using direct query');
        
        const { data: rawData, error: queryError } = await supabase
          .from('trivia_sessions' as any)
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (queryError) throw queryError;

        if (rawData && rawData.length > 0) {
          const sessions = rawData as TriviaSession[];
          const totalGames = sessions.length;
          const totalScore = sessions.reduce((sum: number, session: TriviaSession) => sum + session.total_score, 0);
          const bestScore = Math.max(...sessions.map((session: TriviaSession) => session.total_score));
          const totalQuestions = sessions.reduce((sum: number, session: TriviaSession) => sum + session.total_questions, 0);
          const totalCorrect = sessions.reduce((sum: number, session: TriviaSession) => sum + session.correct_answers, 0);
          const winRate = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

          setUserStats({
            totalGames,
            totalScore,
            bestScore,
            winRate
          });
        }
      } else {
        // Use RPC result if available
        setUserStats(data || {
          totalGames: 0,
          totalScore: 0,
          bestScore: 0,
          winRate: 0
        });
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const startGame = (category: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to play trivia",
        variant: "destructive",
      });
      return;
    }

    setSelectedCategory(category);
    setActiveView('game');
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-neon-green';
      case 'medium': return 'bg-neon-cyan';
      case 'hard': return 'bg-neon-pink';
      default: return 'bg-neon-purple';
    }
  };

  if (activeView === 'game' && selectedCategory) {
    return (
      <TriviaGameplay
        category={selectedCategory}
        onGameEnd={() => {
          setActiveView('menu');
          fetchUserStats();
        }}
        onBackToMenu={() => setActiveView('menu')}
      />
    );
  }

  if (activeView === 'leaderboard') {
    return (
      <TriviaLeaderboard
        onBackToMenu={() => setActiveView('menu')}
      />
    );
  }

  if (activeView === 'rewards') {
    return (
      <TriviaRewards
        onBackToMenu={() => setActiveView('menu')}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-neon-cyan text-center">
            🧠 CYBER TRIVIA CHALLENGE
          </CardTitle>
          <p className="text-center text-muted-foreground text-lg">
            Test your gaming knowledge and earn $CCTR rewards!
          </p>
        </CardHeader>
      </Card>

      {/* User Stats */}
      {user && (
        <Card className="holographic">
          <CardHeader>
            <CardTitle className="font-display text-xl text-neon-purple">
              📊 YOUR STATS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-green">{userStats.totalGames}</div>
                <div className="text-sm text-muted-foreground">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-cyan">{userStats.totalScore}</div>
                <div className="text-sm text-muted-foreground">Total Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-pink">{userStats.bestScore}</div>
                <div className="text-sm text-muted-foreground">Best Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-neon-purple">{userStats.winRate}%</div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <Card className="arcade-frame">
        <CardContent className="pt-6">
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setActiveView('menu')}
              className={`cyber-button ${activeView === 'menu' ? 'bg-neon-cyan text-black' : ''}`}
            >
              🎮 PLAY GAME
            </Button>
            <Button
              onClick={() => setActiveView('leaderboard')}
              className={`cyber-button ${activeView === 'leaderboard' ? 'bg-neon-cyan text-black' : ''}`}
            >
              🏆 LEADERBOARD
            </Button>
            <Button
              onClick={() => setActiveView('rewards')}
              className={`cyber-button ${activeView === 'rewards' ? 'bg-neon-cyan text-black' : ''}`}
            >
              💰 REWARDS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🎯 SELECT CATEGORY
          </CardTitle>
          <p className="text-muted-foreground">
            Choose your trivia category to begin the challenge
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="holographic p-4 hover:bg-gray-800/50 transition-colors">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{category.icon}</span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-neon-pink">
                          {category.name}
                        </h3>
                        <Badge className={`${getDifficultyColor(category.difficulty)} text-black text-xs`}>
                          {category.difficulty.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-muted-foreground">
                      💰 Earn up to 300 CCTR per correct answer
                    </div>
                    <Button
                      onClick={() => startGame(category.id)}
                      className="cyber-button text-sm"
                      disabled={!user}
                    >
                      {user ? 'START GAME' : 'LOGIN TO PLAY'}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            📖 HOW TO PLAY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-4xl">⏱️</div>
              <h3 className="font-bold text-neon-cyan">30-Second Timer</h3>
              <p className="text-sm text-muted-foreground">
                Answer each question within 30 seconds or lose points
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl">⚡</div>
              <h3 className="font-bold text-neon-green">Speed Bonus</h3>
              <p className="text-sm text-muted-foreground">
                Answer within 10 seconds for 1.5x points multiplier
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl">🏆</div>
              <h3 className="font-bold text-neon-pink">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground">
                Top players earn $CCTR tokens and exclusive NFTs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
