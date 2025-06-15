import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const VotingSection = () => {
  const [votes, setVotes] = useState<{[key: string]: string}>({});
  const [hasNFT, setHasNFT] = useState(true); // Mock NFT ownership

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

  const castVote = (proposalId: string, optionId: string) => {
    if (!hasNFT) {
      console.log('NFT required to vote');
      return;
    }
    setVotes({ ...votes, [proposalId]: optionId });
    console.log(`Voted for ${optionId} in proposal ${proposalId}`);
  };

  return (
    <div className="space-y-6">
      {/* Voting Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-purple flex items-center gap-3">
            🗳️ GOVERNANCE & VOTING
            <Badge className={`${hasNFT ? 'bg-neon-green' : 'bg-neon-pink'} text-black`}>
              {hasNFT ? '✅ ELIGIBLE' : '❌ NFT REQUIRED'}
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            NFT holders shape the future of Cyber City Arcade through community governance
          </p>
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
                          disabled={!hasNFT || votes[proposal.id] === option.id}
                          className={`cyber-button text-sm ${votes[proposal.id] === option.id ? 'bg-neon-green' : ''}`}
                        >
                          {votes[proposal.id] === option.id ? '✅ VOTED' : '🗳️ VOTE'}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!hasNFT && (
                <div className="mt-4 p-4 border-2 border-neon-pink rounded-lg bg-neon-pink/10">
                  <p className="text-neon-pink font-bold">🎟️ NFT Pass Required</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You need to own a tournament NFT pass to participate in governance voting.
                  </p>
                  <Button className="mt-2 cyber-button text-sm">
                    🔨 MINT NFT PASS
                  </Button>
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
