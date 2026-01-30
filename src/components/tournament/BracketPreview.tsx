import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TournamentMatch } from '@/types/tournament';

interface BracketPreviewProps {
  tournamentId: string;
  isAdmin?: boolean;
}

export const BracketPreview: React.FC<BracketPreviewProps> = ({ 
  tournamentId,
  isAdmin = false
}) => {
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true });

      if (error) throw error;
      // Cast the data to TournamentMatch[] to handle JSON type compatibility
      setMatches((data || []) as unknown as TournamentMatch[]);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [tournamentId]);

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
    if (round === total - 1) return 'Semis';
    if (round === total - 2) return 'Quarters';
    return `R${round}`;
  };

  const formatWallet = (wallet: string | null) => {
    if (!wallet) return 'TBD';
    return `${wallet.slice(0, 6)}...`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin text-neon-purple" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <Trophy className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">Bracket not generated yet</p>
        <p className="text-xs text-muted-foreground mt-1">Check back once the tournament starts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className="bg-neon-green/20 text-neon-green animate-pulse">LIVE</Badge>
          <span className="text-xs text-muted-foreground">{matches.length} matches</span>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchMatches} className="h-7 px-2">
          <RefreshCw className="w-3 h-3" />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-4 min-w-max">
          {Object.entries(rounds).map(([roundNum, roundMatches], roundIdx) => {
            const round = parseInt(roundNum);
            const isFinals = round === numRounds;
            const spacingMultiplier = Math.pow(2, roundIdx);
            
            return (
              <div key={roundNum} className="flex-shrink-0" style={{ width: '160px' }}>
                {/* Round Header */}
                <div className="text-center mb-2">
                  <span className={`text-xs font-semibold ${isFinals ? 'text-yellow-400' : 'text-neon-purple'}`}>
                    {getRoundLabel(round, numRounds)}
                  </span>
                </div>
                
                {/* Matches */}
                <div 
                  className="flex flex-col justify-around"
                  style={{ gap: `${8 * spacingMultiplier}px` }}
                >
                  {roundMatches.map((match) => (
                    <div 
                      key={match.id}
                      className={`
                        rounded-md overflow-hidden border text-xs
                        ${isFinals 
                          ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-purple-500/10' 
                          : 'border-neon-purple/30 bg-background/50'
                        }
                      `}
                    >
                      {isFinals && (
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[10px] font-bold text-center py-0.5">
                          🏆 FINALS
                        </div>
                      )}
                      
                      {/* Player A */}
                      <div className={`
                        flex items-center justify-between px-2 py-1.5 border-l-2
                        ${match.winner_id === match.player_a_id ? 'border-neon-green bg-neon-green/10' : 'border-transparent'}
                      `}>
                        <span className="font-mono text-gray-300">
                          {formatWallet(match.player_a_wallet)}
                        </span>
                        <span className={match.winner_id === match.player_a_id ? 'text-neon-green font-bold' : 'text-gray-500'}>
                          {match.player_a_score ?? '-'}
                        </span>
                      </div>
                      
                      <div className="h-px bg-neon-purple/20" />
                      
                      {/* Player B */}
                      <div className={`
                        flex items-center justify-between px-2 py-1.5 border-l-2
                        ${match.winner_id === match.player_b_id ? 'border-neon-green bg-neon-green/10' : 'border-transparent'}
                      `}>
                        <span className="font-mono text-gray-300">
                          {formatWallet(match.player_b_wallet)}
                        </span>
                        <span className={match.winner_id === match.player_b_id ? 'text-neon-green font-bold' : 'text-gray-500'}>
                          {match.player_b_score ?? '-'}
                        </span>
                      </div>
                      
                      {/* Status */}
                      {match.status !== 'completed' && (
                        <div className="px-2 py-1 bg-background/50 border-t border-neon-purple/10">
                          <Badge 
                            variant="outline" 
                            className={`
                              text-[9px] h-4 capitalize
                              ${match.status === 'in_progress' ? 'border-neon-cyan/50 text-neon-cyan' : 'border-gray-500/50 text-gray-400'}
                            `}
                          >
                            {match.status === 'in_progress' ? 'Live' : match.status}
                          </Badge>
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
    </div>
  );
};
