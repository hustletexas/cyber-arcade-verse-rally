import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useCyberDrop } from '@/hooks/useCyberDrop';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const SLOT_REWARDS = [0, 5, 10, 15, 25, 40, 60, 90, 140, 250, 500];
const SLOT_COUNT = 11;
const PEG_ROWS = 9;

// Color mapping for reward tiers
const getSlotColor = (reward: number): string => {
  if (reward === 0) return 'hsl(var(--muted))';
  if (reward <= 10) return 'hsl(var(--neon-cyan))';
  if (reward <= 25) return 'hsl(var(--neon-green))';
  if (reward <= 60) return 'hsl(var(--neon-purple))';
  if (reward <= 140) return 'hsl(var(--neon-pink))';
  return 'hsl(50, 100%, 60%)'; // gold for 250/500
};

const getSlotGlow = (reward: number): string => {
  if (reward === 0) return '';
  if (reward <= 10) return 'shadow-[0_0_12px_hsl(var(--neon-cyan)/0.5)]';
  if (reward <= 25) return 'shadow-[0_0_12px_hsl(var(--neon-green)/0.5)]';
  if (reward <= 60) return 'shadow-[0_0_15px_hsl(var(--neon-purple)/0.6)]';
  if (reward <= 140) return 'shadow-[0_0_18px_hsl(var(--neon-pink)/0.7)]';
  return 'shadow-[0_0_25px_hsl(50_100%_60%/0.8)]';
};

