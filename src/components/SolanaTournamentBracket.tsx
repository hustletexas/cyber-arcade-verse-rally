import React, { useState, useEffect } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider } from '@project-serum/anchor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

// Mock IDL for now - you'll need to replace this with your actual IDL
const mockIdl = {
  version: "0.1.0",
  name: "tournament_bracket",
  instructions: [],
  accounts: [],
  types: []
};

export const SolanaTournamentBracket = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState('');
  const [winnerKey, setWinnerKey] = useState('');
  const [bracketData, setBracketData] = useState<any>(null);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeSolana();
  }, []);

  const initializeSolana = async () => {
    try {
      const conn = new Connection("https://api.devnet.solana.com");
      setConnection(conn);
      
      // Note: You'll need to replace this with your actual program setup
      // const provider = AnchorProvider.local();
      // const prog = new Program(idl, new PublicKey("YOUR_PROGRAM_ID_HERE"), provider);
      // setProgram(prog);
      
      // loadBracketStatus();
    } catch (error) {
      console.error('Failed to initialize Solana connection:', error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to Solana network",
        variant: "destructive"
      });
    }
  };

  const registerPlayer = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in to register for tournaments",
        variant: "destructive"
      });
      return;
    }

    if (!playerName.trim()) {
      toast({
        title: "Player Name Required",
        description: "Please enter your player name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Mock registration for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Player Registered!",
        description: `${playerName} has been registered for the tournament`,
      });
      setPlayerName('');
    } catch (error) {
      console.error('Registration failed:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register player. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const submitMatchResult = async () => {
    if (!user) {
      toast({
        title: "Admin Access Required",
        description: "Only administrators can submit match results",
        variant: "destructive"
      });
      return;
    }

    if (!winnerKey.trim()) {
      toast({
        title: "Winner Address Required",
        description: "Please enter the winner's wallet address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Mock result submission for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Match Result Submitted!",
        description: "Tournament bracket has been updated",
      });
      setWinnerKey('');
    } catch (error) {
      console.error('Failed to submit result:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit match result. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBracketStatus = async () => {
    try {
      // Mock bracket data for now
      const mockBracket = {
        tournament_id: 1,
        status: "active",
        registered_players: 8,
        current_round: 1,
        matches: [
          { id: 1, player1: "Player1", player2: "Player2", winner: null },
          { id: 2, player1: "Player3", player2: "Player4", winner: null }
        ]
      };
      setBracketData(mockBracket);
    } catch (error) {
      console.error('Failed to load bracket status:', error);
    }
  };

  useEffect(() => {
    loadBracketStatus();
  }, []);

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-xl md:text-2xl text-neon-cyan text-center">
          🏆 Solana Tournament Bracket System
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bracket Status */}
        <div className="p-4 bg-black/50 border border-neon-cyan rounded-lg">
          <h3 className="text-neon-pink font-bold mb-3">📊 Bracket Status</h3>
          {bracketData ? (
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>Tournament ID:</span>
                <span className="text-neon-green">{bracketData.tournament_id}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="text-neon-cyan">{bracketData.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Registered Players:</span>
                <span className="text-neon-purple">{bracketData.registered_players}</span>
              </div>
              <div className="flex justify-between">
                <span>Current Round:</span>
                <span className="text-neon-pink">{bracketData.current_round}</span>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading bracket status...</p>
          )}
        </div>

        {/* Player Registration */}
        <div className="space-y-3">
          <h3 className="text-neon-green font-bold">🎮 Player Registration</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Enter Your Player Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="flex-1 bg-black/20 border-neon-cyan text-white placeholder:text-gray-400"
            />
            <Button
              onClick={registerPlayer}
              disabled={loading}
              className="cyber-button px-6"
            >
              {loading ? 'Registering...' : 'Register Player'}
            </Button>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="space-y-3">
          <h3 className="text-neon-pink font-bold">⚙️ Admin Controls</h3>
          <div className="flex gap-2">
            <Input
              placeholder="Winner Wallet Address"
              value={winnerKey}
              onChange={(e) => setWinnerKey(e.target.value)}
              className="flex-1 bg-black/20 border-neon-green text-white placeholder:text-gray-400"
            />
            <Button
              onClick={submitMatchResult}
              disabled={loading}
              variant="outline"
              className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black px-6"
            >
              {loading ? 'Submitting...' : 'Submit Result'}
            </Button>
          </div>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className={`w-2 h-2 rounded-full ${connection ? 'bg-neon-green' : 'bg-red-500'}`}></div>
          <span className="text-muted-foreground">
            Solana Network: {connection ? 'Connected (Devnet)' : 'Disconnected'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};