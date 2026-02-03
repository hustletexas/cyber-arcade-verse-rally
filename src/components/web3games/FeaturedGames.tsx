
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GameCard } from './GameCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    playUrl: 'https://www.wilderworld.com/',
    downloadUrl: 'https://store.epicgames.com/en-US/p/wilder-world-wilder-world-alpha-b4ccf8',
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
    downloadUrl: 'https://store.steampowered.com/app/2103140/Magicraft/',
    isWebBased: false,
    rewards: ['MCRT', 'Hero NFTs', 'Spell NFTs'],
    players: '30K+',
    rating: 4.5
  },
  {
    id: 'gods-unchained',
    name: 'Gods Unchained',
    category: 'Trading Card Game',
    blockchain: 'Ethereum',
    image: '/lovable-uploads/9874a5ea-c92e-439a-93c9-d12a486f9dae.png',
    description: 'Free-to-play tactical card game with true ownership of digital assets',
    playUrl: 'https://godsunchained.com/play',
    downloadUrl: null,
    isWebBased: true,
    rewards: ['GODS', 'Card NFTs', 'Packs'],
    players: '400K+',
    rating: 4.6
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
    id: 'pudgy-party',
    name: 'Pudgy Party',
    category: 'Party Game',
    blockchain: 'Ethereum',
    image: '/lovable-uploads/8bd58f1c-faa8-4f92-b4e2-20ee5ee8a6fe.png',
    description: 'Fun multiplayer party games featuring the beloved Pudgy Penguins NFT collection',
    playUrl: 'https://pudgyparty.com/play',
    downloadUrl: null,
    isWebBased: true,
    rewards: ['FISH', 'Pudgy NFTs', 'Party Items'],
    players: '75K+',
    rating: 4.6
  },
  {
    id: 'arc8',
    name: 'Arc8',
    category: 'Mobile Arcade',
    blockchain: 'Polygon',
    image: '/lovable-uploads/1861aafc-236e-44ca-a286-768e7c5ddba0.png',
    description: 'Mobile gaming platform with skill-based tournaments and GMEE token rewards',
    playUrl: 'https://arc8.gamee.com/play',
    downloadUrl: 'https://arc8.gamee.com/download',
    isWebBased: false,
    rewards: ['GMEE', 'NFT Prizes', 'Leaderboard Rewards'],
    players: '200K+',
    rating: 4.5
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

const ps5Games = [
  {
    id: 'gta6',
    name: 'GTA 6',
    category: 'Open World Action',
    blockchain: 'N/A',
    image: '/images/games/gta6.webp',
    description: 'The highly anticipated next chapter in the legendary Grand Theft Auto series',
    playUrl: null,
    downloadUrl: 'https://www.rockstargames.com/VI',
    isWebBased: false,
    rewards: ['In-Game Currency', 'Exclusive Items'],
    players: 'Coming 2025',
    rating: 5.0
  },
  {
    id: 'undisputed-boxing',
    name: 'Undisputed Boxing',
    category: 'Sports / Fighting',
    blockchain: 'N/A',
    image: '/images/games/undisputed-boxing.webp',
    description: 'Step into the ring and become the undisputed champion in this realistic boxing simulation',
    playUrl: null,
    downloadUrl: 'https://store.steampowered.com/app/1424350/Undisputed/',
    isWebBased: false,
    rewards: ['Championship Belts', 'Fighter Unlocks', 'Career Mode'],
    players: '2M+',
    rating: 4.7
  },
  {
    id: 'ff7-rebirth',
    name: 'Final Fantasy VII Rebirth',
    category: 'RPG',
    blockchain: 'N/A',
    image: '/lovable-uploads/digital-horizon.png',
    description: 'Continue the epic journey in this stunning remake of the legendary JRPG',
    playUrl: null,
    downloadUrl: 'https://www.playstation.com/games/final-fantasy-vii-rebirth/',
    isWebBased: false,
    rewards: ['Trophies', 'Materia', 'Summons'],
    players: '5M+',
    rating: 4.8
  },
  {
    id: 'hogwarts-legacy',
    name: 'Hogwarts Legacy',
    category: 'Action RPG',
    blockchain: 'N/A',
    image: '/lovable-uploads/neon-matrix.png',
    description: 'Live your wizarding world fantasy in this immersive open-world RPG',
    playUrl: null,
    downloadUrl: 'https://www.hogwartslegacy.com/',
    isWebBased: false,
    rewards: ['Spells', 'Gear', 'Trophies'],
    players: '22M+',
    rating: 4.7
  }
];

const mobileGames = [
  {
    id: 'clash-royale',
    name: 'Clash Royale',
    category: 'Strategy',
    blockchain: 'N/A',
    image: '/lovable-uploads/neon-pulse.png',
    description: 'Real-time multiplayer battle game combining cards, strategy, and tower defense',
    playUrl: 'https://supercell.com/en/games/clashroyale/',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.supercell.clashroyale',
    isWebBased: false,
    rewards: ['Gems', 'Cards', 'Chests'],
    players: '500M+',
    rating: 4.5
  },
  {
    id: 'genshin-impact',
    name: 'Genshin Impact',
    category: 'Action RPG',
    blockchain: 'N/A',
    image: '/lovable-uploads/quantum-waves.png',
    description: 'Open-world action RPG with stunning anime visuals and gacha mechanics',
    playUrl: 'https://genshin.hoyoverse.com/',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.miHoYo.GenshinImpact',
    isWebBased: false,
    rewards: ['Primogems', 'Characters', 'Weapons'],
    players: '65M+',
    rating: 4.6
  },
  {
    id: 'pubg-mobile',
    name: 'PUBG Mobile',
    category: 'Battle Royale',
    blockchain: 'N/A',
    image: '/lovable-uploads/data-stream.png',
    description: 'The original battle royale experience optimized for mobile gaming',
    playUrl: null,
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.tencent.ig',
    isWebBased: false,
    rewards: ['UC', 'Skins', 'Crates'],
    players: '1B+',
    rating: 4.3
  },
  {
    id: 'cod-mobile',
    name: 'Call of Duty: Mobile',
    category: 'FPS',
    blockchain: 'N/A',
    image: '/lovable-uploads/electric-midnight.png',
    description: 'Console-quality FPS action with multiplayer, battle royale, and zombies',
    playUrl: null,
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.activision.callofduty.shooter',
    isWebBased: false,
    rewards: ['CP', 'Camos', 'Operators'],
    players: '650M+',
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
                className="w-full h-80 object-cover object-bottom rounded-lg shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games Tabs */}
      <Tabs defaultValue="web3" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-neon-purple/30 mb-6">
          <TabsTrigger 
            value="web3" 
            className="data-[state=active]:bg-neon-purple data-[state=active]:text-white font-bold"
          >
            🎯 WEB3 GAMES
          </TabsTrigger>
          <TabsTrigger 
            value="ps5" 
            className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black font-bold"
          >
            🎮 PS5 GAMES
          </TabsTrigger>
          <TabsTrigger 
            value="mobile" 
            className="data-[state=active]:bg-neon-pink data-[state=active]:text-white font-bold"
          >
            📱 MOBILE GAMES
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="web3">
          <h3 className="text-2xl font-bold text-neon-purple mb-6">🎯 TOP WEB3 GAMES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="ps5">
          <h3 className="text-2xl font-bold text-neon-cyan mb-6">🎮 TOP PS5 GAMES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ps5Games.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="mobile">
          <h3 className="text-2xl font-bold text-neon-pink mb-6">📱 TOP MOBILE GAMES</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mobileGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

    </div>
  );
};
