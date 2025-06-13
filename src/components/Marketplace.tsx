
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Marketplace = () => {
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'paypal'>('crypto');

  const nftItems = [
    {
      id: 'legendary-sword',
      name: 'Cyber Legendary Sword',
      price: { crypto: '2.5 SOL', fiat: '$87.50' },
      rarity: 'Legendary',
      seller: 'CyberKnight99',
      image: '⚔️'
    },
    {
      id: 'neon-armor',
      name: 'Neon Battle Armor',
      price: { crypto: '1.8 SOL', fiat: '$63.00' },
      rarity: 'Epic',
      seller: 'ArcadeWarrior',
      image: '🛡️'
    },
    {
      id: 'holographic-helmet',
      name: 'Holographic Helmet',
      price: { crypto: '0.9 SOL', fiat: '$31.50' },
      rarity: 'Rare',
      seller: 'NeonDreamer',
      image: '⛑️'
    }
  ];

  const badges = [
    {
      id: 'champion-badge',
      name: 'Tournament Champion',
      price: { crypto: '500 $CCTR', fiat: '$22.50' },
      description: 'Exclusive champion recognition',
      image: '🏆'
    },
    {
      id: 'speedrun-badge',
      name: 'Speedrun Master',
      price: { crypto: '300 $CCTR', fiat: '$13.50' },
      description: 'For the fastest players',
      image: '⚡'
    },
    {
      id: 'combo-badge',
      name: 'Combo King',
      price: { crypto: '200 $CCTR', fiat: '$9.00' },
      description: 'Master of combinations',
      image: '🎯'
    }
  ];

  const powerUps = [
    {
      id: 'speed-boost',
      name: 'Speed Boost Pack',
      price: { crypto: '50 $CCTR', fiat: '$2.25' },
      quantity: 10,
      description: '10x Speed Boost consumables',
      image: '🚀'
    },
    {
      id: 'shield-pack',
      name: 'Shield Protection',
      price: { crypto: '75 $CCTR', fiat: '$3.38' },
      quantity: 5,
      description: '5x Shield consumables',
      image: '🛡️'
    },
    {
      id: 'multiplier-pack',
      name: 'Score Multiplier',
      price: { crypto: '100 $CCTR', fiat: '$4.50' },
      quantity: 3,
      description: '3x Score multiplier consumables',
      image: '✨'
    }
  ];

  const buyItem = (itemId: string, price: string) => {
    console.log(`Purchasing ${itemId} for ${price} via ${paymentMethod}`);
  };

  return (
    <div className="space-y-6">
      {/* Marketplace Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
            🛒 CYBER MARKETPLACE
            <Badge className="bg-neon-green text-black animate-neon-flicker">LIVE</Badge>
          </CardTitle>
          <div className="flex gap-4 mt-4">
            <Button
              onClick={() => setPaymentMethod('crypto')}
              className={`cyber-button ${paymentMethod === 'crypto' ? 'bg-neon-green' : ''}`}
            >
              🪙 CRYPTO PAYMENT
            </Button>
            <Button
              onClick={() => setPaymentMethod('paypal')}
              className={`cyber-button ${paymentMethod === 'paypal' ? 'bg-neon-green' : ''}`}
            >
              💳 PAYPAL PAYMENT
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Marketplace Tabs */}
      <Tabs defaultValue="nfts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 arcade-frame p-2">
          <TabsTrigger value="nfts" className="cyber-button">🎨 NFT ITEMS</TabsTrigger>
          <TabsTrigger value="badges" className="cyber-button">🏆 BADGES</TabsTrigger>
          <TabsTrigger value="powerups" className="cyber-button">⚡ POWER-UPS</TabsTrigger>
          <TabsTrigger value="passes" className="cyber-button">🎟️ PASSES</TabsTrigger>
        </TabsList>

        <TabsContent value="nfts" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nftItems.map((item) => (
              <Card key={item.id} className="vending-machine hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{item.image}</div>
                    <h3 className="font-display text-lg font-bold text-neon-pink">{item.name}</h3>
                    <Badge className="bg-neon-purple text-black">{item.rarity}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-neon-green">
                        {paymentMethod === 'crypto' ? item.price.crypto : item.price.fiat}
                      </p>
                    </div>
                    
                    <div className="text-sm text-center">
                      <p className="text-muted-foreground">Seller: {item.seller}</p>
                    </div>
                    
                    <Button 
                      onClick={() => buyItem(item.id, paymentMethod === 'crypto' ? item.price.crypto : item.price.fiat)}
                      className="w-full cyber-button"
                    >
                      {paymentMethod === 'crypto' ? '🪙 BUY WITH CRYPTO' : '💳 BUY WITH PAYPAL'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {badges.map((badge) => (
              <Card key={badge.id} className="holographic hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{badge.image}</div>
                    <h3 className="font-display text-lg font-bold text-neon-cyan">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-xl font-bold text-neon-purple">
                        {paymentMethod === 'crypto' ? badge.price.crypto : badge.price.fiat}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => buyItem(badge.id, paymentMethod === 'crypto' ? badge.price.crypto : badge.price.fiat)}
                      className="w-full cyber-button"
                    >
                      🏆 PURCHASE BADGE
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="powerups" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {powerUps.map((powerUp) => (
              <Card key={powerUp.id} className="arcade-frame hover:scale-105 transition-transform">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-6xl mb-2">{powerUp.image}</div>
                    <h3 className="font-display text-lg font-bold text-neon-green">{powerUp.name}</h3>
                    <p className="text-sm text-muted-foreground">{powerUp.description}</p>
                    <Badge className="bg-neon-cyan text-black mt-2">
                      Qty: {powerUp.quantity}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="text-center">
                      <p className="text-xl font-bold text-neon-pink">
                        {paymentMethod === 'crypto' ? powerUp.price.crypto : powerUp.price.fiat}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => buyItem(powerUp.id, paymentMethod === 'crypto' ? powerUp.price.crypto : powerUp.price.fiat)}
                      className="w-full cyber-button"
                    >
                      ⚡ BUY POWER-UP
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="passes" className="space-y-6 mt-6">
          <div className="text-center">
            <Card className="holographic p-8 max-w-md mx-auto">
              <h3 className="font-display text-xl text-neon-purple mb-4">🎟️ Tournament Passes</h3>
              <p className="text-muted-foreground mb-4">
                Access the Tournament section to view and purchase NFT passes
              </p>
              <Button className="cyber-button">
                🏆 GO TO TOURNAMENTS
              </Button>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
