import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { WalletConnectionModal } from '@/components/WalletConnectionModal';
import { 
  Gamepad2, 
  Trophy, 
  Gift, 
  Calendar, 
  Award, 
  Zap,
  Star,
  Target,
  Coins,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

export const CreditsRewardsShowcase = () => {
  const { isWalletConnected, connectWallet } = useMultiWallet();
  const { balance } = useUserBalance();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleWalletConnected = (walletType: string, address: string) => {
    connectWallet(walletType as any, address);
    setShowWalletModal(false);
  };

  const earningMethods = [
    {
      icon: Gamepad2,
      title: 'Play Games',
      description: 'Earn CCC by playing arcade games, completing matches, and achieving high scores',
      reward: '5-50 CCC per game',
      color: 'text-neon-green',
      bgColor: 'from-neon-green/20 to-neon-green/5'
    },
    {
      icon: Trophy,
      title: 'Win Tournaments',
      description: 'Compete in tournaments and climb the leaderboard for massive CCC rewards',
      reward: '100-5000 CCC',
      color: 'text-neon-cyan',
      bgColor: 'from-neon-cyan/20 to-neon-cyan/5'
    },
    {
      icon: Calendar,
      title: 'Daily Login',
      description: 'Connect your wallet daily to claim bonus credits and build streaks',
      reward: '10-100 CCC daily',
      color: 'text-neon-pink',
      bgColor: 'from-neon-pink/20 to-neon-pink/5'
    },
    {
      icon: Award,
      title: 'Achievements',
      description: 'Unlock achievements by completing challenges and reaching milestones',
      reward: '25-500 CCC per badge',
      color: 'text-neon-purple',
      bgColor: 'from-neon-purple/20 to-neon-purple/5'
    },
    {
      icon: Gift,
      title: 'Slot Machine',
      description: 'Spin the Cyber Slots daily for a chance to hit jackpots',
      reward: '50-6000 CCC',
      color: 'text-neon-yellow',
      bgColor: 'from-neon-yellow/20 to-neon-yellow/5'
    },
    {
      icon: Target,
      title: 'Trivia Challenges',
      description: 'Test your gaming knowledge and earn credits for correct answers',
      reward: '1-10 CCC per answer',
      color: 'text-neon-orange',
      bgColor: 'from-orange-500/20 to-orange-500/5'
    }
  ];

  const spendingMethods = [
    { icon: '🎮', title: 'Game Entry', description: 'Enter premium game modes and special events' },
    { icon: '🎫', title: 'Raffle Tickets', description: 'Purchase tickets for exclusive prize raffles' },
    { icon: '🤖', title: 'AI Gaming Coach', description: 'Get personalized gaming tips and strategies' },
    { icon: '🎵', title: 'Music Library', description: 'Unlock exclusive cyberpunk tracks' },
    { icon: '🏆', title: 'Tournament Entry', description: 'Join competitive tournaments' },
    { icon: '🎁', title: 'Prize Redemption', description: 'Claim physical and digital rewards' }
  ];

  return (
    <>
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
            <Coins className="w-8 h-8" />
            CYBER CITY COINS
            <Badge className="bg-gradient-to-r from-neon-cyan to-neon-purple text-white">
              CCC
            </Badge>
          </CardTitle>
          <p className="text-muted-foreground">
            Earn credits by playing games, winning tournaments, and completing achievements. 
            <span className="text-neon-green font-bold"> No purchase required!</span>
          </p>
        </CardHeader>
        <CardContent>

          {/* Current Balance Display */}
          {isWalletConnected && (
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-r from-neon-cyan/20 via-neon-purple/20 to-neon-pink/20 border border-neon-cyan/30">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                  <p className="text-4xl font-display font-bold text-neon-green flex items-center gap-2">
                    <Sparkles className="w-8 h-8 text-neon-cyan" />
                    {balance.cctr_balance.toLocaleString()} CCC
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Claimable Rewards</p>
                  <p className="text-2xl font-bold text-neon-pink">
                    +{balance.claimable_rewards.toLocaleString()} CCC
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* How to Earn */}
            <div className="space-y-6">
              <h3 className="font-display text-xl text-neon-green flex items-center gap-2">
                <Zap className="w-5 h-5" />
                HOW TO EARN CCC
              </h3>
              
              <div className="space-y-4">
                {earningMethods.map((method, index) => (
                  <Card 
                    key={index} 
                    className={`p-4 bg-gradient-to-r ${method.bgColor} border-none hover:scale-[1.02] transition-transform cursor-pointer`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg bg-black/30 ${method.color}`}>
                        <method.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`font-bold ${method.color}`}>{method.title}</h4>
                          <Badge className="bg-neon-green/20 text-neon-green border-neon-green/50">
                            {method.reward}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* How to Spend + Info */}
            <div className="space-y-6">
              <h3 className="font-display text-xl text-neon-pink flex items-center gap-2">
                <Star className="w-5 h-5" />
                SPEND YOUR CCC
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {spendingMethods.map((method, index) => (
                  <Card 
                    key={index}
                    className="p-4 bg-gradient-to-br from-neon-purple/10 to-neon-pink/10 border-neon-purple/20 hover:border-neon-pink/50 transition-colors"
                  >
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">{method.icon}</span>
                      <h4 className="font-bold text-neon-cyan text-sm mb-1">{method.title}</h4>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Credits Info Box */}
              <Card className="holographic p-6">
                <h3 className="font-display text-lg text-neon-cyan mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  About CCC
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-neon-green">✓</span>
                    <span><strong>Free to Earn</strong> - Play games and complete activities</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-neon-green">✓</span>
                    <span><strong>In-App Currency</strong> - Use credits within Cyber City Arcade</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-neon-green">✓</span>
                    <span><strong>Secure & Tracked</strong> - On-chain verified on Stellar</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-neon-green">✓</span>
                    <span><strong>100 CCC Starter</strong> - New wallets receive free credits</span>
                  </div>
                </div>
              </Card>

              {/* CTA */}
              {!isWalletConnected && (
                <Button 
                  onClick={() => setShowWalletModal(true)}
                  className="w-full cyber-button text-lg py-6"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  CONNECT WALLET & GET 100 FREE CCC
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <WalletConnectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnected={handleWalletConnected}
      />
    </>
  );
};
