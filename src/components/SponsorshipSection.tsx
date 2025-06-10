
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const SponsorshipSection = () => {
  const sponsors = [
    {
      name: 'TechNova Gaming',
      logo: '🚀',
      tier: 'PLATINUM',
      description: 'Premium Gaming Hardware',
      website: 'technova.com'
    },
    {
      name: 'CryptoVault',
      logo: '💎',
      tier: 'GOLD',
      description: 'Web3 Infrastructure',
      website: 'cryptovault.io'
    },
    {
      name: 'NeonSoft Studios',
      logo: '🎨',
      tier: 'SILVER',
      description: 'Game Development',
      website: 'neonsoft.dev'
    },
    {
      name: 'PixelForge',
      logo: '⚡',
      tier: 'BRONZE',
      description: 'Digital Assets',
      website: 'pixelforge.gg'
    }
  ];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'from-gray-300 to-gray-500';
      case 'GOLD': return 'from-yellow-400 to-orange-500';
      case 'SILVER': return 'from-gray-400 to-gray-600';
      case 'BRONZE': return 'from-orange-600 to-yellow-700';
      default: return 'from-neon-cyan to-neon-purple';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'PLATINUM': return 'bg-gray-400 text-black';
      case 'GOLD': return 'bg-yellow-400 text-black';
      case 'SILVER': return 'bg-gray-300 text-black';
      case 'BRONZE': return 'bg-orange-500 text-black';
      default: return 'bg-neon-cyan text-black';
    }
  };

  return (
    <div className="mb-8 md:mb-12">
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl md:text-2xl text-neon-cyan flex items-center gap-3">
            🤝 OUR AMAZING SPONSORS
            <Badge className="bg-neon-green text-black">PARTNERS</Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Thanks to our incredible sponsors who make these prizes and tournaments possible!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
            {sponsors.map((sponsor) => (
              <Card key={sponsor.name} className="vending-machine p-4 md:p-6 hover:scale-105 transition-all duration-300 text-center">
                <div className="space-y-3">
                  <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto bg-gradient-to-br ${getTierColor(sponsor.tier)} rounded-lg flex items-center justify-center mb-3 animate-float`}>
                    <span className="text-xl md:text-2xl">{sponsor.logo}</span>
                  </div>
                  <Badge className={`${getTierBadgeColor(sponsor.tier)} text-xs`}>
                    {sponsor.tier}
                  </Badge>
                  <h4 className="font-display text-sm md:text-base font-bold text-neon-cyan">
                    {sponsor.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{sponsor.description}</p>
                  <div className="text-xs text-neon-purple font-mono">{sponsor.website}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Card className="vending-machine p-4 md:p-6">
              <h4 className="font-display text-lg md:text-xl font-bold text-neon-pink mb-4">
                💼 BECOME A SPONSOR
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Join our growing ecosystem and reach thousands of passionate gamers!
              </p>
              <div className="flex flex-col md:flex-row gap-3 justify-center">
                <Button className="cyber-button">
                  📧 CONTACT US
                </Button>
                <Button variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black">
                  📊 SPONSOR PACKAGES
                </Button>
              </div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
