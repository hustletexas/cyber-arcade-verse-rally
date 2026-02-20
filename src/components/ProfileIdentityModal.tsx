import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Loader2, Trophy, Gamepad2, TrendingUp, Flame, Crown, Star, Shield, Zap, Medal, Target, Swords } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useToast } from '@/hooks/use-toast';

// ─── Animated Frame Definitions ───
const ANIMATED_FRAMES = [
  { id: 'none', name: 'None', tier: 'guest', borderClass: 'border-white/20', animation: '' },
  { id: 'neon-pulse', name: 'Neon Pulse', tier: 'common', borderClass: 'border-neon-cyan', animation: 'animate-pulse' },
  { id: 'fire-ring', name: 'Fire Ring', tier: 'rare', borderClass: 'border-orange-500', animation: 'animate-pulse', gradient: 'from-orange-500 via-red-500 to-yellow-500' },
  { id: 'electric-arc', name: 'Electric Arc', tier: 'rare', borderClass: 'border-neon-cyan', animation: 'animate-pulse', gradient: 'from-neon-cyan via-blue-500 to-neon-purple' },
  { id: 'cosmic-glow', name: 'Cosmic Glow', tier: 'epic', borderClass: 'border-neon-purple', animation: 'animate-pulse', gradient: 'from-neon-purple via-neon-pink to-neon-cyan' },
  { id: 'legendary-aura', name: 'Legendary Aura', tier: 'legendary', borderClass: 'border-yellow-400', animation: 'animate-pulse', gradient: 'from-yellow-400 via-amber-500 to-orange-500' },
];

// ─── Display Badges ───
const DISPLAY_BADGES = [
  { id: 'none', name: 'None', icon: null, color: '' },
  { id: 'og-player', name: 'OG Player', icon: Star, color: 'text-yellow-400 bg-yellow-400/20' },
  { id: 'tournament-champ', name: 'Tournament Champ', icon: Trophy, color: 'text-neon-cyan bg-neon-cyan/20' },
  { id: 'arcade-master', name: 'Arcade Master', icon: Gamepad2, color: 'text-neon-green bg-neon-green/20' },
  { id: 'whale', name: 'Whale', icon: Crown, color: 'text-neon-purple bg-neon-purple/20' },
  { id: 'streak-king', name: 'Streak King', icon: Flame, color: 'text-neon-pink bg-neon-pink/20' },
  { id: 'guardian', name: 'Guardian', icon: Shield, color: 'text-blue-400 bg-blue-400/20' },
  { id: 'hunter', name: 'Hunter', icon: Target, color: 'text-red-400 bg-red-400/20' },
  { id: 'warrior', name: 'Warrior', icon: Swords, color: 'text-orange-400 bg-orange-400/20' },
];

// ─── Profile Themes ───
const PROFILE_THEMES = [
  { id: 'default', name: 'Default Neon', primary: '#00ffff', secondary: '#bf00ff', accent: '#39ff14' },
  { id: 'crimson-fire', name: 'Crimson Fire', primary: '#ff0055', secondary: '#ff6600', accent: '#ffcc00' },
  { id: 'deep-ocean', name: 'Deep Ocean', primary: '#0066ff', secondary: '#00ccff', accent: '#00ffcc' },
  { id: 'toxic-green', name: 'Toxic Green', primary: '#39ff14', secondary: '#00ff88', accent: '#ccff00' },
  { id: 'royal-purple', name: 'Royal Purple', primary: '#9900ff', secondary: '#ff00ff', accent: '#cc66ff' },
  { id: 'golden-hour', name: 'Golden Hour', primary: '#ffcc00', secondary: '#ff9900', accent: '#ffee77' },
];

const TIER_ORDER = ['guest', 'common', 'rare', 'epic', 'legendary'];

interface ProfileIdentityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatarUrl: string | null;
  onAvatarChange: (url: string) => void;
}

