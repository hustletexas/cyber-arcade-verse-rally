
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Clock, Gift } from 'lucide-react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';

interface NodeReward {
  id: string;
  nodeType: string;
  amount: number;
  date: string;
  claimed: boolean;
  txHash?: string;
}

export const NodeRewards = () => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<NodeReward[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [pendingRewards, setPendingRewards] = useState(0);

  // Mock data - replace with actual blockchain data
  useEffect(() => {
    if (isWalletConnected) {
      const mockRewards: NodeReward[] = [
        {
          id: '1',
          nodeType: 'Basic',
          amount: 0.05,
          date: new Date().toISOString().split('T')[0],
          claimed: false
        },
        {
          id: '2',
          nodeType: 'Premium',
          amount: 0.15,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          claimed: true,
          txHash: '3x7f8a9b2c1d4e5f6789abc123def456'
        },
        {
          id: '3',
          nodeType: 'Legendary',
          amount: 0.35,
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
          claimed: true,
          txHash: '8x9e1f2a3b4c5d6789abc123def456789'
        }
      ];
      
      setRewards(mockRewards);
      const total = mockRewards.filter(r => r.claimed).reduce((sum, r) => sum + r.amount, 0);
      const pending = mockRewards.filter(r => !r.claimed).reduce((sum, r) => sum + r.amount, 0);
      setTotalEarned(total);
      setPendingRewards(pending);
    }
  }, [isWalletConnected]);

  const claimReward = async (rewardId: string) => {
    try {
      // Simulate claiming reward
      toast({
        title: "Claiming Reward...",
        description: "Processing your reward claim on Solana blockchain",
      });

      // Mock delay
      setTimeout(() => {
        setRewards(prev => prev.map(r => 
          r.id === rewardId 
            ? { ...r, claimed: true, txHash: `tx_${Date.now()}` }
            : r
        ));
        
        const reward = rewards.find(r => r.id === rewardId);
        if (reward) {
          setTotalEarned(prev => prev + reward.amount);
          setPendingRewards(prev => prev - reward.amount);
        }

        toast({
          title: "Reward Claimed! 🎉",
          description: `Successfully claimed ${reward?.amount} SOL`,
        });
      }, 2000);
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Failed to claim reward. Please try again.",
        variant: "destructive",
      });
    }
  };

  const claimAllRewards = async () => {
    const unclaimedRewards = rewards.filter(r => !r.claimed);
    if (unclaimedRewards.length === 0) return;

    try {
      toast({
        title: "Claiming All Rewards...",
        description: `Processing ${unclaimedRewards.length} reward claims`,
      });

      // Mock delay
      setTimeout(() => {
        setRewards(prev => prev.map(r => 
          !r.claimed 
            ? { ...r, claimed: true, txHash: `batch_tx_${Date.now()}` }
            : r
        ));
        
        setTotalEarned(prev => prev + pendingRewards);
        setPendingRewards(0);

        toast({
          title: "All Rewards Claimed! 🎉",
          description: `Successfully claimed ${pendingRewards.toFixed(4)} SOL total`,
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Batch Claim Failed",
        description: "Failed to claim all rewards. Please try again.",
        variant: "destructive",
      });
    }
  };

  const nodeStats = {
    basic: { count: 2, dailyReward: 0.05 },
    premium: { count: 1, dailyReward: 0.15 },
    legendary: { count: 1, dailyReward: 0.35 }
  };

  if (!isWalletConnected) {
    return (
      <Card className="bg-gray-900/60 border-neon-cyan/30">
        <CardContent className="p-6 text-center">
          <Coins className="h-12 w-12 text-neon-cyan mx-auto mb-4" />
          <p className="text-gray-300">Connect your wallet to view node rewards</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rewards Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/60 border-neon-cyan/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-neon-cyan">
              <TrendingUp className="h-5 w-5" />
              Total Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalEarned.toFixed(4)} SOL
            </div>
            <p className="text-sm text-gray-400">≈ ${(totalEarned * 140).toFixed(2)} USD</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 border-neon-purple/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-neon-purple">
              <Clock className="h-5 w-5" />
              Pending Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {pendingRewards.toFixed(4)} SOL
            </div>
            <p className="text-sm text-gray-400">≈ ${(pendingRewards * 140).toFixed(2)} USD</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/60 border-neon-green/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-neon-green">
              <Gift className="h-5 w-5" />
              Daily Potential
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {(nodeStats.basic.count * nodeStats.basic.dailyReward + 
                nodeStats.premium.count * nodeStats.premium.dailyReward + 
                nodeStats.legendary.count * nodeStats.legendary.dailyReward).toFixed(4)} SOL
            </div>
            <p className="text-sm text-gray-400">From all nodes</p>
          </CardContent>
        </Card>
      </div>

      {/* Claim Actions */}
      {pendingRewards > 0 && (
        <div className="flex justify-center">
          <Button 
            onClick={claimAllRewards}
            className="cyber-button px-8 py-3 text-lg"
          >
            <Coins className="mr-2 h-5 w-5" />
            Claim All Rewards ({pendingRewards.toFixed(4)} SOL)
          </Button>
        </div>
      )}

      {/* Rewards History */}
      <Card className="bg-gray-900/60 border-gray-700">
        <CardHeader>
          <CardTitle className="text-neon-cyan">Rewards History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="flex items-center justify-between p-4 bg-gray-800/60 rounded-lg border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    reward.claimed ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <div>
                    <p className="font-medium text-white">
                      {reward.nodeType} Node Reward
                    </p>
                    <p className="text-sm text-gray-400">{reward.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-bold text-neon-cyan">
                      +{reward.amount} SOL
                    </p>
                    <p className="text-xs text-gray-400">
                      ≈ ${(reward.amount * 140).toFixed(2)}
                    </p>
                  </div>
                  
                  {reward.claimed ? (
                    <Badge variant="secondary" className="bg-green-900/40 text-green-300 border-green-700">
                      Claimed
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => claimReward(reward.id)}
                      className="bg-neon-purple hover:bg-neon-purple/80 text-white"
                    >
                      Claim
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {rewards.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No rewards history yet. Purchase a node to start earning!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
