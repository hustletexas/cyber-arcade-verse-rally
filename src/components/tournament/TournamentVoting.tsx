import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Vote, ThumbsUp, Gamepad2, Trophy, Users, Sparkles } from 'lucide-react';

interface TournamentProposal {
  id: string;
  game: string;
  format: string;
  entryFee: string;
  prizePool: string;
  votes: number;
  totalVotes: number;
  hasVoted: boolean;
  icon: React.ReactNode;
}

export const TournamentVoting: React.FC = () => {
  const [proposals, setProposals] = useState<TournamentProposal[]>([
    {
      id: '1',
      game: 'CYBER MATCH',
      format: 'Single Elimination',
      entryFee: 'Free',
      prizePool: '$250 USDC',
      votes: 47,
      totalVotes: 100,
      hasVoted: false,
      icon: <Sparkles className="w-5 h-5 text-neon-pink" />
    },
    {
      id: '2',
      game: 'TETRIS MASTERS',
      format: 'Double Elimination',
      entryFee: '$5 USDC',
      prizePool: '$500 USDC',
      votes: 32,
      totalVotes: 100,
      hasVoted: false,
      icon: <Gamepad2 className="w-5 h-5 text-neon-cyan" />
    },
    {
      id: '3',
      game: 'PAC-MAN CHAMPIONSHIP',
      format: 'Round Robin',
      entryFee: '$10 USDC',
      prizePool: '$1,000 USDC',
      votes: 21,
      totalVotes: 100,
      hasVoted: false,
      icon: <Trophy className="w-5 h-5 text-neon-green" />
    },
  ]);

  const handleVote = (proposalId: string) => {
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId && !p.hasVoted) {
        return { ...p, votes: p.votes + 1, hasVoted: true };
      }
      return p;
    }));
  };

  const totalVotesCast = proposals.reduce((sum, p) => sum + p.votes, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame border-neon-purple/50">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-xl text-neon-purple flex items-center gap-2">
            <Vote className="w-5 h-5" />
            COMMUNITY VOTING
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Vote on upcoming tournaments! The most popular tournaments will be launched first.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <Badge className="bg-neon-purple/20 text-neon-purple border border-neon-purple/50">
              <Users className="w-3 h-3 mr-1" />
              {totalVotesCast} Total Votes
            </Badge>
            <Badge className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50">
              {proposals.length} Proposals
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Proposals */}
      <div className="grid gap-4">
        {proposals.map((proposal, index) => {
          const votePercentage = (proposal.votes / Math.max(totalVotesCast, 1)) * 100;
          
          return (
            <Card 
              key={proposal.id} 
              className={`arcade-frame transition-all ${
                proposal.hasVoted 
                  ? 'border-neon-green/50 bg-neon-green/5' 
                  : 'border-border hover:border-neon-purple/50'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-background/50 border border-border">
                        {proposal.icon}
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-foreground">
                          {proposal.game}
                        </h3>
                        <p className="text-sm text-muted-foreground">{proposal.format}</p>
                      </div>
                      {index === 0 && (
                        <Badge className="bg-neon-pink text-white ml-2">
                          🔥 Leading
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-neon-cyan border-neon-cyan/50">
                        Entry: {proposal.entryFee}
                      </Badge>
                      <Badge variant="outline" className="text-neon-green border-neon-green/50">
                        Prize: {proposal.prizePool}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Votes</span>
                        <span className="font-mono text-neon-purple">
                          {proposal.votes} ({votePercentage.toFixed(1)}%)
                        </span>
                      </div>
                      <Progress 
                        value={votePercentage} 
                        className="h-2 bg-background/50"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => handleVote(proposal.id)}
                    disabled={proposal.hasVoted}
                    className={`shrink-0 ${
                      proposal.hasVoted
                        ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                        : 'bg-neon-purple hover:bg-neon-purple/80 text-white'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    {proposal.hasVoted ? 'Voted!' : 'Vote'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info */}
      <Card className="arcade-frame border-muted">
        <CardContent className="p-4 text-center text-muted-foreground text-sm">
          <p>
            💡 Voting resets weekly. Connect your wallet to make your vote count on-chain!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentVoting;
