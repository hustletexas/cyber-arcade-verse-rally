
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'skins' | 'powerups' | 'passes' | 'cosmetics';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  gameSpecific?: string;
  duration?: string;
  owned: boolean;
}

export const ArcadeStore = () => {
  const [selectedCategory, setSelectedCategory] = useState<'skins' | 'powerups' | 'passes' | 'cosmetics'>('skins');

  const storeItems: StoreItem[] = [
    // Game Skins
    {
      id: '1',
      name: 'Neon Pac-Man',
      description: 'Glowing cyberpunk Pac-Man with trail effects',
      price: 500,
      category: 'skins',
      rarity: 'rare',
      icon: '🟢',
      gameSpecific: 'Pac-Man Classic',
      owned: false
    },
    {
      id: '2',
      name: 'Chrome Galaga Ship',
      description: 'Reflective metallic spaceship with enhanced lasers',
      price: 750,
      category: 'skins',
      rarity: 'epic',
      icon: '🛸',
      gameSpecific: 'Galaga Deluxe',
      owned: false
    },
    {
      id: '3',
      name: 'Diamond Tetris Blocks',
      description: 'Sparkling crystal blocks with rainbow effects',
      price: 1000,
      category: 'skins',
      rarity: 'legendary',
      icon: '💎',
      gameSpecific: 'Cyber Tetris',
      owned: false
    },
    // Power-ups
    {
      id: '4',
      name: 'Score Multiplier',
      description: 'Double your score for one game session',
      price: 100,
      category: 'powerups',
      rarity: 'common',
      icon: '✨',
      duration: '1 Game',
      owned: false
    },
    {
      id: '5',
      name: 'Extra Life',
      description: 'Start with an additional life in supported games',
      price: 150,
      category: 'powerups',
      rarity: 'common',
      icon: '❤️',
      duration: '1 Game',
      owned: false
    },
    {
      id: '6',
      name: 'Speed Boost',
      description: 'Increased movement speed for competitive advantage',
      price: 200,
      category: 'powerups',
      rarity: 'rare',
      icon: '⚡',
      duration: '1 Game',
      owned: false
    },
    // Passes
    {
      id: '7',
      name: 'Arcade VIP Pass',
      description: 'Access to premium games and exclusive tournaments',
      price: 2500,
      category: 'passes',
      rarity: 'epic',
      icon: '🎫',
      duration: '30 Days',
      owned: false
    },
    {
      id: '8',
      name: 'Tournament Master Pass',
      description: 'Reduced entry fees and bonus rewards in tournaments',
      price: 5000,
      category: 'passes',
      rarity: 'legendary',
      icon: '👑',
      duration: '30 Days',
      owned: false
    },
    // Cosmetics
    {
      id: '9',
      name: 'Retro Cabinet Frame',
      description: 'Classic 80s arcade cabinet border for your games',
      price: 300,
      category: 'cosmetics',
      rarity: 'common',
      icon: '🎮',
      owned: false
    },
    {
      id: '10',
      name: 'Neon Victory Animation',
      description: 'Spectacular light show when achieving high scores',
      price: 800,
      category: 'cosmetics',
      rarity: 'rare',
      icon: '🎆',
      owned: false
    }
  ];

  const getRarityColor = (rarity: StoreItem['rarity']) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-400 border-gray-400';
      case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-400';
      case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-400';
      case 'legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400';
    }
  };

  const categories = [
    { id: 'skins', name: 'Game Skins', icon: '🎨' },
    { id: 'powerups', name: 'Power-ups', icon: '⚡' },
    { id: 'passes', name: 'Game Passes', icon: '🎫' },
    { id: 'cosmetics', name: 'Cosmetics', icon: '✨' }
  ];

  const filteredItems = storeItems.filter(item => item.category === selectedCategory);

  const purchaseItem = (itemId: string) => {
    // TODO: Implement purchase logic
    console.log('Purchasing item:', itemId);
  };

  return (
    <div className="space-y-6">
      {/* Store Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-green text-center">
            🛒 ARCADE STORE
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Enhance your gaming experience • Skins • Power-ups • Exclusive items
          </p>
        </CardHeader>
      </Card>

      {/* Player Balance */}
      <Card className="arcade-frame border-neon-green/30">
        <CardContent className="text-center py-4">
          <div className="flex justify-center items-center gap-4">
            <div className="text-2xl">💰</div>
            <div>
              <div className="text-lg font-bold text-neon-green">Your Balance</div>
              <div className="text-2xl font-mono text-neon-cyan">12,450 CCTR</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Navigation */}
      <div className="flex flex-wrap justify-center gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => setSelectedCategory(category.id as any)}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            className={`cyber-button ${
              selectedCategory === category.id 
                ? 'bg-neon-green text-black' 
                : 'border-neon-green/30 text-neon-green'
            }`}
          >
            {category.icon} {category.name}
          </Button>
        ))}
      </div>

      {/* Store Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <Card key={item.id} className="arcade-frame hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="text-4xl">{item.icon}</div>
                <Badge className={getRarityColor(item.rarity)}>
                  {item.rarity.toUpperCase()}
                </Badge>
              </div>
              <CardTitle className="font-display text-lg text-neon-cyan">
                {item.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400">{item.description}</p>
              
              {item.gameSpecific && (
                <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple">
                  🎮 {item.gameSpecific}
                </Badge>
              )}
              
              {item.duration && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-neon-cyan">{item.duration}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold text-neon-green">
                  {item.price.toLocaleString()} CCTR
                </div>
                
                {item.owned ? (
                  <Badge className="bg-green-500 text-white">
                    ✅ OWNED
                  </Badge>
                ) : (
                  <Button 
                    onClick={() => purchaseItem(item.id)}
                    className="cyber-button"
                    size="sm"
                  >
                    💳 BUY
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Special Offers */}
      <Card className="arcade-frame border-neon-pink/60">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-pink">
            🔥 LIMITED TIME OFFERS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 p-4 rounded-lg border border-neon-pink/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">🎁</div>
                <div>
                  <h4 className="font-bold text-neon-pink">Starter Bundle</h4>
                  <p className="text-sm text-gray-400">Perfect for new players</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Includes: Score Multiplier x5, Extra Life x3, Retro Frame</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="line-through text-gray-500">1000 CCTR</span>
                    <span className="ml-2 text-neon-green font-bold">750 CCTR</span>
                  </div>
                  <Button size="sm" className="cyber-button">
                    🛒 GET BUNDLE
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 p-4 rounded-lg border border-yellow-400/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="text-2xl">⭐</div>
                <div>
                  <h4 className="font-bold text-yellow-400">VIP Mega Pack</h4>
                  <p className="text-sm text-gray-400">Ultimate gaming experience</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">Includes: VIP Pass, All Skins, 20x Power-ups</p>
                <div className="flex justify-between items-center">
                  <div>
                    <span className="line-through text-gray-500">15000 CCTR</span>
                    <span className="ml-2 text-yellow-400 font-bold">10000 CCTR</span>
                  </div>
                  <Button size="sm" className="cyber-button bg-yellow-500 text-black hover:bg-yellow-400">
                    👑 GET VIP
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
