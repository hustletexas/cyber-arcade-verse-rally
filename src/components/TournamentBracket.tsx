import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface Player {
  id: string;
  name: string;
  wallet?: string;
}

interface Match {
  id: string;
  round: number;
  position: number;
  player1?: Player;
  player2?: Player;
  winner?: Player;
  completed: boolean;
}

export const TournamentBracket = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [registeredPlayers, setRegisteredPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [tournamentStarted, setTournamentStarted] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);

  // Initialize empty bracket structure
  useEffect(() => {
    initializeBracket();
  }, []);

  const initializeBracket = () => {
    const bracketMatches: Match[] = [];
    
    // Round 1: 16 matches (32 players)
    for (let i = 0; i < 16; i++) {
      bracketMatches.push({
        id: `r1-m${i}`,
        round: 1,
        position: i,
        completed: false
      });
    }
    
    // Round 2: 8 matches
    for (let i = 0; i < 8; i++) {
      bracketMatches.push({
        id: `r2-m${i}`,
        round: 2,
        position: i,
        completed: false
      });
    }
    
    // Round 3: 4 matches (Quarter-finals)
    for (let i = 0; i < 4; i++) {
      bracketMatches.push({
        id: `r3-m${i}`,
        round: 3,
        position: i,
        completed: false
      });
    }
    
    // Round 4: 2 matches (Semi-finals)
    for (let i = 0; i < 2; i++) {
      bracketMatches.push({
        id: `r4-m${i}`,
        round: 4,
        position: i,
        completed: false
      });
    }
    
    // Round 5: 1 match (Final)
    bracketMatches.push({
      id: 'r5-m0',
      round: 5,
      position: 0,
      completed: false
    });

    setMatches(bracketMatches);
  };

  const registerPlayer = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to register",
        variant: "destructive"
      });
      return;
    }

    if (!newPlayerName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a player name",
        variant: "destructive"
      });
      return;
    }

    if (registeredPlayers.length >= 32) {
      toast({
        title: "Tournament Full",
        description: "Maximum 32 players allowed",
        variant: "destructive"
      });
      return;
    }

    if (tournamentStarted) {
      toast({
        title: "Tournament Started",
        description: "Registration is closed",
        variant: "destructive"
      });
      return;
    }

    const newPlayer: Player = {
      id: `player-${Date.now()}`,
      name: newPlayerName.trim(),
      wallet: user.email // Using email as identifier
    };

    setRegisteredPlayers([...registeredPlayers, newPlayer]);
    setNewPlayerName('');
    
    toast({
      title: "Player Registered!",
      description: `${newPlayer.name} has been registered`,
    });
  };

  const startTournament = () => {
    if (registeredPlayers.length < 2) {
      toast({
        title: "Need More Players",
        description: "At least 2 players required to start",
        variant: "destructive"
      });
      return;
    }

    // Shuffle players and assign to first round matches
    const shuffledPlayers = [...registeredPlayers].sort(() => Math.random() - 0.5);
    const updatedMatches = [...matches];

    // Assign players to Round 1 matches
    for (let i = 0; i < Math.min(16, Math.floor(shuffledPlayers.length / 2)); i++) {
      const matchIndex = updatedMatches.findIndex(m => m.round === 1 && m.position === i);
      if (matchIndex !== -1) {
        updatedMatches[matchIndex].player1 = shuffledPlayers[i * 2];
        updatedMatches[matchIndex].player2 = shuffledPlayers[i * 2 + 1] || undefined;
      }
    }

    setMatches(updatedMatches);
    setTournamentStarted(true);
    
    toast({
      title: "Tournament Started!",
      description: "Players have been seeded into the bracket",
    });
  };

  const advanceWinner = (matchId: string, winner: Player) => {
    const updatedMatches = [...matches];
    const matchIndex = updatedMatches.findIndex(m => m.id === matchId);
    
    if (matchIndex !== -1) {
      updatedMatches[matchIndex].winner = winner;
      updatedMatches[matchIndex].completed = true;

      // Advance winner to next round
      const currentMatch = updatedMatches[matchIndex];
      if (currentMatch.round < 5) {
        const nextRound = currentMatch.round + 1;
        const nextPosition = Math.floor(currentMatch.position / 2);
        const nextMatchIndex = updatedMatches.findIndex(
          m => m.round === nextRound && m.position === nextPosition
        );

        if (nextMatchIndex !== -1) {
          if (!updatedMatches[nextMatchIndex].player1) {
            updatedMatches[nextMatchIndex].player1 = winner;
          } else {
            updatedMatches[nextMatchIndex].player2 = winner;
          }
        }
      }

      setMatches(updatedMatches);
      
      if (currentMatch.round === 5) {
        toast({
          title: "🏆 Tournament Champion!",
          description: `${winner.name} wins the tournament!`,
        });
      } else {
        toast({
          title: "Match Complete!",
          description: `${winner.name} advances to Round ${currentMatch.round + 1}`,
        });
      }
    }
  };

  const getMatchesByRound = (round: number) => {
    return matches.filter(m => m.round === round);
  };

  const getRoundName = (round: number) => {
    switch (round) {
      case 1: return 'Round 1';
      case 2: return 'Round 2';
      case 3: return 'Quarter-Finals';
      case 4: return 'Semi-Finals';
      case 5: return 'Final';
      default: return `Round ${round}`;
    }
  };

  const MatchCard = ({ match }: { match: Match }) => (
    <Card className="p-3 bg-black/30 border border-neon-cyan/30 hover:border-neon-cyan/60 transition-colors">
      <div className="space-y-2">
        <div className="text-xs text-neon-cyan font-mono">
          {getRoundName(match.round)} - Match {match.position + 1}
        </div>
        
        <div className="space-y-1">
          <div className={`flex items-center justify-between p-2 rounded text-sm ${
            match.winner?.id === match.player1?.id ? 'bg-neon-green/20 border border-neon-green/50' : 
            'bg-black/20 border border-gray-600'
          }`}>
            <span className={match.winner?.id === match.player1?.id ? 'text-neon-green font-bold' : 'text-white'}>
              {match.player1?.name || 'TBD'}
            </span>
            {match.player1 && !match.completed && match.player2 && (
              <Button
                size="sm"
                onClick={() => advanceWinner(match.id, match.player1!)}
                className="text-xs cyber-button py-1 px-2"
              >
                Win
              </Button>
            )}
          </div>
          
          <div className="text-xs text-center text-gray-400">VS</div>
          
          <div className={`flex items-center justify-between p-2 rounded text-sm ${
            match.winner?.id === match.player2?.id ? 'bg-neon-green/20 border border-neon-green/50' : 
            'bg-black/20 border border-gray-600'
          }`}>
            <span className={match.winner?.id === match.player2?.id ? 'text-neon-green font-bold' : 'text-white'}>
              {match.player2?.name || 'TBD'}
            </span>
            {match.player2 && !match.completed && (
              <Button
                size="sm"
                onClick={() => advanceWinner(match.id, match.player2!)}
                className="text-xs cyber-button py-1 px-2"
              >
                Win
              </Button>
            )}
          </div>
        </div>

        {match.completed && match.winner && (
          <Badge className="w-full justify-center bg-neon-green text-black">
            🏆 Winner: {match.winner.name}
          </Badge>
        )}
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Registration Section */}
      {!tournamentStarted && (
        <Card className="p-4 bg-black/50 border border-neon-purple">
          <h3 className="text-neon-purple font-bold mb-3">🎮 Tournament Registration</h3>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              className="flex-1 bg-black/20 border-neon-cyan text-white"
              onKeyPress={(e) => e.key === 'Enter' && registerPlayer()}
            />
            <Button onClick={registerPlayer} className="cyber-button">
              Register
            </Button>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">
              Players: {registeredPlayers.length}/32
            </span>
            <Button
              onClick={startTournament}
              disabled={registeredPlayers.length < 2}
              variant="outline"
              className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
            >
              Start Tournament
            </Button>
          </div>

          {registeredPlayers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {registeredPlayers.map((player, index) => (
                <Badge key={player.id} variant="outline" className="text-xs">
                  {index + 1}. {player.name}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Tournament Status */}
      {tournamentStarted && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-neon-cyan font-bold text-lg">🏆 Tournament in Progress</h3>
          <Badge className="bg-neon-green text-black">
            {registeredPlayers.length} Players
          </Badge>
        </div>
      )}

      {/* Bracket Grid */}
      {tournamentStarted && (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1200px] grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(round => (
              <div key={round} className="space-y-4">
                <h4 className="text-center font-bold text-neon-pink border-b border-neon-pink/30 pb-2">
                  {getRoundName(round)}
                </h4>
                <div className="space-y-3">
                  {getMatchesByRound(round).map(match => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!tournamentStarted && registeredPlayers.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          <p>No players registered yet. Be the first to join!</p>
        </div>
      )}
    </div>
  );
};