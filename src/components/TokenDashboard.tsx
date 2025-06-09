
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const TokenDashboard = () => {
  const tokenData = {
    balance: 15420,
    claimableRewards: 850,
    tokenPrice: 0.045,
    marketCap: '2.3M',
    totalSupply: '100M'
  };

  const claimRewards = () => {
    console.log('Claiming rewards...');
  };

  const adminAirdrop = () => {
    console.log('Admin airdrop initiated...');
  };

  return (
    <div className="space-y-6">
      {/* Token Overview */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-green flex items-center gap-3">
            💰 $CCTR TOKEN DASHBOARD
            <Badge className="bg-neon-cyan text-black animate-neon-flicker">LIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance Card */}
            <Card className="holographic p-6 text-center">
              <h3 className="font-display text-lg text-neon-cyan mb-2">YOUR BALANCE</h3>
              <div className="text-4xl font-black text-neon-green mb-2">
                {tokenData.balance.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">$CCTR Tokens</p>
              <div className="mt-4 text-lg text-neon-purple">
                ≈ ${(tokenData.balance * tokenData.tokenPrice).toFixed(2)} USD
              </div>
            </Card>

            {/* Claimable Rewards */}
            <Card className="holographic p-6 text-center">
              <h3 className="font-display text-lg text-neon-pink mb-2">CLAIMABLE REWARDS</h3>
              <div className="text-4xl font-black text-neon-cyan mb-2">
                {tokenData.claimableRewards.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">$CCTR Available</p>
              <Button 
                onClick={claimRewards}
                className="mt-4 cyber-button w-full"
              >
                🏆 CLAIM REWARDS
              </Button>
            </Card>

            {/* Token Price */}
            <Card className="holographic p-6 text-center">
              <h3 className="font-display text-lg text-neon-purple mb-2">TOKEN PRICE</h3>
              <div className="text-4xl font-black text-neon-green mb-2">
                ${tokenData.tokenPrice}
              </div>
              <p className="text-sm text-muted-foreground">Per $CCTR</p>
              <Badge className="mt-4 bg-neon-green text-black">
                📈 +12.5% 24h
              </Badge>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Token Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="vending-machine p-6">
          <h3 className="font-display text-xl text-neon-cyan mb-4">📊 TOKEN ANALYTICS</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Market Cap:</span>
              <span className="text-neon-green font-bold">${tokenData.marketCap}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Total Supply:</span>
              <span className="text-neon-purple font-bold">{tokenData.totalSupply} $CCTR</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Circulating Supply:</span>
              <span className="text-neon-cyan font-bold">45M $CCTR</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Holders:</span>
              <span className="text-neon-pink font-bold">12,847</span>
            </div>
          </div>
        </Card>

        <Card className="vending-machine p-6">
          <h3 className="font-display text-xl text-neon-pink mb-4">🎮 EARN $CCTR</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-neon-green">🏆</span>
                <span>Tournament Wins</span>
                <Badge className="bg-neon-cyan text-black ml-auto">500-2000 $CCTR</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neon-purple">🎯</span>
                <span>Daily Challenges</span>
                <Badge className="bg-neon-green text-black ml-auto">50-200 $CCTR</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neon-pink">🎁</span>
                <span>Staking Rewards</span>
                <Badge className="bg-neon-purple text-black ml-auto">APY 15%</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-neon-cyan">🔗</span>
                <span>Referral Bonus</span>
                <Badge className="bg-neon-pink text-black ml-auto">100 $CCTR</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Panel (conditional) */}
      <Card className="arcade-frame border-neon-pink">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-pink flex items-center gap-3">
            👑 ADMIN PANEL
            <Badge className="bg-neon-pink text-black">RESTRICTED</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={adminAirdrop}
              className="cyber-button"
            >
              🎁 AIRDROP TOKENS
            </Button>
            <Button 
              variant="outline"
              className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
            >
              📊 VIEW ANALYTICS
            </Button>
            <Button 
              variant="outline"
              className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
            >
              ⚙️ TOKEN SETTINGS
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
