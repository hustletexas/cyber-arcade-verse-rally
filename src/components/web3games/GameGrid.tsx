
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { GameCard } from './GameCard';

const allGames = [
  {
    id: 'axie-infinity',
    name: 'Axie Infinity',
    category: 'Pet Battle',
    blockchain: 'Ethereum',
    image: '/lovable-uploads/114fd628-dccf-45c6-ab13-1f49fb075c47.png',
    description: 'Battle, breed, and collect fantasy creatures called Axies',
    playUrl: 'https://axieinfinity.com',
    downloadUrl: 'https://axieinfinity.com/download',
    isWebBased: false,
    rewards: ['AXS', 'SLP', 'Axie NFTs'],
    players: '2M+',
    rating: 4.2
  },
  {
    id: 'the-sandbox',
    name: 'The Sandbox',
    category: 'Metaverse',
    blockchain: 'Ethereum',
    image: '/lovable-uploads/378a8773-5320-4d49-8779-341407974bb9.png',
    description: 'Create, own, and monetize your gaming experiences',
    playUrl: 'https://www.sandbox.game/en/play/',
    downloadUrl: null,
    isWebBased: true,
    rewards: ['SAND', 'Land NFTs', 'Asset NFTs'],
    players: '500K+',
    rating: 4.1
  },
  {
    id: 'decentraland',
    name: 'Decentraland',
    category: 'Virtual World',
    blockchain: 'Ethereum',
    image: '/lovable-uploads/499520d8-632b-415d-9e5a-5599ef4eca14.png',
    description: 'Explore a virtual world owned by its users',
    playUrl: 'https://play.decentraland.org',
    downloadUrl: null,
    isWebBased: true,
    rewards: ['MANA', 'Land NFTs', 'Wearable NFTs'],
    players: '300K+',
    rating: 4.0
  },
  {
    id: 'splinterlands',
    name: 'Splinterlands',
    category: 'Card Battle',
    blockchain: 'Hive',
    image: '/lovable-uploads/567dbfe3-1f47-49cd-8fe2-6e429df5d3ff.png',
    description: 'Digital trading card game with true ownership',
    playUrl: 'https://splinterlands.com',
    downloadUrl: null,
    isWebBased: true,
    rewards: ['SPS', 'DEC', 'Card NFTs'],
    players: '400K+',
    rating: 4.3
  },
  {
    id: 'gods-unchained',
    name: 'Gods Unchained',
    category: 'Card Game',
    blockchain: 'Ethereum',
    image: '/lovable-uploads/6cc1e7b7-f790-42ba-9363-08220cbc8ae1.png',
    description: 'Free-to-play tactical card game with true ownership',
    playUrl: 'https://godsunchained.com',
    downloadUrl: 'https://godsunchained.com/download',
    isWebBased: false,
    rewards: ['GODS', 'Card NFTs'],
    players: '200K+',
    rating: 4.4
  },
  {
    id: 'alien-worlds',
    name: 'Alien Worlds',
    category: 'Mining',
    blockchain: 'WAX',
    image: '/lovable-uploads/7aefc14a-b1ec-4889-8990-4f12e95eec7d.png',
    description: 'Mine Trilium and explore alien worlds',
    playUrl: 'https://alienworlds.io/play',
    downloadUrl: null,
    isWebBased: true,
    rewards: ['TLM', 'Tool NFTs', 'Land NFTs'],
    players: '800K+',
    rating: 3.8
  }
];

interface GameGridProps {
  category: string;
}

export const GameGrid: React.FC<GameGridProps> = ({ category }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('rating');

  const filteredGames = allGames
    .filter(game => {
      const matchesCategory = category === 'all' || game.category.toLowerCase().includes(category.toLowerCase());
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           game.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'players':
          return parseInt(b.players.replace(/\D/g, '')) - parseInt(a.players.replace(/\D/g, ''));
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <Card className="arcade-frame">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search games..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="cyber-input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={sortBy === 'rating' ? 'default' : 'outline'}
                onClick={() => setSortBy('rating')}
                size="sm"
                className="cyber-button"
              >
                ⭐ Rating
              </Button>
              <Button
                variant={sortBy === 'players' ? 'default' : 'outline'}
                onClick={() => setSortBy('players')}
                size="sm"
                className="cyber-button"
              >
                👥 Players
              </Button>
              <Button
                variant={sortBy === 'name' ? 'default' : 'outline'}
                onClick={() => setSortBy('name')}
                size="sm"
                className="cyber-button"
              >
                🔤 Name
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>

      {filteredGames.length === 0 && (
        <Card className="arcade-frame">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-neon-cyan mb-2">No Games Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filter
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
