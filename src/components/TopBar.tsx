
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useWallet } from '@/hooks/useWallet';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { ShoppingCart, Wallet } from 'lucide-react';

export const TopBar = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getTotalItems, setIsOpen } = useCart();
  const { getConnectedWallet, isWalletConnected } = useWallet();
  const { authenticateWithWallet, isAuthenticating, isFullyAuthenticated } = useWalletAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Goodbye!",
        description: "Successfully logged out from Cyber City Arcade",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const connectPhantom = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        const address = response.publicKey.toString();
        
        toast({
          title: "Phantom Connected!",
          description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
        });

        // Authentication will happen automatically via useWalletAuth hook
      } else {
        toast({
          title: "Phantom Not Found",
          description: "Please install Phantom wallet extension",
          variant: "destructive",
        });
        window.open('https://phantom.app/', '_blank');
      }
    } catch (error) {
      console.error('Phantom connection error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    }
  };

  const disconnectPhantom = async () => {
    try {
      if (window.solana) {
        await window.solana.disconnect();
        // Sign out from auth as well
        if (user) {
          await signOut();
        }
        toast({
          title: "Phantom Disconnected",
          description: "Successfully disconnected from Phantom wallet",
        });
      }
    } catch (error) {
      console.error('Phantom disconnection error:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect from Phantom wallet",
        variant: "destructive",
      });
    }
  };

  const connectedWallet = getConnectedWallet();

  return (
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
            {loading || isAuthenticating ? (
              <div className="text-neon-cyan">Loading...</div>
            ) : (
              <div className="flex items-center gap-4">
                {/* Authentication Status */}
                {isFullyAuthenticated ? (
                  <Card className="arcade-frame px-4 py-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 border-2 border-neon-cyan">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-neon-purple text-black font-bold">
                          {user?.user_metadata?.username?.charAt(0) || 'W'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-bold text-neon-cyan">
                          {user?.user_metadata?.username || `${connectedWallet?.type}_user`}
                        </p>
                        <p className="text-neon-purple text-xs">
                          {connectedWallet?.address.slice(0, 8)}...{connectedWallet?.address.slice(-4)}
                        </p>
                      </div>
                      <Badge className="bg-neon-green text-black">
                        🔐 AUTHENTICATED
                      </Badge>
                      <Button 
                        onClick={handleSignOut}
                        variant="outline" 
                        size="sm"
                        className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                      >
                        Logout
                      </Button>
                    </div>
                  </Card>
                ) : !user ? (
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="cyber-button flex items-center gap-2"
                  >
                    <span className="text-lg">🔐</span>
                    LOGIN / SIGNUP
                  </Button>
                ) : null}

                {/* Wallet Connection */}
                <div className="flex items-center gap-2">
                  {connectedWallet ? (
                    <Button 
                      onClick={disconnectPhantom}
                      variant="outline"
                      size="sm"
                      className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                    >
                      <Wallet size={16} className="mr-1" />
                      👻 {connectedWallet.address.slice(0, 6)}...
                    </Button>
                  ) : (
                    <Button 
                      onClick={connectPhantom}
                      className="cyber-button flex items-center gap-2"
                      size="sm"
                    >
                      <Wallet size={16} />
                      👻 PHANTOM
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
