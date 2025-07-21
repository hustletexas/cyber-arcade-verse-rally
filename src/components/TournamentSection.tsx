import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TournamentGameInterface } from './TournamentGameInterface';
import { TournamentBracket } from './TournamentBracket';
import { SolanaTournamentSystem } from './SolanaTournamentSystem';
import { TournamentAdminPanel } from './TournamentAdminPanel';
import { PayPalTournamentEntry } from './PayPalTournamentEntry';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const TournamentSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'solana' | 'classic' | 'fighting' | 'admin'>('solana');
  const [activeGame, setActiveGame] = useState<{
    tournamentId: string;
    gameType: 'tetris' | 'pacman' | 'galaga';
  } | null>(null);

  // Mock admin check - replace with your actual admin logic
  const isAdmin = user?.email?.includes('admin') || false;

  // Updated tournaments with real games
  const tournaments = [
    {
      id: 'fortnite-battle',
      title: 'FORTNITE BATTLE ROYALE',
      date: '2024-12-15',
      prize: '50,000 $CCTR',
      passRequired: 'elite',
      status: 'live',
      participants: 512,
      description: 'Epic Fortnite tournament with massive prize pool',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 2847
    },
    {
      id: 'valorant-championship',
      title: 'VALORANT CHAMPIONSHIP',
      date: '2024-12-08',
      prize: '25,000 $CCTR',
      passRequired: 'standard',
      status: 'upcoming',
      participants: 256,
      description: 'Tactical FPS competition for the best teams',
      gameType: 'pacman' as const,
      realGame: true,
      votes: 1923
    },
    {
      id: 'rocket-league-arena',
      title: 'ROCKET LEAGUE ARENA',
      date: '2024-12-22',
      prize: '30,000 $CCTR',
      passRequired: 'legendary',
      status: 'upcoming',
      participants: 128,
      description: 'High-octane soccer meets racing action',
      gameType: 'galaga' as const,
      realGame: true,
      votes: 1654
    },
    {
      id: 'n64-mario-kart',
      title: 'N64 MARIO KART 64',
      date: '2024-12-20',
      prize: '15,000 $CCTR',
      passRequired: 'standard',
      status: 'upcoming',
      participants: 64,
      description: 'Classic N64 Mario Kart tournament - bring your nostalgia!',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 1245
    }
  ];

  // Fighting game tournaments
  const fightingTournaments = [
    {
      id: 'street-fighter-6',
      title: 'STREET FIGHTER 6',
      date: '2024-12-18',
      prize: '40,000 $CCTR',
      passRequired: 'elite',
      status: 'live',
      participants: 128,
      description: 'Latest Street Fighter tournament with top players',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 2156
    },
    {
      id: 'tekken-8',
      title: 'TEKKEN 8 CHAMPIONSHIP',
      date: '2024-12-25',
      prize: '35,000 $CCTR',
      passRequired: 'legendary',
      status: 'upcoming',
      participants: 96,
      description: 'The King of Iron Fist tournament returns',
      gameType: 'pacman' as const,
      realGame: true,
      votes: 1987
    },
    {
      id: 'mortal-kombat-1',
      title: 'MORTAL KOMBAT 1',
      date: '2024-12-30',
      prize: '30,000 $CCTR',
      passRequired: 'standard',
      status: 'upcoming',
      participants: 64,
      description: 'Brutal fighting tournament - Finish Him!',
      gameType: 'galaga' as const,
      realGame: true,
      votes: 1543
    },
    {
      id: 'guilty-gear-strive',
      title: 'GUILTY GEAR STRIVE',
      date: '2024-12-28',
      prize: '25,000 $CCTR',
      passRequired: 'standard',
      status: 'upcoming',
      participants: 80,
      description: 'High-speed anime fighting action',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 1324
    }
  ];

  // Live tournaments data for the new sections
  const liveTournaments = [
    {
      id: 'fortnite-championship',
      name: 'FORTNITE BATTLE ROYALE',
      game: '🎯',
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
      status: 'upcoming',
      participants: 80,
      prize: '120,000 $CCTR',
      currentRound: 'Registration Open',
      nextMatch: '25 minutes'
    }
  ];

  const voteForTournament = (tournamentId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to vote for tournaments",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Vote Cast!",
      description: "Your CCTR vote has been recorded",
    });
  };

  const joinTournament = (tournament: typeof tournaments[0]) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to join tournaments",
        variant: "destructive",
      });
      return;
    }

    if (tournament.realGame) {
      toast({
        title: "Tournament Joined!",
        description: `You've joined the ${tournament.title}. Check your email for details.`,
      });
    } else {
      setActiveGame({
        tournamentId: tournament.id,
        gameType: tournament.gameType
      });
    }
  };

  const joinLiveTournament = (tournamentId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to join tournaments",
        variant: "destructive",
      });
      return;
    }

    const tournament = liveTournaments.find(t => t.id === tournamentId);
    toast({
      title: "Tournament Joined!",
      description: `You've successfully joined ${tournament?.name}. Check your email for details.`,
    });
  };

  const getGameIcon = (gameType: string, realGame?: boolean) => {
    if (realGame) {
      switch (gameType) {
        case 'tetris': return '🎯'; // Fortnite
        case 'pacman': return '💥'; // Valorant
        case 'galaga': return '⚽'; // Rocket League
        default: return '🎮';
      }
    }
    switch (gameType) {
      case 'tetris': return '🧩';
      case 'pacman': return '👻';
      case 'galaga': return '🚀';
      default: return '🎮';
    }
  };

  const getFightingGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'tetris': return '👊'; // Street Fighter / Guilty Gear
      case 'pacman': return '🥊'; // Tekken
      case 'galaga': return '⚔️'; // Mortal Kombat
      default: return '🥋';
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Game Interface */}
      {activeGame && (
        <TournamentGameInterface
          tournamentId={activeGame.tournamentId}
          gameType={activeGame.gameType}
          onClose={() => setActiveGame(null)}
        />
      )}

      {/* Tournament System Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl md:text-3xl text-neon-cyan text-center">
            🏆 TOURNAMENT SYSTEMS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setActiveView('solana')}
              className={`cyber-button ${activeView === 'solana' ? 'bg-neon-cyan text-black' : ''}`}
            >
              ⛓️ Solana Tournaments
            </Button>
            <Button
              onClick={() => setActiveView('classic')}
              className={`cyber-button ${activeView === 'classic' ? 'bg-neon-cyan text-black' : ''}`}
            >
              🎮 Classic Tournaments
            </Button>
            <Button
              onClick={() => setActiveView('fighting')}
              className={`cyber-button ${activeView === 'fighting' ? 'bg-neon-cyan text-black' : ''}`}
            >
              👊 Fighting Games
            </Button>
            {isAdmin && (
              <Button
                onClick={() => setActiveView('admin')}
                className={`cyber-button ${activeView === 'admin' ? 'bg-neon-purple text-white' : ''}`}
              >
                🔧 Admin Panel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Live Tournaments Section */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
            🏆 LIVE TOURNAMENTS
            <Badge className="bg-neon-green text-black animate-pulse">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {liveTournaments.map((tournament) => (
              <Card 
                key={tournament.id}
                className="vending-machine p-4 cursor-pointer transition-transform hover:scale-105"
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

                  <Button 
                    onClick={() => joinLiveTournament(tournament.id)}
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

      {/* Live Statistics Section */}
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

      {/* Solana Tournament System */}
      {activeView === 'solana' && (
        <div className="space-y-6">
          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle className="font-display text-xl text-neon-cyan">
                ⛓️ Solana-Powered Tournament System
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="text-neon-green font-bold">🎯 Smart Contract Features:</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Maximum 32 players per tournament</li>
                      <li>• Automatic entry fee collection</li>
                      <li>• Real-time player tracking</li>
                      <li>• Tournament full protection</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-neon-purple font-bold">💰 Prize Distribution:</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Winner receives 90% of prize pool</li>
                      <li>• Admin receives 10% service fee</li>
                      <li>• Automatic SOL payouts</li>
                      <li>• Transparent on-chain transactions</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg border border-neon-cyan">
                  <h4 className="text-neon-cyan font-bold mb-2">How It Works:</h4>
                  <ol className="text-gray-300 space-y-1 text-sm">
                    <li>1. Connect your Phantom wallet</li>
                    <li>2. Pay tournament entry fee in SOL</li>
                    <li>3. Compete with up to 31 other players</li>
                    <li>4. Winner automatically receives 90% of prize pool</li>
                    <li>5. All transactions are verified on-chain</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <SolanaTournamentSystem />
        </div>
      )}

      {/* Classic Tournament System */}
      {activeView === 'classic' && (
        <div className="space-y-6">
          {/* Classic Tournaments Header */}
          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle className="font-display text-xl text-neon-pink">
                🎮 Classic Tournament Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Play classic arcade games in tournament format. Vote for your favorite tournaments with CCTR tokens!
              </p>
              
              <div className="grid gap-4">
                {tournaments.map((tournament) => (
                  <Card key={tournament.id} className="holographic p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-neon-pink flex items-center gap-2">
                          {getGameIcon(tournament.gameType, tournament.realGame)} {tournament.title}
                        </h3>
                        <Badge className={`${tournament.status === 'live' ? 'bg-neon-green animate-pulse' : 'bg-neon-purple'} text-black`}>
                          {tournament.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-300">{tournament.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Date:</span>
                          <div className="text-neon-cyan">{tournament.date}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Prize:</span>
                          <div className="text-neon-green font-bold">{tournament.prize}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Participants:</span>
                          <div className="text-neon-purple">{tournament.participants}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Votes:</span>
                          <div className="text-neon-pink">{tournament.votes}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button 
                          onClick={() => joinTournament(tournament)}
                          className="cyber-button text-xs"
                        >
                          🎮 Join Tournament
                        </Button>
                        <Button 
                          onClick={() => voteForTournament(tournament.id)}
                          variant="outline"
                          className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black text-xs"
                        >
                          🗳️ Vote (100 CCTR)
                        </Button>
                        <Badge variant="outline" className="border-neon-purple text-neon-purple">
                          {tournament.passRequired.toUpperCase()} PASS
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <TournamentBracket />
        </div>
      )}

      {/* Fighting Game Tournament System */}
      {activeView === 'fighting' && (
        <div className="space-y-6">
          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle className="font-display text-xl text-neon-pink">
                👊 Fighting Game Championships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 mb-4">
                Join the ultimate fighting game tournaments! Compete in the latest and greatest fighting games with top prize pools.
              </p>
              
              <div className="grid gap-4">
                {fightingTournaments.map((tournament) => (
                  <Card key={tournament.id} className="holographic p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-lg font-bold text-neon-pink flex items-center gap-2">
                          {getFightingGameIcon(tournament.gameType)} {tournament.title}
                        </h3>
                        <Badge className={`${tournament.status === 'live' ? 'bg-neon-green animate-pulse' : 'bg-neon-purple'} text-black`}>
                          {tournament.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-300">{tournament.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Date:</span>
                          <div className="text-neon-cyan">{tournament.date}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Prize:</span>
                          <div className="text-neon-green font-bold">{tournament.prize}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Participants:</span>
                          <div className="text-neon-purple">{tournament.participants}</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Votes:</span>
                          <div className="text-neon-pink">{tournament.votes}</div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button 
                          onClick={() => joinTournament(tournament)}
                          className="cyber-button text-xs"
                        >
                          🥊 Join Tournament
                        </Button>
                        <Button 
                          onClick={() => voteForTournament(tournament.id)}
                          variant="outline"
                          className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black text-xs"
                        >
                          🗳️ Vote (100 CCTR)
                        </Button>
                        <Badge variant="outline" className="border-neon-purple text-neon-purple">
                          {tournament.passRequired.toUpperCase()} PASS
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <TournamentBracket />
        </div>
      )}

      {/* Admin Panel */}
      {activeView === 'admin' && isAdmin && (
        <TournamentAdminPanel isAdmin={isAdmin} />
      )}
    </div>
  );
};
