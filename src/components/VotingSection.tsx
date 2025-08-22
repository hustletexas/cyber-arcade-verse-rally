
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Trophy, Gift, Users, Coins } from 'lucide-react';

export const VotingSection = () => {
  const { user, isWalletConnected, walletAddress, phantomConnect } = useAuth();
  const { toast } = useToast();
  const [selectedPrize, setSelectedPrize] = useState<string>('');

  const handleConnect = async () => {
    await phantomConnect();
  };

  const handleVote = () => {
    if (!selectedPrize) return;
    
    toast({
      title: "Vote Submitted! 🗳️",
      description: `Your vote for ${selectedPrize} has been recorded on the blockchain`,
    });
  };

  if (!isWalletConnected || !user) {
    return (
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-purple flex items-center gap-3">
            🗳️ COMMUNITY VOTING
            <Badge className="bg-neon-pink text-black">PHANTOM WALLET REQUIRED</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="w-24 h-24 bg-gradient-to-br from-neon-purple to-neon-pink rounded-full flex items-center justify-center neon-glow mx-auto">
              <Wallet size={40} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-neon-cyan">Connect Your Phantom Wallet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Connect your Phantom wallet to participate in community voting and earn rewards for your participation.
            </p>
            <Button 
              onClick={handleConnect}
              className="cyber-button text-lg px-8 py-3"
            >
              <Wallet size={20} className="mr-2" />
              CONNECT PHANTOM WALLET
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-purple flex items-center gap-3">
          🗳️ COMMUNITY VOTING
          <Badge className="bg-neon-green text-black">
            <Wallet size={16} className="mr-1" />
            CONNECTED
          </Badge>
          <Badge className="bg-neon-cyan text-black text-sm">
            {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/50">
            <TabsTrigger value="community" className="data-[state=active]:bg-neon-purple data-[state=active]:text-black">
              <Users className="mr-2" size={16} />
              Community Polls
            </TabsTrigger>
            <TabsTrigger value="prizes" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
              <Gift className="mr-2" size={16} />
              Prize Votes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="space-y-4">
            <div className="grid gap-4">
              <Card className="holographic p-4">
                <h4 className="font-bold text-neon-cyan mb-2">🎮 Next Game Addition</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Which classic arcade game should we add next?
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {['Street Fighter', 'Mortal Kombat', 'Donkey Kong', 'Centipede'].map((game) => (
                    <Button key={game} variant="outline" size="sm" className="text-xs">
                      {game}
                    </Button>
                  ))}
                </div>
              </Card>

              <Card className="holographic p-4">
                <h4 className="font-bold text-neon-pink mb-2">🌈 Theme Colors</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Vote for the next arcade theme color scheme
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {['Retro Orange', 'Electric Blue', 'Laser Green'].map((color) => (
                    <Button key={color} variant="outline" size="sm" className="text-xs">
                      {color}
                    </Button>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="prizes" className="space-y-4">
            <div className="grid gap-4">
              <Card className="holographic p-4">
                <h4 className="font-bold text-neon-green mb-2">🏆 Monthly Prize Pool</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Vote for this month's grand prize
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'Gaming Laptop', votes: 1247 },
                    { name: 'VR Headset', votes: 892 },
                    { name: '500 SOL', votes: 1556 },
                    { name: 'Gaming Chair', votes: 423 }
                  ].map((prize) => (
                    <div key={prize.name} className="flex items-center justify-between p-2 border border-neon-cyan/30 rounded">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="prize"
                          value={prize.name}
                          onChange={(e) => setSelectedPrize(e.target.value)}
                          className="text-neon-cyan"
                        />
                        <span className="text-sm">{prize.name}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {prize.votes} votes
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button 
                  onClick={handleVote}
                  disabled={!selectedPrize}
                  className="w-full mt-4 cyber-button"
                >
                  <Trophy size={16} className="mr-2" />
                  SUBMIT VOTE
                </Button>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="bg-neon-purple/10 border-neon-purple/30 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Coins size={16} className="text-neon-yellow" />
            <span className="font-bold text-neon-yellow">Voting Rewards</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Earn 50 CCTR tokens for each vote you cast. Active community members get bonus rewards!
          </p>
        </Card>
      </CardContent>
    </Card>
  );
};
