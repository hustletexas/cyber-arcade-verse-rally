
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const LiveTournaments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTournament, setSelectedTournament] = useState('fortnite-championship');

  // Mock tournament data
  const tournaments = [
    {
      id: 'fortnite-championship',
      name: 'FORTNITE CHAMPIONSHIP',
      game: '🎯',
      status: 'live',
      participants: 72,
      prize: '100,000 $CCTR',
      currentRound: 'Round of 16',
      nextMatch: '2 minutes'
    },
    {
      id: 'valorant-masters',
      name: 'VALORANT MASTERS',
      game: '💥',
      status: 'live',
      participants: 72,
      prize: '75,000 $CCTR',
      currentRound: 'Quarterfinals',
      nextMatch: '15 minutes'
    },
    {
      id: 'rocket-league-grand-prix',
      name: 'ROCKET LEAGUE GRAND PRIX',
      game: '⚽',
      status: 'upcoming',
      participants: 72,
      prize: '50,000 $CCTR',
      currentRound: 'Registration Open',
      nextMatch: '45 minutes'
    }
  ];

  const joinTournament = (tournamentId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to join tournaments",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Joined Tournament!",
      description: "You've been registered for the next tournament",
    });
  };

  const currentTournament = tournaments.find(t => t.id === selectedTournament);

  return (
    <div className="space-y-6">
      {/* Tournament Selection */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
            🏆 LIVE TOURNAMENTS
            <Badge className="bg-neon-green text-black animate-pulse">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tournaments.map((tournament) => (
              <Card 
                key={tournament.id}
                className={`vending-machine p-4 cursor-pointer transition-transform hover:scale-105 ${selectedTournament === tournament.id ? 'border-neon-cyan' : ''}`}
                onClick={() => setSelectedTournament(tournament.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-neon-pink flex items-center gap-2">
                      {tournament.game} {tournament.name}
                    </h3>
                    <Badge className={`${tournament.status === 'live' ? 'bg-neon-green animate-pulse' : 'bg-neon-purple'} text-black text-xs`}>
                      {tournament.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Prize:</span>
                      <span className="text-neon-green font-bold">{tournament.prize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Players:</span>
                      <span className="text-neon-cyan">{tournament.participants}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Round:</span>
                      <span className="text-neon-purple">{tournament.currentRound}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next:</span>
                      <span className="text-neon-pink">{tournament.nextMatch}</span>
                    </div>
                  </div>

                  {tournament.status === 'upcoming' && (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        joinTournament(tournament.id);
                      }}
                      className="w-full cyber-button text-xs"
                    >
                      🎮 JOIN TOURNAMENT
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Statistics */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">📊 LIVE STATISTICS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="holographic p-4 text-center">
              <h4 className="text-neon-green font-bold mb-2">🔴 LIVE VIEWERS</h4>
              <div className="text-2xl font-black text-neon-green">89,347</div>
              <div className="text-xs text-muted-foreground animate-pulse">+2,156 watching</div>
            </Card>
            <Card className="holographic p-4 text-center">
              <h4 className="text-neon-pink font-bold mb-2">💰 TOTAL PRIZES</h4>
              <div className="text-2xl font-black text-neon-pink">225K $CCTR</div>
              <div className="text-xs text-muted-foreground">Across all tournaments</div>
            </Card>
            <Card className="holographic p-4 text-center">
              <h4 className="text-neon-purple font-bold mb-2">⚡ ACTIVE MATCHES</h4>
              <div className="text-2xl font-black text-neon-purple">24</div>
              <div className="text-xs text-muted-foreground">Live right now</div>
            </Card>
            <Card className="holographic p-4 text-center">
              <h4 className="text-neon-cyan font-bold mb-2">👥 TOTAL PLAYERS</h4>
              <div className="text-2xl font-black text-neon-cyan">216</div>
              <div className="text-xs text-muted-foreground">Competing today</div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
