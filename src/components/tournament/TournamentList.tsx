import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Users, Calendar, DollarSign, Gamepad2, Shield } from 'lucide-react';
import { Tournament, GAME_OPTIONS } from '@/types/tournament';

interface TournamentListProps {
  tournaments: Tournament[];
  loading: boolean;
  onSelect?: (tournament: Tournament) => void;
}

export const TournamentList: React.FC<TournamentListProps> = ({ 
  tournaments, 
  loading,
  onSelect 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registration_open': return 'bg-neon-green text-black';
      case 'in_progress': return 'bg-neon-cyan text-black';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-neon-purple text-white';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'registration_open': return '🟢 Registration Open';
      case 'registration_closed': return '🔴 Registration Closed';
      case 'in_progress': return '🎮 In Progress';
      case 'completed': return '✅ Completed';
      case 'published': return '📢 Coming Soon';
      default: return status;
    }
  };

  const getGameIcon = (game: string) => {
    const gameOption = GAME_OPTIONS.find(g => g.value === game);
    return gameOption?.icon || '🎮';
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map(i => (
          <Card key={i} className="arcade-frame">
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tournaments.length === 0) {
    return (
      <Card className="arcade-frame">
        <CardContent className="py-12 text-center">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-display text-neon-pink mb-2">No Tournaments Available</h3>
          <p className="text-muted-foreground">Check back soon for upcoming competitions!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tournaments.map(tournament => (
        <Card 
          key={tournament.id} 
          className="arcade-frame hover:border-neon-pink/50 transition-all cursor-pointer group"
          onClick={() => onSelect?.(tournament)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getGameIcon(tournament.game)}</span>
                <CardTitle className="font-display text-lg group-hover:text-neon-pink transition-colors">
                  {tournament.title}
                </CardTitle>
              </div>
              <Badge className={getStatusColor(tournament.status)}>
                {getStatusLabel(tournament.status)}
              </Badge>
            </div>
            {tournament.description && (
              <CardDescription className="line-clamp-2">
                {tournament.description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tournament Info Grid */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neon-cyan" />
                <span>{new Date(tournament.start_time).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neon-purple" />
                <span>Max {tournament.max_players}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-neon-green" />
                <span>
                  {tournament.entry_fee_usd > 0 
                    ? `$${tournament.entry_fee_usd} Entry`
                    : 'Free Entry'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-neon-pink" />
                <span>${tournament.prize_pool_usd} Pool</span>
              </div>
            </div>

            {/* Pass Requirement */}
            {tournament.requires_pass && (
              <div className="flex items-center gap-2 p-2 bg-neon-purple/10 rounded-lg border border-neon-purple/30">
                <Shield className="w-4 h-4 text-neon-purple" />
                <span className="text-sm">
                  Requires {tournament.required_pass_tier || 'Any'} Pass
                </span>
              </div>
            )}

            {/* Format & Payout */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="capitalize">{tournament.format.replace('_', ' ')}</span>
              <span className="capitalize">{tournament.payout_schema.replace('_', ' ')}</span>
            </div>

            {/* Action Button */}
            {tournament.status === 'registration_open' && (
              <Button className="w-full cyber-button">
                Register Now
              </Button>
            )}
            {tournament.status === 'in_progress' && (
              <Button variant="outline" className="w-full">
                View Bracket
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
