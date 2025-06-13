
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const TopBar = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleWalletConnect = (walletType: 'phantom' | 'metamask' | 'walletconnect') => {
    toast({
      title: "Wallet Connect",
      description: `${walletType} integration coming soon!`,
    });
  };

  return (
    <header className="border-b border-neon-cyan/30 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden">
              <img 
                src="/lovable-uploads/c084d8de-a04e-4e1e-9e0c-ea179d67f5a7.png" 
                alt="Cyber City Arcade Logo" 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 0.5))' }}
              />
            </div>
          </div>

          {/* Connection Status & User Info */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="text-neon-cyan animate-pulse">Loading...</div>
            ) : user ? (
              <Card className="bg-gray-800/80 border border-neon-cyan/50 px-4 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8 border-2 border-neon-cyan">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-neon-purple text-white font-bold">
                      {user.user_metadata?.username?.charAt(0) || user.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-bold text-neon-cyan">
                      {user.user_metadata?.username || user.email?.split('@')[0]}
                    </p>
                    <p className="text-neon-purple text-xs">{user.email}</p>
                  </div>
                  <Badge className="bg-neon-green text-black font-bold">
                    🔐 AUTHENTICATED
                  </Badge>
                  <Button 
                    onClick={handleSignOut}
                    className="bg-neon-pink/20 border border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black transition-all duration-300 font-bold"
                    size="sm"
                  >
                    LOGOUT
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="flex items-center gap-3">
                {/* Email Login */}
                <Button 
                  onClick={() => navigate('/auth')}
                  className="bg-gradient-to-r from-neon-cyan to-neon-purple text-black font-bold px-6 py-3 rounded-lg hover:scale-105 transition-all duration-300 shadow-lg shadow-neon-cyan/50"
                >
                  <span className="text-lg mr-2">🔐</span>
                  LOGIN / SIGNUP
                </Button>

                {/* Wallet Connect Options */}
                <div className="hidden md:flex gap-2">
                  <Button 
                    onClick={() => handleWalletConnect('phantom')}
                    className="bg-neon-purple/20 border border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black font-bold transition-all duration-300"
                    size="sm"
                  >
                    👻 PHANTOM
                  </Button>
                  <Button 
                    onClick={() => handleWalletConnect('metamask')}
                    className="bg-neon-cyan/20 border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black font-bold transition-all duration-300"
                    size="sm"
                  >
                    🦊 METAMASK
                  </Button>
                  <Button 
                    onClick={() => handleWalletConnect('walletconnect')}
                    className="bg-neon-green/20 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black font-bold transition-all duration-300"
                    size="sm"
                  >
                    🔗 WALLET
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
