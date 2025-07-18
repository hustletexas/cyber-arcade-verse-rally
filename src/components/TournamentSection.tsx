
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TournamentGameInterface } from './TournamentGameInterface';
import { TournamentBracket } from './TournamentBracket';
import { SolanaTournamentBracket } from './SolanaTournamentBracket';
import { SolanaTournamentSystem } from './SolanaTournamentSystem';
import { TournamentAdminPanel } from './TournamentAdminPanel';
import { PayPalTournamentEntry } from './PayPalTournamentEntry';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const TournamentSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'solana' | 'classic' | 'admin'>('solana');
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

      {/* Solana Tournament System */}
      {activeView === 'solana' && (
        <div className="space-y-6">
          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle className="font-display text-xl text-neon-cyan">
                ⛓️ Solana-Powered Tournaments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="text-neon-green font-bold">🏆 Prize Distribution:</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• Top 5 Split: 40%, 25%, 15%, 12%, 8%</li>
                      <li>• Winner Takes All: 100% to 1st place</li>
                      <li>• Automatic SOL payouts</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-neon-purple font-bold">🔐 Features:</h4>
                    <ul className="text-gray-300 space-y-1">
                      <li>• NFT gating for premium tournaments</li>
                      <li>• Smart contract prize distribution</li>
                      <li>• Admin result verification</li>
                    </ul>
                  </div>
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

          {/* Tournament Bracket */}
          <TournamentBracket />
          <SolanaTournamentBracket />
        </div>
      )}

      {/* Admin Panel */}
      {activeView === 'admin' && isAdmin && (
        <TournamentAdminPanel isAdmin={isAdmin} />
      )}
    </div>
  );
};
