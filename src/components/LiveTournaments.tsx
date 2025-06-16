
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

  // Updated tournament data with the three requested games and their correct images
  const tournaments = [
    {
      id: 'fortnite-championship',
      name: 'FORTNITE BATTLE ROYALE',
      game: '🎯',
      image: '/lovable-uploads/d02c55c8-cdcf-4072-814b-340278e7ba0d.png',
      status: 'live',
      participants: 72,
      prize: '100,000 $CCTR',
      currentRound: 'Round of 16',
      nextMatch: '2 minutes'
    },
    {
      id: 'mario-kart-grand-prix',
      name: 'MARIO KART GRAND PRIX',
      game: '🏎️',
      image: '/lovable-uploads/c084d8de-a04e-4e1e-9e0c-ea179d67f5a7.png',
      status: 'live',
      participants: 64,
      prize: '75,000 $CCTR',
      currentRound: 'Quarterfinals',
      nextMatch: '8 minutes'
    },
    {
      id: 'call-of-duty-warzone',
      name: 'CALL OF DUTY WARZONE',
      game: '🔫',
      image: '/lovable-uploads/adc51b6f-7d82-44cc-86b5-e984bc74d2d3.png',
      status: 'upcoming',
      participants: 80,
      prize: '120,000 $CCTR',
      currentRound: 'Registration Open',
      nextMatch: '25 minutes'
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

    const tournament = tournaments.find(t => t.id === tournamentId);
    toast({
      title: "Tournament Joined!",
      description: `You've successfully joined ${tournament?.name}. Check your email for details.`,
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
                  {/* Game Image */}
                  <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                    <img 
                      src={tournament.image} 
                      alt={tournament.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>

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

                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      joinTournament(tournament.id);
                    }}
                    className="w-full cyber-button text-xs"
                  >
                    🎮 JOIN TOURNAMENT
                  </Button>
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
              <div className="text-2xl font-black text-neon-pink">295K $CCTR</div>
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
