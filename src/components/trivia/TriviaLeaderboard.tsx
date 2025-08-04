import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { TriviaLeaderboardEntry } from '@/types/trivia';

interface TriviaLeaderboardProps {
  onBackToMenu: () => void;
}

export const TriviaLeaderboard = ({ onBackToMenu }: TriviaLeaderboardProps) => {
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [leaderboardData, setLeaderboardData] = useState<TriviaLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'all-time'>('weekly');

  const categories = [
    { id: 'all', name: 'All Categories', emoji: '🌟' },
    { id: 'nintendo64', name: 'N64', emoji: '🎮' },
    { id: 'playstation1', name: 'PS1', emoji: '🕹️' },
    { id: 'playstation2', name: 'PS2', emoji: '🎯' },
    { id: 'xbox', name: 'Xbox', emoji: '🎪' },
    { id: 'gamecube', name: 'GameCube', emoji: '🎲' },
    { id: 'retro', name: 'Retro', emoji: '👾' },
    { id: 'arcade', name: 'Arcade', emoji: '🕹️' },
    { id: 'pc-gaming', name: 'PC Gaming', emoji: '💻' }
  ];

  useEffect(() => {
    loadLeaderboard();
  }, [activeCategory, timeframe]);

  const loadLeaderboard = async () => {
    setLoading(true);
    try {
      // Mock leaderboard data since database doesn't exist yet
      const mockData: TriviaLeaderboardEntry[] = [
        {
          user_id: '1',
          username: 'N64Master',
          wallet_address: '1A2B...9Z8Y',
          category: 'nintendo64',
          total_score: 2450,
          correct_answers: 95,
          total_questions: 100,
          accuracy_percentage: 95,
          speed_bonus: 450,
          completed_at: new Date().toISOString(),
          rank: 1
        },
        {
          user_id: '2',
          username: 'PlayStationPro',
          wallet_address: '2B3C...8X7W',
          category: 'playstation1',
          total_score: 2200,
          correct_answers: 88,
          total_questions: 100,
          accuracy_percentage: 88,
          speed_bonus: 320,
          completed_at: new Date().toISOString(),
          rank: 2
        },
        {
          user_id: '3',
          username: 'RetroGamer',
          wallet_address: '3C4D...7V6U',
          category: 'retro',
          total_score: 2100,
          correct_answers: 84,
          total_questions: 100,
          accuracy_percentage: 84,
          speed_bonus: 380,
          completed_at: new Date().toISOString(),
          rank: 3
        }
      ];

      // Add more mock entries with gaming-related usernames
      for (let i = 4; i <= 20; i++) {
        const gamingNames = ['ArcadeKing', 'ConsoleLord', 'PixelMaster', 'GameChamp', 'RetroHero', 'ControllerPro'];
        mockData.push({
          user_id: i.toString(),
          username: `${gamingNames[Math.floor(Math.random() * gamingNames.length)]}${i}`,
          wallet_address: `${i}X${i}Y...${i}Z${i}W`,
          category: categories[Math.floor(Math.random() * (categories.length - 1)) + 1].id,
          total_score: 2000 - (i * 50) + Math.floor(Math.random() * 100),
          correct_answers: 80 - Math.floor(Math.random() * 20),
          total_questions: 100,
          accuracy_percentage: 80 - Math.floor(Math.random() * 20),
          speed_bonus: Math.floor(Math.random() * 500),
          completed_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          rank: i
        });
      }

      setLeaderboardData(mockData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboardData([]);
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

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-amber-600';
      default: return 'text-muted-foreground';
    }
  };

  const getAchievementBadge = (accuracy: number, totalScore: number) => {
    if (accuracy >= 95 && totalScore >= 2000) return { text: 'Gaming Legend', color: 'bg-purple-500' };
    if (accuracy >= 90 && totalScore >= 1500) return { text: 'Console Master', color: 'bg-blue-500' };
    if (accuracy >= 80 && totalScore >= 1000) return { text: 'Gaming Expert', color: 'bg-green-500' };
    if (accuracy >= 70) return { text: 'Casual Gamer', color: 'bg-yellow-500' };
    return { text: 'Newbie', color: 'bg-gray-500' };
  };

  const filteredData = activeCategory === 'all' 
    ? leaderboardData 
    : leaderboardData.filter(entry => entry.category === activeCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-display text-2xl text-neon-cyan">
              🏆 GAMING TRIVIA LEADERBOARD
            </CardTitle>
            <Button onClick={onBackToMenu} variant="outline">
              ← Back to Menu
            </Button>
          </div>
          <p className="text-muted-foreground">
            Top gaming trivia performers across all console categories
          </p>
        </CardHeader>
      </Card>

      {/* Timeframe Selection */}
      <div className="flex justify-center">
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as typeof timeframe)}>
          <TabsList className="bg-gray-800/50">
            <TabsTrigger value="daily" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
              Daily
            </TabsTrigger>
            <TabsTrigger value="weekly" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
              Weekly
            </TabsTrigger>
            <TabsTrigger value="all-time" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
              All Time
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            variant={activeCategory === category.id ? "default" : "outline"}
            size="sm"
            className={`${activeCategory === category.id ? 'cyber-button' : 'hover:bg-gray-800/50'}`}
          >
            {category.emoji} {category.name}
          </Button>
        ))}
      </div>

      {/* Leaderboard */}
      <Card className="arcade-frame">
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-neon-cyan mb-2">Loading Rankings...</h3>
              <p className="text-muted-foreground">Fetching the latest scores</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-neon-cyan mb-2">No Rankings Yet</h3>
              <p className="text-muted-foreground">Be the first to set a record in this category!</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredData.slice(0, 50).map((entry, index) => {
                const achievement = getAchievementBadge(entry.accuracy_percentage, entry.total_score);
                const isCurrentUser = user && entry.user_id === user.id;
                
                return (
                  <div
                    key={entry.user_id}
                    className={`flex items-center justify-between p-4 ${
                      isCurrentUser ? 'bg-neon-cyan/10 border border-neon-cyan/30' : 'hover:bg-gray-800/30'
                    } ${index === 0 ? 'rounded-t' : ''} ${index === filteredData.length - 1 ? 'rounded-b' : ''}`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`text-2xl font-bold w-12 text-center ${getRankColor(entry.rank)}`}>
                        {getRankIcon(entry.rank)}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`font-bold ${isCurrentUser ? 'text-neon-cyan' : 'text-white'}`}>
                            {entry.username}
                          </span>
                          {isCurrentUser && <Badge variant="outline">You</Badge>}
                          <Badge className={achievement.color}>
                            {achievement.text}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{entry.correct_answers}/{entry.total_questions} correct</span>
                          <span>{entry.accuracy_percentage}% accuracy</span>
                          <span>+{entry.speed_bonus} speed bonus</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-2xl font-bold text-neon-green">
                        {entry.total_score.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        CCTR earned
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current User Rank */}
      {user && filteredData.length > 0 && (
        <Card className="arcade-frame border-neon-purple/30">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="font-bold text-neon-purple mb-2">Your Best Gaming Ranking</h3>
              <div className="flex justify-center items-center space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-cyan">#12</div>
                  <div className="text-xs text-muted-foreground">Global Rank</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-purple">1,850</div>
                  <div className="text-xs text-muted-foreground">Best Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-neon-pink">92%</div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
