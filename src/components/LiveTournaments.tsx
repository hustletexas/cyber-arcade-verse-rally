
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TournamentLeaderboard } from './TournamentLeaderboard';

export const LiveTournaments = () => {
  return (
    <div className="space-y-6">
      {/* Tournament Hub Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan text-center">
            🏆 TOURNAMENT HUB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-300 mb-4">
              View completed tournament results and track competitive performance across all tournaments.
            </p>
            <p className="text-neon-cyan text-sm">
              🔒 All results are privacy-protected with anonymized player identifiers.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Secure Public Leaderboard */}
      <TournamentLeaderboard title="Global Tournament Results" />
    </div>
  );
};
