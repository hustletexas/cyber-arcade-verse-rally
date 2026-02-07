import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GameGrid } from './web3games/GameGrid';
import { FeaturedGames } from './web3games/FeaturedGames';
import { GameCategories } from './web3games/GameCategories';
import { PlayerProgress } from './web3games/PlayerProgress';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { toast } from 'sonner';
export const Web3Gaming = () => {
  const {
    isWalletConnected,
    primaryWallet
  } = useMultiWallet();
  const [activeCategory, setActiveCategory] = useState('all');
  const connectWallet = async () => {
    // Use Freighter for Stellar wallet connection
    if (window.freighter) {
      try {
        const publicKey = await window.freighter.getPublicKey();
        if (publicKey) {
          toast.success('Stellar wallet connected! Ready to play Web3 games');
        }
      } catch (error) {
        toast.error('Failed to connect Stellar wallet');
      }
    } else {
      window.open('https://freighter.app/', '_blank');
    }
  };
  return <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          
          <p className="text-center text-muted-foreground">Gateway to to the gaming world</p>
        </CardHeader>
      </Card>

      {/* Gaming Tabs */}
      <Tabs defaultValue="featured" className="w-full">
        <TabsList className="grid w-full grid-cols-2 arcade-frame">
          <TabsTrigger value="featured" className="cyber-button">🌟 Featured</TabsTrigger>
          <TabsTrigger value="progress" className="cyber-button">📊 Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="mt-6">
          <FeaturedGames />
        </TabsContent>


        <TabsContent value="progress" className="mt-6">
          {isWalletConnected ? <PlayerProgress /> : <Card className="arcade-frame border-neon-pink/30">
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
            </Card>}
        </TabsContent>
      </Tabs>
    </div>;
};