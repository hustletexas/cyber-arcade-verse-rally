
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface Tournament {
  id: string;
  name: string;
  format: 'top_5_split' | 'winner_takes_all';
  entry_fee: number;
  prize_pool: number;
  start_time: string;
  status: string;
  admin_wallet: string;
  max_players: number;
  current_players: number;
}

interface Entry {
  id: string;
  tournament_id: string;
  wallet: string;
  epic_name: string;
  score: number;
  kills: number;
  placement?: number;
  screenshot_url?: string;
  approved: boolean;
}

export const SolanaTournamentSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<string>('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [hasNFTPass, setHasNFTPass] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [newTournament, setNewTournament] = useState({
    name: '',
    format: 'top_5_split' as const,
    entry_fee: 0.1,
    prize_pool: 1.0,
    start_time: '',
    max_players: 100
  });

  const [newEntry, setNewEntry] = useState({
    epic_name: '',
    score: 0,
    kills: 0,
    screenshot_url: ''
  });

  useEffect(() => {
    loadTournaments();
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setWalletConnected(true);
          setWalletAddress(response.publicKey.toString());
          await checkNFTPass(response.publicKey.toString());
          checkAdminStatus(response.publicKey.toString());
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
      await checkNFTPass(response.publicKey.toString());
      checkAdminStatus(response.publicKey.toString());
      
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

  const checkNFTPass = async (wallet: string) => {
    try {
      const mockHasNFT = Math.random() > 0.3;
      setHasNFTPass(mockHasNFT);
      
      if (!mockHasNFT) {
        toast({
          title: "NFT Pass Required",
          description: "You need a Cyber City Pass NFT to enter tournaments",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('NFT check failed:', error);
      setHasNFTPass(false);
    }
  };

  const checkAdminStatus = (wallet: string) => {
    const adminWallets = ['YOUR_ADMIN_WALLET_ADDRESS'];
    setIsAdmin(adminWallets.includes(wallet));
  };

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('start_time', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    }
  };

  const loadEntries = async (tournamentId: string) => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('tournament_id', tournamentId)
        .order('score', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const removeActiveTournaments = async () => {
    if (!isAdmin) {
      toast({
        title: "Admin Access Required",
        description: "Only admins can remove tournaments",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: 'cancelled' })
        .eq('status', 'active');

      if (error) throw error;

      toast({
        title: "Active Tournaments Removed",
        description: "All active tournaments have been cancelled successfully"
      });

      loadTournaments();
    } catch (error) {
      toast({
        title: "Removal Failed",
        description: "Failed to remove active tournaments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTournament = async () => {
    if (!user || !isAdmin) {
      toast({
        title: "Admin Access Required",
        description: "Only admins can create tournaments",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournaments')
        .insert([{
          ...newTournament,
          admin_wallet: walletAddress,
          status: 'upcoming'
        }]);

      if (error) throw error;

      toast({
        title: "Tournament Created!",
        description: `${newTournament.name} has been created successfully`
      });

      setNewTournament({
        name: '',
        format: 'top_5_split',
        entry_fee: 0.1,
        prize_pool: 1.0,
        start_time: '',
        max_players: 100
      });

      loadTournaments();
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create tournament",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const joinTournament = async (tournamentId: string) => {
    if (!user || !walletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to join",
        variant: "destructive"
      });
      return;
    }

    if (!hasNFTPass) {
      toast({
        title: "NFT Pass Required",
        description: "You need a Cyber City Pass NFT to enter this tournament",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('entries')
        .insert([{
          tournament_id: tournamentId,
          wallet: walletAddress,
          epic_name: newEntry.epic_name,
          score: 0,
          kills: 0
        }]);

      if (error) throw error;

      toast({
        title: "Tournament Joined!",
        description: "You've successfully joined the tournament"
      });

      setNewEntry({
        epic_name: '',
        score: 0,
        kills: 0,
        screenshot_url: ''
      });

      loadTournaments();
    } catch (error) {
      toast({
        title: "Join Failed",
        description: "Failed to join tournament. You may already be registered.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitScore = async () => {
    if (!selectedTournament) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('entries')
        .update({
          score: newEntry.score,
          kills: newEntry.kills,
          screenshot_url: newEntry.screenshot_url
        })
        .eq('tournament_id', selectedTournament)
        .eq('wallet', walletAddress);

      if (error) throw error;

      toast({
        title: "Score Submitted!",
        description: "Your match result has been submitted for review"
      });

      loadEntries(selectedTournament);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit score",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const approveEntry = async (entryId: string, approved: boolean) => {
    if (!isAdmin) return;

    try {
      const { error } = await supabase
        .from('entries')
        .update({ approved })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: approved ? "Entry Approved" : "Entry Rejected",
        description: `Match result has been ${approved ? 'approved' : 'rejected'}`
      });

      if (selectedTournament) {
        loadEntries(selectedTournament);
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update entry status",
        variant: "destructive"
      });
    }
  };

  const distributePrizes = async (tournamentId: string) => {
    if (!isAdmin) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('complete_tournament', {
        tournament_id_param: tournamentId
      });

      if (error) throw error;

      toast({
        title: "Prizes Distributed!",
        description: "Tournament prizes have been calculated and distributed"
      });

      loadTournaments();
    } catch (error) {
      toast({
        title: "Distribution Failed",
        description: "Failed to distribute prizes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🔗 Solana Wallet Connection
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
              <div className="flex items-center justify-between">
                <span>NFT Pass Status:</span>
                <Badge className={hasNFTPass ? "bg-neon-green text-black" : "bg-red-500 text-white"}>
                  {hasNFTPass ? "✅ Valid Pass" : "❌ No Pass"}
                </Badge>
              </div>
              {isAdmin && (
                <Badge className="bg-neon-purple text-white">🔧 Admin Access</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Tournament Management */}
      {isAdmin && (
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-xl text-neon-purple">
              🏆 Admin Tournament Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={removeActiveTournaments} 
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                {loading ? 'Removing...' : 'Remove All Active Tournaments'}
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-neon-cyan mb-4">Create New Tournament</h3>
              <Input
                placeholder="Tournament Name"
                value={newTournament.name}
                onChange={(e) => setNewTournament({...newTournament, name: e.target.value})}
                className="bg-black/20 border-neon-purple text-white mb-4"
              />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Select 
                  value={newTournament.format} 
                  onValueChange={(value) => setNewTournament({...newTournament, format: value as any})}
                >
                  <SelectTrigger className="bg-black/20 border-neon-purple text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top_5_split">Top 5 Split (40/25/15/12/8%)</SelectItem>
                    <SelectItem value="winner_takes_all">Winner Takes All</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Entry Fee (SOL)"
                  step="0.01"
                  value={newTournament.entry_fee}
                  onChange={(e) => setNewTournament({...newTournament, entry_fee: parseFloat(e.target.value)})}
                  className="bg-black/20 border-neon-purple text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Input
                  type="number"
                  placeholder="Prize Pool (SOL)"
                  step="0.1"
                  value={newTournament.prize_pool}
                  onChange={(e) => setNewTournament({...newTournament, prize_pool: parseFloat(e.target.value)})}
                  className="bg-black/20 border-neon-purple text-white"
                />
                <Input
                  type="datetime-local"
                  value={newTournament.start_time}
                  onChange={(e) => setNewTournament({...newTournament, start_time: e.target.value})}
                  className="bg-black/20 border-neon-purple text-white"
                />
              </div>
              <Button 
                onClick={createTournament} 
                disabled={loading}
                className="cyber-button w-full"
              >
                {loading ? 'Creating...' : 'Create Tournament'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Tournaments */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🏆 Tournaments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {tournaments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No tournaments available</p>
            ) : (
              tournaments.map((tournament) => (
                <Card key={tournament.id} className="holographic p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-neon-pink">{tournament.name}</h3>
                      <Badge className={
                        tournament.status === 'active' ? 'bg-neon-green text-black' :
                        tournament.status === 'upcoming' ? 'bg-neon-cyan text-black' :
                        tournament.status === 'cancelled' ? 'bg-red-500 text-white' :
                        'bg-gray-500 text-white'
                      }>
                        {tournament.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-gray-400">Format:</span>
                        <div className="text-neon-cyan">
                          {tournament.format === 'top_5_split' ? 'Top 5 Split' : 'Winner Takes All'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Entry Fee:</span>
                        <div className="text-neon-green">{tournament.entry_fee} SOL</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Prize Pool:</span>
                        <div className="text-neon-purple">{tournament.prize_pool} SOL</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Players:</span>
                        <div className="text-neon-pink">{tournament.current_players}/{tournament.max_players}</div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {walletConnected && hasNFTPass && tournament.status === 'upcoming' && (
                        <Button 
                          onClick={() => {
                            setSelectedTournament(tournament.id);
                          }}
                          className="cyber-button text-xs"
                        >
                          Join Tournament
                        </Button>
                      )}
                      <Button 
                        onClick={() => {
                          setSelectedTournament(tournament.id);
                          loadEntries(tournament.id);
                        }}
                        variant="outline"
                        className="border-neon-cyan text-neon-cyan text-xs"
                      >
                        View Leaderboard
                      </Button>
                      {isAdmin && (
                        <Button 
                          onClick={() => distributePrizes(tournament.id)}
                          variant="outline"
                          className="border-neon-purple text-neon-purple text-xs"
                          disabled={loading}
                        >
                          Distribute Prizes
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

      {/* Join Tournament Form */}
      {selectedTournament && walletConnected && hasNFTPass && (
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-xl text-neon-green">
              🎮 Join Tournament
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Epic Games Username"
              value={newEntry.epic_name}
              onChange={(e) => setNewEntry({...newEntry, epic_name: e.target.value})}
              className="bg-black/20 border-neon-green text-white"
            />
            <Button 
              onClick={() => joinTournament(selectedTournament)}
              disabled={loading || !newEntry.epic_name}
              className="cyber-button w-full"
            >
              {loading ? 'Joining...' : 'Join Tournament'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Score Submission */}
      {selectedTournament && walletConnected && (
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-xl text-neon-pink">
              📊 Submit Match Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="Score"
                value={newEntry.score}
                onChange={(e) => setNewEntry({...newEntry, score: parseInt(e.target.value)})}
                className="bg-black/20 border-neon-pink text-white"
              />
              <Input
                type="number"
                placeholder="Kills"
                value={newEntry.kills}
                onChange={(e) => setNewEntry({...newEntry, kills: parseInt(e.target.value)})}
                className="bg-black/20 border-neon-pink text-white"
              />
            </div>
            <Input
              placeholder="Screenshot URL (optional)"
              value={newEntry.screenshot_url}
              onChange={(e) => setNewEntry({...newEntry, screenshot_url: e.target.value})}
              className="bg-black/20 border-neon-pink text-white"
            />
            <Button 
              onClick={submitScore}
              disabled={loading}
              className="cyber-button w-full"
            >
              {loading ? 'Submitting...' : 'Submit Score'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard */}
      {selectedTournament && entries.length > 0 && (
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-xl text-neon-cyan">
              🏆 Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-black/30 rounded border border-neon-cyan/30">
                  <div className="flex items-center gap-3">
                    <span className="text-neon-purple font-bold">#{index + 1}</span>
                    <span className="text-white">{entry.epic_name}</span>
                    <Badge className={entry.approved ? "bg-neon-green text-black" : "bg-yellow-500 text-black"}>
                      {entry.approved ? "Approved" : "Pending"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-neon-cyan">{entry.score} pts</span>
                    <span className="text-neon-pink">{entry.kills} kills</span>
                    {isAdmin && !entry.approved && (
                      <div className="flex gap-1">
                        <Button 
                          onClick={() => approveEntry(entry.id, true)}
                          size="sm"
                          className="bg-neon-green text-black text-xs"
                        >
                          ✓
                        </Button>
                        <Button 
                          onClick={() => approveEntry(entry.id, false)}
                          size="sm"
                          variant="destructive"
                          className="text-xs"
                        >
                          ✗
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NFT Gate Message */}
      {walletConnected && !hasNFTPass && (
        <Card className="arcade-frame border-red-500">
          <CardContent className="text-center p-6">
            <h3 className="text-xl font-bold text-red-400 mb-3">🚫 NFT Pass Required</h3>
            <p className="text-gray-300 mb-4">
              You need a Cyber City Pass NFT to enter tournaments. 
              Purchase one from our marketplace to get started!
            </p>
            <Button className="cyber-button">
              Buy NFT Pass
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
