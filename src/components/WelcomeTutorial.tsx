import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight, Wallet, Gamepad2, Trophy, Coins, Music, Users, X, Star, Gift, Calendar, Zap, Target, Download } from 'lucide-react';

interface WelcomeTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
  };
}

export const WelcomeTutorial: React.FC<WelcomeTutorialProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const { isWalletConnected } = useMultiWallet();
  const { user } = useAuth();

  const steps: TutorialStep[] = [
    {
      id: 1,
      title: "Welcome to Cyber City Arcade! 🕹️",
      description: "The ultimate Web3 gaming experience powered by Stellar. Earn CCC (Cyber City Credits) while playing games, competing in tournaments, and climbing leaderboards!",
      icon: <Gamepad2 className="w-8 h-8 text-neon-cyan" />
    },
    {
      id: 2,
      title: "How to Create a Wallet 💼",
      description: "To get started, you need a Stellar wallet. We recommend LOBSTR - it's free and easy to set up!\n\n1️⃣ Download LOBSTR from App Store or Google Play\n2️⃣ Create a new account with email verification\n3️⃣ Securely backup your recovery phrase\n4️⃣ Click the wallet icon in our top bar to connect",
      icon: <Download className="w-8 h-8 text-neon-purple" />,
      action: !isWalletConnected ? {
        text: "Connect Wallet",
        onClick: () => {
          onClose();
        }
      } : undefined
    },
    {
      id: 3,
      title: "Why Connect a Wallet? 🔐",
      description: "Wallets unlock power features, not gameplay advantages.\n\n🧠 Identity & Verification\n• Verified player ID\n• Anti-smurf protection\n• Tournament eligibility validation\n• One-player-one-pass enforcement\n\n🏆 Competitive Play\n• Ranked leaderboards\n• Official tournaments\n• Season ladders\n• Championship brackets\n• Match result verification\n\n⚠️ Important: Wallet ≠ better odds\nWallet = verified identity\n\n🔗 Player keeps progress\n• Cross-device continuity\n• Long-term identity\n• Platform-independent history",
      icon: <Wallet className="w-8 h-8 text-neon-green" />
    },
    {
      id: 4,
      title: "How to Earn CCC Points 🪙",
      description: "CCC (Cyber City Credits) is our in-game currency. Here's how to earn:\n\n🎮 Play Games - Earn CCC for every game you complete\n📅 Daily Login - Get bonus CCC just for showing up\n🏆 Win Tournaments - Big CCC prizes for top players\n⭐ Achievements - Unlock milestones for CCC rewards\n🔥 Streaks - Build winning streaks for multipliers",
      icon: <Coins className="w-8 h-8 text-neon-pink" />
    },
    {
      id: 5,
      title: "Our Games 🎮",
      description: "Explore our arcade games:\n\n🧩 Cyber Match - Memory card matching game\n🎯 Cyber Sequence - Pattern memory challenge\n🧠 Cyber Trivia - 6 category knowledge challenge\n🚀 Cyber Galaxy - Galaga-style arcade shooter\n🧱 Portal Breaker - Neon brick breaker\n🎰 Cyber Drop - Try your luck!",
      icon: <Target className="w-8 h-8 text-neon-cyan" />
    },
    {
      id: 6,
      title: "Tournaments & Competition 🏆",
      description: "Compete for glory and prizes:\n\n🏅 Daily Tournaments - Quick competitions with CCC prizes\n👑 Weekly Championships - Bigger stakes, bigger rewards\n📊 Live Leaderboards - Track your rank in real-time\n🎖️ Bracket Tournaments - Single elimination showdowns",
      icon: <Trophy className="w-8 h-8 text-neon-purple" />
    },
    {
      id: 7,
      title: "Special Features ✨",
      description: "More ways to enjoy the arcade:\n\n🎵 Music Player - Listen to cyberpunk beats while gaming\n🎁 Raffles - Enter drawings for exclusive prizes\n📦 Cyber Chests - Open chests for random rewards\n🤖 AI Gaming Coach - Get tips to improve your skills\n💬 Community Hub - Chat with other players",
      icon: <Star className="w-8 h-8 text-neon-green" />
    },
    {
      id: 8,
      title: "Daily Rewards & Bonuses 🎁",
      description: "Don't miss out on daily rewards:\n\n📅 Daily Login Bonus - CCC every day you visit\n🎡 Daily Spin - Free chance at bonus CCC\n🔥 Streak Bonuses - Keep your streak alive for 2x-5x multipliers\n🎯 Daily Challenges - Complete tasks for extra CCC",
      icon: <Calendar className="w-8 h-8 text-neon-pink" />
    },
    {
      id: 9,
      title: "Ready to Play! 🚀",
      description: "You're all set! Connect your wallet, start playing games, and earn CCC. Check the leaderboards to see where you rank, and don't forget to claim your daily rewards. Good luck, player!",
      icon: <Zap className="w-8 h-8 text-neon-cyan" />
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('cyber_arcade_tutorial_completed', 'true');
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('cyber_arcade_tutorial_completed', 'true');
    onClose();
  };

  const currentStepData = steps[currentStep];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="arcade-frame bg-background/95 backdrop-blur-sm border-neon-cyan/30 max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-neon-pink/20 via-neon-purple/20 to-neon-cyan/20 p-6 border-b border-neon-cyan/20">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-display text-neon-cyan flex items-center gap-3">
                {currentStepData.icon}
                Tutorial
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs border-neon-purple text-neon-purple">
                  {currentStep + 1} / {steps.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-muted-foreground hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>
          
          {/* Progress Bar */}
          <div className="mt-4 w-full bg-black/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-neon-pink to-neon-cyan h-2 rounded-full transition-all duration-500 neon-glow"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Card className="bg-black/50 border-neon-purple/30 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 rounded-lg neon-glow">
                  {currentStepData.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-display text-neon-cyan mb-2">
                    {currentStepData.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex gap-2 mt-4">
                {currentStep === 1 && isWalletConnected && (
                  <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                    ✓ Wallet Connected
                  </Badge>
                )}
                {currentStep === 1 && user && (
                  <Badge className="bg-neon-green/20 text-neon-green border-neon-green/30">
                    ✓ Account Created
                  </Badge>
                )}
              </div>

              {/* Action Button */}
              {currentStepData.action && (
                <div className="mt-4">
                  <Button 
                    onClick={currentStepData.action.onClick}
                    className="cyber-button"
                  >
                    {currentStepData.action.text}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>

            <Button 
              variant="ghost"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-white"
            >
              Skip Tutorial
            </Button>

            <Button 
              onClick={nextStep}
              className="cyber-button"
            >
              {currentStep === steps.length - 1 ? 'Start Gaming!' : 'Next'}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 text-4xl animate-float">🎮</div>
          <div className="absolute bottom-10 left-10 text-3xl animate-pulse">🚀</div>
          <div className="absolute top-1/2 left-5 text-2xl animate-bounce">⚡</div>
          <div className="absolute top-1/3 right-5 text-3xl animate-float">💎</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};