import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
const REEL_SPIN_DURATION = [1200, 1600, 2000];

interface CyberSlotsMachineProps {
  onWin?: (rarity: string, tokens: number) => void;
}

// Arcade lights configuration
const LIGHT_COLORS = ['cyan', 'pink', 'green', 'yellow', 'purple'] as const;

const generateLights = () => {
  const lights: { position: 'top' | 'bottom' | 'left' | 'right'; offset: number; color: typeof LIGHT_COLORS[number]; delay: number }[] = [];
  const spacing = 40;
  
  // Top lights
  for (let i = 0; i < 12; i++) {
    lights.push({ position: 'top', offset: 20 + i * spacing, color: LIGHT_COLORS[i % LIGHT_COLORS.length], delay: i * 0.1 });
  }
  // Bottom lights
  for (let i = 0; i < 12; i++) {
    lights.push({ position: 'bottom', offset: 20 + i * spacing, color: LIGHT_COLORS[(i + 2) % LIGHT_COLORS.length], delay: i * 0.1 + 0.5 });
  }
  // Left lights
  for (let i = 0; i < 6; i++) {
    lights.push({ position: 'left', offset: 40 + i * 50, color: LIGHT_COLORS[(i + 1) % LIGHT_COLORS.length], delay: i * 0.15 });
  }
  // Right lights
  for (let i = 0; i < 6; i++) {
    lights.push({ position: 'right', offset: 40 + i * 50, color: LIGHT_COLORS[(i + 3) % LIGHT_COLORS.length], delay: i * 0.15 + 0.3 });
  }
  
  return lights;
};

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

  useEffect(() => {
    const strip: SlotSymbol[] = [];
    for (let i = 0; i < 20; i++) {
      strip.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    strip.push(finalSymbol);
    setDisplaySymbols(strip);
  }, [finalSymbol, symbols]);

  useEffect(() => {
    if (isSpinning) {
      startTimeRef.current = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / spinDuration, 1);
        
        const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
        
        const easedProgress = easeOut(progress);
        const totalDistance = (displaySymbols.length - 1) * 100;
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
        slot-reel-container relative flex-1 w-full max-w-[220px] rounded-xl overflow-hidden
        bg-gradient-to-b from-neon-purple/30 to-black/80
        border-4 border-neon-cyan/60
        ${showWin && winRarity ? `shadow-2xl ${getRarityGlow(winRarity)} winner` : 'shadow-lg shadow-neon-purple/40'}
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
            <Badge 
              className={`absolute top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r ${getRarityColor(symbol.rarity)} text-white text-xs px-3 py-1 opacity-95 shadow-lg`}
            >
              {symbol.rarity.toUpperCase()}
            </Badge>
          </div>
        ))}
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/70 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10" />
      
      {/* Center line indicator */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 bg-neon-cyan/70 pointer-events-none z-10 shadow-lg shadow-neon-cyan/60" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
      
      {/* Rarity indicator bar */}
      <div className={`absolute bottom-0 inset-x-0 h-3 bg-gradient-to-r ${getRarityColor(finalSymbol.rarity)} z-20`} />
    </div>
  );
};

