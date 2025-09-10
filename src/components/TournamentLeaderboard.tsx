import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TournamentLeaderboardProps {
  tournamentId?: string;
  title?: string;
}

export const TournamentLeaderboard: React.FC<TournamentLeaderboardProps> = ({ 
  tournamentId, 
  title = "Tournament Leaderboard" 
}) => {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['tournament-leaderboard', tournamentId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_tournament_leaderboard', {
        tournament_id_param: tournamentId || null
      });
      
      if (error) throw error;
      return data || [];
    }
  });

  const getPlacementIcon = (placement: number) => {
    switch (placement) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">#{placement}</span>;
    }
  };

  const getPlacementBadgeColor = (placement: number) => {
    switch (placement) {
      case 1:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 2:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30";
      case 3:
        return "bg-amber-600/20 text-amber-400 border-amber-600/30";
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30";
    }
  };

  if (isLoading) {
    return (
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🏆 {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">Loading leaderboard...</div>
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🏆 {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-400">No completed tournaments found.</div>
        </CardContent>
      </Card>
    );
  }

  // Group by tournament if showing multiple tournaments
  const groupedLeaderboard = leaderboard.reduce((acc, entry) => {
    const key = entry.tournament_name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {} as Record<string, typeof leaderboard>);

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-xl text-neon-cyan">
          🏆 {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedLeaderboard).map(([tournamentName, entries]) => (
          <div key={tournamentName} className="space-y-3">
            {!tournamentId && (
              <h3 className="font-bold text-neon-purple text-lg">{tournamentName}</h3>
            )}
            
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div
                  key={`${entry.tournament_id}-${entry.placement}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-neon-cyan/20 bg-card/50 hover:bg-card/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getPlacementIcon(entry.placement)}
                    <div>
                      <div className="font-medium text-gray-200">
                        {entry.player_identifier}
                      </div>
                      <div className="text-sm text-gray-400">
                        Score: {entry.score?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {entry.reward_amount > 0 && (
                      <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                        {entry.reward_amount} SOL
                      </Badge>
                    )}
                    <Badge className={getPlacementBadgeColor(entry.placement)}>
                      #{entry.placement}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-xs text-blue-400">
            🔒 Privacy Protected: Player identities are anonymized to protect user privacy while maintaining competitive transparency.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};