
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TournamentGameInterface } from './TournamentGameInterface';
import { TournamentBracket } from './TournamentBracket';
import { SolanaTournamentBracket } from './SolanaTournamentBracket';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const TournamentSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ownedPasses, setOwnedPasses] = useState<string[]>(['elite']);
  const [activeGame, setActiveGame] = useState<{
    tournamentId: string;
    gameType: 'tetris' | 'pacman' | 'galaga';
  } | null>(null);

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

  const mintPass = (passId: string) => {
    toast({
      title: "Minting NFT Pass",
      description: `Minting ${passId} tournament pass...`,
    });
    setTimeout(() => {
      setOwnedPasses([...ownedPasses, passId]);
      toast({
        title: "NFT Pass Minted!",
        description: "Your tournament pass has been added to your wallet",
      });
    }, 2000);
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

    </div>
  );
};
