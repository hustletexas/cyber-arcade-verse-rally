import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vote, ThumbsUp, Gamepad2, Trophy, Users, Sparkles, Monitor, Smartphone } from 'lucide-react';

type GameCategory = 'pc' | 'ps5' | 'mobile';

interface GameProposal {
  id: string;
  game: string;
  category: GameCategory;
  format: string;
  entryFee: string;
  prizePool: string;
  votes: number;
  hasVoted: boolean;
}

const initialProposals: GameProposal[] = [
  // PC Games
  { id: 'pc-1', game: 'VALORANT', category: 'pc', format: 'Single Elimination', entryFee: '$10 USDC', prizePool: '$500 USDC', votes: 64, hasVoted: false },
  { id: 'pc-2', game: 'LEAGUE OF LEGENDS', category: 'pc', format: 'Double Elimination', entryFee: '$15 USDC', prizePool: '$1,000 USDC', votes: 52, hasVoted: false },
  { id: 'pc-3', game: 'CS2', category: 'pc', format: 'Single Elimination', entryFee: '$10 USDC', prizePool: '$750 USDC', votes: 41, hasVoted: false },
  { id: 'pc-4', game: 'FORTNITE PC', category: 'pc', format: 'Battle Royale', entryFee: 'Free', prizePool: '$250 USDC', votes: 33, hasVoted: false },
  // PS5 Games
  { id: 'ps5-1', game: 'TEKKEN 8', category: 'ps5', format: 'Single Elimination', entryFee: '$10 USDC', prizePool: '$500 USDC', votes: 58, hasVoted: false },
  { id: 'ps5-2', game: 'GTA 6', category: 'ps5', format: 'Round Robin', entryFee: '$15 USDC', prizePool: '$1,000 USDC', votes: 71, hasVoted: false },
  { id: 'ps5-3', game: 'UNDISPUTED BOXING', category: 'ps5', format: 'Single Elimination', entryFee: '$5 USDC', prizePool: '$300 USDC', votes: 39, hasVoted: false },
  { id: 'ps5-4', game: 'FORTNITE PS5', category: 'ps5', format: 'Battle Royale', entryFee: 'Free', prizePool: '$250 USDC', votes: 45, hasVoted: false },
  // Mobile Games
  { id: 'mob-1', game: 'CLASH ROYALE', category: 'mobile', format: 'Double Elimination', entryFee: 'Free', prizePool: '$250 USDC', votes: 47, hasVoted: false },
  { id: 'mob-2', game: 'PUBG MOBILE', category: 'mobile', format: 'Battle Royale', entryFee: '$5 USDC', prizePool: '$500 USDC', votes: 55, hasVoted: false },
  { id: 'mob-3', game: 'COD MOBILE', category: 'mobile', format: 'Single Elimination', entryFee: '$5 USDC', prizePool: '$400 USDC', votes: 38, hasVoted: false },
  { id: 'mob-4', game: 'GENSHIN IMPACT', category: 'mobile', format: 'Score Attack', entryFee: 'Free', prizePool: '$200 USDC', votes: 29, hasVoted: false },
];

const categoryConfig: Record<GameCategory, { label: string; icon: React.ReactNode; color: string; borderColor: string; bgColor: string }> = {
  pc: { label: 'PC GAMES', icon: <Monitor className="w-4 h-4" />, color: 'text-neon-purple', borderColor: 'border-neon-purple/50', bgColor: 'bg-neon-purple/20' },
  ps5: { label: 'PS5 GAMES', icon: <Gamepad2 className="w-4 h-4" />, color: 'text-neon-cyan', borderColor: 'border-neon-cyan/50', bgColor: 'bg-neon-cyan/20' },
  mobile: { label: 'MOBILE GAMES', icon: <Smartphone className="w-4 h-4" />, color: 'text-neon-pink', borderColor: 'border-neon-pink/50', bgColor: 'bg-neon-pink/20' },
};

export const TournamentVoting: React.FC = () => {
  const [proposals, setProposals] = useState<GameProposal[]>(initialProposals);

  const handleVote = (proposalId: string) => {
    setProposals(prev => prev.map(p => {
      if (p.id === proposalId && !p.hasVoted) {
        return { ...p, votes: p.votes + 1, hasVoted: true };
      }
      return p;
    }));
  };

  const totalVotesCast = proposals.reduce((sum, p) => sum + p.votes, 0);

  const renderCategoryProposals = (category: GameCategory) => {
    const categoryProposals = proposals
      .filter(p => p.category === category)
      .sort((a, b) => b.votes - a.votes);
    const config = categoryConfig[category];
    const categoryTotalVotes = categoryProposals.reduce((sum, p) => sum + p.votes, 0);

    return (
      <div className="grid gap-4">
        {categoryProposals.map((proposal, index) => {
          const votePercentage = (proposal.votes / Math.max(categoryTotalVotes, 1)) * 100;

          return (
            <Card
              key={proposal.id}
              className={`arcade-frame transition-all ${
                proposal.hasVoted
                  ? 'border-neon-green/50 bg-neon-green/5'
                  : `border-border hover:${config.borderColor}`
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-background/50 border ${config.borderColor}`}>
                        {config.icon}
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
                        <span className={`font-mono ${config.color}`}>
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
    );
  };

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
            Pick your favorite games across PC, PS5 & Mobile! Top-voted games in each category become the next tournament.
          </p>
          <div className="flex items-center gap-4 mt-4 flex-wrap">
            <Badge className="bg-neon-purple/20 text-neon-purple border border-neon-purple/50">
              <Users className="w-3 h-3 mr-1" />
              {totalVotesCast} Total Votes
            </Badge>
            <Badge className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50">
              {proposals.length} Games
            </Badge>
            <Badge className="bg-neon-pink/20 text-neon-pink border border-neon-pink/50">
              3 Categories
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs defaultValue="pc" className="w-full">
        <TabsList className="w-full bg-card/50 border border-border h-auto p-1 gap-1">
          {(Object.keys(categoryConfig) as GameCategory[]).map((cat) => {
            const config = categoryConfig[cat];
            return (
              <TabsTrigger
                key={cat}
                value={cat}
                className={`flex-1 font-display text-sm gap-2 data-[state=active]:${config.bgColor} data-[state=active]:${config.color}`}
              >
                {config.icon}
                {config.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="pc" className="mt-4">
          {renderCategoryProposals('pc')}
        </TabsContent>
        <TabsContent value="ps5" className="mt-4">
          {renderCategoryProposals('ps5')}
        </TabsContent>
        <TabsContent value="mobile" className="mt-4">
          {renderCategoryProposals('mobile')}
        </TabsContent>
      </Tabs>

      {/* Info */}
      <Card className="arcade-frame border-muted">
        <CardContent className="p-4 text-center text-muted-foreground text-sm">
          <p>
            💡 Voting resets weekly. The top game from each category will become the next scheduled tournament!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TournamentVoting;
