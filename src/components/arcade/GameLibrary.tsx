import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GameCard } from './GameCard';
import { GamePlayer } from './GamePlayer';

interface Game {
  id: string;
  title: string;
  category: 'retro' | 'modern' | 'puzzle' | 'action' | 'shooter';
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  description: string;
  thumbnail: string;
  highScore: number;
  rewardMultiplier: number;
  isLocked: boolean;
  unlockRequirement?: string;
}

interface GameLibraryProps {
  onGameSelect: (gameId: string | null) => void;
}

export const GameLibrary: React.FC<GameLibraryProps> = ({ onGameSelect }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentGame, setCurrentGame] = useState<string | null>(null);

  const games: Game[] = [
    {
      id: 'pac-man-classic',
      title: 'Pac-Man Classic',
      category: 'retro',
      difficulty: 'medium',
      description: 'The original maze-chasing arcade legend',
      thumbnail: '🟡',
      highScore: 999999,
      rewardMultiplier: 1.5,
      isLocked: false
    },
    {
      id: 'solajump-classic',
      title: 'SolaJump Classic',
      category: 'modern',
      difficulty: 'medium',
      description: 'Jump to new heights and earn crypto rewards!',
      thumbnail: '🚀',
      highScore: 15000,
      rewardMultiplier: 2.2,
      isLocked: false
    },
    {
      id: 'galaga-deluxe',
      title: 'Galaga Deluxe',
      category: 'retro',
      difficulty: 'medium',
      description: 'Classic space shooter with enhanced graphics',
      thumbnail: '🚀',
      highScore: 850000,
      rewardMultiplier: 1.8,
      isLocked: false
    },
    {
      id: 'space-invaders',
      title: 'Space Invaders',
      category: 'retro',
      difficulty: 'easy',
      description: 'Defend Earth from pixelated alien invasion',
      thumbnail: '👾',
      highScore: 500000,
      rewardMultiplier: 1.2,
      isLocked: false
    },
    {
      id: 'tetris-cyber',
      title: 'Cyber Tetris',
      category: 'puzzle',
      difficulty: 'medium',
      description: 'Futuristic block-stacking challenge',
      thumbnail: '🧩',
      highScore: 750000,
      rewardMultiplier: 2.0,
      isLocked: false
    },
    {
      id: 'neon-racer',
      title: 'Neon Racer',
      category: 'modern',
      difficulty: 'hard',
      description: 'High-speed cyberpunk racing experience',
      thumbnail: '🏎️',
      highScore: 1200000,
      rewardMultiplier: 2.5,
      isLocked: true,
      unlockRequirement: 'Reach Level 5'
    },
    {
      id: 'cyber-fighter',
      title: 'Cyber Fighter',
      category: 'action',
      difficulty: 'expert',
      description: 'Ultimate combat in the digital arena',
      thumbnail: '⚔️',
      highScore: 2000000,
      rewardMultiplier: 3.0,
      isLocked: true,
      unlockRequirement: 'Complete 10 tournaments'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Games', icon: '🎮' },
    { id: 'retro', name: 'Retro Classics', icon: '👾' },
    { id: 'modern', name: 'Modern Games', icon: '🚀' },
    { id: 'puzzle', name: 'Puzzle Games', icon: '🧩' },
    { id: 'action', name: 'Action Games', icon: '⚔️' },
    { id: 'shooter', name: 'Shooters', icon: '🎯' }
  ];

  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePlayGame = (gameId: string) => {
    setCurrentGame(gameId);
    onGameSelect(gameId);
  };

  const handleBackToLibrary = () => {
    setCurrentGame(null);
    onGameSelect(null);
  };

  if (currentGame) {
    const game = games.find(g => g.id === currentGame);
    return (
      <GamePlayer 
        game={game!} 
        onBack={handleBackToLibrary}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan">
            🎮 Game Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search games..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border-neon-cyan/30 text-white"
          />
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                className={`cyber-button text-sm ${
                  selectedCategory === category.id 
                    ? 'bg-neon-cyan text-black' 
                    : 'border-neon-cyan/30 text-neon-cyan'
                }`}
              >
                {category.icon} {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            onPlay={() => handlePlayGame(game.id)}
          />
        ))}
      </div>

      {filteredGames.length === 0 && (
        <Card className="arcade-frame">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🎮</div>
            <p className="text-gray-400">No games found matching your criteria</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
