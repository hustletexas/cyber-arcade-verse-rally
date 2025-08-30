
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, Clock, TrendingUp, Wallet } from 'lucide-react';

interface UserNode {
  id: string;
  type: 'basic' | 'premium' | 'legendary';
  purchaseDate: string;
  dailyReward: number;
  totalEarned: number;
  nextReward: string;
  status: 'active' | 'pending' | 'inactive';
}

interface NodeRewardsProps {
  userWallet: string;
  isWalletConnected: boolean;
}

export const NodeRewards: React.FC<NodeRewardsProps> = ({
  userWallet,
  isWalletConnected
}) => {
  const [userNodes, setUserNodes] = useState<UserNode[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);

  // Mock user nodes data
  useEffect(() => {
    if (isWalletConnected) {
      // Simulate user having some nodes
      setUserNodes([
        {
          id: '1',
          type: 'premium',
          purchaseDate: '2024-01-15',
          dailyReward: 1.5,
          totalEarned: 45.7,
          nextReward: '2024-01-30T00:00:00Z',
          status: 'active'
        },
        {
          id: '2',
          type: 'basic',
          purchaseDate: '2024-01-20',
          dailyReward: 0.5,
          totalEarned: 12.3,
          totalEarned: 12.3,
          nextReward: '2024-01-30T00:00:00Z',
          status: 'active'
        }
      ]);
      setTotalEarnings(58.0);
      setPendingRewards(2.0);
    }
  }, [isWalletConnected]);

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'basic': return '🔷';
      case 'premium': return '💎';
      case 'legendary': return '🏆';
      default: return '📦';
    }
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'text-neon-cyan';
      case 'premium': return 'text-neon-purple';
      case 'legendary': return 'text-neon-pink';
      default: return 'text-white';
    }
  };

  if (!isWalletConnected) {
    return (
      <Card className="holographic">
        <CardContent className="text-center py-12">
          <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
          <p className="text-muted-foreground">
            Connect your wallet to view your node rewards and earnings
          </p>
        </CardContent>
      </Card>
    );
  }

  if (userNodes.length === 0) {
    return (
      <Card className="holographic">
        <CardContent className="text-center py-12">
          <Coins className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Nodes Yet</h3>
          <p className="text-muted-foreground mb-6">
            Purchase your first node to start earning daily SOL rewards
          </p>
          <Button className="cyber-button">
            Purchase Your First Node
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Earnings Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="holographic">
          <CardContent className="p-6 text-center">
            <Coins className="w-8 h-8 text-neon-green mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-muted-foreground">Total Earned</h3>
            <p className="text-2xl font-bold text-neon-green">{totalEarnings.toFixed(2)} SOL</p>
            <p className="text-xs text-muted-foreground">≈ ${(totalEarnings * 20).toFixed(0)} USD</p>
          </CardContent>
        </Card>

        <Card className="holographic">
          <CardContent className="p-6 text-center">
            <Clock className="w-8 h-8 text-neon-purple mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-muted-foreground">Pending Rewards</h3>
            <p className="text-2xl font-bold text-neon-purple">{pendingRewards.toFixed(2)} SOL</p>
            <p className="text-xs text-muted-foreground">Next payout in 6h 23m</p>
          </CardContent>
        </Card>

        <Card className="holographic">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-muted-foreground">Daily Income</h3>
            <p className="text-2xl font-bold text-neon-cyan">
              {userNodes.reduce((sum, node) => sum + node.dailyReward, 0).toFixed(2)} SOL
            </p>
            <p className="text-xs text-muted-foreground">From {userNodes.length} active nodes</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Nodes */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="text-xl text-neon-cyan">Your Active Nodes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userNodes.map((node) => (
              <Card key={node.id} className="vending-machine">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getNodeIcon(node.type)}</div>
                      <div>
                        <h4 className={`font-semibold capitalize ${getNodeColor(node.type)}`}>
                          {node.type} Node #{node.id}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Purchased: {new Date(node.purchaseDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`mb-2 ${
                        node.status === 'active' ? 'bg-neon-green text-black' : 'bg-gray-500'
                      }`}>
                        {node.status.toUpperCase()}
                      </Badge>
                      <div className="text-sm">
                        <div className="text-neon-green font-mono">
                          {node.dailyReward} SOL/day
                        </div>
                        <div className="text-muted-foreground">
                          Total: {node.totalEarned.toFixed(2)} SOL
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress to next reward */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Next reward in:</span>
                      <span className="text-neon-purple">6h 23m</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="text-xl text-neon-purple">Recent Reward Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: '2024-01-29', amount: 2.0, tx: 'abc123...def456' },
              { date: '2024-01-28', amount: 2.0, tx: 'def456...ghi789' },
              { date: '2024-01-27', amount: 2.0, tx: 'ghi789...jkl012' },
              { date: '2024-01-26', amount: 2.0, tx: 'jkl012...mno345' }
            ].map((payment, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-black/20 rounded">
                <div>
                  <div className="text-sm font-mono text-neon-green">
                    +{payment.amount} SOL
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {payment.date}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-neon-cyan font-mono">
                    {payment.tx}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    View on Solscan
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
