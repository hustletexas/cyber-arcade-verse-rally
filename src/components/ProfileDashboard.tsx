import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';
import { User, Activity, Trophy, History, Settings, Gamepad2, Coins, Shield, Bell, Eye, Wallet, Save, Star, Zap, TrendingUp, Award, ExternalLink, Copy, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const ProfileDashboard = () => {
  const { user } = useAuth();
  const { balance } = useUserBalance();
  const { primaryWallet, connectedWallets, disconnectWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();
  
  // Settings state
  const [profileSettings, setProfileSettings] = useState({
    username: user?.user_metadata?.username || '',
    email: user?.email || '',
    avatar_url: user?.user_metadata?.avatar_url || ''
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    tournamentUpdates: true,
    prizeAlerts: true,
    balanceChanges: false,
    marketingEmails: false
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showBalance: false,
    showActivity: true,
    allowDirectMessages: true
  });

  // Fetch user's own tournament data (private, includes wallet info)
  const { data: tournamentEntries = [] } = useQuery({
    queryKey: ['user-tournament-entries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
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
    enabled: !!user?.id
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
      earned: tournamentEntries.length > 0,
      icon: '🏆',
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500'
    },
    { 
      name: 'Token Collector', 
      description: 'Accumulate 1,000 CCTR', 
      earned: balance.cctr_balance >= 1000,
      icon: '💰',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500'
    },
    { 
      name: 'Tournament Winner', 
      description: 'Win a tournament', 
      earned: tournamentEntries.some(entry => entry.placement === 1),
      icon: '👑',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500'
    },
    {
      name: 'Wallet Connected',
      description: 'Connect a Solana wallet',
      earned: isWalletConnected,
      icon: '🔗',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500'
    },
    {
      name: 'High Roller',
      description: 'Accumulate 10,000 CCTR',
      earned: balance.cctr_balance >= 10000,
      icon: '💎',
      color: 'bg-gradient-to-r from-indigo-500 to-purple-500'
    },
    {
      name: 'Tournament Veteran',
      description: 'Join 10+ tournaments',
      earned: tournamentEntries.length >= 10,
      icon: '🎖️',
      color: 'bg-gradient-to-r from-red-500 to-orange-500'
    }
  ];

  const stats = {
    tournamentsJoined: tournamentEntries.length,
    tournamentsWon: tournamentEntries.filter(entry => entry.placement === 1).length,
    totalRewards: tournamentEntries.reduce((sum, entry) => sum + (entry.reward_amount || 0), 0)
  };

  const handleProfileSave = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profileSettings.username,
          avatar_url: profileSettings.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update profile settings.",
        variant: "destructive",
      });
    }
  };

  const handleWalletDisconnect = async (walletType: string) => {
    try {
      await disconnectWallet(walletType as any);
      toast({
        title: "Wallet Disconnected",
        description: `${walletType} wallet has been disconnected.`,
      });
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect wallet.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Address copied to clipboard",
    });
  };

  // Show wallet connection prompt if no wallet is connected
  if (!isWalletConnected || !primaryWallet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20 shadow-2xl">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <User size={40} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Connect Your Solana Wallet
            </h2>
            <p className="text-muted-foreground text-lg mb-6 max-w-md mx-auto">
              Connect your Solana wallet to unlock your profile, tournament history, and blockchain activity
            </p>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 max-w-sm mx-auto">
              <p className="text-sm text-muted-foreground">
                Use the wallet connection button in the top navigation to get started
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get display info from wallet or user
  const displayName = user?.user_metadata?.username || primaryWallet.address.slice(0, 8) + '...';
  const displayEmail = user?.email || `${primaryWallet.type} wallet`;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Enhanced Profile Header with Magic Eden styling */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20 backdrop-blur-xl border border-primary/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Avatar Section */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary p-1">
                <Avatar className="w-full h-full border-4 border-background">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-bold text-3xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
              </div>
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {displayName}
                </h1>
                <p className="text-muted-foreground text-lg">{displayEmail}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 font-semibold">
                  <Zap size={14} className="mr-1" />
                  WALLET CONNECTED
                </Badge>
                <Badge className="bg-gradient-to-r from-primary to-secondary text-white px-3 py-1 font-semibold">
                  {primaryWallet.type.toUpperCase()}
                </Badge>
                {achievements.filter(a => a.earned).length > 0 && (
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 font-semibold">
                    <Star size={14} className="mr-1" />
                    {achievements.filter(a => a.earned).length} ACHIEVEMENTS
                  </Badge>
                )}
              </div>

              {/* Wallet Address with Copy */}
              <div className="flex items-center gap-2 bg-background/50 rounded-lg p-3 border border-primary/20">
                <code className="text-sm text-muted-foreground flex-1">
                  {primaryWallet.address}
                </code>
                <Button
                  onClick={() => copyToClipboard(primaryWallet.address)}
                  size="sm"
                  variant="ghost"
                  className="hover:bg-primary/10"
                >
                  <Copy size={14} />
                </Button>
              </div>
            </div>

            {/* Balance Section */}
            <div className="lg:text-right space-y-2">
              <div className="text-5xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {balance.cctr_balance.toLocaleString()}
              </div>
              <p className="text-muted-foreground">$CCTR Balance</p>
              {balance.claimable_rewards > 0 && (
                <Badge className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                  <TrendingUp size={14} className="mr-1" />
                  {balance.claimable_rewards} Claimable
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Navigation Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-background/50 backdrop-blur-sm border border-primary/20 rounded-xl p-1">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <User size={16} className="mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <Settings size={16} className="mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger 
            value="tournaments" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <Gamepad2 size={16} className="mr-2" />
            Tournaments
          </TabsTrigger>
          <TabsTrigger 
            value="activity" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <Activity size={16} className="mr-2" />
            Activity
          </TabsTrigger>
          <TabsTrigger 
            value="achievements" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-500 data-[state=active]:to-orange-500 data-[state=active]:text-white rounded-lg transition-all duration-300"
          >
            <Trophy size={16} className="mr-2" />
            Achievements
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Gamepad2 size={24} className="text-white" />
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  {stats.tournamentsJoined}
                </div>
                <p className="text-sm text-muted-foreground">Tournaments Joined</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Trophy size={24} className="text-white" />
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stats.tournamentsWon}
                </div>
                <p className="text-sm text-muted-foreground">Tournaments Won</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <Coins size={24} className="text-white" />
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {stats.totalRewards.toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Total SOL Rewards</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Wallet size={24} className="text-white" />
                </div>
                <div className="text-3xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {connectedWallets.length}
                </div>
                <p className="text-sm text-muted-foreground">Connected Wallets</p>
              </CardContent>
            </Card>
          </div>

          {/* Connected Wallets */}
          {connectedWallets.length > 0 && (
            <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20 hover:border-primary/40 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Wallet size={24} className="text-primary" />
                  Connected Solana Wallets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {connectedWallets.map((wallet, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-primary/10 hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xl">
                          {wallet.type === 'phantom' ? '👻' : wallet.type === 'solflare' ? '🔥' : wallet.type === 'backpack' ? '🎒' : '💰'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="capitalize font-semibold text-lg">{wallet.type}</span>
                            {wallet === primaryWallet && (
                              <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">PRIMARY</Badge>
                            )}
                          </div>
                          <code className="text-sm text-muted-foreground">
                            {wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}
                          </code>
                        </div>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(wallet.address)}
                        variant="ghost"
                        size="sm"
                        className="hover:bg-primary/10"
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6 mt-6">
          {/* Profile Settings */}
          <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <User size={24} className="text-primary" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                  <Input
                    id="username"
                    value={profileSettings.username}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-background/50 border-primary/20 focus:border-primary/40 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    value={profileSettings.email}
                    disabled
                    className="bg-background/20 border-primary/20 opacity-50 rounded-lg"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="avatar" className="text-sm font-medium">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={profileSettings.avatar_url}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, avatar_url: e.target.value }))}
                    className="bg-background/50 border-primary/20 focus:border-primary/40 rounded-lg"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
              <Button 
                onClick={handleProfileSave} 
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-white rounded-lg px-6 py-3 font-semibold transition-all duration-300"
              >
                <Save size={16} className="mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Wallet Management */}
          <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Wallet size={24} className="text-primary" />
                Wallet Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedWallets.map((wallet, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-primary/10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-xl">
                        {wallet.type === 'phantom' ? '👻' : wallet.type === 'solflare' ? '🔥' : wallet.type === 'backpack' ? '🎒' : '💰'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold capitalize text-lg">{wallet.type} Wallet</p>
                          {wallet === primaryWallet && (
                            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">Primary</Badge>
                          )}
                        </div>
                        <code className="text-sm text-muted-foreground">
                          {wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}
                        </code>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleWalletDisconnect(wallet.type)}
                      variant="outline"
                      className="border-red-500/50 text-red-500 hover:bg-red-500/10 hover:border-red-500 rounded-lg"
                    >
                      Disconnect
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bell size={24} className="text-primary" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Tournament Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified about tournament status changes</p>
                </div>
                <Switch
                  checked={notificationSettings.tournamentUpdates}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, tournamentUpdates: checked }))}
                />
              </div>
              <Separator className="bg-primary/20" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Prize Alerts</p>
                  <p className="text-sm text-muted-foreground">Notifications when you win prizes or rewards</p>
                </div>
                <Switch
                  checked={notificationSettings.prizeAlerts}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, prizeAlerts: checked }))}
                />
              </div>
              <Separator className="bg-primary/20" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Balance Changes</p>
                  <p className="text-sm text-muted-foreground">Get notified of CCTR balance updates</p>
                </div>
                <Switch
                  checked={notificationSettings.balanceChanges}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, balanceChanges: checked }))}
                />
              </div>
              <Separator className="bg-primary/20" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">Receive updates about new features and events</p>
                </div>
                <Switch
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield size={24} className="text-primary" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Profile</p>
                  <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                </div>
                <Switch
                  checked={privacySettings.showProfile}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showProfile: checked }))}
                />
              </div>
              <Separator className="bg-primary/20" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Balance</p>
                  <p className="text-sm text-muted-foreground">Display your CCTR balance publicly</p>
                </div>
                <Switch
                  checked={privacySettings.showBalance}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showBalance: checked }))}
                />
              </div>
              <Separator className="bg-primary/20" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Activity</p>
                  <p className="text-sm text-muted-foreground">Make your gaming activity visible</p>
                </div>
                <Switch
                  checked={privacySettings.showActivity}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showActivity: checked }))}
                />
              </div>
              <Separator className="bg-primary/20" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Allow Direct Messages</p>
                  <p className="text-sm text-muted-foreground">Let other users send you messages</p>
                </div>
                <Switch
                  checked={privacySettings.allowDirectMessages}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowDirectMessages: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tournaments Tab */}
        <TabsContent value="tournaments" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Gamepad2 size={24} className="text-primary" />
                Tournament History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tournamentEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Gamepad2 size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">No tournament entries yet</p>
                  <p className="text-sm text-muted-foreground">Join your first tournament to see your history here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tournamentEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-primary/10 hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <Gamepad2 size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">{entry.solana_tournaments?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Status: {entry.solana_tournaments?.status}
                            {entry.placement && ` • Placed #${entry.placement}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-400">
                          {entry.reward_amount ? `${entry.reward_amount} SOL` : 'No reward'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Prize Pool: {entry.solana_tournaments?.prize_pool} SOL
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity size={24} className="text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <Activity size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground">Your token transactions will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-background/50 rounded-xl border border-primary/10 hover:border-primary/20 transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                          <Coins size={20} className="text-white" />
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{activity.transaction_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${activity.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {activity.amount > 0 ? '+' : ''}{activity.amount} CCTR
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl border border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Trophy size={24} className="text-primary" />
                Achievements
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  {achievements.filter(a => a.earned).length}/{achievements.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index} 
                    className={`p-6 rounded-xl border transition-all duration-300 hover:scale-105 ${
                      achievement.earned 
                        ? `${achievement.color} border-white/20 text-white shadow-lg` 
                        : 'bg-background/50 border-muted text-muted-foreground'
                    }`}
                  >
                    <div className="text-center space-y-3">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h3 className="font-bold text-lg">{achievement.name}</h3>
                      <p className={`text-sm ${achievement.earned ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && (
                        <div className="flex items-center justify-center gap-1 mt-2">
                          <Award size={16} />
                          <span className="text-xs font-semibold">EARNED</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};