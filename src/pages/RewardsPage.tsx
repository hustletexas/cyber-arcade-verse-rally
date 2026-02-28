import React, { useState, useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gift, Trophy, Zap, Star, Clock, CheckCircle2, Wallet, Loader2, ShieldCheck, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { WalletConnectionModal } from '@/components/WalletConnectionModal';

interface Reward {
  id: string;
  reward_name: string;
  reward_source: string;
  requirement: string | null;
  reward_type: string;
  status: string;
  description: string | null;
  unlock_info: string | null;
  icon: string | null;
  expires_at: string | null;
  claimed_at: string | null;
  created_at: string;
}

const RewardsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { connectWallet, isWalletConnected, primaryWallet } = useMultiWallet();
  const [showWalletModal, setShowWalletModal] = useState(false);

  // Consider user "authenticated" if either Supabase auth or wallet is connected
  const isAuthenticated = !!user || isWalletConnected;
  const userId = user?.id || primaryWallet?.address || null;
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimState, setClaimState] = useState<'idle' | 'claiming' | 'claimed'>('idle');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [error, setError] = useState<string | null>(null);

  const claimable = rewards.filter(r => r.status === 'claimable');
  const earned = rewards.filter(r => r.status === 'claimed');

  useEffect(() => {
    fetchRewards();
  }, [user, isWalletConnected, primaryWallet]);

  const fetchRewards = async () => {
    if (!isAuthenticated || !userId) {
      setRewards([]);
      setLoading(false);
      return;
    }
    setLoading(false);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('rewards_ledger')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRewards((data as Reward[]) || []);
    } catch (err: any) {
      setError('Failed to load rewards.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimAll = async () => {
    if (claimable.length === 0) return;
    setClaimState('claiming');
    try {
      const ids = claimable.map(r => r.id);
      const { error: updateError } = await supabase
        .from('rewards_ledger')
        .update({ status: 'claimed', claimed_at: new Date().toISOString() } as any)
        .in('id', ids);

      if (updateError) throw updateError;

      setClaimState('claimed');
      toast({ title: 'Rewards claimed!', description: `${ids.length} reward(s) claimed successfully.` });
      await fetchRewards();
      setTimeout(() => setClaimState('idle'), 3000);
    } catch (err: any) {
      setClaimState('idle');
      toast({ title: 'Claim failed', description: err.message, variant: 'destructive' });
    }
  };

  const handleClaimSingle = async (rewardId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('rewards_ledger')
        .update({ status: 'claimed', claimed_at: new Date().toISOString() } as any)
        .eq('id', rewardId);

      if (updateError) throw updateError;
      toast({ title: 'Reward claimed!' });
      setSelectedReward(null);
      await fetchRewards();
    } catch (err: any) {
      toast({ title: 'Claim failed', description: err.message, variant: 'destructive' });
    }
  };

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'claimable':
        return <Badge className="bg-accent/20 text-accent border-accent/40 text-xs">Claimable</Badge>;
      case 'claimed':
        return <Badge className="bg-accent/20 text-accent border-accent/40 text-xs">Claimed</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="text-xs">Expired</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />

      <main className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
          className="mb-4 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Arcade
        </Button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-wider bg-gradient-to-r from-accent via-primary to-secondary bg-clip-text text-transparent">
              REWARDS
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Earn by competing, climbing leaderboards, and showing up.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-accent/10 text-accent border border-accent/30 gap-1.5 px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Built on Stellar
            </Badge>
            <Badge className="bg-secondary/10 text-secondary border border-secondary/30 gap-1.5 px-3 py-1">
              <Users className="w-3.5 h-3.5" />
              All Ages
            </Badge>
          </div>
        </div>

        {/* Claim Rewards Card */}
        <Card className="border-accent/20 bg-card/60 backdrop-blur-md mb-8 overflow-hidden relative">
          {/* Glow accent line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-primary to-secondary" />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground mb-1">Claim Rewards</h2>
                  {loading ? (
                    <p className="text-muted-foreground text-sm">Loading rewards…</p>
                  ) : error ? (
                    <p className="text-destructive text-sm">{error}</p>
                  ) : !isAuthenticated ? (
                    <p className="text-muted-foreground text-sm">Sign in or connect wallet to view your rewards.</p>
                  ) : claimable.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No rewards available right now. Check back after weekly reset.</p>
                  ) : (
                    <p className="text-accent text-sm font-medium">
                      You have {claimable.length} reward{claimable.length > 1 ? 's' : ''} ready to claim.
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 sm:shrink-0">
                <Button
                  onClick={handleClaimAll}
                  disabled={claimable.length === 0 || claimState !== 'idle' || !isAuthenticated}
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-display tracking-wider px-6"
                >
                  {claimState === 'claiming' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {claimState === 'idle' && 'CLAIM NOW'}
                  {claimState === 'claiming' && 'CLAIMING…'}
                  {claimState === 'claimed' && 'CLAIMED ✅'}
                </Button>
                {!isAuthenticated && (
                  <Button
                    variant="outline"
                    onClick={() => setShowWalletModal(true)}
                    className="border-accent/30 text-accent hover:bg-accent/10"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="claimable" className="w-full">
          <TabsList className="w-full grid grid-cols-3 bg-muted/50 backdrop-blur border border-border/50">
            <TabsTrigger value="claimable" className="font-display text-xs sm:text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
              Claimable
            </TabsTrigger>
            <TabsTrigger value="earned" className="font-display text-xs sm:text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
              Earned
            </TabsTrigger>
            <TabsTrigger value="how" className="font-display text-xs sm:text-sm data-[state=active]:bg-accent/20 data-[state=active]:text-accent">
              How It Works
            </TabsTrigger>
          </TabsList>

          {/* Claimable Tab */}
          <TabsContent value="claimable" className="mt-6">
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
              </div>
            ) : !user ? (
              <EmptyState icon={<Wallet className="w-10 h-10 text-muted-foreground" />} title="Sign in to see rewards" subtitle="Connect your account to view claimable rewards." />
            ) : error ? (
              <EmptyState icon={<Zap className="w-10 h-10 text-destructive" />} title="Error loading rewards" subtitle={error} />
            ) : claimable.length === 0 ? (
              <EmptyState icon={<Gift className="w-10 h-10 text-muted-foreground" />} title="No claimable rewards" subtitle="Keep competing — rewards drop after tournaments and weekly resets." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {claimable.map(reward => (
                  <RewardCard key={reward.id} reward={reward} onSelect={setSelectedReward} getStatusPill={getStatusPill} formatDate={formatDate} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Earned Tab */}
          <TabsContent value="earned" className="mt-6">
            {!user ? (
              <EmptyState icon={<Wallet className="w-10 h-10 text-muted-foreground" />} title="Sign in to see earned rewards" subtitle="Connect your account to view your history." />
            ) : earned.length === 0 ? (
              <EmptyState icon={<Trophy className="w-10 h-10 text-muted-foreground" />} title="No earned rewards yet" subtitle="Claim your first reward to see it here." />
            ) : (
              <div className="space-y-3">
                {earned.map(reward => (
                  <div
                    key={reward.id}
                    onClick={() => setSelectedReward(reward)}
                    className="flex items-center gap-4 p-4 rounded-lg bg-card/40 backdrop-blur border border-border/30 hover:border-accent/30 cursor-pointer transition-colors"
                  >
                    <span className="text-2xl">{reward.icon || '🏆'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{reward.reward_name}</p>
                      <p className="text-xs text-muted-foreground">{reward.reward_source}</p>
                    </div>
                    <div className="text-right shrink-0">
                      {getStatusPill(reward.status)}
                      {reward.claimed_at && (
                        <p className="text-xs text-muted-foreground mt-1">{formatDate(reward.claimed_at)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* How It Works Tab */}
          <TabsContent value="how" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <StepCard step={1} icon={<Zap className="w-8 h-8 text-accent" />} title="Compete" description="Play arcade games, enter tournaments, climb leaderboards." />
              <StepCard step={2} icon={<Star className="w-8 h-8 text-primary" />} title="Earn" description="Rewards are added to your ledger based on performance." />
              <StepCard step={3} icon={<Gift className="w-8 h-8 text-secondary" />} title="Claim" description="Visit this page to claim your rewards before they expire." />
            </div>
            <div className="text-center p-4 rounded-lg bg-card/40 backdrop-blur border border-border/30">
              <p className="text-muted-foreground text-sm font-display tracking-wider">
                ⚡ No gambling mechanics. Skill-based only.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Reward Details Modal */}
      <Dialog open={!!selectedReward} onOpenChange={() => setSelectedReward(null)}>
        <DialogContent className="bg-card border-accent/20 backdrop-blur-md max-w-md">
          {selectedReward && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 font-display">
                  <span className="text-3xl">{selectedReward.icon || '🏆'}</span>
                  {selectedReward.reward_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Source</p>
                  <p className="text-foreground">{selectedReward.reward_source}</p>
                </div>
                {selectedReward.requirement && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Why you earned it</p>
                    <p className="text-foreground">{selectedReward.requirement}</p>
                  </div>
                )}
                {selectedReward.description && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">What it unlocks</p>
                    <p className="text-foreground">{selectedReward.description}</p>
                  </div>
                )}
                {selectedReward.expires_at && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    Expires {formatDate(selectedReward.expires_at)}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  {getStatusPill(selectedReward.status)}
                  <Badge variant="outline" className="text-xs">{selectedReward.reward_type}</Badge>
                </div>
                {selectedReward.status === 'claimable' && (
                  <Button
                    onClick={() => handleClaimSingle(selectedReward.id)}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-display tracking-wider"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    CLAIM THIS REWARD
                  </Button>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={(walletType, address) => {
          connectWallet(walletType as any, address);
          setShowWalletModal(false);
        }}
      />
    </div>
  );
};

const EmptyState = ({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="mb-4 opacity-50">{icon}</div>
    <p className="font-display text-foreground mb-1">{title}</p>
    <p className="text-muted-foreground text-sm max-w-xs">{subtitle}</p>
  </div>
);

const RewardCard = ({
  reward,
  onSelect,
  getStatusPill,
  formatDate,
}: {
  reward: Reward;
  onSelect: (r: Reward) => void;
  getStatusPill: (s: string) => React.ReactNode;
  formatDate: (d: string) => string;
}) => (
  <Card
    onClick={() => onSelect(reward)}
    className="border-accent/15 bg-card/50 backdrop-blur hover:border-accent/40 cursor-pointer transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.1)] group"
  >
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{reward.icon || '🏆'}</span>
        {getStatusPill(reward.status)}
      </div>
      <h3 className="font-display text-sm font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
        {reward.reward_name}
      </h3>
      <p className="text-xs text-muted-foreground mb-2">{reward.reward_source}</p>
      {reward.requirement && (
        <p className="text-xs text-muted-foreground/70 italic mb-2 line-clamp-2">{reward.requirement}</p>
      )}
      {reward.expires_at && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          Expires {formatDate(reward.expires_at)}
        </div>
      )}
      <Button
        size="sm"
        className="w-full mt-3 bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 font-display text-xs tracking-wider"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(reward);
        }}
      >
        Claim
      </Button>
    </CardContent>
  </Card>
);

const StepCard = ({ step, icon, title, description }: { step: number; icon: React.ReactNode; title: string; description: string }) => (
  <Card className="border-border/30 bg-card/40 backdrop-blur text-center">
    <CardContent className="p-6">
      <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-3 font-display text-accent text-sm">
        {step}
      </div>
      <div className="flex justify-center mb-3">{icon}</div>
      <h3 className="font-display font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

export default RewardsPage;
