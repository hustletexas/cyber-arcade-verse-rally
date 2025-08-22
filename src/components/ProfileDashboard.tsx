
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { WalletBalanceDisplay } from './WalletBalanceDisplay';
import { User, Activity, Trophy, History, Settings, Gamepad2, Coins } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ProfileDashboard = () => {
  const { user } = useAuth();
  const { balance } = useUserBalance();
  const { primaryWallet, connectedWallets } = useMultiWallet();

  // Fetch tournament data
  const { data: tournamentEntries = [] } = useQuery({
    queryKey: ['tournament-entries', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('solana_tournament_entries')
        .select(`
          *,
          solana_tournaments (
            name,
            status,
            prize_pool,
            start_time,
            end_time
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Fetch recent activity from token transactions
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['token-transactions', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Calculate achievements based on real data
  const achievements = [
    { 
      name: 'First Tournament', 
      description: 'Joined your first tournament', 
      earned: tournamentEntries.length > 0 
    },
    { 
      name: 'Token Collector', 
      description: 'Accumulate 1,000 CCTR', 
      earned: balance.cctr_balance >= 1000 
    },
    { 
      name: 'Tournament Winner', 
      description: 'Win a tournament', 
      earned: tournamentEntries.some(entry => entry.placement === 1) 
    },
    {
      name: 'Wallet Connected',
      description: 'Connect a Solana wallet',
      earned: !!primaryWallet
    },
    {
      name: 'High Roller',
      description: 'Accumulate 10,000 CCTR',
      earned: balance.cctr_balance >= 10000
    },
    {
      name: 'Tournament Veteran',
      description: 'Join 10+ tournaments',
      earned: tournamentEntries.length >= 10
    }
  ];

  const stats = {
    tournamentsJoined: tournamentEntries.length,
    tournamentsWon: tournamentEntries.filter(entry => entry.placement === 1).length,
    totalRewards: tournamentEntries.reduce((sum, entry) => sum + (entry.reward_amount || 0), 0)
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="arcade-frame">
          <CardContent className="p-8 text-center">
            <User size={48} className="mx-auto mb-4 text-neon-cyan" />
            <h2 className="text-2xl font-display text-neon-cyan mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Connect your Solana wallet to view your profile, NFTs, tournament history, and blockchain activity
            </p>
            <Button className="cyber-button">
              Connect Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="arcade-frame">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-4 border-neon-cyan">
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-neon-purple text-black font-bold text-2xl">
                {user.user_metadata?.username?.charAt(0) || user.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-display text-neon-cyan">
                {user.user_metadata?.username || user.email?.split('@')[0]}
              </h2>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-neon-green text-black">VERIFIED</Badge>
                {primaryWallet && (
                  <Badge className="bg-neon-purple text-black">
                    SOLANA CONNECTED
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-neon-green">
                {balance.cctr_balance.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">$CCTR Balance</p>
              {balance.claimable_rewards > 0 && (
                <Badge className="bg-neon-pink text-black mt-1">
                  {balance.claimable_rewards} Claimable
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 arcade-frame">
          <TabsTrigger value="overview" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
            <User size={16} className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="nfts" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
            <Coins size={16} className="mr-2" />
            NFTs & Tokens
          </TabsTrigger>
          <TabsTrigger value="tournaments" className="data-[state=active]:bg-neon-purple data-[state=active]:text-black">
            <Gamepad2 size={16} className="mr-2" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-neon-pink data-[state=active]:text-black">
            <Activity size={16} className="mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-neon-yellow data-[state=active]:text-black">
            <Trophy size={16} className="mr-2" />
            Achievements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="vending-machine">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-black text-neon-green">{stats.tournamentsJoined}</div>
                <p className="text-sm text-muted-foreground">Tournaments Joined</p>
              </CardContent>
            </Card>
            <Card className="vending-machine">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-black text-neon-purple">{stats.tournamentsWon}</div>
                <p className="text-sm text-muted-foreground">Tournaments Won</p>
              </CardContent>
            </Card>
            <Card className="vending-machine">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-black text-neon-pink">{stats.totalRewards.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Total SOL Rewards</p>
              </CardContent>
            </Card>
            <Card className="vending-machine">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-black text-neon-cyan">{connectedWallets.length}</div>
                <p className="text-sm text-muted-foreground">Connected Wallets</p>
              </CardContent>
            </Card>
          </div>

          {connectedWallets.length > 0 && (
            <Card className="holographic">
              <CardHeader>
                <CardTitle>Connected Solana Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {connectedWallets.map((wallet, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/20 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{wallet.type === 'phantom' ? '👻' : '💰'}</span>
                        <div>
                          <span className="capitalize font-medium">{wallet.type}</span>
                          {wallet === primaryWallet && (
                            <Badge className="ml-2 bg-neon-green text-black text-xs">PRIMARY</Badge>
                          )}
                        </div>
                      </div>
                      <code className="text-xs bg-background/50 px-2 py-1 rounded">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}
                      </code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="nfts" className="space-y-4">
          <WalletBalanceDisplay />
        </TabsContent>

        <TabsContent value="tournaments" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 size={20} />
                Tournament History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tournamentEntries.length === 0 ? (
                <div className="text-center py-8">
                  <Gamepad2 className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">No tournaments joined yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tournamentEntries.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-background/20 rounded">
                      <div className="flex-1">
                        <h3 className="font-bold text-neon-cyan">
                          {entry.solana_tournaments?.name || 'Tournament'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Joined: {new Date(entry.joined_at).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={`text-xs ${
                            entry.solana_tournaments?.status === 'completed' ? 'bg-neon-green text-black' :
                            entry.solana_tournaments?.status === 'active' ? 'bg-neon-yellow text-black' :
                            'bg-gray-500 text-white'
                          }`}>
                            {entry.solana_tournaments?.status?.toUpperCase()}
                          </Badge>
                          {entry.placement && (
                            <Badge className="bg-neon-purple text-black text-xs">
                              #{entry.placement}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-neon-green">
                          {entry.score} pts
                        </div>
                        {entry.reward_amount > 0 && (
                          <div className="text-sm text-neon-pink">
                            +{entry.reward_amount} SOL
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History size={20} />
                Blockchain Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="mx-auto mb-4 text-muted-foreground" size={48} />
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/20 rounded">
                      <div>
                        <p className="font-medium">{activity.description || activity.transaction_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className={`font-bold ${activity.amount > 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
                        {activity.amount > 0 ? '+' : ''}{activity.amount} $CCTR
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement, index) => (
              <Card key={index} className={achievement.earned ? "holographic" : "vending-machine opacity-50"}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Trophy size={24} className={achievement.earned ? "text-neon-yellow" : "text-muted-foreground"} />
                    <div className="flex-1">
                      <h3 className="font-bold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.earned && (
                      <Badge className="bg-neon-yellow text-black">EARNED</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
