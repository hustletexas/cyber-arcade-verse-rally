
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SolanaTournamentManager } from './SolanaTournamentManager';

export const SolanaTournamentSystem = () => {
  return (
    <div className="space-y-6">
      {/* Quick Status */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🔗 Solana Tournament Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            Solana tournament system coming soon...
          </p>
        </CardContent>
      </Card>

      {/* Tournament Manager */}
      <SolanaTournamentManager />
    </div>
  );
};