// Arcade Lights Component
const ArcadeLights: React.FC<{ isWinning: boolean }> = ({ isWinning }) => {
  const lights = useMemo(() => generateLights(), []);
  
  return (
    <div className="arcade-lights">
      {lights.map((light, idx) => {
        const style: React.CSSProperties = {
          '--delay': `${light.delay}s`,
        } as React.CSSProperties;
        
        if (light.position === 'top' || light.position === 'bottom') {
          style.left = `${light.offset}px`;
        } else {
          style.top = `${light.offset}px`;
        }
        
        return (
          <div
            key={idx}
            className={`arcade-light ${light.position} ${light.color}`}
            style={style}
          />
        );
      })}
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

  useEffect(() => {
    if (demoPlayedRef.current) return;
    demoPlayedRef.current = true;
    
    const demoTimer = setTimeout(() => {
      playDemoJackpot();
    }, 1000);
    
    return () => clearTimeout(demoTimer);
  }, []);

  const playDemoJackpot = useCallback(() => {
    const legendarySymbol = SLOT_SYMBOLS[3];
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

  useEffect(() => {
    if (stoppedReels === 3 && isSpinning) {
      setIsSpinning(false);
      setStoppedReels(0);
      
      if (!isDemo) {
        const newCount = spinCount + 1;
        setSpinCount(newCount);
        localStorage.setItem('cyber_slots_spins', newCount.toString());
      }

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
    <Card className="hover:scale-[1.01] transition-transform relative overflow-visible border-0 bg-transparent col-span-full lg:col-span-3">
      <CardContent className="p-0">
        {/* Slots Cabinet */}
        <div className={`slots-cabinet ${showWin ? 'winning' : ''}`}>
          {/* Arcade Lights */}
          <ArcadeLights isWinning={showWin} />
          
          {/* Header */}
          <div className="text-center mb-6 relative z-20">
            <div className="inline-flex items-center gap-3 bg-black/60 px-6 py-3 rounded-full border border-neon-cyan/30">
              <Zap className="w-7 h-7 text-neon-cyan animate-pulse" />
              <h3 className="font-display text-3xl bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-green bg-clip-text text-transparent">
                CYBER SLOTS
              </h3>
              <Zap className="w-7 h-7 text-neon-pink animate-pulse" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">Match 3 chests to win CCC + unlock that chest!</p>
          </div>

          {/* Slot Machine Display */}
          <div className="slots-display relative">
            {/* Win Overlay */}
            {showWin && winInfo && (
              <div className="jackpot-overlay absolute inset-0 bg-black/95 z-30 flex items-center justify-center rounded-xl animate-fade-in">
                <div className="text-center space-y-4">
                  {isDemoWin && (
                    <Badge className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 text-sm px-4 py-1.5">
                      ✨ DEMO PREVIEW ✨
                    </Badge>
                  )}
                  <div className="flex items-center justify-center gap-4">
                    <Trophy className="w-14 h-14 text-yellow-400 animate-bounce" />
                    <span className="jackpot-text text-5xl font-bold text-yellow-400">JACKPOT!</span>
                    <Trophy className="w-14 h-14 text-yellow-400 animate-bounce" />
                  </div>
                  <Badge className={`bg-gradient-to-r ${getRarityColor(winInfo.rarity)} text-white text-2xl px-8 py-3`}>
                    {winInfo.rarity.toUpperCase()} CHEST UNLOCKED!
                  </Badge>
                  <p className="text-neon-green font-bold text-4xl">+{winInfo.tokens} CCC</p>
                  <Button 
                    size="lg" 
                    onClick={() => { setShowWin(false); setIsDemoWin(false); }}
                    className="cyber-button mt-4 text-lg px-8 py-6"
                  >
                    {isDemoWin ? (
                      <>
                        <Star className="w-6 h-6 mr-2" />
                        Try Your Luck!
                      </>
                    ) : (
                      <>
                        <Gift className="w-6 h-6 mr-2" />
                        Claim Rewards
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Reels Container */}
            <div className="flex justify-center gap-4 md:gap-6 mb-6">
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

            {/* Coin Slot Decoration */}
            <div className="coin-slot mb-4" />

            {/* Spin Counter & Button Row */}
            <div className="flex flex-col items-center gap-4">
              {/* Spin Counter */}
              <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-full">
                {[...Array(MAX_DAILY_SPINS)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full transition-all ${
                      i < remainingSpins 
                        ? 'bg-neon-green shadow-lg shadow-neon-green/60 animate-pulse' 
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2 font-medium">
                  {remainingSpins}/{MAX_DAILY_SPINS} spins left
                </span>
              </div>

              {/* Spin Button */}
              <div className="spin-button-container">
                <div className="spin-button-glow" />
                <Button
                  onClick={spin}
                  disabled={isSpinning || remainingSpins <= 0 || !isWalletConnected}
                  size="lg"
                  className={`
                    relative z-10 cyber-button text-2xl font-bold px-12 py-6 h-auto
                    ${isSpinning ? 'animate-pulse' : ''}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  {isSpinning ? (
                    <>
                      <Sparkles className="w-7 h-7 mr-3 animate-spin" />
                      SPINNING...
                    </>
                  ) : remainingSpins <= 0 ? (
                    'NO SPINS LEFT'
                  ) : !isWalletConnected ? (
                    'CONNECT WALLET'
                  ) : (
                    <>
                      <Star className="w-7 h-7 mr-3" />
                      FREE SPIN
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Rules & Rewards Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* How to Play */}
            <div className="bg-gradient-to-br from-neon-purple/15 to-neon-cyan/15 rounded-xl p-5 border border-neon-purple/30">
              <h4 className="font-bold text-neon-pink mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                How to Play
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                  Get 3 free spins every day
                </li>
                <li className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                  Match 3 chests of the same rarity
                </li>
                <li className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                  Win CCC credits + unlock that chest
                </li>
                <li className="flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  Higher rarity = bigger rewards!
                </li>
              </ul>
            </div>

            {/* Rewards Table */}
            <div className="bg-gradient-to-br from-neon-cyan/15 to-neon-green/15 rounded-xl p-5 border border-neon-cyan/30">
              <h4 className="font-bold text-neon-green mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Match 3 Rewards
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2">
                  <Badge className="bg-green-500 text-white text-xs px-2">COMMON</Badge>
                  <span className="text-sm text-muted-foreground">150 CCC</span>
                </div>
                <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2">
                  <Badge className="bg-blue-500 text-white text-xs px-2">RARE</Badge>
                  <span className="text-sm text-muted-foreground">450 CCC</span>
                </div>
                <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2">
                  <Badge className="bg-purple-500 text-white text-xs px-2">EPIC</Badge>
                  <span className="text-sm text-muted-foreground">1,500 CCC</span>
                </div>
                <div className="flex items-center gap-2 bg-black/40 rounded-lg p-2">
                  <Badge className="bg-yellow-500 text-white text-xs px-2">LEGEND</Badge>
                  <span className="text-sm text-muted-foreground">6,000 CCC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CyberSlotsMachine;
