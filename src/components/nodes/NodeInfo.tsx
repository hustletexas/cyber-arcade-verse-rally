
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Server, Coins, Shield, Zap, Users, TrendingUp } from 'lucide-react';

export const NodeInfo = () => {
  return (
    <div className="space-y-6">
      {/* What are Nodes */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="text-xl text-neon-cyan flex items-center gap-2">
            <Server className="w-6 h-6" />
            What are Stellar Nodes?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Stellar nodes are validator infrastructure that help secure and maintain the Stellar blockchain network. 
            By owning a node, you become part of the decentralized network and earn rewards for helping validate transactions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-neon-purple">Key Benefits:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Passive XLM income daily</li>
                <li>• Help secure the network</li>
                <li>• No technical knowledge required</li>
                <li>• Automated reward distribution</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-neon-green">Network Impact:</h4>
              <ul className="space-y-1 text-sm">
                <li>• Increase network decentralization</li>
                <li>• Improve transaction processing</li>
                <li>• Enhance security and reliability</li>
                <li>• Support ecosystem growth</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="text-xl text-neon-purple flex items-center gap-2">
            <Zap className="w-6 h-6" />
            How Node Rewards Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-neon-cyan/20 rounded-full flex items-center justify-center mx-auto">
                <Coins className="w-8 h-8 text-neon-cyan" />
              </div>
              <h4 className="font-semibold text-neon-cyan">1. Purchase Node</h4>
              <p className="text-sm text-muted-foreground">
                Buy a node with XLM and it becomes active immediately
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-neon-purple/20 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-neon-purple" />
              </div>
              <h4 className="font-semibold text-neon-purple">2. Validate Network</h4>
              <p className="text-sm text-muted-foreground">
                Your node automatically validates transactions and secures the network
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto">
                <TrendingUp className="w-8 h-8 text-neon-green" />
              </div>
              <h4 className="font-semibold text-neon-green">3. Earn Rewards</h4>
              <p className="text-sm text-muted-foreground">
                Receive daily XLM rewards directly to your wallet
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="text-xl text-neon-pink flex items-center gap-2">
            <Users className="w-6 h-6" />
            Technical & Economic Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-cyan">Smart Contract Features:</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Badge className="bg-neon-green text-black text-xs">AUTO</Badge>
                  <span>Automated daily reward distribution</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-neon-purple text-white text-xs">SECURE</Badge>
                  <span>Audited smart contracts on Stellar</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-neon-cyan text-black text-xs">LIQUID</Badge>
                  <span>Nodes can be sold on secondary market</span>
                </li>
                <li className="flex items-start gap-2">
                  <Badge className="bg-neon-pink text-white text-xs">FAIR</Badge>
                  <span>Transparent reward calculation</span>
                </li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-neon-purple">Reward Calculation:</h4>
              <div className="space-y-2 text-sm font-mono bg-black/30 p-4 rounded">
                <div>Daily Reward = Base Rate × Node Type Multiplier</div>
                <div>Network Fee = 5% (for maintenance)</div>
                <div>Your Reward = Daily Reward × 0.95</div>
                <div className="text-neon-green pt-2">
                  Example: Premium Node = 1.5 XLM × 0.95 = 1.425 XLM/day
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="holographic">
        <CardHeader>
          <CardTitle className="text-xl text-neon-green">Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-neon-cyan mb-2">When do I start earning rewards?</h4>
              <p className="text-sm text-muted-foreground">
                Rewards start immediately after node purchase. First payout occurs 24 hours after activation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-neon-purple mb-2">How are rewards distributed?</h4>
              <p className="text-sm text-muted-foreground">
                Rewards are automatically sent to your connected wallet every 24 hours at 00:00 UTC.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-neon-pink mb-2">Can I sell my nodes?</h4>
              <p className="text-sm text-muted-foreground">
                Yes! Nodes are NFTs and can be traded on secondary markets. Built-in marketplace coming soon.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-neon-green mb-2">What happens if I miss claiming rewards?</h4>
              <p className="text-sm text-muted-foreground">
                Rewards accumulate automatically. You don't need to manually claim - they're sent directly to your wallet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
