
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

interface GameCardProps {
  game: Game;
  onPlay: () => void;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'retro': return 'bg-neon-pink/20 text-neon-pink border-neon-pink';
      case 'modern': return 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan';
      case 'puzzle': return 'bg-neon-green/20 text-neon-green border-neon-green';
      case 'action': return 'bg-red-500/20 text-red-400 border-red-400';
      case 'shooter': return 'bg-neon-purple/20 text-neon-purple border-neon-purple';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400';
    }
  };

  return (
    <Card className={`arcade-frame hover:scale-105 transition-all duration-300 ${
      game.isLocked ? 'opacity-60' : 'cursor-pointer hover:border-neon-cyan/60'
    }`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="text-6xl mb-2">{game.thumbnail}</div>
          <div className="flex flex-col gap-1">
            <Badge className={getCategoryColor(game.category)}>
              {game.category.toUpperCase()}
            </Badge>
            <div className={`w-3 h-3 rounded-full ${getDifficultyColor(game.difficulty)}`} title={`Difficulty: ${game.difficulty}`} />
          </div>
        </div>
        <CardTitle className="font-display text-lg text-neon-cyan">
          {game.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-400">{game.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">High Score:</span>
            <span className="text-neon-green font-mono">{game.highScore.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Reward Multiplier:</span>
            <span className="text-neon-purple font-bold">{game.rewardMultiplier}x</span>
          </div>
        </div>

        {game.isLocked ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-yellow-500">
              <span>🔒</span>
              <span className="text-sm">Locked</span>
            </div>
            <p className="text-xs text-gray-500">{game.unlockRequirement}</p>
          </div>
        ) : (
          <Button 
            onClick={onPlay}
            className="cyber-button w-full"
          >
            🎮 PLAY NOW
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
