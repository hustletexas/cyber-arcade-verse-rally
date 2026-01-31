import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';
import { 
  Tournament, 
  TournamentRegistration, 
  TournamentMatch, 
  TournamentStanding,
  TournamentPayout,
  CreateTournamentInput,
  TournamentStatus,
  MatchStatus,
  PAYOUT_PERCENTAGES
} from '@/types/tournament';

// Helper to convert DB row to Tournament type
const dbToTournament = (data: any): Tournament => ({
  ...data,
  bracket_data: data.bracket_data as Tournament['bracket_data'],
  custom_payout_percentages: data.custom_payout_percentages as Tournament['custom_payout_percentages']
});

// Demo tournaments for showcase
const DEMO_TOURNAMENTS: Tournament[] = [
  {
    id: 'demo-neon-cup',
    title: 'NEON CHAMPIONS CUP',
    description: 'The ultimate cyberpunk gaming showdown',
    game: 'tetris',
    format: 'single_elimination',
    max_players: 8,
    min_players: 4,
    start_time: new Date().toISOString(),
    entry_fee_usd: 0,
    entry_fee_usdc: 0,
    prize_pool_usd: 0,
    payout_schema: 'top_3',
    requires_pass: false,
    status: 'in_progress',
    admin_id: 'demo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-arcade-showdown',
    title: 'ARCADE SHOWDOWN',
    description: 'Classic arcade games battle royale',
    game: 'pacman',
    format: 'single_elimination',
    max_players: 16,
    min_players: 8,
    start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee_usd: 5,
    entry_fee_usdc: 5,
    prize_pool_usd: 100,
    payout_schema: 'top_3',
    requires_pass: false,
    status: 'registration_open',
    admin_id: 'demo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-galaga-masters',
    title: 'GALAGA MASTERS',
    description: 'Prove your space combat skills',
    game: 'galaga',
    format: 'single_elimination',
    max_players: 32,
    min_players: 8,
    start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    entry_fee_usd: 10,
    entry_fee_usdc: 10,
    prize_pool_usd: 500,
    payout_schema: 'top_5',
    requires_pass: true,
    required_pass_tier: 'silver',
    status: 'registration_open',
    admin_id: 'demo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const useTournaments = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  // Fetch all tournaments
  const fetchTournaments = useCallback(async (status?: TournamentStatus) => {
    setLoading(true);
    try {
      let query = supabase
        .from('arcade_tournaments')
        .select('*')
        .order('start_time', { ascending: true });
      
      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Use demo tournaments if database is empty
      if (!data || data.length === 0) {
        const filteredDemo = status 
          ? DEMO_TOURNAMENTS.filter(t => t.status === status)
          : DEMO_TOURNAMENTS;
        setTournaments(filteredDemo);
        return filteredDemo;
      }
      
      const tournaments = (data || []).map(dbToTournament);
      setTournaments(tournaments);
      return tournaments;
    } catch (error: any) {
      // Fallback to demo on error
      setTournaments(DEMO_TOURNAMENTS);
      return DEMO_TOURNAMENTS;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch single tournament
  const fetchTournament = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('arcade_tournaments')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data ? dbToTournament(data) : null;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    }
  }, [toast]);

  // Create tournament
  const createTournament = useCallback(async (input: CreateTournamentInput) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to create tournaments');

      const { data, error } = await supabase
        .from('arcade_tournaments')
        .insert({
          ...input,
          admin_id: user.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Success', description: 'Tournament created!' });
      return dbToTournament(data);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update tournament
  const updateTournament = useCallback(async (id: string, updates: Partial<Tournament>) => {
    setLoading(true);
    try {
      // Convert to DB-compatible format
      const dbUpdates: any = { ...updates };
      if (updates.bracket_data !== undefined) {
        dbUpdates.bracket_data = updates.bracket_data as Json;
      }
      
      const { data, error } = await supabase
        .from('arcade_tournaments')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Success', description: 'Tournament updated!' });
      return dbToTournament(data);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Publish tournament
  const publishTournament = useCallback(async (id: string) => {
    return updateTournament(id, { status: 'published' });
  }, [updateTournament]);

  // Open registration
  const openRegistration = useCallback(async (id: string) => {
    return updateTournament(id, { status: 'registration_open' });
  }, [updateTournament]);

  // Close registration
  const closeRegistration = useCallback(async (id: string) => {
    return updateTournament(id, { status: 'registration_closed' });
  }, [updateTournament]);

  // Start tournament
  const startTournament = useCallback(async (id: string) => {
    return updateTournament(id, { status: 'in_progress' });
  }, [updateTournament]);

  // Complete tournament
  const completeTournament = useCallback(async (id: string) => {
    return updateTournament(id, { status: 'completed' });
  }, [updateTournament]);

  // Generate bracket for single elimination
  const generateBracket = useCallback(async (tournamentId: string) => {
    setLoading(true);
    try {
      // Get registrations
      const { data: registrations, error: regError } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('payment_status', 'completed');

      if (regError) throw regError;
      if (!registrations || registrations.length < 2) {
        throw new Error('Need at least 2 registered players');
      }

      // Shuffle players for random seeding
      const shuffled = [...registrations].sort(() => Math.random() - 0.5);
      
      // Calculate rounds needed
      const numPlayers = shuffled.length;
      const rounds = Math.ceil(Math.log2(numPlayers));
      const totalSlots = Math.pow(2, rounds);
      
      // Create matches for first round
      const firstRoundMatches: any[] = [];
      const numFirstRoundMatches = totalSlots / 2;
      
      for (let i = 0; i < numFirstRoundMatches; i++) {
        const playerA = shuffled[i * 2];
        const playerB = shuffled[i * 2 + 1];
        
        firstRoundMatches.push({
          tournament_id: tournamentId,
          round_number: 1,
          match_number: i + 1,
          bracket_position: `R1M${i + 1}`,
          player_a_id: playerA?.user_id || null,
          player_a_wallet: playerA?.wallet_address || null,
          player_b_id: playerB?.user_id || null,
          player_b_wallet: playerB?.wallet_address || null,
          status: 'pending',
          disputed: false
        });
      }

      // Insert first round matches
      const { error: matchError } = await supabase
        .from('tournament_matches')
        .insert(firstRoundMatches);

      if (matchError) throw matchError;

      // Create placeholder matches for subsequent rounds
      for (let round = 2; round <= rounds; round++) {
        const matchesInRound = Math.pow(2, rounds - round);
        const roundMatches: any[] = [];
        
        for (let i = 0; i < matchesInRound; i++) {
          roundMatches.push({
            tournament_id: tournamentId,
            round_number: round,
            match_number: i + 1,
            bracket_position: `R${round}M${i + 1}`,
            status: 'pending',
            disputed: false
          });
        }
        
        const { error } = await supabase
          .from('tournament_matches')
          .insert(roundMatches);
        
        if (error) throw error;
      }

      // Update seeds
      for (let i = 0; i < shuffled.length; i++) {
        await supabase
          .from('tournament_registrations')
          .update({ seed_number: i + 1 })
          .eq('id', shuffled[i].id);
      }

      toast({ title: 'Success', description: 'Bracket generated!' });
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Report match result
  const reportMatchResult = useCallback(async (
    matchId: string, 
    winnerId: string, 
    winnerWallet: string,
    playerAScore?: number,
    playerBScore?: number
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in');

      const { data, error } = await supabase
        .from('tournament_matches')
        .update({
          winner_id: winnerId,
          winner_wallet: winnerWallet,
          player_a_score: playerAScore,
          player_b_score: playerBScore,
          status: 'completed' as MatchStatus,
          reported_by: user.id,
          reported_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;

      // Advance winner to next match
      const match = data as TournamentMatch;
      await advanceWinner(match);

      toast({ title: 'Success', description: 'Match result recorded!' });
      return data as TournamentMatch;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Advance winner to next round
  const advanceWinner = useCallback(async (completedMatch: TournamentMatch) => {
    const nextRound = completedMatch.round_number + 1;
    const nextMatchNumber = Math.ceil(completedMatch.match_number / 2);
    const isPlayerA = completedMatch.match_number % 2 === 1;

    const { data: nextMatch } = await supabase
      .from('tournament_matches')
      .select('*')
      .eq('tournament_id', completedMatch.tournament_id)
      .eq('round_number', nextRound)
      .eq('match_number', nextMatchNumber)
      .maybeSingle();

    if (nextMatch) {
      const updateData = isPlayerA 
        ? { player_a_id: completedMatch.winner_id, player_a_wallet: completedMatch.winner_wallet }
        : { player_b_id: completedMatch.winner_id, player_b_wallet: completedMatch.winner_wallet };

      await supabase
        .from('tournament_matches')
        .update(updateData)
        .eq('id', nextMatch.id);
    }
  }, []);

  // Finalize standings and calculate payouts
  const finalizeStandings = useCallback(async (tournamentId: string) => {
    setLoading(true);
    try {
      const tournament = await fetchTournament(tournamentId);
      if (!tournament) throw new Error('Tournament not found');

      // Get all matches to determine placements
      const { data: matches, error: matchError } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .eq('status', 'completed')
        .order('round_number', { ascending: false });

      if (matchError) throw matchError;
      if (!matches || matches.length === 0) throw new Error('No completed matches');

      // Calculate placements from bracket results
      const placements = new Map<string, { placement: number; wins: number; losses: number }>();
      const finalMatch = matches[0];
      
      // Winner gets 1st place
      if (finalMatch.winner_id) {
        placements.set(finalMatch.winner_id, { placement: 1, wins: 0, losses: 0 });
      }
      
      // Loser of final gets 2nd
      const finalistLoser = finalMatch.player_a_id === finalMatch.winner_id 
        ? finalMatch.player_b_id 
        : finalMatch.player_a_id;
      if (finalistLoser) {
        placements.set(finalistLoser, { placement: 2, wins: 0, losses: 0 });
      }

      // Process remaining matches for placements
      let currentPlacement = 3;
      for (let i = 1; i < matches.length; i++) {
        const match = matches[i];
        const loser = match.player_a_id === match.winner_id ? match.player_b_id : match.player_a_id;
        if (loser && !placements.has(loser)) {
          placements.set(loser, { placement: currentPlacement, wins: 0, losses: 0 });
          currentPlacement++;
        }
      }

      // Count wins/losses
      for (const match of matches) {
        if (match.winner_id && placements.has(match.winner_id)) {
          const data = placements.get(match.winner_id)!;
          data.wins++;
        }
        const loser = match.player_a_id === match.winner_id ? match.player_b_id : match.player_a_id;
        if (loser && placements.has(loser)) {
          const data = placements.get(loser)!;
          data.losses++;
        }
      }

      // Get payout percentages
      const payoutPercentages = tournament.custom_payout_percentages || 
        PAYOUT_PERCENTAGES[tournament.payout_schema];

      // Get registrations for wallet addresses
      const { data: registrations } = await supabase
        .from('tournament_registrations')
        .select('user_id, wallet_address')
        .eq('tournament_id', tournamentId);

      const walletMap = new Map(registrations?.map(r => [r.user_id, r.wallet_address]) || []);

      // Insert standings and payouts
      for (const [userId, data] of placements) {
        const walletAddress = walletMap.get(userId) || '';
        const payoutPercent = payoutPercentages[data.placement] || 0;
        const prizeAmount = (tournament.prize_pool_usd * payoutPercent) / 100;

        // Insert standing
        await supabase
          .from('tournament_standings')
          .upsert({
            tournament_id: tournamentId,
            user_id: userId,
            wallet_address: walletAddress,
            placement: data.placement,
            wins: data.wins,
            losses: data.losses,
            prize_amount_usd: prizeAmount,
            finalized: true,
            finalized_at: new Date().toISOString()
          });

        // Insert payout if prize > 0
        if (prizeAmount > 0) {
          await supabase
            .from('tournament_payouts')
            .upsert({
              tournament_id: tournamentId,
              user_id: userId,
              wallet_address: walletAddress,
              placement: data.placement,
              amount_usd: prizeAmount,
              status: 'pending',
              nonce: crypto.randomUUID(),
              deadline: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min deadline
            });
        }
      }

      await completeTournament(tournamentId);
      toast({ title: 'Success', description: 'Standings finalized!' });
      return true;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  }, [toast, fetchTournament, completeTournament]);

  return {
    loading,
    tournaments,
    fetchTournaments,
    fetchTournament,
    createTournament,
    updateTournament,
    publishTournament,
    openRegistration,
    closeRegistration,
    startTournament,
    completeTournament,
    generateBracket,
    reportMatchResult,
    finalizeStandings
  };
};

// Hook for tournament registrations
export const useTournamentRegistrations = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<TournamentRegistration[]>([]);

  const fetchRegistrations = useCallback(async (tournamentId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_registrations')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('registered_at', { ascending: true });

      if (error) throw error;
      setRegistrations(data as TournamentRegistration[]);
      return data as TournamentRegistration[];
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const registerForTournament = useCallback(async (
    tournamentId: string, 
    walletAddress: string,
    paymentMethod?: string
  ) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to register');

      const { data, error } = await supabase
        .from('tournament_registrations')
        .insert({
          tournament_id: tournamentId,
          user_id: user.id,
          wallet_address: walletAddress,
          payment_method: paymentMethod,
          payment_status: paymentMethod ? 'pending' : 'completed'
        })
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Success', description: 'Registered for tournament!' });
      return data as TournamentRegistration;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const checkIn = useCallback(async (registrationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_registrations')
        .update({ 
          checked_in: true, 
          checked_in_at: new Date().toISOString() 
        })
        .eq('id', registrationId)
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Success', description: 'Checked in!' });
      return data as TournamentRegistration;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updatePaymentStatus = useCallback(async (
    registrationId: string, 
    status: string, 
    transactionId?: string
  ) => {
    const { data, error } = await supabase
      .from('tournament_registrations')
      .update({ 
        payment_status: status,
        payment_transaction_id: transactionId
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (error) throw error;
    return data as TournamentRegistration;
  }, []);

  return {
    loading,
    registrations,
    fetchRegistrations,
    registerForTournament,
    checkIn,
    updatePaymentStatus
  };
};

// Hook for tournament matches
export const useTournamentMatches = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);

  const fetchMatches = useCallback(async (tournamentId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('round_number', { ascending: true })
        .order('match_number', { ascending: true });

      if (error) throw error;
      setMatches(data as TournamentMatch[]);
      return data as TournamentMatch[];
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { loading, matches, fetchMatches };
};

// Hook for payouts
export const useTournamentPayouts = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [payouts, setPayouts] = useState<TournamentPayout[]>([]);

  const fetchPayouts = useCallback(async (tournamentId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_payouts')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('placement', { ascending: true });

      if (error) throw error;
      setPayouts(data as TournamentPayout[]);
      return data as TournamentPayout[];
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const processPayout = useCallback(async (payoutId: string, transactionHash: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tournament_payouts')
        .update({ 
          status: 'completed',
          transaction_hash: transactionHash,
          paid_at: new Date().toISOString()
        })
        .eq('id', payoutId)
        .select()
        .single();

      if (error) throw error;
      toast({ title: 'Success', description: 'Payout processed!' });
      return data as TournamentPayout;
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return { loading, payouts, fetchPayouts, processPayout };
};
