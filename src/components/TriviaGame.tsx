import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TriviaGameplay } from './trivia/TriviaGameplay';
import { TriviaLeaderboard } from './trivia/TriviaLeaderboard';
import { TriviaRewards } from './trivia/TriviaRewards';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useAchievements } from '@/hooks/useAchievements';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TriviaUserStats } from '@/types/trivia';
import { WalletStatusBar } from '@/components/WalletStatusBar';

type ViewState = 'menu' | 'game' | 'leaderboard' | 'rewards';
type PlayMode = 'free' | 'paid';

export const TriviaGame = () => {
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { balance, loading: balanceLoading, refetch: refetchBalance } = useUserBalance();
  const { trackAchievement } = useAchievements();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<ViewState>('menu');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [playMode, setPlayMode] = useState<PlayMode>('free');
  const [userStats, setUserStats] = useState<TriviaUserStats>({
    totalGames: 0,
    totalScore: 0,
    bestScore: 0,
    winRate: 0
  });
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    // Gaming Categories
    { id: 'nintendo64', name: 'Nintendo 64', emoji: '🎮', description: 'Mario, Zelda, GoldenEye classics', type: 'gaming' },
    { id: 'playstation1', name: 'PlayStation 1', emoji: '🕹️', description: 'Final Fantasy, Crash Bandicoot', type: 'gaming' },
    { id: 'playstation2', name: 'PlayStation 2', emoji: '🎯', description: 'GTA, God of War, Shadow of Colossus', type: 'gaming' },
    { id: 'xbox', name: 'Original Xbox', emoji: '🎪', description: 'Halo, Fable, Knights of the Old Republic', type: 'gaming' },
    { id: 'gamecube', name: 'GameCube', emoji: '🎲', description: 'Metroid Prime, Animal Crossing', type: 'gaming' },
    { id: 'retro', name: 'Retro Gaming', emoji: '👾', description: 'NES, SNES, Genesis classics', type: 'gaming' },
    { id: 'arcade', name: 'Arcade Classics', emoji: '🕹️', description: 'Street Fighter, Pac-Man, Galaga', type: 'gaming' },
    { id: 'pc-gaming', name: 'PC Gaming', emoji: '💻', description: 'Half-Life, Counter-Strike, WoW', type: 'gaming' },
    { id: 'nintendo-handheld', name: 'Nintendo Handhelds', emoji: '📱', description: 'Game Boy, DS, Pokemon series', type: 'gaming' },
    // Entertainment Categories
    { id: 'cartoons', name: 'Cartoons', emoji: '📺', description: 'Classic and modern animated shows', type: 'entertainment' },
    { id: 'sports', name: 'Sports', emoji: '⚽', description: 'Football, basketball, Olympics & more', type: 'entertainment' },
    { id: 'music', name: 'Music', emoji: '🎵', description: 'Artists, albums, music history', type: 'entertainment' },
    { id: 'movies', name: 'Movies', emoji: '🎬', description: 'Hollywood classics and blockbusters', type: 'entertainment' },
  ];

  useEffect(() => {
    if (user || isWalletConnected) {
      loadUserStats();
    } else {
      setLoading(false);
    }
  }, [user, primaryWallet]);

  const loadUserStats = async () => {
    if (!user && !isWalletConnected) return;

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

  const connectWallet = async () => {
    try {
      if (window.freighter) {
        toast({
          title: "Connecting Stellar Wallet...",
          description: "Please approve the connection request",
        });

        const publicKey = await window.freighter.getPublicKey();
        if (publicKey) {
          toast({
            title: "Wallet Connected! 🎉",
            description: `Connected to ${publicKey.slice(0, 8)}...${publicKey.slice(-4)}`,
          });
          
          // Reload user stats after wallet connection
          loadUserStats();
        }
      } else {
        toast({
          title: "Stellar Wallet Not Found",
          description: "Please install Freighter wallet extension to play",
          variant: "destructive",
        });
        
        // Open Freighter website in new tab
        window.open('https://freighter.app/', '_blank');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startGame = async (category: string, mode: PlayMode) => {
    // Free mode: Anyone can play (no wallet required)
    // Paid mode: Wallet required + CCTR tokens
    
    if (mode === 'paid') {
      if (!isWalletConnected) {
        toast({
          title: "Wallet Required",
          description: "Please connect your Stellar wallet to play for CCTR rewards",
          variant: "destructive",
        });
        return;
      }

      // Check if user has enough tokens (1 CCTR required for paid mode)
      if (user && balance.cctr_balance < 1) {
        toast({
          title: "Insufficient Tokens",
          description: "You need 1 CCTR token to play for rewards. Try FREE mode instead!",
          variant: "destructive",
        });
        return;
      }

      // Deduct 1 CCTR token for game entry using secure server-side function
      if (user) {
        try {
          const { data, error } = await supabase.rpc('deduct_trivia_entry_fee', {
            category_param: category
          });

          if (error) throw error;

          const result = data as { success: boolean; error?: string } | null;

          if (!result?.success) {
            toast({
              title: "Error",
              description: result?.error || "Failed to start game. Please try again.",
              variant: "destructive",
            });
            return;
          }

          await refetchBalance();

          toast({
            title: "Game Started! 🎮",
            description: "1 CCTR deducted. Earn 1 token per correct answer!",
          });
        } catch (error) {
          console.error('Error deducting entry fee:', error);
          toast({
            title: "Error",
            description: "Failed to start game. Please try again.",
            variant: "destructive",
          });
          return;
        }
      } else {
        // Wallet connected but no Supabase user - just start paid game
        toast({
          title: "Game Started! 🎮",
          description: "Playing for CCTR rewards!",
        });
      }
    } else {
      // Free mode
      toast({
        title: "Free Play Started! 🎮",
        description: "Play for fun! Connect wallet to earn CCTR rewards.",
      });
    }
    
    setPlayMode(mode);
    setSelectedCategory(category);
    setCurrentView('game');
  };

  const handleGameComplete = (correctAnswers?: number) => {
    setCurrentView('menu');
    loadUserStats(); // Refresh stats after game
    refetchBalance(); // Refresh balance after game
    
    // Track trivia achievements
    if (correctAnswers && correctAnswers > 0) {
      trackAchievement('trivia_correct', correctAnswers);
    }
  };

  if (currentView === 'game' && selectedCategory) {
    return (
      <TriviaGameplay
        category={selectedCategory}
        playMode={playMode}
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

  const isAuthenticated = user || isWalletConnected;
  const connectedWallet = primaryWallet;

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-neon-cyan text-center">
            🎮 GAMING TRIVIA CHALLENGE
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Test your gaming knowledge • Play FREE or earn CCTR tokens!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <WalletStatusBar />
          
          {/* Wallet & Balance Status */}
          <div className="flex flex-wrap justify-center gap-3">
            {isWalletConnected && primaryWallet && (
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                ✓ Wallet: {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
              </Badge>
            )}
            {user && !balanceLoading && (
              <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple">
                💰 Balance: {balance.cctr_balance} CCTR
              </Badge>
            )}
            {!isWalletConnected && (
              <Badge className="bg-neon-pink/20 text-neon-pink border-neon-pink">
                💡 Connect wallet for rewards
              </Badge>
            )}
          </div>
          
          {/* Navigation Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
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
        </CardContent>
      </Card>

      {/* User Stats */}
      {isAuthenticated && (
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
            🎯 SELECT TRIVIA CATEGORY
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Gaming Categories */}
          <div>
            <h3 className="text-lg font-bold text-neon-cyan mb-4 flex items-center gap-2">
              <span className="text-2xl">🎮</span> Gaming
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.filter(c => c.type === 'gaming').map((category) => (
                <Card key={category.id} className="holographic hover:scale-105 transition-all duration-300 group">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2 group-hover:animate-bounce">{category.emoji}</div>
                    <h3 className="font-bold text-neon-cyan mb-1">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
                    <div className="flex gap-2 justify-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                        onClick={() => startGame(category.id, 'free')}
                      >
                        🎮 FREE
                      </Button>
                      <Button 
                        size="sm" 
                        className="text-xs bg-neon-cyan/20 text-neon-cyan border border-neon-cyan hover:bg-neon-cyan hover:text-black"
                        onClick={() => startGame(category.id, 'paid')}
                      >
                        💎 WIN CCTR
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Entertainment Categories */}
          <div>
            <h3 className="text-lg font-bold text-neon-pink mb-4 flex items-center gap-2">
              <span className="text-2xl">🎭</span> Entertainment
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.filter(c => c.type === 'entertainment').map((category) => (
                <Card key={category.id} className="holographic hover:scale-105 transition-all duration-300 group">
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl mb-2 group-hover:animate-bounce">{category.emoji}</div>
                    <h3 className="font-bold text-neon-pink mb-1 text-sm">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-1">{category.description}</p>
                    <div className="flex gap-2 justify-center flex-wrap">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
                        onClick={() => startGame(category.id, 'free')}
                      >
                        🎮 FREE
                      </Button>
                      <Button 
                        size="sm" 
                        className="text-xs bg-neon-pink/20 text-neon-pink border border-neon-pink hover:bg-neon-pink hover:text-black"
                        onClick={() => startGame(category.id, 'paid')}
                      >
                        💎 WIN
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-green">
              🎮 FREE Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• No wallet required</li>
              <li>• Play unlimited games</li>
              <li>• Practice and learn</li>
              <li>• No cost, no rewards</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-cyan">
              💎 WIN CCTR Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Wallet required</li>
              <li>• Entry: 1 CCTR token</li>
              <li>• Earn 1 CCTR per correct answer</li>
              <li>• Max profit: +9 CCTR per game</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-pink">
              🏆 Game Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Console-specific challenges</li>
              <li>• Multiple difficulty levels</li>
              <li>• 15 seconds per question</li>
              <li>• Leaderboard rankings</li>
            </ul>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
