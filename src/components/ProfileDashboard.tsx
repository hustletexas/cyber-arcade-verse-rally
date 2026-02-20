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
import { User, Activity, Trophy, History, Settings, Gamepad2, Coins, Shield, Bell, Eye, Wallet, Save, Monitor, Smartphone, LogOut, FileDown, CheckCircle2, AlertTriangle, Clock, KeyRound } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AchievementSystem } from '@/components/AchievementSystem';

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

  // Fetch user's own tournament data - RLS ensures users only see their own entries
  // Sensitive wallet/tx data is protected by RLS and displayed with masking in UI
  const { data: tournamentEntries = [] } = useQuery({
    queryKey: ['user-tournament-entries', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('solana_tournament_entries')
        .select(`
          id, tournament_id, user_id, score, placement, reward_amount, 
          reward_claimed, joined_at, created_at,
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
      earned: tournamentEntries.length > 0 
    },
    { 
      name: 'Token Collector', 
      description: 'Accumulate 1,000 CCC', 
      earned: balance.cctr_balance >= 1000 
    },
    { 
      name: 'Tournament Winner', 
      description: 'Win a tournament', 
      earned: tournamentEntries.some(entry => entry.placement === 1) 
    },
    {
      name: 'Wallet Connected',
      description: 'Connect a Stellar wallet',
      earned: isWalletConnected
    },
    {
      name: 'High Roller',
      description: 'Accumulate 10,000 CCC',
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

  // Show wallet connection prompt if no wallet is connected
  if (!isWalletConnected || !primaryWallet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="arcade-frame">
          <CardContent className="p-8 text-center">
            <User size={48} className="mx-auto mb-4 text-neon-cyan" />
            <h2 className="text-2xl font-display text-neon-cyan mb-2">Connect Your Solana Wallet</h2>
            <p className="text-muted-foreground mb-4">
              Connect your Solana wallet to view your profile, tournament history, and blockchain activity
            </p>
            <p className="text-sm text-muted-foreground">
              Use the wallet connection button in the top navigation to get started
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get display info from wallet or user
  const displayName = user?.user_metadata?.username || primaryWallet.address.slice(0, 8) + '...';
  const displayEmail = user?.email || `${primaryWallet.type} wallet`;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Profile Header */}
      <Card className="arcade-frame">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20 border-4 border-neon-cyan">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-neon-purple text-black font-bold text-2xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-display text-neon-cyan">
                {displayName}
              </h2>
              <p className="text-muted-foreground">{displayEmail}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-neon-green text-black">WALLET CONNECTED</Badge>
                <Badge className="bg-neon-purple text-black">
                  {primaryWallet.type.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="text-right">
              <div className="text-3xl font-black text-neon-green">
                {balance.cctr_balance.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">CCC Balance</p>
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
          <TabsTrigger value="settings" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
            <Settings size={16} className="mr-2" />
            Account Settings
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
                <CardTitle>Connected Stellar Wallets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {connectedWallets.map((wallet, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-background/20 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{wallet.type === 'lobstr' ? '🌟' : wallet.type === 'freighter' ? '🚀' : '💰'}</span>
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

        <TabsContent value="settings" className="space-y-6">
          {/* Profile Settings */}
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={profileSettings.username}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, username: e.target.value }))}
                    className="bg-background/50 border-neon-cyan/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profileSettings.email}
                    disabled
                    className="bg-background/20 border-neon-cyan/30 opacity-50"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="avatar">Avatar URL</Label>
                  <Input
                    id="avatar"
                    value={profileSettings.avatar_url}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, avatar_url: e.target.value }))}
                    className="bg-background/50 border-neon-cyan/30"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              </div>
              <Button onClick={handleProfileSave} className="cyber-button">
                <Save size={16} className="mr-2" />
                Save Profile
              </Button>
            </CardContent>
          </Card>

          {/* Wallet Settings */}
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet size={20} />
                Wallet Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {connectedWallets.map((wallet, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{wallet.type === 'lobstr' ? '🌟' : wallet.type === 'freighter' ? '🚀' : '💰'}</span>
                      <div>
                        <p className="font-medium capitalize">{wallet.type} Wallet</p>
                        <code className="text-xs text-muted-foreground">
                          {wallet.address.slice(0, 12)}...{wallet.address.slice(-8)}
                        </code>
                      </div>
                      {wallet === primaryWallet && (
                        <Badge className="bg-neon-green text-black">Primary</Badge>
                      )}
                    </div>
                    <Button
                      onClick={() => handleWalletDisconnect(wallet.type)}
                      variant="outline"
                      size="sm"
                      className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                    >
                      Disconnect
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              <Separator />
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
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Balance Changes</p>
                  <p className="text-sm text-muted-foreground">Get notified of CCC balance updates</p>
                </div>
                <Switch
                  checked={notificationSettings.balanceChanges}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, balanceChanges: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing Emails</p>
                  <p className="text-sm text-muted-foreground">Receive promotional content and updates</p>
                </div>
                <Switch
                  checked={notificationSettings.marketingEmails}
                  onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={20} />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Public Profile</p>
                  <p className="text-sm text-muted-foreground">Allow others to view your profile</p>
                </div>
                <Switch
                  checked={privacySettings.showProfile}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showProfile: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Balance</p>
                  <p className="text-sm text-muted-foreground">Display your CCC balance publicly</p>
                </div>
                <Switch
                  checked={privacySettings.showBalance}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showBalance: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Show Activity</p>
                  <p className="text-sm text-muted-foreground">Make your tournament activity visible</p>
                </div>
                <Switch
                  checked={privacySettings.showActivity}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showActivity: checked }))}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Direct Messages</p>
                  <p className="text-sm text-muted-foreground">Allow other users to message you</p>
                </div>
                <Switch
                  checked={privacySettings.allowDirectMessages}
                  onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowDirectMessages: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security Section - Web3 */}
          <Card className="holographic border-neon-cyan/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} className="text-neon-cyan" />
                Security & Web3 Verification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Wallet Signature Verification Status */}
              <div className="p-4 bg-background/20 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-neon-green" />
                    <div>
                      <p className="font-medium">Wallet Signature Verification</p>
                      <p className="text-sm text-muted-foreground">
                        Proves you own this wallet address via cryptographic signature
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-neon-green/20 text-neon-green border border-neon-green/40">
                    Verified
                  </Badge>
                </div>
                <div className="flex items-center gap-2 ml-9 text-xs text-muted-foreground">
                  <Clock size={12} />
                  <span>Last verified: {(() => {
                    const ts = localStorage.getItem('wallet-auth-timestamp');
                    if (!ts) return 'Not yet verified';
                    const diff = Date.now() - Number(ts);
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
                    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                    return 'Just now';
                  })()}</span>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Active Sessions */}
              <div className="p-4 bg-background/20 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor size={18} className="text-neon-purple" />
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">Devices currently signed in</p>
                    </div>
                  </div>
                </div>
                <div className="ml-9 space-y-2">
                  <div className="flex items-center justify-between p-2 bg-background/30 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Monitor size={14} className="text-neon-cyan" />
                      <span>Web Browser</span>
                      <Badge className="bg-neon-green/20 text-neon-green text-[10px] px-1.5">Current</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">Active now</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-background/30 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <Smartphone size={14} className="text-muted-foreground" />
                      <span className="text-muted-foreground">Mobile (LOBSTR App)</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {primaryWallet?.type === 'lobstr' ? 'Connected' : 'Not connected'}
                    </span>
                  </div>
                </div>
                <div className="ml-9">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => {
                      localStorage.removeItem('wallet-auth-verified');
                      localStorage.removeItem('wallet-auth-timestamp');
                      toast({
                        title: "All Sessions Signed Out",
                        description: "You've been signed out of all sessions. Please reconnect your wallet.",
                      });
                      window.location.reload();
                    }}
                  >
                    <LogOut size={14} className="mr-2" />
                    Sign out of all sessions
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* 2FA */}
              <div className="flex items-center justify-between p-4 bg-background/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <KeyRound size={18} className="text-neon-yellow" />
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Secure your account with email or authenticator app
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/40">
                    <AlertTriangle size={10} className="mr-1" />
                    Not Enabled
                  </Badge>
                  <Button variant="outline" size="sm" className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black">
                    Enable 2FA
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Transaction History */}
              <div className="flex items-center justify-between p-4 bg-background/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <History size={18} className="text-neon-pink" />
                  <div>
                    <p className="font-medium">Transaction History</p>
                    <p className="text-sm text-muted-foreground">
                      View all on-chain & in-app transactions
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                  onClick={() => {
                    const tabsTrigger = document.querySelector('[value="activity"]') as HTMLElement;
                    tabsTrigger?.click();
                  }}
                >
                  View Transactions
                </Button>
              </div>

              <Separator className="bg-border/50" />

              {/* Export Account Data */}
              <div className="flex items-center justify-between p-4 bg-background/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileDown size={18} className="text-neon-purple" />
                  <div>
                    <p className="font-medium">Export Account Data</p>
                    <p className="text-sm text-muted-foreground">
                      Download your profile, wallet info, and activity as JSON
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                  onClick={() => {
                    const exportData = {
                      profile: {
                        username: profileSettings.username,
                        email: profileSettings.email,
                        avatar_url: profileSettings.avatar_url,
                      },
                      wallets: connectedWallets.map(w => ({
                        type: w.type,
                        address: w.address,
                      })),
                      balance: balance,
                      tournaments: tournamentEntries.length,
                      recentActivity: recentActivity.map(a => ({
                        type: a.transaction_type,
                        amount: a.amount,
                        date: a.created_at,
                        description: a.description,
                      })),
                      exportedAt: new Date().toISOString(),
                    };
                    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `cybercity-account-export-${Date.now()}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast({
                      title: "Data Exported",
                      description: "Your account data has been downloaded.",
                    });
                  }}
                >
                  <FileDown size={14} className="mr-2" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
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
                        {activity.amount > 0 ? '+' : ''}{activity.amount} CCC
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <AchievementSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
};
