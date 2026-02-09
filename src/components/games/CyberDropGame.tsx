import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useCyberDrop } from '@/hooks/useCyberDrop';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins } from 'lucide-react';

// Pyramid order: lowest on edges, highest in center
const SLOT_REWARDS = [0, 10, 25, 60, 140, 500, 250, 90, 40, 15, 5];
const SLOT_COUNT = 11;
const PEG_ROWS = 9;

const getSlotColor = (reward: number): string => {
  if (reward === 0) return 'hsl(var(--muted))';
  if (reward <= 10) return 'hsl(var(--neon-cyan))';
  if (reward <= 25) return 'hsl(var(--neon-green))';
  if (reward <= 60) return 'hsl(var(--neon-purple))';
  if (reward <= 140) return 'hsl(var(--neon-pink))';
  return 'hsl(50, 100%, 60%)';
};

const getSlotGlow = (reward: number): string => {
  if (reward === 0) return '';
  if (reward <= 10) return 'shadow-[0_0_12px_hsl(var(--neon-cyan)/0.5)]';
  if (reward <= 25) return 'shadow-[0_0_12px_hsl(var(--neon-green)/0.5)]';
  if (reward <= 60) return 'shadow-[0_0_15px_hsl(var(--neon-purple)/0.6)]';
  if (reward <= 140) return 'shadow-[0_0_18px_hsl(var(--neon-pink)/0.7)]';
  return 'shadow-[0_0_25px_hsl(50_100%_60%/0.8)]';
};

interface Sparkle {
  id: number;
  x: number;
  y: number;
  angle: number;
}

