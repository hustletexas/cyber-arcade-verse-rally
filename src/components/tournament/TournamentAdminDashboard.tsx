import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trophy, Users, Settings, Play, CheckCircle, DollarSign } from 'lucide-react';
import { useTournaments, useTournamentRegistrations, useTournamentMatches, useTournamentPayouts } from '@/hooks/useTournaments';
import { useAuth } from '@/hooks/useAuth';
import { Tournament } from '@/types/tournament';
import { CreateTournamentForm } from './CreateTournamentForm';
import { TournamentControlPanel } from './TournamentControlPanel';
import { RegistrationsList } from './RegistrationsList';
import { MatchReportModal } from './MatchReportModal';
import { PayoutManager } from './PayoutManager';

export const TournamentAdminDashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { tournaments, fetchTournaments, loading } = useTournaments();
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // Filter tournaments created by this admin
  const myTournaments = tournaments.filter(t => 
    t.admin_id === user?.id || isAdmin
  );

  if (!user) {
    return (
      <Card className="arcade-frame">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Please log in to access the organizer dashboard</p>
        </CardContent>
      </Card>
    );
  }

  if (showCreateForm) {
    return (
      <CreateTournamentForm 
        onSuccess={() => {
          setShowCreateForm(false);
          fetchTournaments();
        }}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (selectedTournament) {
    return (
      <TournamentControlPanel 
        tournament={selectedTournament}
        onBack={() => {
          setSelectedTournament(null);
          fetchTournaments();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl text-neon-cyan">Organizer Dashboard</h2>
          <p className="text-muted-foreground">Create and manage your tournaments</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="cyber-button">
          <Plus className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tournaments</p>
                <p className="text-2xl font-display text-neon-pink">{myTournaments.length}</p>
              </div>
              <Trophy className="w-8 h-8 text-neon-pink" />
            </div>
          </CardContent>
        </Card>
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-display text-neon-green">
                  {myTournaments.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
              <Play className="w-8 h-8 text-neon-green" />
            </div>
          </CardContent>
        </Card>
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-display text-neon-cyan">
                  {myTournaments.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-neon-cyan" />
            </div>
          </CardContent>
        </Card>
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Prize Pool</p>
                <p className="text-2xl font-display text-neon-purple">
                  ${myTournaments.reduce((sum, t) => sum + (t.prize_pool_usd || 0), 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-neon-purple" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournaments List */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-neon-pink">My Tournaments</CardTitle>
        </CardHeader>
        <CardContent>
          {myTournaments.length === 0 ? (
            <div className="text-center py-8">
              <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No tournaments created yet</p>
              <Button onClick={() => setShowCreateForm(true)} variant="outline">
                Create Your First Tournament
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {myTournaments.map(tournament => (
                <div 
                  key={tournament.id}
                  className="flex items-center justify-between p-4 bg-background/30 rounded-lg border border-border hover:border-neon-pink/50 cursor-pointer transition-all"
                  onClick={() => setSelectedTournament(tournament)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="font-semibold">{tournament.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {tournament.game} • {new Date(tournament.start_time).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{tournament.format.replace('_', ' ')}</Badge>
                    <Badge className={
                      tournament.status === 'in_progress' ? 'bg-neon-green text-black' :
                      tournament.status === 'registration_open' ? 'bg-neon-cyan text-black' :
                      tournament.status === 'completed' ? 'bg-muted' :
                      'bg-neon-purple'
                    }>
                      {tournament.status.replace('_', ' ')}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
