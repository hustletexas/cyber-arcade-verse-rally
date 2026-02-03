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

const SPIN_COST = 10; // CCC per spin
const REEL_SPIN_DURATION = [1200, 1600, 2000];

interface CyberSlotsMachineProps {
  onWin?: (rarity: string, tokens: number) => void;
}

// Arcade button colors for decorative row
const ARCADE_BUTTON_COLORS = ['red', 'yellow', 'green', 'cyan', 'blue'] as const;

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

      {/* Top and bottom tabs instead of center line */}
      <div className="absolute inset-x-0 top-0 h-2 pointer-events-none z-10 flex justify-between px-0">
        <div className="w-3 h-full bg-gradient-to-b from-neon-cyan to-transparent rounded-br" />
        <div className="w-3 h-full bg-gradient-to-b from-neon-cyan to-transparent rounded-bl" />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-2 pointer-events-none z-10 flex justify-between px-0">
        <div className="w-3 h-full bg-gradient-to-t from-neon-pink to-transparent rounded-tr" />
        <div className="w-3 h-full bg-gradient-to-t from-neon-pink to-transparent rounded-tl" />
      </div>
      
      {/* Gradient overlays for depth */}
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none" />
    </div>
  );
};

// Arcade Buttons Decoration Component
const ArcadeButtonsRow: React.FC = () => {
  return (
    <div className="arcade-buttons">
      {ARCADE_BUTTON_COLORS.map((color) => (
        <div key={color} className={`arcade-button ${color}`} />
      ))}
    </div>
  );
};

export const CyberSlotsMachine: React.FC<CyberSlotsMachineProps> = ({ onWin }) => {
  const { isWalletConnected } = useMultiWallet();
  const { balance } = useUserBalance();
  
  const [finalReels, setFinalReels] = useState<SlotSymbol[]>([SLOT_SYMBOLS[0], SLOT_SYMBOLS[1], SLOT_SYMBOLS[2]]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reelSpinning, setReelSpinning] = useState([false, false, false]);
  const [showWin, setShowWin] = useState(false);
  const [winInfo, setWinInfo] = useState<{ rarity: string; tokens: number } | null>(null);
  const [stoppedReels, setStoppedReels] = useState(0);
  const [isDemo, setIsDemo] = useState(false);
  const [isDemoWin, setIsDemoWin] = useState(false);
  const demoPlayedRef = useRef(false);

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
  }, [stoppedReels, isSpinning, finalReels, onWin, isDemo]);

  const spin = useCallback(() => {
    if (!isWalletConnected) {
      toast.error('Connect wallet to spin!');
      return;
    }

    if ((balance?.cctr_balance || 0) < SPIN_COST) {
      toast.error(`Not enough CCC! You need ${SPIN_COST} CCC to spin.`);
      return;
    }

    if (isSpinning) return;

    // Deduct spin cost (in a real app, this would be a database transaction)
    toast.info(`-${SPIN_COST} CCC`);

    const results = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
    setFinalReels(results);
    
    setIsSpinning(true);
    setShowWin(false);
    setWinInfo(null);
    setStoppedReels(0);
    setReelSpinning([true, true, true]);
  }, [isWalletConnected, isSpinning, balance]);

  const hasEnoughBalance = (balance?.cctr_balance || 0) >= SPIN_COST;

  return (
    <Card className="hover:scale-[1.01] transition-transform relative overflow-visible border-0 bg-transparent col-span-full lg:col-span-3">
      <CardContent className="p-0">
        {/* Slots Cabinet with starfield background */}
        <div className={`slots-cabinet ${showWin ? 'winning' : ''}`}>
          {/* UFO Decorations */}
          <div className="ufo-decoration left" />
          <div className="ufo-decoration right" />

          {/* Neon Pink Title */}
          <div className="slots-title-container">
            <h3 className="slots-title">Cyber Slots</h3>
          </div>

          {/* Chrome Frame */}
          <div className="slots-frame">
            <div className="slots-inner">
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
                <div className="flex justify-center gap-3 md:gap-5 py-4">
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

                {/* Spin Cost Display */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Badge className="bg-neon-purple/30 text-neon-pink border border-neon-purple/50 px-4 py-1.5">
                    <Zap className="w-4 h-4 mr-1 inline" />
                    {SPIN_COST} CCC per spin
                  </Badge>
                </div>

                {/* Hexagonal Spin Button */}
                <div className="spin-button-container flex justify-center">
                  <div className="spin-button-glow" />
                  <button
                    onClick={spin}
                    disabled={isSpinning || !hasEnoughBalance || !isWalletConnected}
                    className="spin-button-hex"
                  >
                    {isSpinning ? 'SPINNING...' : !isWalletConnected ? 'CONNECT' : 'SPIN'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Rules & Rewards Section */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
            {/* How to Play */}
            <div className="rules-card">
              <h4 className="font-bold text-neon-pink mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                How to Play
              </h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-3">
                  <Star className="w-4 h-4 text-neon-cyan flex-shrink-0" />
                  Each spin costs {SPIN_COST} CCC
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
            <div className="rules-card">
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
