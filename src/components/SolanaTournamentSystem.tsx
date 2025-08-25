
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SolanaTournamentManager } from './SolanaTournamentManager';
import { SolanaVotingDAO } from './SolanaVotingDAO';

export const SolanaTournamentSystem = () => {
  const [activeTab, setActiveTab] = useState<'tournaments' | 'dao'>('tournaments');

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan flex items-center gap-3">
            🔗 Solana Tournament Portal
            <Badge className="bg-neon-purple text-white">BLOCKCHAIN POWERED</Badge>
          </CardTitle>
          
          {/* Tab Navigation */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setActiveTab('tournaments')}
              className={`cyber-button ${
                activeTab === 'tournaments' 
                  ? 'bg-neon-cyan text-black' 
                  : 'bg-transparent border border-neon-cyan text-neon-cyan'
              }`}
            >
              🎮 TOURNAMENTS
            </Button>
            <Button
              onClick={() => setActiveTab('dao')}
              className={`cyber-button ${
                activeTab === 'dao' 
                  ? 'bg-neon-purple text-white' 
                  : 'bg-transparent border border-neon-purple text-neon-purple'
              }`}
            >
              🏛️ DAO VOTING
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            {activeTab === 'tournaments' 
              ? 'Participate in blockchain-powered tournaments with real CCTR rewards'
              : 'Vote on proposals that shape the future of Cyber City Arcade'
            }
          </p>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'tournaments' ? (
        <SolanaTournamentManager />
      ) : (
        <SolanaVotingDAO />
      )}
    </div>
  );
};
