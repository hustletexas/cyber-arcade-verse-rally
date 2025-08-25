
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const LiveStreaming = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-display font-bold text-neon-cyan text-center">
        🎮 LIVE STREAMING
      </h2>
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="text-neon-purple">Live Gaming Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Watch live gameplay, retro speedruns, and esports events.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
