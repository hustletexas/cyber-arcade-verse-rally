import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useCyberDrop } from '@/hooks/useCyberDrop';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

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
  const { isPlaying, playsRemaining, balance, play, isLoading, nextResetTime, maxPlays } = useCyberDrop();
  

  const [animating, setAnimating] = useState(false);
  const [chipPosition, setChipPosition] = useState<{ x: number; y: number } | null>(null);
  const [chipPath, setChipPath] = useState<{ x: number; y: number }[]>([]);
  const [currentPathIndex, setCurrentPathIndex] = useState(0);
  const [landedSlot, setLandedSlot] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{ slotIndex: number; rewardAmount: number } | null>(null);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [dropX, setDropX] = useState<number | null>(null); // player-chosen drop position
  const [hovering, setHovering] = useState(false);
  const sparkleIdRef = useRef(0);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardWidth, setBoardWidth] = useState(700);
  const canPlay = isWalletConnected && playsRemaining > 0 && !isPlaying && !animating;

  // Measure container width
  useEffect(() => {
    const measure = () => {
      if (boardRef.current?.parentElement) {
        const w = boardRef.current.parentElement.clientWidth - 32; // padding
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

  // Spawn sparkles at a position
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
    for (let row = 0; row < PEG_ROWS; row++) {
      const progress = (row + 1) / PEG_ROWS;
      const targetForRow = startX + (targetX - startX) * progress;
      const jitter = (Math.random() - 0.5) * SLOT_WIDTH * 0.6;
      currentX = targetForRow + jitter;
      currentX = Math.max(SLOT_WIDTH / 2, Math.min(boardWidth - SLOT_WIDTH / 2, currentX));
      path.push({ x: currentX, y: 50 + row * PEG_SPACING_Y });
    }
    path.push({ x: targetX, y: BOARD_HEIGHT - 40 });
    return path;
  }, [boardWidth, SLOT_WIDTH, PEG_SPACING_Y, BOARD_HEIGHT]);

  // Animate chip along path
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
      // Sparkle on each peg row hit (skip first position which is the start)
      if (currentPathIndex > 0 && currentPathIndex < chipPath.length - 1) {
        spawnSparkles(pos.x, pos.y);
      }
      setCurrentPathIndex(prev => prev + 1);
    }, 110);

    return () => clearTimeout(timer);
  }, [animating, currentPathIndex, chipPath, spawnSparkles]);

  const handleBoardClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canPlay) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(SLOT_WIDTH / 2, Math.min(boardWidth - SLOT_WIDTH / 2, e.clientX - rect.left));
    setDropX(x);
    // Trigger drop from this position
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
    if (!isWalletConnected || playsRemaining <= 0 || isPlaying || animating) return;

    const result = await play();
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
      {/* Balance + plays remaining */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💎</span>
          <div>
            <p className="text-xs text-muted-foreground">Your Points</p>
            <p className="font-display text-xl text-neon-cyan">{balance.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Plays remaining indicator */}
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-muted-foreground mr-1">Drops:</p>
            {Array.from({ length: maxPlays }).map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full border transition-all ${
                  i < playsRemaining
                    ? 'bg-neon-cyan border-neon-cyan shadow-[0_0_8px_hsl(var(--neon-cyan)/0.6)]'
                    : 'bg-transparent border-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          {playsRemaining === 0 && nextResetTime && <CountdownTimer targetTime={nextResetTime} />}
        </div>
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
                className="absolute w-6 h-6 rounded-full z-10"
                style={{
                  background: 'radial-gradient(circle, hsl(var(--neon-cyan)), hsl(var(--neon-cyan) / 0.6))',
                  boxShadow: '0 0 15px hsl(var(--neon-cyan) / 0.8), 0 0 30px hsl(var(--neon-cyan) / 0.4)',
                }}
                animate={{
                  left: chipPosition.x - 12,
                  top: chipPosition.y - 12,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.11 }}
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
            : playsRemaining <= 0
            ? 'COME BACK TOMORROW'
            : `CLICK THE BOARD TO DROP (${playsRemaining}/${maxPlays})`}
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
                {playsRemaining > 0 ? 'DROP AGAIN' : 'CLOSE'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
