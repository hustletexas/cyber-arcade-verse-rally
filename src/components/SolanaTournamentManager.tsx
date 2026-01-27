import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Legacy component - Tournament functionality now handled by TournamentHub
export const SolanaTournamentManager = () => {
  return (
    <div className="space-y-6">
      {/* Placeholder - Redirect users to Tournament Hub */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🏆 Stellar Tournament Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            Tournament features are now available in the Tournament Hub section.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
