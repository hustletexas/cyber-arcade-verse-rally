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

interface DemoMatch {
  id: string;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  winner: 'a' | 'b' | null;
  status: 'completed' | 'in_progress' | 'pending';
}

// Generate demo bracket data
const generateDemoBracket = () => {
  const teams = [
    'Astralis', 'Gambit', 'Immortals', 'G2', 'FaZe', 'North', 'Virtus.pro', 'Liquid'
  ];
  
  // Upper Bracket - Round 1 (4 matches)
  const upperR1: DemoMatch[] = [
    { id: 'u1-1', teamA: 'Astralis', teamB: 'Gambit', scoreA: 1, scoreB: 0, winner: 'a', status: 'completed' },
    { id: 'u1-2', teamA: 'Immortals', teamB: 'G2', scoreA: 0, scoreB: 1, winner: 'b', status: 'completed' },
    { id: 'u1-3', teamA: 'FaZe', teamB: 'North', scoreA: 1, scoreB: 0, winner: 'a', status: 'completed' },
    { id: 'u1-4', teamA: 'Virtus.pro', teamB: 'Liquid', scoreA: 0, scoreB: 1, winner: 'b', status: 'completed' },
  ];
  
  // Upper Bracket - Round 2 (2 matches)
  const upperR2: DemoMatch[] = [
    { id: 'u2-1', teamA: 'Astralis', teamB: 'G2', scoreA: 1, scoreB: 0, winner: 'a', status: 'completed' },
    { id: 'u2-2', teamA: 'FaZe', teamB: 'Liquid', scoreA: 0, scoreB: 1, winner: 'b', status: 'completed' },
  ];
  
  // Upper Bracket - Finals (1 match)
  const upperFinals: DemoMatch[] = [
    { id: 'uf-1', teamA: 'Astralis', teamB: 'Liquid', scoreA: 1, scoreB: 2, winner: 'b', status: 'completed' },
  ];
  
  // Losers Bracket - Round 1 (2 matches - losers from Upper R1)
  const lowerR1: DemoMatch[] = [
    { id: 'l1-1', teamA: 'Gambit', teamB: 'Immortals', scoreA: 1, scoreB: 0, winner: 'a', status: 'completed' },
    { id: 'l1-2', teamA: 'North', teamB: 'Virtus.pro', scoreA: 0, scoreB: 1, winner: 'b', status: 'completed' },
  ];
  
  // Losers Bracket - Round 2 (2 matches - LR1 winners vs Upper R2 losers)
  const lowerR2: DemoMatch[] = [
    { id: 'l2-1', teamA: 'Gambit', teamB: 'G2', scoreA: 0, scoreB: 1, winner: 'b', status: 'completed' },
    { id: 'l2-2', teamA: 'Virtus.pro', teamB: 'FaZe', scoreA: null, scoreB: null, winner: null, status: 'in_progress' },
  ];
  
  // Losers Bracket - Finals (1 match)
  const lowerFinals: DemoMatch[] = [
    { id: 'lf-1', teamA: 'G2', teamB: 'TBD', scoreA: null, scoreB: null, winner: null, status: 'pending' },
  ];
  
  // Grand Finals
  const grandFinals: DemoMatch[] = [
    { id: 'gf-1', teamA: 'Liquid', teamB: 'TBD', scoreA: null, scoreB: null, winner: null, status: 'pending' },
  ];
  
  return {
    upper: [upperR1, upperR2, upperFinals],
    lower: [lowerR1, lowerR2, lowerFinals],
    grandFinals,
  };
};

const MatchCard: React.FC<{
  match: DemoMatch;
  isGrandFinals?: boolean;
  isFinals?: boolean;
}> = ({ match, isGrandFinals = false, isFinals = false }) => {
  const isWinnerA = match.winner === 'a';
  const isWinnerB = match.winner === 'b';
  const isLive = match.status === 'in_progress';
  const isPending = match.status === 'pending';
  
  return (
    <div 
      className={`
        rounded-lg overflow-hidden border transition-all duration-300 w-[150px]
        ${isGrandFinals 
          ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 via-background to-purple-500/10 shadow-lg shadow-yellow-500/10' 
          : isFinals
            ? 'border-neon-purple/50 bg-gradient-to-br from-neon-purple/10 to-background'
            : 'border-border/50 bg-[hsl(var(--card))]'
        }
        ${isLive ? 'ring-2 ring-neon-cyan/50' : ''}
      `}
    >
      {isGrandFinals && (
        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-[9px] font-bold text-center py-0.5 flex items-center justify-center gap-1">
          <Trophy className="w-3 h-3" /> GRAND FINALS
        </div>
      )}
      
      {/* Player A */}
      <div className={`
        flex items-center justify-between px-2 py-1.5 border-b border-border/30
        ${isWinnerA 
          ? 'bg-neon-green/10 border-l-2 border-l-neon-green' 
          : isPending 
            ? 'border-l-2 border-l-transparent opacity-50'
            : 'border-l-2 border-l-transparent'
        }
      `}>
        <span className={`text-[11px] font-medium truncate max-w-[90px] ${
          isWinnerA ? 'text-foreground' : 
          match.winner && !isWinnerA ? 'text-muted-foreground line-through' : 
          'text-foreground'
        }`}>
          {match.teamA}
        </span>
        <span className={`text-[11px] font-bold min-w-[16px] text-right ${
          isWinnerA ? 'text-neon-green' : 'text-muted-foreground'
        }`}>
          {match.scoreA ?? '-'}
        </span>
      </div>
      
      {/* Player B */}
      <div className={`
        flex items-center justify-between px-2 py-1.5
        ${isWinnerB 
          ? 'bg-neon-green/10 border-l-2 border-l-neon-green' 
          : isPending 
            ? 'border-l-2 border-l-transparent opacity-50'
            : 'border-l-2 border-l-transparent'
        }
      `}>
        <span className={`text-[11px] font-medium truncate max-w-[90px] ${
          isWinnerB ? 'text-foreground' : 
          match.winner && !isWinnerB ? 'text-muted-foreground line-through' : 
          'text-foreground'
        }`}>
          {match.teamB}
        </span>
        <span className={`text-[11px] font-bold min-w-[16px] text-right ${
          isWinnerB ? 'text-neon-green' : 'text-muted-foreground'
        }`}>
          {match.scoreB ?? '-'}
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
  );
};

