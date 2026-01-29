import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Trophy, Calendar, Check } from 'lucide-react';
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

  const getRoundLabel = (round: number, total: number) => {
    if (round === total) return 'Finals';
    if (round === total - 1) return 'Semifinals';
    if (round === total - 2) return 'Quarterfinals';
    return `Round ${round}`;
  };

  const getRoundDate = (roundMatches: TournamentMatch[]) => {
    const firstMatch = roundMatches.find(m => m.scheduled_time);
    if (firstMatch?.scheduled_time) {
      const date = new Date(firstMatch.scheduled_time);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + 
             date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return 'TBD';
  };

  if (matches.length === 0) {
    return (
      <Card className="bg-[#1a1a2e]/90 border-purple-500/30">
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
        <h3 className="font-display text-xl text-purple-400">Tournament Bracket</h3>
        <Button variant="outline" size="sm" onClick={onRefresh} className="border-purple-500/50 hover:bg-purple-500/20">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="overflow-x-auto bg-[#0d0d1a] rounded-xl border border-purple-500/20 p-6">
        {/* Round Headers */}
        <div className="flex gap-0 min-w-max mb-2">
          {Object.entries(rounds).map(([roundNum, roundMatches], idx) => (
            <div 
              key={`header-${roundNum}`} 
              className="flex-shrink-0"
              style={{ width: '220px', marginRight: idx < Object.keys(rounds).length - 1 ? '40px' : 0 }}
            >
              <div className="text-center">
                <h4 className="text-purple-300 font-semibold text-sm mb-1">
                  {getRoundLabel(parseInt(roundNum), numRounds)}
                </h4>
                <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{getRoundDate(roundMatches)}</span>
                  <Check className="w-3 h-3 text-purple-400 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bracket Lines and Matches */}
        <div className="flex gap-0 min-w-max pt-4 relative">
          {Object.entries(rounds).map(([roundNum, roundMatches], roundIdx) => {
            const round = parseInt(roundNum);
            const isLastRound = roundIdx === Object.keys(rounds).length - 1;
            
            // Calculate spacing multiplier based on round
            const spacingMultiplier = Math.pow(2, roundIdx);
            const baseGap = 16; // Base gap between matches in first round
            
            return (
              <div 
                key={roundNum} 
                className="flex-shrink-0 relative"
                style={{ 
                  width: '220px',
                  marginRight: isLastRound ? 0 : '40px'
                }}
              >
                <div 
                  className="flex flex-col justify-around"
                  style={{ 
                    gap: `${baseGap * spacingMultiplier}px`,
                    minHeight: `${roundMatches.length * 100 + (roundMatches.length - 1) * baseGap * spacingMultiplier}px`
                  }}
                >
                  {roundMatches.map((match, matchIdx) => (
                    <div key={match.id} className="relative">
                      {/* Match Card */}
                      <MatchCard 
                        match={match}
                        isAdmin={isAdmin}
                        isFinals={round === numRounds}
                        onClick={() => isAdmin && setSelectedMatch(match)}
                      />
                      
                      {/* Connector Lines to next round */}
                      {!isLastRound && (
                        <div className="absolute right-0 top-1/2 transform translate-x-full">
                          <svg width="40" height="2" className="overflow-visible">
                            <line 
                              x1="0" y1="0" 
                              x2="40" y2="0" 
                              stroke="rgba(139, 92, 246, 0.4)" 
                              strokeWidth="2"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
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

// Individual Match Card Component
const MatchCard: React.FC<{
  match: TournamentMatch;
  isAdmin: boolean;
  isFinals: boolean;
  onClick: () => void;
}> = ({ match, isAdmin, isFinals, onClick }) => {
  const formatWallet = (wallet: string | null) => {
    if (!wallet) return 'TBD';
    return `${wallet.slice(0, 8)}...`;
  };

  const getPlayerStyle = (isWinner: boolean) => {
    if (isWinner) {
      return 'bg-purple-500/30 border-purple-400';
    }
    return 'bg-[#1e1e32] border-transparent';
  };

  return (
    <div 
      className={`
        rounded-lg overflow-hidden border transition-all duration-200
        ${isFinals 
          ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-purple-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]' 
          : 'border-purple-500/30 bg-[#1a1a2e]/90 hover:border-purple-400/50'
        }
        ${isAdmin ? 'cursor-pointer hover:scale-[1.02]' : ''}
      `}
      onClick={onClick}
    >
      {/* Finals badge */}
      {isFinals && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold text-center py-1">
          🏆 FINALS
        </div>
      )}
      
      {/* Player A */}
      <div className={`
        flex items-center justify-between px-3 py-2 border-l-2 transition-colors
        ${getPlayerStyle(match.winner_id === match.player_a_id)}
      `}>
        <div className="flex items-center gap-2">
          {match.winner_id === match.player_a_id && (
            <Trophy className="w-3 h-3 text-green-400" />
          )}
          <span className="text-sm text-gray-200 font-mono">
            {formatWallet(match.player_a_wallet)}
          </span>
        </div>
        <span className={`
          font-bold text-sm min-w-[24px] text-center rounded px-1
          ${match.winner_id === match.player_a_id ? 'text-green-400' : 'text-gray-400'}
        `}>
          {match.player_a_score ?? '-'}
        </span>
      </div>

      {/* Divider */}
      <div className="h-px bg-purple-500/20" />

      {/* Player B */}
      <div className={`
        flex items-center justify-between px-3 py-2 border-l-2 transition-colors
        ${getPlayerStyle(match.winner_id === match.player_b_id)}
      `}>
        <div className="flex items-center gap-2">
          {match.winner_id === match.player_b_id && (
            <Trophy className="w-3 h-3 text-green-400" />
          )}
          <span className="text-sm text-gray-200 font-mono">
            {formatWallet(match.player_b_wallet)}
          </span>
        </div>
        <span className={`
          font-bold text-sm min-w-[24px] text-center rounded px-1
          ${match.winner_id === match.player_b_id ? 'text-green-400' : 'text-gray-400'}
        `}>
          {match.player_b_score ?? '-'}
        </span>
      </div>

      {/* Match Status / Report Button */}
      {match.status !== 'completed' && (
        <div className="px-3 py-1.5 bg-[#12121f] border-t border-purple-500/10">
          <div className="flex items-center justify-between">
            <Badge 
              variant="outline" 
              className={`
                text-[10px] capitalize
                ${match.status === 'in_progress' ? 'border-cyan-500/50 text-cyan-400' : 
                  match.status === 'disputed' ? 'border-red-500/50 text-red-400' : 
                  'border-gray-500/50 text-gray-400'}
              `}
            >
              {match.status.replace('_', ' ')}
            </Badge>
            {isAdmin && match.status === 'pending' && match.player_a_id && match.player_b_id && (
              <span className="text-[10px] text-purple-400">Click to report</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
