
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { CreateProposalParams, ProposalType, VoteParams } from '@/types/voting-dao';

export const SolanaVotingDAO = () => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [isVoting, setIsVoting] = useState<number | null>(null);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalType, setProposalType] = useState<string>('parameter');

  // CCTR fee constants
  const PROPOSAL_FEE = 100; // 100 CCTR to create proposal
  const VOTING_FEE = 10; // 10 CCTR to vote

  // Mock data for demonstration
  const mockProposals = [
    {
      id: 1,
      title: "Increase Tournament Prize Pool",
      description: "Propose to increase the tournament prize pool from 1000 to 2000 CCTR tokens",
      votesFor: 15420,
      votesAgainst: 3210,
      endTime: new Date(Date.now() + 86400000), // 24 hours from now
      executed: false,
      proposalFee: PROPOSAL_FEE
    },
    {
      id: 2,
      title: "Add New Game Mode: Battle Royale",
      description: "Introduction of a new battle royale game mode for tournaments",
      votesFor: 8950,
      votesAgainst: 12300,
      endTime: new Date(Date.now() + 172800000), // 48 hours from now
      executed: false,
      proposalFee: PROPOSAL_FEE
    }
  ];

  const handleCreateProposal = async () => {
    if (!isWalletConnected || !primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Solana wallet to create proposals",
        variant: "destructive",
      });
      return;
    }

    if (!proposalTitle || !proposalDescription) {
      toast({
        title: "Missing Information",
        description: "Please fill in all proposal details",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingProposal(true);

    try {
      // Here you would integrate with the Anchor program
      // Creating proposal with CCTR fee
      
      // Simulate smart contract interaction
      
      // Simulate smart contract interaction with CCTR fee
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Proposal Created! 🗳️",
        description: `Your proposal "${proposalTitle}" has been submitted to the DAO. ${PROPOSAL_FEE} CCTR fee deducted.`,
      });

      // Reset form
      setProposalTitle('');
      setProposalDescription('');
      setProposalType('parameter');

    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create proposal. Please ensure you have enough CCTR tokens.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProposal(false);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!isWalletConnected || !primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Solana wallet to vote",
        variant: "destructive",
      });
      return;
    }

    setIsVoting(proposalId);

    try {
      // Voting on proposal with CCTR fee
      
      // Simulate smart contract interaction
      
      // Simulate smart contract interaction with CCTR fee
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Vote Cast! 🗳️",
        description: `You voted ${support ? 'FOR' : 'AGAINST'} proposal #${proposalId}. ${VOTING_FEE} CCTR fee deducted.`,
      });
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: "Failed to cast vote. Please ensure you have enough CCTR tokens.",
        variant: "destructive",
      });
    } finally {
      setIsVoting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection Status */}
      {!isWalletConnected && (
        <Card className="bg-neon-pink/10 border-neon-pink/30">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-neon-pink font-semibold mb-2">Wallet Connection Required</p>
              <p className="text-sm text-muted-foreground">
                Connect your Solana wallet to participate in DAO governance
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connected Wallet Info */}
      {isWalletConnected && primaryWallet && (
        <Card className="bg-neon-green/10 border-neon-green/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neon-green font-semibold">Wallet Connected</p>
                <p className="text-sm text-muted-foreground">
                  {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}
                </p>
              </div>
              <Badge className="bg-neon-green text-black">
                {primaryWallet.type.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DAO Stats */}
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
          <h3 className="font-display text-lg text-neon-purple mb-2">CCTR LOCKED</h3>
          <div className="text-3xl font-black text-neon-cyan">45,892</div>
          <p className="text-sm text-muted-foreground">In Governance</p>
        </Card>
      </div>

      {/* Fee Information */}
      <Card className="vending-machine">
        <CardHeader>
          <CardTitle className="font-display text-lg text-neon-cyan">
            💰 Governance Fees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-neon-green">{PROPOSAL_FEE} CCTR</div>
              <p className="text-sm text-muted-foreground">Create Proposal</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-neon-purple">{VOTING_FEE} CCTR</div>
              <p className="text-sm text-muted-foreground">Cast Vote</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Proposal */}
      <Card className="vending-machine">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🏛️ Create New Proposal
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fee: {PROPOSAL_FEE} CCTR tokens (deducted from your wallet)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neon-purple mb-2">
              Proposal Title
            </label>
            <Input
              value={proposalTitle}
              onChange={(e) => setProposalTitle(e.target.value)}
              placeholder="Enter proposal title..."
              className="bg-black/50 border-neon-cyan/30"
              disabled={!isWalletConnected}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neon-purple mb-2">
              Description
            </label>
            <Textarea
              value={proposalDescription}
              onChange={(e) => setProposalDescription(e.target.value)}
              placeholder="Describe your proposal in detail..."
              className="bg-black/50 border-neon-cyan/30 min-h-[100px]"
              disabled={!isWalletConnected}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neon-purple mb-2">
              Proposal Type
            </label>
            <Select 
              value={proposalType} 
              onValueChange={setProposalType}
              disabled={!isWalletConnected}
            >
              <SelectTrigger className="bg-black/50 border-neon-cyan/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parameter">Parameter Change</SelectItem>
                <SelectItem value="treasury">Treasury Management</SelectItem>
                <SelectItem value="governance">Governance Update</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleCreateProposal}
            disabled={isCreatingProposal || !isWalletConnected}
            className="cyber-button w-full"
          >
            {isCreatingProposal ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                CREATING...
              </>
            ) : (
              `🏛️ CREATE PROPOSAL (${PROPOSAL_FEE} CCTR)`
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Active Proposals */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            🗳️ Active Proposals
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Vote fee: {VOTING_FEE} CCTR per vote
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {mockProposals.map((proposal) => (
            <Card key={proposal.id} className="holographic p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-display text-lg text-neon-cyan mb-2">
                    {proposal.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3">
                    {proposal.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm mb-2">
                    <Badge className="bg-neon-green text-black">
                      FOR: {proposal.votesFor.toLocaleString()}
                    </Badge>
                    <Badge className="bg-neon-pink text-white">
                      AGAINST: {proposal.votesAgainst.toLocaleString()}
                    </Badge>
                    <span className="text-neon-purple">
                      Ends: {proposal.endTime.toLocaleDateString()}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    Proposal Fee Paid: {proposal.proposalFee} CCTR
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleVote(proposal.id, true)}
                  className="bg-neon-green text-black hover:bg-neon-green/80"
                  disabled={!isWalletConnected || isVoting === proposal.id}
                >
                  {isVoting === proposal.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                      VOTING...
                    </>
                  ) : (
                    `👍 FOR (${VOTING_FEE} CCTR)`
                  )}
                </Button>
                <Button 
                  onClick={() => handleVote(proposal.id, false)}
                  className="bg-neon-pink text-white hover:bg-neon-pink/80"
                  disabled={!isWalletConnected || isVoting === proposal.id}
                >
                  {isVoting === proposal.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      VOTING...
                    </>
                  ) : (
                    `👎 AGAINST (${VOTING_FEE} CCTR)`
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
