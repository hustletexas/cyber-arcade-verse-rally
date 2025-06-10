import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TournamentGameInterface } from './TournamentGameInterface';
import { Leaderboard } from './Leaderboard';
import { WalletConnector } from './WalletConnector';
import { useAuth } from '@/hooks/useAuth';

export const TournamentSection = () => {
  const { user } = useAuth();
  const [ownedPasses, setOwnedPasses] = useState<string[]>(['elite']);
  const [activeGame, setActiveGame] = useState<{
    tournamentId: string;
    gameType: 'tetris' | 'pacman' | 'galaga';
  } | null>(null);

  const tournaments = [
    {
      id: 'cyber-clash',
      title: 'CYBER CLASH CHAMPIONSHIP',
      date: '2024-12-15',
      prize: '10,000 $CCTR',
      passRequired: 'elite',
      status: 'upcoming',
      participants: 256,
      description: 'The ultimate gaming showdown in the neon-lit arenas',
      gameType: 'tetris' as const
    },
    {
      id: 'neon-nights',
      title: 'NEON NIGHTS BATTLE',
      date: '2024-12-08',
      prize: '5,000 $CCTR',
      passRequired: 'standard',
      status: 'live',
      participants: 128,
      description: 'Fast-paced arcade action under the city lights',
      gameType: 'pacman' as const
    },
    {
      id: 'retro-rumble',
      title: 'RETRO RUMBLE ARENA',
      date: '2024-12-22',
      prize: '15,000 $CCTR',
      passRequired: 'legendary',
      status: 'upcoming',
      participants: 512,
      description: 'Legendary warriors compete for ultimate glory',
      gameType: 'galaga' as const
    }
  ];

  const nftPasses = [
    {
      id: 'standard',
      name: 'STANDARD PASS',
      price: '0.1 SOL',
      features: ['Access to Standard Tournaments', 'Basic Rewards', '24/7 Support'],
      rarity: 'Common',
      holographicColor: 'from-neon-cyan to-neon-purple'
    },
    {
      id: 'elite',
      name: 'ELITE PASS',
      price: '0.5 SOL',
      features: ['All Standard Features', 'Elite Tournaments', 'Bonus Rewards', 'Priority Support'],
      rarity: 'Rare',
      holographicColor: 'from-neon-pink to-neon-green'
    },
    {
      id: 'legendary',
      name: 'LEGENDARY PASS',
      price: '2.0 SOL',
      features: ['All Elite Features', 'Legendary Tournaments', 'Maximum Rewards', 'VIP Support', 'Exclusive NFTs'],
      rarity: 'Legendary',
      holographicColor: 'from-yellow-400 to-orange-500'
    }
  ];

  const mintPass = (passId: string) => {
    console.log(`Minting ${passId} pass`);
    setOwnedPasses([...ownedPasses, passId]);
  };

  const joinTournament = (tournament: typeof tournaments[0]) => {
    if (!user) {
      alert('Please sign in to join tournaments!');
      return;
    }

    setActiveGame({
      tournamentId: tournament.id,
      gameType: tournament.gameType
    });
  };

  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case 'tetris':
        return '🧩';
      case 'pacman':
        return '👻';
      case 'galaga':
        return '🚀';
      default:
        return '🎮';
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

      {/* Main Tournament Tabs */}
      <Tabs defaultValue="tournaments" className="w-full">
        <TabsList className="grid w-full grid-cols-4 arcade-frame p-2">
          <TabsTrigger value="tournaments" className="cyber-button">
            🏆 TOURNAMENTS
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="cyber-button">
            📊 LEADERBOARD
          </TabsTrigger>
          <TabsTrigger value="passes" className="cyber-button">
            🎟️ NFT PASSES
          </TabsTrigger>
          <TabsTrigger value="wallet" className="cyber-button">
            💼 WALLET
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tournaments" className="space-y-6">
          {/* Live Tournaments */}
          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
                🏆 ACTIVE TOURNAMENTS
                <Badge className="bg-neon-green text-black animate-pulse">LIVE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tournaments.map((tournament) => (
                  <Card key={tournament.id} className="vending-machine p-6 hover:scale-105 transition-transform">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <h3 className="font-display text-lg font-bold text-neon-pink flex items-center gap-2">
                          {getGameIcon(tournament.gameType)} {tournament.title}
                        </h3>
                        <Badge className={`${tournament.status === 'live' ? 'bg-neon-green' : 'bg-neon-purple'} text-black`}>
                          {tournament.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground text-sm">{tournament.description}</p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Prize Pool:</span>
                          <span className="text-neon-green font-bold">{tournament.prize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Date:</span>
                          <span className="text-neon-cyan">{tournament.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Participants:</span>
                          <span className="text-neon-purple">{tournament.participants}/512</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Pass Required:</span>
                          <Badge className="bg-neon-pink text-black text-xs">
                            {tournament.passRequired.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Game:</span>
                          <span className="text-neon-cyan font-mono">
                            {tournament.gameType.toUpperCase()}
                          </span>
                        </div>
                      </div>

                      {ownedPasses.includes(tournament.passRequired) ? (
                        <Button 
                          onClick={() => joinTournament(tournament)}
                          className="w-full cyber-button"
                        >
                          🎮 PLAY NOW
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => mintPass(tournament.passRequired)}
                          variant="outline"
                          className="w-full border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                        >
                          🎟️ MINT {tournament.passRequired.toUpperCase()} PASS
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Leaderboard gameType="tetris" limit={10} />
            <Leaderboard gameType="pacman" limit={10} />
          </div>
          <Leaderboard gameType="galaga" limit={15} />
        </TabsContent>

        <TabsContent value="passes" className="space-y-6">
          {/* NFT Tournament Passes */}
          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle className="font-display text-2xl text-neon-purple flex items-center gap-3">
                🎟️ TOURNAMENT NFT PASSES
                <Badge className="bg-neon-cyan text-black">MINT NOW</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {nftPasses.map((pass) => (
                  <Card key={pass.id} className={`holographic p-6 hover:scale-105 transition-all duration-300 ${ownedPasses.includes(pass.id) ? 'border-neon-green border-2' : ''}`}>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`w-24 h-32 mx-auto bg-gradient-to-br ${pass.holographicColor} rounded-lg flex items-center justify-center mb-4 animate-float`}>
                          <span className="text-4xl">🎫</span>
                        </div>
                        <h3 className="font-display text-xl font-bold text-neon-cyan">{pass.name}</h3>
                        <Badge className="bg-neon-purple text-black">{pass.rarity}</Badge>
                      </div>

                      <div className="text-center">
                        <p className="text-2xl font-bold text-neon-green">{pass.price}</p>
                      </div>

                      <div className="space-y-2">
                        {pass.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <span className="text-neon-green">✓</span>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      {ownedPasses.includes(pass.id) ? (
                        <Badge className="w-full bg-neon-green text-black text-center p-2">
                          ✅ OWNED
                        </Badge>
                      ) : (
                        <Button 
                          onClick={() => mintPass(pass.id)}
                          className="w-full cyber-button"
                        >
                          🔨 MINT NFT PASS
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6">
          <WalletConnector />
        </TabsContent>
      </Tabs>
    </div>
  );
};