export const ProfileIdentityModal = ({ open, onOpenChange, avatarUrl, onAvatarChange }: ProfileIdentityModalProps) => {
  const { primaryWallet } = useMultiWallet();
  const { balance } = useUserBalance();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [selectedBadge, setSelectedBadge] = useState('none');
  const [selectedTheme, setSelectedTheme] = useState('default');
  const [playerTier, setPlayerTier] = useState('guest');
  const [stats, setStats] = useState({ totalMatches: 0, tournamentsWon: 0, winRate: 0, totalUSDCWon: 0, currentStreak: 0, ranking: null as number | null });
  const [loadingStats, setLoadingStats] = useState(true);

  // Load profile preferences + stats
  const loadProfile = useCallback(async () => {
    if (!primaryWallet?.address) return;
    setLoadingStats(true);

    try {
      // Load saved preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', primaryWallet.address)
        .maybeSingle();

      // Detect tier from NFT purchases
      const { data: nftData } = await supabase
        .from('nft_purchases')
        .select('nft_name')
        .eq('wallet_address', primaryWallet.address)
        .eq('status', 'completed')
        .ilike('nft_name', '%pass%')
        .order('created_at', { ascending: false })
        .limit(1);

      let tier = 'guest';
      if (nftData && nftData.length > 0) {
        const name = nftData[0].nft_name.toLowerCase();
        if (name.includes('legendary')) tier = 'legendary';
        else if (name.includes('epic')) tier = 'epic';
        else if (name.includes('rare')) tier = 'rare';
        else tier = 'common';
      }
      setPlayerTier(tier);

      // Fetch tournament stats
      const [matchesRes, standingsRes, payoutsRes, weeklyRes] = await Promise.all([
        supabase.from('tournament_matches').select('id, winner_wallet', { count: 'exact' })
          .or(`player_a_wallet.eq.${primaryWallet.address},player_b_wallet.eq.${primaryWallet.address}`),
        supabase.from('tournament_standings').select('placement, wins, losses')
          .eq('wallet_address', primaryWallet.address),
        supabase.from('tournament_payouts').select('amount_usdc, amount_usd')
          .eq('wallet_address', primaryWallet.address).eq('status', 'paid'),
        supabase.from('weekly_reward_distributions').select('placement')
          .eq('wallet_address', primaryWallet.address)
          .order('week_start', { ascending: false }).limit(1),
      ]);

      const totalMatches = matchesRes.count ?? 0;
      const matchWins = matchesRes.data?.filter(m => m.winner_wallet === primaryWallet.address).length ?? 0;
      const tournamentsWon = standingsRes.data?.filter(s => s.placement === 1).length ?? 0;
      const winRate = totalMatches > 0 ? Math.round((matchWins / totalMatches) * 100) : 0;
      const totalUSDCWon = payoutsRes.data?.reduce((s, p) => s + (p.amount_usdc ?? p.amount_usd ?? 0), 0) ?? 0;
      const totalWins = standingsRes.data?.reduce((s, r) => s + (r.wins ?? 0), 0) ?? 0;
      const totalLosses = standingsRes.data?.reduce((s, r) => s + (r.losses ?? 0), 0) ?? 0;

      setStats({
        totalMatches,
        tournamentsWon,
        winRate,
        totalUSDCWon,
        currentStreak: Math.max(0, totalWins - totalLosses),
        ranking: weeklyRes.data?.[0]?.placement ?? null,
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [primaryWallet?.address]);

  useEffect(() => {
    if (open) loadProfile();
  }, [open, loadProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !primaryWallet?.address) return;
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Too large', description: 'Max 2MB.', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const folder = primaryWallet.address.slice(0, 16);
      const filePath = `${folder}/avatar.${ext}`;

      const { error: uploadErr } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { data: existing } = await supabase.from('profiles').select('id').eq('wallet_address', primaryWallet.address).maybeSingle();
      if (existing) {
        await supabase.from('profiles').update({ avatar_url: newUrl, updated_at: new Date().toISOString() }).eq('id', existing.id);
      } else {
        await supabase.from('profiles').insert({ id: crypto.randomUUID(), wallet_address: primaryWallet.address, avatar_url: newUrl });
      }

      onAvatarChange(newUrl);
      toast({ title: 'Avatar updated! 🎨' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const canUseTier = (requiredTier: string) => {
    return TIER_ORDER.indexOf(playerTier) >= TIER_ORDER.indexOf(requiredTier);
  };

  const activeFrame = ANIMATED_FRAMES.find(f => f.id === selectedFrame) || ANIMATED_FRAMES[0];
  const activeBadge = DISPLAY_BADGES.find(b => b.id === selectedBadge);
  const activeTheme = PROFILE_THEMES.find(t => t.id === selectedTheme) || PROFILE_THEMES[0];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="arcade-frame bg-background/98 backdrop-blur-xl border-neon-cyan/30 max-w-lg animate-scale-in p-0 gap-0 max-h-[90vh]">
        <DialogHeader className="p-5 pb-0">
          <DialogTitle className="text-2xl text-neon-cyan font-display flex items-center gap-2">
            <Zap className="text-neon-cyan" /> Player Card
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Customize your arcade persona
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)]">
          <div className="p-5 space-y-6">

            {/* ─── Avatar Preview Card ─── */}
            <div className="relative flex flex-col items-center p-6 bg-gradient-to-br from-black/40 via-card/50 to-black/40 rounded-2xl border border-white/10">
              {/* Animated frame around avatar */}
              <div className={`relative ${activeFrame.animation}`}>
                {activeFrame.gradient && (
                  <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${activeFrame.gradient} blur-md opacity-60`} />
                )}
                <Avatar className={`w-24 h-24 border-4 ${activeFrame.borderClass} relative z-10 shadow-2xl transition-all duration-500`}>
                  <AvatarImage src={avatarUrl || undefined} />
                  <AvatarFallback className="bg-gradient-to-br from-neon-pink via-neon-purple to-neon-cyan text-white font-bold text-3xl">
                    {primaryWallet?.address?.slice(0, 2) || '?'}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-1 -right-1 z-20 w-8 h-8 rounded-full bg-neon-cyan flex items-center justify-center text-black hover:bg-neon-green transition-all hover:scale-110 shadow-lg shadow-neon-cyan/40"
                >
                  {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>

              {/* Name + Badge */}
              <div className="mt-4 text-center">
                <p className="font-display text-lg" style={{ color: activeTheme.primary }}>
                  {primaryWallet?.address?.slice(0, 6)}...{primaryWallet?.address?.slice(-4)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1">
                  {activeBadge && activeBadge.icon && (
                    <Badge className={`${activeBadge.color} border-0 text-xs gap-1`}>
                      <activeBadge.icon size={12} /> {activeBadge.name}
                    </Badge>
                  )}
                  <Badge className="bg-white/10 text-white/60 border-0 text-[10px] capitalize">
                    {playerTier} Pass
                  </Badge>
                </div>
              </div>

              {/* Quick Stats Row */}
              {loadingStats ? (
                <div className="grid grid-cols-4 gap-3 mt-4 w-full">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-3 mt-4 w-full">
                  {[
                    { emoji: '🎮', val: stats.totalMatches, label: 'Matches' },
                    { emoji: '🏆', val: stats.tournamentsWon, label: 'Wins' },
                    { emoji: '💎', val: `${stats.winRate}%`, label: 'Win Rate' },
                    { emoji: '🔥', val: stats.currentStreak, label: 'Streak' },
                  ].map(s => (
                    <div key={s.label} className="text-center p-2 rounded-xl bg-black/30 border border-white/5">
                      <div className="text-lg">{s.emoji}</div>
                      <div className="text-sm font-bold" style={{ color: activeTheme.primary }}>{s.val}</div>
                      <div className="text-[10px] text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Extended Stats */}
              {!loadingStats && (
                <div className="grid grid-cols-3 gap-3 mt-3 w-full">
                  <div className="text-center p-2 rounded-xl bg-black/30 border border-white/5">
                    <div className="text-sm font-bold text-neon-green">${stats.totalUSDCWon.toFixed(2)}</div>
                    <div className="text-[10px] text-muted-foreground">USDC Won</div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-black/30 border border-white/5">
                    <div className="text-sm font-bold text-neon-purple">{stats.ranking ? `#${stats.ranking}` : '—'}</div>
                    <div className="text-[10px] text-muted-foreground">Ranking</div>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-black/30 border border-white/5">
                    <div className="text-sm font-bold text-neon-cyan">{balance.cctr_balance.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">CCC</div>
                  </div>
                </div>
              )}
            </div>

            {/* ─── Customization Tabs ─── */}
            <Tabs defaultValue="frames" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/30 rounded-xl h-10">
                <TabsTrigger value="frames" className="text-xs font-display data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan rounded-lg">🖼 Frames</TabsTrigger>
                <TabsTrigger value="badges" className="text-xs font-display data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink rounded-lg">🏅 Badges</TabsTrigger>
                <TabsTrigger value="themes" className="text-xs font-display data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple rounded-lg">🎨 Themes</TabsTrigger>
              </TabsList>

              {/* Animated Frames */}
              <TabsContent value="frames" className="mt-4">
                <div className="grid grid-cols-3 gap-3">
                  {ANIMATED_FRAMES.map(frame => {
                    const locked = !canUseTier(frame.tier);
                    return (
                      <button
                        key={frame.id}
                        onClick={() => !locked && setSelectedFrame(frame.id)}
                        disabled={locked}
                        className={`relative p-3 rounded-xl border text-center transition-all duration-300 ${
                          selectedFrame === frame.id
                            ? 'border-neon-cyan bg-neon-cyan/10 scale-105 shadow-lg shadow-neon-cyan/20'
                            : locked
                            ? 'border-white/5 bg-black/20 opacity-40 cursor-not-allowed'
                            : 'border-white/10 bg-black/20 hover:border-white/30 hover:bg-black/30'
                        }`}
                      >
                        <div className={`w-10 h-10 mx-auto rounded-full border-2 ${frame.borderClass} ${frame.animation} mb-2`}>
                          {frame.gradient && (
                            <div className={`w-full h-full rounded-full bg-gradient-to-r ${frame.gradient} opacity-40`} />
                          )}
                        </div>
                        <p className="text-[11px] font-medium">{frame.name}</p>
                        <p className="text-[9px] text-muted-foreground capitalize">{frame.tier}</p>
                        {locked && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                            <span className="text-[10px] text-muted-foreground">🔒</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Display Badges */}
              <TabsContent value="badges" className="mt-4">
                <div className="grid grid-cols-3 gap-3">
                  {DISPLAY_BADGES.map(badge => (
                    <button
                      key={badge.id}
                      onClick={() => setSelectedBadge(badge.id)}
                      className={`p-3 rounded-xl border text-center transition-all duration-300 ${
                        selectedBadge === badge.id
                          ? 'border-neon-pink bg-neon-pink/10 scale-105 shadow-lg shadow-neon-pink/20'
                          : 'border-white/10 bg-black/20 hover:border-white/30 hover:bg-black/30'
                      }`}
                    >
                      <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center mb-2 ${badge.color || 'bg-white/10'}`}>
                        {badge.icon ? <badge.icon size={18} /> : <span className="text-muted-foreground text-sm">—</span>}
                      </div>
                      <p className="text-[11px] font-medium">{badge.name}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* Profile Themes */}
              <TabsContent value="themes" className="mt-4">
                <div className="grid grid-cols-2 gap-3">
                  {PROFILE_THEMES.map(theme => (
                    <button
                      key={theme.id}
                      onClick={() => setSelectedTheme(theme.id)}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 ${
                        selectedTheme === theme.id
                          ? 'border-white/40 bg-white/10 scale-105 shadow-lg'
                          : 'border-white/10 bg-black/20 hover:border-white/30 hover:bg-black/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-4 h-4 rounded-full" style={{ background: theme.primary }} />
                        <div className="w-4 h-4 rounded-full" style={{ background: theme.secondary }} />
                        <div className="w-4 h-4 rounded-full" style={{ background: theme.accent }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: theme.primary }}>{theme.name}</p>
                    </button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Save button */}
            <Button
              className="w-full cyber-button h-12 text-sm font-display tracking-wider"
              onClick={() => {
                toast({ title: 'Profile saved! ✨', description: 'Your identity has been updated.' });
                onOpenChange(false);
              }}
            >
              💾 SAVE IDENTITY
            </Button>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
