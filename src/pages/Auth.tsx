
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Wallet, ArrowRight } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { user, isWalletConnected, phantomConnect, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (user && isWalletConnected) {
      navigate('/');
    }
  }, [user, isWalletConnected, navigate]);

  const handleConnect = async () => {
    try {
      await phantomConnect();
      // After successful connection, redirect to home
      navigate('/');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background vhs-glitch flex items-center justify-center">
        <div className="text-neon-cyan">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background vhs-glitch flex items-center justify-center px-4">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-purple/10 to-neon-cyan/10 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <Card className="arcade-frame w-full max-w-md relative z-10">
        <CardHeader className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-neon-purple to-neon-pink rounded-lg flex items-center justify-center neon-glow mx-auto mb-4">
            <Wallet size={40} className="text-white" />
          </div>
          <CardTitle className="font-display text-3xl text-neon-cyan mb-2">
            CONNECT WALLET
          </CardTitle>
          <p className="text-neon-purple text-lg">
            Access Cyber City Arcade with your Phantom wallet
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 text-neon-green">
                <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span>
                <span className="text-sm font-medium">Phantom Wallet Required</span>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Connect your Phantom wallet to access all arcade features, tournaments, and rewards.
              </p>
            </div>

            <Button
              onClick={handleConnect}
              className="w-full cyber-button text-lg py-6 flex items-center gap-3"
            >
              <Wallet size={24} />
              CONNECT PHANTOM WALLET
              <ArrowRight size={20} />
            </Button>

            <div className="grid grid-cols-1 gap-3 text-center text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-neon-cyan rounded-full"></span>
                <span>Secure blockchain authentication</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-neon-green rounded-full"></span>
                <span>Earn and manage CCTR tokens</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-1 h-1 bg-neon-pink rounded-full"></span>
                <span>Participate in tournaments & voting</span>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="border-neon-green text-neon-green hover:bg-neon-green hover:text-black"
            >
              🏠 BACK TO ARCADE
            </Button>
          </div>

          <Card className="bg-neon-cyan/10 border-neon-cyan/30">
            <CardContent className="p-4">
              <div className="text-center space-y-2">
                <h4 className="text-neon-cyan font-bold text-sm">Don't have Phantom?</h4>
                <p className="text-xs text-muted-foreground">
                  Download the Phantom wallet extension to get started with Solana.
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('https://phantom.app/', '_blank')}
                  className="text-neon-purple hover:text-neon-pink"
                >
                  Download Phantom →
                </Button>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
