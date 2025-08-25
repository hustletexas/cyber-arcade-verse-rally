
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { ShoppingCart, ChevronDown, Wallet, LogOut, Settings, Plus, Coins, Image, User, CreditCard, Send, ArrowDownToLine } from 'lucide-react';
import { WalletConnectionModal } from './WalletConnectionModal';
import { WalletManager } from './WalletManager';
import { WalletBalanceDisplay } from './WalletBalanceDisplay';
import { WalletActions } from './WalletActions';
import { ProfileDashboard } from './ProfileDashboard';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export const TopBar = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTotalItems, setIsOpen } = useCart();
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
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWalletManager, setShowWalletManager] = useState(false);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);
  const [showWalletActions, setShowWalletActions] = useState(false);
  const [showProfileDashboard, setShowProfileDashboard] = useState(false);

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
        description: "Successfully logged out from Cyber City Arcade",
      });
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to logout completely",
        variant: "destructive",
      });
    }
  };

  const handleDisconnectWallet = async (walletType: string) => {
    try {
      if (primaryWallet?.type === walletType && user) {
        await logoutWallet();
      }
      await disconnectWallet(walletType as any);
    } catch (error: any) {
      console.error('Wallet disconnect error:', error);
      toast({
        title: "Disconnect Error",
        description: error.message || "Failed to disconnect wallet",
        variant: "destructive",
      });
    }
  };

  const handleManageWallets = () => {
    console.log('Opening wallet manager dialog');
    setShowWalletManager(true);
  };

  return (
    <>
      <header className="border-b border-neon-cyan/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-2 py-2">
          <div className="flex items-center justify-between h-12">
            <div className="flex items-center">
              <Button 
                onClick={() => setIsOpen(true)}
                className="cyber-button flex items-center gap-2 relative text-sm h-8 px-3"
                size="sm"
              >
                <ShoppingCart size={14} />
                CART
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-neon-pink text-black min-w-[16px] h-4 rounded-full flex items-center justify-center text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden neon-glow border-2 border-neon-cyan/50 bg-transparent">
                <img 
                  src="/lovable-uploads/c084d8de-a04e-4e1e-9e0c-ea179d67f5a7.png" 
                  alt="Cyber City Arcade Logo" 
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {loading ? (
                <div className="text-neon-cyan text-sm">Loading...</div>
              ) : (
                user && (
                  <Card className="arcade-frame px-2 py-1">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6 border border-neon-cyan">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-neon-purple text-black font-bold text-sm">
                          {user.user_metadata?.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-bold text-neon-cyan text-sm leading-none">
                          {user.user_metadata?.username || user.email?.split('@')[0]}
                        </p>
                        {primaryWallet && (
                          <p className="text-neon-green text-xs leading-none mt-0.5">
                            {getWalletIcon(primaryWallet.type)} {primaryWallet.address.slice(0, 4)}...
                          </p>
                        )}
                      </div>
                      <Button 
                        onClick={handleSignOut}
                        variant="outline" 
                        size="sm"
                        className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black flex items-center gap-1 text-sm px-2 py-1 h-6"
                      >
                        <LogOut size={12} />
                        Logout
                      </Button>
                    </div>
                  </Card>
                )
              )}

              {/* Multi-Wallet Connection */}
              <div className="flex items-center gap-2">
                {!isWalletConnected ? (
                  <Button 
                    onClick={handleManageWallets}
                    className="cyber-button flex items-center gap-2 text-sm h-8 px-3"
                    size="sm"
                  >
                    <Settings size={14} />
                    WALLETS
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black min-w-[120px] h-6"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-1">
                            {getWalletIcon(primaryWallet?.type || 'phantom')} 
                            <span className="text-xs">{primaryWallet?.address.slice(0, 4)}...</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Coins size={8} />
                            <span>{balance.cctr_balance.toLocaleString()}</span>
                          </div>
                          <ChevronDown size={10} />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background/98 backdrop-blur-lg border border-neon-cyan/20 shadow-2xl shadow-neon-cyan/10 z-50 min-w-[260px] rounded-xl">
                      <DropdownMenuLabel className="flex items-center justify-between border-b border-neon-cyan/10 pb-2">
                        <span className="text-sm font-bold text-neon-cyan">Wallet Actions</span>
                        <Badge className="bg-gradient-to-r from-neon-green to-neon-cyan text-black text-xs font-bold px-2">
                          {balance.cctr_balance.toLocaleString()} $CCTR
                        </Badge>
                      </DropdownMenuLabel>
                      
                      {/* Quick Actions */}
                      <div className="px-2 py-3 space-y-2 border-b border-neon-cyan/10">
                        <Button
                          onClick={() => setShowWalletActions(true)}
                          size="sm"
                          className="cyber-button w-full justify-start text-xs h-8 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-cyan hover:to-neon-green"
                        >
                          <CreditCard size={12} className="mr-2" />
                          <span className="truncate">Buy • Send • Swap • Receive</span>
                        </Button>
                        <Button
                          onClick={() => setShowProfileDashboard(true)}
                          size="sm"
                          variant="outline"
                          className="w-full justify-start border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan text-xs h-8"
                        >
                          <User size={12} className="mr-2" />
                          Profile Dashboard
                        </Button>
                      </div>

                      {/* Token Balances */}
                      <div className="px-3 py-3 border-b border-neon-cyan/10">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm font-semibold text-neon-purple">Token Balances</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowBalanceDetails(true)}
                            className="text-xs hover:bg-neon-cyan/10 h-6 text-neon-cyan hover:text-neon-green"
                          >
                            View All
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs bg-neon-cyan/5 rounded-lg px-2 py-1">
                            <span className="text-neon-cyan font-medium">$CCTR:</span>
                            <span className="text-neon-green font-bold">{balance.cctr_balance.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs bg-yellow-500/5 rounded-lg px-2 py-1">
                            <span className="text-yellow-400 font-medium">SOL:</span>
                            <span className="text-yellow-400 font-bold">~0.5</span>
                          </div>
                          <div className="flex justify-between items-center text-xs bg-blue-500/5 rounded-lg px-2 py-1">
                            <span className="text-blue-400 font-medium">USDC:</span>
                            <span className="text-blue-400 font-bold">25.00</span>
                          </div>
                          <div className="flex justify-between items-center text-xs bg-orange-500/5 rounded-lg px-2 py-1">
                            <span className="text-orange-400 font-medium">BONK:</span>
                            <span className="text-orange-400 font-bold">1.2M</span>
                          </div>
                          <div className="flex justify-between items-center text-xs bg-purple-500/5 rounded-lg px-2 py-1">
                            <span className="text-purple-400 font-medium">RAY:</span>
                            <span className="text-purple-400 font-bold">12.5</span>
                          </div>
                          <div className="flex justify-between items-center text-xs bg-neon-pink/5 rounded-lg px-2 py-1">
                            <span className="text-neon-purple font-medium">Claimable:</span>
                            <span className="text-neon-pink font-bold">{balance.claimable_rewards.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Wallet Selection */}
                      {hasMultipleWallets && (
                        <div className="px-2 py-2 border-b border-neon-cyan/10">
                          <span className="text-xs font-semibold text-neon-purple mb-2 block">Connected Wallets</span>
                          {connectedWallets.map((wallet) => (
                            <DropdownMenuItem 
                              key={`${wallet.type}-${wallet.address}`}
                              onClick={() => switchPrimaryWallet(wallet)}
                              className="flex items-center gap-2 hover:bg-neon-cyan/10 rounded-lg my-1"
                            >
                              <span>{getWalletIcon(wallet.type)}</span>
                              <span className="flex-1 text-sm">
                                {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {wallet.address.slice(0, 4)}...
                              </span>
                              {primaryWallet?.address === wallet.address && (
                                <Badge className="bg-neon-green text-black text-xs">Primary</Badge>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </div>
                      )}
                      
                      {/* Connect & Support */}
                      <div className="px-3 py-3 border-b border-neon-cyan/10">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-neon-purple">Connect & Support</span>
                        </div>
                        <div className="flex justify-between text-xs mb-3">
                          <a 
                            href="https://x.com/cybercityarcade" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:bg-blue-500/10 px-2 py-1 rounded-lg transition-all"
                          >
                            🐦 Twitter
                          </a>
                          <a 
                            href="https://discord.gg/cybercityarcade" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 hover:bg-indigo-500/10 px-2 py-1 rounded-lg transition-all"
                          >
                            💬 Discord
                          </a>
                          <a 
                            href="https://instagram.com/cybercityarcade" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-pink-400 hover:text-pink-300 flex items-center gap-1 hover:bg-pink-500/10 px-2 py-1 rounded-lg transition-all"
                          >
                            📷 Instagram
                          </a>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full justify-center border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:border-yellow-500 text-xs h-7"
                        >
                          🎧 Support
                        </Button>
                      </div>
                      
                      <div className="px-2 py-2">
                        <DropdownMenuItem onSelect={handleManageWallets} className="hover:bg-neon-cyan/10 rounded-lg">
                          <Settings size={14} className="mr-2" />
                          <span className="text-sm">Manage Wallets</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDisconnectWallet(primaryWallet?.type || 'phantom')}
                          className="text-neon-pink hover:bg-neon-pink/10 rounded-lg"
                        >
                          <LogOut size={14} className="mr-2" />
                          <span className="text-sm">Disconnect Wallet</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={connectWallet}
      />

      <Dialog open={showWalletManager} onOpenChange={setShowWalletManager}>
        <DialogContent className="arcade-frame bg-background/95 backdrop-blur-sm border-neon-cyan/30 max-w-3xl">
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

      <Dialog open={showBalanceDetails} onOpenChange={setShowBalanceDetails}>
        <DialogContent className="arcade-frame bg-background/95 backdrop-blur-sm border-neon-cyan/30 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-neon-cyan font-display flex items-center gap-2">
              💰 Wallet Balance & Assets
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              View your complete wallet balance, tokens, and NFT collection
            </DialogDescription>
          </DialogHeader>
          <WalletBalanceDisplay />
        </DialogContent>
      </Dialog>

      <Dialog open={showWalletActions} onOpenChange={setShowWalletActions}>
        <DialogContent className="arcade-frame bg-background/95 backdrop-blur-sm border-neon-cyan/30 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl text-neon-green font-display flex items-center gap-2">
              💳 Wallet Actions
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Buy, send, and receive tokens with your connected wallet
            </DialogDescription>
          </DialogHeader>
          <WalletActions />
        </DialogContent>
      </Dialog>

      <Dialog open={showProfileDashboard} onOpenChange={setShowProfileDashboard}>
        <DialogContent className="arcade-frame bg-background/95 backdrop-blur-sm border-neon-cyan/30 max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-neon-cyan font-display flex items-center gap-2">
              👤 Profile Dashboard
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              View your profile, activity, achievements, and account settings
            </DialogDescription>
          </DialogHeader>
          <ProfileDashboard />
        </DialogContent>
      </Dialog>
    </>
  );
};
