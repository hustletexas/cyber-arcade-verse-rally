import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Calendar, DollarSign, Gamepad2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tournament, TournamentRegistration } from '@/types/tournament';

interface MyRegistration extends TournamentRegistration {
  tournament?: Tournament;
}

export const MyTournaments: React.FC = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyRegistrations();
    }
  }, [user]);

  const fetchMyRegistrations = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch registrations
      const { data: regs, error: regError } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('user_id', user.id)
        .order('registered_at', { ascending: false });

      if (regError) throw regError;

      // Fetch associated tournaments
      if (regs && regs.length > 0) {
        const tournamentIds = [...new Set(regs.map(r => r.tournament_id))];
        const { data: tournaments, error: tError } = await supabase
          .from('arcade_tournaments')
          .select('*')
          .in('id', tournamentIds);

        if (tError) throw tError;

        const tournamentsMap = new Map(tournaments?.map(t => [t.id, t as unknown as Tournament]) || []);
        
        setRegistrations(regs.map(r => ({
          ...r as TournamentRegistration,
          tournament: tournamentsMap.get(r.tournament_id)
        })));
      } else {
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="arcade-frame">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Please log in to view your tournaments</p>
        </CardContent>
      </Card>
    );
  }

  const activeRegs = registrations.filter(r => 
    r.tournament && ['registration_open', 'registration_closed', 'in_progress'].includes(r.tournament.status)
  );
  const completedRegs = registrations.filter(r => 
    r.tournament?.status === 'completed'
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress': return <Badge className="bg-neon-green text-black">Live</Badge>;
      case 'registration_open': return <Badge className="bg-neon-cyan text-black">Registered</Badge>;
      case 'completed': return <Badge variant="outline">Completed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="active">
        <TabsList className="grid w-full grid-cols-2 bg-background/50 border border-border">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Active ({activeRegs.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            History ({completedRegs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : activeRegs.length === 0 ? (
            <Card className="arcade-frame">
              <CardContent className="py-12 text-center">
                <Gamepad2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No active tournament registrations</p>
                <Button variant="outline">Browse Tournaments</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeRegs.map(reg => reg.tournament && (
                <Card key={reg.id} className="arcade-frame hover:border-neon-pink/50 transition-all">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="font-display text-lg">
                        {reg.tournament.title}
                      </CardTitle>
                      {getStatusBadge(reg.tournament.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <Gamepad2 className="w-4 h-4 text-neon-cyan" />
                        <span>{reg.tournament.game}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-neon-purple" />
                        <span>{new Date(reg.tournament.start_time).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-neon-pink" />
                        <span>${reg.tournament.prize_pool_usd} Prize</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-neon-green" />
                        <span>Seed #{reg.seed_number || '—'}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                          reg.checked_in ? 'border-neon-green text-neon-green' : 'border-neon-yellow text-neon-yellow'
                        }>
                          {reg.checked_in ? '✓ Checked In' : 'Not Checked In'}
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        View Bracket
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {completedRegs.length === 0 ? (
            <Card className="arcade-frame">
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No completed tournaments yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {completedRegs.map(reg => reg.tournament && (
                <Card key={reg.id} className="arcade-frame">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{reg.tournament.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {reg.tournament.game} • {new Date(reg.tournament.start_time).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Prize Pool</p>
                        <p className="font-display text-neon-pink">
                          ${reg.tournament.prize_pool_usd}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
