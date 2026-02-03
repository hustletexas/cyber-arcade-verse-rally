import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Gift, Zap, Trophy, Star } from 'lucide-react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { toast } from 'sonner';

interface SlotSymbol {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
  tokenReward: number;
}

const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'common', name: 'Cyber Chest', rarity: 'common', image: '/lovable-uploads/common-cyber-chest.png', tokenReward: 50 },
  { id: 'rare', name: 'Rare Cyber Chest', rarity: 'rare', image: '/lovable-uploads/rare-cyber-chest.png', tokenReward: 150 },
  { id: 'epic', name: 'Epic Cyber Chest', rarity: 'epic', image: '/lovable-uploads/epic-cyber-chest.png', tokenReward: 500 },
  { id: 'legendary', name: 'Legendary Cyber Chest', rarity: 'legendary', image: '/lovable-uploads/legendary-cyber-chest.png', tokenReward: 2000 },
  { id: 'standard', name: 'Standard Cyber Chest', rarity: 'rare', image: '/lovable-uploads/standard-cyber-chest.png', tokenReward: 100 },
];

const MAX_DAILY_SPINS = 3;
const SPIN_DURATION = 2000;

interface CyberSlotsMachineProps {
  onWin?: (rarity: string, tokens: number) => void;
}

export const CyberSlotsMachine: React.FC<CyberSlotsMachineProps> = ({ onWin }) => {
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const { balance } = useUserBalance();
  
  const [reels, setReels] = useState<SlotSymbol[]>([SLOT_SYMBOLS[0], SLOT_SYMBOLS[1], SLOT_SYMBOLS[2]]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinCount, setSpinCount] = useState(0);
  const [lastSpinDate, setLastSpinDate] = useState<string | null>(null);
  const [showWin, setShowWin] = useState(false);
  const [winInfo, setWinInfo] = useState<{ rarity: string; tokens: number } | null>(null);
  const [reelAnimations, setReelAnimations] = useState([false, false, false]);

  // Check/reset daily spins
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('cyber_slots_date');
    const storedSpins = localStorage.getItem('cyber_slots_spins');

    if (storedDate !== today) {
      localStorage.setItem('cyber_slots_date', today);
      localStorage.setItem('cyber_slots_spins', '0');
      setSpinCount(0);
      setLastSpinDate(today);
    } else {
      setSpinCount(parseInt(storedSpins || '0'));
      setLastSpinDate(storedDate);
    }
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-green-500 to-green-700';
      case 'rare': return 'from-blue-500 to-blue-700';
      case 'epic': return 'from-purple-500 to-purple-700';
      case 'legendary': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-green-500/50';
      case 'rare': return 'shadow-blue-500/50';
      case 'epic': return 'shadow-purple-500/50';
      case 'legendary': return 'shadow-yellow-500/50';
      default: return 'shadow-gray-500/50';
    }
  };

  const getRandomSymbol = (): SlotSymbol => {
    // Weighted randomness - common more likely than legendary
    const weights = [40, 25, 20, 10, 5]; // common, rare, epic, legendary, standard (as rare)
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return SLOT_SYMBOLS[i];
      }
    }
    return SLOT_SYMBOLS[0];
  };

  const checkWin = (results: SlotSymbol[]): boolean => {
    // Win if all 3 match by rarity
    return results[0].rarity === results[1].rarity && results[1].rarity === results[2].rarity;
  };

  const spin = useCallback(async () => {
    if (!isWalletConnected) {
      toast.error('Connect wallet to spin!');
      return;
    }

    if (spinCount >= MAX_DAILY_SPINS) {
      toast.error('No spins remaining today! Come back tomorrow.');
      return;
    }

    if (isSpinning) return;

    setIsSpinning(true);
    setShowWin(false);
    setWinInfo(null);

    // Start reel animations with staggered timing
    setReelAnimations([true, true, true]);

    // Simulate spinning with rapid symbol changes
    const spinInterval = setInterval(() => {
      setReels([getRandomSymbol(), getRandomSymbol(), getRandomSymbol()]);
    }, 100);

    // Stop each reel one at a time
    const finalResults: SlotSymbol[] = [];
    
    setTimeout(() => {
      finalResults[0] = getRandomSymbol();
      setReels(prev => [finalResults[0], prev[1], prev[2]]);
      setReelAnimations([false, true, true]);
    }, SPIN_DURATION * 0.4);

    setTimeout(() => {
      finalResults[1] = getRandomSymbol();
      setReels(prev => [prev[0], finalResults[1], prev[2]]);
      setReelAnimations([false, false, true]);
    }, SPIN_DURATION * 0.7);

    setTimeout(() => {
      clearInterval(spinInterval);
      finalResults[2] = getRandomSymbol();
      setReels([finalResults[0], finalResults[1], finalResults[2]]);
      setReelAnimations([false, false, false]);
      setIsSpinning(false);

      // Update spin count
      const newCount = spinCount + 1;
      setSpinCount(newCount);
      localStorage.setItem('cyber_slots_spins', newCount.toString());

      // Check for win
      if (checkWin(finalResults)) {
        const winRarity = finalResults[0].rarity;
        const tokens = finalResults[0].tokenReward * 3; // Triple for matching 3!
        
        setWinInfo({ rarity: winRarity, tokens });
        setShowWin(true);
        
        toast.success(`🎰 JACKPOT! 3x ${winRarity.toUpperCase()} - You win ${tokens} CCTR + ${winRarity} Chest!`);
        onWin?.(winRarity, tokens);
      } else {
        toast.info('No match this time. Try again!');
      }
    }, SPIN_DURATION);

  }, [isWalletConnected, spinCount, isSpinning, onWin]);

  const remainingSpins = MAX_DAILY_SPINS - spinCount;

  return (
    <Card className="vending-machine hover:scale-[1.01] transition-transform relative overflow-hidden border-2 border-neon-cyan/30">
      <CardContent className="p-4">
        {/* Header */}
        <div className="text-center mb-3">
          <h3 className="font-display text-lg bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-green bg-clip-text text-transparent flex items-center justify-center gap-2">
            <Zap className="w-5 h-5 text-neon-cyan" />
            CYBER SLOTS
            <Zap className="w-5 h-5 text-neon-pink" />
          </h3>
          <p className="text-xs text-muted-foreground">Match 3 chests to win CCTR + Chest!</p>
        </div>

        {/* Slot Machine Display */}
        <div className="bg-gradient-to-b from-black/80 to-neon-purple/20 rounded-lg p-3 border border-neon-purple/30 relative">
          {/* Win Overlay */}
          {showWin && winInfo && (
            <div className="absolute inset-0 bg-black/80 z-10 flex items-center justify-center rounded-lg animate-fade-in">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
                  <span className="text-2xl font-bold text-yellow-400">JACKPOT!</span>
                  <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
                </div>
                <Badge className={`bg-gradient-to-r ${getRarityColor(winInfo.rarity)} text-white text-lg px-4 py-1`}>
                  {winInfo.rarity.toUpperCase()} CHEST
                </Badge>
                <p className="text-neon-green font-bold text-xl">+{winInfo.tokens} CCTR</p>
                <Button 
                  size="sm" 
                  onClick={() => setShowWin(false)}
                  className="cyber-button mt-2"
                >
                  <Gift className="w-4 h-4 mr-1" />
                  Claim Rewards
                </Button>
              </div>
            </div>
          )}

          {/* Reels Container */}
          <div className="flex justify-center gap-2 mb-3">
            {reels.map((symbol, index) => (
              <div
                key={index}
                className={`
                  relative w-20 h-24 rounded-lg overflow-hidden
                  bg-gradient-to-b from-neon-purple/30 to-black/60
                  border-2 border-neon-cyan/40
                  ${reelAnimations[index] ? 'animate-pulse' : ''}
                  ${showWin && winInfo ? `shadow-lg ${getRarityGlow(winInfo.rarity)}` : ''}
                  transition-all duration-300
                `}
              >
                <img
                  src={symbol.image}
                  alt={symbol.name}
                  className={`
                    w-full h-full object-cover
                    ${reelAnimations[index] ? 'blur-sm scale-110' : ''}
                    transition-all duration-200
                  `}
                />
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" 
                  style={{ animationDuration: '2s', animationIterationCount: 'infinite' }} 
                />
                {/* Rarity indicator */}
                <div className={`absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r ${getRarityColor(symbol.rarity)}`} />
              </div>
            ))}
          </div>

          {/* Spin Counter */}
          <div className="flex items-center justify-center gap-2 mb-3">
            {[...Array(MAX_DAILY_SPINS)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-all ${
                  i < remainingSpins 
                    ? 'bg-neon-green shadow-lg shadow-neon-green/50' 
                    : 'bg-muted-foreground/30'
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">
              {remainingSpins}/{MAX_DAILY_SPINS} spins
            </span>
          </div>

          {/* Spin Button */}
          <Button
            onClick={spin}
            disabled={isSpinning || remainingSpins <= 0 || !isWalletConnected}
            className={`
              w-full cyber-button text-lg font-bold py-3
              ${isSpinning ? 'animate-pulse' : ''}
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {isSpinning ? (
              <>
                <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                SPINNING...
              </>
            ) : remainingSpins <= 0 ? (
              'NO SPINS LEFT'
            ) : !isWalletConnected ? (
              'CONNECT WALLET'
            ) : (
              <>
                <Star className="w-5 h-5 mr-2" />
                FREE SPIN
              </>
            )}
          </Button>
        </div>

        {/* Rewards Info */}
        <div className="mt-3 space-y-1.5 text-xs">
          <p className="text-center text-muted-foreground font-medium">Match 3 to Win:</p>
          <div className="grid grid-cols-2 gap-1">
            <div className="flex items-center gap-1.5">
              <Badge className="bg-green-500 text-white text-[10px] px-1.5">COMMON</Badge>
              <span className="text-muted-foreground">150 CCTR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-blue-500 text-white text-[10px] px-1.5">RARE</Badge>
              <span className="text-muted-foreground">450 CCTR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-purple-500 text-white text-[10px] px-1.5">EPIC</Badge>
              <span className="text-muted-foreground">1500 CCTR</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge className="bg-yellow-500 text-white text-[10px] px-1.5">LEGEND</Badge>
              <span className="text-muted-foreground">6000 CCTR</span>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Decorative Corner Sparkles */}
      <Sparkles className="absolute top-2 right-2 w-4 h-4 text-neon-cyan animate-pulse opacity-60" />
      <Sparkles className="absolute bottom-2 left-2 w-4 h-4 text-neon-pink animate-pulse opacity-60" style={{ animationDelay: '0.5s' }} />
    </Card>
  );
};

export default CyberSlotsMachine;
