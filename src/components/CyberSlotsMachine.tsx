import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Gift, Zap, Trophy, Star } from 'lucide-react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { toast } from 'sonner';
import './CyberSlotsMachine.css';

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
const REEL_SPIN_DURATION = [1200, 1600, 2000]; // Staggered stop times

interface CyberSlotsMachineProps {
  onWin?: (rarity: string, tokens: number) => void;
}

// Single Reel Component with vertical spinning
const SlotReel: React.FC<{
  symbols: SlotSymbol[];
  finalSymbol: SlotSymbol;
  isSpinning: boolean;
  spinDuration: number;
  onStop: () => void;
  getRarityColor: (rarity: string) => string;
  showWin: boolean;
  winRarity?: string;
}> = ({ symbols, finalSymbol, isSpinning, spinDuration, onStop, getRarityColor, showWin, winRarity }) => {
  const [currentOffset, setCurrentOffset] = useState(0);
  const [displaySymbols, setDisplaySymbols] = useState<SlotSymbol[]>([]);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(0);

  // Generate a strip of symbols for spinning
  useEffect(() => {
    const strip: SlotSymbol[] = [];
    // Add random symbols for the spin animation
    for (let i = 0; i < 20; i++) {
      strip.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    // Add the final symbol at the end
    strip.push(finalSymbol);
    setDisplaySymbols(strip);
  }, [finalSymbol, symbols]);

  useEffect(() => {
    if (isSpinning) {
      startTimeRef.current = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        // Easing function for realistic slot machine feel
        const easeOut = (t: number) => {
          // Start fast, slow down at the end
          return 1 - Math.pow(1 - t, 3);
        };
        
        const easedProgress = easeOut(progress);
        const totalDistance = (displaySymbols.length - 1) * 100; // percentage
        const newOffset = easedProgress * totalDistance;
        
        setCurrentOffset(newOffset);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          onStop();
        }
      };
      
      animationRef.current = requestAnimationFrame(animate);
      
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      // Reset to show final symbol
      setCurrentOffset((displaySymbols.length - 1) * 100);
    }
  }, [isSpinning, spinDuration, displaySymbols.length, onStop]);

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'shadow-green-500/60';
      case 'rare': return 'shadow-blue-500/60';
      case 'epic': return 'shadow-purple-500/60';
      case 'legendary': return 'shadow-yellow-500/60';
      default: return 'shadow-gray-500/60';
    }
  };

  return (
    <div 
      className={`
        slot-reel-container relative flex-1 max-w-[180px] aspect-[3/4] rounded-xl overflow-hidden
        bg-gradient-to-b from-neon-purple/30 to-black/60
        border-3 border-neon-cyan/50
        ${showWin && winRarity ? `shadow-xl ${getRarityGlow(winRarity)}` : 'shadow-lg shadow-neon-purple/30'}
        transition-shadow duration-300
      `}
    >
      {/* Reel Strip */}
      <div 
        className="slot-reel-strip absolute inset-0"
        style={{
          transform: `translateY(-${currentOffset}%)`,
          transition: isSpinning ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {displaySymbols.map((symbol, idx) => (
          <div 
            key={idx} 
            className="slot-symbol w-full h-full relative flex items-center justify-center"
            style={{ height: '100%' }}
          >
            <img
              src={symbol.image}
              alt={symbol.name}
              className="w-full h-full object-cover"
            />
            {/* Rarity badge on each symbol */}
            <Badge 
              className={`absolute top-2 left-1/2 -translate-x-1/2 bg-gradient-to-r ${getRarityColor(symbol.rarity)} text-white text-[10px] px-2 opacity-90`}
            >
              {symbol.rarity.toUpperCase()}
            </Badge>
          </div>
        ))}
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
      
      {/* Center line indicator */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-neon-cyan/50 pointer-events-none z-10 shadow-lg shadow-neon-cyan/50" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      
      {/* Rarity indicator bar */}
      <div className={`absolute bottom-0 inset-x-0 h-2 bg-gradient-to-r ${getRarityColor(finalSymbol.rarity)} z-20`} />
    </div>
  );
};

export const CyberSlotsMachine: React.FC<CyberSlotsMachineProps> = ({ onWin }) => {
  const { isWalletConnected } = useMultiWallet();
  const { balance } = useUserBalance();
  
  const [finalReels, setFinalReels] = useState<SlotSymbol[]>([SLOT_SYMBOLS[0], SLOT_SYMBOLS[1], SLOT_SYMBOLS[2]]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelSpinning, setReelSpinning] = useState([false, false, false]);
  const [spinCount, setSpinCount] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [winInfo, setWinInfo] = useState<{ rarity: string; tokens: number } | null>(null);
  const [stoppedReels, setStoppedReels] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [isDemoWin, setIsDemoWin] = useState(false);
  const demoPlayedRef = useRef(false);

  // Check/reset daily spins
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('cyber_slots_date');
    const storedSpins = localStorage.getItem('cyber_slots_spins');

    if (storedDate !== today) {
      localStorage.setItem('cyber_slots_date', today);
      localStorage.setItem('cyber_slots_spins', '0');
      setSpinCount(0);
    } else {
      setSpinCount(parseInt(storedSpins || '0'));
    }
  }, []);

  // Play demo jackpot on first load
  useEffect(() => {
    if (demoPlayedRef.current) return;
    demoPlayedRef.current = true;
    
    // Start demo after a short delay
    const demoTimer = setTimeout(() => {
      playDemoJackpot();
    }, 1000);
    
    return () => clearTimeout(demoTimer);
  }, []);

  const playDemoJackpot = useCallback(() => {
    // Set legendary symbols for jackpot
    const legendarySymbol = SLOT_SYMBOLS[3]; // legendary
    setFinalReels([legendarySymbol, legendarySymbol, legendarySymbol]);
    
    setIsDemo(true);
    setIsSpinning(true);
    setShowWin(false);
    setWinInfo(null);
    setStoppedReels(0);
    setReelSpinning([true, true, true]);
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

  const getRandomSymbol = (): SlotSymbol => {
    const weights = [40, 25, 20, 10, 5];
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
    return results[0].rarity === results[1].rarity && results[1].rarity === results[2].rarity;
  };

  const handleReelStop = useCallback((reelIndex: number) => {
    setReelSpinning(prev => {
      const newState = [...prev];
      newState[reelIndex] = false;
      return newState;
    });
    setStoppedReels(prev => prev + 1);
  }, []);

  // Check for win when all reels stop
  useEffect(() => {
    if (stoppedReels === 3 && isSpinning) {
      setIsSpinning(false);
      setStoppedReels(0);
      
      // Don't count demo spins
      if (!isDemo) {
        const newCount = spinCount + 1;
        setSpinCount(newCount);
        localStorage.setItem('cyber_slots_spins', newCount.toString());
      }

      // Check for win
      if (checkWin(finalReels)) {
        const winRarity = finalReels[0].rarity;
        const tokens = finalReels[0].tokenReward * 3;
        
        setWinInfo({ rarity: winRarity, tokens });
        setShowWin(true);
        setIsDemoWin(isDemo);
        
        if (isDemo) {
          // Demo mode - just show the win animation
        } else {
          toast.success(`🎰 JACKPOT! 3x ${winRarity.toUpperCase()} - You win ${tokens} CCC + ${winRarity} Chest!`);
          onWin?.(winRarity, tokens);
        }
      } else if (!isDemo) {
        toast.info('No match this time. Try again!');
      }
      
      setIsDemo(false);
    }
  }, [stoppedReels, isSpinning, finalReels, spinCount, onWin, isDemo]);

  const spin = useCallback(() => {
    if (!isWalletConnected) {
      toast.error('Connect wallet to spin!');
      return;
    }

    if (spinCount >= MAX_DAILY_SPINS) {
      toast.error('No spins remaining today! Come back tomorrow.');
      return;
    }

    if (isSpinning) return;

    // Generate final results
    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    setFinalReels(results);
    
    setIsSpinning(true);
    setShowWin(false);
    setWinInfo(null);
    setStoppedReels(0);
    setReelSpinning([true, true, true]);
  }, [isWalletConnected, spinCount, isSpinning]);

  const remainingSpins = MAX_DAILY_SPINS - spinCount;

  return (
    <Card className="vending-machine hover:scale-[1.01] transition-transform relative overflow-hidden border-2 border-neon-cyan/30 col-span-full lg:col-span-3">
      <CardContent className="p-4">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="font-display text-2xl bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-green bg-clip-text text-transparent flex items-center justify-center gap-3">
            <Zap className="w-6 h-6 text-neon-cyan" />
            CYBER SLOTS
            <Zap className="w-6 h-6 text-neon-pink" />
          </h3>
          <p className="text-sm text-muted-foreground">Match 3 chests to win CCTR + unlock that chest!</p>
        </div>

        {/* Slot Machine Display */}
        <div className="bg-gradient-to-b from-black/80 to-neon-purple/20 rounded-xl p-4 border border-neon-purple/30 relative">
          {/* Win Overlay */}
          {showWin && winInfo && (
            <div className="absolute inset-0 bg-black/90 z-20 flex items-center justify-center rounded-xl animate-fade-in">
              <div className="text-center space-y-3">
                {isDemoWin && (
                  <Badge className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 text-xs px-3 py-1 mb-2">
                    ✨ DEMO PREVIEW ✨
                  </Badge>
                )}
                <div className="flex items-center justify-center gap-3">
                  <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
                  <span className="text-3xl font-bold text-yellow-400">JACKPOT!</span>
                  <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
                </div>
                <Badge className={`bg-gradient-to-r ${getRarityColor(winInfo.rarity)} text-white text-xl px-6 py-2`}>
                  {winInfo.rarity.toUpperCase()} CHEST UNLOCKED!
                </Badge>
                <p className="text-neon-green font-bold text-2xl">+{winInfo.tokens} CCC</p>
                <Button 
                  size="lg" 
                  onClick={() => { setShowWin(false); setIsDemoWin(false); }}
                  className="cyber-button mt-3"
                >
                  {isDemoWin ? (
                    <>
                      <Star className="w-5 h-5 mr-2" />
                      Try Your Luck!
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5 mr-2" />
                      Claim Rewards
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Reels Container */}
          <div className="flex justify-center gap-3 md:gap-6 mb-4">
            {[0, 1, 2].map((index) => (
              <SlotReel
                key={index}
                symbols={SLOT_SYMBOLS}
                finalSymbol={finalReels[index]}
                isSpinning={reelSpinning[index]}
                spinDuration={REEL_SPIN_DURATION[index]}
                onStop={() => handleReelStop(index)}
                getRarityColor={getRarityColor}
                showWin={showWin}
                winRarity={winInfo?.rarity}
              />
            ))}
          </div>

          {/* Spin Counter & Button Row */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Spin Counter */}
            <div className="flex items-center gap-2">
              {[...Array(MAX_DAILY_SPINS)].map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full transition-all ${
                    i < remainingSpins 
                      ? 'bg-neon-green shadow-lg shadow-neon-green/50' 
                      : 'bg-muted-foreground/30'
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {remainingSpins}/{MAX_DAILY_SPINS} spins left
              </span>
            </div>

            {/* Spin Button */}
            <Button
              onClick={spin}
              disabled={isSpinning || remainingSpins <= 0 || !isWalletConnected}
              size="lg"
              className={`
                cyber-button text-xl font-bold px-10 py-4
                ${isSpinning ? 'animate-pulse' : ''}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isSpinning ? (
                <>
                  <Sparkles className="w-6 h-6 mr-2 animate-spin" />
                  SPINNING...
                </>
              ) : remainingSpins <= 0 ? (
                'NO SPINS LEFT'
              ) : !isWalletConnected ? (
                'CONNECT WALLET'
              ) : (
                <>
                  <Star className="w-6 h-6 mr-2" />
                  FREE SPIN
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Rules & Rewards Section at Bottom */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* How to Play */}
          <div className="bg-gradient-to-br from-neon-purple/10 to-neon-cyan/10 rounded-lg p-4 border border-neon-purple/20">
            <h4 className="font-bold text-neon-pink mb-2 flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4" />
              How to Play
            </h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Star className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                Get 3 free spins every day
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                Match 3 chests of the same rarity
              </li>
              <li className="flex items-center gap-2">
                <Star className="w-3 h-3 text-neon-cyan flex-shrink-0" />
                Win CCC credits + unlock that chest
              </li>
              <li className="flex items-center gap-2">
                <Trophy className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                Higher rarity = bigger rewards!
              </li>
            </ul>
          </div>

          {/* Rewards Table */}
          <div className="bg-gradient-to-br from-neon-cyan/10 to-neon-green/10 rounded-lg p-4 border border-neon-cyan/20">
            <h4 className="font-bold text-neon-green mb-2 flex items-center gap-2 text-sm">
              <Gift className="w-4 h-4" />
              Match 3 Rewards
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 bg-black/30 rounded p-1.5">
                <Badge className="bg-green-500 text-white text-[10px] px-1.5">COMMON</Badge>
                <span className="text-muted-foreground">150 CCC + Chest</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 rounded p-1.5">
                <Badge className="bg-blue-500 text-white text-[10px] px-1.5">RARE</Badge>
                <span className="text-muted-foreground">450 CCC + Chest</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 rounded p-1.5">
                <Badge className="bg-purple-500 text-white text-[10px] px-1.5">EPIC</Badge>
                <span className="text-muted-foreground">1500 CCC + Chest</span>
              </div>
              <div className="flex items-center gap-2 bg-black/30 rounded p-1.5">
                <Badge className="bg-yellow-500 text-white text-[10px] px-1.5">LEGEND</Badge>
                <span className="text-muted-foreground">6000 CCC + Chest</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Decorative Corner Sparkles */}
      <Sparkles className="absolute top-3 right-3 w-5 h-5 text-neon-cyan animate-pulse opacity-60" />
      <Sparkles className="absolute top-3 left-3 w-5 h-5 text-neon-pink animate-pulse opacity-60" style={{ animationDelay: '0.3s' }} />
      <Sparkles className="absolute bottom-3 right-3 w-5 h-5 text-neon-green animate-pulse opacity-60" style={{ animationDelay: '0.6s' }} />
      <Sparkles className="absolute bottom-3 left-3 w-5 h-5 text-yellow-400 animate-pulse opacity-60" style={{ animationDelay: '0.9s' }} />
    </Card>
  );
};

export default CyberSlotsMachine;
