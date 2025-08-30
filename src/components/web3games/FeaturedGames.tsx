
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
    image: '/lovable-uploads/25b4f405-8edd-4c52-9b77-0d270d1b6c90.png',
    description: 'Epic space exploration and combat MMO built on Solana',
    playUrl: 'https://play.staratlas.com',
    downloadUrl: null,
    isWebBased: true,
    rewards: ['ATLAS', 'POLIS', 'Ship NFTs'],
    players: '50K+',
    rating: 4.8
  },
  {
    id: 'aurory',
    name: 'Aurory',
    category: 'RPG Adventure',
    blockchain: 'Solana',
    image: '/lovable-uploads/40d6a951-fd19-4d9f-b892-be71f6f300d5.png',
    description: 'Captivating RPG adventure with collectible Nefties',
    playUrl: 'https://aurory.io/game',
    downloadUrl: 'https://aurory.io/download',
    isWebBased: false,
    rewards: ['AURY', 'Neftie NFTs'],
    players: '25K+',
    rating: 4.6
  },
  {
    id: 'defi-land',
    name: 'DeFi Land',
    category: 'Simulation',
    blockchain: 'Solana',
    image: '/lovable-uploads/618813b4-8ef1-495f-b103-dd4f3612befb.png',
    description: 'Gamified DeFi protocol with farming and trading',
    playUrl: 'https://defiland.app',
    downloadUrl: null,
    isWebBased: true,
    rewards: ['DFL', 'Land NFTs', 'Tool NFTs'],
    players: '15K+',
    rating: 4.4
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
              <h2 className="text-3xl font-bold text-neon-cyan mb-4">Star Atlas</h2>
              <p className="text-lg text-muted-foreground mb-6">
                The ultimate space exploration MMO where you can build fleets, explore galaxies, 
                and earn real rewards through strategic gameplay on the Solana blockchain.
              </p>
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-neon-green/20 text-neon-green">⭐ 4.8 Rating</Badge>
                <Badge className="bg-neon-purple/20 text-neon-purple">👥 50K+ Players</Badge>
                <Badge className="bg-neon-cyan/20 text-neon-cyan">🌐 Web Based</Badge>
              </div>
              <div className="flex gap-4">
                <Button 
                  onClick={() => window.open('https://play.staratlas.com', '_blank')}
                  className="cyber-button"
                >
                  🚀 PLAY NOW
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
                src="/lovable-uploads/25b4f405-8edd-4c52-9b77-0d270d1b6c90.png" 
                alt="Star Atlas"
                className="w-full rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg" />
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
