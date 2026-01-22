
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Check, Star } from 'lucide-react';

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
  currency?: string;
}

interface NodeCardsProps {
  nodeTypes: NodeType[];
  onPurchase: (nodeType: NodeType) => void;
  purchasingNode: string | null;
  isWalletConnected: boolean;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
  return num.toFixed(0);
};

export const NodeCards: React.FC<NodeCardsProps> = ({
  nodeTypes,
  onPurchase,
  purchasingNode,
  isWalletConnected
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {nodeTypes.map((node) => {
        const availabilityPercent = (node.currentSupply / node.maxSupply) * 100;
        const isPopular = node.id === 'premium';
        const isPurchasing = purchasingNode === node.id;
        const currency = node.currency || 'CCTR';

        return (
          <Card 
            key={node.id} 
            className={`vending-machine relative ${isPopular ? 'ring-2 ring-neon-purple' : ''}`}
          >
            {isPopular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-neon-purple text-white px-4 py-1">
                  <Star className="w-4 h-4 mr-1" />
                  MOST POPULAR
                </Badge>
              </div>
            )}

            <CardHeader className="text-center">
              <div className="text-4xl mb-2">{node.icon}</div>
              <CardTitle className={`font-display text-xl ${
                node.id === 'basic' ? 'text-neon-cyan' :
                node.id === 'premium' ? 'text-neon-purple' :
                'text-neon-pink'
              }`}>
                {node.name}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{node.description}</p>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Price */}
              <div className="text-center">
                <div className="text-3xl font-bold text-neon-green">
                  {formatNumber(node.price)} {currency}
                </div>
                <div className="text-sm text-muted-foreground">
                  ≈ ${(node.price * 0.052).toLocaleString()} USD
                </div>
              </div>

              {/* Rewards */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Daily Reward:</span>
                  <span className="text-neon-green font-mono">{formatNumber(node.dailyReward)} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Monthly Reward:</span>
                  <span className="text-neon-green font-mono">{formatNumber(node.monthlyReward)} {currency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Annual ROI:</span>
                  <span className="text-neon-cyan font-mono">{node.roi}%</span>
                </div>
              </div>

              {/* Availability */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Available:</span>
                  <span className="font-mono">
                    {node.maxSupply - node.currentSupply} / {formatNumber(node.maxSupply)}
                  </span>
                </div>
                <Progress 
                  value={availabilityPercent} 
                  className="h-2"
                />
                {availabilityPercent > 90 && (
                  <Badge variant="destructive" className="text-xs">
                    Limited Supply!
                  </Badge>
                )}
              </div>

              {/* Features */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Features:</h4>
                <ul className="space-y-1">
                  {node.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-xs">
                      <Check className="w-3 h-3 text-neon-green mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Purchase Button */}
              <Button
                onClick={() => onPurchase(node)}
                disabled={!isWalletConnected || isPurchasing || node.currentSupply >= node.maxSupply}
                className={`w-full cyber-button ${
                  node.id === 'basic' ? 'bg-neon-cyan hover:bg-neon-cyan/80' :
                  node.id === 'premium' ? 'bg-neon-purple hover:bg-neon-purple/80' :
                  'bg-neon-pink hover:bg-neon-pink/80'
                }`}
              >
                {isPurchasing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    PURCHASING...
                  </>
                ) : node.currentSupply >= node.maxSupply ? (
                  'SOLD OUT'
                ) : !isWalletConnected ? (
                  'CONNECT WALLET'
                ) : (
                  `PURCHASE ${node.name.toUpperCase()}`
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
