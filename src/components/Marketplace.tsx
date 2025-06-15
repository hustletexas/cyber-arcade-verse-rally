
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const mockNFTs = [
  {
    id: 1,
    name: "Cyber City Arcade Cabinet #001",
    price: { cctr: 2500, sol: 1.2, usdc: 108 },
    image: "🕹️",
    rarity: "Legendary",
    seller: "CyberArcade",
    description: "The legendary first arcade cabinet from Cyber City, featuring neon-lit retro gaming with quantum processors"
  },
  {
    id: 2,
    name: "Neon City Skyline #042",
    price: { cctr: 1800, sol: 0.9, usdc: 81 },
    image: "🌆",
    rarity: "Epic",
    seller: "CityBuilder",
    description: "Stunning cyberpunk cityscape with holographic billboards and flying vehicles from the Cyber City universe"
  },
  {
    id: 3,
    name: "Digital Warrior Avatar #099",
    price: { cctr: 1500, sol: 0.75, usdc: 67 },
    image: "🤖",
    rarity: "Epic",
    seller: "AvatarForge",
    description: "Elite cyber warrior avatar with advanced neural implants and plasma weapons from Cyber City battles"
  },
  {
    id: 4,
    name: "Arcade Token Master #007",
    price: { cctr: 800, sol: 0.4, usdc: 36 },
    image: "🪙",
    rarity: "Rare",
    seller: "TokenVault",
    description: "Rare collectible arcade token with embedded smart contracts and bonus gaming privileges"
  },
  {
    id: 5,
    name: "Cyber Pet Dragon #123",
    price: { cctr: 1200, sol: 0.6, usdc: 54 },
    image: "🐉",
    rarity: "Epic",
    seller: "DigitalPets",
    description: "Loyal cyber dragon companion with fire-breathing abilities and blockchain DNA from Cyber City labs"
  },
  {
    id: 6,
    name: "Hacker Terminal #056",
    price: { cctr: 900, sol: 0.45, usdc: 40 },
    image: "💻",
    rarity: "Rare",
    seller: "TechMaster",
    description: "Advanced hacking terminal with quantum encryption and access to Cyber City's digital underground"
  },
  {
    id: 7,
    name: "Neon Sword of Power",
    price: { cctr: 3000, sol: 1.5, usdc: 135 },
    image: "⚔️",
    rarity: "Mythic",
    seller: "WeaponForge",
    description: "Legendary plasma sword forged in the digital foundries of Cyber City, deals 1000+ damage in tournaments"
  },
  {
    id: 8,
    name: "Cyber City Badge #001",
    price: { cctr: 600, sol: 0.3, usdc: 27 },
    image: "🏆",
    rarity: "Rare",
    seller: "BadgeCollector",
    description: "Official Cyber City Arcade achievement badge, proves completion of the legendary Ghost in the Machine quest"
  },
  {
    id: 9,
    name: "Holographic Cube #333",
    price: { cctr: 1100, sol: 0.55, usdc: 49 },
    image: "📦",
    rarity: "Epic",
    seller: "HoloTech",
    description: "Mysterious holographic data cube containing encrypted memories from the original Cyber City founders"
  },
  {
    id: 10,
    name: "Arcade Master Key #001",
    price: { cctr: 4500, sol: 2.2, usdc: 198 },
    image: "🗝️",
    rarity: "Mythic",
    seller: "KeyKeeper",
    description: "The ultimate master key that unlocks all arcade cabinets in Cyber City and grants access to hidden game modes"
  },
  {
    id: 11,
    name: "Cyber Helmet #088",
    price: { cctr: 700, sol: 0.35, usdc: 31 },
    image: "⛑️",
    rarity: "Rare",
    seller: "GearCraft",
    description: "Advanced neural interface helmet with AR display and direct brain-to-game connection technology"
  },
  {
    id: 12,
    name: "Digital Phoenix #005",
    price: { cctr: 2200, sol: 1.1, usdc: 99 },
    image: "🔥",
    rarity: "Legendary",
    seller: "MythicBeasts",
    description: "Rare digital phoenix that respawns players instantly in tournaments and provides +50% CCTR rewards"
  }
];

