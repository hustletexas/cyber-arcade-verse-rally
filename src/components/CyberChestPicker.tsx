import React, { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, Lock, ChevronRight, Trophy, ShoppingCart, Gamepad2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWinnerChests } from '@/hooks/useWinnerChests';

interface CyberChest {
  id: string;
  tier: 'common' | 'rare' | 'epic' | 'legendary';
  name: string;
  passName: string;
  image: string;
  rewards: {
    minCCC: number;
    maxCCC: number;
    bonuses: string[];
  };
}

const CYBER_CHESTS: CyberChest[] = [
  {
    id: 'common',
    tier: 'common',
    name: 'Cyber Chest',
    passName: 'Common Arcade Pass',
    image: '/lovable-uploads/common-cyber-chest-nft.png',
    rewards: { minCCC: 100, maxCCC: 500, bonuses: ['Free Game Entry', 'Bonus XP'] },
  },
  {
    id: 'rare',
    tier: 'rare',
    name: 'Rare Cyber Chest',
    passName: 'Rare Arcade Pass',
    image: '/lovable-uploads/rare-cyber-chest-nft.png',
    rewards: { minCCC: 500, maxCCC: 1500, bonuses: ['NFT Badge', 'Tournament Entry', '2x XP'] },
  },
  {
    id: 'epic',
    tier: 'epic',
    name: 'Epic Cyber Chest',
    passName: 'Epic Arcade Pass',
    image: '/lovable-uploads/epic-cyber-chest-nft.png',
    rewards: { minCCC: 1500, maxCCC: 3000, bonuses: ['Exclusive NFT', 'VIP Tournament', '3x XP'] },
  },
  {
    id: 'legendary',
    tier: 'legendary',
    name: 'Legendary Cyber Chest',
    passName: 'Legendary Arcade Pass',
    image: '/lovable-uploads/legendary-cyber-chest-nft.png',
    rewards: { minCCC: 3000, maxCCC: 10000, bonuses: ['Ultra Rare NFT', 'Jackpot Entry', 'Lifetime 5x XP'] },
  },
];

const getTierStyles = (tier: string) => {
  switch (tier) {
    case 'common':
      return { 
        border: 'border-green-500/60', 
        glow: 'shadow-green-500/40', 
        bg: 'from-green-900/40 to-black/60',
        text: 'text-green-400',
        badge: 'bg-green-500/20 text-green-400 border-green-500/50'
      };
    case 'rare':
      return { 
        border: 'border-blue-500/60', 
        glow: 'shadow-blue-500/40', 
        bg: 'from-blue-900/40 to-black/60',
        text: 'text-blue-400',
        badge: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      };
    case 'epic':
      return { 
        border: 'border-purple-500/60', 
        glow: 'shadow-purple-500/40', 
        bg: 'from-purple-900/40 to-black/60',
        text: 'text-purple-400',
        badge: 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      };
    case 'legendary':
      return { 
        border: 'border-yellow-500/60', 
        glow: 'shadow-yellow-500/40', 
        bg: 'from-yellow-900/40 to-orange-900/40',
        text: 'text-yellow-400',
        badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      };
    default:
      return { 
        border: 'border-gray-500/60', 
        glow: 'shadow-gray-500/40', 
        bg: 'from-gray-900/40 to-black/60',
        text: 'text-gray-400',
        badge: 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      };
  }
};

