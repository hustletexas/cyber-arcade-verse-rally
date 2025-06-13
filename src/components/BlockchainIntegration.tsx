
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const BlockchainIntegration = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectPhantom = async () => {
    try {
      if (window.solana && window.solana.isPhantom) {
        const response = await window.solana.connect();
        setWalletAddress(response.publicKey.toString());
        setIsConnected(true);
        toast({
          title: "Phantom Wallet Connected!",
          description: `Connected: ${response.publicKey.toString().slice(0, 8)}...`,
        });
      } else {
        window.open('https://phantom.app/', '_blank');
        toast({
          title: "Phantom Not Found",
          description: "Please install Phantom wallet",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Phantom wallet",
        variant: "destructive",
      });
    }
  };

  const mintFreeNFT = async () => {
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Minting NFT",
      description: "Free NFT mint in progress...",
    });

    // Simulate minting process
    setTimeout(() => {
      toast({
        title: "NFT Minted Successfully!",
        description: "Your free Cyber City Arcade NFT has been minted to your wallet",
      });
    }, 3000);
  };

  const openMagicEden = () => {
    window.open('https://magiceden.io/marketplace/cyber_city_arcade', '_blank');
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-purple flex items-center gap-3">
          ⛓️ BLOCKCHAIN INTEGRATION
          <Badge className="bg-neon-green text-black">SOLANA POWERED</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Wallet Connection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="holographic p-4">
            <h3 className="font-bold text-neon-cyan mb-3">Wallet Status</h3>
            {isConnected ? (
              <div className="space-y-2">
                <Badge className="bg-neon-green text-black">✅ CONNECTED</Badge>
                <p className="text-sm text-muted-foreground">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                </p>
              </div>
            ) : (
              <Button onClick={connectPhantom} className="cyber-button w-full">
                👻 CONNECT PHANTOM
              </Button>
            )}
          </Card>

          <Card className="holographic p-4">
            <h3 className="font-bold text-neon-pink mb-3">Free NFT Mint</h3>
            <p className="text-sm text-muted-foreground mb-3">
              One free NFT per wallet
            </p>
            <Button 
              onClick={mintFreeNFT}
              disabled={!isConnected}
              className="cyber-button w-full"
            >
              🔨 MINT FREE NFT
            </Button>
          </Card>
        </div>

        {/* Magic Eden Integration */}
        <Card className="vending-machine p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-xl text-neon-cyan mb-2">
                Magic Eden Marketplace
              </h3>
              <p className="text-muted-foreground">
                Buy and sell Cyber City Arcade NFTs on Magic Eden
              </p>
            </div>
            <Button onClick={openMagicEden} className="cyber-button">
              🪄 OPEN MAGIC EDEN
            </Button>
          </div>
        </Card>

        {/* Solana Network Info */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="holographic p-4">
            <h4 className="text-neon-green font-bold">NETWORK</h4>
            <p className="text-sm">Solana Mainnet</p>
          </div>
          <div className="holographic p-4">
            <h4 className="text-neon-cyan font-bold">TOKEN</h4>
            <p className="text-sm">$CCTR</p>
          </div>
          <div className="holographic p-4">
            <h4 className="text-neon-pink font-bold">SUPPLY</h4>
            <p className="text-sm">1M CCTR</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
