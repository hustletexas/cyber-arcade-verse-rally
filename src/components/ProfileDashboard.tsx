
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { User, Activity, Trophy, History, Settings } from 'lucide-react';

export const ProfileDashboard = () => {
  const { user } = useAuth();
  const { balance } = useUserBalance();
  const { primaryWallet, connectedWallets } = useMultiWallet();

  // Mock data for demonstration
  const recentActivity = [
    { type: 'tournament', description: 'Joined Cyber Tournament #42', amount: -50, timestamp: '2 hours ago' },
    { type: 'reward', description: 'Tournament reward claimed', amount: +250, timestamp: '1 day ago' },
    { type: 'purchase', description: 'Bought CCTR tokens', amount: +1000, timestamp: '3 days ago' },
  ];

  const achievements = [
    { name: 'First Win', description: 'Won your first tournament', earned: true },
    { name: 'Token Collector', description: 'Accumulate 5,000 CCTR', earned: true },
    { name: 'Tournament Master', description: 'Win 10 tournaments', earned: false },
    { name: 'Early Adopter', description: 'Joined during beta', earned: true },
  ];

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please log in to view your profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                    WALLET CONNECTED
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
        <TabsList className="grid w-full grid-cols-4 arcade-frame">
          <TabsTrigger value="overview" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
            <User size={16} className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
            <Activity size={16} className="mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger value="achievements" className="data-[state=active]:bg-neon-purple data-[state=active]:text-black">
            <Trophy size={16} className="mr-2" />
            Achievements
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-neon-pink data-[state=active]:text-black">
            <Settings size={16} className="mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="vending-machine">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-black text-neon-green">12</div>
                <p className="text-sm text-muted-foreground">Tournaments Joined</p>
              </CardContent>
            </Card>
            <Card className="vending-machine">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-black text-neon-purple">3</div>
                <p className="text-sm text-muted-foreground">Tournaments Won</p>
              </CardContent>
            </Card>
            <Card className="vending-machine">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-black text-neon-pink">8,450</div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
              </CardContent>
            </Card>
          </div>

          {connectedWallets.length > 0 && (
            <Card className="holographic">
              <CardHeader>
                <CardTitle>Connected Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {connectedWallets.map((wallet, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-background/20 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{wallet.type === 'phantom' ? '👻' : '💰'}</span>
                        <span className="capitalize">{wallet.type}</span>
                      </div>
                      <code className="text-xs">{wallet.address.slice(0, 8)}...{wallet.address.slice(-4)}</code>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History size={20} />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-background/20 rounded">
                    <div>
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                    </div>
                    <div className={`font-bold ${activity.amount > 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
                      {activity.amount > 0 ? '+' : ''}{activity.amount} $CCTR
                    </div>
                  </div>
                ))}
              </div>
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
                    <div>
                      <h3 className="font-bold">{achievement.name}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    {achievement.earned && (
                      <Badge className="bg-neon-yellow text-black ml-auto">EARNED</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Notifications</label>
                <Button variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black">
                  Configure Notifications
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Privacy Settings</label>
                <Button variant="outline" className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black">
                  Manage Privacy
                </Button>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Security</label>
                <Button variant="outline" className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black">
                  Two-Factor Authentication
                </Button>
              </div>
              
              <div className="pt-4 border-t border-neon-cyan/20">
                <Button variant="outline" className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
