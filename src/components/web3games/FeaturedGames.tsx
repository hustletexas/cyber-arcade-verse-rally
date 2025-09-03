
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard } from './GameCard';

const featuredGames = [
  {
    id: 'star-atlas',
    name: 'Star Atlas',
    category: 'MMO Strategy',
    blockchain: 'Solana',
    image: '/lovable-uploads/1070ae3c-2007-492b-ac52-1f15c99e05c1.png',
    description: 'Epic space exploration and combat MMO built on Solana',
    playUrl: 'https://play.staratlas.com',
    downloadUrl: null,
    isWebBased: true,
    rewards: ['ATLAS', 'POLIS', 'Ship NFTs'],
    players: '50K+',
    rating: 4.8
  },
  {
    id: 'wilder-world',
    name: 'Wilder World',
    category: 'Open World Metaverse',
    blockchain: 'Ethereum',
    image: '/lovable-uploads/51af8344-cf64-4bfe-a0a5-128e31280d81.png',
    description: 'Immersive metaverse with photorealistic graphics and NFT integration',
    playUrl: 'https://wilderworld.com/play',
    downloadUrl: 'https://wilderworld.com/download',
    isWebBased: false,
    rewards: ['WILD', 'Wilder NFTs', 'Land NFTs'],
    players: '35K+',
    rating: 4.7
  },
  {
    id: 'magiccraft',
    name: 'MagicCraft',
    category: 'MOBA Strategy',
    blockchain: 'Polygon',
    image: '/lovable-uploads/424982ae-ffcd-4769-8e5c-c63cd572d347.png',
    description: 'Epic MOBA with magical battles and strategic gameplay',
    playUrl: 'https://magiccraft.io/play',
    downloadUrl: 'https://magiccraft.io/download',
    isWebBased: false,
    rewards: ['MCRT', 'Hero NFTs', 'Spell NFTs'],
    players: '30K+',
    rating: 4.5
  }
];

export const FeaturedGames = () => {
  return (
    <div className="space-y-6">
      {/* Hero Featured Game */}
      <Card className="arcade-frame bg-gradient-to-r from-neon-purple/20 to-neon-cyan/20">
        <CardContent className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <Badge className="mb-4 bg-neon-pink text-white">GAME OF THE WEEK</Badge>
              <h2 className="text-3xl font-bold text-neon-cyan mb-4">CyberBrawl.io</h2>
              <p className="text-lg text-muted-foreground mb-6">
                The ultimate multiplayer brawler where cyber warriors clash in intense battles. 
                Earn rewards, unlock legendary characters, and dominate the arena in this 
                action-packed Web3 gaming experience.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-neon-green/20 text-neon-green">⭐ 4.9 Rating</Badge>
                <Badge className="bg-neon-purple/20 text-neon-purple">👥 100K+ Players</Badge>
                <Badge className="bg-neon-cyan/20 text-neon-cyan">🌐 Web Based</Badge>
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={() => window.open('https://cyberbrawl.io', '_blank')}
                  className="cyber-button"
                >
                  ⚔️ PLAY NOW
                </Button>
                <Button 
                  variant="outline"
                  className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                >
                  📖 Learn More
                </Button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/lovable-uploads/4b312226-9c9f-4a1c-9c6f-16be0f7b09b8.png" 
                alt="CyberBrawl.io"
                className="w-full h-80 object-cover rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Featured Games Grid */}
      <div>
        <h3 className="text-2xl font-bold text-neon-purple mb-6">🎯 TOP WEB3 GAMES</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGames.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">🎮</div>
          <div className="text-xl font-bold text-neon-cyan">150+</div>
          <p className="text-xs text-muted-foreground">Available Games</p>
        </Card>
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">👥</div>
          <div className="text-xl font-bold text-neon-purple">1M+</div>
          <p className="text-xs text-muted-foreground">Active Players</p>
        </Card>
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">💰</div>
          <div className="text-xl font-bold text-neon-green">$10M+</div>
          <p className="text-xs text-muted-foreground">Rewards Earned</p>
        </Card>
        <Card className="holographic text-center p-4">
          <div className="text-2xl mb-2">🏆</div>
          <div className="text-xl font-bold text-neon-pink">500K+</div>
          <p className="text-xs text-muted-foreground">NFTs Minted</p>
        </Card>
      </div>
    </div>
  );
};
