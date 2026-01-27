import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Trophy, Users, Play, CheckCircle, DollarSign, 
  Grid, Eye, Settings, AlertCircle 
} from 'lucide-react';
import { useTournaments, useTournamentRegistrations, useTournamentMatches, useTournamentPayouts } from '@/hooks/useTournaments';
import { Tournament } from '@/types/tournament';
import { RegistrationsList } from './RegistrationsList';
import { BracketView } from './BracketView';
import { PayoutManager } from './PayoutManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TournamentControlPanelProps {
  tournament: Tournament;
  onBack: () => void;
}

export const TournamentControlPanel: React.FC<TournamentControlPanelProps> = ({ 
  tournament: initialTournament, 
  onBack 
}) => {
  const { 
    fetchTournament,
    publishTournament, 
    openRegistration, 
    closeRegistration,
    startTournament,
    generateBracket,
    finalizeStandings,
    loading 
  } = useTournaments();
  
  const { registrations, fetchRegistrations } = useTournamentRegistrations();
  const { matches, fetchMatches } = useTournamentMatches();
  const { payouts, fetchPayouts } = useTournamentPayouts();
  
  const [tournament, setTournament] = useState(initialTournament);
  const [activeTab, setActiveTab] = useState('overview');
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrations(tournament.id);
    fetchMatches(tournament.id);
    fetchPayouts(tournament.id);
  }, [tournament.id, fetchRegistrations, fetchMatches, fetchPayouts]);

  const refreshTournament = async () => {
    const updated = await fetchTournament(tournament.id);
    if (updated) setTournament(updated);
  };

  const handleAction = async (action: string) => {
    setConfirmAction(null);
    let result;
    
    switch (action) {
      case 'publish':
        result = await publishTournament(tournament.id);
        break;
      case 'open_registration':
        result = await openRegistration(tournament.id);
        break;
      case 'close_registration':
        result = await closeRegistration(tournament.id);
        break;
      case 'generate_bracket':
        result = await generateBracket(tournament.id);
        break;
      case 'start':
        result = await startTournament(tournament.id);
        break;
      case 'finalize':
        result = await finalizeStandings(tournament.id);
        break;
    }
    
    if (result) {
      await refreshTournament();
      fetchMatches(tournament.id);
      fetchPayouts(tournament.id);
    }
  };

  const getStatusActions = () => {
    switch (tournament.status) {
      case 'draft':
        return (
          <Button onClick={() => setConfirmAction('publish')} className="cyber-button">
            <Eye className="w-4 h-4 mr-2" />
            Publish Tournament
          </Button>
        );
      case 'published':
        return (
          <Button onClick={() => setConfirmAction('open_registration')} className="cyber-button">
            <Users className="w-4 h-4 mr-2" />
            Open Registration
          </Button>
        );
      case 'registration_open':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => setConfirmAction('close_registration')} 
              variant="outline"
            >
              Close Registration
            </Button>
            {registrations.length >= 2 && (
              <Button 
                onClick={() => setConfirmAction('generate_bracket')} 
                className="cyber-button"
              >
                <Grid className="w-4 h-4 mr-2" />
                Generate Bracket
              </Button>
            )}
          </div>
        );
      case 'registration_closed':
        return (
          <div className="flex gap-2">
            {matches.length === 0 && registrations.length >= 2 && (
              <Button 
                onClick={() => setConfirmAction('generate_bracket')} 
                variant="outline"
              >
                <Grid className="w-4 h-4 mr-2" />
                Generate Bracket
              </Button>
            )}
            {matches.length > 0 && (
              <Button 
                onClick={() => setConfirmAction('start')} 
                className="cyber-button"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Tournament
              </Button>
            )}
          </div>
        );
      case 'in_progress':
        const allMatchesComplete = matches.every(m => m.status === 'completed');
        return (
          <Button 
            onClick={() => setConfirmAction('finalize')} 
            className="cyber-button"
            disabled={!allMatchesComplete}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalize Standings
          </Button>
        );
      case 'completed':
        return (
          <Badge className="bg-neon-green text-black text-lg px-4 py-2">
            ✅ Tournament Complete
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-neon-pink" />
              <h1 className="font-display text-2xl text-neon-pink">{tournament.title}</h1>
            </div>
            <p className="text-muted-foreground">
              {tournament.game} • {tournament.format.replace('_', ' ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={
            tournament.status === 'in_progress' ? 'bg-neon-green text-black' :
            tournament.status === 'registration_open' ? 'bg-neon-cyan text-black' :
            tournament.status === 'completed' ? 'bg-muted' :
            'bg-neon-purple'
          }>
            {tournament.status.replace('_', ' ')}
          </Badge>
          {getStatusActions()}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Registered</p>
                <p className="text-2xl font-display text-neon-cyan">
                  {registrations.length}/{tournament.max_players}
                </p>
              </div>
              <Users className="w-8 h-8 text-neon-cyan" />
            </div>
          </CardContent>
        </Card>
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Matches</p>
                <p className="text-2xl font-display text-neon-purple">
                  {matches.filter(m => m.status === 'completed').length}/{matches.length}
                </p>
              </div>
              <Grid className="w-8 h-8 text-neon-purple" />
            </div>
          </CardContent>
        </Card>
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Entry Fee</p>
                <p className="text-2xl font-display text-neon-green">
                  ${tournament.entry_fee_usd}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-neon-green" />
            </div>
          </CardContent>
        </Card>
        <Card className="arcade-frame">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prize Pool</p>
                <p className="text-2xl font-display text-neon-pink">
                  ${tournament.prize_pool_usd}
                </p>
              </div>
              <Trophy className="w-8 h-8 text-neon-pink" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-background/50 border border-border">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="registrations">
            Registrations ({registrations.length})
          </TabsTrigger>
          <TabsTrigger value="bracket">Bracket</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle>Tournament Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p>{new Date(tournament.start_time).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="capitalize">{tournament.format.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payout Schema</p>
                  <p className="capitalize">{tournament.payout_schema.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pass Required</p>
                  <p>{tournament.requires_pass ? `Yes (${tournament.required_pass_tier || 'Any'})` : 'No'}</p>
                </div>
              </div>
              {tournament.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p>{tournament.description}</p>
                </div>
              )}
              {tournament.rules && (
                <div>
                  <p className="text-sm text-muted-foreground">Rules</p>
                  <p className="whitespace-pre-wrap">{tournament.rules}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registrations" className="mt-6">
          <RegistrationsList 
            tournamentId={tournament.id}
            registrations={registrations}
            onRefresh={() => fetchRegistrations(tournament.id)}
          />
        </TabsContent>

        <TabsContent value="bracket" className="mt-6">
          <BracketView 
            tournamentId={tournament.id}
            matches={matches}
            onRefresh={() => fetchMatches(tournament.id)}
            isAdmin={true}
          />
        </TabsContent>

        <TabsContent value="payouts" className="mt-6">
          <PayoutManager 
            tournamentId={tournament.id}
            payouts={payouts}
            onRefresh={() => fetchPayouts(tournament.id)}
          />
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction === 'publish' && 'This will make the tournament visible to all users.'}
              {confirmAction === 'open_registration' && 'This will allow players to register for the tournament.'}
              {confirmAction === 'close_registration' && 'This will prevent new registrations.'}
              {confirmAction === 'generate_bracket' && 'This will create the tournament bracket based on current registrations.'}
              {confirmAction === 'start' && 'This will start the tournament. Players can begin their matches.'}
              {confirmAction === 'finalize' && 'This will finalize standings and prepare payouts. This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleAction(confirmAction!)}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
