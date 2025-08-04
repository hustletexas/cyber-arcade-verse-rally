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
import { TriviaUserStats } from '@/types/trivia';

type ViewState = 'menu' | 'game' | 'leaderboard' | 'rewards';

export const TriviaGame = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewState>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [userStats, setUserStats] = useState<TriviaUserStats>({
    totalGames: 0,
    totalScore: 0,
    bestScore: 0,
    winRate: 0
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'nintendo64', name: 'Nintendo 64', emoji: '🎮', description: 'Mario, Zelda, GoldenEye classics' },
    { id: 'playstation1', name: 'PlayStation 1', emoji: '🕹️', description: 'Final Fantasy, Crash Bandicoot' },
    { id: 'playstation2', name: 'PlayStation 2', emoji: '🎯', description: 'GTA, God of War, Shadow of Colossus' },
    { id: 'xbox', name: 'Original Xbox', emoji: '🎪', description: 'Halo, Fable, Knights of the Old Republic' },
    { id: 'gamecube', name: 'GameCube', emoji: '🎲', description: 'Metroid Prime, Animal Crossing' },
    { id: 'retro', name: 'Retro Gaming', emoji: '👾', description: 'NES, SNES, Genesis classics' },
    { id: 'arcade', name: 'Arcade Classics', emoji: '🕹️', description: 'Street Fighter, Pac-Man, Galaga' },
    { id: 'pc-gaming', name: 'PC Gaming', emoji: '💻', description: 'Half-Life, Counter-Strike, WoW' },
    { id: 'nintendo-handheld', name: 'Nintendo Handhelds', emoji: '📱', description: 'Game Boy, DS, Pokemon series' }
  ];

  useEffect(() => {
    if (user) {
      loadUserStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUserStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // For now, we'll use mock data since the tables don't exist yet
      // This will be replaced once the database is properly set up
      const mockStats: TriviaUserStats = {
        totalGames: 5,
        totalScore: 2450,
        bestScore: 650,
        winRate: 80
      };
      
      setUserStats(mockStats);
      setRecentSessions([]);
    } catch (error) {
      console.error('Error loading user stats:', error);
      // Set default stats on error
      setUserStats({
        totalGames: 0,
        totalScore: 0,
        bestScore: 0,
        winRate: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const startGame = (category: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to play trivia games",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedCategory(category);
    setCurrentView('game');
  };

  const handleGameComplete = () => {
    setCurrentView('menu');
    loadUserStats(); // Refresh stats after game
  };

  if (currentView === 'game' && selectedCategory) {
    return (
      <TriviaGameplay
        category={selectedCategory}
        onGameComplete={handleGameComplete}
        onBackToMenu={() => setCurrentView('menu')}
      />
    );
  }

  if (currentView === 'leaderboard') {
    return (
      <TriviaLeaderboard
        onBackToMenu={() => setCurrentView('menu')}
      />
    );
  }

  if (currentView === 'rewards') {
    return (
      <TriviaRewards
        onBackToMenu={() => setCurrentView('menu')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-neon-cyan text-center">
            🎮 GAMING TRIVIA CHALLENGE
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Test your gaming knowledge and earn CCTR tokens • Console classics • Gaming legends
          </p>
        </CardHeader>
      </Card>

      {/* Navigation */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <Button
          onClick={() => setCurrentView('menu')}
          variant={currentView === 'menu' ? 'default' : 'outline'}
          className="cyber-button"
        >
          🏠 Main Menu
        </Button>
        <Button
          onClick={() => setCurrentView('leaderboard')}
          variant="outline"
          className="cyber-button"
        >
          🏆 Leaderboard
        </Button>
        <Button
          onClick={() => setCurrentView('rewards')}
          variant="outline"
          className="cyber-button"
        >
          💰 Rewards
        </Button>
      </div>

      {/* User Stats */}
      {user && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="holographic p-4 text-center">
            <div className="text-2xl mb-2">🎮</div>
            <div className="text-xl font-bold text-neon-cyan">{userStats.totalGames}</div>
            <p className="text-xs text-muted-foreground">Games Played</p>
          </Card>
          <Card className="holographic p-4 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-xl font-bold text-neon-purple">{userStats.totalScore.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Score</p>
          </Card>
          <Card className="holographic p-4 text-center">
            <div className="text-2xl mb-2">🏆</div>
            <div className="text-xl font-bold text-neon-pink">{userStats.bestScore}</div>
            <p className="text-xs text-muted-foreground">Best Score</p>
          </Card>
          <Card className="holographic p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <div className="text-xl font-bold text-neon-green">{userStats.winRate}%</div>
            <p className="text-xs text-muted-foreground">Win Rate</p>
          </Card>
        </div>
      )}

      {/* Category Selection */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-purple">
            🎯 SELECT GAMING CATEGORY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card key={category.id} className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => startGame(category.id)}>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{category.emoji}</div>
                  <h3 className="font-bold text-lg text-neon-cyan mb-2">{category.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                  <Button className="cyber-button w-full" size="sm">
                    Start Game
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-cyan">
              💰 Earn CCTR Tokens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Easy questions: 100 CCTR</li>
              <li>• Medium questions: 200 CCTR</li>
              <li>• Hard questions: 300 CCTR</li>
              <li>• Speed bonuses up to 1.5x</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-purple">
              🏆 Gaming Legends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Console mastery badges</li>
              <li>• Weekly tournaments</li>
              <li>• Retro gaming achievements</li>
              <li>• Exclusive gaming NFTs</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-pink">
              🎮 Game Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Console-specific challenges</li>
              <li>• Multiple difficulty levels</li>
              <li>• Gaming era specialization</li>
              <li>• Progress tracking</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {!user && (
        <Card className="arcade-frame border-neon-pink/30">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-neon-pink mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-4">
              Log in to track your progress, earn CCTR tokens, and compete on gaming leaderboards
            </p>
            <Button className="cyber-button">
              Login to Play
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
