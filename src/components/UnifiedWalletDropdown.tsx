import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { 
  Wallet, 
  LogOut, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard,
  Copy,
  Settings,
  QrCode,
  Gift,
  Headphones,
  User,
  Sparkles,
  ExternalLink,
  ArrowLeftRight
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { WalletConnectionModal } from './WalletConnectionModal';
import { ChainType, WalletType } from '@/types/wallet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const UnifiedWalletDropdown = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { balance } = useUserBalance();
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
  
  const { logoutWallet } = useWalletAuth();
  
  const [showWalletManager, setShowWalletManager] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeAction, setActiveAction] = useState<'buy' | 'send' | 'receive' | 'swap'>('buy');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [sendAmount, setSendAmount] = useState('');
  const [sendAddress, setSendAddress] = useState('');
  const [buyAmount, setBuyAmount] = useState('');

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
        description: "Successfully logged out",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const copyAddress = async () => {
    if (primaryWallet?.address) {
      await navigator.clipboard.writeText(primaryWallet.address);
      toast({
        title: "Copied!",
        description: "Wallet address copied to clipboard",
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
      description: `Claiming ${balance.claimable_rewards.toLocaleString()} $CCTR...`,
    });
    setShowRewardsModal(false);
  };

  const handleSupport = () => {
    window.open('https://discord.gg/cybercityarcade', '_blank');
  };

  const handleSend = () => {
    if (!sendAmount || !sendAddress) {
      toast({
        title: "Missing Info",
        description: "Please enter amount and recipient address",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Transaction Initiated",
      description: `Sending ${sendAmount} SOL to ${sendAddress.slice(0, 8)}...`,
    });
    setSendAmount('');
    setSendAddress('');
    setShowActionsModal(false);
  };

  const handleBuy = () => {
    toast({
      title: "Redirecting",
      description: "Opening payment processor...",
    });
    setShowActionsModal(false);
  };

  const socialLinks = [
    { name: 'X', icon: '𝕏', url: 'https://x.com/cybercityarcade', color: 'hover:bg-white/20 hover:shadow-white/20' },
    { name: 'Discord', icon: '💬', url: 'https://discord.gg/cybercityarcade', color: 'hover:bg-indigo-500/30 hover:shadow-indigo-500/20' },
    { name: 'Telegram', icon: '✈️', url: 'https://t.me/cybercityarcade', color: 'hover:bg-blue-400/30 hover:shadow-blue-400/20' },
    { name: 'Instagram', icon: '📷', url: 'https://instagram.com/cybercityarcade', color: 'hover:bg-pink-500/30 hover:shadow-pink-500/20' },
  ];

  if (!isWalletConnected) {
    return (
      <>
        <Button 
          onClick={() => setShowWalletManager(true)}
          className="relative overflow-hidden group h-11 px-6 rounded-2xl bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan text-white font-bold border-0 shadow-xl shadow-neon-pink/40 hover:shadow-neon-cyan/50 transition-all duration-500 hover:scale-105 active:scale-95"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Wallet size={18} className="animate-pulse" />
            Connect Wallet
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-green to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shimmer" />
        </Button>
        
        <WalletConnectionModal 
          isOpen={showWalletManager} 
          onClose={() => setShowWalletManager(false)}
          onWalletConnected={(walletType, address) => {
            connectWallet(walletType as any, address);
            setShowWalletManager(false);
          }}
        />
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="relative h-11 px-4 rounded-2xl bg-gradient-to-r from-card via-card/90 to-card/80 border border-neon-cyan/30 hover:border-neon-cyan hover:shadow-xl hover:shadow-neon-cyan/30 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] group"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-8 h-8 border-2 border-neon-cyan/50 transition-all duration-300 group-hover:border-neon-cyan group-hover:shadow-lg group-hover:shadow-neon-cyan/30">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-neon-pink to-neon-purple text-white text-xs font-bold">
                    {getWalletIcon(primaryWallet?.type || 'phantom')}
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
                  {balance.cctr_balance.toLocaleString()} $CCTR
                </span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground transition-transform duration-300 group-hover:rotate-180" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          className="w-[340px] p-0 bg-background/98 backdrop-blur-xl border border-neon-cyan/30 rounded-3xl shadow-2xl shadow-neon-cyan/20 overflow-hidden animate-fade-in"
        >
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
                    <button 
                      onClick={copyAddress}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-neon-cyan transition-all duration-200 hover:scale-105"
                    >
                      {primaryWallet?.address.slice(0, 6)}...{primaryWallet?.address.slice(-4)}
                      <Copy size={10} />
                    </button>
                  </div>
                </div>
                <Badge className="bg-neon-green/20 text-neon-green border-0 font-bold capitalize px-3 py-1 shadow-lg shadow-neon-green/20">
                  {primaryWallet?.type}
                </Badge>
              </div>
              
              {/* Balance display */}
              <div className="flex items-center justify-between p-4 bg-card/70 backdrop-blur-sm rounded-2xl border border-neon-cyan/20 shadow-inner">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Balance</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
                    {balance.cctr_balance.toLocaleString()}
                  </p>
                  <p className="text-xs text-neon-cyan font-medium">$CCTR</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Claimable</p>
                  <p className="text-xl font-bold text-neon-pink animate-pulse">{balance.claimable_rewards.toLocaleString()}</p>
                  {balance.claimable_rewards > 0 && (
                    <Button 
                      size="sm" 
                      onClick={() => setShowRewardsModal(true)}
                      className="mt-1 h-6 px-2 text-[10px] bg-neon-pink/20 text-neon-pink hover:bg-neon-pink hover:text-black border-0 rounded-lg transition-all hover:scale-105"
                    >
                      Claim
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons - Buy, Send, Receive, Swap */}
          <div className="p-4 grid grid-cols-4 gap-2">
            {[
              { action: 'buy' as const, icon: CreditCard, label: 'Buy', gradient: 'from-neon-green/25 to-neon-cyan/25', hoverGradient: 'hover:from-neon-green/40 hover:to-neon-cyan/40', color: 'text-neon-green', border: 'border-neon-green/40', isSwap: false },
              { action: 'send' as const, icon: ArrowUpRight, label: 'Send', gradient: 'from-neon-pink/25 to-neon-purple/25', hoverGradient: 'hover:from-neon-pink/40 hover:to-neon-purple/40', color: 'text-neon-pink', border: 'border-neon-pink/40', isSwap: false },
              { action: 'receive' as const, icon: ArrowDownLeft, label: 'Receive', gradient: 'from-neon-cyan/25 to-neon-purple/25', hoverGradient: 'hover:from-neon-cyan/40 hover:to-neon-purple/40', color: 'text-neon-cyan', border: 'border-neon-cyan/40', isSwap: false },
              { action: 'swap' as const, icon: ArrowLeftRight, label: 'Swap', gradient: 'from-neon-purple/25 to-neon-pink/25', hoverGradient: 'hover:from-neon-purple/40 hover:to-neon-pink/40', color: 'text-neon-purple', border: 'border-neon-purple/40', isSwap: true },
            ].map((item) => (
              <Button
                key={item.action}
                onClick={() => item.isSwap ? setShowSwapModal(true) : handleOpenAction(item.action as 'buy' | 'send' | 'receive')}
                className={`flex flex-col items-center gap-2 h-auto py-3 bg-gradient-to-br ${item.gradient} ${item.hoverGradient} border ${item.border} rounded-2xl ${item.color} transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 group`}
                variant="ghost"
              >
                <item.icon size={20} className="transition-transform group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </Button>
            ))}
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />

          {/* Token balances - Multi-chain */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tokens</span>
              {primaryWallet?.chain && (
                <Badge variant="outline" className="text-[10px] border-neon-cyan/30 text-neon-cyan">
                  {getChainIcon(primaryWallet.chain)} {primaryWallet.chain?.toUpperCase()}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { symbol: 'SOL', icon: '◎', balance: '~0.5', color: 'text-purple-400', bg: 'bg-purple-400/10', chain: 'solana' },
                { symbol: 'ETH', icon: '⟠', balance: '~0.01', color: 'text-blue-400', bg: 'bg-blue-400/10', chain: 'ethereum' },
                { symbol: 'XLM', icon: '✦', balance: '~10', color: 'text-cyan-400', bg: 'bg-cyan-400/10', chain: 'stellar' },
                { symbol: 'USDC', icon: '$', balance: '25.00', color: 'text-green-400', bg: 'bg-green-400/10', chain: 'all' },
              ].filter(token => token.chain === 'all' || token.chain === primaryWallet?.chain || !primaryWallet?.chain)
               .slice(0, 4)
               .map((token) => (
                <div key={token.symbol} className={`flex items-center justify-between p-3 ${token.bg} rounded-xl border border-white/5 transition-all hover:scale-105 hover:border-white/20 cursor-pointer`}>
                  <span className={`${token.color} font-medium text-sm`}>{token.icon} {token.symbol}</span>
                  <span className={`font-bold ${token.color}`}>{token.balance}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />

          {/* Multiple wallets selector */}
          {hasMultipleWallets && (
            <>
              <div className="p-4">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 block">Switch Wallet</span>
                <div className="space-y-2">
                  {connectedWallets.map((wallet) => (
                    <DropdownMenuItem 
                      key={`${wallet.type}-${wallet.address}`}
                      onClick={() => switchPrimaryWallet(wallet)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neon-cyan/10 cursor-pointer transition-all hover:scale-[1.02] border border-transparent hover:border-neon-cyan/30"
                    >
                      <span className="text-xl">{getWalletIcon(wallet.type)}</span>
                      <div className="flex-1">
                        <span className="text-sm capitalize font-medium">{wallet.type}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">{getChainIcon(wallet.chain)} {wallet.chain}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{wallet.address.slice(0, 4)}...</span>
                      {primaryWallet?.address === wallet.address && (
                        <Badge className="bg-neon-green/20 text-neon-green border-0 text-xs animate-pulse">Active</Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
              <Separator className="bg-gradient-to-r from-transparent via-neon-cyan/20 to-transparent" />
            </>
          )}

          {/* Menu items - Rewards, Settings, Support */}
          <div className="p-2 space-y-1">
            <DropdownMenuItem 
              onClick={() => setShowRewardsModal(true)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-neon-pink/10 cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="w-8 h-8 rounded-lg bg-neon-pink/20 flex items-center justify-center group-hover:bg-neon-pink/30 transition-all group-hover:scale-110">
                <Gift size={16} className="text-neon-pink" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium">Rewards</span>
                {balance.claimable_rewards > 0 && (
                  <span className="ml-2 text-xs text-neon-pink animate-pulse">
                    {balance.claimable_rewards.toLocaleString()} available
                  </span>
                )}
              </div>
              <Sparkles size={14} className="text-neon-pink animate-pulse" />
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-neon-cyan/10 cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="w-8 h-8 rounded-lg bg-neon-cyan/20 flex items-center justify-center group-hover:bg-neon-cyan/30 transition-all group-hover:scale-110 group-hover:rotate-90 duration-300">
                <Settings size={16} className="text-neon-cyan" />
              </div>
              <span className="text-sm font-medium">Account Settings</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => setShowWalletManager(true)}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-neon-purple/10 cursor-pointer transition-all hover:scale-[1.02] group"
            >
              <div className="w-8 h-8 rounded-lg bg-neon-purple/20 flex items-center justify-center group-hover:bg-neon-purple/30 transition-all group-hover:scale-110">
                <Wallet size={16} className="text-neon-purple" />
              </div>
              <span className="text-sm font-medium">Manage Wallets</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={handleSupport}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-yellow-500/10 cursor-pointer transition-all hover:scale-[1.02] group"
            >
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
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 cursor-pointer transition-all hover:scale-[1.02] group"
            >
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
              {socialLinks.map((social, index) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center w-10 h-10 rounded-xl bg-card/80 border border-white/10 ${social.color} transition-all duration-300 hover:scale-125 hover:-translate-y-1 hover:shadow-lg active:scale-95`}
                  title={social.name}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-3 opacity-60">
              Cyber City Arcade • Multi-Chain: Solana, Ethereum, Stellar
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Connection Modal */}
      <WalletConnectionModal 
        isOpen={showWalletManager} 
        onClose={() => setShowWalletManager(false)}
        onWalletConnected={(walletType, address) => {
          connectWallet(walletType as any, address);
          setShowWalletManager(false);
        }}
      />

      {/* Rewards Modal */}
      <Dialog open={showRewardsModal} onOpenChange={setShowRewardsModal}>
        <DialogContent className="arcade-frame bg-background/98 backdrop-blur-xl border-neon-pink/30 max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-2xl text-neon-pink font-display flex items-center gap-2">
              <Gift className="animate-bounce" /> Rewards
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Claim your earned rewards
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-6 bg-gradient-to-br from-neon-pink/20 via-neon-purple/10 to-neon-cyan/20 rounded-2xl border border-neon-pink/30 text-center">
              <p className="text-sm text-muted-foreground mb-2">Available to Claim</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan bg-clip-text text-transparent animate-pulse">
                {balance.claimable_rewards.toLocaleString()}
              </p>
              <p className="text-sm text-neon-pink mt-1">$CCTR Tokens</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-card/50 rounded-xl border border-white/10 text-center">
                <p className="text-xs text-muted-foreground">Gaming Rewards</p>
                <p className="text-lg font-bold text-neon-green">+250</p>
              </div>
              <div className="p-4 bg-card/50 rounded-xl border border-white/10 text-center">
                <p className="text-xs text-muted-foreground">Staking Rewards</p>
                <p className="text-lg font-bold text-neon-cyan">+150</p>
              </div>
            </div>
            <Button 
              onClick={handleClaimRewards}
              disabled={balance.claimable_rewards <= 0}
              className="w-full h-12 cyber-button text-lg font-bold transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="mr-2 animate-spin" size={18} />
              Claim All Rewards
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="arcade-frame bg-background/98 backdrop-blur-xl border-neon-cyan/30 max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-2xl text-neon-cyan font-display flex items-center gap-2">
              <Settings className="animate-spin" style={{ animationDuration: '3s' }} /> Account Settings
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Manage your account preferences
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-4 bg-card/50 rounded-xl border border-white/10">
              <Avatar className="w-16 h-16 border-2 border-neon-cyan/50">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-neon-pink to-neon-purple text-white text-xl font-bold">
                  {user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-bold text-lg">{user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" className="border-neon-cyan/30 hover:border-neon-cyan hover:bg-neon-cyan/10">
                <User size={14} className="mr-1" /> Edit
              </Button>
            </div>
            
            <div className="space-y-2">
              <Label className="text-neon-cyan">Display Name</Label>
              <Input 
                placeholder="Enter display name" 
                defaultValue={user?.user_metadata?.username || ''}
                className="bg-card/50 border-neon-cyan/30 focus:border-neon-cyan"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-neon-cyan">Email Notifications</Label>
              <div className="flex items-center justify-between p-3 bg-card/50 rounded-xl border border-white/10">
                <span className="text-sm">Receive reward notifications</span>
                <Button variant="outline" size="sm" className="h-7 px-3 border-neon-green/30 text-neon-green">On</Button>
              </div>
            </div>
            
            <Button className="w-full cyber-button">
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Actions Modal */}
      <Dialog open={showActionsModal} onOpenChange={setShowActionsModal}>
        <DialogContent className="arcade-frame bg-background/98 backdrop-blur-xl border-neon-cyan/30 max-w-md animate-scale-in">
          <DialogHeader>
            <DialogTitle className="text-xl text-neon-cyan font-display">
              {activeAction === 'buy' && '💳 Buy Crypto'}
              {activeAction === 'send' && '📤 Send Tokens'}
              {activeAction === 'receive' && '📥 Receive Tokens'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeAction} onValueChange={(v) => setActiveAction(v as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-card/50 rounded-xl p-1">
              <TabsTrigger value="buy" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green rounded-lg transition-all">
                Buy
              </TabsTrigger>
              <TabsTrigger value="send" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink rounded-lg transition-all">
                Send
              </TabsTrigger>
              <TabsTrigger value="receive" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan rounded-lg transition-all">
                Receive
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-4 mt-4 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-neon-green">Amount (USD)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="bg-card/50 border-neon-green/30 focus:border-neon-green transition-all"
                />
              </div>
              <div className="p-4 bg-neon-green/10 rounded-xl border border-neon-green/30">
                <p className="text-xs text-muted-foreground">You'll receive approximately</p>
                <p className="text-2xl font-bold text-neon-green">
                  {buyAmount ? (parseFloat(buyAmount) / 50).toFixed(4) : '0'} SOL
                </p>
              </div>
              <Button onClick={handleBuy} className="w-full cyber-button hover:scale-105 active:scale-95 transition-all">
                <CreditCard size={16} className="mr-2" />
                Continue to Payment
              </Button>
            </TabsContent>

            <TabsContent value="send" className="space-y-4 mt-4 animate-fade-in">
              <div className="space-y-2">
                <Label className="text-neon-pink">Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-card/50 border-neon-pink/30 focus:border-neon-pink transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neon-pink">Recipient Address</Label>
                <Input
                  placeholder="Solana wallet address"
                  value={sendAddress}
                  onChange={(e) => setSendAddress(e.target.value)}
                  className="bg-card/50 border-neon-pink/30 focus:border-neon-pink transition-all"
                />
              </div>
              <Button onClick={handleSend} className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink hover:scale-105 active:scale-95 transition-all">
                <ArrowUpRight size={16} className="mr-2" />
                Send Transaction
              </Button>
            </TabsContent>

            <TabsContent value="receive" className="space-y-4 mt-4 animate-fade-in">
              <div className="flex flex-col items-center p-6 bg-card/50 rounded-xl border border-neon-cyan/30">
                <div className="w-36 h-36 bg-white rounded-2xl p-3 mb-4 shadow-xl shadow-neon-cyan/20">
                  <div className="w-full h-full flex items-center justify-center">
                    <QrCode size={100} className="text-black" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Your Wallet Address</p>
                <div className="flex items-center gap-2 p-3 bg-card rounded-xl border border-neon-cyan/30 w-full">
                  <code className="flex-1 text-xs text-neon-cyan truncate">
                    {primaryWallet?.address}
                  </code>
                  <Button size="sm" variant="ghost" onClick={copyAddress} className="h-7 px-2 hover:bg-neon-cyan/10 transition-all hover:scale-110">
                    <Copy size={14} />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-center text-muted-foreground">
                Only send Solana (SOL) and SPL tokens to this address
              </p>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Swap Modal with Jupiter DEX */}
      <Dialog open={showSwapModal} onOpenChange={setShowSwapModal}>
        <DialogContent className="arcade-frame bg-background/98 backdrop-blur-xl border-neon-purple/30 max-w-2xl animate-scale-in">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl text-neon-purple font-display flex items-center gap-2">
                <ArrowLeftRight className="animate-pulse" size={24} />
                Swap Tokens
              </DialogTitle>
              <a href="https://jup.ag" target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black">
                  Jupiter <ExternalLink size={12} className="ml-1" />
                </Button>
              </a>
            </div>
            <DialogDescription className="text-muted-foreground">
              Swap Solana tokens using Jupiter Aggregator
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl overflow-hidden border border-neon-purple/30">
            <iframe
              title="Jupiter Swap"
              src={`https://jup.ag/swap/USDC-SOL?theme=dark&padding=12`}
              className="w-full"
              style={{ height: 520, border: '0' }}
              allow="clipboard-read; clipboard-write; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Powered by Jupiter. Connect your wallet in the widget to swap tokens.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
};
