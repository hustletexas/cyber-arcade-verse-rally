
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
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                onClick={() => setIsOpen(true)}
                className="cyber-button flex items-center gap-2 relative"
              >
                <ShoppingCart size={16} />
                CART
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-neon-pink text-black min-w-[20px] h-5 rounded-full flex items-center justify-center text-xs">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>

            <div className="flex items-center">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden neon-glow border-2 border-neon-cyan/50 bg-transparent">
                <img 
                  src="/lovable-uploads/c084d8de-a04e-4e1e-9e0c-ea179d67f5a7.png" 
                  alt="Cyber City Arcade Logo" 
                  className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {loading ? (
                <div className="text-neon-cyan">Loading...</div>
              ) : (
                user && (
                  <Card className="arcade-frame px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border-2 border-neon-cyan">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-neon-purple text-black font-bold">
                          {user.user_metadata?.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-bold text-neon-cyan">
                          {user.user_metadata?.username || user.email?.split('@')[0]}
                        </p>
                        <p className="text-neon-purple text-xs">{user.email}</p>
                        {primaryWallet && (
                          <p className="text-neon-green text-xs">
                            {getWalletIcon(primaryWallet.type)} {primaryWallet.address.slice(0, 6)}...
                          </p>
                        )}
                      </div>
                      <Badge className="bg-neon-green text-black">
                        🔐 AUTHENTICATED
                      </Badge>
                      <Button 
                        onClick={handleSignOut}
                        variant="outline" 
                        size="sm"
                        className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black flex items-center gap-1"
                      >
                        <LogOut size={14} />
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
                    className="cyber-button flex items-center gap-2"
                    size="sm"
                  >
                    <Settings size={16} />
                    MANAGE WALLETS
                  </Button>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black min-w-[200px]"
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            {getWalletIcon(primaryWallet?.type || 'phantom')} 
                            <span>{primaryWallet?.address.slice(0, 6)}...</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs">
                            <Coins size={12} />
                            <span>{balance.cctr_balance.toLocaleString()}</span>
                          </div>
                          <ChevronDown size={16} />
                        </div>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="arcade-frame bg-background/95 backdrop-blur-sm border-neon-cyan/30 z-50 min-w-[300px]">
                      <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Wallet Actions</span>
                        <Badge className="bg-neon-green text-black text-xs">
                          {balance.cctr_balance.toLocaleString()} $CCTR
                        </Badge>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Quick Actions */}
                      <div className="px-2 py-2 space-y-2">
                        <Button
                          onClick={() => setShowWalletActions(true)}
                          size="sm"
                          className="cyber-button w-full justify-start"
                        >
                          <CreditCard size={14} className="mr-2" />
                          Buy / Send / Receive
                        </Button>
                        <Button
                          onClick={() => setShowProfileDashboard(true)}
                          size="sm"
                          variant="outline"
                          className="w-full justify-start border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                        >
                          <User size={14} className="mr-2" />
                          Profile Dashboard
                        </Button>
                      </div>

                      <DropdownMenuSeparator />
                      
                      {/* Balance Overview */}
                      <div className="px-2 py-3 border-b border-neon-cyan/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Balance Overview</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowBalanceDetails(true)}
                            className="text-xs hover:bg-neon-cyan/10"
                          >
                            View Details
                          </Button>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-neon-cyan">$CCTR Balance:</span>
                            <span className="text-neon-green font-bold">{balance.cctr_balance.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-neon-purple">Claimable:</span>
                            <span className="text-neon-pink font-bold">{balance.claimable_rewards.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">SOL Balance:</span>
                            <span className="text-neon-yellow">~0.5 SOL</span>
                          </div>
                        </div>
                      </div>

                      {/* Wallet Selection */}
                      {hasMultipleWallets && connectedWallets.map((wallet) => (
                        <DropdownMenuItem 
                          key={`${wallet.type}-${wallet.address}`}
                          onClick={() => switchPrimaryWallet(wallet)}
                          className="flex items-center gap-2 hover:bg-neon-cyan/10"
                        >
                          <span>{getWalletIcon(wallet.type)}</span>
                          <span className="flex-1">
                            {wallet.type.charAt(0).toUpperCase() + wallet.type.slice(1)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {wallet.address.slice(0, 6)}...
                          </span>
                          {primaryWallet?.address === wallet.address && (
                            <Badge className="bg-neon-green text-black text-xs">Primary</Badge>
                          )}
                        </DropdownMenuItem>
                      ))}
                      
                      <DropdownMenuSeparator />
                      
                      {/* NFTs Preview */}
                      <div className="px-2 py-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Image size={14} />
                            NFTs
                          </span>
                          <Badge className="bg-neon-purple text-black text-xs">3 Items</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Click "View Details" to see your NFT collection
                        </div>
                      </div>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleManageWallets} className="hover:bg-neon-cyan/10">
                        <Settings size={16} className="mr-2" />
                        Manage Wallets
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDisconnectWallet(primaryWallet?.type || 'phantom')}
                        className="text-neon-pink hover:bg-neon-pink/10"
                      >
                        <LogOut size={16} className="mr-2" />
                        Disconnect Wallet
                      </DropdownMenuItem>
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
