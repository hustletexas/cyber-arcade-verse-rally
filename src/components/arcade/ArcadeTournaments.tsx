
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface Tournament {
  id: string;
  name: string;
  game: string;
  gameIcon: string;
  status: 'upcoming' | 'active' | 'ended';
  entryFee: number;
  prizePool: number;
  participants: number;
  maxParticipants: number;
  startDate: string;
  endDate: string;
  description: string;
  theme?: string;
}

export const ArcadeTournaments = () => {
  const [selectedTournament, setSelectedTournament] = useState<string | null>(null);

  const tournaments: Tournament[] = [
    {
      id: '1',
      name: 'Pac-Man Marathon',
      game: 'Pac-Man Classic',
      gameIcon: '🟡',
      status: 'active',
      entryFee: 50,
      prizePool: 15000,
      participants: 287,
      maxParticipants: 500,
      startDate: '2024-01-15',
      endDate: '2024-01-22',
      description: 'Week-long Pac-Man championship with escalating difficulty',
      theme: '80s Retro Week'
    },
    {
      id: '2',
      name: 'Galaga Space Battle',
      game: 'Galaga Deluxe',
      gameIcon: '🚀',
      status: 'upcoming',
      entryFee: 75,
      prizePool: 22500,
      participants: 156,
      maxParticipants: 300,
      startDate: '2024-01-20',
      endDate: '2024-01-27',
      description: 'Epic space shooter tournament with cosmic rewards',
      theme: 'Futuristic Space Shootout'
    },
    {
      id: '3',
      name: 'Cyber Tetris Championship',
      game: 'Cyber Tetris',
      gameIcon: '🧩',
      status: 'upcoming',
      entryFee: 100,
      prizePool: 50000,
      participants: 89,
      maxParticipants: 250,
      startDate: '2024-01-25',
      endDate: '2024-02-01',
      description: 'Ultimate block-stacking challenge with massive rewards'
    },
    {
      id: '4',
      name: 'Retro Arcade Masters',
      game: 'Mixed Games',
      gameIcon: '👾',
      status: 'ended',
      entryFee: 200,
      prizePool: 75000,
      participants: 400,
      maxParticipants: 400,
      startDate: '2024-01-01',
      endDate: '2024-01-08',
      description: 'Multi-game tournament featuring classic arcade games',
      theme: 'New Year Retro Blast'
    }
  ];

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'upcoming': return 'bg-blue-500 text-white';
      case 'ended': return 'bg-gray-500 text-white';
    }
  };

  const joinTournament = (tournamentId: string) => {
    // TODO: Implement tournament joining logic
    console.log('Joining tournament:', tournamentId);
  };

  return (
    <div className="space-y-6">
      {/* Tournaments Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-pink text-center">
            🎯 ARCADE TOURNAMENTS
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Join epic gaming competitions • Win massive CCTR prizes • Exclusive NFT rewards
          </p>
        </CardHeader>
      </Card>

      {/* Featured Tournament Banner */}
      <Card className="arcade-frame border-neon-pink/60">
        <CardContent className="text-center py-8">
          <div className="space-y-4">
            <div className="text-4xl">🏆</div>
            <h3 className="text-2xl font-bold text-neon-pink">Weekly Championship</h3>
            <p className="text-lg text-neon-cyan">Prize Pool: 100,000 CCTR</p>
            <p className="text-gray-400">Multi-game tournament featuring all arcade classics</p>
            <Button className="cyber-button bg-neon-pink text-black hover:bg-neon-pink/80">
              🎮 JOIN NOW
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tournaments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tournaments.map((tournament) => (
          <Card key={tournament.id} className="arcade-frame hover:scale-105 transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{tournament.gameIcon}</div>
                  <div>
                    <CardTitle className="font-display text-lg text-neon-cyan">
                      {tournament.name}
                    </CardTitle>
                    <p className="text-sm text-gray-400">{tournament.game}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(tournament.status)}>
                  {tournament.status.toUpperCase()}
                </Badge>
              </div>
              
              {tournament.theme && (
                <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple w-fit">
                  🎭 {tournament.theme}
                </Badge>
              )}
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-400">{tournament.description}</p>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Entry Fee:</span>
                  <span className="text-neon-green font-bold">{tournament.entryFee} CCTR</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Prize Pool:</span>
                  <span className="text-neon-pink font-bold">{tournament.prizePool.toLocaleString()} CCTR</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Participants:</span>
                    <span className="text-neon-cyan">{tournament.participants}/{tournament.maxParticipants}</span>
                  </div>
                  <Progress 
                    value={(tournament.participants / tournament.maxParticipants) * 100} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Start:</span>
                    <span className="text-gray-400">{tournament.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">End:</span>
                    <span className="text-gray-400">{tournament.endDate}</span>
                  </div>
                </div>
              </div>

              {tournament.status === 'active' ? (
                <Button className="cyber-button w-full bg-green-600 hover:bg-green-700">
                  🎮 PLAY NOW
                </Button>
              ) : tournament.status === 'upcoming' ? (
                <Button 
                  onClick={() => joinTournament(tournament.id)}
                  className="cyber-button w-full"
                  disabled={tournament.participants >= tournament.maxParticipants}
                >
                  {tournament.participants >= tournament.maxParticipants ? '🔒 FULL' : '🎯 JOIN TOURNAMENT'}
                </Button>
              ) : (
                <Button variant="outline" className="w-full border-gray-500 text-gray-500" disabled>
                  📊 VIEW RESULTS
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tournament Rules */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-lg text-neon-cyan">
            📜 Tournament Rules & Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-2">
              <h4 className="font-bold text-neon-purple">General Rules:</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• Entry fee required in CCTR tokens</li>
                <li>• Multiple attempts allowed during tournament period</li>
                <li>• Only your highest score counts</li>
                <li>• Fair play enforcement with anti-cheat measures</li>
                <li>• Prizes distributed automatically after tournament ends</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-bold text-neon-green">Reward Structure:</h4>
              <ul className="space-y-1 text-gray-400">
                <li>• 1st Place: 40% of prize pool + Exclusive NFT</li>
                <li>• 2nd Place: 25% of prize pool + Special Badge</li>
                <li>• 3rd Place: 15% of prize pool + Achievement</li>
                <li>• Top 10: 20% of prize pool (distributed)</li>
                <li>• All participants: Participation rewards</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
