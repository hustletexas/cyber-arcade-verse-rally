
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TokenDashboard } from '@/components/TokenDashboard';
import { WalletConnectionModal } from '@/components/WalletConnectionModal';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export const TopBar = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showTokenDashboard, setShowTokenDashboard] = useState(false);
  const { getConnectedWallet, isWalletConnected } = useWallet();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const connectedWallet = getConnectedWallet();

  const handleWalletClick = () => {
    if (isWalletConnected()) {
      setShowTokenDashboard(true);
    } else {
      setShowWalletModal(true);
    }
  };

  const handleDisconnect = async () => {
    try {
      await signOut();
      setShowTokenDashboard(false);
      toast({
        title: "Disconnected",
        description: "Wallet and account disconnected successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect wallet",
        variant: "destructive"
      });
    }
  };

  const handleWalletConnected = (walletType: string, address: string) => {
    toast({
      title: "Wallet Connected!",
      description: `Connected to ${address.slice(0, 8)}...${address.slice(-4)}`,
    });
  };

  return (
    <>
      <header className="border-b border-neon-cyan/30 bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="font-display text-xl md:text-2xl font-black text-neon-green">
                CYBER CITY ARCADE
              </h1>
              <Badge className="bg-neon-pink text-black animate-neon-flicker hidden md:inline-flex">
                LIVE
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {user && (
                <span className="text-neon-cyan text-sm">
                  Welcome, {user.email}
                </span>
              )}
              
              <Button 
                onClick={handleWalletClick}
                className="cyber-button"
              >
                {isWalletConnected() && connectedWallet ? 
                  `${connectedWallet.address.slice(0, 4)}...${connectedWallet.address.slice(-4)}` : 
                  '🔗 CONNECT WALLET'
                }
              </Button>

              {isWalletConnected() && (
                <Button 
                  onClick={handleDisconnect}
                  variant="outline"
                  className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                >
                  DISCONNECT
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <WalletConnectionModal 
        isOpen={showWalletModal} 
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={handleWalletConnected}
      />

      {showTokenDashboard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 overflow-y-auto">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-neon-cyan">Token Dashboard</h2>
              <Button 
                onClick={() => setShowTokenDashboard(false)}
                variant="outline"
                className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
              >
                ✕ CLOSE
              </Button>
            </div>
            <TokenDashboard />
          </div>
        </div>
      )}
    </>
  );
};
