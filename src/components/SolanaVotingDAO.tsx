
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
  const { isWalletConnected } = useMultiWallet();
  const [isCreatingProposal, setIsCreatingProposal] = useState(false);
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalDescription, setProposalDescription] = useState('');
  const [proposalType, setProposalType] = useState<string>('parameter');

  // Mock data for demonstration
  const mockProposals = [
    {
      id: 1,
      title: "Increase Tournament Prize Pool",
      description: "Propose to increase the tournament prize pool from 1000 to 2000 CCTR tokens",
      votesFor: 15420,
      votesAgainst: 3210,
      endTime: new Date(Date.now() + 86400000), // 24 hours from now
      executed: false
    },
    {
      id: 2,
      title: "Add New Game Mode: Battle Royale",
      description: "Introduction of a new battle royale game mode for tournaments",
      votesFor: 8950,
      votesAgainst: 12300,
      endTime: new Date(Date.now() + 172800000), // 48 hours from now
      executed: false
    }
  ];

  const handleCreateProposal = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create proposals",
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
      console.log('Creating proposal:', { proposalTitle, proposalDescription, proposalType });
      
      // Simulate proposal creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Proposal Created! 🗳️",
        description: `Your proposal "${proposalTitle}" has been submitted to the DAO`,
      });

      // Reset form
      setProposalTitle('');
      setProposalDescription('');
      setProposalType('parameter');

    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProposal(false);
    }
  };

  const handleVote = async (proposalId: number, support: boolean) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Voting on proposal:', proposalId, support ? 'FOR' : 'AGAINST');
      
      toast({
        title: "Vote Cast! 🗳️",
        description: `You voted ${support ? 'FOR' : 'AGAINST'} proposal #${proposalId}`,
      });
    } catch (error) {
      toast({
        title: "Vote Failed",
        description: "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
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
          <h3 className="font-display text-lg text-neon-purple mb-2">PARTICIPATION</h3>
          <div className="text-3xl font-black text-neon-cyan">87%</div>
          <p className="text-sm text-muted-foreground">Average Turnout</p>
        </Card>
      </div>

      {/* Create Proposal */}
      <Card className="vending-machine">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🏛️ Create New Proposal
          </CardTitle>
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neon-purple mb-2">
              Proposal Type
            </label>
            <Select value={proposalType} onValueChange={setProposalType}>
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
              '🏛️ CREATE PROPOSAL'
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
                  
                  <div className="flex items-center gap-4 text-sm">
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
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleVote(proposal.id, true)}
                  className="bg-neon-green text-black hover:bg-neon-green/80"
                  disabled={!isWalletConnected}
                >
                  👍 VOTE FOR
                </Button>
                <Button 
                  onClick={() => handleVote(proposal.id, false)}
                  className="bg-neon-pink text-white hover:bg-neon-pink/80"
                  disabled={!isWalletConnected}
                >
                  👎 VOTE AGAINST
                </Button>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
