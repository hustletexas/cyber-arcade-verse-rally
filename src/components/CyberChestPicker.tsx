import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles, RotateCcw, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { useMultiWallet } from '@/hooks/useMultiWallet';

interface Prize {
  id: string;
  letter: string;
  reward: string;
  ccc: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  revealed: boolean;
  isWinner: boolean;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const PRIZE_POOL = [
  { reward: '🎮 Free Tournament Entry', ccc: 500, rarity: 'common' as const },
  { reward: '💎 Rare NFT Badge', ccc: 1000, rarity: 'rare' as const },
  { reward: '🏆 Epic Chest Unlock', ccc: 2500, rarity: 'epic' as const },
  { reward: '👑 Legendary Jackpot', ccc: 5000, rarity: 'legendary' as const },
  { reward: '⭐ Bonus Spin Token', ccc: 250, rarity: 'common' as const },
];

const getRarityStyles = (rarity: string) => {
  switch (rarity) {
    case 'common':
      return { bg: 'from-green-500 to-green-700', glow: 'shadow-green-500/50', text: 'text-green-400' };
    case 'rare':
      return { bg: 'from-blue-500 to-blue-700', glow: 'shadow-blue-500/50', text: 'text-blue-400' };
    case 'epic':
      return { bg: 'from-purple-500 to-purple-700', glow: 'shadow-purple-500/50', text: 'text-purple-400' };
    case 'legendary':
      return { bg: 'from-yellow-500 to-orange-600', glow: 'shadow-yellow-500/50', text: 'text-yellow-400' };
    default:
      return { bg: 'from-gray-500 to-gray-700', glow: 'shadow-gray-500/50', text: 'text-gray-400' };
  }
};

export const CyberChestPicker: React.FC = () => {
  const { isWalletConnected } = useMultiWallet();
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [dailyPlaysLeft, setDailyPlaysLeft] = useState(1);

  // Initialize prizes with shuffled rewards
  const initializePrizes = useCallback(() => {
    const shuffledPrizes = [...PRIZE_POOL].sort(() => Math.random() - 0.5);
    const newPrizes: Prize[] = LETTERS.map((letter, index) => ({
      id: `prize-${letter}`,
      letter,
      reward: shuffledPrizes[index].reward,
      ccc: shuffledPrizes[index].ccc,
      rarity: shuffledPrizes[index].rarity,
      revealed: false,
      isWinner: false,
    }));
    setPrizes(newPrizes);
    setSelectedLetter(null);
    setGameComplete(false);
    setIsRevealing(false);
  }, []);

  // Check daily plays on mount
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('cyber_chest_picker_date');
    const storedPlays = localStorage.getItem('cyber_chest_picker_plays');

    if (storedDate !== today) {
      localStorage.setItem('cyber_chest_picker_date', today);
      localStorage.setItem('cyber_chest_picker_plays', '0');
      setDailyPlaysLeft(1);
    } else {
      const plays = parseInt(storedPlays || '0');
      setDailyPlaysLeft(Math.max(0, 1 - plays));
    }

    initializePrizes();
  }, [initializePrizes]);

  const handleLetterClick = (letter: string) => {
    if (!isWalletConnected) {
      toast.error('Connect wallet to play!');
      return;
    }

    if (dailyPlaysLeft <= 0) {
      toast.error('No plays left today! Come back tomorrow.');
      return;
    }

    if (isRevealing || gameComplete || selectedLetter) return;

    setSelectedLetter(letter);
    setIsRevealing(true);

    // Reveal animation sequence
    setTimeout(() => {
      setPrizes(prev =>
        prev.map(p =>
          p.letter === letter ? { ...p, revealed: true, isWinner: true } : p
        )
      );

      // Reveal all other prizes after a delay
      setTimeout(() => {
        setPrizes(prev => prev.map(p => ({ ...p, revealed: true })));
        setGameComplete(true);
        setIsRevealing(false);

        // Update daily plays
        const plays = parseInt(localStorage.getItem('cyber_chest_picker_plays') || '0') + 1;
        localStorage.setItem('cyber_chest_picker_plays', plays.toString());
        setDailyPlaysLeft(Math.max(0, 1 - plays));

        const winningPrize = prizes.find(p => p.letter === letter);
        if (winningPrize) {
          toast.success(`🎉 You won ${winningPrize.ccc} CCC! ${winningPrize.reward}`);
        }
      }, 1500);
    }, 800);
  };

  const handleReset = () => {
    if (dailyPlaysLeft > 0) {
      initializePrizes();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-neon-pink" />
          <h3 className="font-display text-xl bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
            MYSTERY LETTER CHEST
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            className={`${dailyPlaysLeft > 0 ? 'bg-neon-green/20 text-neon-green border-neon-green' : 'bg-red-500/20 text-red-400 border-red-500'}`}
          >
            {dailyPlaysLeft > 0 ? `${dailyPlaysLeft} FREE PICK` : 'COME BACK TOMORROW'}
          </Badge>
          {gameComplete && dailyPlaysLeft > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <p className="text-sm text-muted-foreground text-center">
        {!selectedLetter 
          ? '🔮 Pick a letter to reveal your mystery prize!' 
          : gameComplete 
            ? '✨ All prizes revealed! Come back tomorrow for another pick.'
            : '🎰 Revealing your prize...'}
      </p>

      {/* Letter Cards Grid */}
      <div className="grid grid-cols-5 gap-3">
        {prizes.map((prize) => {
          const styles = getRarityStyles(prize.rarity);
          const isSelected = prize.letter === selectedLetter;
          const canClick = !isRevealing && !gameComplete && !selectedLetter && dailyPlaysLeft > 0 && isWalletConnected;

          return (
            <Card
              key={prize.id}
              onClick={() => canClick && handleLetterClick(prize.letter)}
              className={`
                relative overflow-hidden transition-all duration-500 cursor-pointer
                ${prize.revealed 
                  ? `bg-gradient-to-br ${styles.bg} shadow-lg ${styles.glow}` 
                  : 'bg-gradient-to-br from-neon-purple/30 to-black/60 hover:from-neon-purple/50 hover:to-black/40'
                }
                ${isSelected && !prize.revealed ? 'animate-pulse scale-105' : ''}
                ${canClick ? 'hover:scale-105 hover:shadow-neon-cyan/30 hover:shadow-lg' : ''}
                ${!canClick && !prize.revealed ? 'opacity-60' : ''}
                border-2 ${prize.isWinner && prize.revealed ? 'border-yellow-400' : 'border-neon-cyan/30'}
              `}
            >
              <CardContent className="p-3 flex flex-col items-center justify-center min-h-[120px] relative">
                {/* Unrevealed State */}
                {!prize.revealed && (
                  <div className="text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-neon-purple/30 flex items-center justify-center mx-auto">
                      {canClick ? (
                        <Unlock className="w-5 h-5 text-neon-cyan" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-display text-3xl text-neon-cyan">
                      {prize.letter}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      CLICK TO REVEAL
                    </span>
                  </div>
                )}

                {/* Revealed State */}
                {prize.revealed && (
                  <div className="text-center space-y-1 animate-scale-in">
                    {prize.isWinner && (
                      <Sparkles className="w-5 h-5 text-yellow-300 mx-auto animate-pulse" />
                    )}
                    <span className="text-2xl">{prize.reward.split(' ')[0]}</span>
                    <p className="text-xs font-bold text-white leading-tight">
                      {prize.reward.split(' ').slice(1).join(' ')}
                    </p>
                    <Badge className={`bg-black/40 text-white text-xs mt-1`}>
                      +{prize.ccc} CCC
                    </Badge>
                    <Badge className={`${styles.text} bg-black/30 text-[10px] uppercase`}>
                      {prize.rarity}
                    </Badge>
                  </div>
                )}

                {/* Winner Crown */}
                {prize.isWinner && prize.revealed && (
                  <div className="absolute -top-1 -right-1">
                    <span className="text-xl">👑</span>
                  </div>
                )}

                {/* Sparkle effects for unrevealed cards */}
                {!prize.revealed && canClick && (
                  <>
                    <Sparkles className="absolute top-2 right-2 w-3 h-3 text-neon-cyan/50 animate-pulse" />
                    <Sparkles className="absolute bottom-2 left-2 w-3 h-3 text-neon-pink/50 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Prize Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {[
          { rarity: 'common', label: 'Common' },
          { rarity: 'rare', label: 'Rare' },
          { rarity: 'epic', label: 'Epic' },
          { rarity: 'legendary', label: 'Legendary' },
        ].map(({ rarity, label }) => {
          const styles = getRarityStyles(rarity);
          return (
            <div key={rarity} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${styles.bg}`} />
              <span className={`text-xs ${styles.text}`}>{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CyberChestPicker;
