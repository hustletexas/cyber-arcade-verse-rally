import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Camera, Loader2, Trophy, Gamepad2, Flame, Crown, Star, Shield, Zap, Target, Swords, ArrowLeft, Check, MapPin, ChevronDown, User, Wallet, LifeBuoy, Settings, Sparkles, Medal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// ─── Animated Frame Definitions ───
const ANIMATED_FRAMES = [
  { id: 'none', name: 'Basic Neon', tier: 'guest', borderClass: 'border-neon-cyan/40', gradient: '', preview: '🔲' },
  { id: 'circuit-glow', name: 'Circuit Glow', tier: 'common', borderClass: 'border-neon-green', gradient: 'from-neon-green via-emerald-500 to-neon-cyan', preview: '⚡' },
  { id: 'skyline-pulse', name: 'Skyline Pulse', tier: 'rare', borderClass: 'border-neon-cyan', gradient: 'from-neon-cyan via-blue-500 to-neon-purple', preview: '🌃' },
  { id: 'pro-pass', name: 'Pro Pass', tier: 'epic', borderClass: 'border-neon-purple', gradient: 'from-neon-purple via-neon-pink to-neon-cyan', preview: '💎' },
];

// ─── Avatar Presets ───
const AVATAR_PRESETS = [
  { id: 'skull-hustler', name: 'Skull Hustler', emoji: '💀' },
  { id: 'shadow-hacker', name: 'Shadow Hacker', emoji: '🥷' },
  { id: 'retro-helmet', name: 'Retro Helmet', emoji: '🪖' },
  { id: 'ethereal', name: 'Ethereal', emoji: '👻' },
];

// ─── Display Badges ───
const DISPLAY_BADGES = [
  { id: 'founder', name: 'Founder', icon: Star, color: 'text-yellow-400 bg-yellow-400/20 border-yellow-400/40' },
  { id: 'og-player', name: 'OG Player', icon: Crown, color: 'text-neon-purple bg-neon-purple/20 border-neon-purple/40' },
  { id: 'tournament-champ', name: 'Champ', icon: Trophy, color: 'text-neon-cyan bg-neon-cyan/20 border-neon-cyan/40' },
  { id: 'arcade-master', name: 'Master', icon: Gamepad2, color: 'text-neon-green bg-neon-green/20 border-neon-green/40' },
  { id: 'streak-king', name: 'Streak', icon: Flame, color: 'text-orange-400 bg-orange-400/20 border-orange-400/40' },
  { id: 'guardian', name: 'Guardian', icon: Shield, color: 'text-blue-400 bg-blue-400/20 border-blue-400/40' },
];

// ─── Title Options ───
const TITLE_OPTIONS = [
  'Arcade Founder', 'Pro Gamer', 'Streak King', 'Tournament Champ', 'Night Owl', 'Cyber Punk', 'Shadow Lord'
];

// ─── Profile Themes ───
const PROFILE_THEMES = [
  { id: 'cyber-grid', name: 'Cyber Grid', primary: '#00ffff', secondary: '#bf00ff', gradient: 'from-cyan-900/40 via-blue-900/30 to-purple-900/40' },
  { id: 'neon-smoke', name: 'Neon Smoke', primary: '#ff0055', secondary: '#ff6600', gradient: 'from-pink-900/40 via-red-900/30 to-orange-900/40' },
  { id: 'arcade-scanlines', name: 'Arcade Scanlines', primary: '#39ff14', secondary: '#00ff88', gradient: 'from-green-900/40 via-emerald-900/30 to-cyan-900/40' },
  { id: 'space-portals', name: 'Space Portals', primary: '#9900ff', secondary: '#ff00ff', gradient: 'from-purple-900/40 via-indigo-900/30 to-pink-900/40' },
];

