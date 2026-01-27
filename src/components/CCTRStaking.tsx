import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Coins, TrendingUp, Clock, Zap, Lock, Unlock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { WalletStatusBar } from '@/components/WalletStatusBar';

interface StakingPool {
  id: string;
  name: string;
  apy: number;
  lockPeriod: number; // in days
  minStake: number;
  totalStaked: number;
  userStaked: number;
  rewards: number;
  isActive: boolean;
}

const stakingPools: StakingPool[] = [
  {
    id: 'pool-1',
    name: '30-Day Pool',
    apy: 12.5,
    lockPeriod: 30,
    minStake: 100,
    totalStaked: 2500000,
    userStaked: 0,
    rewards: 0,
    isActive: true
  },
  {
    id: 'pool-2',
    name: '90-Day Pool',
    apy: 18.7,
    lockPeriod: 90,
    minStake: 500,
    totalStaked: 1800000,
    userStaked: 0,
    rewards: 0,
    isActive: true
  },
  {
    id: 'pool-3',
    name: '365-Day Pool',
    apy: 25.3,
    lockPeriod: 365,
    minStake: 1000,
    totalStaked: 3200000,
    userStaked: 0,
    rewards: 0,
    isActive: true
  }
];

export const CCTRStaking = () => {
  const [pools, setPools] = useState<StakingPool[]>(stakingPools);
  const [selectedPool, setSelectedPool] = useState<string>('pool-1');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [userBalance, setUserBalance] = useState(5000); // Mock CCTR balance
  const [totalRewards, setTotalRewards] = useState(0);
  const { toast } = useToast();
  const { isWalletConnected } = useMultiWallet();

  const currentPool = pools.find(p => p.id === selectedPool);

  // Simulate rewards accumulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPools(prevPools => 
        prevPools.map(pool => {
          if (pool.userStaked > 0) {
            const dailyReward = (pool.userStaked * pool.apy) / 365 / 100;
            const newReward = pool.rewards + (dailyReward / 24 / 60 / 60); // Per second for demo
            return { ...pool, rewards: newReward };
          }
          return pool;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate total rewards
  useEffect(() => {
    const total = pools.reduce((sum, pool) => sum + pool.rewards, 0);
    setTotalRewards(total);
  }, [pools]);

  const handleStake = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Stellar wallet to stake CCTR tokens",
        variant: "destructive"
      });
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid staking amount",
        variant: "destructive"
      });
      return;
    }

    if (parseFloat(stakeAmount) > userBalance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough CCTR tokens to stake",
        variant: "destructive"
      });
      return;
    }

    if (currentPool && parseFloat(stakeAmount) < currentPool.minStake) {
      toast({
        title: "Minimum Stake Required",
        description: `Minimum stake for this pool is ${currentPool.minStake} CCTR`,
        variant: "destructive"
      });
      return;
    }

    setIsStaking(true);

    try {
      // Simulate staking transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const amount = parseFloat(stakeAmount);
      
      setPools(prevPools => 
        prevPools.map(pool => 
          pool.id === selectedPool 
            ? { ...pool, userStaked: pool.userStaked + amount, totalStaked: pool.totalStaked + amount }
            : pool
        )
      );

      setUserBalance(prev => prev - amount);
      setStakeAmount('');

      toast({
        title: "Staking Successful! 🎉",
        description: `Successfully staked ${amount} CCTR tokens`,
      });

    } catch (error) {
      console.error('Staking error:', error);
      toast({
        title: "Staking Failed",
        description: "An error occurred while staking your tokens",
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid unstaking amount",
        variant: "destructive"
      });
      return;
    }

    if (currentPool && parseFloat(unstakeAmount) > currentPool.userStaked) {
      toast({
        title: "Insufficient Staked Amount",
        description: "You don't have enough staked tokens to unstake",
        variant: "destructive"
      });
      return;
    }

    setIsUnstaking(true);

    try {
      // Simulate unstaking transaction
      await new Promise(resolve => setTimeout(resolve, 2000));

      const amount = parseFloat(unstakeAmount);
      
      setPools(prevPools => 
        prevPools.map(pool => 
          pool.id === selectedPool 
            ? { ...pool, userStaked: pool.userStaked - amount, totalStaked: pool.totalStaked - amount }
            : pool
        )
      );

      setUserBalance(prev => prev + amount);
      setUnstakeAmount('');

      toast({
        title: "Unstaking Successful! 🎉",
        description: `Successfully unstaked ${amount} CCTR tokens`,
      });

    } catch (error) {
      console.error('Unstaking error:', error);
      toast({
        title: "Unstaking Failed",
        description: "An error occurred while unstaking your tokens",
        variant: "destructive"
      });
    } finally {
      setIsUnstaking(false);
    }
  };

  const handleClaimRewards = async () => {
    if (totalRewards <= 0) {
      toast({
        title: "No Rewards",
        description: "You don't have any rewards to claim",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate claiming rewards
      await new Promise(resolve => setTimeout(resolve, 1500));

      setPools(prevPools => 
        prevPools.map(pool => ({ ...pool, rewards: 0 }))
      );

      setUserBalance(prev => prev + totalRewards);

      toast({
        title: "Rewards Claimed! 🎉",
        description: `Successfully claimed ${totalRewards.toFixed(6)} CCTR tokens`,
      });

    } catch (error) {
      console.error('Claim rewards error:', error);
      toast({
        title: "Claim Failed",
        description: "An error occurred while claiming rewards",
        variant: "destructive"
      });
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(2);
  };

  return (
    <Card className="holographic p-6 mt-6">
      <CardHeader className="pb-4">
        <CardTitle className="font-display text-xl text-neon-green flex items-center gap-3">
          <Coins className="h-5 w-5" />
          CCTR STAKING POOLS
          <Badge className="bg-neon-cyan text-black text-xs">LIVE REWARDS</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Wallet Connection Status */}
        <WalletStatusBar />
      
        {/* User Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5">
            <div className="text-xs text-muted-foreground">Balance</div>
            <div className="font-bold text-neon-cyan">{formatNumber(userBalance)} CCTR</div>
          </div>
          <div className="text-center p-3 rounded-lg border border-neon-purple/30 bg-neon-purple/5">
            <div className="text-xs text-muted-foreground">Total Staked</div>
            <div className="font-bold text-neon-purple">
              {formatNumber(pools.reduce((sum, pool) => sum + pool.userStaked, 0))} CCTR
            </div>
          </div>
          <div className="text-center p-3 rounded-lg border border-neon-green/30 bg-neon-green/5">
            <div className="text-xs text-muted-foreground">Pending Rewards</div>
            <div className="font-bold text-neon-green">{totalRewards.toFixed(6)} CCTR</div>
          </div>
          <div className="text-center p-3 rounded-lg border border-neon-yellow/30 bg-neon-yellow/5">
            <Button 
              onClick={handleClaimRewards}
              disabled={totalRewards <= 0 || !isWalletConnected}
              className="cyber-button w-full h-8 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              CLAIM
            </Button>
          </div>
        </div>

        {/* Pool Selection */}
        <div className="space-y-4">
          <h3 className="font-bold text-neon-pink text-sm">SELECT STAKING POOL</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pools.map((pool) => (
              <div
                key={pool.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selectedPool === pool.id 
                    ? 'border-neon-cyan bg-neon-cyan/10' 
                    : 'border-neon-purple/30 hover:border-neon-purple hover:bg-neon-purple/5'
                }`}
                onClick={() => setSelectedPool(pool.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-neon-cyan text-sm">{pool.name}</h4>
                  <Badge className="bg-neon-green text-black text-xs">
                    {pool.apy}% APY
                  </Badge>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lock Period:</span>
                    <span className="text-neon-purple">{pool.lockPeriod} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min Stake:</span>
                    <span className="text-neon-yellow">{pool.minStake} CCTR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Your Stake:</span>
                    <span className="text-neon-green">{formatNumber(pool.userStaked)} CCTR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Staked:</span>
                    <span className="text-neon-cyan">{formatNumber(pool.totalStaked)} CCTR</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staking Interface */}
        {currentPool && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stake Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-neon-green text-sm flex items-center gap-2">
                <Lock className="h-4 w-4" />
                STAKE CCTR
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span>Available: {formatNumber(userBalance)} CCTR</span>
                  <span>Min: {currentPool.minStake} CCTR</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="bg-black border-neon-green/50 text-neon-green"
                    disabled={isStaking || !isWalletConnected}
                  />
                  <Button
                    onClick={() => setStakeAmount(userBalance.toString())}
                    size="sm"
                    className="cyber-button text-xs"
                    disabled={isStaking || !isWalletConnected}
                  >
                    MAX
                  </Button>
                </div>
                <Button
                  onClick={handleStake}
                  disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isStaking || !isWalletConnected}
                  className="cyber-button w-full"
                >
                  {!isWalletConnected ? '🔗 CONNECT WALLET' : isStaking ? '⏳ STAKING...' : '🔒 STAKE CCTR'}
                </Button>
              </div>
            </div>

            {/* Unstake Section */}
            <div className="space-y-4">
              <h3 className="font-bold text-neon-pink text-sm flex items-center gap-2">
                <Unlock className="h-4 w-4" />
                UNSTAKE CCTR
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span>Staked: {formatNumber(currentPool.userStaked)} CCTR</span>
                  <span>Lock: {currentPool.lockPeriod} days</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount to unstake"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    className="bg-black border-neon-pink/50 text-neon-pink"
                    disabled={isUnstaking || !isWalletConnected}
                  />
                  <Button
                    onClick={() => setUnstakeAmount(currentPool.userStaked.toString())}
                    size="sm"
                    className="cyber-button text-xs"
                    disabled={isUnstaking || currentPool.userStaked <= 0 || !isWalletConnected}
                  >
                    MAX
                  </Button>
                </div>
                <Button
                  onClick={handleUnstake}
                  disabled={!unstakeAmount || parseFloat(unstakeAmount) <= 0 || isUnstaking || currentPool.userStaked <= 0 || !isWalletConnected}
                  className="cyber-button w-full"
                >
                  {!isWalletConnected ? '🔗 CONNECT WALLET' : isUnstaking ? '⏳ UNSTAKING...' : '🔓 UNSTAKE CCTR'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Pool Statistics */}
        <div className="mt-6 p-4 rounded-lg border border-neon-cyan/30 bg-neon-cyan/5">
          <h3 className="font-bold text-neon-cyan text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            POOL STATISTICS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <div className="text-muted-foreground">Total Value Locked</div>
              <div className="font-bold text-neon-cyan">
                ${formatNumber(pools.reduce((sum, pool) => sum + pool.totalStaked * 0.052, 0))}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Daily Rewards</div>
              <div className="font-bold text-neon-green">
                {formatNumber(pools.reduce((sum, pool) => sum + (pool.totalStaked * pool.apy / 365 / 100), 0))} CCTR
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Active Stakers</div>
              <div className="font-bold text-neon-purple">2,847</div>
            </div>
            <div>
              <div className="text-muted-foreground">Network Status</div>
              <div className="font-bold text-neon-green">HEALTHY</div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-muted-foreground text-center p-3 rounded-lg border border-neon-yellow/30 bg-neon-yellow/5">
          <Clock className="h-4 w-4 inline mr-1" />
          Staking rewards are calculated dynamically. Lock periods apply to unstaking. 
          Always ensure you understand the risks before staking.
        </div>
      </CardContent>
    </Card>
  );
};
