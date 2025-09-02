
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useAuth } from '@/hooks/useAuth';
import { NodeInfo } from '@/components/nodes/NodeInfo';
import { NodeCards } from '@/components/nodes/NodeCards';
import { NodeRewards } from '@/components/nodes/NodeRewards';
import { NodeStatistics } from '@/components/nodes/NodeStatistics';
import { Coins, Server, Zap, TrendingUp } from 'lucide-react';

interface NodeType {
  id: string;
  name: string;
  price: number;
  dailyReward: number;
  monthlyReward: number;
  roi: number;
  maxSupply: number;
  currentSupply: number;
  icon: string;
  features: string[];
  description: string;
}

const nodeTypes: NodeType[] = [
  {
    id: 'basic',
    name: 'Basic Node',
    price: 10,
    dailyReward: 0.5,
    monthlyReward: 15,
    roi: 150,
    maxSupply: 1000,
    currentSupply: 342,
    icon: '🔷',
    features: ['Daily SOL rewards', 'Basic staking power', 'Community access'],
    description: 'Perfect for beginners entering the node ecosystem'
  },
  {
    id: 'premium',
    name: 'Premium Node',
    price: 25,
    dailyReward: 1.5,
    monthlyReward: 45,
    roi: 180,
    maxSupply: 500,
    currentSupply: 167,
    icon: '💎',
    features: ['Higher daily rewards', 'Enhanced staking power', 'Priority support', 'Exclusive events'],
    description: 'Advanced node for serious validators with enhanced rewards'
  },
  {
    id: 'legendary',
    name: 'Legendary Node',
    price: 50,
    dailyReward: 3.5,
    monthlyReward: 105,
    roi: 210,
    maxSupply: 100,
    currentSupply: 23,
    icon: '🏆',
    features: ['Maximum rewards', 'Ultimate staking power', 'VIP support', 'Governance voting', 'NFT airdrops'],
    description: 'Elite node with maximum earning potential and exclusive benefits'
  }
];

export const NodePurchase = () => {
  const { toast } = useToast();
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const { user } = useAuth();
  const [purchasingNode, setPurchasingNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeType>(nodeTypes[0]);

  const handleNodePurchase = async (nodeType: NodeType) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase a node",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase a node",
        variant: "destructive",
      });
      return;
    }

    setPurchasingNode(nodeType.id);
    
    try {
      // Simulate node purchase transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Node Purchased Successfully!",
        description: `Your ${nodeType.name} is now active and earning rewards`,
      });
      
      // Update node supply (simulation)
      nodeType.currentSupply += 1;
      
    } catch (error) {
      console.error('Node purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: "Failed to purchase node. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPurchasingNode(null);
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-3xl text-neon-cyan flex items-center gap-3">
          <Server className="w-8 h-8" />
          SOLANA NODES
          <Badge className="bg-neon-green text-black">EARN PASSIVE SOL</Badge>
        </CardTitle>
        <p className="text-muted-foreground text-lg">
          Own validator nodes on Solana blockchain and earn daily SOL rewards
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <Tabs defaultValue="purchase" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="purchase">Purchase Nodes</TabsTrigger>
            <TabsTrigger value="info">How It Works</TabsTrigger>
            <TabsTrigger value="rewards">My Rewards</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="purchase" className="space-y-6">
            <NodeCards 
              nodeTypes={nodeTypes}
              onPurchase={handleNodePurchase}
              purchasingNode={purchasingNode}
              isWalletConnected={isWalletConnected}
            />
          </TabsContent>

          <TabsContent value="info">
            <NodeInfo />
          </TabsContent>

          <TabsContent value="rewards">
            <NodeRewards 
              userWallet={primaryWallet?.address || ''}
              isWalletConnected={isWalletConnected}
            />
          </TabsContent>

          <TabsContent value="stats">
            <NodeStatistics nodeTypes={nodeTypes} />
          </TabsContent>
        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="holographic p-4 text-center">
            <Coins className="w-6 h-6 text-neon-green mx-auto mb-2" />
            <h4 className="text-neon-green font-bold text-sm">TOTAL NODES</h4>
            <p className="text-lg font-mono">{nodeTypes.reduce((sum, node) => sum + node.currentSupply, 0)}</p>
          </div>
          <div className="holographic p-4 text-center">
            <Server className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
            <h4 className="text-neon-cyan font-bold text-sm">ACTIVE VALIDATORS</h4>
            <p className="text-lg font-mono">532</p>
          </div>
          <div className="holographic p-4 text-center">
            <Zap className="w-6 h-6 text-neon-pink mx-auto mb-2" />
            <h4 className="text-neon-pink font-bold text-sm">DAILY REWARDS</h4>
            <p className="text-lg font-mono">1,247 SOL</p>
          </div>
          <div className="holographic p-4 text-center">
            <TrendingUp className="w-6 h-6 text-neon-purple mx-auto mb-2" />
            <h4 className="text-neon-purple font-bold text-sm">AVG ROI</h4>
            <p className="text-lg font-mono">180%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
