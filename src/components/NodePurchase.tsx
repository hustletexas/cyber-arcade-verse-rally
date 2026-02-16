
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useAuth } from '@/hooks/useAuth';
import { useStellarNodes } from '@/hooks/useStellarNodes';
import { NodeInfo } from '@/components/nodes/NodeInfo';
import { NodeCards } from '@/components/nodes/NodeCards';
import { NodeRewards } from '@/components/nodes/NodeRewards';
import { NodeStatistics } from '@/components/nodes/NodeStatistics';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { Coins, Server, Zap, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  currency: string;
}

const nodeTypes: NodeType[] = [
  {
    id: 'basic',
    name: 'Basic Node',
    price: 1000,
    dailyReward: 5,
    monthlyReward: 150,
    roi: 150,
    maxSupply: 5000,
    currentSupply: 0,
    icon: '🔷',
    features: ['Daily CCTR rewards', 'Basic staking power', 'Community access'],
    description: 'Perfect for beginners entering the CCTR node ecosystem',
    currency: 'CCTR'
  },
  {
    id: 'premium',
    name: 'Premium Node',
    price: 10000,
    dailyReward: 60,
    monthlyReward: 1800,
    roi: 180,
    maxSupply: 2000,
    currentSupply: 0,
    icon: '💎',
    features: ['Higher daily rewards', 'Enhanced staking power', 'Priority support', 'Exclusive events'],
    description: 'Advanced node for serious operators with enhanced rewards',
    currency: 'CCTR'
  },
  {
    id: 'legendary',
    name: 'Legendary Node',
    price: 100000,
    dailyReward: 700,
    monthlyReward: 21000,
    roi: 210,
    maxSupply: 100,
    currentSupply: 0,
    icon: '🏆',
    features: ['Maximum rewards', 'Ultimate staking power', 'VIP support', 'Governance voting', 'NFT airdrops'],
    description: 'Elite node with maximum earning potential and exclusive benefits',
    currency: 'CCTR'
  }
];

export const NodePurchase = () => {
  const { toast } = useToast();
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const { user } = useAuth();
  const { purchaseNode, isProcessing, userNodes, fetchUserNodes } = useStellarNodes();
  const [nodeSupplies, setNodeSupplies] = useState({ basic: 0, premium: 0, legendary: 0 });
  const [selectedNode, setSelectedNode] = useState<NodeType>(nodeTypes[0]);

  // Fetch current node supplies from database
  const fetchNodeSupplies = async () => {
    try {
      const { data, error } = await supabase
        .from('node_purchases')
        .select('node_type');
      
      if (error) throw error;

      const supplies = { basic: 0, premium: 0, legendary: 0 };
      data?.forEach(purchase => {
        supplies[purchase.node_type as keyof typeof supplies] += 1;
      });
      setNodeSupplies(supplies);
      
      // Update nodeTypes with current supplies
      nodeTypes.forEach(node => {
        node.currentSupply = supplies[node.id as keyof typeof supplies];
      });
    } catch (error) {
      console.error('Error fetching node supplies:', error);
    }
  };

  useEffect(() => {
    fetchNodeSupplies();
  }, []);

  const handleNodePurchase = async (nodeType: NodeType) => {
    await purchaseNode({
      nodeType: nodeType.id as 'basic' | 'premium' | 'legendary',
      price: nodeType.price,
      onSuccess: () => {
        fetchNodeSupplies(); // Refresh supplies after purchase
      }
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toFixed(0);
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-3xl text-neon-cyan flex items-center gap-3">
          <Server className="w-8 h-8" />
          CCTR NODES
          <Badge className="bg-neon-green text-black">EARN PASSIVE CCTR</Badge>
        </CardTitle>
        <p className="text-muted-foreground text-lg">
          Own CCTR validator nodes and earn daily token rewards
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Wallet Connection Status */}
        <WalletStatusBar />

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
              purchasingNode={isProcessing ? 'processing' : null}
              isWalletConnected={isWalletConnected}
            />
          </TabsContent>

          <TabsContent value="info">
            <NodeInfo />
          </TabsContent>

          <TabsContent value="rewards">
            <NodeRewards userNodes={userNodes} />
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
            <p className="text-lg font-mono">{nodeSupplies.basic + nodeSupplies.premium + nodeSupplies.legendary}</p>
          </div>
          <div className="holographic p-4 text-center">
            <Server className="w-6 h-6 text-neon-cyan mx-auto mb-2" />
            <h4 className="text-neon-cyan font-bold text-sm">ACTIVE VALIDATORS</h4>
            <p className="text-lg font-mono">532</p>
          </div>
          <div className="holographic p-4 text-center">
            <Zap className="w-6 h-6 text-neon-pink mx-auto mb-2" />
            <h4 className="text-neon-pink font-bold text-sm">DAILY REWARDS</h4>
            <p className="text-lg font-mono">{formatNumber(124700)} CCTR</p>
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
