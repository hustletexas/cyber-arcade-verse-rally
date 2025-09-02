
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NodeCards } from './nodes/NodeCards';
import { NodeInfo } from './nodes/NodeInfo';
import { NodeRewards } from './nodes/NodeRewards';
import { NodeStatistics } from './nodes/NodeStatistics';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';

export const NodePurchase = () => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('purchase');

  const connectWallet = () => {
    toast({
      title: "Connect Wallet",
      description: "Please connect a Solana wallet to purchase nodes",
      variant: "destructive"
    });
  };

  const userWallet = primaryWallet?.address || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-3xl text-neon-cyan text-center">
            ⚡ SOLANA NODE NETWORK
          </CardTitle>
          <p className="text-center text-muted-foreground">
            Purchase and operate validator nodes on the Solana blockchain • Earn daily SOL rewards • Support network decentralization
          </p>
          {isWalletConnected && (
            <div className="text-center mt-2">
              <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
                🔗 Connected: {userWallet.slice(0, 8)}...{userWallet.slice(-4)}
              </Badge>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-center">
          <TabsList className="bg-gray-800/50">
            <TabsTrigger 
              value="purchase" 
              className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black"
            >
              🛒 Purchase Nodes
            </TabsTrigger>
            <TabsTrigger 
              value="info" 
              className="data-[state=active]:bg-neon-purple data-[state=active]:text-black"
            >
              📚 How It Works
            </TabsTrigger>
            <TabsTrigger 
              value="rewards" 
              className="data-[state=active]:bg-neon-pink data-[state=active]:text-black"
            >
              💰 My Rewards
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-neon-green data-[state=active]:text-black"
            >
              📊 Network Stats
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="purchase">
          <NodeCards />
        </TabsContent>

        <TabsContent value="info">
          <NodeInfo />
        </TabsContent>

        <TabsContent value="rewards">
          <NodeRewards />
        </TabsContent>

        <TabsContent value="stats">
          <NodeStatistics />
        </TabsContent>
      </Tabs>

      {/* Connection CTA */}
      {!isWalletConnected && (
        <Card className="arcade-frame border-neon-pink/30">
          <CardContent className="text-center py-8">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-neon-pink mb-2">Connect Your Solana Wallet</h3>
            <p className="text-muted-foreground mb-4">
              Connect your Solana wallet to purchase nodes, track rewards, and participate in the validator network
            </p>
            <Button onClick={connectWallet} className="cyber-button">
              🚀 Connect Wallet
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Network Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-cyan">
              ⚡ Network Benefits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Support Solana decentralization</li>
              <li>• Earn passive SOL rewards</li>
              <li>• Help secure the network</li>
              <li>• Participate in governance</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-purple">
              🎯 Node Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• 24/7 automated operation</li>
              <li>• Real-time monitoring</li>
              <li>• Daily reward distribution</li>
              <li>• Professional infrastructure</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="arcade-frame">
          <CardHeader>
            <CardTitle className="font-display text-lg text-neon-pink">
              💎 Exclusive Perks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Priority tournament access</li>
              <li>• Bonus CCTR token rewards</li>
              <li>• Exclusive NFT airdrops</li>
              <li>• VIP community access</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
