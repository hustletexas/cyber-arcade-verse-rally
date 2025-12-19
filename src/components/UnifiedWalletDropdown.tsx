import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  ExternalLink,
  Settings,
  Coins,
  QrCode
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { WalletManager } from './WalletManager';
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
    connectWallet,
    disconnectWallet,
    switchPrimaryWallet,
    getWalletIcon 
  } = useMultiWallet();
  
  const { logoutWallet } = useWalletAuth();
  
  const [showWalletManager, setShowWalletManager] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [activeAction, setActiveAction] = useState<'buy' | 'send' | 'receive'>('buy');
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
    { name: 'X', icon: '𝕏', url: 'https://x.com/cybercityarcade', color: 'hover:bg-white/10' },
    { name: 'Discord', icon: '💬', url: 'https://discord.gg/cybercityarcade', color: 'hover:bg-indigo-500/20' },
    { name: 'Telegram', icon: '✈️', url: 'https://t.me/cybercityarcade', color: 'hover:bg-blue-400/20' },
    { name: 'Instagram', icon: '📷', url: 'https://instagram.com/cybercityarcade', color: 'hover:bg-pink-500/20' },
  ];

  if (!isWalletConnected) {
    return (
      <>
        <Button 
          onClick={() => setShowWalletManager(true)}
          className="relative overflow-hidden group h-10 px-5 rounded-xl bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan text-white font-bold border-0 shadow-lg shadow-neon-pink/30 hover:shadow-neon-cyan/40 transition-all duration-300"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Wallet size={18} />
            Connect Wallet
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan via-neon-green to-neon-pink opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Button>
        
        <Dialog open={showWalletManager} onOpenChange={setShowWalletManager}>
          <DialogContent className="arcade-frame bg-background/98 backdrop-blur-xl border-neon-cyan/30 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl text-neon-cyan font-display flex items-center gap-2">
                💰 Connect Wallet
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Connect your Solana wallet to continue
              </DialogDescription>
            </DialogHeader>
            <WalletManager />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            className="relative h-10 px-4 rounded-xl bg-gradient-to-r from-card to-card/80 border border-neon-cyan/40 hover:border-neon-cyan hover:shadow-lg hover:shadow-neon-cyan/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-7 h-7 border-2 border-neon-cyan/50">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-neon-pink to-neon-purple text-white text-xs font-bold">
                  {getWalletIcon(primaryWallet?.type || 'phantom')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start">
                <span className="text-xs text-neon-cyan font-medium">
                  {primaryWallet?.address.slice(0, 4)}...{primaryWallet?.address.slice(-4)}
                </span>
                <span className="text-[10px] text-neon-green font-bold">
                  {balance.cctr_balance.toLocaleString()} $CCTR
                </span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          align="end" 
          className="w-80 p-0 bg-background/98 backdrop-blur-xl border border-neon-cyan/30 rounded-2xl shadow-2xl shadow-neon-cyan/10 overflow-hidden"
        >
          {/* Header with wallet info */}
          <div className="p-4 bg-gradient-to-r from-neon-pink/10 via-neon-purple/10 to-neon-cyan/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border-2 border-neon-cyan/50 shadow-lg shadow-neon-cyan/20">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-neon-pink to-neon-purple text-white font-bold">
                    {user?.email?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <button 
                    onClick={copyAddress}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-neon-cyan transition-colors"
                  >
                    {primaryWallet?.address.slice(0, 6)}...{primaryWallet?.address.slice(-4)}
                    <Copy size={10} />
                  </button>
                </div>
              </div>
              <Badge className="bg-neon-green/20 text-neon-green border-0 font-bold">
                {primaryWallet?.type}
              </Badge>
            </div>
            
            {/* Balance display */}
            <div className="flex items-center justify-between p-3 bg-card/60 rounded-xl border border-neon-cyan/20">
              <div>
                <p className="text-xs text-muted-foreground">Total Balance</p>
                <p className="text-xl font-bold text-neon-cyan">{balance.cctr_balance.toLocaleString()}</p>
                <p className="text-xs text-neon-green">$CCTR</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Claimable</p>
                <p className="text-lg font-bold text-neon-pink">{balance.claimable_rewards.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="p-3 grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleOpenAction('buy')}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-neon-green/20 to-neon-cyan/20 hover:from-neon-green/30 hover:to-neon-cyan/30 border border-neon-green/30 rounded-xl text-neon-green transition-all hover:scale-105"
              variant="ghost"
            >
              <CreditCard size={20} />
              <span className="text-xs font-bold">Buy</span>
            </Button>
            <Button
              onClick={() => handleOpenAction('send')}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 hover:from-neon-pink/30 hover:to-neon-purple/30 border border-neon-pink/30 rounded-xl text-neon-pink transition-all hover:scale-105"
              variant="ghost"
            >
              <ArrowUpRight size={20} />
              <span className="text-xs font-bold">Send</span>
            </Button>
            <Button
              onClick={() => handleOpenAction('receive')}
              className="flex flex-col items-center gap-1 h-auto py-3 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 hover:from-neon-cyan/30 hover:to-neon-purple/30 border border-neon-cyan/30 rounded-xl text-neon-cyan transition-all hover:scale-105"
              variant="ghost"
            >
              <ArrowDownLeft size={20} />
              <span className="text-xs font-bold">Receive</span>
            </Button>
          </div>

          <Separator className="bg-neon-cyan/10" />

          {/* Token balances mini */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground">Tokens</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-card/40 rounded-lg">
                <span className="text-yellow-400">◎ SOL</span>
                <span className="font-bold text-yellow-400">~0.5</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-card/40 rounded-lg">
                <span className="text-blue-400">$ USDC</span>
                <span className="font-bold text-blue-400">25.00</span>
              </div>
            </div>
          </div>

          <Separator className="bg-neon-cyan/10" />

          {/* Multiple wallets selector */}
          {hasMultipleWallets && (
            <>
              <div className="p-3">
                <span className="text-xs font-semibold text-muted-foreground mb-2 block">Switch Wallet</span>
                <div className="space-y-1">
                  {connectedWallets.map((wallet) => (
                    <DropdownMenuItem 
                      key={`${wallet.type}-${wallet.address}`}
                      onClick={() => switchPrimaryWallet(wallet)}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-neon-cyan/10 cursor-pointer"
                    >
                      <span className="text-lg">{getWalletIcon(wallet.type)}</span>
                      <span className="flex-1 text-sm capitalize">{wallet.type}</span>
                      <span className="text-xs text-muted-foreground">{wallet.address.slice(0, 4)}...</span>
                      {primaryWallet?.address === wallet.address && (
                        <Badge className="bg-neon-green/20 text-neon-green border-0 text-xs">Active</Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </div>
              </div>
              <Separator className="bg-neon-cyan/10" />
            </>
          )}

          {/* Settings & disconnect */}
          <div className="p-2">
            <DropdownMenuItem 
              onClick={() => setShowWalletManager(true)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-neon-cyan/10 cursor-pointer"
            >
              <Settings size={16} className="text-muted-foreground" />
              <span className="text-sm">Manage Wallets</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-neon-pink/10 text-neon-pink cursor-pointer"
            >
              <LogOut size={16} />
              <span className="text-sm">Disconnect</span>
            </DropdownMenuItem>
          </div>

          <Separator className="bg-neon-cyan/10" />

          {/* Social media links footer */}
          <div className="p-3 bg-card/30">
            <div className="flex items-center justify-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center w-9 h-9 rounded-xl bg-card/60 border border-muted/30 ${social.color} transition-all duration-200 hover:scale-110 hover:border-neon-cyan/50`}
                  title={social.name}
                >
                  <span className="text-base">{social.icon}</span>
                </a>
              ))}
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-2">
              Cyber City Arcade • Powered by Solana
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Manager Dialog */}
      <Dialog open={showWalletManager} onOpenChange={setShowWalletManager}>
        <DialogContent className="arcade-frame bg-background/98 backdrop-blur-xl border-neon-cyan/30 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-neon-cyan font-display flex items-center gap-2">
              💰 Wallet Manager
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create, import, and manage your Solana wallets
            </DialogDescription>
          </DialogHeader>
          <WalletManager />
        </DialogContent>
      </Dialog>

      {/* Actions Modal */}
      <Dialog open={showActionsModal} onOpenChange={setShowActionsModal}>
        <DialogContent className="arcade-frame bg-background/98 backdrop-blur-xl border-neon-cyan/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-neon-cyan font-display">
              {activeAction === 'buy' && '💳 Buy Crypto'}
              {activeAction === 'send' && '📤 Send Tokens'}
              {activeAction === 'receive' && '📥 Receive Tokens'}
            </DialogTitle>
          </DialogHeader>
          
          <Tabs value={activeAction} onValueChange={(v) => setActiveAction(v as any)}>
            <TabsList className="grid w-full grid-cols-3 bg-card/50 rounded-xl p-1">
              <TabsTrigger value="buy" className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green rounded-lg">
                Buy
              </TabsTrigger>
              <TabsTrigger value="send" className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink rounded-lg">
                Send
              </TabsTrigger>
              <TabsTrigger value="receive" className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan rounded-lg">
                Receive
              </TabsTrigger>
            </TabsList>

            <TabsContent value="buy" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-neon-green">Amount (USD)</Label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="bg-card/50 border-neon-green/30 focus:border-neon-green"
                />
              </div>
              <div className="p-3 bg-neon-green/10 rounded-xl border border-neon-green/30">
                <p className="text-xs text-muted-foreground">You'll receive approximately</p>
                <p className="text-lg font-bold text-neon-green">
                  {buyAmount ? (parseFloat(buyAmount) / 50).toFixed(4) : '0'} SOL
                </p>
              </div>
              <Button onClick={handleBuy} className="w-full cyber-button">
                <CreditCard size={16} className="mr-2" />
                Continue to Payment
              </Button>
            </TabsContent>

            <TabsContent value="send" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-neon-pink">Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-card/50 border-neon-pink/30 focus:border-neon-pink"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-neon-pink">Recipient Address</Label>
                <Input
                  placeholder="Solana wallet address"
                  value={sendAddress}
                  onChange={(e) => setSendAddress(e.target.value)}
                  className="bg-card/50 border-neon-pink/30 focus:border-neon-pink"
                />
              </div>
              <Button onClick={handleSend} className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink">
                <ArrowUpRight size={16} className="mr-2" />
                Send Transaction
              </Button>
            </TabsContent>

            <TabsContent value="receive" className="space-y-4 mt-4">
              <div className="flex flex-col items-center p-6 bg-card/50 rounded-xl border border-neon-cyan/30">
                <div className="w-32 h-32 bg-white rounded-xl p-2 mb-4">
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0xMCAxMGg4MHY4MEgxMHoiIGZpbGw9IiMwMDAiLz48cGF0aCBkPSJNMjAgMjBoNjB2NjBIMjB6IiBmaWxsPSIjZmZmIi8+PHBhdGggZD0iTTMwIDMwaDQwdjQwSDMweiIgZmlsbD0iIzAwMCIvPjwvc3ZnPg==')] bg-cover flex items-center justify-center">
                    <QrCode size={80} className="text-black" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-2">Your Wallet Address</p>
                <div className="flex items-center gap-2 p-2 bg-card rounded-lg border border-neon-cyan/30 w-full">
                  <code className="flex-1 text-xs text-neon-cyan truncate">
                    {primaryWallet?.address}
                  </code>
                  <Button size="sm" variant="ghost" onClick={copyAddress} className="h-6 px-2">
                    <Copy size={12} />
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
    </>
  );
};
