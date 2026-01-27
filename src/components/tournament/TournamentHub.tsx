import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Users, Settings, Calendar, Gamepad2 } from 'lucide-react';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { TournamentList } from './TournamentList';
import { TournamentAdminDashboard } from './TournamentAdminDashboard';
import { MyTournaments } from './MyTournaments';

export const TournamentHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const { user, isAdmin } = useAuth();
  const { fetchTournaments, tournaments, loading } = useTournaments();

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const upcomingTournaments = tournaments.filter(t => 
    ['published', 'registration_open'].includes(t.status)
  );
  const activeTournaments = tournaments.filter(t => t.status === 'in_progress');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-neon-pink" />
          <div>
            <h1 className="font-display text-3xl text-neon-pink">TOURNAMENT HUB</h1>
            <p className="text-muted-foreground">Compete, win, and earn rewards</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-neon-cyan text-black">
            {upcomingTournaments.length} Upcoming
          </Badge>
          <Badge className="bg-neon-green text-black">
            {activeTournaments.length} Live
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-background/50 border border-border">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="my-tournaments" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Tournaments
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          {(isAdmin || user) && (
            <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Organizer
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <TournamentList 
            tournaments={tournaments.filter(t => t.status !== 'draft')} 
            loading={loading}
          />
        </TabsContent>

        <TabsContent value="my-tournaments" className="mt-6">
          <MyTournaments />
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <div className="arcade-frame p-6">
            <h2 className="font-display text-xl text-neon-cyan mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {upcomingTournaments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No upcoming tournaments scheduled
                </p>
              ) : (
                upcomingTournaments.map(t => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-border">
                    <div>
                      <h3 className="font-semibold">{t.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(t.start_time).toLocaleDateString()} at {new Date(t.start_time).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline">{t.game}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="admin" className="mt-6">
          <TournamentAdminDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TournamentHub;