export const Marketplace = () => {
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState<'cctr' | 'sol' | 'usdc'>('cctr');
  const [filter, setFilter] = useState('all');

  const handlePurchase = (nft: any) => {
    const price = nft.price[selectedCurrency];
    const currencySymbol = selectedCurrency === 'cctr' ? '$CCTR' : selectedCurrency === 'sol' ? 'SOL' : 'USDC';
    
    toast({
      title: "🛒 Purchase Initiated",
      description: `Buying ${nft.name} for ${price} ${currencySymbol}`,
    });

    setTimeout(() => {
      toast({
        title: "✅ Purchase Successful!",
        description: `${nft.name} has been added to your wallet`,
      });
    }, 2000);
  };

  const connectPlatform = (platform: string) => {
    toast({
      title: `${platform} Connected!`,
      description: `Successfully connected to ${platform} marketplace`,
    });
  };

  const filteredNFTs = filter === 'all' ? mockNFTs : mockNFTs.filter(nft => 
    nft.rarity.toLowerCase() === filter.toLowerCase()
  );

  const getCurrencySymbol = () => {
    switch (selectedCurrency) {
      case 'cctr': return '$CCTR';
      case 'sol': return 'SOL';
      case 'usdc': return 'USDC';
      default: return '$CCTR';
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-pink flex items-center gap-3">
          🛒 CYBER CITY ARCADE NFT MARKETPLACE
          <Badge className="bg-neon-cyan text-black">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Platform Connections */}
          <Card className="holographic p-6">
            <h3 className="font-bold text-neon-cyan mb-4">🔗 Platform Connections</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                onClick={() => connectPlatform('Magic Eden')}
                className="cyber-button flex items-center gap-2"
              >
                🪄 Magic Eden
              </Button>
              <Button 
                onClick={() => connectPlatform('OpenSea')}
                className="cyber-button flex items-center gap-2"
              >
                🌊 OpenSea
              </Button>
              <Button 
                onClick={() => connectPlatform('Tensor')}
                className="cyber-button flex items-center gap-2"
              >
                ⚡ Tensor
              </Button>
              <Button 
                onClick={() => connectPlatform('Solanart')}
                className="cyber-button flex items-center gap-2"
              >
                🎨 Solanart
              </Button>
            </div>
          </Card>

          {/* Filters and Currency Selection */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'cyber-button' : 'border-neon-cyan text-neon-cyan'}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'mythic' ? 'default' : 'outline'}
                  onClick={() => setFilter('mythic')}
                  className={filter === 'mythic' ? 'cyber-button' : 'border-neon-yellow text-neon-yellow'}
                >
                  Mythic
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'legendary' ? 'default' : 'outline'}
                  onClick={() => setFilter('legendary')}
                  className={filter === 'legendary' ? 'cyber-button' : 'border-neon-purple text-neon-purple'}
                >
                  Legendary
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'epic' ? 'default' : 'outline'}
                  onClick={() => setFilter('epic')}
                  className={filter === 'epic' ? 'cyber-button' : 'border-neon-pink text-neon-pink'}
                >
                  Epic
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'rare' ? 'default' : 'outline'}
                  onClick={() => setFilter('rare')}
                  className={filter === 'rare' ? 'cyber-button' : 'border-neon-green text-neon-green'}
                >
                  Rare
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neon-cyan font-bold">Pay with:</span>
              <Select value={selectedCurrency} onValueChange={(value: 'cctr' | 'sol' | 'usdc') => setSelectedCurrency(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cctr">💎 $CCTR</SelectItem>
                  <SelectItem value="sol">☀️ SOL</SelectItem>
                  <SelectItem value="usdc">💵 USDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* NFT Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNFTs.map((nft) => (
              <Card key={nft.id} className="vending-machine overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center text-6xl">
                    {nft.image}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-neon-cyan">{nft.name}</h3>
                      <Badge className={`${
                        nft.rarity === 'Mythic' ? 'bg-neon-yellow text-black' :
                        nft.rarity === 'Legendary' ? 'bg-neon-purple text-white' :
                        nft.rarity === 'Epic' ? 'bg-neon-pink text-black' :
                        'bg-neon-green text-black'
                      }`}>
                        {nft.rarity}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">{nft.description}</p>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-neon-purple">Seller: {nft.seller}</span>
                    </div>
                    
                    <div className="border-t border-neon-cyan/30 pt-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-neon-pink font-bold">
                          {nft.price[selectedCurrency]} {getCurrencySymbol()}
                        </span>
                      </div>
                      
                      <Button
                        onClick={() => handlePurchase(nft)}
                        className="w-full cyber-button"
                      >
                        🛒 BUY NOW
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
