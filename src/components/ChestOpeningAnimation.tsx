import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Gift, Star, Coins, Trophy } from 'lucide-react';

interface ChestReward {
  type: 'cctr' | 'nft' | 'item' | 'voucher';
  name: string;
  value: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface ChestOpeningAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  chestName: string;
  chestRarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const generateRandomReward = (chestRarity: string): ChestReward => {
  const rewards: ChestReward[] = [
    { type: 'cctr', name: 'CCTR Tokens', value: '50', rarity: 'common' },
    { type: 'cctr', name: 'CCTR Tokens', value: '150', rarity: 'rare' },
    { type: 'cctr', name: 'CCTR Tokens', value: '500', rarity: 'epic' },
    { type: 'cctr', name: 'CCTR Jackpot', value: '2000', rarity: 'legendary' },
    { type: 'nft', name: 'Common Gaming NFT', value: 'Digital Collectible', rarity: 'common' },
    { type: 'nft', name: 'Rare Character NFT', value: 'Exclusive Character', rarity: 'rare' },
    { type: 'nft', name: 'Epic Weapon NFT', value: 'Legendary Weapon', rarity: 'epic' },
    { type: 'item', name: 'Tournament Pass', value: '1 Entry', rarity: 'rare' },
    { type: 'voucher', name: 'Gaming Voucher', value: '$25', rarity: 'epic' },
  ];

  // Weight rewards based on chest rarity
  const weightedRewards = rewards.filter(r => {
    if (chestRarity === 'legendary') return true;
    if (chestRarity === 'epic') return r.rarity !== 'legendary' || Math.random() > 0.7;
    if (chestRarity === 'rare') return r.rarity !== 'legendary' && (r.rarity !== 'epic' || Math.random() > 0.5);
    return r.rarity === 'common' || r.rarity === 'rare';
  });

  return weightedRewards[Math.floor(Math.random() * weightedRewards.length)];
};

const getRarityGlow = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'shadow-[0_0_30px_rgba(156,163,175,0.5)]';
    case 'rare': return 'shadow-[0_0_40px_rgba(59,130,246,0.6)]';
    case 'epic': return 'shadow-[0_0_50px_rgba(168,85,247,0.7)]';
    case 'legendary': return 'shadow-[0_0_60px_rgba(234,179,8,0.8)]';
    default: return '';
  }
};

const getRarityBorder = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'border-gray-400';
    case 'rare': return 'border-blue-500';
    case 'epic': return 'border-purple-500';
    case 'legendary': return 'border-yellow-500';
    default: return 'border-gray-400';
  }
};

const getRarityBg = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-gray-500';
    case 'rare': return 'bg-blue-500';
    case 'epic': return 'bg-purple-500';
    case 'legendary': return 'bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500';
    default: return 'bg-gray-500';
  }
};

const getRewardIcon = (type: string) => {
  switch (type) {
    case 'cctr': return <Coins className="w-8 h-8" />;
    case 'nft': return <Star className="w-8 h-8" />;
    case 'item': return <Trophy className="w-8 h-8" />;
    case 'voucher': return <Gift className="w-8 h-8" />;
    default: return <Gift className="w-8 h-8" />;
  }
};

