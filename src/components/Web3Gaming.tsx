
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameGrid } from './web3games/GameGrid';
import { FeaturedGames } from './web3games/FeaturedGames';
import { GameCategories } from './web3games/GameCategories';
import { PlayerProgress } from './web3games/PlayerProgress';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { toast } from 'sonner';

export const Web3Gaming = () => {
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const [activeCategory, setActiveCategory] = useState('all');

  const connectWallet = async () => {
    if (window.solana && window.solana.isPhantom) {
      try {
        await window.solana.connect();
        toast.success('Wallet connected! Ready to play Web3 games');
      } catch (error) {
        toast.error('Failed to connect wallet');
      }
    } else {
      window.open('https://phantom.app/', '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-neon-cyan text-center flex items-center justify-center gap-3">
            🎮 WEB3 GAMING PORTAL
            <Badge className="bg-neon-purple text-white">BLOCKCHAIN POWERED</Badge>
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Play, earn, and own your gaming experience • NFT rewards • Decentralized gaming
          </p>
          {primaryWallet && (
            <div className="text-center mt-2">
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                🔗 Connected: {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Gaming Tabs */}
      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="grid w-full grid-cols-4 arcade-frame">
          <TabsTrigger value="featured" className="cyber-button">🌟 Featured</TabsTrigger>
          <TabsTrigger value="browse" className="cyber-button">🎯 Browse</TabsTrigger>
          <TabsTrigger value="categories" className="cyber-button">📂 Categories</TabsTrigger>
          <TabsTrigger value="progress" className="cyber-button">📊 Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="mt-6">
          <FeaturedGames />
        </TabsContent>

        <TabsContent value="browse" className="mt-6">
          <GameGrid category={activeCategory} />
        </TabsContent>

        <TabsContent value="categories" className="mt-6">
          <GameCategories onCategorySelect={setActiveCategory} />
        </TabsContent>

        <TabsContent value="progress" className="mt-6">
          {isWalletConnected ? (
            <PlayerProgress />
          ) : (
            <Card className="arcade-frame border-neon-pink/30">
              <CardContent className="text-center py-8">
                <div className="text-4xl mb-4">🔐</div>
                <h3 className="text-xl font-bold text-neon-pink mb-2">Connect Wallet Required</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your wallet to track gaming progress and earn rewards
                </p>
                <Button onClick={connectWallet} className="cyber-button">
                  🚀 Connect Wallet
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
