
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';

interface Tournament {
  id: string;
  name: string;
  entry_fee: number;
  prize_pool: number;
  max_players: number;
  current_players: number;
  start_time: string;
  end_time?: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  winner_wallet?: string;
  admin_wallet: string;
  program_id: string;
  tournament_account?: string;
  created_at: string;
  updated_at: string;
}

interface TournamentEntry {
  id: string;
  tournament_id: string;
  user_id?: string;
  wallet_address: string;
  entry_transaction_hash: string;
  joined_at: string;
  score: number;
  placement?: number;
  reward_amount: number;
  reward_claimed: boolean;
  reward_transaction_hash?: string;
}

export const SolanaTournamentManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [userEntries, setUserEntries] = useState<TournamentEntry[]>([]);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [connection] = useState(new Connection('https://api.devnet.solana.com'));

  // Mock admin wallet address (replace with actual admin wallet)
  const ADMIN_WALLET = 'YOUR_ADMIN_WALLET_ADDRESS';
  const PROGRAM_ID = 'YOUR_TOURNAMENT_PROGRAM_ID';

  useEffect(() => {
    checkWalletConnection();
    loadTournaments();
    if (user) {
      loadUserEntries();
    }
  }, [user]);

  const checkWalletConnection = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setWalletConnected(true);
          setWalletAddress(response.publicKey.toString());
        }
      }
    } catch (error) {
      console.log('Wallet not connected:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.solana) {
        toast({
          title: "Wallet Not Found",
          description: "Please install Phantom wallet to continue",
          variant: "destructive"
        });
        return;
      }

      const response = await window.solana.connect();
      setWalletConnected(true);
      setWalletAddress(response.publicKey.toString());
      
      toast({
        title: "Wallet Connected",
        description: `Connected: ${response.publicKey.toString().slice(0, 8)}...`
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('solana_tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      toast({
        title: "Error",
        description: "Failed to load tournaments",
        variant: "destructive"
      });
    }
  };

  const loadUserEntries = async () => {
    if (!walletAddress) return;

    try {
      const { data, error } = await supabase
        .from('solana_tournament_entries')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setUserEntries(data || []);
    } catch (error) {
      console.error('Error loading user entries:', error);
    }
  };

  const createTournament = async (name: string, entryFee: number, startTime: string) => {
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create tournaments",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('solana_tournaments')
        .insert([
          {
            name,
            entry_fee: entryFee,
            start_time: startTime,
            admin_wallet: walletAddress,
            program_id: PROGRAM_ID
          }
        ])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Tournament Created",
        description: `Tournament "${name}" created successfully!`
      });

      loadTournaments();
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create tournament",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async (tournament: Tournament) => {
    if (!walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join tournaments",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to join tournaments",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Create transaction to pay entry fee
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: new PublicKey(tournament.admin_wallet),
          lamports: tournament.entry_fee * LAMPORTS_PER_SOL,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletAddress);

      // Sign and send transaction
      const signedTransaction = await window.solana.signTransaction(transaction);
      const txHash = await connection.sendRawTransaction(signedTransaction.serialize());
      
      // Wait for confirmation
      await connection.confirmTransaction(txHash);

      // Call database function to join tournament
      const { data, error } = await supabase.rpc('join_solana_tournament', {
        tournament_id_param: tournament.id,
        wallet_address_param: walletAddress,
        transaction_hash_param: txHash,
        user_id_param: user.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; entry_id?: string };
      
      if (result.success) {
        toast({
          title: "Tournament Joined!",
          description: `Successfully joined ${tournament.name}`,
        });
        
        loadTournaments();
        loadUserEntries();
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error joining tournament:', error);
      toast({
        title: "Join Failed",
        description: error.message || "Failed to join tournament",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const completeTournament = async (tournament: Tournament, winnerWallet: string) => {
    if (!walletConnected || walletAddress !== tournament.admin_wallet) {
      toast({
        title: "Admin Access Required",
        description: "Only tournament admin can complete tournaments",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('complete_solana_tournament', {
        tournament_id_param: tournament.id,
        winner_wallet_param: winnerWallet,
        admin_wallet_param: walletAddress
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; prize_amount?: number };
      
      if (result.success) {
        // Send prize to winner
        const prizeAmount = result.prize_amount || 0;
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(walletAddress),
            toPubkey: new PublicKey(winnerWallet),
            lamports: prizeAmount * LAMPORTS_PER_SOL,
          })
        );

        const { blockhash } = await connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(walletAddress);

        const signedTransaction = await window.solana.signTransaction(transaction);
        const txHash = await connection.sendRawTransaction(signedTransaction.serialize());
        
        await connection.confirmTransaction(txHash);

        toast({
          title: "Tournament Completed!",
          description: `Prize of ${prizeAmount} SOL sent to winner`,
        });
        
        loadTournaments();
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error completing tournament:', error);
      toast({
        title: "Completion Failed",
        description: error.message || "Failed to complete tournament",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const isUserEntered = (tournamentId: string) => {
    return userEntries.some(entry => entry.tournament_id === tournamentId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-neon-cyan text-black';
      case 'active': return 'bg-neon-green text-black animate-pulse';
      case 'completed': return 'bg-neon-purple text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🔗 Solana Tournament System
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!walletConnected ? (
            <Button onClick={connectWallet} className="cyber-button w-full">
              Connect Phantom Wallet
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neon-green">✅ Wallet Connected</span>
                <Badge className="bg-neon-cyan text-black">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
                </Badge>
              </div>
              {walletAddress === ADMIN_WALLET && (
                <Badge className="bg-neon-purple text-white">🔧 Admin Access</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tournament List */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🏆 Active Tournaments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tournaments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No tournaments available</p>
            ) : (
              tournaments.map((tournament) => (
                <Card key={tournament.id} className="holographic p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-bold text-neon-pink">
                        {tournament.name}
                      </h3>
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                      <div>
                        <span className="text-gray-400">Start:</span>
                        <div className="text-neon-pink text-xs">
                          {new Date(tournament.start_time).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {tournament.status === 'upcoming' && !isUserEntered(tournament.id) && (
                        <Button 
                          onClick={() => joinTournament(tournament)}
                          disabled={loading || tournament.current_players >= tournament.max_players}
                          className="cyber-button"
                        >
                          {loading ? 'Joining...' : 'Join Tournament'}
                        </Button>
                      )}
                      
                      {isUserEntered(tournament.id) && (
                        <Badge className="bg-neon-green text-black">✅ Joined</Badge>
                      )}
                      
                      {tournament.current_players >= tournament.max_players && (
                        <Badge className="bg-red-500 text-white">🔒 Full</Badge>
                      )}
                      
                      {walletAddress === tournament.admin_wallet && tournament.status === 'active' && (
                        <Button
                          onClick={() => setSelectedTournament(tournament)}
                          className="cyber-button bg-neon-purple hover:bg-neon-purple/80"
                        >
                          Complete Tournament
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tournament Completion Modal */}
      {selectedTournament && (
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-xl text-neon-purple">
              🏆 Complete Tournament: {selectedTournament.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-300">
                <p>Prize Pool: {selectedTournament.prize_pool} SOL</p>
                <p>Winner receives: {(selectedTournament.prize_pool * 0.9).toFixed(4)} SOL</p>
                <p>Admin fee: {(selectedTournament.prize_pool * 0.1).toFixed(4)} SOL</p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Winner Wallet Address:
                </label>
                <Input
                  type="text"
                  placeholder="Enter winner's wallet address"
                  className="bg-gray-800 border-neon-cyan text-white"
                  id="winner-wallet"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    const winnerWallet = (document.getElementById('winner-wallet') as HTMLInputElement)?.value;
                    if (winnerWallet) {
                      completeTournament(selectedTournament, winnerWallet);
                      setSelectedTournament(null);
                    }
                  }}
                  disabled={loading}
                  className="cyber-button bg-neon-green hover:bg-neon-green/80"
                >
                  {loading ? 'Completing...' : 'Complete & Send Prize'}
                </Button>
                <Button
                  onClick={() => setSelectedTournament(null)}
                  variant="outline"
                  className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Tournament Creation */}
      {walletAddress === ADMIN_WALLET && (
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-xl text-neon-purple">
              🔧 Create New Tournament
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tournament Name:
                  </label>
                  <Input
                    type="text"
                    placeholder="Tournament name"
                    className="bg-gray-800 border-neon-cyan text-white"
                    id="tournament-name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Entry Fee (SOL):
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.1"
                    className="bg-gray-800 border-neon-cyan text-white"
                    id="entry-fee"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Time:
                  </label>
                  <Input
                    type="datetime-local"
                    className="bg-gray-800 border-neon-cyan text-white"
                    id="start-time"
                  />
                </div>
              </div>
              
              <Button
                onClick={() => {
                  const name = (document.getElementById('tournament-name') as HTMLInputElement)?.value;
                  const entryFee = parseFloat((document.getElementById('entry-fee') as HTMLInputElement)?.value || '0.1');
                  const startTime = (document.getElementById('start-time') as HTMLInputElement)?.value;
                  
                  if (name && startTime) {
                    createTournament(name, entryFee, startTime);
                  }
                }}
                disabled={loading}
                className="cyber-button w-full"
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
