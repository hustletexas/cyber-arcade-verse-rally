
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TournamentAdminPanelProps {
  isAdmin: boolean;
}

export const TournamentAdminPanel: React.FC<TournamentAdminPanelProps> = ({ isAdmin }) => {
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      loadTournaments();
    }
  }, [isAdmin]);

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  const cancelTournament = async (tournamentId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', tournamentId);

      if (error) throw error;

      toast({
        title: "Tournament Cancelled",
        description: "Tournament has been cancelled successfully"
      });

      loadTournaments();
    } catch (error) {
      toast({
        title: "Cancellation Failed",
        description: "Failed to cancel tournament",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Tournament Management */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            🏆 Tournament Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tournaments.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No tournaments found</p>
            ) : (
              tournaments.map((tournament) => (
                <Card key={tournament.id} className="holographic p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-neon-pink">{tournament.name}</h3>
                        <p className="text-sm text-gray-400">Format: {tournament.format}</p>
                      </div>
                      <Badge className={
                        tournament.status === 'active' ? 'bg-neon-green text-black' :
                        tournament.status === 'cancelled' ? 'bg-red-500 text-white' :
                        tournament.status === 'completed' ? 'bg-neon-cyan text-black' :
                        'bg-yellow-500 text-black'
                      }>
                        {tournament.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Entry Fee:</span>
                        <div className="text-neon-cyan font-bold">{tournament.entry_fee} SOL</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Prize Pool:</span>
                        <div className="text-neon-green font-bold">{tournament.prize_pool} SOL</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Players:</span>
                        <div className="text-neon-purple">{tournament.current_players}/{tournament.max_players}</div>
                      </div>
                    </div>

                    {tournament.status === 'active' && (
                      <Button 
                        onClick={() => cancelTournament(tournament.id)}
                        disabled={loading}
                        variant="destructive"
                        className="w-full"
                      >
                        Cancel Tournament
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
