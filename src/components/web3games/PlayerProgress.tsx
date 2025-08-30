
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const mockPlayerData = {
  totalGamesPlayed: 12,
  totalRewardsEarned: 1250.50,
  nftsOwned: 45,
  achievements: 8,
  favoriteGames: [
    { name: 'Star Atlas', hours: 120, rewards: '$450' },
    { name: 'Aurory', hours: 85, rewards: '$320' },
    { name: 'DeFi Land', hours: 60, rewards: '$180' }
  ],
  recentAchievements: [
    { name: 'First Victory', game: 'Star Atlas', date: '2024-01-15', reward: '50 ATLAS' },
    { name: 'Master Trader', game: 'DeFi Land', date: '2024-01-12', reward: '25 DFL' },
    { name: 'Fleet Commander', game: 'Star Atlas', date: '2024-01-10', reward: 'Ship NFT' }
  ],
  weeklyProgress: {
    gamesPlayed: 5,
    hoursPlayed: 24,
    rewardsEarned: 125.75,
    goal: 200
  }
};

export const PlayerProgress = () => {
  const progressPercentage = (mockPlayerData.weeklyProgress.rewardsEarned / mockPlayerData.weeklyProgress.goal) * 100;

  return (
    <div className="space-y-6">
      {/* Player Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">🎮</div>
          <div className="text-xl font-bold text-neon-cyan">{mockPlayerData.totalGamesPlayed}</div>
          <p className="text-xs text-muted-foreground">Games Played</p>
        </Card>
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-xl font-bold text-neon-green">${mockPlayerData.totalRewardsEarned}</div>
          <p className="text-xs text-muted-foreground">Total Earned</p>
        </Card>
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">🖼️</div>
          <div className="text-xl font-bold text-neon-purple">{mockPlayerData.nftsOwned}</div>
          <p className="text-xs text-muted-foreground">NFTs Owned</p>
        </Card>
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-xl font-bold text-neon-pink">{mockPlayerData.achievements}</div>
          <p className="text-xs text-muted-foreground">Achievements</p>
        </Card>
      </div>

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
              <span className="text-sm text-muted-foreground">Rewards Goal</span>
              <span className="font-bold text-neon-green">
                ${mockPlayerData.weeklyProgress.rewardsEarned} / ${mockPlayerData.weeklyProgress.goal}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-neon-purple">{mockPlayerData.weeklyProgress.gamesPlayed}</div>
                <div className="text-xs text-muted-foreground">Games This Week</div>
              </div>
              <div>
                <div className="text-lg font-bold text-neon-cyan">{mockPlayerData.weeklyProgress.hoursPlayed}h</div>
                <div className="text-xs text-muted-foreground">Hours Played</div>
              </div>
              <div>
                <div className="text-lg font-bold text-neon-pink">{Math.round(progressPercentage)}%</div>
                <div className="text-xs text-muted-foreground">Goal Progress</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Favorite Games */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            ⭐ FAVORITE GAMES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPlayerData.favoriteGames.map((game, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <div className="font-semibold text-neon-cyan">{game.name}</div>
                  <div className="text-sm text-muted-foreground">{game.hours} hours played</div>
                </div>
                <Badge className="bg-neon-green/20 text-neon-green">
                  {game.rewards} earned
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-pink">
            🏆 RECENT ACHIEVEMENTS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockPlayerData.recentAchievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <div className="font-semibold text-neon-pink">{achievement.name}</div>
                  <div className="text-sm text-muted-foreground">{achievement.game} • {achievement.date}</div>
                </div>
                <Badge className="bg-neon-purple/20 text-neon-purple">
                  {achievement.reward}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button className="cyber-button">
          🎮 Continue Playing
        </Button>
        <Button variant="outline" className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black">
          📊 View Full Stats
        </Button>
        <Button variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black">
          🏆 Browse Achievements
        </Button>
      </div>
    </div>
  );
};