// Countdown timer component
const CountdownTimer = ({ targetTime }: { targetTime: Date }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const diff = targetTime.getTime() - now;
      if (diff <= 0) {
        setTimeLeft('Ready!');
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${h}h ${m}m ${s}s`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">Next free drop in</p>
      <p className="font-display text-lg text-neon-cyan tracking-wider">{timeLeft}</p>
    </div>
  );
};

export const CyberDropGame: React.FC = () => {
  const { isWalletConnected } = useMultiWallet();
  const { isPlaying, hasPlayedToday, balance, play, isLoading, nextResetTime } = useCyberDrop();

  const [animating, setAnimating] = useState(false);
  const [chipPosition, setChipPosition] = useState<{ x: number; y: number } | null>(null);
  const [chipPath, setChipPath] = useState<{ x: number; y: number }[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [landedSlot, setLandedSlot] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{ slotIndex: number; rewardAmount: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const BOARD_WIDTH = 360;
  const BOARD_HEIGHT = 420;
  const SLOT_WIDTH = BOARD_WIDTH / SLOT_COUNT;

  // Generate peg positions
  const pegs = React.useMemo(() => {
    const p: { x: number; y: number; row: number; col: number }[] = [];
    for (let row = 0; row < PEG_ROWS; row++) {
      const pegsInRow = row % 2 === 0 ? SLOT_COUNT - 1 : SLOT_COUNT;
      const offset = row % 2 === 0 ? SLOT_WIDTH / 2 : 0;
      for (let col = 0; col < pegsInRow; col++) {
        p.push({
          x: offset + col * SLOT_WIDTH + SLOT_WIDTH / 2,
          y: 40 + row * 38,
          row,
          col,
        });
      }
    }
    return p;
  }, []);

  // Generate chip animation path to target slot
  const generatePath = useCallback((targetSlot: number) => {
    const path: { x: number; y: number }[] = [];
    const startX = BOARD_WIDTH / 2;
    const targetX = targetSlot * SLOT_WIDTH + SLOT_WIDTH / 2;

    // Start position
    path.push({ x: startX, y: 0 });

    // Bounce through peg rows toward target
    let currentX = startX;
    for (let row = 0; row < PEG_ROWS; row++) {
      const progress = (row + 1) / PEG_ROWS;
      const targetForRow = startX + (targetX - startX) * progress;
      // Add some randomness but trend toward target
      const jitter = (Math.random() - 0.5) * SLOT_WIDTH * 0.6;
      currentX = targetForRow + jitter;
      // Clamp to board
      currentX = Math.max(SLOT_WIDTH / 2, Math.min(BOARD_WIDTH - SLOT_WIDTH / 2, currentX));
      path.push({ x: currentX, y: 40 + row * 38 });
    }

    // Final landing
    path.push({ x: targetX, y: BOARD_HEIGHT - 30 });
    return path;
  }, []);

  // Animate chip along path
  useEffect(() => {
    if (!animating || chipPath.length === 0) return;

    if (currentPathIndex >= chipPath.length) {
      // Animation complete
      setTimeout(() => {
        setAnimating(false);
        setShowResult(true);
      }, 300);
      return;
    }

    const timer = setTimeout(() => {
      setChipPosition(chipPath[currentPathIndex]);
      setCurrentPathIndex(prev => prev + 1);
    }, 120);

    return () => clearTimeout(timer);
  }, [animating, currentPathIndex, chipPath]);

  const handleDrop = async () => {
    if (!isWalletConnected || hasPlayedToday || isPlaying || animating) return;

    const result = await play();
    if (!result) return;

    setResultData(result);
    setLandedSlot(result.slotIndex);

    // Start animation
    const path = generatePath(result.slotIndex);
    setChipPath(path);
    setCurrentPathIndex(0);
    setChipPosition(path[0]);
    setAnimating(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-md mx-auto">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[450px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-md mx-auto">
      {/* Balance display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <div>
            <p className="text-xs text-muted-foreground">Your Points</p>
            <p className="font-display text-xl text-neon-cyan">{balance.toLocaleString()}</p>
          </div>
        </div>
        {hasPlayedToday && nextResetTime && <CountdownTimer targetTime={nextResetTime} />}
      </div>

      {/* Plinko Board */}
      <Card className="bg-black/40 backdrop-blur-md border border-neon-purple/30 overflow-hidden">
        <CardContent className="p-4">
          <div
            ref={boardRef}
            className="relative mx-auto"
            style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
          >
            {/* Pegs */}
            {pegs.map((peg, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-neon-purple/60"
                style={{
                  left: peg.x - 4,
                  top: peg.y - 4,
                  boxShadow: '0 0 6px hsl(var(--neon-purple) / 0.4)',
                }}
              />
            ))}

            {/* Chip */}
            {chipPosition && animating && (
              <motion.div
                className="absolute w-5 h-5 rounded-full z-10"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--neon-cyan)), hsl(var(--neon-cyan) / 0.6))',
                  boxShadow: '0 0 15px hsl(var(--neon-cyan) / 0.8), 0 0 30px hsl(var(--neon-cyan) / 0.4)',
                }}
                animate={{
                  left: chipPosition.x - 10,
                  top: chipPosition.y - 10,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.12 }}
              />
            )}

            {/* Bottom Slots */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              {SLOT_REWARDS.map((reward, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center py-2 border-x border-neon-purple/20 rounded-b-lg transition-all duration-300 ${
                    landedSlot === i && !animating
                      ? `${getSlotGlow(reward)} scale-110`
                      : ''
                  }`}
                  style={{
                    backgroundColor:
                      landedSlot === i && !animating
                        ? getSlotColor(reward) + '33'
                        : 'hsla(0,0%,0%,0.3)',
                  }}
                >
                  <span
                    className="font-display text-[10px] sm:text-xs font-bold"
                    style={{ color: getSlotColor(reward) }}
                  >
                    {reward}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drop Button */}
      {!isWalletConnected ? (
        <Card className="bg-black/30 backdrop-blur-sm border border-neon-pink/20">
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground text-sm">Connect your wallet to play Cyber Drop</p>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={handleDrop}
          disabled={hasPlayedToday || isPlaying || animating}
          className="w-full py-6 text-lg font-display tracking-wider bg-transparent border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {animating
            ? 'DROPPING...'
            : hasPlayedToday
            ? 'COME BACK TOMORROW'
            : 'DROP (FREE DAILY)'}
        </Button>
      )}

      {/* Result Modal */}
      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className="bg-black/90 backdrop-blur-xl border border-neon-cyan/30 max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-center text-neon-cyan">
              {resultData && resultData.rewardAmount > 0 ? '🎉 POINTS WON!' : '💫 NICE TRY!'}
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Your daily Cyber Drop result
            </DialogDescription>
          </DialogHeader>
          {resultData && (
            <div className="space-y-6 py-4">
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-block"
                >
                  <span
                    className="font-display text-6xl font-bold"
                    style={{ color: getSlotColor(resultData.rewardAmount) }}
                  >
                    +{resultData.rewardAmount}
                  </span>
                </motion.div>
                <p className="text-muted-foreground mt-2">points earned</p>
              </div>

              <div className="flex justify-between items-center px-4 py-3 bg-black/40 rounded-xl border border-neon-purple/20">
                <span className="text-sm text-muted-foreground">Updated Balance</span>
                <Badge className="bg-neon-cyan/20 text-neon-cyan font-display text-lg px-3">
                  {balance.toLocaleString()}
                </Badge>
              </div>

              <Button
                onClick={() => setShowResult(false)}
                className="w-full bg-transparent border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/10"
              >
                CLOSE
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
