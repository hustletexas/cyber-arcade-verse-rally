import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FeaturedGames } from './web3games/FeaturedGames';

export const Web3Gaming = () => {
  return (
    <div className="space-y-6">
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-neon-cyan text-center flex items-center justify-center gap-3">
            GAMING PORTAL <Badge className="bg-neon-purple text-white">BLOCKCHAIN POWERED</Badge>
          </CardTitle>
          <p className="text-center text-muted-foreground">Gateway to the gaming world</p>
        </CardHeader>
      </Card>

      <FeaturedGames />
    </div>
  );
};
