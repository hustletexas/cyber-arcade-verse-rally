
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

  // Generate 72 players (36 per side)
  const generatePlayers = () => {
    const playerNames = [
      'CyberNinja47', 'PixelWarrior', 'NeonGamer99', 'EliteSniper', 'ShadowHunter', 'FireStorm_X',
      'IcePhoenix', 'ThunderBolt', 'GhostRider', 'VortexMaster', 'BladeRunner', 'QuantumLeap',
      'SteelTitan', 'CrimsonFury', 'EchoStrike', 'VoidWalker', 'PlasmaBurst', 'DarkPhantom',
      'LightningFast', 'IronFist', 'CyberSamurai', 'DigitalDemon', 'ArcticWolf', 'InfernoKing',
      'StormBreaker', 'ShadowBlade', 'NeonKnight', 'PixelPunk', 'GamerGod', 'ElitePro',
      'MegaMaster', 'UltraGamer', 'SuperSniper', 'TurboTitan', 'HyperHero', 'MetalMachine',
      'CyberCrusher', 'DigitalDestroyer', 'QuantumQuake', 'PlasmaPlayer', 'VortexVictor', 'EchoElite',
      'ThunderThief', 'LightningLord', 'StormSoldier', 'IceImperor', 'FireFighter', 'ShadowShooter',
      'NeonNinja', 'PixelPilot', 'CyberChampion', 'GamerGuru', 'EliteEnforcer', 'MegaMaverick',
      'UltraUndertaker', 'SuperSoldier', 'TurboTerror', 'HyperHunter', 'MetalMonster', 'CyberCyborg',
      'DigitalDragon', 'QuantumQueen', 'PlasmaPhantom', 'VortexVanguard', 'EchoEmperor', 'ThunderTank',
      'LightningLegend', 'StormSlayer', 'IceInvader', 'FirePhoenix', 'ShadowSentry', 'NeonNemesis'
    ];

    const avatars = ['🥷', '⚔️', '💎', '🎯', '🌙', '🔥', '❄️', '⚡', '👻', '🌪️', '🗡️', '🚀'];
    
    return playerNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name,
      avatar: avatars[index % avatars.length],
      score: Math.random() > 0.5 ? Math.floor(Math.random() * 3) : undefined,
      isWinner: Math.random() > 0.7
    }));
  };

  // Generate bracket matches for 72 players
  const generateBracket = () => {
    const players = generatePlayers();
    const matches: Match[] = [];
    
    // Round 1: 36 matches (72 players -> 36 winners)
    for (let i = 0; i < 36; i++) {
      matches.push({
        id: `r1-${i + 1}`,
        player1: players[i * 2],
        player2: players[i * 2 + 1],
        status: i < 12 ? 'completed' : i < 24 ? 'live' : 'upcoming',
        round: 1,
        startTime: i < 24 ? 'Live' : `+${(i - 23) * 5} min`,
        winner: i < 12 ? (Math.random() > 0.5 ? players[i * 2] : players[i * 2 + 1]) : undefined
      });
    }

    // Round 2: 18 matches (36 -> 18)
    for (let i = 0; i < 18; i++) {
      matches.push({
        id: `r2-${i + 1}`,
        player1: { id: `r1-${i * 2 + 1}-winner`, name: 'Winner R1', avatar: '🎯' },
        player2: { id: `r1-${i * 2 + 2}-winner`, name: 'Winner R1', avatar: '⚔️' },
        status: i < 6 ? 'completed' : i < 12 ? 'live' : 'upcoming',
        round: 2,
        startTime: i < 12 ? 'Live' : `+${(i - 11) * 10} min`
      });
    }

    // Round 3: 9 matches (18 -> 9)
    for (let i = 0; i < 9; i++) {
      matches.push({
        id: `r3-${i + 1}`,
        player1: { id: `r2-${i * 2 + 1}-winner`, name: 'Winner R2', avatar: '💎' },
        player2: { id: `r2-${i * 2 + 2}-winner`, name: 'Winner R2', avatar: '🌙' },
        status: i < 3 ? 'completed' : i < 6 ? 'live' : 'upcoming',
        round: 3,
        startTime: i < 6 ? 'Live' : `+${(i - 5) * 15} min`
      });
    }

    // Quarterfinals: 4 matches + 1 bye
    for (let i = 0; i < 4; i++) {
      matches.push({
        id: `qf-${i + 1}`,
        player1: { id: `r3-${i * 2 + 1}-winner`, name: 'Quarterfinalist', avatar: '🔥' },
        player2: { id: `r3-${i * 2 + 2}-winner`, name: 'Quarterfinalist', avatar: '❄️' },
        status: i < 2 ? 'completed' : 'upcoming',
        round: 4,
        startTime: i < 2 ? 'Completed' : `+${(i - 1) * 20} min`
      });
    }

    // Add the bye player
    matches.push({
      id: 'qf-bye',
      player1: { id: 'r3-9-winner', name: 'Bye Player', avatar: '⚡' },
      player2: { id: 'bye', name: 'BYE', avatar: '🏆' },
      status: 'completed',
      round: 4,
      winner: { id: 'r3-9-winner', name: 'Bye Player', avatar: '⚡' }
    });

    // Semifinals: 2 matches + bye advances
    matches.push({
      id: 'sf-1',
      player1: { id: 'qf-1-winner', name: 'SF Contender', avatar: '🥷' },
      player2: { id: 'qf-2-winner', name: 'SF Contender', avatar: '⚔️' },
      status: 'live',
      round: 5,
      startTime: 'Live'
    });

    matches.push({
      id: 'sf-2',
      player1: { id: 'qf-3-winner', name: 'SF Contender', avatar: '💎' },
      player2: { id: 'qf-bye-winner', name: 'Bye Advance', avatar: '⚡' },
      status: 'upcoming',
      round: 5,
      startTime: '+30 min'
    });

    // Finals
    matches.push({
      id: 'finals',
      player1: { id: 'sf-1-winner', name: 'Finalist', avatar: '🏆' },
      player2: { id: 'sf-2-winner', name: 'Finalist', avatar: '🏆' },
      status: 'upcoming',
      round: 6,
      startTime: '+60 min'
    });

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

  const renderMatch = (match: Match, style: React.CSSProperties) => (
    <div 
      key={match.id}
      className="absolute w-48"
      style={style}
    >
      <Card className={`arcade-frame ${match.status === 'live' ? 'border-neon-green animate-pulse' : ''}`}>
        <CardContent className="p-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Badge className={`${match.status === 'live' ? 'bg-neon-green animate-pulse' : match.status === 'completed' ? 'bg-neon-cyan' : 'bg-neon-purple'} text-black text-xs`}>
                {match.status.toUpperCase()}
              </Badge>
              {match.startTime && (
                <span className="text-xs text-neon-cyan">{match.startTime}</span>
              )}
            </div>

            {/* Player 1 */}
            <div className={`flex items-center justify-between p-1 rounded text-xs ${match.player1.isWinner ? 'bg-neon-green/20' : 'bg-gray-800'}`}>
              <div className="flex items-center gap-1">
                <span className="text-sm">{match.player1.avatar}</span>
                <span className="font-mono text-neon-cyan truncate">{match.player1.name}</span>
              </div>
              {match.player1.score !== undefined && (
                <span className={`font-bold ${match.player1.isWinner ? 'text-neon-green' : 'text-white'}`}>
                  {match.player1.score}
                </span>
              )}
            </div>

            <div className="text-center text-neon-pink font-bold text-xs">VS</div>

            {/* Player 2 */}
            <div className={`flex items-center justify-between p-1 rounded text-xs ${match.player2.isWinner ? 'bg-neon-green/20' : 'bg-gray-800'}`}>
              <div className="flex items-center gap-1">
                <span className="text-sm">{match.player2.avatar}</span>
                <span className="font-mono text-neon-cyan truncate">{match.player2.name}</span>
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
                className="w-full cyber-button text-xs py-1"
              >
                📺 WATCH
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

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

      {/* Tournament Bracket - 72 Players (36 per side) */}
      {currentTournament && (
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-xl text-neon-pink flex items-center gap-3">
              {currentTournament.game} {currentTournament.name} - 72 PLAYER BRACKET
              {currentTournament.status === 'live' && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></div>
                  <span className="text-sm text-neon-green">LIVE</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative min-h-[1200px] overflow-x-auto">
              <div className="relative w-full min-w-[1600px]">
                {/* Trophy in the Center */}
                <div className="absolute top-[580px] left-[750px] z-10">
                  <div className="text-8xl animate-pulse">🏆</div>
                  <div className="text-center text-neon-green font-bold mt-2">CHAMPION</div>
                </div>

                {/* Finals */}
                <div className="absolute top-[600px] left-[650px]">
                  {renderMatch(
                    liveMatches.find(m => m.id === 'finals') || {
                      id: 'finals',
                      player1: { id: '1', name: 'Finalist 1', avatar: '🏆' },
                      player2: { id: '2', name: 'Finalist 2', avatar: '🏆' },
                      status: 'upcoming',
                      round: 6
                    },
                    {}
                  )}
                </div>

                {/* Semifinals */}
                <div className="absolute top-[500px] left-[450px]">
                  {renderMatch(
                    liveMatches.find(m => m.id === 'sf-1') || {
                      id: 'sf-1',
                      player1: { id: '1', name: 'SF 1', avatar: '🥷' },
                      player2: { id: '2', name: 'SF 2', avatar: '⚔️' },
                      status: 'live',
                      round: 5
                    },
                    {}
                  )}
                </div>
                <div className="absolute top-[700px] left-[450px]">
                  {renderMatch(
                    liveMatches.find(m => m.id === 'sf-2') || {
                      id: 'sf-2',
                      player1: { id: '1', name: 'SF 3', avatar: '💎' },
                      player2: { id: '2', name: 'SF 4', avatar: '⚡' },
                      status: 'upcoming',
                      round: 5
                    },
                    {}
                  )}
                </div>

                {/* Quarterfinals - Left Side */}
                {[0, 1].map(i => (
                  <div key={`qf-left-${i}`} className="absolute" style={{ top: `${400 + i * 200}px`, left: '250px' }}>
                    {renderMatch(
                      liveMatches.find(m => m.id === `qf-${i + 1}`) || {
                        id: `qf-${i + 1}`,
                        player1: { id: `${i}1`, name: `QF ${i * 2 + 1}`, avatar: '🔥' },
                        player2: { id: `${i}2`, name: `QF ${i * 2 + 2}`, avatar: '❄️' },
                        status: 'completed',
                        round: 4
                      },
                      {}
                    )}
                  </div>
                ))}

                {/* Quarterfinals - Right Side */}
                {[2, 3].map(i => (
                  <div key={`qf-right-${i}`} className="absolute" style={{ top: `${400 + (i - 2) * 200}px`, left: '850px' }}>
                    {renderMatch(
                      liveMatches.find(m => m.id === `qf-${i + 1}`) || {
                        id: `qf-${i + 1}`,
                        player1: { id: `${i}1`, name: `QF ${i * 2 + 1}`, avatar: '🔥' },
                        player2: { id: `${i}2`, name: `QF ${i * 2 + 2}`, avatar: '❄️' },
                        status: 'upcoming',
                        round: 4
                      },
                      {}
                    )}
                  </div>
                ))}

                {/* Bye Match */}
                <div className="absolute top-[600px] left-[850px]">
                  {renderMatch(
                    liveMatches.find(m => m.id === 'qf-bye') || {
                      id: 'qf-bye',
                      player1: { id: 'bye-player', name: 'Bye Player', avatar: '⚡' },
                      player2: { id: 'bye', name: 'BYE', avatar: '🏆' },
                      status: 'completed',
                      round: 4,
                      winner: { id: 'bye-player', name: 'Bye Player', avatar: '⚡' }
                    },
                    {}
                  )}
                </div>

                {/* Round 3 matches - distributed on both sides */}
                {Array.from({ length: 9 }, (_, i) => (
                  <div 
                    key={`r3-${i}`} 
                    className="absolute" 
                    style={{ 
                      top: `${300 + (i % 5) * 120}px`, 
                      left: i < 4 ? '50px' : i === 4 ? '450px' : '1050px'
                    }}
                  >
                    {renderMatch(
                      liveMatches.find(m => m.id === `r3-${i + 1}`) || {
                        id: `r3-${i + 1}`,
                        player1: { id: `r3-${i}1`, name: `R3 ${i * 2 + 1}`, avatar: '💎' },
                        player2: { id: `r3-${i}2`, name: `R3 ${i * 2 + 2}`, avatar: '🌙' },
                        status: i < 3 ? 'completed' : i < 6 ? 'live' : 'upcoming',
                        round: 3
                      },
                      {}
                    )}
                  </div>
                ))}

                {/* Bracket connecting lines */}
                <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
                  {/* Finals to Trophy */}
                  <line x1="750" y1="650" x2="790" y2="650" stroke="#00ffff" strokeWidth="3" />
                  
                  {/* Semifinals to Finals */}
                  <line x1="650" y1="550" x2="700" y2="625" stroke="#00ffff" strokeWidth="2" />
                  <line x1="650" y1="750" x2="700" y2="675" stroke="#00ffff" strokeWidth="2" />
                  
                  {/* Quarterfinals to Semifinals */}
                  <line x1="450" y1="450" x2="500" y2="525" stroke="#00ffff" strokeWidth="2" />
                  <line x1="450" y1="650" x2="500" y2="575" stroke="#00ffff" strokeWidth="2" />
                  <line x1="850" y1="450" x2="800" y2="725" stroke="#00ffff" strokeWidth="2" />
                  <line x1="850" y1="650" x2="800" y2="775" stroke="#00ffff" strokeWidth="2" />
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
