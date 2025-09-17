import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useAuth } from '@/hooks/useAuth';
import { ChevronLeft, ChevronRight, Wallet, Gamepad2, Trophy, Coins, Music, Users, X } from 'lucide-react';

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
      description: "The ultimate Web3 gaming experience powered by Solana. Earn real rewards while playing games, collecting NFTs, and competing in tournaments!",
      icon: <Gamepad2 className="w-8 h-8 text-neon-cyan" />
    },
    {
      id: 2,
      title: "Connect Your Wallet 💼",
      description: "First, connect your Solana wallet to start your gaming journey. We support Phantom, Solflare, Backpack, and Coinbase Wallet.",
      icon: <Wallet className="w-8 h-8 text-neon-purple" />,
      action: !isWalletConnected ? {
        text: "Connect Wallet",
        onClick: () => {
          // This will be handled by the wallet connection flow in TopBar
          onClose();
        }
      } : undefined
    },
    {
      id: 3,
      title: "Earn CCTR Tokens 🪙",
      description: "Complete challenges, play games, and participate in tournaments to earn CCTR tokens. Use them to purchase items, enter raffles, and stake for rewards!",
      icon: <Coins className="w-8 h-8 text-neon-green" />
    },
    {
      id: 4,
      title: "Compete in Tournaments 🏆",
      description: "Join Solana-powered tournaments with real prizes! Entry fees create prize pools, and winners take home SOL and exclusive NFTs.",
      icon: <Trophy className="w-8 h-8 text-neon-pink" />
    },
    {
      id: 5,
      title: "Collect & Create NFTs 🎨",
      description: "Mint your free starter NFT, create custom music NFTs, and trade in our marketplace. Every NFT is stored on Solana blockchain!",
      icon: <Music className="w-8 h-8 text-neon-cyan" />
    },
    {
      id: 6,
      title: "Join the Community 👥",
      description: "Connect with other gamers, share strategies, and participate in community events. The arcade is better together!",
      icon: <Users className="w-8 h-8 text-neon-purple" />
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