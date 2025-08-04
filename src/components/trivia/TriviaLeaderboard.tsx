
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LeaderboardEntry {
  user_id: string;
  username: string;
  wallet_address: string;
  category: string;
  total_score: number;
  correct_answers: number;
  total_questions: number;
  accuracy_percentage: number;
  speed_bonus: number;
  completed_at: string;
  rank: number;
}

interface TriviaLeaderboardProps {
  onBackToMenu: () => void;
}

export const TriviaLeaderboard = ({ onBackToMenu }: TriviaLeaderboardProps) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const categories = ['all', 'Game History', 'Characters', 'Developers', 'Technology'];

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedCategory]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('trivia_leaderboard')
        .select('*');

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query
        .order('total_score', { ascending: false })
        .limit(50);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const formatWalletAddress = (address: string) => {
    if (!address) return 'No wallet';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Game History': return '🎮';
      case 'Characters': return '👾';
      case 'Developers': return '💻';
      case 'Technology': return '⚡';
      default: return '🧠';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-display text-2xl text-neon-cyan">
              🏆 TRIVIA LEADERBOARD
            </CardTitle>
            <Button onClick={onBackToMenu} variant="outline">
              ← Back to Menu
            </Button>
          </div>
          <p className="text-muted-foreground">
            Top players and their trivia achievements across all categories
          </p>
        </CardHeader>
      </Card>

      {/* Category Filter */}
      <Card className="holographic">
        <CardContent className="pt-4">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category === 'all' ? '🌟 ALL' : `${getCategoryIcon(category)} ${category.toUpperCase()}`}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            {selectedCategory === 'all' ? '🌟 GLOBAL RANKINGS' : `${getCategoryIcon(selectedCategory)} ${selectedCategory.toUpperCase()} RANKINGS`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-4">🔄</div>
              <p className="text-muted-foreground">Loading leaderboard...</p>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-neon-cyan mb-2">No Data Available</h3>
              <p className="text-muted-foreground">Be the first to play and appear on the leaderboard!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <Card
                  key={`${entry.user_id}-${entry.category}-${entry.completed_at}`}
                  className={`p-4 ${
                    entry.user_id === user?.id 
                      ? 'bg-neon-cyan/10 border-neon-cyan' 
                      : 'holographic'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold">
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neon-pink">
                            {entry.username || 'Anonymous'}
                          </span>
                          {entry.user_id === user?.id && (
                            <Badge className="bg-neon-cyan text-black text-xs">YOU</Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          💎 {formatWalletAddress(entry.wallet_address)}
                        </div>
                        {selectedCategory === 'all' && (
                          <div className="text-xs text-neon-purple">
                            {getCategoryIcon(entry.category)} {entry.category}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-2xl font-bold text-neon-green">
                        {entry.total_score}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {entry.correct_answers}/{entry.total_questions} ({entry.accuracy_percentage}%)
                      </div>
                      <div className="text-xs text-neon-cyan">
                        ⚡ Speed: +{entry.speed_bonus}
                      </div>
                    </div>
                  </div>

                  {/* Achievement Badges */}
                  <div className="flex justify-center gap-2 mt-3">
                    {entry.accuracy_percentage === 100 && (
                      <Badge className="bg-neon-purple text-white text-xs">
                        🎯 PERFECT
                      </Badge>
                    )}
                    {entry.accuracy_percentage >= 90 && (
                      <Badge className="bg-neon-green text-black text-xs">
                        🏅 ACE
                      </Badge>
                    )}
                    {entry.speed_bonus > 0 && (
                      <Badge className="bg-neon-cyan text-black text-xs">
                        ⚡ SPEEDSTER
                      </Badge>
                    )}
                    {entry.total_score >= 2000 && (
                      <Badge className="bg-neon-pink text-white text-xs">
                        🔥 HIGH SCORER
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reward Tiers */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            💰 WEEKLY REWARD TIERS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="holographic p-4 text-center">
              <div className="text-4xl mb-2">🥇</div>
              <h3 className="font-bold text-neon-gold mb-1">1st Place</h3>
              <div className="text-2xl font-bold text-neon-green">1000 CCTR</div>
              <p className="text-xs text-muted-foreground">+ Legendary NFT</p>
            </Card>
            <Card className="holographic p-4 text-center">
              <div className="text-4xl mb-2">🥈</div>
              <h3 className="font-bold text-silver mb-1">2nd Place</h3>
              <div className="text-2xl font-bold text-neon-cyan">500 CCTR</div>
              <p className="text-xs text-muted-foreground">+ Rare NFT</p>
            </Card>
            <Card className="holographic p-4 text-center">
              <div className="text-4xl mb-2">🥉</div>
              <h3 className="font-bold text-bronze mb-1">3rd Place</h3>
              <div className="text-2xl font-bold text-neon-purple">250 CCTR</div>
              <p className="text-xs text-muted-foreground">+ Common NFT</p>
            </Card>
          </div>
          
          <div className="text-center mt-4 text-sm text-muted-foreground">
            🗓️ Weekly rewards distributed every Sunday via Solana smart contract
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
