
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const VotingSection = () => {
  const scrollToSolanaPortal = () => {
    const solanaSection = document.querySelector('[data-section="solana-portal"]');
    if (solanaSection) {
      solanaSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Redirect Card */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan text-center">
            🏛️ DAO Governance Moved
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-400 text-lg">
            Our voting DAO is now integrated with the Solana Tournament Portal for enhanced blockchain functionality.
          </p>
          
          <Button 
            onClick={scrollToSolanaPortal}
            className="cyber-button text-lg px-8 py-4"
          >
            🚀 GO TO SOLANA DAO PORTAL
          </Button>
        </CardContent>
      </Card>

      {/* Voting Stats - kept for visual consistency */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="holographic p-6 text-center">
          <h3 className="font-display text-lg text-neon-cyan mb-2">TOTAL VOTERS</h3>
          <div className="text-3xl font-black text-neon-green">8,247</div>
          <p className="text-sm text-muted-foreground">Active Participants</p>
        </Card>

        <Card className="holographic p-6 text-center">
          <h3 className="font-display text-lg text-neon-pink mb-2">PROPOSALS</h3>
          <div className="text-3xl font-black text-neon-purple">23</div>
          <p className="text-sm text-muted-foreground">Total Governance</p>
        </Card>

        <Card className="holographic p-6 text-center">
          <h3 className="font-display text-lg text-neon-purple mb-2">PARTICIPATION</h3>
          <div className="text-3xl font-black text-neon-cyan">87%</div>
          <p className="text-sm text-muted-foreground">Average Turnout</p>
        </Card>
      </div>
    </div>
  );
};