export const CyberChestPicker: React.FC = () => {
  const { isWalletConnected } = useMultiWallet();
  const { eligibleChests, hasUnclaimedChests, unclaimedCount, claimChest, isLoading } = useWinnerChests();
  const [selectedChest, setSelectedChest] = useState<CyberChest | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [openedReward, setOpenedReward] = useState<{ ccc: number; bonus: string } | null>(null);
  
  // Simulated owned pass - in production this would come from wallet/database
  const [ownedPassTier] = useState<'common' | 'rare' | 'epic' | 'legendary' | null>('rare');

  const canOpenChest = (chest: CyberChest): boolean => {
    if (!ownedPassTier || !hasUnclaimedChests) return false;
    const tierOrder = ['common', 'rare', 'epic', 'legendary'];
    const ownedIndex = tierOrder.indexOf(ownedPassTier);
    const chestIndex = tierOrder.indexOf(chest.tier);
    return chestIndex <= ownedIndex;
  };

  const getEligibleChest = (): CyberChest | null => {
    if (!ownedPassTier) return null;
    return CYBER_CHESTS.find(c => c.tier === ownedPassTier) || null;
  };

  const handleOpenChest = useCallback(async (chest: CyberChest) => {
    if (!isWalletConnected) {
      toast.error('Connect wallet to open chest!');
      return;
    }

    if (!canOpenChest(chest)) {
      toast.error(`You need a ${chest.passName} to open this chest!`);
      return;
    }

    if (!hasUnclaimedChests || eligibleChests.length === 0) {
      toast.error('No chests available! Win a game or tournament to earn chests.');
      return;
    }

    if (isOpening) return;

    setSelectedChest(chest);
    setIsOpening(true);
    setOpenedReward(null);

    // Simulate opening animation
    setTimeout(async () => {
      const { minCCC, maxCCC, bonuses } = chest.rewards;
      const earnedCCC = Math.floor(Math.random() * (maxCCC - minCCC + 1)) + minCCC;
      const earnedBonus = bonuses[Math.floor(Math.random() * bonuses.length)];

      // Claim the first available chest
      const chestToClaim = eligibleChests[0];
      if (chestToClaim) {
        await claimChest(chestToClaim.id, 'ccc', earnedCCC.toString());
      }

      setOpenedReward({ ccc: earnedCCC, bonus: earnedBonus });
      setIsOpening(false);

      toast.success(`🎉 You earned ${earnedCCC} CCC + ${earnedBonus}!`);
    }, 2000);
  }, [isWalletConnected, hasUnclaimedChests, eligibleChests, isOpening, claimChest]);

  const handleReset = () => {
    setSelectedChest(null);
    setOpenedReward(null);
  };

  const eligibleChest = getEligibleChest();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-neon-pink" />
          <h3 className="font-display text-2xl font-bold tracking-wider uppercase"
              style={{
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 30%, #FF8C00 60%, #B8860B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 20px rgba(255, 165, 0, 0.5), 0 0 40px rgba(255, 140, 0, 0.3)',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))',
              }}>
            CYBER CHEST
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {ownedPassTier && (
            <Badge className={getTierStyles(ownedPassTier).badge}>
              <Trophy className="w-3 h-3 mr-1" />
              {ownedPassTier.charAt(0).toUpperCase() + ownedPassTier.slice(1)} Pass
            </Badge>
          )}
          <Badge 
            className={`${hasUnclaimedChests ? 'bg-neon-green/20 text-neon-green border-neon-green' : 'bg-muted/20 text-muted-foreground border-muted'}`}
          >
            {isLoading ? 'Loading...' : hasUnclaimedChests ? `${unclaimedCount} CHEST${unclaimedCount > 1 ? 'S' : ''} AVAILABLE` : 'NO CHESTS'}
          </Badge>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2">
        {!hasUnclaimedChests ? (
          <div className="bg-card/50 rounded-lg p-4 border border-muted/30">
            <p className="text-sm text-muted-foreground mb-3">
              🎮 Earn Cyber Chests by winning games or tournaments!
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Gamepad2 className="w-4 h-4 text-neon-cyan" />
                Win Games
              </span>
              <span className="flex items-center gap-1">
                <Trophy className="w-4 h-4 text-yellow-400" />
                Win Tournaments
              </span>
              <span className="flex items-center gap-1">
                <ShoppingCart className="w-4 h-4 text-neon-pink" />
                Purchase Passes
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {openedReward
              ? '✨ Chest opened! Win more games to earn additional chests.'
              : `🎁 You have ${unclaimedCount} chest${unclaimedCount > 1 ? 's' : ''} to open!`}
          </p>
        )}
      </div>

      {/* Opened Reward Display */}
      {openedReward && selectedChest && (
        <div className="relative rounded-xl overflow-hidden border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-900/30 to-black/60 p-8 text-center animate-scale-in">
          <Sparkles className="absolute top-4 right-4 w-8 h-8 text-yellow-400 animate-pulse" />
          <Sparkles className="absolute top-4 left-4 w-8 h-8 text-yellow-400 animate-pulse" />
          
          <img 
            src={selectedChest.image} 
            alt={selectedChest.name}
            className="w-56 h-56 object-contain mx-auto mb-6"
          />
          
          <h4 className="font-display text-3xl text-yellow-400 mb-3">CHEST OPENED!</h4>
          <div className="space-y-3">
            <p className="text-4xl font-bold text-neon-green">+{openedReward.ccc} CCC</p>
            <Badge className="bg-neon-purple/30 text-neon-pink border-neon-purple/50 text-sm px-4 py-1">
              {openedReward.bonus}
            </Badge>
          </div>
          
          <Button 
            onClick={handleReset}
            className="mt-6 cyber-button"
          >
            View Chests
          </Button>
        </div>
      )}

      {/* Chest Cards Grid - Larger images */}
      {!openedReward && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CYBER_CHESTS.map((chest) => {
            const styles = getTierStyles(chest.tier);
            const canOpen = canOpenChest(chest);
            const isEligible = chest.tier === ownedPassTier && hasUnclaimedChests;
            const isCurrentlyOpening = isOpening && selectedChest?.id === chest.id;

            return (
              <Card
                key={chest.id}
                onClick={() => canOpen && hasUnclaimedChests && !isOpening && handleOpenChest(chest)}
                className={`
                  relative overflow-hidden transition-all duration-300
                  border-2 ${isEligible ? styles.border : 'border-muted/30'}
                  ${canOpen && hasUnclaimedChests ? `cursor-pointer hover:scale-105 hover:shadow-xl ${styles.glow}` : 'cursor-not-allowed'}
                  ${isCurrentlyOpening ? 'animate-pulse scale-105' : ''}
                  bg-black/40
                `}
              >
                <CardContent className="p-0 flex flex-col items-center text-center relative">
                  {/* Chest Image - Full card coverage */}
                  <div className="w-full aspect-[3/4] relative">
                    <img 
                      src={chest.image} 
                      alt={chest.name}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                    
                    {/* Lock indicator - bottom left corner, transparent */}
                    {(!canOpenChest(chest) || !hasUnclaimedChests) && (
                      <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-md px-2 py-1">
                        <Lock className="w-4 h-4 text-white/70" />
                        <span className="text-[10px] text-white/70">
                          {!ownedPassTier || !canOpenChest(chest) ? 'Locked' : 'Earn to unlock'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    {/* Chest Name */}
                    <h4 className={`font-display text-sm ${styles.text} mb-0.5`}>
                      {chest.name}
                    </h4>

                    {/* Rewards Preview */}
                    <div className="text-xs text-white/80 mb-2">
                      {chest.rewards.minCCC.toLocaleString()} - {chest.rewards.maxCCC.toLocaleString()} CCC
                    </div>

                    {/* Open Button for eligible chest */}
                    {isEligible && (
                      <Button
                        size="sm"
                        disabled={isOpening}
                        className={`w-full bg-gradient-to-r ${
                          chest.tier === 'legendary' ? 'from-yellow-500 to-orange-500' :
                          chest.tier === 'epic' ? 'from-purple-500 to-pink-500' :
                          chest.tier === 'rare' ? 'from-blue-500 to-cyan-500' :
                          'from-green-500 to-emerald-500'
                        } text-white hover:opacity-90`}
                      >
                        {isCurrentlyOpening ? (
                          <>
                            <Sparkles className="w-4 h-4 mr-1 animate-spin" />
                            Opening...
                          </>
                        ) : (
                          <>
                            Open Chest
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </>
                        )}
                      </Button>
                    )}

                    {/* Tier Badge */}
                    <Badge className={`mt-2 text-xs uppercase ${styles.badge}`}>
                      {chest.tier}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pass Upgrade Hint */}
      {ownedPassTier && ownedPassTier !== 'legendary' && !openedReward && (
        <p className="text-xs text-center text-muted-foreground">
          💡 Upgrade your Arcade Pass to unlock higher tier chests with bigger rewards!
        </p>
      )}
    </div>
  );
};

export default CyberChestPicker;
