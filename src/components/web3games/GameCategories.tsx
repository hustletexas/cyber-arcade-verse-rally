
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categories = [
  { id: 'all', name: 'All Games', emoji: '🎮', count: 150, description: 'Browse all Web3 games' },
  { id: 'mmo', name: 'MMO', emoji: '🌍', count: 25, description: 'Massive multiplayer online games' },
  { id: 'rpg', name: 'RPG', emoji: '⚔️', count: 30, description: 'Role-playing adventures' },
  { id: 'strategy', name: 'Strategy', emoji: '🏰', count: 20, description: 'Tactical and strategic games' },
  { id: 'card', name: 'Card Games', emoji: '🃏', count: 15, description: 'Trading card games' },
  { id: 'battle', name: 'Battle', emoji: '⚡', count: 18, description: 'Combat and battle games' },
  { id: 'simulation', name: 'Simulation', emoji: '🏗️', count: 12, description: 'Life and farming simulations' },
  { id: 'metaverse', name: 'Metaverse', emoji: '🌐', count: 10, description: 'Virtual worlds and social spaces' },
  { id: 'racing', name: 'Racing', emoji: '🏎️', count: 8, description: 'High-speed racing games' },
  { id: 'puzzle', name: 'Puzzle', emoji: '🧩', count: 12, description: 'Brain-teasing puzzle games' }
];

interface GameCategoriesProps {
  onCategorySelect: (category: string) => void;
}

export const GameCategories: React.FC<GameCategoriesProps> = ({ onCategorySelect }) => {
  return (
    <div className="space-y-6">
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan">
            🎯 GAME CATEGORIES
          </CardTitle>
          <p className="text-muted-foreground">
            Discover Web3 games by category • Find your favorite genre • Earn while you play
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.id} 
            className="holographic hover:scale-105 transition-all duration-300 cursor-pointer"
            onClick={() => onCategorySelect(category.id)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{category.emoji}</div>
              <h3 className="font-bold text-lg text-neon-cyan mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
              <Badge className="bg-neon-purple/20 text-neon-purple">
                {category.count} Games
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Blockchain Categories */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            ⛓️ BY BLOCKCHAIN
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="holographic text-center p-4">
              <div className="text-2xl mb-2">🟣</div>
              <div className="font-bold text-neon-cyan">Ethereum</div>
              <div className="text-sm text-muted-foreground">45 Games</div>
            </Card>
            <Card className="holographic text-center p-4">
              <div className="text-2xl mb-2">🟢</div>
              <div className="font-bold text-neon-purple">Solana</div>
              <div className="text-sm text-muted-foreground">35 Games</div>
            </Card>
            <Card className="holographic text-center p-4">
              <div className="text-2xl mb-2">🔵</div>
              <div className="font-bold text-neon-pink">Polygon</div>
              <div className="text-sm text-muted-foreground">28 Games</div>
            </Card>
            <Card className="holographic text-center p-4">
              <div className="text-2xl mb-2">🟡</div>
              <div className="font-bold text-neon-green">BSC</div>
              <div className="text-sm text-muted-foreground">20 Games</div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
