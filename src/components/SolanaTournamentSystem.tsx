
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { SolanaTournamentManager } from './SolanaTournamentManager';

export const SolanaTournamentSystem = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [hasNFTPass, setHasNFTPass] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

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
      // Mock NFT check - replace with actual NFT verification
      const mockHasNFT = Math.random() > 0.3;
      setHasNFTPass(mockHasNFT);
      
      if (!mockHasNFT) {
        toast({
          title: "NFT Pass Recommended",
          description: "Get a Cyber City Pass NFT for exclusive tournaments",
        });
      }
    } catch (error) {
      console.error('NFT check failed:', error);
      setHasNFTPass(false);
    }
  };

  const checkAdminStatus = (wallet: string) => {
    // Replace with your actual admin wallet addresses
    const adminWallets = ['YOUR_ADMIN_WALLET_ADDRESS'];
    setIsAdmin(adminWallets.includes(wallet));
  };

  return (
    <div className="space-y-6">
      {/* Quick Wallet Status */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🔗 Solana Tournament Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!walletConnected ? (
            <div className="text-center space-y-4">
              <p className="text-gray-300">Connect your Phantom wallet to join tournaments</p>
              <Button onClick={connectWallet} className="cyber-button">
                Connect Phantom Wallet
              </Button>
            </div>
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
                <Badge className={hasNFTPass ? "bg-neon-green text-black" : "bg-yellow-500 text-black"}>
                  {hasNFTPass ? "✅ Valid Pass" : "⚠️ Optional"}
                </Badge>
              </div>
              {isAdmin && (
                <Badge className="bg-neon-purple text-white">🔧 Admin Access</Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tournament Manager */}
      <SolanaTournamentManager />

      {/* Tournament Features */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-xl text-neon-cyan">
            🏆 Tournament Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="text-neon-green font-bold">🎯 Tournament System:</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Maximum 32 players per tournament</li>
                <li>• Automatic entry fee collection</li>
                <li>• Real-time player count tracking</li>
                <li>• Smart contract prize distribution</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-neon-purple font-bold">💰 Prize Distribution:</h4>
              <ul className="text-gray-300 space-y-1">
                <li>• Winner receives 90% of prize pool</li>
                <li>• Admin receives 10% service fee</li>
                <li>• Automatic SOL payouts</li>
                <li>• Transparent on-chain transactions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NFT Gate Message */}
      {walletConnected && !hasNFTPass && (
        <Card className="arcade-frame border-yellow-500">
          <CardContent className="text-center p-6">
            <h3 className="text-xl font-bold text-yellow-400 mb-3">🎫 NFT Pass Available</h3>
            <p className="text-gray-300 mb-4">
              Get a Cyber City Pass NFT for access to exclusive tournaments 
              and special rewards!
            </p>
            <Button className="cyber-button">
              Browse NFT Marketplace
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
