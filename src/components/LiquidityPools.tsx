
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Droplets, 
  TrendingUp, 
  ArrowRightLeft, 
  Plus, 
  Minus, 
  Wallet, 
  CheckCircle,
  Coins,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';

interface LiquidityPool {
  id: string;
  tokenA: string;
  tokenB: string;
  tokenAIcon: string;
  tokenBIcon: string;
  apr: number;
  tvl: number;
  volume24h: number;
  userLiquidity: number;
  userShare: number;
  rewards: number;
  fee: number;
}

interface StakingPool {
  id: string;
  lpToken: string;
  tokenA: string;
  tokenB: string;
  apr: number;
  totalStaked: number;
  userStaked: number;
  rewards: number;
  lockPeriod: number;
}

const initialLiquidityPools: LiquidityPool[] = [
  {
    id: 'usdc-xlm',
    tokenA: 'USDC',
    tokenB: 'XLM',
    tokenAIcon: '💵',
    tokenBIcon: '⭐',
    apr: 24.5,
    tvl: 2500000,
    volume24h: 850000,
    userLiquidity: 0,
    userShare: 0,
    rewards: 0,
    fee: 0.3
  },
  {
    id: 'pyusd-xlm',
    tokenA: 'PYUSD',
    tokenB: 'XLM',
    tokenAIcon: '🟡',
    tokenBIcon: '⭐',
    apr: 28.3,
    tvl: 1800000,
    volume24h: 620000,
    userLiquidity: 0,
    userShare: 0,
    rewards: 0,
    fee: 0.3
  },
  {
    id: 'pyusd-usdc',
    tokenA: 'PYUSD',
    tokenB: 'USDC',
    tokenAIcon: '🟡',
    tokenBIcon: '💵',
    apr: 12.8,
    tvl: 4200000,
    volume24h: 1250000,
    userLiquidity: 0,
    userShare: 0,
    rewards: 0,
    fee: 0.05
  },
  {
    id: 'xlm-cctr',
    tokenA: 'XLM',
    tokenB: 'CCTR',
    tokenAIcon: '⭐',
    tokenBIcon: '🎮',
    apr: 45.2,
    tvl: 950000,
    volume24h: 380000,
    userLiquidity: 0,
    userShare: 0,
    rewards: 0,
    fee: 0.3
  },
  {
    id: 'cctr-usdc',
    tokenA: 'CCTR',
    tokenB: 'USDC',
    tokenAIcon: '🎮',
    tokenBIcon: '💵',
    apr: 38.7,
    tvl: 1200000,
    volume24h: 520000,
    userLiquidity: 0,
    userShare: 0,
    rewards: 0,
    fee: 0.3
  },
  {
    id: 'pyusd-cctr',
    tokenA: 'PYUSD',
    tokenB: 'CCTR',
    tokenAIcon: '🟡',
    tokenBIcon: '🎮',
    apr: 42.1,
    tvl: 780000,
    volume24h: 290000,
    userLiquidity: 0,
    userShare: 0,
    rewards: 0,
    fee: 0.3
  }
];

const initialStakingPools: StakingPool[] = [
  {
    id: 'stake-usdc-xlm',
    lpToken: 'USDC-XLM LP',
    tokenA: 'USDC',
    tokenB: 'XLM',
    apr: 35.5,
    totalStaked: 1800000,
    userStaked: 0,
    rewards: 0,
    lockPeriod: 7
  },
  {
    id: 'stake-pyusd-xlm',
    lpToken: 'PYUSD-XLM LP',
    tokenA: 'PYUSD',
    tokenB: 'XLM',
    apr: 42.1,
    totalStaked: 1200000,
    userStaked: 0,
    rewards: 0,
    lockPeriod: 14
  },
  {
    id: 'stake-xlm-cctr',
    lpToken: 'XLM-CCTR LP',
    tokenA: 'XLM',
    tokenB: 'CCTR',
    apr: 68.5,
    totalStaked: 650000,
    userStaked: 0,
    rewards: 0,
    lockPeriod: 30
  },
  {
    id: 'stake-cctr-usdc',
    lpToken: 'CCTR-USDC LP',
    tokenA: 'CCTR',
    tokenB: 'USDC',
    apr: 55.2,
    totalStaked: 920000,
    userStaked: 0,
    rewards: 0,
    lockPeriod: 14
  },
  {
    id: 'stake-pyusd-cctr',
    lpToken: 'PYUSD-CCTR LP',
    tokenA: 'PYUSD',
    tokenB: 'CCTR',
    apr: 62.8,
    totalStaked: 480000,
    userStaked: 0,
    rewards: 0,
    lockPeriod: 21
  },
  {
    id: 'stake-pyusd-usdc',
    lpToken: 'PYUSD-USDC LP',
    tokenA: 'PYUSD',
    tokenB: 'USDC',
    apr: 18.5,
    totalStaked: 3100000,
    userStaked: 0,
    rewards: 0,
    lockPeriod: 7
  }
];

