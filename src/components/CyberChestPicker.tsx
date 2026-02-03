import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, Lock, ChevronRight, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useMultiWallet } from '@/hooks/useMultiWallet';

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
  const [selectedChest, setSelectedChest] = useState<CyberChest | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [openedReward, setOpenedReward] = useState<{ ccc: number; bonus: string } | null>(null);
  const [dailyOpensLeft, setDailyOpensLeft] = useState(1);
  
  // Simulated owned pass - in production this would come from wallet/database
  const [ownedPassTier] = useState<'common' | 'rare' | 'epic' | 'legendary' | null>('rare');

  // Check daily opens on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('cyber_chest_date');
    const storedOpens = localStorage.getItem('cyber_chest_opens');

    if (storedDate !== today) {
      localStorage.setItem('cyber_chest_date', today);
      localStorage.setItem('cyber_chest_opens', '0');
      setDailyOpensLeft(1);
    } else {
      const opens = parseInt(storedOpens || '0');
      setDailyOpensLeft(Math.max(0, 1 - opens));
    }
  }, []);

  const canOpenChest = (chest: CyberChest): boolean => {
    if (!ownedPassTier) return false;
    const tierOrder = ['common', 'rare', 'epic', 'legendary'];
    const ownedIndex = tierOrder.indexOf(ownedPassTier);
    const chestIndex = tierOrder.indexOf(chest.tier);
    return chestIndex <= ownedIndex;
  };

  const getEligibleChest = (): CyberChest | null => {
    if (!ownedPassTier) return null;
    return CYBER_CHESTS.find(c => c.tier === ownedPassTier) || null;
  };

  const handleOpenChest = useCallback((chest: CyberChest) => {
    if (!isWalletConnected) {
      toast.error('Connect wallet to open chest!');
      return;
    }

    if (!canOpenChest(chest)) {
      toast.error(`You need a ${chest.passName} to open this chest!`);
      return;
    }

    if (dailyOpensLeft <= 0) {
      toast.error('No opens left today! Come back tomorrow.');
      return;
    }

    if (isOpening) return;

    setSelectedChest(chest);
    setIsOpening(true);
    setOpenedReward(null);

    // Simulate opening animation
    setTimeout(() => {
      const { minCCC, maxCCC, bonuses } = chest.rewards;
      const earnedCCC = Math.floor(Math.random() * (maxCCC - minCCC + 1)) + minCCC;
      const earnedBonus = bonuses[Math.floor(Math.random() * bonuses.length)];

      setOpenedReward({ ccc: earnedCCC, bonus: earnedBonus });
      setIsOpening(false);

      // Update daily opens
      const opens = parseInt(localStorage.getItem('cyber_chest_opens') || '0') + 1;
      localStorage.setItem('cyber_chest_opens', opens.toString());
      setDailyOpensLeft(Math.max(0, 1 - opens));

      toast.success(`🎉 You earned ${earnedCCC} CCC + ${earnedBonus}!`);
    }, 2000);
  }, [isWalletConnected, dailyOpensLeft, isOpening]);

  const handleReset = () => {
    setSelectedChest(null);
    setOpenedReward(null);
  };

  const eligibleChest = getEligibleChest();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-neon-pink" />
          <h3 className="font-display text-xl bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
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
            className={`${dailyOpensLeft > 0 ? 'bg-neon-green/20 text-neon-green border-neon-green' : 'bg-red-500/20 text-red-400 border-red-500'}`}
          >
            {dailyOpensLeft > 0 ? `${dailyOpensLeft} DAILY OPEN` : 'OPENED TODAY'}
          </Badge>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground text-center">
        {!ownedPassTier 
          ? '🔒 Purchase an Arcade Pass to unlock Cyber Chests!' 
          : openedReward
            ? '✨ Chest opened! Come back tomorrow for another.'
            : `🎁 Open your ${eligibleChest?.name} - 1 free daily open!`}
      </p>

      {/* Opened Reward Display */}
      {openedReward && selectedChest && (
        <div className="relative rounded-xl overflow-hidden border-2 border-yellow-500/60 bg-gradient-to-br from-yellow-900/30 to-black/60 p-6 text-center animate-scale-in">
          <Sparkles className="absolute top-2 right-2 w-6 h-6 text-yellow-400 animate-pulse" />
          <Sparkles className="absolute top-2 left-2 w-6 h-6 text-yellow-400 animate-pulse" />
          
          <img 
            src={selectedChest.image} 
            alt={selectedChest.name}
            className="w-32 h-32 object-contain mx-auto mb-4"
          />
          
          <h4 className="font-display text-2xl text-yellow-400 mb-2">CHEST OPENED!</h4>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-neon-green">+{openedReward.ccc} CCC</p>
            <Badge className="bg-neon-purple/30 text-neon-pink border-neon-purple/50">
              {openedReward.bonus}
            </Badge>
          </div>
          
          <Button 
            onClick={handleReset}
            className="mt-4 cyber-button"
          >
            View Chests
          </Button>
        </div>
      )}

      {/* Chest Cards Grid */}
      {!openedReward && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CYBER_CHESTS.map((chest) => {
            const styles = getTierStyles(chest.tier);
            const canOpen = canOpenChest(chest);
            const isEligible = chest.tier === ownedPassTier;
            const isCurrentlyOpening = isOpening && selectedChest?.id === chest.id;

            return (
              <Card
                key={chest.id}
                onClick={() => canOpen && dailyOpensLeft > 0 && !isOpening && handleOpenChest(chest)}
                className={`
                  relative overflow-hidden transition-all duration-300
                  bg-gradient-to-br ${styles.bg}
                  border-2 ${isEligible ? styles.border : 'border-muted/30'}
                  ${canOpen && dailyOpensLeft > 0 ? `cursor-pointer hover:scale-105 hover:shadow-lg ${styles.glow}` : 'opacity-60 cursor-not-allowed'}
                  ${isCurrentlyOpening ? 'animate-pulse scale-105' : ''}
                `}
              >
                <CardContent className="p-3 flex flex-col items-center text-center">
                  {/* Lock overlay for unavailable chests */}
                  {!canOpen && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <div className="text-center">
                        <Lock className="w-8 h-8 text-muted-foreground mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Requires</p>
                        <p className="text-xs text-muted-foreground">{chest.passName}</p>
                      </div>
                    </div>
                  )}

                  {/* Chest Image */}
                  <img 
                    src={chest.image} 
                    alt={chest.name}
                    className="w-full h-28 object-contain mb-2"
                  />

                  {/* Chest Name */}
                  <h4 className={`font-display text-sm ${styles.text} mb-1`}>
                    {chest.name}
                  </h4>

                  {/* Rewards Preview */}
                  <div className="text-xs text-muted-foreground mb-2">
                    {chest.rewards.minCCC} - {chest.rewards.maxCCC} CCC
                  </div>

                  {/* Open Button for eligible chest */}
                  {isEligible && dailyOpensLeft > 0 && (
                    <Button
                      size="sm"
                      disabled={isOpening}
                      className={`w-full text-xs bg-gradient-to-r ${
                        chest.tier === 'legendary' ? 'from-yellow-500 to-orange-500' :
                        chest.tier === 'epic' ? 'from-purple-500 to-pink-500' :
                        chest.tier === 'rare' ? 'from-blue-500 to-cyan-500' :
                        'from-green-500 to-emerald-500'
                      } text-white hover:opacity-90`}
                    >
                      {isCurrentlyOpening ? (
                        <>
                          <Sparkles className="w-3 h-3 mr-1 animate-spin" />
                          Opening...
                        </>
                      ) : (
                        <>
                          Open Chest
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </>
                      )}
                    </Button>
                  )}

                  {/* Tier Badge */}
                  <Badge className={`mt-2 text-[10px] uppercase ${styles.badge}`}>
                    {chest.tier}
                  </Badge>
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
