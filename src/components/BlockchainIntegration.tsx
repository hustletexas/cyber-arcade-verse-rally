
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const BlockchainIntegration = () => {
  const { toast } = useToast();

  const openMagicEden = () => {
    window.open('https://magiceden.io/marketplace/cyber_city_arcade', '_blank');
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-purple flex items-center gap-3">
          ⛓️ BLOCKCHAIN INTEGRATION
          <Badge className="bg-neon-green text-black">STELLAR POWERED</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Magic Eden Integration */}
        <Card className="vending-machine p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-neon-cyan mb-2">
                Magic Eden Marketplace
              </h3>
              <p className="text-muted-foreground">
                Buy and sell Cyber City Arcade NFTs on Magic Eden
              </p>
            </div>
            <Button onClick={openMagicEden} className="cyber-button">
              🪄 OPEN MAGIC EDEN
            </Button>
          </div>
        </Card>

        {/* Stellar Network Info */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="holographic p-4">
            <h4 className="text-neon-green font-bold">NETWORK</h4>
            <p className="text-sm">Stellar Mainnet</p>
          </div>
          <div className="holographic p-4">
            <h4 className="text-neon-cyan font-bold">TOKEN</h4>
            <p className="text-sm">$CCTR</p>
          </div>
          <div className="holographic p-4">
            <h4 className="text-neon-pink font-bold">SUPPLY</h4>
            <p className="text-sm">1M CCTR</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
