
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeaderboardEntry {
  rank: number;
  player: string;
  score: number;
  tokensEarned: number;
  date: string;
  avatar?: string;
}

export const ArcadeLeaderboards = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'alltime'>('weekly');

  // Mock leaderboard data
  const leaderboards = {
    'pac-man-classic': [
      { rank: 1, player: 'CyberGamer_2024', score: 999999, tokensEarned: 15000, date: '2024-01-15', avatar: '🟡' },
      { rank: 2, player: 'RetroMaster', score: 856432, tokensEarned: 12846, date: '2024-01-14', avatar: '👾' },
      { rank: 3, player: 'ArcadeKing', score: 743289, tokensEarned: 11149, date: '2024-01-13', avatar: '🎮' },
      { rank: 4, player: 'NeonRunner', score: 689543, tokensEarned: 10343, date: '2024-01-12', avatar: '⚡' },
      { rank: 5, player: 'PixelWarrior', score: 634821, tokensEarned: 9522, date: '2024-01-11', avatar: '🚀' }
    ],
    'galaga-deluxe': [
      { rank: 1, player: 'SpaceAce_99', score: 892156, tokensEarned: 16059, date: '2024-01-15', avatar: '🚀' },
      { rank: 2, player: 'StarDestroyer', score: 756398, tokensEarned: 13615, date: '2024-01-14', avatar: '⭐' },
      { rank: 3, player: 'CosmicShooter', score: 698754, tokensEarned: 12578, date: '2024-01-13', avatar: '👾' },
      { rank: 4, player: 'LaserMaster', score: 654321, tokensEarned: 11778, date: '2024-01-12', avatar: '⚡' },
      { rank: 5, player: 'GalacticHero', score: 589432, tokensEarned: 10610, date: '2024-01-11', avatar: '🛸' }
    ],
    'tetris-cyber': [
      { rank: 1, player: 'BlockMaster_Pro', score: 1245632, tokensEarned: 24912, date: '2024-01-15', avatar: '🧩' },
      { rank: 2, player: 'LineClearing', score: 1098756, tokensEarned: 21975, date: '2024-01-14', avatar: '⚡' },
      { rank: 3, player: 'TetrisLegend', score: 987654, tokensEarned: 19753, date: '2024-01-13', avatar: '🎯' },
      { rank: 4, player: 'CyberStacker', score: 876543, tokensEarned: 17531, date: '2024-01-12', avatar: '🔷' },
      { rank: 5, player: 'NeonBlocks', score: 765432, tokensEarned: 15309, date: '2024-01-11', avatar: '💎' }
    ]
  };

  const games = [
    { id: 'pac-man-classic', name: 'Pac-Man Classic', icon: '🟡' },
    { id: 'galaga-deluxe', name: 'Galaga Deluxe', icon: '🚀' },
    { id: 'tetris-cyber', name: 'Cyber Tetris', icon: '🧩' }
  ];

  const [selectedGame, setSelectedGame] = useState('pac-man-classic');

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-400';
      case 3: return 'text-amber-600';
      default: return 'text-neon-cyan';
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

  return (
    <div className="space-y-6">
      {/* Leaderboard Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-purple text-center">
            🏆 ARCADE LEADERBOARDS
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Compete for the highest scores and earn CCTR token rewards
          </p>
        </CardHeader>
      </Card>

      {/* Game Selection */}
      <div className="flex flex-wrap justify-center gap-2">
        {games.map((game) => (
          <Button
            key={game.id}
            onClick={() => setSelectedGame(game.id)}
            variant={selectedGame === game.id ? 'default' : 'outline'}
            className={`cyber-button ${
              selectedGame === game.id 
                ? 'bg-neon-purple text-white' 
                : 'border-neon-purple/30 text-neon-purple'
            }`}
          >
            {game.icon} {game.name}
          </Button>
        ))}
      </div>

      {/* Time Period Selection */}
      <div className="flex justify-center">
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly', 'alltime'] as const).map((period) => (
            <Button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              className={`${
                selectedPeriod === period 
                  ? 'bg-neon-cyan text-black' 
                  : 'border-neon-cyan/30 text-neon-cyan'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-display text-xl text-neon-cyan">
              {games.find(g => g.id === selectedGame)?.icon} {games.find(g => g.id === selectedGame)?.name} - {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)}
            </CardTitle>
            <Badge className="bg-neon-green/20 text-neon-green">
              Total Players: {leaderboards[selectedGame as keyof typeof leaderboards]?.length || 0}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaderboards[selectedGame as keyof typeof leaderboards]?.map((entry) => (
              <div key={entry.rank} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-neon-cyan/20 hover:border-neon-cyan/40 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="text-2xl">{entry.avatar}</div>
                  <div>
                    <div className="font-bold text-neon-cyan">{entry.player}</div>
                    <div className="text-sm text-gray-400">{entry.date}</div>
                  </div>
                </div>
                
                <div className="text-right space-y-1">
                  <div className="text-lg font-bold text-neon-green">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-sm text-neon-purple">
                    {entry.tokensEarned} CCTR
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-400">
                No leaderboard data available for this game
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Rewards Info */}
      <Card className="arcade-frame border-neon-green/30">
        <CardHeader>
          <CardTitle className="font-display text-lg text-neon-green">
            💰 Leaderboard Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl mb-2">🥇</div>
              <div className="font-bold text-yellow-400">1st Place</div>
              <div className="text-gray-400">5000 CCTR + Exclusive NFT</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🥈</div>
              <div className="font-bold text-gray-400">2nd Place</div>
              <div className="text-gray-400">3000 CCTR + Special Badge</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🥉</div>
              <div className="font-bold text-amber-600">3rd Place</div>
              <div className="text-gray-400">1500 CCTR + Achievement</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
