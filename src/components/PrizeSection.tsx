
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const PrizeSection = () => {
  const prizes = [
    {
      id: 'grand-prize',
      title: 'GRAND PRIZE',
      item: 'Gaming PC Setup',
      value: '$3,000',
      description: 'RTX 4080 + Intel i7 + 32GB RAM + 4K Monitor',
      icon: '🖥️',
      color: 'from-yellow-400 to-orange-500',
      requirement: 'Monthly Tournament Winner'
    },
    {
      id: 'second-prize',
      title: 'PREMIUM PRIZE',
      item: 'PlayStation 5',
      value: '$500',
      description: 'Latest PS5 Console + Exclusive Games Bundle',
      icon: '🎮',
      color: 'from-neon-pink to-neon-purple',
      requirement: 'Weekly High Score Leader'
    },
    {
      id: 'third-prize',
      title: 'TECH PRIZE',
      item: 'Gaming Headset',
      value: '$200',
      description: 'SteelSeries Arctis Pro Wireless',
      icon: '🎧',
      color: 'from-neon-cyan to-neon-green',
      requirement: 'Daily Challenge Winner'
    },
    {
      id: 'participation',
      title: 'PARTICIPATION',
      item: 'Digital Rewards',
      value: '$CCTR',
      description: 'Tokens, NFTs, and Exclusive Badges',
      icon: '🏅',
      color: 'from-neon-green to-neon-cyan',
      requirement: 'Play & Earn'
    }
  ];

  return (
    <div className="mb-8 md:mb-12">
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl md:text-2xl text-neon-cyan flex items-center gap-3">
            🏆 AMAZING PRIZES TO WIN
            <Badge className="bg-neon-pink text-black animate-pulse">REAL PRIZES</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Compete in tournaments and daily challenges to win incredible prizes!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {prizes.map((prize) => (
              <Card key={prize.id} className="holographic p-4 md:p-6 hover:scale-105 transition-all duration-300">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className={`w-16 h-20 md:w-20 md:h-24 mx-auto bg-gradient-to-br ${prize.color} rounded-lg flex items-center justify-center mb-4 animate-float`}>
                      <span className="text-2xl md:text-3xl">{prize.icon}</span>
                    </div>
                    <Badge className="bg-neon-purple text-black text-xs">{prize.title}</Badge>
                    <h3 className="font-display text-lg md:text-xl font-bold text-neon-cyan mt-2">{prize.item}</h3>
                    <p className="text-lg md:text-xl font-bold text-neon-green">{prize.value}</p>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="text-xs md:text-sm text-muted-foreground">{prize.description}</p>
                    <div className="text-xs md:text-sm text-neon-pink font-bold">{prize.requirement}</div>
                  </div>

                  <Button 
                    className="w-full cyber-button text-xs md:text-sm"
                    variant="outline"
                  >
                    📋 VIEW RULES
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 md:mt-8 text-center">
            <Card className="vending-machine p-4 md:p-6">
              <h4 className="font-display text-lg md:text-xl font-bold text-neon-cyan mb-4">
                🎯 HOW TO WIN PRIZES
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="text-neon-pink font-bold">STEP 1</div>
                  <div>Play games and compete in tournaments</div>
                </div>
                <div className="space-y-2">
                  <div className="text-neon-cyan font-bold">STEP 2</div>
                  <div>Climb the leaderboards and earn high scores</div>
                </div>
                <div className="space-y-2">
                  <div className="text-neon-green font-bold">STEP 3</div>
                  <div>Win tournaments and claim your prizes!</div>
                </div>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
