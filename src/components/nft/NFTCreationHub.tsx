
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { Palette, Music, Sparkles, Zap } from 'lucide-react';
import { NFTCreationForm } from './NFTCreationForm';
import { NFTOrderHistory } from './NFTOrderHistory';

export const NFTCreationHub = () => {
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { balance } = useUserBalance();
  const [activeTab, setActiveTab] = useState('create');

  if (!user || !isWalletConnected) {
    return (
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-pink flex items-center gap-3">
            🎨 PREMIUM NFT CREATION
            <Badge className="bg-neon-yellow text-black">EXCLUSIVE</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-neon-cyan mb-2">Authentication Required</h3>
            <p className="text-muted-foreground mb-6">
              Connect your wallet and sign in to access our premium NFT creation service
            </p>
            <div className="space-y-2">
              <p className="text-sm text-neon-green">✨ Professional-grade minting</p>
              <p className="text-sm text-neon-purple">🎵 Music & Art NFTs</p>
              <p className="text-sm text-neon-cyan">⚡ Solana blockchain</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-neon-pink flex items-center gap-3">
            🎨 PREMIUM NFT CREATION STUDIO
            <Badge className="bg-neon-yellow text-black animate-pulse">LIVE</Badge>
          </CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <Badge className="bg-neon-green text-black">
              💰 Balance: {balance.cctr_balance.toLocaleString()} $CCTR
            </Badge>
            <Badge className="bg-neon-cyan text-black">
              🔗 {primaryWallet?.address.slice(0, 8)}...{primaryWallet?.address.slice(-4)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="vending-machine p-4">
              <div className="text-center">
                <Music className="w-12 h-12 text-neon-purple mx-auto mb-2" />
                <h3 className="font-bold text-neon-purple">MUSIC NFTs</h3>
                <p className="text-sm text-muted-foreground">Professional music NFTs with metadata</p>
                <Badge className="bg-neon-purple text-white mt-2">500 $CCTR</Badge>
              </div>
            </Card>
            
            <Card className="vending-machine p-4">
              <div className="text-center">
                <Palette className="w-12 h-12 text-neon-cyan mx-auto mb-2" />
                <h3 className="font-bold text-neon-cyan">ART NFTs</h3>
                <p className="text-sm text-muted-foreground">High-resolution art collections</p>
                <Badge className="bg-neon-cyan text-black mt-2">500 $CCTR</Badge>
              </div>
            </Card>
            
            <Card className="vending-machine p-4">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-neon-yellow mx-auto mb-2" />
                <h3 className="font-bold text-neon-yellow">HYBRID NFTs</h3>
                <p className="text-sm text-muted-foreground">Music + Art combinations</p>
                <Badge className="bg-neon-yellow text-black mt-2">750 $CCTR</Badge>
              </div>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="cyber-button">
                <Zap className="w-4 h-4 mr-2" />
                CREATE NFT
              </TabsTrigger>
              <TabsTrigger value="history">
                📋 ORDER HISTORY
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="create">
              <NFTCreationForm />
            </TabsContent>
            
            <TabsContent value="history">
              <NFTOrderHistory />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