export const LiquidityPools = () => {
  const [liquidityPools, setLiquidityPools] = useState<LiquidityPool[]>(initialLiquidityPools);
  const [stakingPools, setStakingPools] = useState<StakingPool[]>(initialStakingPools);
  const [selectedPool, setSelectedPool] = useState<string>('usdc-xlm');
  const [selectedStakePool, setSelectedStakePool] = useState<string>('stake-usdc-xlm');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [totalRewards, setTotalRewards] = useState(0);
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected, connectWallet } = useMultiWallet();

  const currentPool = liquidityPools.find(p => p.id === selectedPool);
  const currentStakePool = stakingPools.find(p => p.id === selectedStakePool);

  // Simulate rewards accumulation
  useEffect(() => {
    const interval = setInterval(() => {
      setLiquidityPools(prev => 
        prev.map(pool => {
          if (pool.userLiquidity > 0) {
            const dailyReward = (pool.userLiquidity * pool.apr) / 365 / 100;
            return { ...pool, rewards: pool.rewards + (dailyReward / 24 / 60 / 60) };
          }
          return pool;
        })
      );
      setStakingPools(prev => 
        prev.map(pool => {
          if (pool.userStaked > 0) {
            const dailyReward = (pool.userStaked * pool.apr) / 365 / 100;
            return { ...pool, rewards: pool.rewards + (dailyReward / 24 / 60 / 60) };
          }
          return pool;
        })
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate total rewards
  useEffect(() => {
    const lpRewards = liquidityPools.reduce((sum, pool) => sum + pool.rewards, 0);
    const stakeRewards = stakingPools.reduce((sum, pool) => sum + pool.rewards, 0);
    setTotalRewards(lpRewards + stakeRewards);
  }, [liquidityPools, stakingPools]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  const handleAddLiquidity = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to add liquidity",
        variant: "destructive"
      });
      return;
    }

    if (!amountA || !amountB || parseFloat(amountA) <= 0 || parseFloat(amountB) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter valid amounts for both tokens",
        variant: "destructive"
      });
      return;
    }

    setIsAdding(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const liquidityValue = parseFloat(amountA) + parseFloat(amountB);
      
      setLiquidityPools(prev => 
        prev.map(pool => 
          pool.id === selectedPool
            ? { 
                ...pool, 
                userLiquidity: pool.userLiquidity + liquidityValue,
                userShare: ((pool.userLiquidity + liquidityValue) / (pool.tvl + liquidityValue)) * 100,
                tvl: pool.tvl + liquidityValue
              }
            : pool
        )
      );

      setAmountA('');
      setAmountB('');

      toast({
        title: "Liquidity Added! 💧",
        description: `Successfully added liquidity to ${currentPool?.tokenA}/${currentPool?.tokenB} pool`,
      });
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to add liquidity",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveLiquidity = async () => {
    if (!currentPool || currentPool.userLiquidity <= 0) {
      toast({
        title: "No Liquidity",
        description: "You don't have any liquidity in this pool",
        variant: "destructive"
      });
      return;
    }

    setIsRemoving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setLiquidityPools(prev => 
        prev.map(pool => 
          pool.id === selectedPool
            ? { 
                ...pool, 
                tvl: pool.tvl - pool.userLiquidity,
                userLiquidity: 0,
                userShare: 0,
                rewards: 0
              }
            : pool
        )
      );

      toast({
        title: "Liquidity Removed! 💰",
        description: `Successfully removed liquidity from ${currentPool?.tokenA}/${currentPool?.tokenB} pool`,
      });
    } catch (error) {
      toast({
        title: "Transaction Failed",
        description: "Failed to remove liquidity",
        variant: "destructive"
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const handleStakeLP = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to stake LP tokens",
        variant: "destructive"
      });
      return;
    }

    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid stake amount",
        variant: "destructive"
      });
      return;
    }

    setIsStaking(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const amount = parseFloat(stakeAmount);
      
      setStakingPools(prev => 
        prev.map(pool => 
          pool.id === selectedStakePool
            ? { 
                ...pool, 
                userStaked: pool.userStaked + amount,
                totalStaked: pool.totalStaked + amount
              }
            : pool
        )
      );

      setStakeAmount('');

      toast({
        title: "LP Tokens Staked! 🔒",
        description: `Successfully staked ${amount} LP tokens`,
      });
    } catch (error) {
      toast({
        title: "Staking Failed",
        description: "Failed to stake LP tokens",
        variant: "destructive"
      });
    } finally {
      setIsStaking(false);
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLiquidityPools(prev => prev.map(pool => ({ ...pool, rewards: 0 })));
      setStakingPools(prev => prev.map(pool => ({ ...pool, rewards: 0 })));

      toast({
        title: "Rewards Claimed! 🎉",
        description: `Successfully claimed ${totalRewards.toFixed(4)} CCTR in rewards`,
      });
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: "Failed to claim rewards",
        variant: "destructive"
      });
    }
  };

  const handleConnectWallet = async () => {
    try {
      if (window.freighter) {
        await connectWallet('freighter', '');
      } else {
        toast({
          title: "Wallet Not Found",
          description: "Please install Freighter wallet for Stellar",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle className="font-display text-3xl text-neon-cyan flex items-center gap-3">
            <Droplets className="w-8 h-8" />
            LIQUIDITY POOLS
            <Badge className="bg-neon-green text-black">STELLAR DEFI</Badge>
          </CardTitle>
          
          {!isWalletConnected ? (
            <Button onClick={handleConnectWallet} className="cyber-button">
              <Wallet className="h-4 w-4 mr-2" />
              CONNECT WALLET
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Badge className="bg-neon-green text-black flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                CONNECTED
              </Badge>
              <span className="text-xs text-neon-cyan">
                {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
              </span>
            </div>
          )}
        </div>
        <p className="text-muted-foreground">
          Provide liquidity and stake LP tokens to earn rewards on Stellar
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="holographic p-4 text-center">
            <Droplets className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
            <h4 className="text-neon-cyan font-bold text-xs">TOTAL TVL</h4>
            <p className="text-lg font-mono">
              {formatNumber(liquidityPools.reduce((sum, p) => sum + p.tvl, 0))}
            </p>
          </div>
          <div className="holographic p-4 text-center">
            <ArrowRightLeft className="w-6 h-6 text-neon-purple mx-auto mb-2" />
            <h4 className="text-neon-purple font-bold text-xs">24H VOLUME</h4>
            <p className="text-lg font-mono">
              {formatNumber(liquidityPools.reduce((sum, p) => sum + p.volume24h, 0))}
            </p>
          </div>
          <div className="holographic p-4 text-center">
            <Coins className="w-6 h-6 text-neon-green mx-auto mb-2" />
            <h4 className="text-neon-green font-bold text-xs">YOUR LIQUIDITY</h4>
            <p className="text-lg font-mono">
              {formatNumber(liquidityPools.reduce((sum, p) => sum + p.userLiquidity, 0))}
            </p>
          </div>
          <div className="holographic p-4 text-center">
            <Zap className="w-6 h-6 text-neon-pink mx-auto mb-2" />
            <h4 className="text-neon-pink font-bold text-xs">PENDING REWARDS</h4>
            <p className="text-lg font-mono">{totalRewards.toFixed(4)} CCTR</p>
            <Button 
              onClick={handleClaimRewards}
              disabled={totalRewards <= 0}
              size="sm"
              className="cyber-button mt-2 text-xs"
            >
              CLAIM ALL
            </Button>
          </div>
        </div>

        <Tabs defaultValue="liquidity" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="liquidity">Liquidity Pools</TabsTrigger>
            <TabsTrigger value="staking">LP Staking</TabsTrigger>
          </TabsList>

          {/* Liquidity Pools Tab */}
          <TabsContent value="liquidity" className="space-y-6">
            {/* Pool Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liquidityPools.map((pool) => (
                <div
                  key={pool.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPool === pool.id 
                      ? 'border-neon-cyan bg-neon-cyan/10' 
                      : 'border-neon-purple/30 hover:border-neon-purple hover:bg-neon-purple/5'
                  }`}
                  onClick={() => setSelectedPool(pool.id)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{pool.tokenAIcon}</span>
                      <span className="text-2xl">{pool.tokenBIcon}</span>
                      <span className="font-bold text-sm">{pool.tokenA}/{pool.tokenB}</span>
                    </div>
                    <Badge className="bg-neon-green text-black text-xs">
                      {pool.apr}% APR
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">TVL:</span>
                      <span className="text-neon-cyan">{formatNumber(pool.tvl)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">24h Volume:</span>
                      <span className="text-neon-purple">{formatNumber(pool.volume24h)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee:</span>
                      <span className="text-neon-yellow">{pool.fee}%</span>
                    </div>
                    {pool.userLiquidity > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Your LP:</span>
                        <span className="text-neon-green">{formatNumber(pool.userLiquidity)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Add/Remove Liquidity */}
            {currentPool && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Liquidity */}
                <div className="space-y-4 p-4 rounded-lg border border-neon-green/30 bg-neon-green/5">
                  <h3 className="font-bold text-neon-green flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    ADD LIQUIDITY
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground">{currentPool.tokenA} Amount</label>
                      <Input
                        type="number"
                        placeholder={`Enter ${currentPool.tokenA} amount`}
                        value={amountA}
                        onChange={(e) => setAmountA(e.target.value)}
                        className="bg-black border-neon-green/50 text-neon-green mt-1"
                        disabled={isAdding || !isWalletConnected}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">{currentPool.tokenB} Amount</label>
                      <Input
                        type="number"
                        placeholder={`Enter ${currentPool.tokenB} amount`}
                        value={amountB}
                        onChange={(e) => setAmountB(e.target.value)}
                        className="bg-black border-neon-green/50 text-neon-green mt-1"
                        disabled={isAdding || !isWalletConnected}
                      />
                    </div>
                    <Button
                      onClick={handleAddLiquidity}
                      disabled={!amountA || !amountB || isAdding || !isWalletConnected}
                      className="cyber-button w-full"
                    >
                      {isAdding ? '⏳ ADDING...' : '💧 ADD LIQUIDITY'}
                    </Button>
                  </div>
                </div>

                {/* Remove Liquidity */}
                <div className="space-y-4 p-4 rounded-lg border border-neon-pink/30 bg-neon-pink/5">
                  <h3 className="font-bold text-neon-pink flex items-center gap-2">
                    <Minus className="h-4 w-4" />
                    REMOVE LIQUIDITY
                  </h3>
                  <div className="space-y-3">
                    <div className="text-center p-4 rounded border border-neon-pink/30">
                      <p className="text-xs text-muted-foreground mb-1">Your Liquidity</p>
                      <p className="text-2xl font-bold text-neon-pink">
                        {formatNumber(currentPool.userLiquidity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentPool.userShare.toFixed(4)}% pool share
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground mb-1">Pending Rewards</p>
                      <p className="text-lg font-bold text-neon-green">
                        {currentPool.rewards.toFixed(6)} CCTR
                      </p>
                    </div>
                    <Button
                      onClick={handleRemoveLiquidity}
                      disabled={currentPool.userLiquidity <= 0 || isRemoving || !isWalletConnected}
                      className="cyber-button w-full bg-neon-pink hover:bg-neon-pink/80"
                    >
                      {isRemoving ? '⏳ REMOVING...' : '💰 REMOVE ALL'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* LP Staking Tab */}
          <TabsContent value="staking" className="space-y-6">
            {/* Staking Pools */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stakingPools.map((pool) => (
                <div
                  key={pool.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedStakePool === pool.id 
                      ? 'border-neon-purple bg-neon-purple/10' 
                      : 'border-neon-cyan/30 hover:border-neon-cyan hover:bg-neon-cyan/5'
                  }`}
                  onClick={() => setSelectedStakePool(pool.id)}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-bold text-sm">{pool.lpToken}</span>
                    <Badge className="bg-neon-purple text-white text-xs">
                      {pool.apr}% APR
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Staked:</span>
                      <span className="text-neon-cyan">{formatNumber(pool.totalStaked)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lock Period:</span>
                      <span className="text-neon-yellow">{pool.lockPeriod} days</span>
                    </div>
                    {pool.userStaked > 0 && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Your Stake:</span>
                          <span className="text-neon-green">{formatNumber(pool.userStaked)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Rewards:</span>
                          <span className="text-neon-pink">{pool.rewards.toFixed(6)} CCTR</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Stake LP Tokens */}
            {currentStakePool && (
              <div className="max-w-md mx-auto space-y-4 p-4 rounded-lg border border-neon-purple/30 bg-neon-purple/5">
                <h3 className="font-bold text-neon-purple text-center">
                  STAKE {currentStakePool.lpToken}
                </h3>
                <div className="text-center text-sm text-muted-foreground">
                  Lock for {currentStakePool.lockPeriod} days to earn {currentStakePool.apr}% APR
                </div>
                <div className="space-y-3">
                  <Input
                    type="number"
                    placeholder="LP tokens to stake"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="bg-black border-neon-purple/50 text-neon-purple"
                    disabled={isStaking || !isWalletConnected}
                  />
                  <Button
                    onClick={handleStakeLP}
                    disabled={!stakeAmount || parseFloat(stakeAmount) <= 0 || isStaking || !isWalletConnected}
                    className="cyber-button w-full bg-neon-purple hover:bg-neon-purple/80"
                  >
                    {isStaking ? '⏳ STAKING...' : '🔒 STAKE LP TOKENS'}
                  </Button>
                  {currentStakePool.userStaked > 0 && (
                    <div className="text-center p-3 rounded border border-neon-green/30">
                      <p className="text-xs text-muted-foreground">Your Staked LP</p>
                      <p className="text-xl font-bold text-neon-green">
                        {formatNumber(currentStakePool.userStaked)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Disclaimer */}
        <div className="text-center text-xs text-muted-foreground p-3 rounded border border-muted/30">
          ⚠️ Providing liquidity involves risk. Impermanent loss may occur. DYOR before participating.
        </div>
      </CardContent>
    </Card>
  );
};
