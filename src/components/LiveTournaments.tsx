
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LiveTournaments = () => {
  return (
    <div className="space-y-6">
      {/* Placeholder message */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan text-center">
            🏆 TOURNAMENT HUB
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-300 mb-4">
              Live tournaments and statistics have been moved to the Tournament Systems section below for better organization.
            </p>
            <p className="text-neon-cyan text-sm">
              Scroll down to find all tournament-related features under Tournament Systems! 🎮
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
