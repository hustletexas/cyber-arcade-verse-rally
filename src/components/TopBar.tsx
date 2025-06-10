
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

  return (
    <header className="border-b border-neon-cyan/30 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-pink to-neon-purple rounded-lg flex items-center justify-center neon-glow">
              <span className="text-xl font-black">🕹️</span>
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-neon-cyan">CYBER CITY</h2>
              <p className="text-xs text-neon-purple">ARCADE</p>
            </div>
          </div>

          {/* Connection Status & User Info */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="text-neon-cyan">Loading...</div>
            ) : user ? (
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
            ) : (
              <div className="flex items-center gap-3">
                {/* Email Login */}
                <Button 
                  onClick={() => navigate('/auth')}
                  className="cyber-button flex items-center gap-2"
                >
                  <span className="text-lg">🔐</span>
                  LOGIN / SIGNUP
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
