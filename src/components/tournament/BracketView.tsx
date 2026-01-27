import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trophy } from 'lucide-react';
import { TournamentMatch } from '@/types/tournament';
import { MatchReportModal } from './MatchReportModal';

interface BracketViewProps {
  tournamentId: string;
  matches: TournamentMatch[];
  onRefresh: () => void;
  isAdmin?: boolean;
}

export const BracketView: React.FC<BracketViewProps> = ({ 
  tournamentId,
  matches,
  onRefresh,
  isAdmin = false
}) => {
  const [selectedMatch, setSelectedMatch] = useState<TournamentMatch | null>(null);

  // Group matches by round
  const rounds = matches.reduce((acc, match) => {
    const round = match.round_number;
    if (!acc[round]) acc[round] = [];
    acc[round].push(match);
    return acc;
  }, {} as Record<number, TournamentMatch[]>);

  const numRounds = Object.keys(rounds).length;

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-neon-green';
      case 'in_progress': return 'border-neon-cyan animate-pulse';
      case 'disputed': return 'border-red-500';
      default: return 'border-border';
    }
  };

  const getRoundLabel = (round: number, total: number) => {
    if (round === total) return 'Finals';
    if (round === total - 1) return 'Semifinals';
    if (round === total - 2) return 'Quarterfinals';
    return `Round ${round}`;
  };

  if (matches.length === 0) {
    return (
      <Card className="arcade-frame">
        <CardContent className="py-12 text-center">
          <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Bracket not generated yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl text-neon-pink">Tournament Bracket</h3>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-8 min-w-max p-4">
          {Object.entries(rounds).map(([roundNum, roundMatches]) => (
            <div key={roundNum} className="flex flex-col gap-4">
              <h4 className="text-center font-display text-neon-cyan">
                {getRoundLabel(parseInt(roundNum), numRounds)}
              </h4>
              <div className="flex flex-col gap-4 justify-around h-full">
                {roundMatches.map(match => (
                  <Card 
                    key={match.id}
                    className={`arcade-frame w-64 cursor-pointer hover:scale-105 transition-transform ${getMatchStatusColor(match.status)}`}
                    onClick={() => isAdmin && setSelectedMatch(match)}
                  >
                    <CardContent className="p-3 space-y-2">
                      {/* Match Header */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Match {match.match_number}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {match.status}
                        </Badge>
                      </div>

                      {/* Player A */}
                      <div className={`p-2 rounded-lg ${
                        match.winner_id === match.player_a_id 
                          ? 'bg-neon-green/20 border border-neon-green' 
                          : 'bg-background/50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">
                            {match.player_a_wallet 
                              ? `${match.player_a_wallet.slice(0, 6)}...${match.player_a_wallet.slice(-4)}`
                              : 'TBD'}
                          </span>
                          {match.player_a_score !== null && (
                            <span className="font-bold">{match.player_a_score}</span>
                          )}
                          {match.winner_id === match.player_a_id && (
                            <Trophy className="w-4 h-4 text-neon-green" />
                          )}
                        </div>
                      </div>

                      <div className="text-center text-xs text-muted-foreground">vs</div>

                      {/* Player B */}
                      <div className={`p-2 rounded-lg ${
                        match.winner_id === match.player_b_id 
                          ? 'bg-neon-green/20 border border-neon-green' 
                          : 'bg-background/50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm">
                            {match.player_b_wallet 
                              ? `${match.player_b_wallet.slice(0, 6)}...${match.player_b_wallet.slice(-4)}`
                              : 'TBD'}
                          </span>
                          {match.player_b_score !== null && (
                            <span className="font-bold">{match.player_b_score}</span>
                          )}
                          {match.winner_id === match.player_b_id && (
                            <Trophy className="w-4 h-4 text-neon-green" />
                          )}
                        </div>
                      </div>

                      {/* Admin Report Button */}
                      {isAdmin && match.status === 'pending' && match.player_a_id && match.player_b_id && (
                        <Button 
                          size="sm" 
                          className="w-full mt-2"
                          variant="outline"
                        >
                          Report Result
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Match Report Modal */}
      {selectedMatch && (
        <MatchReportModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          onSuccess={() => {
            setSelectedMatch(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
};
