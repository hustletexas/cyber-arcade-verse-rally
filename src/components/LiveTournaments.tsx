
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Player {
  id: string;
  name: string;
  avatar: string;
  score?: number;
  isWinner?: boolean;
}

interface Match {
  id: string;
  player1: Player;
  player2: Player;
  winner?: Player;
  status: 'upcoming' | 'live' | 'completed';
  round: number;
  startTime?: string;
}

export const LiveTournaments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTournament, setSelectedTournament] = useState('fortnite-championship');
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);

  // Mock tournament data
  const tournaments = [
    {
      id: 'fortnite-championship',
      name: 'FORTNITE CHAMPIONSHIP',
      game: '🎯',
      status: 'live',
      participants: 64,
      prize: '100,000 $CCTR',
      currentRound: 'Quarterfinals',
      nextMatch: '2 minutes'
    },
    {
      id: 'valorant-masters',
      name: 'VALORANT MASTERS',
      game: '💥',
      status: 'live',
      participants: 32,
      prize: '75,000 $CCTR',
      currentRound: 'Semifinals',
      nextMatch: '15 minutes'
    },
    {
      id: 'rocket-league-grand-prix',
      name: 'ROCKET LEAGUE GRAND PRIX',
      game: '⚽',
      status: 'upcoming',
      participants: 16,
      prize: '50,000 $CCTR',
      currentRound: 'Registration Open',
      nextMatch: '45 minutes'
    }
  ];

  // Generate bracket matches
  const generateBracket = () => {
    const players: Player[] = [
      { id: '1', name: 'CyberNinja47', avatar: '🥷' },
      { id: '2', name: 'PixelWarrior', avatar: '⚔️' },
      { id: '3', name: 'NeonGamer99', avatar: '💎' },
      { id: '4', name: 'EliteSniper', avatar: '🎯' },
      { id: '5', name: 'ShadowHunter', avatar: '🌙' },
      { id: '6', name: 'FireStorm_X', avatar: '🔥' },
      { id: '7', name: 'IcePhoenix', avatar: '❄️' },
      { id: '8', name: 'ThunderBolt', avatar: '⚡' }
    ];

    const matches: Match[] = [
      // Semifinals
      {
        id: 'sf1',
        player1: players[0],
        player2: players[1],
        status: 'live',
        round: 3,
        startTime: 'Now'
      },
      {
        id: 'sf2',
        player1: players[2],
        player2: players[3],
        status: 'upcoming',
        round: 3,
        startTime: '15:30'
      },
      // Quarterfinals
      {
        id: 'qf1',
        player1: { ...players[0], score: 2, isWinner: true },
        player2: { ...players[4], score: 1 },
        winner: players[0],
        status: 'completed',
        round: 2
      },
      {
        id: 'qf2',
        player1: { ...players[1], score: 2, isWinner: true },
        player2: { ...players[5], score: 0 },
        winner: players[1],
        status: 'completed',
        round: 2
      },
      {
        id: 'qf3',
        player1: { ...players[2], score: 2, isWinner: true },
        player2: { ...players[6], score: 1 },
        winner: players[2],
        status: 'completed',
        round: 2
      },
      {
        id: 'qf4',
        player1: { ...players[3], score: 2, isWinner: true },
        player2: { ...players[7], score: 0 },
        winner: players[3],
        status: 'completed',
        round: 2
      }
    ];

    return matches;
  };

  useEffect(() => {
    setLiveMatches(generateBracket());
    
    // Simulate live updates
    const interval = setInterval(() => {
      setLiveMatches(prev => prev.map(match => {
        if (match.status === 'live') {
          return {
            ...match,
            player1: { ...match.player1, score: Math.floor(Math.random() * 3) },
            player2: { ...match.player2, score: Math.floor(Math.random() * 3) }
          };
        }
        return match;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedTournament]);

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

  const watchMatch = (matchId: string) => {
    toast({
      title: "Watching Live!",
      description: "Opening live stream...",
    });
  };

  const renderMatch = (match: Match, position: { top: string, left: string }) => (
    <div 
      key={match.id}
      className="absolute w-64"
      style={{ top: position.top, left: position.left }}
    >
      <Card className={`arcade-frame ${match.status === 'live' ? 'border-neon-green animate-pulse' : ''}`}>
        <CardContent className="p-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge className={`${match.status === 'live' ? 'bg-neon-green animate-pulse' : match.status === 'completed' ? 'bg-neon-cyan' : 'bg-neon-purple'} text-black text-xs`}>
                {match.status.toUpperCase()}
              </Badge>
              {match.startTime && (
                <span className="text-xs text-neon-cyan">{match.startTime}</span>
              )}
            </div>

            {/* Player 1 */}
            <div className={`flex items-center justify-between p-2 rounded ${match.player1.isWinner ? 'bg-neon-green/20' : 'bg-gray-800'}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{match.player1.avatar}</span>
                <span className="text-sm font-mono text-neon-cyan">{match.player1.name}</span>
              </div>
              {match.player1.score !== undefined && (
                <span className={`font-bold ${match.player1.isWinner ? 'text-neon-green' : 'text-white'}`}>
                  {match.player1.score}
                </span>
              )}
            </div>

            <div className="text-center text-neon-pink font-bold">VS</div>

            {/* Player 2 */}
            <div className={`flex items-center justify-between p-2 rounded ${match.player2.isWinner ? 'bg-neon-green/20' : 'bg-gray-800'}`}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{match.player2.avatar}</span>
                <span className="text-sm font-mono text-neon-cyan">{match.player2.name}</span>
              </div>
              {match.player2.score !== undefined && (
                <span className={`font-bold ${match.player2.isWinner ? 'text-neon-green' : 'text-white'}`}>
                  {match.player2.score}
                </span>
              )}
            </div>

            {match.status === 'live' && (
              <Button 
                onClick={() => watchMatch(match.id)}
                className="w-full cyber-button text-xs"
              >
                📺 WATCH LIVE
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const currentTournament = tournaments.find(t => t.id === selectedTournament);
  const semifinals = liveMatches.filter(m => m.round === 3);
  const quarterfinals = liveMatches.filter(m => m.round === 2);

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

      {/* Tournament Bracket */}
      {currentTournament && (
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-xl text-neon-pink flex items-center gap-3">
              {currentTournament.game} {currentTournament.name} - BRACKET
              {currentTournament.status === 'live' && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                  <span className="text-sm text-neon-green">LIVE</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative min-h-[600px] overflow-x-auto">
              {/* Tournament Bracket Layout */}
              <div className="relative w-full min-w-[1000px]">
                {/* Finals */}
                <div className="absolute top-[250px] left-[800px]">
                  <Card className="arcade-frame w-64">
                    <CardContent className="p-4 text-center">
                      <h3 className="font-display text-lg text-neon-green mb-4">🏆 FINALS</h3>
                      <div className="text-neon-cyan font-mono">
                        Winner of SF1 vs Winner of SF2
                      </div>
                      <div className="mt-4 text-sm text-muted-foreground">
                        Starting in 30 minutes
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Semifinals */}
                {semifinals.map((match, index) => 
                  renderMatch(match, {
                    top: `${150 + index * 200}px`,
                    left: '500px'
                  })
                )}

                {/* Quarterfinals */}
                {quarterfinals.map((match, index) => 
                  renderMatch(match, {
                    top: `${100 + index * 125}px`,
                    left: '200px'
                  })
                )}

                {/* Bracket Lines */}
                <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: -1 }}>
                  {/* Lines connecting quarterfinals to semifinals */}
                  <line x1="464" y1="175" x2="500" y2="200" stroke="#00ffff" strokeWidth="2" />
                  <line x1="464" y1="300" x2="500" y2="200" stroke="#00ffff" strokeWidth="2" />
                  <line x1="464" y1="425" x2="500" y2="400" stroke="#00ffff" strokeWidth="2" />
                  <line x1="464" y1="550" x2="500" y2="400" stroke="#00ffff" strokeWidth="2" />
                  
                  {/* Lines connecting semifinals to finals */}
                  <line x1="764" y1="225" x2="800" y2="300" stroke="#00ffff" strokeWidth="2" />
                  <line x1="764" y1="425" x2="800" y2="300" stroke="#00ffff" strokeWidth="2" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Statistics */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">📊 LIVE STATISTICS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="holographic p-4 text-center">
              <h4 className="text-neon-green font-bold mb-2">🔴 LIVE VIEWERS</h4>
              <div className="text-2xl font-black text-neon-green">47,293</div>
              <div className="text-xs text-muted-foreground animate-pulse">+1,247 watching</div>
            </Card>
            <Card className="holographic p-4 text-center">
              <h4 className="text-neon-pink font-bold mb-2">💰 TOTAL PRIZES</h4>
              <div className="text-2xl font-black text-neon-pink">225K $CCTR</div>
              <div className="text-xs text-muted-foreground">Across all tournaments</div>
            </Card>
            <Card className="holographic p-4 text-center">
              <h4 className="text-neon-purple font-bold mb-2">⚡ ACTIVE MATCHES</h4>
              <div className="text-2xl font-black text-neon-purple">12</div>
              <div className="text-xs text-muted-foreground">Live right now</div>
            </Card>
            <Card className="holographic p-4 text-center">
              <h4 className="text-neon-cyan font-bold mb-2">👥 PARTICIPANTS</h4>
              <div className="text-2xl font-black text-neon-cyan">112</div>
              <div className="text-xs text-muted-foreground">Competing today</div>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
