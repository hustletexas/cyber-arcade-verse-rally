import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Users, Settings, Calendar, Gamepad2, GitBranch, Vote } from 'lucide-react';
import { useTournaments } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { TournamentList } from './TournamentList';
import { TournamentAdminDashboard } from './TournamentAdminDashboard';
import { MyTournaments } from './MyTournaments';
import { BracketPreview } from './BracketPreview';
import { TournamentVoting } from './TournamentVoting';
export const TournamentHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedTournamentId, setSelectedTournamentId] = useState<string | null>(null);
  const {
    user,
    isAdmin
  } = useAuth();
  const {
    fetchTournaments,
    tournaments,
    loading
  } = useTournaments();
  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);
  const upcomingTournaments = tournaments.filter((t) => ['published', 'registration_open'].includes(t.status));
  const activeTournaments = tournaments.filter((t) => t.status === 'in_progress');

  // Select first active tournament for bracket preview
  useEffect(() => {
    if (activeTournaments.length > 0 && !selectedTournamentId) {
      setSelectedTournamentId(activeTournaments[0].id);
    }
  }, [activeTournaments, selectedTournamentId]);
  return <div>
      {/* Badges */}
      <div className="flex items-center justify-end gap-2">
        <Badge className="bg-neon-cyan text-black">
          {upcomingTournaments.length} Upcoming
        </Badge>
        <Badge className="bg-neon-green text-black">
          {activeTournaments.length} Live
        </Badge>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full -mt-1">
        <TabsList className="grid w-full grid-cols-5 bg-background/50 border border-border">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="vote" className="flex items-center gap-2">
            <Vote className="w-4 h-4" />
            Vote
          </TabsTrigger>
          <TabsTrigger value="my-tournaments" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            My Tournaments
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Calendar
          </TabsTrigger>
          {(isAdmin || user) && <TabsTrigger value="admin" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Organizer
            </TabsTrigger>}
        </TabsList>

        {/* Tournament Cards - Browse tab content moved above live bracket */}
        <TabsContent value="browse" className="mt-0">
          <TournamentList tournaments={tournaments.filter((t) => t.status !== 'draft')} loading={loading} />
        </TabsContent>

        {/* Live Bracket Preview - Always show on Browse tab */}
        {activeTab === 'browse' && <Card className="arcade-frame border-neon-green/50 mt-0">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-xl text-neon-green flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  LIVE BRACKET
                </CardTitle>
                {activeTournaments.length > 1 && <div className="flex gap-2">
                    {activeTournaments.map((t) => <Badge key={t.id} className={`cursor-pointer transition-all ${selectedTournamentId === t.id ? 'bg-neon-green text-black' : 'bg-muted hover:bg-neon-green/20'}`} onClick={() => setSelectedTournamentId(t.id)}>
                        {t.title}
                      </Badge>)}
                  </div>}
              </div>
              {activeTournaments.length > 0 && selectedTournamentId && <p className="text-sm text-muted-foreground">
                  {activeTournaments.find((t) => t.id === selectedTournamentId)?.title} — {activeTournaments.find((t) => t.id === selectedTournamentId)?.game}
                </p>}
            </CardHeader>
            <CardContent>
              <BracketPreview tournamentId={selectedTournamentId || 'empty'} isAdmin={isAdmin} />
            </CardContent>
          </Card>}

        <TabsContent value="vote" className="mt-2">
          <TournamentVoting />
        </TabsContent>

        <TabsContent value="my-tournaments" className="mt-2">
          <MyTournaments />
        </TabsContent>

        <TabsContent value="calendar" className="mt-2">
          <div className="arcade-frame p-6">
            <h2 className="font-display text-xl text-neon-cyan mb-4">Upcoming Events</h2>
            <div className="space-y-3">
              {upcomingTournaments.length === 0 ? <p className="text-muted-foreground text-center py-8">
                  No upcoming tournaments scheduled
                </p> : upcomingTournaments.map((t) => <div key={t.id} className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-border">
                    <div>
                      <h3 className="font-semibold">{t.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(t.start_time).toLocaleDateString()} at {new Date(t.start_time).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline">{t.game}</Badge>
                  </div>)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="admin" className="mt-2">
          <TournamentAdminDashboard />
        </TabsContent>
      </Tabs>

      {/* Banner */}
      <div className="w-full mt-8">
        <img alt="Tournament Hub" className="w-full h-auto object-contain" src="/lovable-uploads/4d056629-874a-482c-a00e-1c4833a2ba63.png" />
      </div>
    </div>;
};
export default TournamentHub;