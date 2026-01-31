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
    { id: 'gaming', name: 'Gaming', emoji: '🎮', description: 'Console classics, retro, arcade & PC gaming' },
    { id: 'entertainment', name: 'Entertainment', emoji: '🎭', description: 'Movies, music, sports & cartoons' },
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
    <Card className="arcade-frame">
      <CardHeader className="text-center pb-4">
        <CardTitle className="font-display text-3xl text-neon-cyan">
          🎮 GAMING TRIVIA CHALLENGE
        </CardTitle>
        <p className="text-muted-foreground">
          Test your gaming knowledge • Play FREE or earn CCTR tokens!
        </p>
        
        {/* Wallet & Balance Status */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {isWalletConnected && primaryWallet && (
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
              ✓ Wallet: {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
            </Badge>
          )}
          {user && !balanceLoading && (
            <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple">
              💰 {balance.cctr_balance} CCTR
            </Badge>
          )}
          {!isWalletConnected && (
            <Badge className="bg-neon-pink/20 text-neon-pink border-neon-pink">
              💡 Connect wallet for rewards
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {categories.map((category) => (
            <div 
              key={category.id} 
              className="holographic p-5 rounded-lg text-center hover:scale-[1.02] transition-all duration-300 border-2 border-transparent hover:border-neon-cyan"
            >
              <div className="text-4xl mb-2">{category.emoji}</div>
              <h3 className="font-display text-lg text-neon-cyan mb-1">{category.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{category.description}</p>
              <div className="flex gap-2 justify-center">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-bold"
                  onClick={() => startGame(category.id, 'free')}
                >
                  🎮 FREE
                </Button>
                <Button 
                  size="sm" 
                  className="bg-gradient-to-r from-neon-purple to-neon-pink text-white font-bold hover:opacity-90"
                  onClick={() => startGame(category.id, 'paid')}
                >
                  💎 CCTR
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Mode Info - Compact */}
        <div className="grid grid-cols-2 gap-3 text-center text-xs max-w-lg mx-auto">
          <div className="p-3 rounded-lg bg-neon-green/10 border border-neon-green/30">
            <div className="font-bold text-neon-green mb-1">🎮 FREE Mode</div>
            <p className="text-muted-foreground">No wallet • Unlimited plays • Practice mode</p>
          </div>
          <div className="p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/30">
            <div className="font-bold text-neon-purple mb-1">💎 CCTR Mode</div>
            <p className="text-muted-foreground">1 CCTR entry • Earn per correct • Max +9 CCTR</p>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center gap-3 pt-2">
          <Button
            onClick={() => setCurrentView('leaderboard')}
            variant="outline"
            size="sm"
            className="cyber-button"
          >
            🏆 Leaderboard
          </Button>
          <Button
            onClick={() => setCurrentView('rewards')}
            variant="outline"
            size="sm"
            className="cyber-button"
          >
            💰 Rewards
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
