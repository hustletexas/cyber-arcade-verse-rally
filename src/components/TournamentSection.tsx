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
import { TriviaGame } from './TriviaGame';
import { TriviaAdmin } from './trivia/TriviaAdmin';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const TournamentSection = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'crypto' | 'classic' | 'fighting' | 'shooter' | 'trivia' | 'admin'>('crypto');
  const [activeGame, setActiveGame] = useState<{
    tournamentId: string;
    gameType: 'tetris' | 'pacman' | 'galaga';
  } | null>(null);

  // Mock admin check - replace with your actual admin logic
  const isAdmin = user?.email?.includes('admin') || false;

  // Crypto/Solana games tournaments
  const cryptoTournaments = [
    {
      id: 'off-the-grid-battle',
      title: 'OFF THE GRID BATTLE ROYALE',
      date: '2024-12-15',
      prize: '100,000 $SOL',
      passRequired: 'Legendary NFT',
      status: 'live',
      participants: 1024,
      description: 'Epic cyberpunk battle royale on Solana blockchain',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 5847,
      gameIcon: '🔫',
      contractAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
      nftRequired: true
    },
    {
      id: 'star-atlas-tournament',
      title: 'STAR ATLAS GALACTIC CONQUEST',
      date: '2024-12-18',
      prize: '75,000 $ATLAS',
      passRequired: 'Elite NFT',
      status: 'upcoming',
      participants: 512,
      description: 'Space exploration and combat tournament',
      gameType: 'pacman' as const,
      realGame: true,
      votes: 4123,
      gameIcon: '🚀',
      contractAddress: 'ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx',
      nftRequired: true
    },
    {
      id: 'aurory-championship',
      title: 'AURORY TACTICS CHAMPIONSHIP',
      date: '2024-12-20',
      prize: '50,000 $AURY',
      passRequired: 'Standard NFT',
      status: 'upcoming',
      participants: 256,
      description: 'Strategic creature battles on Solana',
      gameType: 'galaga' as const,
      realGame: true,
      votes: 3456,
      gameIcon: '🐉',
      contractAddress: 'AURYydfxJib1ZkTir1Jn1J9ECnpjNzaSNVnpJLcVyKgF',
      nftRequired: true
    },
    {
      id: 'solana-monkey-kingdom',
      title: 'SOLANA MONKEY KINGDOM WARS',
      date: '2024-12-22',
      prize: '60,000 $SMB',
      passRequired: 'Elite NFT',
      status: 'upcoming',
      participants: 128,
      description: 'Epic monkey battles in the metaverse',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 2987,
      gameIcon: '🐵',
      contractAddress: 'SMBtHCCC6RYRutFEPb4gZqeBLUZbMNhRKaMKZZLHi7W',
      nftRequired: true
    },
    {
      id: 'genopets-tournament',
      title: 'GENOPETS EVOLUTION TOURNAMENT',
      date: '2024-12-25',
      prize: '40,000 $GENE',
      passRequired: 'Standard NFT',
      status: 'upcoming',
      participants: 200,
      description: 'Move-to-earn creature evolution battles',
      gameType: 'pacman' as const,
      realGame: true,
      votes: 2654,
      gameIcon: '🧬',
      contractAddress: 'GENEtH5amGSi8kHAtQoezp1XEXwZJ8vcuePYnXdKrMYz',
      nftRequired: true
    },
    {
      id: 'stepn-racing',
      title: 'STEPN RACING CHAMPIONSHIP',
      date: '2024-12-28',
      prize: '35,000 $GMT',
      passRequired: 'Standard NFT',
      status: 'upcoming',
      participants: 300,
      description: 'Move-to-earn sneaker racing tournament',
      gameType: 'galaga' as const,
      realGame: true,
      votes: 2134,
      gameIcon: '👟',
      contractAddress: 'GMT4VDjete74L8yGDj7HiXgQRUGJQZMXGLRXBGzs9nQ',
      nftRequired: true
    }
  ];

  // Classic game tournaments
  const classicTournaments = [
    {
      id: 'tetris-masters',
      title: 'TETRIS MASTERS CHAMPIONSHIP',
      date: '2024-12-15',
      prize: '50,000 $CCTR',
      passRequired: 'Retro NFT',
      status: 'live',
      participants: 512,
      description: 'Classic block-stacking tournament',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 2847,
      gameIcon: '🧩',
      contractAddress: 'TETRiS9CnJJUGorxTUEjKLEP6nQXPfV7sJhZHMhRCgd',
      nftRequired: true
    },
    {
      id: 'pacman-championship',
      title: 'PACMAN CHAMPIONSHIP',
      date: '2024-12-08',
      prize: '25,000 $CCTR',
      passRequired: 'Arcade NFT',
      status: 'upcoming',
      participants: 256,
      description: 'Classic arcade dot-eating competition',
      gameType: 'pacman' as const,
      realGame: true,
      votes: 1923,
      gameIcon: '👻',
      contractAddress: 'PACMANxGdHzrJNcBjmrfVEjPgGFnQzUgMQHDgdCgXq',
      nftRequired: true
    },
    {
      id: 'galaga-arena',
      title: 'GALAGA ARENA TOURNAMENT',
      date: '2024-12-22',
      prize: '30,000 $CCTR',
      passRequired: 'Space NFT',
      status: 'upcoming',
      participants: 128,
      description: 'Classic space shooter action',
      gameType: 'galaga' as const,
      realGame: true,
      votes: 1654,
      gameIcon: '🚀',
      contractAddress: 'GALAGAxJKLMNoPQRSTUVWXYZabcdefghijklmn',
      nftRequired: true
    },
    {
      id: 'mario-kart-64',
      title: 'MARIO KART 64 GRAND PRIX',
      date: '2024-12-12',
      prize: '20,000 $CCTR',
      passRequired: 'Racing NFT',
      status: 'upcoming',
      participants: 32,
      description: 'Nostalgic N64 racing tournament',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 1456,
      gameIcon: '🏎️',
      contractAddress: 'MARiOKART64xGdHzrJNcBjmrfVEjPgGFnQzUg',
      nftRequired: true
    },
    {
      id: 'super-smash-bros-64',
      title: 'SUPER SMASH BROS 64',
      date: '2024-12-20',
      prize: '15,000 $CCTR',
      passRequired: 'Fighter NFT',
      status: 'upcoming',
      participants: 64,
      description: 'Original Smash Bros tournament',
      gameType: 'pacman' as const,
      realGame: true,
      votes: 1234,
      gameIcon: '👊',
      contractAddress: 'SMASHBROSxGdHzrJNcBjmrfVEjPgGFnQzUgMQ',
      nftRequired: true
    },
    {
      id: 'goldeneye-007',
      title: 'GOLDENEYE 007 TOURNAMENT',
      date: '2024-12-30',
      prize: '18,000 $CCTR',
      passRequired: 'Agent NFT',
      status: 'upcoming',
      participants: 48,
      description: 'Classic N64 FPS tournament',
      gameType: 'galaga' as const,
      realGame: true,
      votes: 987,
      gameIcon: '🕵️',
      contractAddress: 'GOLDENEYExGdHzrJNcBjmrfVEjPgGFnQzUgMQ',
      nftRequired: true
    }
  ];

  // Fighting game tournaments
  const fightingTournaments = [
    {
      id: 'street-fighter-6',
      title: 'STREET FIGHTER 6 CHAMPIONSHIP',
      date: '2024-12-10',
      prize: '40,000 $CCTR',
      passRequired: 'Fighter NFT',
      status: 'live',
      participants: 128,
      description: 'Ultimate fighting game showdown',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 2156,
      gameIcon: '🥊',
      contractAddress: 'STREETFiGHT6xGdHzrJNcBjmrfVEjPgGFnQz',
      nftRequired: true
    },
    {
      id: 'tekken-8-tournament',
      title: 'TEKKEN 8 IRON FIST',
      date: '2024-12-18',
      prize: '35,000 $CCTR',
      passRequired: 'Martial NFT',
      status: 'upcoming',
      participants: 96,
      description: 'King of Iron Fist Tournament',
      gameType: 'pacman' as const,
      realGame: true,
      votes: 1789,
      gameIcon: '👊',
      contractAddress: 'TEKKEN8xGdHzrJNcBjmrfVEjPgGFnQzUgMQHD',
      nftRequired: true
    },
    {
      id: 'mortal-kombat-1',
      title: 'MORTAL KOMBAT 1 FATALITY',
      date: '2024-12-25',
      prize: '45,000 $CCTR',
      passRequired: 'Mortal NFT',
      status: 'upcoming',
      participants: 64,
      description: 'Finish Him! Ultimate MK tournament',
      gameType: 'galaga' as const,
      realGame: true,
      votes: 2043,
      gameIcon: '💀',
      contractAddress: 'MORTALKOMBATxGdHzrJNcBjmrfVEjPgGFnQz',
      nftRequired: true
    },
    {
      id: 'dragon-ball-fighterz',
      title: 'DRAGON BALL FIGHTERZ TOURNAMENT',
      date: '2024-12-14',
      prize: '32,000 $CCTR',
      passRequired: 'Dragon NFT',
      status: 'upcoming',
      participants: 128,
      description: 'Anime fighting spectacular',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 1876,
      gameIcon: '🐉',
      contractAddress: 'DRAGONBALLxGdHzrJNcBjmrfVEjPgGFnQzUg',
      nftRequired: true
    },
    {
      id: 'guilty-gear-strive',
      title: 'GUILTY GEAR STRIVE CHAMPIONSHIP',
      date: '2024-12-19',
      prize: '28,000 $CCTR',
      passRequired: 'Gear NFT',
      status: 'upcoming',
      participants: 96,
      description: 'High-speed anime fighting',
      gameType: 'pacman' as const,
      realGame: true,
      votes: 1654,
      gameIcon: '⚔️',
      contractAddress: 'GUILTYGEARxGdHzrJNcBjmrfVEjPgGFnQzUg',
      nftRequired: true
    },
    {
      id: 'king-of-fighters-15',
      title: 'KING OF FIGHTERS XV',
      date: '2024-12-26',
      prize: '30,000 $CCTR',
      passRequired: 'King NFT',
      status: 'upcoming',
      participants: 128,
      description: 'Team battle fighting tournament',
      gameType: 'galaga' as const,
      realGame: true,
      votes: 1543,
      gameIcon: '👑',
      contractAddress: 'KINGOFFiGHTERSxGdHzrJNcBjmrfVEjPgGFn',
      nftRequired: true
    }
  ];

  // Shooter game tournaments
  const shooterTournaments = [
    {
      id: 'valorant-championship',
      title: 'VALORANT CHAMPIONSHIP',
      date: '2024-12-15',
      prize: '80,000 $CCTR',
      passRequired: 'Agent NFT',
      status: 'live',
      participants: 256,
      description: 'Tactical FPS esports tournament',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 4567,
      gameIcon: '🎯',
      contractAddress: 'VALORANTxGdHzrJNcBjmrfVEjPgGFnQzUgMQ',
      nftRequired: true
    },
    {
      id: 'csgo-masters',
      title: 'CS:GO MASTERS TOURNAMENT',
      date: '2024-12-12',
      prize: '75,000 $CCTR',
      passRequired: 'Counter NFT',
      status: 'upcoming',
      participants: 128,
      description: 'Classic tactical shooter championship',
      gameType: 'pacman' as const,
      realGame: true,
      votes: 3456,
      gameIcon: '🔫',
      contractAddress: 'CSGOMASTERSxGdHzrJNcBjmrfVEjPgGFnQzU',
      nftRequired: true
    },
    {
      id: 'apex-legends-arena',
      title: 'APEX LEGENDS ARENA',
      date: '2024-12-20',
      prize: '60,000 $CCTR',
      passRequired: 'Legend NFT',
      status: 'upcoming',
      participants: 180,
      description: 'Battle royale shooter tournament',
      gameType: 'galaga' as const,
      realGame: true,
      votes: 2987,
      gameIcon: '🏆',
      contractAddress: 'APEXLEGENDSxGdHzrJNcBjmrfVEjPgGFnQz',
      nftRequired: true
    },
    {
      id: 'call-of-duty-warzone',
      title: 'CALL OF DUTY WARZONE',
      date: '2024-12-18',
      prize: '90,000 $CCTR',
      passRequired: 'Warfare NFT',
      status: 'upcoming',
      participants: 200,
      description: 'Battle royale warfare tournament',
      gameType: 'tetris' as const,
      realGame: true,
      votes: 3789,
      gameIcon: '💥',
      contractAddress: 'CODWARZONExGdHzrJNcBjmrfVEjPgGFnQzU',
      nftRequired: true
    },
    {
      id: 'overwatch-2',
      title: 'OVERWATCH 2 CHAMPIONSHIP',
      date: '2024-12-22',
      prize: '55,000 $CCTR',
      passRequired: 'Hero NFT',
      status: 'upcoming',
      participants: 144,
      description: 'Team-based shooter tournament',
      gameType: 'pacman' as const,
      realGame: true,
      votes: 2654,
      gameIcon: '🛡️',
      contractAddress: 'OVERWATCH2xGdHzrJNcBjmrfVEjPgGFnQzU',
      nftRequired: true
    },
    {
      id: 'rainbow-six-siege',
      title: 'RAINBOW SIX SIEGE PRO LEAGUE',
      date: '2024-12-25',
      prize: '70,000 $CCTR',
      passRequired: 'Operator NFT',
      status: 'upcoming',
      participants: 96,
      description: 'Tactical team shooter championship',
      gameType: 'galaga' as const,
      realGame: true,
      votes: 2876,
      gameIcon: '🏢',
      contractAddress: 'RAINBOWSIXxGdHzrJNcBjmrfVEjPgGFnQz',
      nftRequired: true
    }
  ];

  // Get all active tournaments from all categories
  const getActiveTournaments = () => {
    const allTournaments = [...cryptoTournaments, ...classicTournaments, ...fightingTournaments, ...shooterTournaments];
    return allTournaments.filter(tournament => tournament.status === 'live');
  };

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

  const joinTournament = (tournament: any) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to join tournaments",
        variant: "destructive",
      });
      return;
    }

    if (!tournament.nftRequired) {
      toast({
        title: "NFT Required",
        description: `You need a ${tournament.passRequired} to join this tournament`,
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
        case 'tetris': return '🎯';
        case 'pacman': return '💥';
        case 'galaga': return '⚽';
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

  const TournamentCard = ({ tournament }: { tournament: any }) => (
    <Card className="holographic p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-bold text-neon-pink flex items-center gap-2">
            {tournament.gameIcon || getGameIcon(tournament.gameType, tournament.realGame)} {tournament.title}
          </h3>
          <div className="flex gap-2">
            <Badge className={`${tournament.status === 'live' ? 'bg-neon-green animate-pulse' : 'bg-neon-purple'} text-black`}>
              {tournament.status.toUpperCase()}
            </Badge>
            <Badge className="bg-neon-cyan text-black">
              NFT REQUIRED
            </Badge>
          </div>
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

        <div className="text-xs text-gray-400 bg-gray-800 p-2 rounded">
          <span className="text-neon-cyan">Smart Contract:</span> {tournament.contractAddress}
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
            {tournament.passRequired}
          </Badge>
        </div>
      </div>
    </Card>
  );

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
            🏆 SOLANA TOURNAMENT SYSTEMS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => setActiveView('crypto')}
              className={`cyber-button ${activeView === 'crypto' ? 'bg-neon-cyan text-black' : ''}`}
            >
              ⛓️ Crypto Games
            </Button>
            <Button
              onClick={() => setActiveView('classic')}
              className={`cyber-button ${activeView === 'classic' ? 'bg-neon-cyan text-black' : ''}`}
            >
              🎮 Classic Games
            </Button>
            <Button
              onClick={() => setActiveView('fighting')}
              className={`cyber-button ${activeView === 'fighting' ? 'bg-neon-cyan text-black' : ''}`}
            >
              👊 Fighting Games
            </Button>
            <Button
              onClick={() => setActiveView('shooter')}
              className={`cyber-button ${activeView === 'shooter' ? 'bg-neon-cyan text-black' : ''}`}
            >
              🔫 Shooter Games
            </Button>
            <Button
              onClick={() => setActiveView('trivia')}
              className={`cyber-button ${activeView === 'trivia' ? 'bg-neon-cyan text-black' : ''}`}
            >
              🧠 Trivia Challenge
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

      {/* Trivia Game Tab */}
      {activeView === 'trivia' && (
        <TriviaGame />
      )}

      {/* Admin Panel */}
      {activeView === 'admin' && isAdmin && (
        <div className="space-y-8">
          <TournamentAdminPanel isAdmin={isAdmin} />
          <TriviaAdmin isAdmin={isAdmin} />
        </div>
      )}

      {activeView !== 'trivia' && activeView !== 'admin' && (
        <>
          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle className="font-display text-xl text-neon-cyan flex items-center gap-3">
                ⚡ ACTIVE TOURNAMENTS
                <Badge className="bg-neon-red text-white animate-pulse">ACTIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getActiveTournaments().map((tournament) => (
                  <TournamentCard key={tournament.id} tournament={tournament} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Crypto Games Tab */}
          {activeView === 'crypto' && (
            <Card className="arcade-frame">
              <CardHeader>
                <CardTitle className="font-display text-xl text-neon-purple">
                  🚀 CRYPTO GAMES TOURNAMENTS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Play the latest blockchain games and compete for massive crypto prizes on Solana!
                </p>
                
                <div className="grid gap-4">
                  {cryptoTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Classic Games Tab */}
          {activeView === 'classic' && (
            <Card className="arcade-frame">
              <CardHeader>
                <CardTitle className="font-display text-xl text-neon-pink">
                  🎮 CLASSIC GAMES TOURNAMENTS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Compete in nostalgic arcade and retro gaming tournaments with NFT access!
                </p>
                
                <div className="grid gap-4">
                  {classicTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Fighting Games Tab */}
          {activeView === 'fighting' && (
            <Card className="arcade-frame">
              <CardHeader>
                <CardTitle className="font-display text-xl text-neon-pink">
                  👊 FIGHTING GAMES TOURNAMENTS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Battle it out in the ultimate fighting game championships with NFT access!
                </p>
                
                <div className="grid gap-4">
                  {fightingTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Shooter Games Tab */}
          {activeView === 'shooter' && (
            <Card className="arcade-frame">
              <CardHeader>
                <CardTitle className="font-display text-xl text-neon-cyan">
                  🔫 SHOOTER GAMES TOURNAMENTS
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Compete in intense FPS and shooter game tournaments with NFT access!
                </p>
                
                <div className="grid gap-4">
                  {shooterTournaments.map((tournament) => (
                    <TournamentCard key={tournament.id} tournament={tournament} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Solana Tournament System */}
          <SolanaTournamentSystem />

          {/* Live Statistics Section - moved under Solana Tournament System */}
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
                  <div className="text-2xl font-black text-neon-pink">1.2M $CCTR</div>
                  <div className="text-xs text-muted-foreground">Across all tournaments</div>
                </Card>
                <Card className="holographic p-4 text-center">
                  <h4 className="text-neon-purple font-bold mb-2">⚡ ACTIVE MATCHES</h4>
                  <div className="text-2xl font-black text-neon-purple">48</div>
                  <div className="text-xs text-muted-foreground">Live right now</div>
                </Card>
                <Card className="holographic p-4 text-center">
                  <h4 className="text-neon-cyan font-bold mb-2">👥 TOTAL PLAYERS</h4>
                  <div className="text-2xl font-black text-neon-cyan">2,856</div>
                  <div className="text-xs text-muted-foreground">Competing today</div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
