import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CHAINS, PAYMENT_CONFIG } from '@/types/wallet';
import { Coins, Trophy, Gift, Shield, Zap, Globe } from 'lucide-react';

export const StellarPaymentInfo: React.FC = () => {
  const features = [
    {
      icon: <Coins className="w-6 h-6" />,
      title: 'USDC Entry Fees',
      description: 'Pay tournament entry fees in USDC on Stellar - fast and stable',
      chain: 'stellar',
      color: 'neon-cyan',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'USDC Payouts',
      description: 'Receive tournament winnings directly in USDC',
      chain: 'stellar',
      color: 'neon-green',
    },
    {
      icon: <Gift className="w-6 h-6" />,
      title: 'CCC Rewards',
      description: 'Earn CCC tokens on Soroban for gameplay and achievements',
      chain: 'stellar',
      color: 'neon-purple',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Pass Gating',
      description: 'Access exclusive content with Soroban-based passes',
      chain: 'stellar',
      color: 'neon-pink',
    },
  ];

  const benefits = [
    {
      icon: <Zap className="w-5 h-5 text-yellow-400" />,
      title: 'Lightning Fast',
      description: '3-5 second transaction finality',
    },
    {
      icon: <Coins className="w-5 h-5 text-green-400" />,
      title: 'Near-Zero Fees',
      description: '~0.00001 XLM per transaction',
    },
    {
      icon: <Globe className="w-5 h-5 text-blue-400" />,
      title: 'Cross-Chain Friendly',
      description: 'Easy onramp from any chain',
    },
  ];

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-xl text-neon-cyan flex items-center gap-3">
          {CHAINS.stellar.icon} Stellar-Powered Payments
          <Badge className="bg-neon-purple/20 text-neon-purple">USDC + SOROBAN</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`p-4 rounded-xl bg-white/5 border border-${feature.color}/30 hover:border-${feature.color}/50 transition-colors`}
            >
              <div className={`w-10 h-10 rounded-lg bg-${feature.color}/20 flex items-center justify-center mb-3 text-${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Benefits bar */}
        <div className="flex flex-wrap justify-center gap-6 py-4 border-t border-b border-white/10">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-2">
              {benefit.icon}
              <div>
                <div className="text-sm font-medium text-white">{benefit.title}</div>
                <div className="text-xs text-gray-400">{benefit.description}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Cross-chain info */}
        <div className="bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 rounded-xl p-4 border border-white/10">
          <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
            🌉 Coming from another chain?
          </h4>
          <p className="text-sm text-gray-300 mb-3">
            Whether you're a Solana, Ethereum, or any other chain user, you can easily participate:
          </p>
          <ol className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="bg-neon-cyan/20 text-neon-cyan rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">1</span>
              <span>Connect a Stellar wallet (Freighter recommended)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-neon-cyan/20 text-neon-cyan rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">2</span>
              <span>Buy USDC via our onramp partners (MoonPay, Transak, Ramp)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-neon-cyan/20 text-neon-cyan rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 text-xs">3</span>
              <span>Pay entry fees and receive payouts in USDC</span>
            </li>
          </ol>
        </div>

        {/* Why Stellar */}
        <details className="text-sm text-gray-400">
          <summary className="cursor-pointer hover:text-white transition-colors">
            Why Stellar for payments?
          </summary>
          <div className="mt-3 pl-4 border-l border-white/10 space-y-2">
            <p>• <strong>Speed:</strong> 3-5 second finality vs 10+ minutes on other chains</p>
            <p>• <strong>Cost:</strong> Fractions of a cent vs $0.50-$50 on other chains</p>
            <p>• <strong>USDC Native:</strong> Circle's USDC is natively supported on Stellar</p>
            <p>• <strong>Soroban:</strong> Smart contracts for rewards and pass gating</p>
            <p>• <strong>Reliability:</strong> 99.99% uptime since 2015</p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
};
