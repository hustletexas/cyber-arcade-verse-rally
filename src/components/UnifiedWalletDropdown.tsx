import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useWalletBalances, formatBalance, StellarAsset } from '@/hooks/useWalletBalances';
import { useTransactionHistory, formatTxHash, getExplorerUrl, Transaction } from '@/hooks/useTransactionHistory';
import { useWinnerChests } from '@/hooks/useWinnerChests';
import { Wallet, LogOut, ChevronDown, ChevronUp, ArrowUpRight, ArrowDownLeft, CreditCard, Copy, Settings, QrCode, Gift, Headphones, User, Sparkles, ExternalLink, ArrowLeftRight, RefreshCw, Loader2, Clock, CheckCircle2, XCircle, History, Trophy, Package, HelpCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { WalletConnectionModal } from './WalletConnectionModal';
import { ChainType, WalletType } from '@/types/wallet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StellarSwap } from '@/components/dex/StellarSwap';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProfileIdentityModal } from './ProfileIdentityModal';
export const UnifiedWalletDropdown = () => {
  const {
    user,
    signOut
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const {
    balance
  } = useUserBalance();
  const {
    connectedWallets,
    primaryWallet,
    isWalletConnected,
    hasMultipleWallets,
    hasMultipleChains,
    connectWallet,
    disconnectWallet,
    switchPrimaryWallet,
    getWalletIcon,
    getChainIcon
  } = useMultiWallet();
  const {
    balances,
    isLoading: balancesLoading,
    refreshBalances,
    getStellarAssets
  } = useWalletBalances(connectedWallets);
  const {
    transactions,
    isLoading: txLoading,
    refreshHistory
  } = useTransactionHistory(connectedWallets);
  const {
    logoutWallet
  } = useWalletAuth();
  const {
    eligibleChests,
    isLoading: chestsLoading,
    hasUnclaimedChests,
    unclaimedCount,
    claimChest,
    fetchEligibility
  } = useWinnerChests();
  const [showWalletManager, setShowWalletManager] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeAction, setActiveAction] = useState<'buy' | 'send' | 'receive' | 'swap'>('buy');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [buyCurrency, setBuyCurrency] = useState<'usdc' | 'xlm'>('usdc');
  const [tokensMinimized, setTokensMinimized] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Load avatar from profiles table on wallet connect
  React.useEffect(() => {
    const loadAvatar = async () => {
      if (!primaryWallet?.address) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('wallet_address', primaryWallet.address)
          .maybeSingle();
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      } catch (err) {
        console.error('Failed to load avatar:', err);
      }
    };
    loadAvatar();
  }, [primaryWallet?.address]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !primaryWallet?.address) {
      if (!primaryWallet?.address) {
        toast({ title: 'Wallet required', description: 'Please connect your wallet first.', variant: 'destructive' });
      }
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file.', variant: 'destructive' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Max size is 2MB.', variant: 'destructive' });
      return;
    }

    setUploadingAvatar(true);
    try {
      const walletAddr = primaryWallet.address;
      const ext = file.name.split('.').pop();
      // Use a hash of wallet address for the folder to keep it clean
      const folderName = walletAddr.slice(0, 16);
      const filePath = `${folderName}/avatar.${ext}`;

      // Upload with upsert to replace existing
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Try to update existing profile, or insert a new one
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('wallet_address', walletAddr)
        .maybeSingle();

      if (existingProfile) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ avatar_url: newUrl, updated_at: new Date().toISOString() })
          .eq('id', existingProfile.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: crypto.randomUUID(),
            wallet_address: walletAddr,
            avatar_url: newUrl,
          });
        if (insertError) throw insertError;
      }

      setAvatarUrl(newUrl);
      toast({ title: 'Avatar updated!', description: 'Your profile picture has been changed.' });
    } catch (err: any) {
      console.error('Avatar upload error:', err);
      toast({ title: 'Upload failed', description: err.message || 'Could not upload avatar.', variant: 'destructive' });
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };
  const handleSignOut = async () => {
    try {
      if (isWalletConnected) {
        await logoutWallet();
      }
      await signOut();
      for (const wallet of connectedWallets) {
        await disconnectWallet(wallet.type);
      }
      toast({
        title: "Goodbye!",
        description: "Successfully logged out"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive"
      });
    }
  };
  const copyAddress = async () => {
    if (primaryWallet?.address) {
      await navigator.clipboard.writeText(primaryWallet.address);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard"
      });
    }
  };
  const handleOpenAction = (action: 'buy' | 'send' | 'receive') => {
    setActiveAction(action);
    setShowActionsModal(true);
  };
  const handleClaimRewards = () => {
    toast({
      title: "Claiming Rewards",
      description: `Claiming ${balance.claimable_rewards.toLocaleString()} CCC...`
    });
    
  };
  const handleSupport = () => {
    window.open('https://discord.gg/cybercityarcade', '_blank');
  };
  const handleSend = () => {
    if (!sendAmount || !sendAddress) {
      toast({
        title: "Missing Info",
        description: "Please enter amount and recipient address",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Transaction Initiated",
      description: `Sending ${sendAmount} SOL to ${sendAddress.slice(0, 8)}...`
    });
    setSendAmount('');
    setSendAddress('');
    setShowActionsModal(false);
  };
  const handleBuy = () => {
    toast({
      title: "Redirecting",
      description: "Opening payment processor..."
    });
    setShowActionsModal(false);
  };
  const socialLinks = [{
    name: 'X',
    icon: '𝕏',
    url: 'https://x.com/stellarhustle_',
    color: 'hover:bg-white/20 hover:shadow-white/20'
  }, {
    name: 'Email',
    icon: '💬',
    url: 'mailto:cybercityarcade@gmail.com',
    color: 'hover:bg-indigo-500/30 hover:shadow-indigo-500/20'
  }, {
    name: 'Discord',
    icon: '🎮',
    url: 'https://discord.gg/83vpV7NBUU',
    color: 'hover:bg-indigo-500/30 hover:shadow-indigo-500/20'
  }, {
    name: 'YouTube',
    icon: '▶️',
    url: 'https://www.youtube.com/@Stellarhustle',
    color: 'hover:bg-red-500/30 hover:shadow-red-500/20'
  }];
  if (!isWalletConnected) {
    return <>
        <Button onClick={() => setShowWalletManager(true)} className="relative overflow-hidden group h-8 px-4 rounded-xl bg-neon-cyan text-white text-xs font-bold border-0 shadow-lg shadow-neon-cyan/30 hover:shadow-neon-cyan/50 transition-all duration-500 hover:scale-105 active:scale-95">
          <span className="relative z-10 flex items-center gap-1.5">
            <Wallet size={14} className="animate-pulse" />
            Connect
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-green to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
        </Button>
        
        <WalletConnectionModal isOpen={showWalletManager} onClose={() => setShowWalletManager(false)} onWalletConnected={(walletType, address) => {
        connectWallet(walletType as any, address);
        setShowWalletManager(false);
      }} />
      </>;
  }
  return <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="relative h-11 px-4 rounded-2xl bg-gradient-to-r from-card via-card/90 to-card/80 border border-neon-cyan/30 hover:border-neon-cyan hover:shadow-xl hover:shadow-neon-cyan/30 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] group">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-8 h-8 border-2 border-neon-cyan/50 transition-all duration-300 group-hover:border-neon-cyan group-hover:shadow-lg group-hover:shadow-neon-cyan/30">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-neon-pink to-neon-purple text-white text-xs font-bold">
                    {getWalletIcon(primaryWallet?.type || 'lobstr')}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-neon-green rounded-full border-2 border-background animate-pulse" />
              </div>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs text-neon-cyan font-medium transition-all group-hover:text-neon-green">
                  {primaryWallet?.address.slice(0, 4)}...{primaryWallet?.address.slice(-4)}
                </span>
                <span className="text-[10px] text-neon-green font-bold flex items-center gap-1">
                  <Sparkles size={8} className="animate-pulse" />
                  {balance.cctr_balance.toLocaleString()} CCC
                </span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground transition-transform duration-300 group-hover:rotate-180" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent align="end" sideOffset={8} className="w-[340px] p-0 bg-background/98 backdrop-blur-xl border border-neon-cyan/30 rounded-3xl shadow-2xl shadow-neon-cyan/20 overflow-hidden animate-fade-in">
          {/* Header with wallet info */}
          <div className="p-5 bg-gradient-to-br from-neon-pink/15 via-neon-purple/10 to-neon-cyan/15 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:400%_400%] animate-shimmer" />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12 border-2 border-neon-cyan/60 shadow-xl shadow-neon-cyan/30 transition-transform hover:scale-110 duration-300">
                      <AvatarImage src={user?.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-neon-pink via-neon-purple to-neon-cyan text-white font-bold text-lg">
                        {user?.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-background flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
                    </p>
                    <button onClick={copyAddress} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-neon-cyan transition-all duration-200 hover:scale-105">
                      {primaryWallet?.address.slice(0, 6)}...{primaryWallet?.address.slice(-4)}
                      <Copy size={10} />
                    </button>
                  </div>
                </div>
                <Badge className="bg-neon-green/20 text-neon-green border-0 font-bold capitalize px-3 py-1 shadow-lg shadow-neon-green/20">
                  {primaryWallet?.type}
                </Badge>
              </div>
              
              {/* Balance display with Stellar tokens */}
              <div className="p-4 bg-card/70 backdrop-blur-sm rounded-2xl border border-neon-cyan/20 shadow-inner space-y-3">
                {/* CCTR and Claimable row */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">CCC Balance</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
                      {balance.cctr_balance.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Claimable</p>
                    <p className="text-xl font-bold text-neon-pink animate-pulse">{balance.claimable_rewards.toLocaleString()}</p>
                    {balance.claimable_rewards > 0 && <Button size="sm" onClick={() => navigate('/rewards')} className="mt-1 h-6 px-2 text-[10px] bg-neon-pink/20 text-neon-pink hover:bg-neon-pink hover:text-black border-0 rounded-lg transition-all hover:scale-105">
                        Claim
                      </Button>}
                  </div>
                </div>
                
                {/* Stellar Token Balances */}
                {primaryWallet && (() => {
                const stellarAssets = getStellarAssets(primaryWallet.address);
                if (stellarAssets.length > 0) {
                  return <div className="pt-3 border-t border-neon-cyan/10">
                        <div className="flex items-center justify-between mb-2">
                      <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                              Stellar Tokens
                              <Badge variant="outline" className="text-[8px] border-neon-cyan/30 text-neon-cyan px-1 py-0">
                                {getChainIcon()} STELLAR
                              </Badge>
                            </p>
                            <p className="text-sm font-bold text-white mt-0.5">
                              {formatBalance(stellarAssets.find(a => a.code === 'XLM')?.balance || 0, 4)} XLM
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => refreshBalances()}
                              disabled={balancesLoading}
                              className="h-5 w-5 p-0 hover:bg-neon-cyan/20"
                            >
                              {balancesLoading ? <Loader2 size={10} className="animate-spin text-neon-cyan" /> : <RefreshCw size={10} className="text-neon-cyan hover:rotate-180 transition-transform duration-500" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setTokensMinimized(!tokensMinimized)}
                              className="h-5 w-5 p-0 text-muted-foreground hover:text-white hover:bg-white/10"
                            >
                              {tokensMinimized ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                            </Button>
                          </div>
                        </div>
                        {!tokensMinimized && (
                          <div className="space-y-1.5">
                            {stellarAssets.map((asset, idx) => <div key={`${asset.code}-${asset.issuer || 'native'}-${idx}`} className="flex items-center justify-between p-2 bg-black/30 rounded-lg border border-white/5 hover:border-white/15 transition-all">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-neon-cyan">
                                    {asset.code === 'XLM' ? '✦' : '◆'} {asset.code}
                                  </span>
                                  {asset.code === 'XLM' && (
                                    <span className="text-[9px] text-muted-foreground">
                                      {primaryWallet.address.slice(0, 4)}...{primaryWallet.address.slice(-4)}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-white">
                                  {formatBalance(asset.balance, asset.code === 'XLM' ? 4 : 4)}
                                </span>
                              </div>)}
                          </div>
                        )}
                      </div>;
                }
                return null;
              })()}
              </div>
            </div>
          </div>

          {/* Action buttons - Buy, Send, Receive, Swap */}
          <div className="p-4 grid grid-cols-4 gap-2">
            {[{
            action: 'buy' as const,
            icon: CreditCard,
            label: 'Buy',
            gradient: 'from-neon-green/25 to-neon-cyan/25',
            hoverGradient: 'hover:from-neon-green/40 hover:to-neon-cyan/40',
            color: 'text-neon-green',
            border: 'border-neon-green/40',
            isSwap: false
          }, {
            action: 'send' as const,
            icon: ArrowUpRight,
            label: 'Send',
            gradient: 'from-neon-pink/25 to-neon-purple/25',
            hoverGradient: 'hover:from-neon-pink/40 hover:to-neon-purple/40',
            color: 'text-neon-pink',
            border: 'border-neon-pink/40',
            isSwap: false
          }, {
            action: 'receive' as const,
            icon: ArrowDownLeft,
            label: 'Receive',
            gradient: 'from-neon-cyan/25 to-neon-purple/25',
            hoverGradient: 'hover:from-neon-cyan/40 hover:to-neon-purple/40',
            color: 'text-neon-cyan',
            border: 'border-neon-cyan/40',
            isSwap: false
          }, {
            action: 'swap' as const,
            icon: ArrowLeftRight,
            label: 'Swap',
            gradient: 'from-neon-purple/25 to-neon-pink/25',
            hoverGradient: 'hover:from-neon-purple/40 hover:to-neon-pink/40',
            color: 'text-neon-purple',
            border: 'border-neon-purple/40',
            isSwap: true
          }].map(item => <Button key={item.action} onClick={() => item.isSwap ? setShowSwapModal(true) : handleOpenAction(item.action as 'buy' | 'send' | 'receive')} className={`flex flex-col items-center gap-2 h-auto py-3 bg-gradient-to-br ${item.gradient} ${item.hoverGradient} border ${item.border} rounded-2xl ${item.color} transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 group`} variant="ghost">
                <item.icon size={20} className="transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Button>)}
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />

          {/* Wallet balances now integrated into Stellar Tokens above */}

          {/* Recent Transactions Preview */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent Activity</span>
              <Button variant="ghost" size="sm" onClick={() => setShowHistoryModal(true)} className="h-6 px-2 text-[10px] text-neon-cyan hover:bg-neon-cyan/20">
                View All
              </Button>
            </div>
            <div className="space-y-2">
              {txLoading ? <div className="flex items-center justify-center py-3">
                  <Loader2 size={16} className="animate-spin text-neon-cyan" />
                </div> : transactions.length > 0 ? transactions.slice(0, 2).map(tx => <a key={tx.id} href={getExplorerUrl(tx.hash, tx.chain)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all cursor-pointer group">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'receive' ? 'bg-neon-green/20' : tx.type === 'send' ? 'bg-neon-pink/20' : 'bg-white/10'}`}>
                      {tx.type === 'receive' ? <ArrowDownLeft size={14} className="text-neon-green" /> : tx.type === 'send' ? <ArrowUpRight size={14} className="text-neon-pink" /> : <ArrowLeftRight size={14} className="text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium capitalize">{tx.type}</span>
                        <span className={`text-xs ${tx.status === 'success' ? 'text-neon-green' : tx.status === 'failed' ? 'text-red-400' : 'text-yellow-400'}`}>
                          {tx.status === 'success' ? <CheckCircle2 size={10} /> : tx.status === 'failed' ? <XCircle size={10} /> : <Clock size={10} />}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatTxHash(tx.hash)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold ${tx.type === 'receive' ? 'text-neon-green' : 'text-foreground'}`}>
                        {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                        {tx.amount > 0 ? tx.amount.toFixed(4) : '—'} {tx.symbol}
                      </span>
                    </div>
                    <ExternalLink size={12} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>) : <div className="text-center py-3 text-muted-foreground text-xs">
                  No recent transactions
                </div>}
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />

          {/* Multiple wallets selector */}
          {hasMultipleWallets && <>
              <div className="p-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Switch Wallet</span>
                <div className="space-y-2">
                  {connectedWallets.map(wallet => <DropdownMenuItem key={`${wallet.type}-${wallet.address}`} onClick={() => switchPrimaryWallet(wallet)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neon-cyan/10 cursor-pointer transition-all hover:scale-[1.02] border border-transparent hover:border-neon-cyan/30">
                      <span className="text-xl">{getWalletIcon(wallet.type)}</span>
                      <div className="flex-1">
                        <span className="text-sm capitalize font-medium">{wallet.type}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">{getChainIcon()} stellar</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{wallet.address.slice(0, 4)}...</span>
                      {primaryWallet?.address === wallet.address && <Badge className="bg-neon-green/20 text-neon-green border-0 text-xs animate-pulse">Active</Badge>}
                    </DropdownMenuItem>)}
                </div>
              </div>
              <Separator className="bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
            </>}

          {/* Menu items - Rewards, Settings, Support */}
          <div className="p-2 space-y-1">
            <DropdownMenuItem onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neon-green/10 cursor-pointer transition-all hover:scale-[1.02] group">
              <div className="w-8 h-8 rounded-lg bg-neon-green/20 flex items-center justify-center group-hover:bg-neon-green/30 transition-all group-hover:scale-110">
                <User size={16} className="text-neon-green" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Profile</span>
                <span className="ml-2 text-xs text-muted-foreground">Identity & Stats</span>
              </div>
              <Sparkles size={14} className="text-neon-green" />
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate('/rewards')} className="flex items-center gap-3 p-3 rounded-xl hover:bg-neon-pink/10 cursor-pointer transition-all hover:scale-[1.02] group">
              <div className="w-8 h-8 rounded-lg bg-neon-pink/20 flex items-center justify-center group-hover:bg-neon-pink/30 transition-all group-hover:scale-110">
                <Gift size={16} className="text-neon-pink" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Rewards</span>
                {balance.claimable_rewards > 0 && <span className="ml-2 text-xs text-neon-pink animate-pulse">
                    {balance.claimable_rewards.toLocaleString()} available
                  </span>}
              </div>
              <Sparkles size={14} className="text-neon-pink animate-pulse" />
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleSupport} className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-500/10 cursor-pointer transition-all hover:scale-[1.02] group">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-all group-hover:scale-110">
                <Headphones size={16} className="text-yellow-500" />
              </div>
              <span className="text-sm font-medium">Support</span>
              <ExternalLink size={12} className="text-muted-foreground ml-auto" />
            </DropdownMenuItem>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-neon-pink/20 to-transparent" />

          {/* Disconnect */}
          <div className="p-2">
            <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 cursor-pointer transition-all hover:scale-[1.02] group">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-all group-hover:scale-110">
                <LogOut size={16} />
              </div>
              <span className="text-sm font-medium">Disconnect</span>
            </DropdownMenuItem>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />

          {/* Social media links footer */}
          <div className="p-4 bg-gradient-to-t from-card/50 to-transparent">
            <div className="flex items-center justify-center gap-4">
              {socialLinks.map((social, index) => <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center w-10 h-10 rounded-xl bg-card/80 border border-white/10 ${social.color} transition-all duration-300 hover:scale-125 hover:-translate-y-1 hover:shadow-lg active:scale-95`} title={social.name} style={{
              animationDelay: `${index * 50}ms`
            }}>
                  <span className="text-lg">{social.icon}</span>
                </a>)}
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-3 opacity-60">
              Cyber City Arcade LLC • Stellar Powered 
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal isOpen={showWalletManager} onClose={() => setShowWalletManager(false)} onWalletConnected={(walletType, address) => {
      connectWallet(walletType as any, address);
      setShowWalletManager(false);
    }} />

      {/* Profile Identity Modal */}
      <ProfileIdentityModal
        open={showProfileModal}
        onOpenChange={setShowProfileModal}
        avatarUrl={avatarUrl}
        onAvatarChange={(url) => setAvatarUrl(url)}
        
      />


      <Dialog open={showActionsModal} onOpenChange={setShowActionsModal}>
        <DialogContent className="bg-transparent border-none shadow-none p-0 w-[360px] max-w-[95vw]">
          <div className="p-6 space-y-5 bg-black/80 backdrop-blur-xl rounded-2xl border border-neon-cyan/30">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">
                {activeAction === 'buy' && '💳 Buy Crypto'}
                {activeAction === 'send' && '📤 Send Tokens'}
                {activeAction === 'receive' && '📥 Receive Tokens'}
              </h2>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 p-1 bg-black/50 rounded-lg border border-border/30">
              <button onClick={() => setActiveAction('buy')} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors bg-neon-green/20 text-neon-green`}>
                Buy
              </button>
            </div>

            {/* Content */}
            {activeAction === 'buy' && <div className="space-y-4">
                {/* Currency Toggle */}
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Buy Currency</label>
                  <div className="flex gap-2 p-1 bg-black/50 rounded-lg border border-border/30">
                    <button onClick={() => setBuyCurrency('usdc')} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${buyCurrency === 'usdc' ? 'bg-neon-green/20 text-neon-green' : 'text-muted-foreground hover:text-foreground'}`}>
                      USDC <span className="text-[10px] opacity-70">(Recommended)</span>
                    </button>
                    <button onClick={() => setBuyCurrency('xlm')} className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${buyCurrency === 'xlm' ? 'bg-neon-cyan/20 text-neon-cyan' : 'text-muted-foreground hover:text-foreground'}`}>
                      XLM
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Amount (USD)</label>
                  <Input type="number" placeholder="Enter amount" value={buyAmount} onChange={e => setBuyAmount(e.target.value)} className="bg-black/50 border-neon-green/30" />
                </div>

                <div className="p-4 bg-neon-green/10 rounded-lg border border-neon-green/30">
                  <p className="text-xs text-muted-foreground">You'll receive approximately</p>
                  <p className="text-xl font-bold text-neon-green">
                    {buyAmount ? (buyCurrency === 'usdc' ? parseFloat(buyAmount).toFixed(2) : (parseFloat(buyAmount) * 10).toFixed(2)) : '0'} {buyCurrency.toUpperCase()}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">Includes provider fees and network costs.</p>
                </div>

                {/* Auto-filled wallet info */}
                {primaryWallet?.address && (
                  <div className="p-3 bg-black/40 rounded-lg border border-border/30 space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Destination Wallet</p>
                    <p className="text-xs text-foreground font-mono">
                      Wallet: {primaryWallet.address.slice(0, 6)}…{primaryWallet.address.slice(-4)}
                    </p>
                    <p className="text-[10px] text-neon-green">Network: Stellar Mainnet</p>
                  </div>
                )}

                {/* Why buy tooltip */}
                <div className="flex items-start gap-2 p-2.5 bg-neon-cyan/5 rounded-lg border border-neon-cyan/20">
                  <HelpCircle className="h-3.5 w-3.5 text-neon-cyan shrink-0 mt-0.5" />
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    {buyCurrency === 'xlm'
                      ? <>XLM is used for network fees and activating Stellar wallets. <button onClick={() => setBuyCurrency('usdc')} className="text-neon-green underline underline-offset-2 hover:text-neon-green/80">Want to enter tournaments? Buy USDC instead.</button></>
                      : 'USDC is used for tournament entries, payouts, and marketplace purchases on Cyber City Arcade.'}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Payment Method</label>
                   <div className="grid grid-cols-1 gap-3">
                    <Button onClick={() => {
                  if (!buyAmount || parseFloat(buyAmount) <= 0) {
                    toast({
                      title: "Enter Amount",
                      description: "Please enter a valid amount first",
                      variant: "destructive"
                    });
                    return;
                  }
                  const walletAddr = primaryWallet?.address || '';
                  const moonPayUrl = `https://buy.moonpay.com?apiKey=pk_test_123&currencyCode=${buyCurrency}&baseCurrencyAmount=${buyAmount}&baseCurrencyCode=usd${walletAddr ? `&walletAddress=${walletAddr}` : ''}`;
                  window.open(moonPayUrl, '_blank');
                  toast({
                    title: "MoonPay",
                    description: `Redirecting to MoonPay to buy ${buyCurrency.toUpperCase()}...`
                  });
                }} variant="outline" className="h-14 bg-black/50 border-[#7D00FF]/50 hover:border-[#7D00FF] hover:bg-[#7D00FF]/10 flex flex-col items-center justify-center gap-1">
                      <span className="text-[#7D00FF] font-bold text-sm">MoonPay</span>
                      <span className="text-[10px] text-muted-foreground">Card / Bank</span>
                    </Button>
                  </div>
                </div>
                
                <p className="text-[9px] text-center text-muted-foreground/70 leading-tight mt-2">
                  Crypto purchases are processed by MoonPay, a licensed third-party provider. Cyber City Arcade does not custody or process crypto transactions.
                </p>
                <p className="text-[9px] text-center text-muted-foreground/50 leading-tight mt-1">
                  KYC required
                </p>
              </div>}

            {activeAction === 'send' && <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Amount</label>
                  <Input type="number" placeholder="0.00" value={sendAmount} onChange={e => setSendAmount(e.target.value)} className="bg-black/50 border-neon-pink/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Recipient Address</label>
                  <Input placeholder="Stellar wallet address (G...)" value={sendAddress} onChange={e => setSendAddress(e.target.value)} className="bg-black/50 border-neon-pink/30" />
                </div>
                <Button onClick={handleSend} className="w-full bg-neon-pink hover:bg-neon-pink/90 text-black">
                  <ArrowUpRight size={16} className="mr-2" />
                  Send Transaction
                </Button>
              </div>}

            {activeAction === 'receive' && <div className="space-y-4">
                <div className="flex flex-col items-center p-5">
                  <div className="w-28 h-28 bg-white rounded-lg p-2 mb-4">
                    <div className="w-full h-full flex items-center justify-center">
                      <QrCode size={80} className="text-black" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">Your Wallet Address</p>
                  <div className="flex items-center gap-2 p-3 bg-black/50 rounded-lg border border-neon-cyan/30 w-full">
                    <code className="flex-1 text-xs text-neon-cyan overflow-hidden text-ellipsis whitespace-nowrap">
                      {primaryWallet?.address || 'Connect wallet to view'}
                    </code>
                    <Button size="sm" variant="ghost" onClick={copyAddress} className="h-8 w-8 p-0 shrink-0">
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground">
                  Only send Stellar (XLM) and Stellar assets to this address
                </p>
              </div>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Swap Modal */}
      <Dialog open={showSwapModal} onOpenChange={setShowSwapModal}>
        <DialogContent className="arcade-frame bg-background/98 backdrop-blur-xl border-neon-purple/30 max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-2xl text-neon-purple font-display flex items-center gap-2">
              <ArrowLeftRight className="animate-pulse" size={24} />
              Swap Tokens
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Swap between XLM, USDC, and PYUSD
            </DialogDescription>
          </DialogHeader>
          <StellarSwap compact />
        </DialogContent>
      </Dialog>

      {/* Transaction History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="max-w-md bg-background/98 backdrop-blur-xl border border-neon-cyan/30 rounded-3xl overflow-hidden">
          <DialogHeader className="pb-4 border-b border-neon-cyan/20">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl text-neon-cyan font-display flex items-center gap-2">
                <History className="animate-pulse" size={20} />
                Transaction History
              </DialogTitle>
              <Button variant="ghost" size="sm" onClick={() => refreshHistory()} disabled={txLoading} className="h-8 px-2 hover:bg-neon-cyan/20">
                {txLoading ? <Loader2 size={14} className="animate-spin text-neon-cyan" /> : <RefreshCw size={14} className="text-neon-cyan" />}
              </Button>
            </div>
            <DialogDescription className="text-muted-foreground text-sm">
              Recent transactions across all connected wallets
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto space-y-2 py-2">
            {txLoading && transactions.length === 0 ? <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-neon-cyan" />
              </div> : transactions.length > 0 ? transactions.map(tx => <a key={tx.id} href={getExplorerUrl(tx.hash, tx.chain)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all cursor-pointer group border border-transparent hover:border-white/10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'receive' ? 'bg-neon-green/20' : tx.type === 'send' ? 'bg-neon-pink/20' : 'bg-white/10'}`}>
                    {tx.type === 'receive' ? <ArrowDownLeft size={18} className="text-neon-green" /> : tx.type === 'send' ? <ArrowUpRight size={18} className="text-neon-pink" /> : <ArrowLeftRight size={18} className="text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{tx.type}</span>
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${tx.status === 'success' ? 'border-neon-green/50 text-neon-green' : tx.status === 'failed' ? 'border-red-400/50 text-red-400' : 'border-yellow-400/50 text-yellow-400'}`}>
                        {tx.status}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-white/20">
                        {tx.chain.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {formatTxHash(tx.hash)}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-sm font-bold ${tx.type === 'receive' ? 'text-neon-green' : tx.type === 'send' ? 'text-neon-pink' : 'text-foreground'}`}>
                      {tx.type === 'receive' ? '+' : tx.type === 'send' ? '-' : ''}
                      {tx.amount > 0 ? tx.amount.toFixed(4) : '—'}
                    </span>
                    <span className="text-xs text-muted-foreground ml-1">{tx.symbol}</span>
                  </div>
                  <ExternalLink size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </a>) : <div className="text-center py-8">
                <History size={32} className="mx-auto text-muted-foreground mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">No transactions found</p>
                <p className="text-muted-foreground text-xs mt-1">Connect a wallet to see transaction history</p>
              </div>}
          </div>
        </DialogContent>
      </Dialog>
    </>;
};