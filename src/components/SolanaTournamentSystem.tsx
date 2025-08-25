
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SolanaVotingDAO } from './SolanaVotingDAO';

export const SolanaTournamentSystem = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan flex items-center gap-3">
            🔗 Solana DAO Portal
            <Badge className="bg-neon-purple text-white">BLOCKCHAIN POWERED</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            Vote on proposals that shape the future of Cyber City Arcade using CCTR tokens
          </p>
        </CardContent>
      </Card>

      {/* DAO Content */}
      <SolanaVotingDAO />
    </div>
  );
};
