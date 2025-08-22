
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const VotingSection = () => {
  return (
    <div className="space-y-6">
      {/* Voting Stats */}
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
