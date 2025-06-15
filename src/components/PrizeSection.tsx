
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const PrizeSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [processingPrize, setProcessingPrize] = useState<string | null>(null);

  const prizes = [
    {
      id: 'gaming-pc',
      name: 'Gaming PC RTX 4090',
      value: '$3,000',
      requirement: '10,000 CCTR',
      cctrCost: 10000,
      image: '/lovable-uploads/3fc5f3c0-2b28-4cff-acdc-7c3896ee635b.png',
    },
    {
      id: 'ps5',
      name: 'PlayStation 5',
      value: '$500',
      requirement: '5,000 CCTR',
      cctrCost: 5000,
      image: '/lovable-uploads/8820a165-f5a8-4d8a-b9d4-8dca31666e27.png',
    },
    {
      id: 'vr-headset',
      name: 'Meta Quest 3',
      value: '$400',
      requirement: '7,500 CCTR',
      cctrCost: 7500,
      image: '/lovable-uploads/5fbf2609-10c6-421a-a9dc-34513c43cea0.png',
    }
  ];

  const handleRedeemPrize = async (prize: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to redeem prizes",
        variant: "destructive",
      });
      return;
    }

    setProcessingPrize(prize.id);

    try {
      toast({
        title: "🎉 Prize Redemption Initiated",
        description: `Redeeming ${prize.name} for ${prize.cctrCost.toLocaleString()} $CCTR`,
      });

      // Simulate processing time
      setTimeout(() => {
        toast({
          title: "🏆 Prize Redeemed Successfully!",
          description: `Your ${prize.name} will be shipped within 5-7 business days`,
        });
        setProcessingPrize(null);
      }, 2000);

    } catch (error) {
      toast({
        title: "Redemption Failed",
        description: "Unable to process prize redemption",
        variant: "destructive",
      });
      setProcessingPrize(null);
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
                <div className="p-6 text-center space-y-4">
                  <h3 className="font-display text-lg font-bold text-neon-pink mb-2">
                    {prize.name}
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xl font-bold text-neon-green">{prize.value}</p>
                    <p className="text-sm text-neon-cyan font-bold">
                      Cost: {prize.cctrCost.toLocaleString()} $CCTR
                    </p>
                  </div>

                  <Button
                    onClick={() => handleRedeemPrize(prize)}
                    disabled={processingPrize === prize.id || !user}
                    className="cyber-button w-full"
                  >
                    {processingPrize === prize.id ? (
                      "⏳ PROCESSING..."
                    ) : !user ? (
                      "🔐 LOGIN TO REDEEM"
                    ) : (
                      "🎁 REDEEM PRIZE"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CCTR Token Info */}
        <div className="mt-8">
          <Card className="holographic p-6">
            <div className="text-center">
              <h4 className="font-bold text-neon-green mb-2 text-lg">💎 $CCTR Tokens</h4>
              <p className="text-muted-foreground mb-2">
                Earn CCTR tokens by playing games, participating in tournaments, and engaging with the community
              </p>
              <p className="text-sm text-neon-cyan">
                The more you play, the more you earn! Redeem your tokens for exclusive prizes.
              </p>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
