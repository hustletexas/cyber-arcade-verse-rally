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
import { ShoppingCart, ChevronDown, Wallet, LogOut, Settings } from 'lucide-react';
import { WalletConnectionModal } from './WalletConnectionModal';
import { WalletManager } from './WalletManager';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

export const TopBar = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTotalItems, setIsOpen } = useCart();
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
  
  // Initialize wallet authentication
  const { logoutWallet } = useWalletAuth();
  
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showWalletManager, setShowWalletManager] = useState(false);

  const handleSignOut = async () => {
    try {
      // If user has wallet connected, also logout from wallet auth
      if (isWalletConnected) {
        await logoutWallet();
      }
      
      // Sign out from regular auth
      await signOut();
      
      // Disconnect all wallets
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

  const handleWalletConnect = () => {
    setShowWalletModal(true);
  };

  const handleDisconnectWallet = async (walletType: string) => {
    try {
      // If this is the primary wallet and user is logged in via wallet, logout first
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
    // Open instantly and ensure focus moves to dialog content
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        className="cyber-button flex items-center gap-2"
                        size="sm"
                      >
                        <Wallet size={16} />
                        CONNECT WALLET
                        <ChevronDown size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="arcade-frame bg-background/95 backdrop-blur-sm border-neon-cyan/30 z-50">
                      <DropdownMenuLabel>Wallet Options</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={handleWalletConnect} className="hover:bg-neon-cyan/10">
                        <Wallet size={16} className="mr-2" />
                        Connect External Wallet
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={handleManageWallets} className="hover:bg-neon-cyan/10">
                        <Settings size={16} className="mr-2" />
                        Manage Wallets
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : hasMultipleWallets ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                      >
                        {getWalletIcon(primaryWallet?.type || 'phantom')} 
                        {primaryWallet?.address.slice(0, 6)}...
                        <ChevronDown size={16} className="ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="arcade-frame bg-background/95 backdrop-blur-sm border-neon-cyan/30 z-50">
                      <DropdownMenuLabel>Connected Wallets</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {connectedWallets.map((wallet) => (
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
                      <DropdownMenuItem onClick={handleWalletConnect} className="hover:bg-neon-cyan/10">
                        <Wallet size={16} className="mr-2" />
                        Add Wallet
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
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                      >
                        {getWalletIcon(primaryWallet?.type || 'phantom')} 
                        {primaryWallet?.address.slice(0, 6)}...
                        <ChevronDown size={16} className="ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="arcade-frame bg-background/95 backdrop-blur-sm border-neon-cyan/30 z-50">
                      <DropdownMenuLabel>Wallet Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleWalletConnect} className="hover:bg-neon-cyan/10">
                        <Wallet size={16} className="mr-2" />
                        Add Wallet
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

              {/* Show login button only if no wallet connected and no user */}
              {!user && !isWalletConnected && (
                <Button 
                  onClick={() => navigate('/auth')}
                  className="cyber-button flex items-center gap-2"
                  size="sm"
                >
                  🔐 LOGIN
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={connectWallet}
      />

      {showWalletManager && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="relative">
            <Button
              onClick={() => setShowWalletManager(false)}
              className="absolute -top-2 -right-2 z-10 w-8 h-8 p-0 rounded-full bg-neon-pink text-black hover:bg-neon-pink/80"
            >
              ✕
            </Button>
            <WalletManager />
          </div>
        </div>
      )}
    </>
  );
};