export const ChestOpeningAnimation: React.FC<ChestOpeningAnimationProps> = ({
  isOpen,
  onClose,
  chestName,
  chestRarity
}) => {
  const [phase, setPhase] = useState<'closed' | 'shaking' | 'opening' | 'revealing' | 'revealed'>('closed');
  const [reward, setReward] = useState<ChestReward | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPhase('closed');
      setReward(null);
      
      // Animation sequence
      const timer1 = setTimeout(() => setPhase('shaking'), 300);
      const timer2 = setTimeout(() => setPhase('opening'), 1500);
      const timer3 = setTimeout(() => {
        setReward(generateRandomReward(chestRarity));
        setPhase('revealing');
      }, 2500);
      const timer4 = setTimeout(() => setPhase('revealed'), 3200);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
      };
    }
  }, [isOpen, chestRarity]);

  const handleClose = () => {
    setPhase('closed');
    setReward(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-arcade-dark border-neon-purple overflow-hidden">
        <div className="relative min-h-[400px] flex flex-col items-center justify-center p-6">
          {/* Background particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {phase !== 'closed' && (
              <>
                {[...Array(20)].map((_, i) => (
                  <Sparkles
                    key={i}
                    className={`absolute text-yellow-300 opacity-0 ${
                      phase === 'revealing' || phase === 'revealed' ? 'animate-ping' : ''
                    }`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      width: `${12 + Math.random() * 16}px`,
                      height: `${12 + Math.random() * 16}px`,
                      animationDelay: `${Math.random() * 2}s`,
                      animationDuration: `${1 + Math.random() * 2}s`,
                      opacity: phase === 'revealing' || phase === 'revealed' ? 0.8 : 0,
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Chest container */}
          <div className="relative z-10 flex flex-col items-center">
            {/* Title */}
            <h2 className="text-xl font-bold text-neon-cyan mb-6 text-center">
              {phase === 'revealed' ? '🎉 REWARD UNLOCKED!' : `Opening ${chestName}...`}
            </h2>

            {/* Chest animation */}
            <div
              className={`relative w-48 h-48 flex items-center justify-center transition-all duration-500 ${
                phase === 'shaking' ? 'animate-[wiggle_0.1s_ease-in-out_infinite]' : ''
              } ${phase === 'opening' ? 'scale-110' : ''} ${
                phase === 'revealing' || phase === 'revealed' ? 'scale-0 opacity-0' : ''
              }`}
            >
              {/* Chest glow */}
              <div
                className={`absolute inset-0 rounded-2xl transition-all duration-500 ${
                  phase === 'opening' ? getRarityGlow(chestRarity) : ''
                }`}
              />
              
              {/* Chest icon */}
              <div
                className={`text-8xl transition-all duration-300 ${
                  phase === 'shaking' ? '' : ''
                } ${phase === 'opening' ? 'animate-pulse' : ''}`}
              >
                {phase === 'opening' ? '📦✨' : '📦'}
              </div>

              {/* Light rays on opening */}
              {phase === 'opening' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-24 bg-gradient-to-t from-yellow-500 to-transparent opacity-80"
                      style={{
                        transform: `rotate(${i * 45}deg)`,
                        transformOrigin: 'bottom center',
                        animation: 'pulse 0.5s ease-in-out infinite',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Reward reveal */}
            {reward && (phase === 'revealing' || phase === 'revealed') && (
              <div
                className={`flex flex-col items-center transition-all duration-700 ${
                  phase === 'revealed' ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
                }`}
              >
                {/* Reward card */}
                <div
                  className={`relative p-6 rounded-2xl border-4 ${getRarityBorder(reward.rarity)} ${getRarityGlow(reward.rarity)} bg-arcade-dark/90 backdrop-blur`}
                >
                  {/* Rarity badge */}
                  <Badge className={`${getRarityBg(reward.rarity)} text-white absolute -top-3 left-1/2 -translate-x-1/2`}>
                    {reward.rarity.toUpperCase()}
                  </Badge>

                  {/* Reward icon */}
                  <div className="flex justify-center mb-4 text-neon-cyan">
                    {getRewardIcon(reward.type)}
                  </div>

                  {/* Reward info */}
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-bold text-neon-pink">{reward.name}</h3>
                    <p className="text-2xl font-bold text-neon-green">{reward.value}</p>
                  </div>

                  {/* Sparkle decorations */}
                  <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300 animate-pulse" />
                  <Sparkles className="absolute -bottom-2 -left-2 w-5 h-5 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>

                {/* Claim button */}
                <Button
                  onClick={handleClose}
                  className="cyber-button mt-6"
                >
                  ✨ CLAIM REWARD
                </Button>
              </div>
            )}

            {/* Loading indicator during animation */}
            {phase !== 'revealed' && phase !== 'revealing' && (
              <div className="mt-6 flex items-center gap-2 text-muted-foreground">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-neon-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-neon-purple rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-neon-pink rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">
                  {phase === 'closed' && 'Preparing chest...'}
                  {phase === 'shaking' && 'Unlocking treasures...'}
                  {phase === 'opening' && 'Revealing reward...'}
                </span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
