
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TriviaRewardsProps {
  onBackToMenu: () => void;
}

export const TriviaRewards = ({ onBackToMenu }: TriviaRewardsProps) => {
  const { user } = useAuth();
  const { balance, refetch } = useUserBalance();
  const { toast } = useToast();
  const [rewardHistory, setRewardHistory] = useState<any[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRewardHistory();
    }
  }, [user]);

  const fetchRewardHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch trivia-related transactions
      const { data: transactions, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'trivia_reward')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRewardHistory(transactions || []);
      const total = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0;
      setTotalEarnings(total);
    } catch (error) {
      console.error('Error fetching reward history:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimWeeklyBonus = async () => {
    if (!user) return;

    try {
      // Check if user has already claimed weekly bonus
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data: recentClaim, error: claimError } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'weekly_trivia_bonus')
        .gte('created_at', oneWeekAgo.toISOString())
        .maybeSingle();

      if (claimError && claimError.code !== 'PGRST116') throw claimError;

      if (recentClaim) {
        toast({
          title: "Already Claimed",
          description: "You've already claimed your weekly bonus",
          variant: "destructive",
        });
        return;
      }

      // Award weekly bonus (100 CCTR)
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: 100,
          transaction_type: 'weekly_trivia_bonus',
          description: 'Weekly trivia participation bonus'
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Bonus Claimed! 🎉",
        description: "You received 100 CCTR weekly bonus!",
      });

      fetchRewardHistory();
      refetch();
    } catch (error) {
      console.error('Error claiming bonus:', error);
      toast({
        title: "Claim Failed",
        description: "Failed to claim weekly bonus",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="font-display text-2xl text-neon-cyan">
              💰 TRIVIA REWARDS
            </CardTitle>
            <Button onClick={onBackToMenu} variant="outline">
              ← Back to Menu
            </Button>
          </div>
          <p className="text-muted-foreground">
            Your earnings and rewards from trivia games
          </p>
        </CardHeader>
      </Card>

      {/* Current Balance & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="holographic p-6 text-center">
          <div className="text-4xl mb-2">💎</div>
          <h3 className="font-bold text-neon-cyan mb-2">Current Balance</h3>
          <div className="text-3xl font-bold text-neon-green">
            {balance?.cctr_balance || 0} CCTR
          </div>
          <p className="text-xs text-muted-foreground mt-1">Available tokens</p>
        </Card>

        <Card className="holographic p-6 text-center">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="font-bold text-neon-purple mb-2">Total Earned</h3>
          <div className="text-3xl font-bold text-neon-pink">
            {totalEarnings} CCTR
          </div>
          <p className="text-xs text-muted-foreground mt-1">From trivia games</p>
        </Card>

        <Card className="holographic p-6 text-center">
          <div className="text-4xl mb-2">🎮</div>
          <h3 className="font-bold text-neon-cyan mb-2">Weekly Bonus</h3>
          <Button 
            onClick={claimWeeklyBonus}
            className="cyber-button w-full"
            disabled={!user}
          >
            Claim 100 CCTR
          </Button>
          <p className="text-xs text-muted-foreground mt-1">Play to unlock</p>
        </Card>
      </div>

      {/* Reward Structure */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            📊 REWARD STRUCTURE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-bold text-neon-cyan">Per Question Rewards:</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded bg-gray-800/30">
                  <span className="text-neon-green">Easy Questions</span>
                  <Badge className="bg-neon-green text-black">100 CCTR</Badge>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-gray-800/30">
                  <span className="text-neon-cyan">Medium Questions</span>
                  <Badge className="bg-neon-cyan text-black">200 CCTR</Badge>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-gray-800/30">
                  <span className="text-neon-pink">Hard Questions</span>
                  <Badge className="bg-neon-pink text-white">300 CCTR</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-neon-cyan">Speed Bonuses:</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded bg-gray-800/30">
                  <span className="text-neon-green">≤ 10 seconds</span>
                  <Badge className="bg-neon-green text-black">1.5x Points</Badge>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-gray-800/30">
                  <span className="text-neon-cyan">≤ 20 seconds</span>
                  <Badge className="bg-neon-cyan text-black">1.2x Points</Badge>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-gray-800/30">
                  <span className="text-muted-foreground">&gt; 20 seconds</span>
                  <Badge variant="outline">Base Points</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Rewards Preview */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-purple">
            🎨 EXCLUSIVE NFT REWARDS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="holographic p-4 text-center">
              <div className="text-6xl mb-3">🏆</div>
              <h3 className="font-bold text-yellow-400 mb-2">Legendary</h3>
              <p className="text-sm text-muted-foreground">
                Weekly #1 ranking across all categories
              </p>
              <Badge className="mt-2 bg-yellow-400 text-black">
                Ultra Rare
              </Badge>
            </Card>

            <Card className="holographic p-4 text-center">
              <div className="text-6xl mb-3">💎</div>
              <h3 className="font-bold text-purple-400 mb-2">Epic</h3>
              <p className="text-sm text-muted-foreground">
                Top 10 in any category weekly
              </p>
              <Badge className="mt-2 bg-purple-400 text-white">
                Rare
              </Badge>
            </Card>

            <Card className="holographic p-4 text-center">
              <div className="text-6xl mb-3">🎮</div>
              <h3 className="font-bold text-blue-400 mb-2">Common</h3>
              <p className="text-sm text-muted-foreground">
                Perfect score achievement
              </p>
              <Badge className="mt-2 bg-blue-400 text-white">
                Common
              </Badge>
            </Card>
          </div>

          <div className="text-center mt-6 p-4 bg-gray-800/30 rounded">
            <p className="text-sm text-muted-foreground">
              🔒 NFTs are automatically distributed via Solana smart contracts every Sunday
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            📜 RECENT EARNINGS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-4">🔄</div>
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : rewardHistory.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-neon-cyan mb-2">No Earnings Yet</h3>
              <p className="text-muted-foreground">Start playing trivia to earn CCTR tokens!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rewardHistory.slice(0, 10).map((transaction) => (
                <Card key={transaction.id} className="holographic p-4">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="font-medium text-neon-cyan">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-neon-green">
                        +{transaction.amount} CCTR
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