const CountdownTimer = ({ targetTime }: { targetTime: Date }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const diff = targetTime.getTime() - now;
      if (diff <= 0) { setTimeLeft('Ready!'); return; }
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
  const { isPlaying, freePlayUsed, balance, play, isLoading, nextResetTime } = useCyberDrop();

  const [animating, setAnimating] = useState(false);
  const [chipPosition, setChipPosition] = useState<{ x: number; y: number } | null>(null);
  const [chipPath, setChipPath] = useState<{ x: number; y: number }[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [landedSlot, setLandedSlot] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{ slotIndex: number; rewardAmount: number; isPaid: boolean } | null>(null);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [dropX, setDropX] = useState<number | null>(null);
  const [hovering, setHovering] = useState(false);
  const [playMode, setPlayMode] = useState<'free' | 'paid'>('free');
  const sparkleIdRef = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(700);

  const canPlayFree = isWalletConnected && !freePlayUsed && !isPlaying && !animating;
  const canPlayPaid = isWalletConnected && balance >= 1 && !isPlaying && !animating;
  const canPlay = playMode === 'free' ? canPlayFree : canPlayPaid;

  // Auto-select mode
  useEffect(() => {
    if (freePlayUsed) setPlayMode('paid');
    else setPlayMode('free');
  }, [freePlayUsed]);

  // Measure container width
  useEffect(() => {
    const measure = () => {
      if (boardRef.current?.parentElement) {
        const w = boardRef.current.parentElement.clientWidth - 32;
        setBoardWidth(Math.min(Math.max(w, 300), 900));
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const BOARD_HEIGHT = Math.round(boardWidth * 1.1);
  const SLOT_WIDTH = boardWidth / SLOT_COUNT;
  const PEG_SPACING_Y = (BOARD_HEIGHT - 80) / PEG_ROWS;

  const pegs = React.useMemo(() => {
    const p: { x: number; y: number; row: number; col: number }[] = [];
    for (let row = 0; row < PEG_ROWS; row++) {
      const pegsInRow = row % 2 === 0 ? SLOT_COUNT - 1 : SLOT_COUNT;
      const offset = row % 2 === 0 ? SLOT_WIDTH / 2 : 0;
      for (let col = 0; col < pegsInRow; col++) {
        p.push({
          x: offset + col * SLOT_WIDTH + SLOT_WIDTH / 2,
          y: 50 + row * PEG_SPACING_Y,
          row,
          col,
        });
      }
    }
    return p;
  }, [boardWidth, SLOT_WIDTH, PEG_SPACING_Y]);

  const spawnSparkles = useCallback((x: number, y: number) => {
    const count = 4 + Math.floor(Math.random() * 3);
    const newSparkles: Sparkle[] = [];
    for (let i = 0; i < count; i++) {
      newSparkles.push({
        id: sparkleIdRef.current++,
        x,
        y,
        angle: (360 / count) * i + Math.random() * 30,
      });
    }
    setSparkles(prev => [...prev, ...newSparkles]);
    setTimeout(() => {
      setSparkles(prev => prev.filter(s => !newSparkles.find(n => n.id === s.id)));
    }, 500);
  }, []);

  const generatePath = useCallback((targetSlot: number, startX: number) => {
    const path: { x: number; y: number }[] = [];
    const targetX = targetSlot * SLOT_WIDTH + SLOT_WIDTH / 2;
    path.push({ x: startX, y: 0 });
    let currentX = startX;
    const clampX = (x: number) => Math.max(SLOT_WIDTH / 2, Math.min(boardWidth - SLOT_WIDTH / 2, x));

    for (let row = 0; row < PEG_ROWS; row++) {
      const progress = (row + 1) / PEG_ROWS;
      const targetForRow = startX + (targetX - startX) * progress;
      const jitter = (Math.random() - 0.5) * SLOT_WIDTH * 0.7;
      currentX = targetForRow + jitter;
      currentX = clampX(currentX);
      const pegY = 50 + row * PEG_SPACING_Y;

      // Hit the peg
      path.push({ x: currentX, y: pegY });

      // First bounce — strong deflection off the peg
      const bounceDir = Math.random() > 0.5 ? 1 : -1;
      const bounce1X = currentX + bounceDir * (SLOT_WIDTH * 0.4 + Math.random() * SLOT_WIDTH * 0.3);
      const bounce1Y = pegY + PEG_SPACING_Y * 0.25;
      path.push({ x: clampX(bounce1X), y: bounce1Y });

      // Second bounce — smaller ricochet in opposite direction
      const bounce2X = clampX(bounce1X) - bounceDir * (SLOT_WIDTH * 0.15 + Math.random() * SLOT_WIDTH * 0.2);
      const bounce2Y = pegY + PEG_SPACING_Y * 0.5;
      path.push({ x: clampX(bounce2X), y: bounce2Y });

      // Third micro-bounce — settle toward next row
      const bounce3X = clampX(bounce2X) + (Math.random() - 0.5) * SLOT_WIDTH * 0.2;
      const bounce3Y = pegY + PEG_SPACING_Y * 0.75;
      path.push({ x: clampX(bounce3X), y: bounce3Y });

      currentX = clampX(bounce3X);
    }
    path.push({ x: targetX, y: BOARD_HEIGHT - 40 });
    return path;
  }, [boardWidth, SLOT_WIDTH, PEG_SPACING_Y, BOARD_HEIGHT]);

  useEffect(() => {
    if (!animating || chipPath.length === 0) return;

    if (currentPathIndex >= chipPath.length) {
      setTimeout(() => {
        setAnimating(false);
        setShowResult(true);
      }, 300);
      return;
    }

    const timer = setTimeout(() => {
      const pos = chipPath[currentPathIndex];
      setChipPosition(pos);
      // Sparkle only on peg hits (every 4th point after the first)
      if (currentPathIndex > 0 && currentPathIndex < chipPath.length - 1 && currentPathIndex % 4 === 1) {
        spawnSparkles(pos.x, pos.y);
      }
      setCurrentPathIndex(prev => prev + 1);
    }, 90);

    return () => clearTimeout(timer);
  }, [animating, currentPathIndex, chipPath, spawnSparkles]);

  const handleBoardClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canPlay) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(SLOT_WIDTH / 2, Math.min(boardWidth - SLOT_WIDTH / 2, e.clientX - rect.left));
    setDropX(x);
    await triggerDrop(x);
  };

  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canPlay || animating) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setDropX(Math.max(SLOT_WIDTH / 2, Math.min(boardWidth - SLOT_WIDTH / 2, x)));
    setHovering(true);
  };

  const triggerDrop = async (startX: number) => {
    if (!canPlay) return;

    const isPaid = playMode === 'paid';
    const result = await play(isPaid);
    if (!result) return;

    setResultData(result);
    setLandedSlot(result.slotIndex);

    const path = generatePath(result.slotIndex, startX);
    setChipPath(path);
    setCurrentPathIndex(0);
    setChipPosition(path[0]);
    setSparkles([]);
    setHovering(false);
    setAnimating(true);
  };

  const handleDrop = async () => {
    await triggerDrop(dropX ?? boardWidth / 2);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[500px] w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Balance + play mode */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <div>
            <p className="text-xs text-muted-foreground">Your Points</p>
            <p className="font-display text-xl text-neon-cyan">{balance.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Play mode toggle */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-black/40 border border-neon-purple/20">
            <button
              onClick={() => !freePlayUsed && setPlayMode('free')}
              disabled={freePlayUsed}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                playMode === 'free' && !freePlayUsed
                  ? 'bg-neon-green/20 text-neon-green border border-neon-green/40'
                  : freePlayUsed
                  ? 'text-muted-foreground/40 cursor-not-allowed'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Free {freePlayUsed ? '✓' : ''}
            </button>
            <button
              onClick={() => setPlayMode('paid')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                playMode === 'paid'
                  ? 'bg-accent/20 text-accent border border-accent/40'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Coins className="w-3 h-3" />
              1 CCC
            </button>
          </div>
          {freePlayUsed && nextResetTime && <CountdownTimer targetTime={nextResetTime} />}
        </div>
      </div>

      {/* Leaderboard info */}
      <div className="text-center">
        <Badge
          variant="outline"
          className={`text-xs ${
            playMode === 'paid'
              ? 'border-accent/50 text-accent'
              : 'border-muted-foreground/30 text-muted-foreground'
          }`}
        >
          {playMode === 'paid' ? '🏆 Ranked — Counts to Leaderboard' : '🎮 Free Play — No Leaderboard'}
        </Badge>
      </div>

      {/* Plinko Board */}
      <Card className="bg-black/40 backdrop-blur-md border border-neon-purple/30 overflow-hidden">
        <CardContent className="p-4">
          <div
            ref={boardRef}
            className={`relative w-full mx-auto ${canPlay ? 'cursor-crosshair' : ''}`}
            style={{ height: BOARD_HEIGHT }}
            onClick={handleBoardClick}
            onMouseMove={handleBoardMouseMove}
            onMouseLeave={() => setHovering(false)}
          >
            {/* Drop position indicator */}
            {hovering && dropX !== null && canPlay && !animating && (
              <motion.div
                className="absolute top-0 z-20 pointer-events-none"
                animate={{ left: dropX - 12 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <div className="w-6 h-6 rounded-full border-2 border-neon-cyan/80 bg-neon-cyan/20"
                  style={{ boxShadow: '0 0 12px hsl(var(--neon-cyan) / 0.6)' }}
                />
                <div className="w-0.5 h-6 bg-neon-cyan/30 mx-auto" />
              </motion.div>
            )}
            {/* Pegs */}
            {pegs.map((peg, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 rounded-full bg-neon-purple/60"
                style={{
                  left: peg.x - 5,
                  top: peg.y - 5,
                  boxShadow: '0 0 6px hsl(var(--neon-purple) / 0.4)',
                }}
              />
            ))}

            {/* Sparkle particles */}
            <AnimatePresence>
              {sparkles.map(s => {
                const rad = (s.angle * Math.PI) / 180;
                const dist = 18 + Math.random() * 12;
                return (
                  <motion.div
                    key={s.id}
                    className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                    style={{
                      left: s.x - 3,
                      top: s.y - 3,
                      background: 'hsl(var(--neon-cyan))',
                      boxShadow: '0 0 6px hsl(var(--neon-cyan) / 0.9)',
                    }}
                    initial={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      scale: 0.3,
                      x: Math.cos(rad) * dist,
                      y: Math.sin(rad) * dist,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                );
              })}
            </AnimatePresence>

            {/* Chip */}
            {chipPosition && animating && (
              <motion.div
                className="absolute w-10 h-10 rounded-full z-10"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--neon-cyan)), hsl(var(--neon-cyan) / 0.5))',
                  boxShadow: '0 0 20px hsl(var(--neon-cyan) / 0.8), 0 0 40px hsl(var(--neon-cyan) / 0.4)',
                }}
                animate={{
                  left: chipPosition.x - 20,
                  top: chipPosition.y - 20,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 12, mass: 0.6 }}
              />
            )}

            {/* Bottom Slots */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              {SLOT_REWARDS.map((reward, i) => (
                <div
                  key={i}
                  className={`flex-1 text-center py-2.5 border-x border-neon-purple/20 rounded-b-lg transition-all duration-300 ${
                    landedSlot === i && !animating ? `${getSlotGlow(reward)} scale-110` : ''
                  }`}
                  style={{
                    backgroundColor:
                      landedSlot === i && !animating
                        ? getSlotColor(reward) + '33'
                        : 'hsla(0,0%,0%,0.3)',
                  }}
                >
                  <span
                    className="font-display text-xs sm:text-sm font-bold"
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
          disabled={!canPlay}
          className="w-full py-6 text-lg font-display tracking-wider bg-transparent border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {animating
            ? 'DROPPING...'
            : !canPlay && playMode === 'paid' && balance < 1
            ? 'NOT ENOUGH CCC'
            : playMode === 'free' && !freePlayUsed
            ? 'CLICK THE BOARD TO DROP (FREE)'
            : playMode === 'paid'
            ? 'CLICK THE BOARD TO DROP (1 CCC)'
            : 'FREE PLAY USED — SWITCH TO PAID'}
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
              Your Cyber Drop result
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
                <Badge
                  variant="outline"
                  className={`mt-2 text-xs ${
                    resultData.isPaid
                      ? 'border-accent/50 text-accent'
                      : 'border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  {resultData.isPaid ? '🏆 Ranked Play' : '🎮 Free Play'}
                </Badge>
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
                DROP AGAIN
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