const RoundColumn: React.FC<{
  title: string;
  date: string;
  matches: DemoMatch[];
  isCompleted?: boolean;
  isFinals?: boolean;
  spacing?: number;
}> = ({ title, date, matches, isCompleted = false, isFinals = false, spacing = 0 }) => {
  return (
    <div className="flex flex-col items-center" style={{ minWidth: '160px' }}>
      {/* Round Header */}
      <div className="text-center mb-3 pb-2 border-b border-border/30 w-full">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <span className={`text-xs font-bold ${isFinals ? 'text-neon-purple' : 'text-foreground'}`}>
            {title}
          </span>
          {isCompleted && <Check className="w-3 h-3 text-neon-green" />}
        </div>
        <span className="text-[10px] text-muted-foreground">{date}</span>
      </div>
      
      {/* Matches */}
      <div 
        className="flex flex-col justify-around flex-1"
        style={{ gap: `${16 + spacing * 48}px` }}
      >
        {matches.map((match) => (
          <div key={match.id} className="relative">
            <MatchCard match={match} isFinals={isFinals} />
          </div>
        ))}
      </div>
    </div>
  );
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
        setUseDemo(true);
      } else {
        setMatches((data || []) as unknown as TournamentMatch[]);
        setUseDemo(false);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      setUseDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [tournamentId]);

  const demoBracket = generateDemoBracket();
  const totalMatches = useDemo 
    ? demoBracket.upper.flat().length + demoBracket.lower.flat().length + demoBracket.grandFinals.length
    : matches.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="w-8 h-8 animate-spin text-neon-purple" />
      </div>
    );
  }

  const getRoundDate = (offset: number) => {
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + offset);
    return `${baseDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 18:00`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 animate-pulse">
            LIVE
          </Badge>
          <span className="text-sm text-muted-foreground">
            {totalMatches} matches • Double Elimination
          </span>
          {useDemo && (
            <Badge variant="outline" className="text-xs text-yellow-500 border-yellow-500/30">
              Demo
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={fetchMatches} className="h-8 px-3 gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Double Elimination Bracket */}
      <div className="bg-[hsl(var(--card))]/50 rounded-xl border border-border/50 p-4 overflow-x-auto">
        <div className="flex flex-col gap-6 min-w-max">
          
          {/* Upper Bracket Label */}
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-neon-purple/30 to-neon-purple/50" />
            <span className="text-xs font-bold text-neon-purple px-3">WINNERS BRACKET</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-neon-purple/30 to-neon-purple/50" />
          </div>
          
          {/* Upper Bracket */}
          <div className="flex items-center justify-center gap-4">
            <RoundColumn 
              title="Round 1" 
              date={getRoundDate(0)} 
              matches={demoBracket.upper[0]} 
              isCompleted={true}
              spacing={0}
            />
            <div className="w-8 h-px bg-border/30" />
            <RoundColumn 
              title="Round 2" 
              date={getRoundDate(1)} 
              matches={demoBracket.upper[1]} 
              isCompleted={true}
              spacing={1}
            />
            <div className="w-8 h-px bg-border/30" />
            <RoundColumn 
              title="Upper Finals" 
              date={getRoundDate(2)} 
              matches={demoBracket.upper[2]} 
              isCompleted={true}
              isFinals={true}
              spacing={2}
            />
          </div>
          
          {/* Grand Finals (Center) */}
          <div className="flex justify-center py-4">
            <div className="flex flex-col items-center">
              <div className="text-center mb-3 pb-2 border-b border-yellow-500/30 w-full">
                <div className="flex items-center justify-center gap-1.5 mb-0.5">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-bold text-yellow-400">Grand Finals</span>
                </div>
                <span className="text-[10px] text-muted-foreground">{getRoundDate(5)}</span>
              </div>
              <MatchCard match={demoBracket.grandFinals[0]} isGrandFinals={true} />
            </div>
          </div>
          
          {/* Lower Bracket Label */}
          <div className="flex items-center gap-2 mb-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/30 to-red-500/50" />
            <span className="text-xs font-bold text-red-400 px-3">LOSERS BRACKET</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/30 to-red-500/50" />
          </div>
          
          {/* Lower Bracket */}
          <div className="flex items-center justify-center gap-4">
            <RoundColumn 
              title="Losers Round 1" 
              date={getRoundDate(1)} 
              matches={demoBracket.lower[0]} 
              isCompleted={true}
              spacing={0}
            />
            <div className="w-8 h-px bg-border/30" />
            <RoundColumn 
              title="Losers Round 2" 
              date={getRoundDate(2)} 
              matches={demoBracket.lower[1]} 
              isCompleted={false}
              spacing={0}
            />
            <div className="w-8 h-px bg-border/30" />
            <RoundColumn 
              title="Losers Finals" 
              date={getRoundDate(4)} 
              matches={demoBracket.lower[2]} 
              isFinals={true}
              spacing={0}
            />
          </div>
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
