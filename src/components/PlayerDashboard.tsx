
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AchievementSystem } from '@/components/AchievementSystem';

export const PlayerDashboard = () => {
  const playerStats = {
    level: 47,
    xp: 24580,
    xpToNext: 3420,
    totalWins: 89,
    totalMatches: 156,
    winRate: 57,
    highScore: 2847500,
    rank: 'Diamond'
  };

  const tournamentHistory = [
    {
      id: 'cyber-clash-2024',
      name: 'Cyber Clash Championship',
      date: '2024-11-15',
      placement: 3,
      prize: '2,500 $CCTR',
      status: 'completed'
    },
    {
      id: 'neon-battle-nov',
      name: 'Neon Nights Battle',
      date: '2024-11-08',
      placement: 1,
      prize: '5,000 $CCTR',
      status: 'completed'
    },
    {
      id: 'retro-rumble-oct',
      name: 'Retro Rumble Arena',
      date: '2024-10-22',
      placement: 7,
      prize: '500 $CCTR',
      status: 'completed'
    }
  ];

  const ownedNFTs = [
    {
      id: 'elite-pass-001',
      name: 'Elite Tournament Pass',
      type: 'Access Pass',
      rarity: 'Rare',
      acquired: '2024-10-15'
    },
    {
      id: 'cyber-sword-legendary',
      name: 'Cyber Legendary Sword',
      type: 'Weapon',
      rarity: 'Legendary',
      acquired: '2024-11-01'
    },
    {
      id: 'champion-badge-nov',
      name: 'November Champion Badge',
      type: 'Badge',
      rarity: 'Epic',
      acquired: '2024-11-08'
    }
  ];

  const claimableRewards = [
    {
      id: 'tournament-win-bonus',
      type: 'Tournament Victory',
      amount: '1,250 $CCTR',
      description: 'Bonus for winning Neon Nights Battle'
    },
    {
      id: 'daily-login-streak',
      type: 'Login Streak',
      amount: '500 $CCTR',
      description: '30-day login streak reward'
    },
    {
      id: 'achievement-unlock',
      type: 'Achievement',
      amount: '750 $CCTR',
      description: 'Unlocked "Combo Master" achievement'
    }
  ];

  const walletActivity = [
    {
      id: 'tx-001',
      type: 'Received',
      amount: '+5,000 $CCTR',
      description: 'Tournament prize',
      timestamp: '2024-11-08 14:30',
      txHash: '7xKX...9Qmp'
    },
    {
      id: 'tx-002',
      type: 'Spent',
      amount: '-150 $CCTR',
      description: 'Power-up purchase',
      timestamp: '2024-11-07 19:45',
      txHash: '8yLY...2Rnq'
    },
    {
      id: 'tx-003',
      type: 'Received',
      amount: '+2,500 $CCTR',
      description: 'Tournament prize',
      timestamp: '2024-11-01 16:20',
      txHash: '9zMZ...3Spr'
    }
  ];

  const claimReward = (rewardId: string) => {
    // Reward claimed successfully
  };

  return (
    <div className="space-y-6">
      {/* Player Stats Overview */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
            👤 PLAYER PROFILE
            <Badge className="bg-neon-green text-black">{playerStats.rank}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="holographic p-4 text-center">
              <h3 className="font-display text-lg text-neon-purple mb-2">LEVEL</h3>
              <div className="text-3xl font-black text-neon-green">{playerStats.level}</div>
              <p className="text-sm text-muted-foreground">
                {playerStats.xp.toLocaleString()} / {(playerStats.xp + playerStats.xpToNext).toLocaleString()} XP
              </p>
            </Card>

            <Card className="holographic p-4 text-center">
              <h3 className="font-display text-lg text-neon-pink mb-2">WIN RATE</h3>
              <div className="text-3xl font-black text-neon-cyan">{playerStats.winRate}%</div>
              <p className="text-sm text-muted-foreground">
                {playerStats.totalWins}/{playerStats.totalMatches} matches
              </p>
            </Card>

            <Card className="holographic p-4 text-center">
              <h3 className="font-display text-lg text-neon-green mb-2">HIGH SCORE</h3>
              <div className="text-3xl font-black text-neon-purple">{playerStats.highScore.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Personal best</p>
            </Card>

            <Card className="holographic p-4 text-center">
              <h3 className="font-display text-lg text-neon-cyan mb-2">RANK</h3>
              <div className="text-3xl font-black text-neon-pink">#247</div>
              <p className="text-sm text-muted-foreground">Global leaderboard</p>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Account Tabs */}
      <Tabs defaultValue="history" className="w-full">
        <TabsList className="grid w-full grid-cols-5 arcade-frame p-2">
          <TabsTrigger value="achievements" className="cyber-button">🏅 ACHIEVEMENTS</TabsTrigger>
          <TabsTrigger value="history" className="cyber-button">🏆 HISTORY</TabsTrigger>
          <TabsTrigger value="nfts" className="cyber-button">💎 MY NFTs</TabsTrigger>
          <TabsTrigger value="rewards" className="cyber-button">🎁 REWARDS</TabsTrigger>
          <TabsTrigger value="wallet" className="cyber-button">💰 WALLET</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-6 mt-6">
          <AchievementSystem />
        </TabsContent>

        <TabsContent value="history" className="space-y-6 mt-6">
          <Card className="vending-machine">
            <CardHeader>
              <CardTitle className="font-display text-xl text-neon-purple">🏆 TOURNAMENT HISTORY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tournamentHistory.map((tournament) => (
                  <Card key={tournament.id} className="arcade-frame p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-neon-cyan">{tournament.name}</h3>
                        <p className="text-sm text-muted-foreground">{tournament.date}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${tournament.placement <= 3 ? 'bg-neon-green' : 'bg-neon-purple'} text-black mb-2`}>
                          #{tournament.placement}
                        </Badge>
                        <p className="text-neon-green font-bold">{tournament.prize}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nfts" className="space-y-6 mt-6">
          <Card className="vending-machine">
            <CardHeader>
              <CardTitle className="font-display text-xl text-neon-pink">💎 MY NFT COLLECTION</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownedNFTs.map((nft) => (
                  <Card key={nft.id} className="holographic p-4 text-center">
                    <div className="text-4xl mb-2">
                      {nft.type === 'Access Pass' ? '🎟️' : nft.type === 'Weapon' ? '⚔️' : '🏆'}
                    </div>
                    <h3 className="font-bold text-neon-cyan text-sm mb-1">{nft.name}</h3>
                    <Badge className="bg-neon-purple text-black text-xs mb-2">{nft.rarity}</Badge>
                    <p className="text-xs text-muted-foreground">Acquired: {nft.acquired}</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6 mt-6">
          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle className="font-display text-xl text-neon-green">🎁 CLAIMABLE REWARDS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claimableRewards.map((reward) => (
                  <Card key={reward.id} className="holographic p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-neon-cyan">{reward.type}</h3>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-neon-green font-bold mb-2">{reward.amount}</p>
                        <Button 
                          onClick={() => claimReward(reward.id)}
                          className="cyber-button text-sm"
                        >
                          🎁 CLAIM
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6 mt-6">
          <Card className="vending-machine">
            <CardHeader>
              <CardTitle className="font-display text-xl text-neon-cyan">💰 WALLET ACTIVITY</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {walletActivity.map((activity) => (
                  <Card key={activity.id} className="arcade-frame p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`${activity.type === 'Received' ? 'text-neon-green' : 'text-neon-pink'}`}>
                            {activity.type === 'Received' ? '⬇️' : '⬆️'}
                          </span>
                          <span className="font-bold text-neon-cyan">{activity.type}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${activity.type === 'Received' ? 'text-neon-green' : 'text-neon-pink'}`}>
                          {activity.amount}
                        </p>
                        <p className="text-xs text-neon-purple">{activity.txHash}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
