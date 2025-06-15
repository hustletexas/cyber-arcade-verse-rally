import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const mockNFTs = [
  {
    id: 1,
    name: "Cyber Punk Avatar #001",
    price: { cctr: 2500, sol: 1.2, usdc: 108 },
    image: "🤖",
    rarity: "Legendary",
    seller: "CyberCollector",
    description: "Rare cyberpunk avatar with neon implants and digital consciousness"
  },
  {
    id: 2,
    name: "Neon City Landscape",
    price: { cctr: 1800, sol: 0.9, usdc: 81 },
    image: "🌆",
    rarity: "Epic",
    seller: "DigitalArtist",
    description: "Stunning neon-lit cityscape from the future"
  },
  {
    id: 3,
    name: "Arcade Token #042",
    price: { cctr: 1500, sol: 0.75, usdc: 67 },
    image: "🪙",
    rarity: "Epic",
    seller: "TokenMaster",
    description: "Collectible arcade token with special gaming privileges"
  },
  {
    id: 4,
    name: "Digital Sword of Power",
    price: { cctr: 800, sol: 0.4, usdc: 36 },
    image: "⚔️",
    rarity: "Rare",
    seller: "WeaponForge",
    description: "Legendary sword that deals massive damage in tournaments"
  },
  {
    id: 5,
    name: "Cyber Pet Dragon",
    price: { cctr: 1200, sol: 0.6, usdc: 54 },
    image: "🐉",
    rarity: "Epic",
    seller: "PetBreeder",
    description: "Loyal digital companion with fire-breathing abilities"
  },
  {
    id: 6,
    name: "Hacker's Terminal",
    price: { cctr: 900, sol: 0.45, usdc: 40 },
    image: "💻",
    rarity: "Rare",
    seller: "TechGuru",
    description: "Advanced terminal for accessing the digital underground"
  },
  {
    id: 7,
    name: "Retro Future Ride",
    price: { cctr: 3500, sol: 1.75, usdc: 157 },
    image: "/lovable-uploads/1131ab8a-f1c5-43a1-bc8a-bbbe7f2f9fd1.png",
    rarity: "Legendary",
    seller: "CyberMotors",
    description: "Ultra-rare cyberpunk DeLorean in neon cityscape - the ultimate collector's ride"
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
          🛒 NFT MARKETPLACE
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
                  <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center">
                    {nft.image.startsWith('/') ? (
                      <img 
                        src={nft.image} 
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">{nft.image}</span>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-neon-cyan">{nft.name}</h3>
                      <Badge className={`${
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
