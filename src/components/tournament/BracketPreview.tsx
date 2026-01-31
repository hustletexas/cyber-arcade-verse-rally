import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Trophy, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TournamentMatch } from '@/types/tournament';

interface BracketPreviewProps {
  tournamentId: string;
  isAdmin?: boolean;
}

// Demo data for showcase when no real matches exist
const generateDemoMatches = (): TournamentMatch[] => {
  const teams = [
    'Astralis', 'Gambit', 'Immortals', 'G2', 'FaZe', 'North', 'Virtus.pro', 'Liquid',
    'Cloud9', 'NAVI', 'FNATIC', 'NiP', 'MIBR', 'ENCE', 'Vitality', 'OG',
    'BIG', 'Heroic', 'Spirit', 'Complexity', 'Evil Geniuses', 'paiN', 'FURIA', 'Imperial',
    'Mouz', 'FPX', 'GamerLegion', 'NRG', 'Apeks', 'Monte', 'SAW', 'Eternal Fire',
    'TheMongolz', 'Lynn', 'TYLOO', 'Rare Atom', 'Grayhound', 'Rooster', 'BOSS', 'ATK',
    '9z', 'BESTIA', 'Case', 'Sharks', 'RED', 'ODDIK', 'Fluxo', 'Liberty',
    'Aurora', 'Endpoint', 'Into the Breach', 'Zero Tenacity', 'ECSTATIC', 'RUBY', 'ex-Guild', 'SINNERS',
    'KOI', '9INE', 'Sampi', 'Permitta', 'PARIVISION', 'Insilio', 'Nexus', 'Enterprise'
  ];
  
  const matches: TournamentMatch[] = [];
  let matchId = 1;
  
  // Round 1: 32 matches (64 players)
  for (let i = 0; i < 32; i++) {
    const winner = Math.random() > 0.5 ? 'a' : 'b';
    matches.push({
      id: `demo-${matchId++}`,
      tournament_id: 'demo',
      round_number: 1,
      match_number: i + 1,
      player_a_id: `player-${i * 2}`,
      player_b_id: `player-${i * 2 + 1}`,
      player_a_wallet: teams[i * 2] || `Team ${i * 2 + 1}`,
      player_b_wallet: teams[i * 2 + 1] || `Team ${i * 2 + 2}`,
      player_a_score: Math.floor(Math.random() * 3),
      player_b_score: Math.floor(Math.random() * 3),
      winner_id: winner === 'a' ? `player-${i * 2}` : `player-${i * 2 + 1}`,
      winner_wallet: winner === 'a' ? teams[i * 2] : teams[i * 2 + 1],
      status: 'completed' as const,
      disputed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  // Round 2: 16 matches
  const round1Winners = matches.filter(m => m.round_number === 1).map(m => ({
    id: m.winner_id!,
    wallet: m.winner_wallet!
  }));
  
  for (let i = 0; i < 16; i++) {
    const winner = Math.random() > 0.5 ? 'a' : 'b';
    matches.push({
      id: `demo-${matchId++}`,
      tournament_id: 'demo',
      round_number: 2,
      match_number: i + 1,
      player_a_id: round1Winners[i * 2]?.id || null,
      player_b_id: round1Winners[i * 2 + 1]?.id || null,
      player_a_wallet: round1Winners[i * 2]?.wallet || 'TBD',
      player_b_wallet: round1Winners[i * 2 + 1]?.wallet || 'TBD',
      player_a_score: Math.floor(Math.random() * 3),
      player_b_score: Math.floor(Math.random() * 3),
      winner_id: winner === 'a' ? round1Winners[i * 2]?.id : round1Winners[i * 2 + 1]?.id,
      winner_wallet: winner === 'a' ? round1Winners[i * 2]?.wallet : round1Winners[i * 2 + 1]?.wallet,
      status: 'completed' as const,
      disputed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  // Round 3: 8 matches
  const round2Winners = matches.filter(m => m.round_number === 2).map(m => ({
    id: m.winner_id!,
    wallet: m.winner_wallet!
  }));
  
  for (let i = 0; i < 8; i++) {
    const winner = Math.random() > 0.5 ? 'a' : 'b';
    matches.push({
      id: `demo-${matchId++}`,
      tournament_id: 'demo',
      round_number: 3,
      match_number: i + 1,
      player_a_id: round2Winners[i * 2]?.id || null,
      player_b_id: round2Winners[i * 2 + 1]?.id || null,
      player_a_wallet: round2Winners[i * 2]?.wallet || 'TBD',
      player_b_wallet: round2Winners[i * 2 + 1]?.wallet || 'TBD',
      player_a_score: Math.floor(Math.random() * 3),
      player_b_score: Math.floor(Math.random() * 3),
      winner_id: winner === 'a' ? round2Winners[i * 2]?.id : round2Winners[i * 2 + 1]?.id,
      winner_wallet: winner === 'a' ? round2Winners[i * 2]?.wallet : round2Winners[i * 2 + 1]?.wallet,
      status: 'completed' as const,
      disputed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  // Round 4: 4 matches (Quarterfinals)
  const round3Winners = matches.filter(m => m.round_number === 3).map(m => ({
    id: m.winner_id!,
    wallet: m.winner_wallet!
  }));
  
  for (let i = 0; i < 4; i++) {
    const winner = Math.random() > 0.5 ? 'a' : 'b';
    matches.push({
      id: `demo-${matchId++}`,
      tournament_id: 'demo',
      round_number: 4,
      match_number: i + 1,
      player_a_id: round3Winners[i * 2]?.id || null,
      player_b_id: round3Winners[i * 2 + 1]?.id || null,
      player_a_wallet: round3Winners[i * 2]?.wallet || 'TBD',
      player_b_wallet: round3Winners[i * 2 + 1]?.wallet || 'TBD',
      player_a_score: Math.floor(Math.random() * 3),
      player_b_score: Math.floor(Math.random() * 3),
      winner_id: winner === 'a' ? round3Winners[i * 2]?.id : round3Winners[i * 2 + 1]?.id,
      winner_wallet: winner === 'a' ? round3Winners[i * 2]?.wallet : round3Winners[i * 2 + 1]?.wallet,
      status: 'completed' as const,
      disputed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  // Round 5: 2 matches (Semifinals)
  const round4Winners = matches.filter(m => m.round_number === 4).map(m => ({
    id: m.winner_id!,
    wallet: m.winner_wallet!
  }));
  
  for (let i = 0; i < 2; i++) {
    const isCompleted = i === 0;
    const winner = Math.random() > 0.5 ? 'a' : 'b';
    matches.push({
      id: `demo-${matchId++}`,
      tournament_id: 'demo',
      round_number: 5,
      match_number: i + 1,
      player_a_id: round4Winners[i * 2]?.id || null,
      player_b_id: round4Winners[i * 2 + 1]?.id || null,
      player_a_wallet: round4Winners[i * 2]?.wallet || 'TBD',
      player_b_wallet: round4Winners[i * 2 + 1]?.wallet || 'TBD',
      player_a_score: isCompleted ? Math.floor(Math.random() * 3) : null,
      player_b_score: isCompleted ? Math.floor(Math.random() * 3) : null,
      winner_id: isCompleted ? (winner === 'a' ? round4Winners[i * 2]?.id : round4Winners[i * 2 + 1]?.id) : null,
      winner_wallet: isCompleted ? (winner === 'a' ? round4Winners[i * 2]?.wallet : round4Winners[i * 2 + 1]?.wallet) : null,
      status: isCompleted ? 'completed' as const : 'in_progress' as const,
      disputed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }
  
  // Round 6: Finals
  const round5Winners = matches.filter(m => m.round_number === 5 && m.status === 'completed').map(m => ({
    id: m.winner_id!,
    wallet: m.winner_wallet!
  }));
  
  matches.push({
    id: `demo-${matchId++}`,
    tournament_id: 'demo',
    round_number: 6,
    match_number: 1,
    player_a_id: round5Winners[0]?.id || null,
    player_b_id: null,
    player_a_wallet: round5Winners[0]?.wallet || 'TBD',
    player_b_wallet: 'TBD',
    player_a_score: null,
    player_b_score: null,
    winner_id: null,
    winner_wallet: null,
    status: 'pending' as const,
    disputed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  return matches;
};

export const BracketPreview: React.FC<BracketPreviewProps> = ({ 
  tournamentId,
  isAdmin = false
}) => {
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [useDemo, setUseDemo] = useState(false);

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
      
      if (!data || data.length === 0) {
        setMatches(generateDemoMatches());
        setUseDemo(true);
      } else {
        setMatches((data || []) as unknown as TournamentMatch[]);
        setUseDemo(false);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setMatches(generateDemoMatches());
      setUseDemo(true);
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
    if (round === total) return 'Grand Finals';
    if (round === total - 1) return 'Finals';
    if (round === total - 2) return 'Semifinals';
    if (round === total - 3) return 'Quarterfinals';
    return `Round ${round}`;
  };

  const getRoundDate = (round: number) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + round - 1);
    return `${baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 18:00`;
  };

  const isRoundCompleted = (roundMatches: TournamentMatch[]) => {
    return roundMatches.every(m => m.status === 'completed');
  };

  const formatTeamName = (wallet: string | null) => {
    if (!wallet || wallet === 'TBD') return 'TBD';
    // If it looks like a wallet address, truncate it
    if (wallet.length > 20) {
      return `${wallet.slice(0, 6)}...`;
    }
    return wallet;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-neon-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 animate-pulse">
            LIVE
          </Badge>
          <span className="text-sm text-muted-foreground">
            {matches.length} matches • {numRounds} rounds
          </span>
          {useDemo && (
            <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
              Demo Data
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchMatches} className="h-8 px-3 gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Bracket Container */}
      <div className="bg-[hsl(var(--card))]/50 rounded-xl border border-border/50 p-6 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {Object.entries(rounds).map(([roundNum, roundMatches], roundIdx) => {
            const round = parseInt(roundNum);
            const isFinals = round >= numRounds - 1;
            const isGrandFinals = round === numRounds;
            const roundComplete = isRoundCompleted(roundMatches);
            const matchHeight = 64; // Height of each match card
            const spacingMultiplier = Math.pow(2, roundIdx);
            const columnWidth = 180;
            
            return (
              <div key={roundNum} className="flex-shrink-0 relative" style={{ width: `${columnWidth}px` }}>
                {/* Round Header */}
                <div className="text-center mb-4 pb-3 border-b border-border/30">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className={`text-sm font-bold ${
                      isGrandFinals ? 'text-yellow-400' : 
                      isFinals ? 'text-neon-purple' : 
                      'text-foreground'
                    }`}>
                      {getRoundLabel(round, numRounds)}
                    </span>
                    {roundComplete && (
                      <Check className="w-4 h-4 text-neon-green" />
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {getRoundDate(round)}
                  </span>
                </div>
                
                {/* Matches Column */}
                <div 
                  className="flex flex-col justify-around relative"
                  style={{ 
                    gap: `${(matchHeight * (spacingMultiplier - 1)) + (16 * spacingMultiplier)}px`,
                    paddingTop: `${(matchHeight * (spacingMultiplier - 1) / 2) + (8 * (spacingMultiplier - 1))}px`
                  }}
                >
                  {roundMatches.map((match, matchIdx) => {
                    const isWinnerA = match.winner_id === match.player_a_id && match.winner_id !== null;
                    const isWinnerB = match.winner_id === match.player_b_id && match.winner_id !== null;
                    const isLive = match.status === 'in_progress';
                    const isPending = match.status === 'pending';
                    
                    return (
                      <div key={match.id} className="relative">
                        {/* Match Card */}
                        <div 
                          className={`
                            rounded-lg overflow-hidden border transition-all duration-300
                            ${isGrandFinals 
                              ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-background to-purple-500/10 shadow-lg shadow-yellow-500/10' 
                              : isFinals
                                ? 'border-neon-purple/50 bg-gradient-to-br from-neon-purple/10 to-background'
                                : 'border-border/50 bg-[hsl(var(--card))]'
                            }
                            ${isLive ? 'ring-2 ring-neon-cyan/50' : ''}
                          `}
                          style={{ height: `${matchHeight}px` }}
                        >
                          {isGrandFinals && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                              <Trophy className="w-6 h-6 text-yellow-400" />
                            </div>
                          )}
                          
                          {/* Player A */}
                          <div className={`
                            flex items-center justify-between px-3 h-1/2 border-b border-border/30
                            ${isWinnerA 
                              ? 'bg-neon-green/10 border-l-2 border-l-neon-green' 
                              : isPending 
                                ? 'border-l-2 border-l-transparent opacity-50'
                                : 'border-l-2 border-l-transparent'
                            }
                          `}>
                            <span className={`text-xs font-medium truncate max-w-[100px] ${
                              isWinnerA ? 'text-foreground' : 
                              match.winner_id && !isWinnerA ? 'text-muted-foreground line-through' : 
                              'text-foreground'
                            }`}>
                              {formatTeamName(match.player_a_wallet)}
                            </span>
                            <span className={`text-xs font-bold min-w-[20px] text-right ${
                              isWinnerA ? 'text-neon-green' : 'text-muted-foreground'
                            }`}>
                              {match.player_a_score ?? '-'}
                            </span>
                          </div>
                          
                          {/* Player B */}
                          <div className={`
                            flex items-center justify-between px-3 h-1/2
                            ${isWinnerB 
                              ? 'bg-neon-green/10 border-l-2 border-l-neon-green' 
                              : isPending 
                                ? 'border-l-2 border-l-transparent opacity-50'
                                : 'border-l-2 border-l-transparent'
                            }
                          `}>
                            <span className={`text-xs font-medium truncate max-w-[100px] ${
                              isWinnerB ? 'text-foreground' : 
                              match.winner_id && !isWinnerB ? 'text-muted-foreground line-through' : 
                              'text-foreground'
                            }`}>
                              {formatTeamName(match.player_b_wallet)}
                            </span>
                            <span className={`text-xs font-bold min-w-[20px] text-right ${
                              isWinnerB ? 'text-neon-green' : 'text-muted-foreground'
                            }`}>
                              {match.player_b_score ?? '-'}
                            </span>
                          </div>
                          
                          {/* Live indicator */}
                          {isLive && (
                            <div className="absolute top-1 right-1">
                              <span className="flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-cyan opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Connector Lines (except for last round) */}
                        {roundIdx < numRounds - 1 && (
                          <>
                            {/* Horizontal line from match */}
                            <div 
                              className="absolute top-1/2 -translate-y-1/2 bg-border/50"
                              style={{ 
                                left: `${columnWidth - 12}px`, 
                                width: '24px',
                                height: '2px'
                              }}
                            />
                            
                            {/* Vertical connector */}
                            {matchIdx % 2 === 0 && roundMatches[matchIdx + 1] && (
                              <div 
                                className="absolute bg-border/50"
                                style={{ 
                                  left: `${columnWidth + 10}px`,
                                  top: '50%',
                                  width: '2px',
                                  height: `${matchHeight * spacingMultiplier + 16 * spacingMultiplier}px`
                                }}
                              />
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neon-green/20 border-2 border-neon-green" />
          <span>Winner</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-cyan"></span>
          </span>
          <span>Live Match</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-border/50 bg-muted/30" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};
