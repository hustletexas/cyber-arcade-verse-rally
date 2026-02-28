
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard } from './GameCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

const featuredGames = [
  {
    id: 'illuvium',
    name: 'Illuvium',
    category: 'Open World RPG',
    blockchain: 'Ethereum',
    image: '/images/games/illuvium.webp',
    description: 'An open-world RPG adventure where you hunt and capture creatures called Illuvials',
    playUrl: 'https://illuvium.io',
    downloadUrl: 'https://illuvium.io/download',
    isWebBased: false,
    rewards: ['ILV', 'Illuvial NFTs', 'Land NFTs'],
    players: '200K+',
    rating: 4.8
  },
  {
    id: 'star-atlas',
    name: 'Star Atlas',
    category: 'MMO Strategy',
    blockchain: 'Stellar',
    image: '/lovable-uploads/1070ae3c-2007-492b-ac52-1f15c99e05c1.png',
    description: 'Epic space exploration and combat MMO',
    playUrl: 'https://play.staratlas.com',
    downloadUrl: null,
    isWebBased: true,
    rewards: ['ATLAS', 'POLIS', 'Ship NFTs'],
    players: '50K+',
    rating: 4.8
  },
  {
    id: 'off-the-grid',
    name: 'Off The Grid',
    category: 'Battle Royale',
    blockchain: 'Avalanche',
    image: '/lovable-uploads/84cd658e-c26a-4a33-bf25-20b989817f49.png',
    description: 'Cyberpunk battle royale with player-driven economy and NFT integration',
    playUrl: 'https://gameoffthegrid.com/',
    downloadUrl: 'https://store.steampowered.com/app/3659280/Off_The_Grid/',
    isWebBased: false,
    rewards: ['OTG', 'Weapon NFTs', 'Character NFTs'],
    players: '150K+',
    rating: 4.7
  },
  {
    id: 'phantom-galaxies',
    name: 'Phantom Galaxies',
    category: 'Space Combat',
    blockchain: 'Polygon',
    image: '/lovable-uploads/2a4e495c-34d0-4529-9104-9e9190a0cd53.png',
    description: 'Epic space combat MMO with mechs, starfighters, and planetary conquest',
    playUrl: 'https://phantomgalaxies.com/play',
    downloadUrl: 'https://phantomgalaxies.com/download',
    isWebBased: false,
    rewards: ['ASTRAFER', 'Mech NFTs', 'Planet NFTs'],
    players: '120K+',
    rating: 4.8
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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline"
                      className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                    >
                      📤 Share
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-black/90 border-neon-cyan/30 backdrop-blur-md">
                    {(() => {
                      const shareUrl = encodeURIComponent('https://cyberbrawl.io');
                      const shareText = encodeURIComponent('Check out CyberBrawl.io - an action-packed Web3 gaming experience!');
                      const shareTitle = encodeURIComponent('CyberBrawl.io');
                      return (
                        <>
                          <DropdownMenuItem className="text-white hover:bg-neon-cyan/20 cursor-pointer" onClick={() => window.open(`https://x.com/intent/tweet?text=${shareText}&url=${shareUrl}`, '_blank')}>
                            𝕏 Share on X
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-neon-cyan/20 cursor-pointer" onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank')}>
                            📘 Share on Facebook
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-neon-cyan/20 cursor-pointer" onClick={() => window.open(`https://wa.me/?text=${shareText}%20${shareUrl}`, '_blank')}>
                            💬 Share on WhatsApp
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-neon-cyan/20 cursor-pointer" onClick={() => window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, '_blank')}>
                            ✈️ Share on Telegram
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-neon-cyan/20 cursor-pointer" onClick={() => window.open(`https://www.reddit.com/submit?url=${shareUrl}&title=${shareTitle}`, '_blank')}>
                            🔴 Share on Reddit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-neon-cyan/20 cursor-pointer" onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank')}>
                            💼 Share on LinkedIn
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-white hover:bg-neon-cyan/20 cursor-pointer" onClick={async () => {
                            try {
                              await navigator.clipboard.writeText('https://cyberbrawl.io');
                              toast.success('Link copied to clipboard!');
                            } catch {
                              toast.error('Unable to copy link');
                            }
                          }}>
                            📋 Copy Link
                          </DropdownMenuItem>
                        </>
                      );
                    })()}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="relative">
              <img 
                src="/lovable-uploads/4b312226-9c9f-4a1c-9c6f-16be0f7b09b8.png" 
                alt="CyberBrawl.io"
                className="w-full h-80 object-cover object-bottom rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WEB3 Games Only */}
      <h3 className="text-2xl font-bold text-neon-purple mb-6">🎯 TOP WEB3 GAMES</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
};
