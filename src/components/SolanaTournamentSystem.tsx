
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const SolanaTournamentSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [hasNFTPass, setHasNFTPass] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect({ onlyIfTrusted: true });
        if (response.publicKey) {
          setWalletConnected(true);
          setWalletAddress(response.publicKey.toString());
          await checkNFTPass(response.publicKey.toString());
          checkAdminStatus(response.publicKey.toString());
        }
      }
    } catch (error) {
      console.log('Wallet not connected:', error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.solana) {
        toast({
          title: "Wallet Not Found",
          description: "Please install Phantom wallet to continue",
          variant: "destructive"
        });
        return;
      }

      const response = await window.solana.connect();
      setWalletConnected(true);
      setWalletAddress(response.publicKey.toString());
      await checkNFTPass(response.publicKey.toString());
      checkAdminStatus(response.publicKey.toString());
      
      toast({
        title: "Wallet Connected",
        description: `Connected: ${response.publicKey.toString().slice(0, 8)}...`
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  const checkNFTPass = async (wallet: string) => {
    try {
      const mockHasNFT = Math.random() > 0.3;
      setHasNFTPass(mockHasNFT);
      
      if (!mockHasNFT) {
        toast({
          title: "NFT Pass Required",
          description: "You need a Cyber City Pass NFT to enter tournaments",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('NFT check failed:', error);
      setHasNFTPass(false);
    }
  };

  const checkAdminStatus = (wallet: string) => {
    const adminWallets = ['YOUR_ADMIN_WALLET_ADDRESS'];
    setIsAdmin(adminWallets.includes(wallet));
  };

  const removeActiveTournaments = async () => {
    if (!isAdmin) {
      toast({
        title: "Admin Access Required",
        description: "Only admins can remove tournaments",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: 'cancelled' })
        .eq('status', 'active');

      if (error) throw error;

      toast({
        title: "Active Tournaments Removed",
        description: "All active tournaments have been cancelled successfully"
      });
    } catch (error) {
      toast({
        title: "Removal Failed",
        description: "Failed to remove active tournaments",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Connection */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🔗 Solana Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!walletConnected ? (
            <Button onClick={connectWallet} className="cyber-button w-full">
              Connect Phantom Wallet
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-neon-green">✅ Wallet Connected</span>
                <Badge className="bg-neon-cyan text-black">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>NFT Pass Status:</span>
                <Badge className={hasNFTPass ? "bg-neon-green text-black" : "bg-red-500 text-white"}>
                  {hasNFTPass ? "✅ Valid Pass" : "❌ No Pass"}
                </Badge>
              </div>
              {isAdmin && (
                <Badge className="bg-neon-purple text-white">🔧 Admin Access</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Tournament Management */}
      {isAdmin && (
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-xl text-neon-purple">
              🏆 Admin Tournament Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button 
                onClick={removeActiveTournaments} 
                disabled={loading}
                variant="destructive"
                className="flex-1"
              >
                {loading ? 'Removing...' : 'Remove All Active Tournaments'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* NFT Gate Message */}
      {walletConnected && !hasNFTPass && (
        <Card className="arcade-frame border-red-500">
          <CardContent className="text-center p-6">
            <h3 className="text-xl font-bold text-red-400 mb-3">🚫 NFT Pass Required</h3>
            <p className="text-gray-300 mb-4">
              You need a Cyber City Pass NFT to enter tournaments. 
              Purchase one from our marketplace to get started!
            </p>
            <Button className="cyber-button">
              Buy NFT Pass
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
