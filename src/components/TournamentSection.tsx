
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LiveTournaments } from './LiveTournaments';
import { SolanaTournamentManager } from './SolanaTournamentManager';
import { SolanaTournamentSystem } from './SolanaTournamentSystem';
import { TourDates } from './TourDates';
import { TournamentCalendar } from './TournamentCalendar';
import { Badge } from '@/components/ui/badge';

export const TournamentSection = () => {
  return (
    <div className="space-y-8">
      {/* Section Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-center text-neon-green flex items-center justify-center gap-3">
            🏆 TOURNAMENT SYSTEMS
            <Badge className="bg-neon-purple text-white">WEB3 POWERED</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-300 text-lg">
            Join competitive tournaments, earn CCTR tokens, and compete for real prizes
          </p>
        </CardContent>
      </Card>

      {/* Live Tournament Calendar - NEW */}
      <TournamentCalendar />
      
      {/* Live Tournaments Redirect */}
      <LiveTournaments />
      
      {/* Physical Tour Events */}
      <TourDates />
      
      {/* Solana Tournament Manager */}
      <SolanaTournamentManager />
      
      {/* Solana DAO Portal */}
      <SolanaTournamentSystem />
    </div>
  );
};