// ─── Sidebar Sections ───
type Section = 'profile' | 'account' | 'wallet' | 'support';

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
  const [activeSection, setActiveSection] = useState<Section>('profile');
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [selectedBadges, setSelectedBadges] = useState<string[]>(['founder', 'og-player']);
  const [selectedTheme, setSelectedTheme] = useState('cyber-grid');
  const [selectedTitle, setSelectedTitle] = useState('Arcade Founder');
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [pronouns, setPronouns] = useState('He/Him');
  const [location, setLocation] = useState('');
  const [verifiedCompetitor, setVerifiedCompetitor] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [playerTier, setPlayerTier] = useState('guest');
  const [stats, setStats] = useState({ totalMatches: 0, tournamentsWon: 0, winRate: 0, totalUSDCWon: 0, currentStreak: 0, ranking: null as number | null });
  const [loadingStats, setLoadingStats] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!primaryWallet?.address) return;
    setLoadingStats(true);
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('wallet_address', primaryWallet.address).maybeSingle();
      if (profile?.username) setDisplayName(profile.username);

      const { data: nftData } = await supabase.from('nft_purchases').select('nft_name').eq('wallet_address', primaryWallet.address).eq('status', 'completed').ilike('nft_name', '%pass%').order('created_at', { ascending: false }).limit(1);
      let tier = 'guest';
      if (nftData?.length) {
        const name = nftData[0].nft_name.toLowerCase();
        if (name.includes('legendary')) tier = 'legendary';
        else if (name.includes('epic')) tier = 'epic';
        else if (name.includes('rare')) tier = 'rare';
        else tier = 'common';
      }
      setPlayerTier(tier);

      const [matchesRes, standingsRes, payoutsRes, weeklyRes] = await Promise.all([
        supabase.from('tournament_matches').select('id, winner_wallet', { count: 'exact' }).or(`player_a_wallet.eq.${primaryWallet.address},player_b_wallet.eq.${primaryWallet.address}`),
        supabase.from('tournament_standings').select('placement, wins, losses').eq('wallet_address', primaryWallet.address),
        supabase.from('tournament_payouts').select('amount_usdc, amount_usd').eq('wallet_address', primaryWallet.address).eq('status', 'paid'),
        supabase.from('weekly_reward_distributions').select('placement').eq('wallet_address', primaryWallet.address).order('week_start', { ascending: false }).limit(1),
      ]);

      const totalMatches = matchesRes.count ?? 0;
      const matchWins = matchesRes.data?.filter(m => m.winner_wallet === primaryWallet.address).length ?? 0;
      const tournamentsWon = standingsRes.data?.filter(s => s.placement === 1).length ?? 0;
      const winRate = totalMatches > 0 ? Math.round((matchWins / totalMatches) * 100) : 0;
      const totalUSDCWon = payoutsRes.data?.reduce((s, p) => s + (p.amount_usdc ?? p.amount_usd ?? 0), 0) ?? 0;
      const totalWins = standingsRes.data?.reduce((s, r) => s + (r.wins ?? 0), 0) ?? 0;
      const totalLosses = standingsRes.data?.reduce((s, r) => s + (r.losses ?? 0), 0) ?? 0;

      setStats({ totalMatches, tournamentsWon, winRate, totalUSDCWon, currentStreak: Math.max(0, totalWins - totalLosses), ranking: weeklyRes.data?.[0]?.placement ?? null });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoadingStats(false);
    }
  }, [primaryWallet?.address]);

  useEffect(() => { if (open) loadProfile(); }, [open, loadProfile]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !primaryWallet?.address) return;
    if (!file.type.startsWith('image/')) { toast({ title: 'Invalid file', description: 'Please select an image.', variant: 'destructive' }); return; }
    if (file.size > 2 * 1024 * 1024) { toast({ title: 'Too large', description: 'Max 2MB.', variant: 'destructive' }); return; }
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
      if (existing) { await supabase.from('profiles').update({ avatar_url: newUrl, updated_at: new Date().toISOString() }).eq('id', existing.id); }
      else { await supabase.from('profiles').insert({ id: crypto.randomUUID(), wallet_address: primaryWallet.address, avatar_url: newUrl }); }
      onAvatarChange(newUrl);
      toast({ title: 'Avatar updated! 🎨' });
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const toggleBadge = (id: string) => {
    setSelectedBadges(prev => prev.includes(id) ? prev.filter(b => b !== id) : prev.length < 6 ? [...prev, id] : prev);
  };

  const canUseTier = (requiredTier: string) => TIER_ORDER.indexOf(playerTier) >= TIER_ORDER.indexOf(requiredTier);
  const activeFrame = ANIMATED_FRAMES.find(f => f.id === selectedFrame) || ANIMATED_FRAMES[0];
  const activeTheme = PROFILE_THEMES.find(t => t.id === selectedTheme) || PROFILE_THEMES[0];
  const walletName = displayName || `${primaryWallet?.address?.slice(0, 6)}...${primaryWallet?.address?.slice(-4)}`;

  const sidebarItems: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'support', label: 'Support', icon: LifeBuoy },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-transparent border-0 p-0 max-w-3xl shadow-none max-h-[95vh] overflow-hidden [&>button]:hidden">
        <div className="relative rounded-2xl overflow-hidden border border-neon-cyan/30 shadow-[0_0_40px_rgba(6,182,212,0.15),0_0_80px_rgba(6,182,212,0.05)]">
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-neon-cyan/20 via-neon-purple/10 to-neon-green/20 pointer-events-none" />
          
          <div className="relative bg-background/98 backdrop-blur-xl rounded-2xl">
            {/* ═══ Header ═══ */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neon-cyan/10">
              <div className="flex items-center gap-3">
                <button onClick={() => onOpenChange(false)} className="text-neon-cyan hover:text-neon-green transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-display text-foreground tracking-wide">Customize Profile</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="cyber-button px-5 h-9 text-xs font-display tracking-wider"
                  onClick={() => {
                    toast({ title: 'Profile saved! ✨', description: 'Your identity has been updated.' });
                    onOpenChange(false);
                  }}
                >
                  Save Changes
                </Button>
                <Button size="sm" variant="outline" className="border-white/20 h-9 text-xs hover:bg-white/5" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
              </div>
            </div>

            <div className="flex min-h-[520px] max-h-[calc(95vh-64px)]">
              {/* ═══ Sidebar ═══ */}
              <div className="w-44 shrink-0 border-r border-white/5 p-3 space-y-1 hidden md:block">
                <p className="text-[10px] uppercase tracking-widest text-neon-cyan/60 font-display px-2 mb-2">✅ Edit Profile</p>
                {sidebarItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
                      activeSection === item.id
                        ? "bg-neon-cyan/10 text-neon-cyan font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                  >
                    <item.icon size={14} />
                    {item.label}
                  </button>
                ))}

                {/* Sidebar Avatar Preview */}
                <div className="mt-6 p-3 rounded-xl border border-white/10 bg-black/20">
                  <div className="relative mx-auto w-16 h-16">
                    {activeFrame.gradient && <div className={`absolute -inset-1 rounded-lg bg-gradient-to-r ${activeFrame.gradient} blur-sm opacity-60`} />}
                    <Avatar className={`w-16 h-16 border-2 ${activeFrame.borderClass} relative z-10 rounded-lg`}>
                      <AvatarImage src={avatarUrl || undefined} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-cyan text-white font-bold text-xl rounded-lg">
                        {walletName.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full mt-2 text-[10px] text-neon-cyan hover:text-neon-green transition-colors border border-neon-cyan/20 rounded-lg py-1.5 hover:bg-neon-cyan/5"
                  >
                    Edit Avatar
                  </button>
                </div>

                {/* Sidebar Frame Selection */}
                <div className="mt-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-2">Avatar & Frame</p>
                  {ANIMATED_FRAMES.map(frame => {
                    const locked = !canUseTier(frame.tier);
                    return (
                      <button
                        key={frame.id}
                        onClick={() => !locked && setSelectedFrame(frame.id)}
                        disabled={locked}
                        className={cn(
                          "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-[11px] transition-all",
                          selectedFrame === frame.id ? "bg-neon-green/10 text-neon-green border border-neon-green/30" : locked ? "text-muted-foreground/40 cursor-not-allowed" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                      >
                        {selectedFrame === frame.id && <Check size={10} className="text-neon-green" />}
                        <span className={cn("w-3 h-3 rounded-sm border", frame.gradient ? `bg-gradient-to-r ${frame.gradient}` : "border-white/20")} />
                        {frame.name}
                        {locked && <span className="ml-auto text-[9px]">🔒</span>}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => onOpenChange(false)} className="w-full flex items-center gap-2 px-3 py-2 mt-4 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all">
                  <ArrowLeft size={14} /> Back
                </button>
              </div>

              {/* ═══ Main Content ═══ */}
              <ScrollArea className="flex-1">
                <div className="p-5 space-y-5">
                  
                  {/* ─── Live Player Card Preview ─── */}
                  <div className={cn(
                    "relative rounded-xl overflow-hidden border border-neon-cyan/20",
                    "bg-gradient-to-br", activeTheme.gradient
                  )}>
                    {/* Scanline overlay */}
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.03)_2px,rgba(0,0,0,0.03)_4px)] pointer-events-none" />
                    
                    <div className="relative flex items-start gap-4 p-4">
                      {/* Avatar in card */}
                      <div className="relative shrink-0">
                        {activeFrame.gradient && <div className={`absolute -inset-1.5 rounded-xl bg-gradient-to-r ${activeFrame.gradient} blur-sm opacity-70 ${!reduceMotion ? 'animate-pulse' : ''}`} />}
                        <Avatar className={`w-20 h-20 border-2 ${activeFrame.borderClass} relative z-10 rounded-xl shadow-2xl`}>
                          <AvatarImage src={avatarUrl || undefined} className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-neon-purple to-neon-cyan text-white font-bold text-2xl rounded-xl">
                            {walletName.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-display font-bold text-foreground truncate">{walletName}</h2>
                          <div className="flex items-center gap-1">
                            <Sparkles size={14} className="text-yellow-400" />
                            <span className="text-sm font-bold text-yellow-400">{stats.ranking ? stats.ranking : 125}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">{tagline || 'Grind Now, Shine Later'}</p>
                        
                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-[10px] gap-1 px-2">
                            <Zap size={10} /> {selectedTitle}
                          </Badge>
                          <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/30 text-[10px] gap-1 px-2">
                            🛡 Pro Pass
                          </Badge>
                          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30 text-[10px] px-2">
                            💲{balance.cctr_balance.toFixed(1)}
                          </Badge>
                        </div>

                        {/* Level & XP */}
                        <div className="flex items-center gap-3">
                          <Badge className="bg-neon-pink/20 text-neon-pink border-neon-pink/30 text-[10px] font-bold px-2">
                            Lv {Math.max(1, Math.floor(stats.totalMatches / 5) + 1)}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-neon-green/60" />
                            <span className="text-xs text-muted-foreground">{(stats.totalMatches * 280).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ─── Avatar & Frame Gallery ─── */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-display font-bold text-foreground">Avatar & Frame</h3>
                    <div className="flex items-center gap-3 overflow-x-auto pb-2">
                      {/* Upload button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-neon-cyan/30 flex flex-col items-center justify-center gap-1 hover:border-neon-cyan/60 hover:bg-neon-cyan/5 transition-all"
                      >
                        {uploading ? <Loader2 size={16} className="animate-spin text-neon-cyan" /> : <Camera size={16} className="text-neon-cyan" />}
                        <span className="text-[9px] text-muted-foreground">Edit</span>
                      </button>
                      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />

                      {/* Preset avatars */}
                      {AVATAR_PRESETS.map(preset => (
                        <div key={preset.id} className="shrink-0 text-center">
                          <div className="w-16 h-16 rounded-xl border border-white/10 bg-black/30 flex items-center justify-center text-2xl hover:border-neon-cyan/40 hover:bg-black/40 cursor-pointer transition-all">
                            {preset.emoji}
                          </div>
                          <p className="text-[9px] text-muted-foreground mt-1 truncate w-16">{preset.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ─── Display Identity ─── */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-display font-bold text-foreground">Display Identity</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Display Name</label>
                        <input
                          value={displayName}
                          onChange={e => setDisplayName(e.target.value)}
                          placeholder="YourName"
                          className="w-full mt-1 px-3 py-2 text-sm rounded-lg bg-black/30 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-neon-cyan/40 focus:outline-none focus:ring-1 focus:ring-neon-cyan/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Tagline</label>
                        <input
                          value={tagline}
                          onChange={e => setTagline(e.target.value)}
                          placeholder="Grind Now, Shine Later"
                          className="w-full mt-1 px-3 py-2 text-sm rounded-lg bg-black/30 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-neon-cyan/40 focus:outline-none focus:ring-1 focus:ring-neon-cyan/20 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Pronouns</label>
                        <div className="relative mt-1">
                          <select
                            value={pronouns}
                            onChange={e => setPronouns(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg bg-black/30 border border-white/10 text-foreground appearance-none focus:border-neon-cyan/40 focus:outline-none cursor-pointer"
                          >
                            <option value="He/Him">He/Him</option>
                            <option value="She/Her">She/Her</option>
                            <option value="They/Them">They/Them</option>
                            <option value="Other">Other</option>
                          </select>
                          <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <MapPin size={10} /> Location
                        </label>
                        <input
                          value={location}
                          onChange={e => setLocation(e.target.value)}
                          placeholder="City, State"
                          className="w-full mt-1 px-3 py-2 text-sm rounded-lg bg-black/30 border border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-neon-cyan/40 focus:outline-none focus:ring-1 focus:ring-neon-cyan/20 transition-all"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Check size={10} /> Verified Competitor
                      </span>
                      <Switch checked={verifiedCompetitor} onCheckedChange={setVerifiedCompetitor} className="data-[state=checked]:bg-neon-green" />
                    </div>
                  </div>

                  {/* ─── Title & Badges ─── */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-display font-bold text-foreground">Title & Badges</h3>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-shrink-0">
                        <select
                          value={selectedTitle}
                          onChange={e => setSelectedTitle(e.target.value)}
                          className="px-3 py-2 text-sm rounded-lg bg-black/30 border border-white/10 text-foreground appearance-none pr-8 focus:border-neon-cyan/40 focus:outline-none cursor-pointer"
                        >
                          {TITLE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                      </div>
                      <div className="flex items-center gap-1.5 overflow-x-auto">
                        {DISPLAY_BADGES.map(badge => {
                          const isSelected = selectedBadges.includes(badge.id);
                          return (
                            <button
                              key={badge.id}
                              onClick={() => toggleBadge(badge.id)}
                              className={cn(
                                "relative w-9 h-9 rounded-lg flex items-center justify-center border transition-all shrink-0",
                                isSelected ? `${badge.color} border-current` : "border-white/10 bg-black/20 text-muted-foreground hover:border-white/20"
                              )}
                            >
                              <badge.icon size={16} />
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-neon-green flex items-center justify-center">
                                  <Check size={8} className="text-black" />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ─── Theme ─── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-display font-bold text-foreground">Theme</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Reduce Motion</span>
                        <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {PROFILE_THEMES.map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => setSelectedTheme(theme.id)}
                          className={cn(
                            "relative rounded-xl border overflow-hidden transition-all aspect-[4/3]",
                            selectedTheme === theme.id ? "border-neon-cyan ring-1 ring-neon-cyan/30 scale-105" : "border-white/10 hover:border-white/30"
                          )}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient}`} />
                          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)]" />
                          {selectedTheme === theme.id && (
                            <div className="absolute top-1 left-1 w-4 h-4 rounded bg-neon-cyan flex items-center justify-center">
                              <Check size={10} className="text-black" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      {PROFILE_THEMES.map(theme => (
                        <p key={theme.id} className="text-[9px] text-muted-foreground text-center">{theme.name}</p>
                      ))}
                    </div>
                  </div>

                  {/* ─── Community Note ─── */}
                  <p className="text-[10px] text-muted-foreground/60 text-center leading-relaxed">
                    Following Cyber City's community rules is required. Offensive avatars, names, or provocative content will be moderated.
                  </p>

                  {/* Mobile save button */}
                  <Button
                    className="w-full cyber-button h-11 text-sm font-display tracking-wider md:hidden"
                    onClick={() => {
                      toast({ title: 'Profile saved! ✨', description: 'Your identity has been updated.' });
                      onOpenChange(false);
                    }}
                  >
                    💾 Save Changes
                  </Button>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
