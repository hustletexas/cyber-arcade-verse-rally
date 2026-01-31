import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { TournamentMatch } from '@/types/tournament';
import './BracketPreview.css';

interface BracketPreviewProps {
  tournamentId: string;
  isAdmin?: boolean;
}

interface MatchData {
  id: string;
  teamA: { name: string; seed: string | number };
  teamB: { name: string; seed: string | number };
  isGhost?: boolean;
}

// Demo bracket data
const demoBracket = {
  left: {
    title: 'NEON CONFERENCE',
    rounds: [
      {
        title: 'ROUND 1',
        matches: [
          { id: 'l1-1', teamA: { name: 'Astralis', seed: 1 }, teamB: { name: 'Gambit', seed: 16 } },
          { id: 'l1-2', teamA: { name: 'Cloud9', seed: 8 }, teamB: { name: 'NAVI', seed: 9 } },
          { id: 'l1-3', teamA: { name: 'FaZe', seed: 5 }, teamB: { name: 'North', seed: 12 } },
          { id: 'l1-4', teamA: { name: 'Virtus.pro', seed: 4 }, teamB: { name: 'Liquid', seed: 13 } },
        ]
      },
      {
        title: 'ROUND 2',
        matches: [
          { id: 'l2-1', teamA: { name: 'Winner M1', seed: 'W' }, teamB: { name: 'Winner M2', seed: 'W' }, isGhost: true },
          { id: 'l2-2', teamA: { name: 'Winner M3', seed: 'W' }, teamB: { name: 'Winner M4', seed: 'W' }, isGhost: true },
        ]
      },
      {
        title: 'CONF. FINALS',
        matches: [
          { id: 'l3-1', teamA: { name: 'Winner M9', seed: 'W' }, teamB: { name: 'Winner M10', seed: 'W' }, isGhost: true },
        ]
      }
    ]
  },
  right: {
    title: 'ARCADE CONFERENCE',
    rounds: [
      {
        title: 'ROUND 1',
        matches: [
          { id: 'r1-1', teamA: { name: 'G2', seed: 2 }, teamB: { name: 'FNATIC', seed: 15 } },
          { id: 'r1-2', teamA: { name: 'NiP', seed: 7 }, teamB: { name: 'MIBR', seed: 10 } },
          { id: 'r1-3', teamA: { name: 'ENCE', seed: 6 }, teamB: { name: 'Vitality', seed: 11 } },
          { id: 'r1-4', teamA: { name: 'OG', seed: 3 }, teamB: { name: 'BIG', seed: 14 } },
        ]
      },
      {
        title: 'ROUND 2',
        matches: [
          { id: 'r2-1', teamA: { name: 'Winner M5', seed: 'W' }, teamB: { name: 'Winner M6', seed: 'W' }, isGhost: true },
          { id: 'r2-2', teamA: { name: 'Winner M7', seed: 'W' }, teamB: { name: 'Winner M8', seed: 'W' }, isGhost: true },
        ]
      },
      {
        title: 'CONF. FINALS',
        matches: [
          { id: 'r3-1', teamA: { name: 'Winner M11', seed: 'W' }, teamB: { name: 'Winner M12', seed: 'W' }, isGhost: true },
        ]
      }
    ]
  },
  finals: {
    teamA: { name: 'Left Champ', seed: 'W' },
    teamB: { name: 'Right Champ', seed: 'W' },
    champion: 'TBD'
  }
};

const Match: React.FC<{ match: MatchData }> = ({ match }) => (
  <div className={`cya-match ${match.isGhost ? 'ghost' : ''}`}>
    <div className="cya-team">
      <span className="cya-seed">{match.teamA.seed}</span>
      {match.teamA.name}
    </div>
    <div className="cya-team">
      <span className="cya-seed">{match.teamB.seed}</span>
      {match.teamB.name}
    </div>
  </div>
);

const Round: React.FC<{ title: string; matches: MatchData[] }> = ({ title, matches }) => (
  <div className="cya-round">
    <div className="cya-round-title">{title}</div>
    {matches.map((match) => (
      <Match key={match.id} match={match} />
    ))}
  </div>
);

const Side: React.FC<{ 
  title: string; 
  rounds: { title: string; matches: MatchData[] }[];
  className?: string;
}> = ({ title, rounds, className }) => (
  <section className={`cya-side ${className || ''}`}>
    <h3 className="cya-side-title">{title}</h3>
    {rounds.map((round, idx) => (
      <Round key={idx} title={round.title} matches={round.matches} />
    ))}
  </section>
);

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
            16 Players • Double Elimination
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

      {/* Bracket */}
      <div className="cya-bracket">
        {/* Left Side */}
        <Side 
          title={demoBracket.left.title} 
          rounds={demoBracket.left.rounds} 
          className="left"
        />

        {/* Center Finals */}
        <section className="cya-center">
          <div className="cya-trophy">
            <div className="cya-trophy-title">CYBER FINALS</div>
            <div className="cya-match finals ghost">
              <div className="cya-team">
                <span className="cya-seed">{demoBracket.finals.teamA.seed}</span>
                {demoBracket.finals.teamA.name}
              </div>
              <div className="cya-team">
                <span className="cya-seed">{demoBracket.finals.teamB.seed}</span>
                {demoBracket.finals.teamB.name}
              </div>
            </div>
            <div className="cya-champ">
              <span className="cya-badge">🏆</span> CHAMPION: <span className="cya-champ-name">{demoBracket.finals.champion}</span>
            </div>
          </div>
        </section>

        {/* Right Side */}
        <Side 
          title={demoBracket.right.title} 
          rounds={demoBracket.right.rounds} 
          className="right"
        />
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-neon-cyan/20 border-2 border-neon-cyan" />
          <span>Active Match</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded border border-dashed border-neon-cyan/30 bg-transparent" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};
