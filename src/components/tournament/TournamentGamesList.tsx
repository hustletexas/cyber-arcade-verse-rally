import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameCard } from '@/components/web3games/GameCard';

const ps5Games = [
  {
    id: 'gta6',
    name: 'GTA 6',
    category: 'Open World Action',
    blockchain: 'N/A',
    image: '/images/games/gta6.webp',
    description: 'The highly anticipated next chapter in the legendary Grand Theft Auto series',
    playUrl: null as string | null,
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
    playUrl: null as string | null,
    downloadUrl: 'https://store.steampowered.com/app/1424350/Undisputed/',
    isWebBased: false,
    rewards: ['Championship Belts', 'Fighter Unlocks', 'Career Mode'],
    players: '2M+',
    rating: 4.7
  },
  {
    id: 'tekken-8',
    name: 'Tekken 8',
    category: 'Fighting',
    blockchain: 'N/A',
    image: '/images/games/tekken-8.webp',
    description: 'The legendary fighting game returns with next-gen graphics and intense combat',
    playUrl: null as string | null,
    downloadUrl: 'https://www.bandainamcoent.com/games/tekken-8',
    isWebBased: false,
    rewards: ['Character Unlocks', 'Customization', 'Ranked Rewards'],
    players: '10M+',
    rating: 4.9
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    category: 'Battle Royale',
    blockchain: 'N/A',
    image: '/images/games/fortnite.webp',
    description: 'Drop in and battle to be the last one standing in the iconic free-to-play battle royale',
    playUrl: 'https://www.fortnite.com/',
    downloadUrl: 'https://www.fortnite.com/download',
    isWebBased: false,
    rewards: ['V-Bucks', 'Battle Pass', 'Skins'],
    players: '500M+',
    rating: 4.8
  }
];

const mobileGames = [
  {
    id: 'brawl-stars',
    name: 'Brawl Stars',
    category: 'Action',
    blockchain: 'N/A',
    image: '/images/games/brawl-stars.webp',
    description: 'Fast-paced 3v3 multiplayer and battle royale made for mobile with tons of unique brawlers',
    playUrl: 'https://supercell.com/en/games/brawlstars/',
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.supercell.brawlstars',
    isWebBased: false,
    rewards: ['Gems', 'Brawlers', 'Star Points'],
    players: '500M+',
    rating: 4.6
  },
  {
    id: 'genshin-impact',
    name: 'Genshin Impact',
    category: 'Action RPG',
    blockchain: 'N/A',
    image: '/images/games/genshin-impact.webp',
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
    image: '/images/games/pubg-mobile.webp',
    description: 'The original battle royale experience optimized for mobile gaming',
    playUrl: null as string | null,
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
    image: '/images/games/cod-mobile.webp',
    description: 'Console-quality FPS action with multiplayer, battle royale, and zombies',
    playUrl: null as string | null,
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.activision.callofduty.shooter',
    isWebBased: false,
    rewards: ['CP', 'Camos', 'Operators'],
    players: '650M+',
    rating: 4.4
  },
  {
    id: 'arc8',
    name: 'Arc8',
    category: 'Mobile Arcade',
    blockchain: 'N/A',
    image: '/lovable-uploads/1861aafc-236e-44ca-a286-768e7c5ddba0.png',
    description: 'Mobile gaming platform with skill-based tournaments and GMEE token rewards',
    playUrl: null as string | null,
    downloadUrl: 'https://arc8.gamee.com/download',
    isWebBased: false,
    rewards: ['GMEE', 'NFT Prizes', 'Leaderboard Rewards'],
    players: '200K+',
    rating: 4.5
  },
  {
    id: 'magiccraft',
    name: 'MagicCraft',
    category: 'MOBA Strategy',
    blockchain: 'N/A',
    image: '/lovable-uploads/424982ae-ffcd-4769-8e5c-c63cd572d347.png',
    description: 'Epic MOBA with magical battles and strategic gameplay',
    playUrl: null as string | null,
    downloadUrl: 'https://store.steampowered.com/app/2103140/Magicraft/',
    isWebBased: false,
    rewards: ['MCRT', 'Hero NFTs', 'Spell NFTs'],
    players: '30K+',
    rating: 4.5
  },
  {
    id: 'pudgy-party',
    name: 'Pudgy Party',
    category: 'Party Game',
    blockchain: 'N/A',
    image: '/lovable-uploads/8bd58f1c-faa8-4f92-b4e2-20ee5ee8a6fe.png',
    description: 'Fun multiplayer party games featuring the beloved Pudgy Penguins NFT collection',
    playUrl: 'https://pudgypenguins.com/pudgy-party' as string | null,
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.pudgypenguins.party',
    isWebBased: false,
    rewards: ['FISH', 'Pudgy NFTs', 'Party Items'],
    players: '75K+',
    rating: 4.6
  },
  {
    id: 'asphalt-legends',
    name: 'Asphalt Legends',
    category: 'Racing',
    blockchain: 'N/A',
    image: '/images/games/asphalt-legends.webp',
    description: 'High-octane arcade racing with licensed supercars, stunning graphics, and competitive multiplayer',
    playUrl: null as string | null,
    downloadUrl: 'https://play.google.com/store/apps/details?id=com.gameloft.android.ANMP.GloftA9HM',
    isWebBased: false,
    rewards: ['Credits', 'Blueprints', 'Tokens'],
    players: '300M+',
    rating: 4.5
  }
];

export const TournamentGamesList: React.FC = () => {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="ps5" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-border mb-4">
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
