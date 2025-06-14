
import React, { useState, useEffect } from 'react';
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
          {/* Logo and Authentication Section */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden neon-glow border-2 border-neon-cyan/50 bg-transparent">
              <img 
                src="/lovable-uploads/c084d8de-a04e-4e1e-9e0c-ea179d67f5a7.png" 
                alt="Cyber City Arcade Logo" 
                className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* User Authentication */}
            {loading ? (
              <div className="text-neon-cyan">Loading...</div>
            ) : (
              <div className="flex items-center gap-3">
                {user ? (
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
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="cyber-button flex items-center gap-2"
                  >
                    <span className="text-lg">🔐</span>
                    LOGIN / SIGNUP
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Empty space for balance */}
          <div></div>
        </div>
      </div>
    </header>
  );
};
