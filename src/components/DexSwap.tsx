
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DexSwap = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-display font-bold text-neon-cyan text-center">
        💱 DEX SWAP
      </h2>
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="text-neon-purple">Token Exchange</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Swap tokens and manage your cryptocurrency portfolio.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
