import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { supabase } from '@/integrations/supabase/client';

export const VotingSection = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isWalletConnected, getConnectedWallet } = useWallet();
  const { balance, refetch } = useUserBalance();
  const [votes, setVotes] = useState<{[key: string]: string}>({});
  const [votingInProgress, setVotingInProgress] = useState<{[key: string]: boolean}>({});

  const proposals = [
    {
      id: 'game-mode',
      title: 'NEW GAME MODE SELECTION',
      description: 'Choose the next game mode to be added to the arcade',
      endDate: '2024-12-20',
      status: 'active',
      options: [
        { id: 'battle-royale', name: 'Battle Royale Arena', votes: 1250, percentage: 45 },
        { id: 'puzzle-master', name: 'Puzzle Master Challenge', votes: 980, percentage: 35 },
        { id: 'racing-circuit', name: 'Neon Racing Circuit', votes: 560, percentage: 20 }
      ]
    },
    {
      id: 'tournament-rules',
      title: 'TOURNAMENT RULE UPDATES',
      description: 'Vote on proposed changes to tournament regulations',
      endDate: '2024-12-15',
      status: 'active',
      options: [
        { id: 'approve-rules', name: 'Approve New Rules', votes: 2100, percentage: 75 },
        { id: 'reject-rules', name: 'Reject Changes', votes: 700, percentage: 25 }
      ]
    }
  ];

  const castVote = async (proposalId: string, optionId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to vote on proposals",
        variant: "destructive"
      });
      return;
    }

    if (!isWalletConnected()) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to vote",
        variant: "destructive"
      });
      return;
    }

    if (balance.cctr_balance < 1) {
      toast({
        title: "Insufficient CCTR",
        description: "You need at least 1 CCTR to cast a vote",
        variant: "destructive"
      });
      return;
    }

    setVotingInProgress(prev => ({ ...prev, [proposalId]: true }));

    try {
      // Deduct 1 CCTR from user's balance
      const newBalance = balance.cctr_balance - 1;
      
      const { error: balanceError } = await supabase
        .from('user_balances')
        .update({
          cctr_balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (balanceError) throw balanceError;

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: -1,
          transaction_type: 'vote',
          description: `Vote cast for ${optionId} in ${proposalId}`
        });

      if (transactionError) throw transactionError;

      // Update local state
      setVotes({ ...votes, [proposalId]: optionId });
      
      // Refresh balance
      await refetch();

      toast({
        title: "Vote Cast Successfully!",
        description: `Your vote for "${proposals.find(p => p.id === proposalId)?.options.find(o => o.id === optionId)?.name}" has been recorded. 1 CCTR deducted.`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: "Voting Failed",
        description: "There was an error processing your vote. Please try again.",
        variant: "destructive"
      });
    } finally {
      setVotingInProgress(prev => ({ ...prev, [proposalId]: false }));
    }
  };

  const connectedWallet = getConnectedWallet();

  return (
    <div className="space-y-6">
      {/* Voting Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-purple flex items-center gap-3">
            🗳️ GOVERNANCE & VOTING
            <Badge className={`${user && isWalletConnected() ? 'bg-neon-green' : 'bg-neon-pink'} text-black`}>
              {user && isWalletConnected() ? '✅ ELIGIBLE' : '❌ LOGIN & WALLET REQUIRED'}
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Cast your vote on community proposals. Each vote costs 1 CCTR token.
          </p>
          {user && isWalletConnected() && (
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge className="bg-neon-cyan text-black">
                💰 {balance.cctr_balance} CCTR Available
              </Badge>
              {connectedWallet && (
                <Badge className="bg-neon-purple text-white">
                  🔗 {connectedWallet.address.slice(0, 4)}...{connectedWallet.address.slice(-4)}
                </Badge>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Active Proposals */}
      <div className="space-y-6">
        {proposals.map((proposal) => (
          <Card key={proposal.id} className="vending-machine">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="font-display text-xl text-neon-cyan">
                    {proposal.title}
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">{proposal.description}</p>
                </div>
                <div className="text-right">
                  <Badge className={`${proposal.status === 'active' ? 'bg-neon-green' : 'bg-neon-purple'} text-black`}>
                    {proposal.status.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-neon-cyan mt-1">
                    Ends: {proposal.endDate}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.options.map((option) => (
                  <div key={option.id} className="arcade-frame p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold text-neon-pink">{option.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-neon-green">{option.votes} votes</span>
                        <Badge className="bg-neon-cyan text-black">
                          {option.percentage}%
                        </Badge>
                      </div>
                    </div>
                    <Progress value={option.percentage} className="mb-3" />
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-muted-foreground">
                        {option.percentage}% of total votes
                      </div>
                      {proposal.status === 'active' && (
                        <Button
                          onClick={() => castVote(proposal.id, option.id)}
                          disabled={!user || !isWalletConnected() || balance.cctr_balance < 1 || votes[proposal.id] === option.id || votingInProgress[proposal.id]}
                          className={`cyber-button text-sm ${votes[proposal.id] === option.id ? 'bg-neon-green' : ''}`}
                        >
                          {votingInProgress[proposal.id] ? '⏳ VOTING...' : 
                           votes[proposal.id] === option.id ? '✅ VOTED' : 
                           '🗳️ VOTE (1 CCTR)'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {(!user || !isWalletConnected()) && (
                <div className="mt-4 p-4 border-2 border-neon-pink rounded-lg bg-neon-pink/10">
                  <p className="text-neon-pink font-bold">🔐 Login & Wallet Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need to be logged in and have a connected wallet to participate in governance voting.
                  </p>
                </div>
              )}

              {user && isWalletConnected() && balance.cctr_balance < 1 && (
                <div className="mt-4 p-4 border-2 border-neon-pink rounded-lg bg-neon-pink/10">
                  <p className="text-neon-pink font-bold">💰 Insufficient CCTR</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need at least 1 CCTR token to cast a vote. Purchase more CCTR to participate.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Voting Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="holographic p-6 text-center">
          <h3 className="font-display text-lg text-neon-cyan mb-2">TOTAL VOTERS</h3>
          <div className="text-3xl font-black text-neon-green">8,247</div>
          <p className="text-sm text-muted-foreground">Active Participants</p>
        </Card>

        <Card className="holographic p-6 text-center">
          <h3 className="font-display text-lg text-neon-pink mb-2">PROPOSALS</h3>
          <div className="text-3xl font-black text-neon-purple">23</div>
          <p className="text-sm text-muted-foreground">Total Governance</p>
        </Card>

        <Card className="holographic p-6 text-center">
          <h3 className="font-display text-lg text-neon-purple mb-2">PARTICIPATION</h3>
          <div className="text-3xl font-black text-neon-cyan">87%</div>
          <p className="text-sm text-muted-foreground">Average Turnout</p>
        </Card>
      </div>
    </div>
  );
};
