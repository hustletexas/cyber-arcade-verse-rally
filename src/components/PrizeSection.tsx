
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const PrizeSection = () => {
  const prizes = [
    {
      id: 'gaming-pc',
      name: 'Gaming PC RTX 4090',
      value: '$3,000',
      requirement: '10,000 CCTR',
      image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop',
      rarity: 'Legendary'
    },
    {
      id: 'ps5',
      name: 'PlayStation 5',
      value: '$500',
      requirement: '5,000 CCTR',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&h=300&fit=crop',
      rarity: 'Epic'
    },
    {
      id: 'xbox',
      name: 'Xbox Series X',
      value: '$500',
      requirement: '5,000 CCTR',
      image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=400&h=300&fit=crop',
      rarity: 'Epic'
    },
    {
      id: 'vr-headset',
      name: 'Meta Quest 3',
      value: '$800',
      requirement: '7,500 CCTR',
      image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=300&fit=crop',
      rarity: 'Epic'
    },
    {
      id: 'gaming-chair',
      name: 'Gaming Chair',
      value: '$400',
      requirement: '3,000 CCTR',
      image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=300&fit=crop',
      rarity: 'Rare'
    },
    {
      id: 'mechanical-keyboard',
      name: 'Mechanical Keyboard',
      value: '$200',
      requirement: '1,500 CCTR',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop',
      rarity: 'Common'
    }
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'bg-yellow-500';
      case 'Epic': return 'bg-purple-500';
      case 'Rare': return 'bg-blue-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
          🏆 PRIZE POOL
          <Badge className="bg-neon-green text-black animate-pulse">LIVE REWARDS</Badge>
        </CardTitle>
        <p className="text-muted-foreground">
          Earn CCTR tokens and redeem them for amazing prizes!
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prizes.map((prize) => (
            <Card key={prize.id} className="vending-machine hover:scale-105 transition-transform">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 overflow-hidden">
                  <img 
                    src={prize.image} 
                    alt={prize.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-display text-lg font-bold text-neon-pink mb-2">
                    {prize.name}
                  </h3>
                  <Badge className={`${getRarityColor(prize.rarity)} text-white mb-3`}>
                    {prize.rarity}
                  </Badge>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-neon-green">{prize.value}</p>
                    <p className="text-sm text-neon-cyan">Cost: {prize.requirement}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
