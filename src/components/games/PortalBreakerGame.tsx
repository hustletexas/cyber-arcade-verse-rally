import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { toast } from 'sonner';

// ─── Constants ───────────────────────────────────────────────────────
const BASE_WIDTH = 720;
const BASE_HEIGHT = 780;
const PADDLE_HEIGHT = 14;
const BALL_RADIUS = 7;
const BRICK_ROWS = 5;
const BRICK_COLS = 11;
const BRICK_PAD = 4;
const BRICK_TOP_OFFSET = 100;
const POWER_UP_CHANCE = 0.25;
const COMBO_WINDOW = 2000;
const STAR_COUNT = 120;
const ULTIMATE_MAX = 100;

// ─── Color Themes per Level ──────────────────────────────────────────
interface ColorTheme {
  bgTop: string; bgMid: string; bgBot: string;
  brickHues: [number, number, number];
  portalHue: number;
  paddleA: string; paddleB: string;
  orbColor: string; trailColor: string;
  glowRgba: string;
  starTint: string;
}

const LEVEL_THEMES: ColorTheme[] = [
  { bgTop: '#0a0015', bgMid: '#0d0028', bgBot: '#050010', brickHues: [180, 270, 330], portalHue: 270, paddleA: '#00ffcc', paddleB: '#8b5cf6', orbColor: '#c084fc', trailColor: 'rgba(139,92,246,', glowRgba: 'rgba(139,92,246,', starTint: '#fff' },
  { bgTop: '#001a0a', bgMid: '#002815', bgBot: '#000f05', brickHues: [120, 160, 80], portalHue: 140, paddleA: '#39ff14', paddleB: '#00e676', orbColor: '#76ff03', trailColor: 'rgba(57,255,20,', glowRgba: 'rgba(0,230,118,', starTint: '#c8ffc8' },
  { bgTop: '#1a0500', bgMid: '#280d00', bgBot: '#100300', brickHues: [20, 40, 0], portalHue: 25, paddleA: '#ff6b35', paddleB: '#ff3d00', orbColor: '#ffab40', trailColor: 'rgba(255,107,53,', glowRgba: 'rgba(255,61,0,', starTint: '#ffe0cc' },
  { bgTop: '#00101a', bgMid: '#001828', bgBot: '#000810', brickHues: [200, 220, 240], portalHue: 210, paddleA: '#00b8ff', paddleB: '#0055ff', orbColor: '#64b5f6', trailColor: 'rgba(0,184,255,', glowRgba: 'rgba(0,85,255,', starTint: '#cce8ff' },
  { bgTop: '#1a001a', bgMid: '#28002e', bgBot: '#100015', brickHues: [300, 330, 280], portalHue: 310, paddleA: '#ff00ff', paddleB: '#e040fb', orbColor: '#ea80fc', trailColor: 'rgba(255,0,255,', glowRgba: 'rgba(224,64,251,', starTint: '#ffccff' },
  { bgTop: '#1a1a00', bgMid: '#282800', bgBot: '#101000', brickHues: [50, 60, 40], portalHue: 55, paddleA: '#ffd600', paddleB: '#ffab00', orbColor: '#fff176', trailColor: 'rgba(255,214,0,', glowRgba: 'rgba(255,171,0,', starTint: '#fffde0' },
  { bgTop: '#0a0a0a', bgMid: '#151515', bgBot: '#050505', brickHues: [0, 0, 0], portalHue: 0, paddleA: '#ff1744', paddleB: '#d50000', orbColor: '#ff5252', trailColor: 'rgba(255,23,68,', glowRgba: 'rgba(213,0,0,', starTint: '#ffcccc' },
];

function getTheme(level: number): ColorTheme {
  return LEVEL_THEMES[(level - 1) % LEVEL_THEMES.length];
}

// ─── Power-up & Brick Types ─────────────────────────────────────────
type PowerUpType =
  // Ball Modifiers
  | 'plasma' | 'split' | 'phase' | 'powersurge'
  // Paddle Abilities
  | 'shield' | 'magnetcatch' | 'boostslide' | 'gravityfield'
  // Legacy
  | 'widen' | 'slow' | 'laser' | 'fireball' | 'magnet' | 'nuke';

type TacticalType = 'shockwave' | 'timeslow' | 'targetlock';
type UltimateType = 'overdrive' | 'blackhole' | 'lasersweep';

// Special brick types
type BrickSpecial = 'normal' | 'explosive' | 'charge' | 'freeze' | 'combo';

const POWER_UP_META: Record<PowerUpType, { label: string; color: string; duration: number; category: string }> = {
  // Ball Modifiers
  plasma:      { label: 'PLASMA BALL',   color: '#ff4444', duration: 5000,  category: 'ball' },
  split:       { label: 'SPLIT SHOT',    color: '#f59e0b', duration: 0,     category: 'ball' },
  phase:       { label: 'PHASE BALL',    color: '#ec4899', duration: 8000,  category: 'ball' },
  powersurge:  { label: 'POWER SURGE',   color: '#00ff88', duration: 4000,  category: 'ball' },
  // Paddle Abilities
  shield:      { label: 'ENERGY SHIELD', color: '#00ddff', duration: 0,     category: 'paddle' },
  magnetcatch: { label: 'MAGNET CATCH',  color: '#ff66ff', duration: 8000,  category: 'paddle' },
  boostslide:  { label: 'BOOST SLIDE',   color: '#ffaa00', duration: 5000,  category: 'paddle' },
  gravityfield:{ label: 'GRAVITY FIELD', color: '#8888ff', duration: 3000,  category: 'paddle' },
  // Legacy
  widen:       { label: 'WIDEN GATE',    color: '#00ffcc', duration: 10000, category: 'paddle' },
  slow:        { label: 'TIME DILATION', color: '#8b5cf6', duration: 8000,  category: 'ball' },
  laser:       { label: 'LASER BEAM',    color: '#ff0000', duration: 6000,  category: 'ball' },
  fireball:    { label: 'FIREBALL',      color: '#ff6600', duration: 7000,  category: 'ball' },
  magnet:      { label: 'MAGNET PULL',   color: '#00ccff', duration: 8000,  category: 'paddle' },
  nuke:        { label: 'NUKE BLAST',    color: '#ffff00', duration: 0,     category: 'tactical' },
};

const TACTICAL_META: Record<TacticalType, { label: string; color: string; cooldown: number; icon: string }> = {
  shockwave:  { label: 'SHOCKWAVE',   color: '#ffff00', cooldown: 15000, icon: '⚡' },
  timeslow:   { label: 'TIME SLOW',   color: '#8b5cf6', cooldown: 12000, icon: '🌀' },
  targetlock: { label: 'TARGET LOCK', color: '#ff4444', cooldown: 10000, icon: '🎯' },
};

const ULTIMATE_META: Record<UltimateType, { label: string; color: string; icon: string; cost: number }> = {
  overdrive:  { label: 'GALACTIC OVERDRIVE', color: '#ffdd00', icon: '🌠', cost: 100 },
  blackhole:  { label: 'BLACK HOLE',         color: '#8800ff', icon: '🌀', cost: 100 },
  lasersweep: { label: 'LASER SWEEP',        color: '#ff0044', icon: '⚡', cost: 100 },
};

interface Ball {
  x: number; y: number; vx: number; vy: number;
  trail: { x: number; y: number }[];
  pierceLeft: number; // how many bricks to pierce through (plasma)
}

interface Brick {
  x: number; y: number; w: number; h: number;
  hp: number; maxHp: number;
  wobble: number; wobbleSpeed: number;
  alive: boolean;
  special: BrickSpecial;
  pattern: number; // 0-5 visual pattern variant
  seed: number; // random seed for circuit lines
}

interface PowerUp { type: PowerUpType; x: number; y: number; vy: number; }
interface Star { x: number; y: number; r: number; a: number; speed: number; }

interface TacticalState {
  cooldowns: Record<TacticalType, number>; // timestamp when available again
  activeTimeSlow: number; // end timestamp
  activeTargetLock: number; // end timestamp
}

interface GameState {
  status: 'idle' | 'running' | 'paused' | 'gameover' | 'levelcomplete';
  score: number;
  bestScore: number;
  lives: number;
  level: number;
  paddleX: number;
  paddleW: number;
  basePaddleW: number;
  paddleSpeedMult: number;
  balls: Ball[];
  bricks: Brick[];
  powerUps: PowerUp[];
  activePowers: Map<string, number>; // type -> end timestamp
  combo: { count: number; lastTime: number; display: string; displayEnd: number; multiplier: number };
  stars: Star[];
  portalAngle: number;
  shakeEnd: number;
  overlayText: string;
  overlayEnd: number;
  bricksDestroyed: number;
  canvasW: number;
  canvasH: number;
  // Shield
  shieldActive: boolean;
  // Magnet catch
  caughtBall: Ball | null;
  // Ultimate
  ultimateMeter: number;
  selectedUltimate: UltimateType;
  ultimateActive: { type: UltimateType; end: number; data?: any } | null;
  // Tactical
  tactical: TacticalState;
  // Score multiplier from combo bricks
  scoreMultiplier: number;
  scoreMultiplierEnd: number;
  // Combo brick timer
  lastComboBrickTime: number;
}

function createStars(w: number, h: number): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: Math.random() * 1.5 + 0.5, a: Math.random(),
    speed: Math.random() * 0.3 + 0.05,
  }));
}

// Layout patterns for variety each game
type LayoutPattern = 'full' | 'diamond' | 'checkerboard' | 'vShape' | 'pyramid' | 'fortress' | 'stripes' | 'cross';

function pickLayout(level: number): LayoutPattern {
  const layouts: LayoutPattern[] = ['full', 'diamond', 'checkerboard', 'vShape', 'pyramid', 'fortress', 'stripes', 'cross'];
  // Shuffle based on level + random so it feels different each game
  return layouts[(level + Math.floor(Math.random() * layouts.length)) % layouts.length];
}

function shouldPlace(layout: LayoutPattern, r: number, c: number, rows: number, cols: number): boolean {
  const midC = (cols - 1) / 2;
  const midR = (rows - 1) / 2;
  switch (layout) {
    case 'full': return true;
    case 'diamond': return Math.abs(c - midC) + Math.abs(r - midR) <= Math.max(midC, midR);
    case 'checkerboard': return (r + c) % 2 === 0;
    case 'vShape': return r >= Math.abs(c - midC) * (rows / midC) * 0.4;
    case 'pyramid': return c >= r && c < cols - r;
    case 'fortress': return r === 0 || r === rows - 1 || c === 0 || c === cols - 1 || (r === Math.floor(midR) && c > 2 && c < cols - 3);
    case 'stripes': return c % 3 !== 1;
    case 'cross': return Math.abs(c - midC) <= 1.5 || Math.abs(r - midR) <= 0.5;
    default: return true;
  }
}

function buildBricks(level: number, cw: number): Brick[] {
  const bricks: Brick[] = [];
  const totalPadX = 20;
  const bw = (cw - totalPadX * 2 - (BRICK_COLS - 1) * BRICK_PAD) / BRICK_COLS;
  const bh = 18;
  const layout = pickLayout(level);

  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      if (!shouldPlace(layout, r, c, BRICK_ROWS, BRICK_COLS)) continue;

      let hp = 1;
      if (level >= 2 && Math.random() < 0.3 + level * 0.05) hp = 2;
      if (level >= 4 && Math.random() < 0.1 + (level - 4) * 0.03) hp = 3;

      // Assign special brick types based on level
      let special: BrickSpecial = 'normal';
      if (level >= 2) {
        const roll = Math.random();
        if (roll < 0.08) special = 'explosive';
        else if (roll < 0.14) special = 'charge';
        else if (roll < 0.19) special = 'freeze';
        else if (roll < 0.24) special = 'combo';
      }

      bricks.push({
        x: totalPadX + c * (bw + BRICK_PAD),
        y: BRICK_TOP_OFFSET + r * (bh + BRICK_PAD),
        w: bw, h: bh, hp, maxHp: hp,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.3 + Math.random() * 0.4,
        alive: true,
        special,
        pattern: Math.floor(Math.random() * 6),
        seed: Math.random() * 1000,
      });
    }
  }
  return bricks;
}

function makeBall(cx: number, py: number): Ball {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
   const speed = 7;
   return { x: cx, y: py - BALL_RADIUS - 2, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, trail: [], pierceLeft: 0 };
}

function initState(cw: number, ch: number): GameState {
  const pw = cw * 0.22;
  const best = parseInt(localStorage.getItem('portalBreakerBest') || '0', 10);
  return {
    status: 'idle', score: 0, bestScore: best, lives: 3, level: 1,
    paddleX: cw / 2 - pw / 2, paddleW: pw, basePaddleW: pw,
    paddleSpeedMult: 1,
    balls: [makeBall(cw / 2, ch - 40)],
    bricks: buildBricks(1, cw),
    powerUps: [],
    activePowers: new Map(),
    combo: { count: 0, lastTime: 0, display: '', displayEnd: 0, multiplier: 1 },
    stars: createStars(cw, ch), portalAngle: 0, shakeEnd: 0,
    overlayText: '', overlayEnd: 0, bricksDestroyed: 0,
    canvasW: cw, canvasH: ch,
    shieldActive: false,
    caughtBall: null,
    ultimateMeter: 0,
    selectedUltimate: 'overdrive',
    ultimateActive: null,
    tactical: {
      cooldowns: { shockwave: 0, timeslow: 0, targetlock: 0 },
      activeTimeSlow: 0,
      activeTargetLock: 0,
    },
    scoreMultiplier: 1,
    scoreMultiplierEnd: 0,
    lastComboBrickTime: 0,
  };
}

// ─── Particles ───────────────────────────────────────────────────────
interface Particle { x: number; y: number; vx: number; vy: number; life: number; color: string; r: number; }
let particles: Particle[] = [];

function spawnParticles(x: number, y: number, color: string, count = 8) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, color, r: Math.random() * 2.5 + 1 });
  }
}

// ─── Leaderboard types ──────────────────────────────────────────────
interface LeaderboardEntry {
  user_id: string;
  score: number;
  level: number;
  created_at: string;
}

// ─── Helper: check if power is active ────────────────────────────────
function hasPower(s: GameState, type: string, now: number): boolean {
  const end = s.activePowers.get(type);
  return end !== undefined && now < end;
}

function activatePower(s: GameState, type: string, duration: number, now: number) {
  s.activePowers.set(type, now + duration);
}

// ─── Component ───────────────────────────────────────────────────────
const PortalBreakerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState>(initState(BASE_WIDTH, BASE_HEIGHT));
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const scoreSubmittedRef = useRef(false);
  const [uiStatus, setUiStatus] = useState<GameState['status']>('idle');
  const [uiScore, setUiScore] = useState(0);
  const [uiBest, setUiBest] = useState(0);
  const [uiLives, setUiLives] = useState(3);
  const [uiLevel, setUiLevel] = useState(1);
  const [uiPower, setUiPower] = useState('');
  const [uiCombo, setUiCombo] = useState('');
  const [uiUltimate, setUiUltimate] = useState(0);
  const [uiShield, setUiShield] = useState(false);
  const [uiTacticals, setUiTacticals] = useState<Record<TacticalType, boolean>>({ shockwave: true, timeslow: true, targetlock: true });
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);
  const scaleRef = useRef(1);

  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const walletAddress = primaryWallet?.address || '';
  const { deductBalance } = useUserBalance();

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    setLoadingLb(true);
    const { data } = await supabase
      .from('portal_breaker_scores')
      .select('user_id, score, level, created_at')
      .order('score', { ascending: false })
      .limit(20);
    setLeaderboard((data as LeaderboardEntry[]) || []);
    setLoadingLb(false);
  }, []);

  // Submit score
  const submitScore = useCallback(async (score: number, level: number) => {
    if (!walletAddress || score <= 0 || scoreSubmittedRef.current) return;
    scoreSubmittedRef.current = true;
    await supabase.from('portal_breaker_scores').insert({ user_id: walletAddress, score, level });
    fetchLeaderboard();
  }, [walletAddress, fetchLeaderboard]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  // Resize
  useEffect(() => {
    const resize = () => {
      const c = containerRef.current;
      if (!c) return;
      const maxW = c.clientWidth;
      const scale = maxW / BASE_WIDTH;
      scaleRef.current = scale;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = BASE_WIDTH;
        canvas.height = BASE_HEIGHT;
        canvas.style.width = `${BASE_WIDTH * scale}px`;
        canvas.style.height = `${BASE_HEIGHT * scale}px`;
      }
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Input
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleMove = (clientX: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = (clientX - rect.left) / scaleRef.current;
      const s = stateRef.current;
      s.paddleX = Math.max(0, Math.min(s.canvasW - s.paddleW, x - s.paddleW / 2));

      // Magnet catch: release ball on move after catch
      if (s.caughtBall) {
        s.caughtBall.x = s.paddleX + s.paddleW / 2;
      }
    };
    const onClick = () => {
      const s = stateRef.current;
      // Tap to start on mobile
      if (s.status === 'idle' || s.status === 'gameover') {
        Object.assign(s, initState(BASE_WIDTH, BASE_HEIGHT));
        s.activePowers = new Map();
        s.status = 'running';
        scoreSubmittedRef.current = false;
        return;
      }
      if (s.caughtBall) {
        // Release caught ball
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.4;
        const sp = 7;
        s.caughtBall.vx = Math.cos(angle) * sp;
        s.caughtBall.vy = Math.sin(angle) * sp;
        s.caughtBall = null;
      }
    };
    const onMouse = (e: MouseEvent) => handleMove(e.clientX);
    const onTouch = (e: TouchEvent) => { e.preventDefault(); handleMove(e.touches[0].clientX); };
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('touchmove', onTouch, { passive: false });
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    canvas.addEventListener('touchend', onClick);
    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchstart', onTouch);
      canvas.removeEventListener('touchend', onClick);
    };
  }, []);

  // Keyboard for tacticals & ultimate
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = stateRef.current;
      const now = performance.now();
      if (s.status !== 'running') return;

      if (e.key === '1') useTactical(s, 'shockwave', now);
      if (e.key === '2') useTactical(s, 'timeslow', now);
      if (e.key === '3') useTactical(s, 'targetlock', now);
      if (e.key === ' ' || e.key === 'q' || e.key === 'Q') {
        e.preventDefault();
        useUltimate(s, now);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // ─── Tactical abilities ───────────────────────────────────────────
  const useTactical = (s: GameState, type: TacticalType, now: number) => {
    if (now < s.tactical.cooldowns[type]) return;
    const meta = TACTICAL_META[type];
    s.tactical.cooldowns[type] = now + meta.cooldown;

    if (type === 'shockwave') {
      // Destroy lowest row of alive bricks
      let maxY = 0;
      for (const b of s.bricks) if (b.alive && b.y > maxY) maxY = b.y;
      let destroyed = 0;
      for (const b of s.bricks) {
        if (b.alive && b.y >= maxY - 2) {
          b.alive = false; b.hp = 0;
          s.bricksDestroyed++;
          destroyed++;
          spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#ffff00', 8);
        }
      }
      s.score += destroyed * 15;
      s.shakeEnd = now + 300;
      s.overlayText = `⚡ SHOCKWAVE ×${destroyed}`;
      s.overlayEnd = now + 1000;
    } else if (type === 'timeslow') {
      s.tactical.activeTimeSlow = now + 3000;
      s.overlayText = '🌀 TIME SLOW';
      s.overlayEnd = now + 800;
    } else if (type === 'targetlock') {
      s.tactical.activeTargetLock = now + 5000;
      s.overlayText = '🎯 TARGET LOCK';
      s.overlayEnd = now + 800;
    }
  };

  // ─── Ultimate abilities ───────────────────────────────────────────
  const useUltimate = (s: GameState, now: number) => {
    if (s.ultimateMeter < ULTIMATE_MAX || s.ultimateActive) return;
    s.ultimateMeter = 0;
    const type = s.selectedUltimate;

    if (type === 'overdrive') {
      // Clear 40% of bricks
      const alive = s.bricks.filter(b => b.alive);
      const toDestroy = Math.ceil(alive.length * 0.4);
      const shuffled = alive.sort(() => Math.random() - 0.5).slice(0, toDestroy);
      for (const b of shuffled) {
        b.alive = false; b.hp = 0;
        s.bricksDestroyed++;
        spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#ffdd00', 12);
      }
      s.score += toDestroy * 20;
      s.shakeEnd = now + 500;
      s.overlayText = '🌠 GALACTIC OVERDRIVE';
      s.overlayEnd = now + 1500;
    } else if (type === 'blackhole') {
      // Black hole effect - pull bricks inward then explode
      s.ultimateActive = { type: 'blackhole', end: now + 2000, data: { cx: s.canvasW / 2, cy: s.canvasH / 2 - 50 } };
      s.overlayText = '🌀 BLACK HOLE COLLAPSE';
      s.overlayEnd = now + 1500;
    } else if (type === 'lasersweep') {
      // Horizontal beam sweep
      s.ultimateActive = { type: 'lasersweep', end: now + 1500, data: { y: BRICK_TOP_OFFSET } };
      s.overlayText = '⚡ LASER SWEEP';
      s.overlayEnd = now + 1200;
    }
  };

  const ballSpeed = useCallback((level: number, destroyed: number) => {
     const sp = 7 + (level - 1) * 0.35 + Math.floor(destroyed / 10) * 0.15;
     return Math.min(sp, 12);
  }, []);

  // ─── Power-up drop table ──────────────────────────────────────────
  const getRandomPowerUp = (): PowerUpType => {
    const types: PowerUpType[] = [
      'plasma', 'split', 'phase', 'powersurge',
      'shield', 'magnetcatch', 'boostslide', 'gravityfield',
      'widen', 'slow', 'laser', 'fireball', 'magnet', 'nuke',
    ];
    return types[Math.floor(Math.random() * types.length)];
  };

  // ─── Handle special brick destruction ─────────────────────────────
  const handleSpecialBrick = (s: GameState, brick: Brick, now: number, theme: ColorTheme) => {
    if (brick.special === 'explosive') {
      // Destroy surrounding bricks
      for (const other of s.bricks) {
        if (!other.alive || other === brick) continue;
        const dx = (other.x + other.w / 2) - (brick.x + brick.w / 2);
        const dy = (other.y + other.h / 2) - (brick.y + brick.h / 2);
        if (Math.abs(dx) < brick.w * 1.6 && Math.abs(dy) < brick.h * 1.6) {
          other.hp--;
          if (other.hp <= 0) {
            other.alive = false;
            s.bricksDestroyed++;
            s.score += 15;
            spawnParticles(other.x + other.w / 2, other.y + other.h / 2, '#ff6600', 8);
            if (other.special !== 'normal') handleSpecialBrick(s, other, now, theme);
          }
        }
      }
      s.shakeEnd = now + 200;
      spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#ff4400', 16);
    } else if (brick.special === 'charge') {
      s.ultimateMeter = Math.min(ULTIMATE_MAX, s.ultimateMeter + 20);
      spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#00ffcc', 10);
    } else if (brick.special === 'freeze') {
      // Apply slow to all balls for 3s
      activatePower(s, 'freeze_brick', 3000, now);
    } else if (brick.special === 'combo') {
      if (now - s.lastComboBrickTime < 2000) {
        s.scoreMultiplier = Math.min(s.scoreMultiplier + 0.5, 4);
        s.scoreMultiplierEnd = now + 5000;
      }
      s.lastComboBrickTime = now;
    }
  };

  // ─── Game loop ─────────────────────────────────────────────────────
  const update = useCallback((dt: number) => {
    const s = stateRef.current;
    const now = performance.now();
    s.portalAngle += dt * 0.8;

    s.stars.forEach(st => { st.a = 0.4 + Math.sin(now * 0.001 * st.speed + st.x) * 0.6; });
    particles = particles.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 1.5; return p.life > 0; });

    // Clean expired powers
    for (const [key, end] of s.activePowers) {
      if (now > end) {
        if (key === 'widen' || key === 'gravityfield') s.paddleW = s.basePaddleW;
        if (key === 'boostslide') s.paddleSpeedMult = 1;
        s.activePowers.delete(key);
      }
    }

    // Score multiplier expiry
    if (now > s.scoreMultiplierEnd) s.scoreMultiplier = 1;

    if (s.status !== 'running') return;

    const paddleY = s.canvasH - 36;
    const sp = ballSpeed(s.level, s.bricksDestroyed);
    const theme = getTheme(s.level);

    // Ultimate updates
    if (s.ultimateActive) {
      if (now > s.ultimateActive.end) {
        if (s.ultimateActive.type === 'blackhole') {
          // Explode all bricks
          for (const b of s.bricks) {
            if (b.alive) {
              b.alive = false; b.hp = 0;
              s.bricksDestroyed++;
              s.score += 10;
              spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#aa00ff', 6);
            }
          }
          s.shakeEnd = now + 500;
        }
        s.ultimateActive = null;
      } else if (s.ultimateActive.type === 'lasersweep') {
        // Sweep beam downward
        const progress = 1 - (s.ultimateActive.end - now) / 1500;
        const beamY = BRICK_TOP_OFFSET + progress * (BRICK_ROWS * 22 + 20);
        s.ultimateActive.data.y = beamY;
        for (const b of s.bricks) {
          if (b.alive && Math.abs(b.y + b.h / 2 - beamY) < 12) {
            b.alive = false; b.hp = 0;
            s.bricksDestroyed++;
            s.score += 15;
            spawnParticles(b.x + b.w / 2, b.y + b.h / 2, '#ff0044', 6);
          }
        }
      } else if (s.ultimateActive.type === 'blackhole') {
        // Pull bricks toward center
        const cx = s.ultimateActive.data.cx;
        const cy = s.ultimateActive.data.cy;
        for (const b of s.bricks) {
          if (!b.alive) continue;
          const bx = b.x + b.w / 2;
          const by = b.y + b.h / 2;
          const dx = cx - bx;
          const dy = cy - by;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          b.x += (dx / dist) * 2 * dt * 60;
          b.y += (dy / dist) * 2 * dt * 60;
        }
      }
    }

    // Time slow (tactical or power-up)
    const isTimeSlow = now < s.tactical.activeTimeSlow || hasPower(s, 'slow', now) || hasPower(s, 'freeze_brick', now);
    const speedMult = isTimeSlow ? 0.55 : (hasPower(s, 'powersurge', now) ? 1.2 : 1);

    const deadBalls: number[] = [];
    s.balls.forEach((ball, bi) => {
      // Skip caught balls
      if (s.caughtBall === ball) return;

      ball.x += ball.vx * dt * 60 * speedMult;
      ball.y += ball.vy * dt * 60 * speedMult;

      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 12) ball.trail.shift();

      if (ball.x - BALL_RADIUS < 0) { ball.x = BALL_RADIUS; ball.vx = Math.abs(ball.vx); }
      if (ball.x + BALL_RADIUS > s.canvasW) { ball.x = s.canvasW - BALL_RADIUS; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - BALL_RADIUS < 0) { ball.y = BALL_RADIUS; ball.vy = Math.abs(ball.vy); }

      // Paddle collision
      if (ball.vy > 0 && ball.y + BALL_RADIUS >= paddleY && ball.y + BALL_RADIUS <= paddleY + PADDLE_HEIGHT + 4
          && ball.x >= s.paddleX && ball.x <= s.paddleX + s.paddleW) {
        // Magnet catch
        if (hasPower(s, 'magnetcatch', now) && !s.caughtBall) {
          ball.vx = 0;
          ball.vy = 0;
          ball.y = paddleY - BALL_RADIUS;
          s.caughtBall = ball;
          return;
        }

        const hitPos = (ball.x - s.paddleX) / s.paddleW;
        const angle = -Math.PI * (0.15 + hitPos * 0.7);
        const mag = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        ball.vx = Math.cos(angle) * mag;
        ball.vy = Math.sin(angle) * mag;
        ball.y = paddleY - BALL_RADIUS;
      }

      // Brick collision
      const isPhase = hasPower(s, 'phase', now) || hasPower(s, 'fireball', now);
      const isPlasma = hasPower(s, 'plasma', now);

      for (const brick of s.bricks) {
        if (!brick.alive) continue;
        const bx = brick.x + Math.sin(brick.wobble) * 2;
        if (ball.x + BALL_RADIUS > bx && ball.x - BALL_RADIUS < bx + brick.w
            && ball.y + BALL_RADIUS > brick.y && ball.y - BALL_RADIUS < brick.y + brick.h) {
          brick.hp--;
          if (brick.hp <= 0) {
            brick.alive = false;
            s.bricksDestroyed++;
            const basePts = brick.maxHp === 1 ? 10 : brick.maxHp === 2 ? 25 : 40;
            const pts = Math.round(basePts * s.scoreMultiplier);
            if (now - s.combo.lastTime < COMBO_WINDOW) {
              s.combo.count++;
              s.score += pts + s.combo.count * 5;
              s.combo.display = `PORTAL COMBO x${s.combo.count}`;
              s.combo.displayEnd = now + 1200;
              if (s.combo.count >= 5) s.shakeEnd = now + 200;
            } else {
              s.combo.count = 1;
              s.score += pts;
            }
            s.combo.lastTime = now;

            // Ultimate meter from normal play
            s.ultimateMeter = Math.min(ULTIMATE_MAX, s.ultimateMeter + 3);

            const brickHue = theme.brickHues[brick.maxHp - 1] ?? theme.brickHues[0];
            spawnParticles(bx + brick.w / 2, brick.y + brick.h / 2, `hsl(${brickHue}, 100%, 65%)`, 10);

            // Handle special brick effects
            if (brick.special !== 'normal') handleSpecialBrick(s, brick, now, theme);

            // Drop power-up
            if (Math.random() < POWER_UP_CHANCE) {
              s.powerUps.push({ type: getRandomPowerUp(), x: bx + brick.w / 2, y: brick.y + brick.h, vy: 2 });
            }
          }

          // Piercing logic
          if (isPlasma && ball.pierceLeft > 0) {
            ball.pierceLeft--;
            // Don't bounce, continue through
          } else if (!isPhase) {
            const overlapLeft = ball.x + BALL_RADIUS - bx;
            const overlapRight = bx + brick.w - (ball.x - BALL_RADIUS);
            const overlapTop = ball.y + BALL_RADIUS - brick.y;
            const overlapBottom = brick.y + brick.h - (ball.y - BALL_RADIUS);
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            if (minOverlap === overlapLeft || minOverlap === overlapRight) ball.vx = -ball.vx;
            else ball.vy = -ball.vy;
          }
          if (!isPlasma || ball.pierceLeft <= 0) break;
        }
      }

      // Normalize speed
      const curMag = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (curMag > 0) { ball.vx = (ball.vx / curMag) * sp; ball.vy = (ball.vy / curMag) * sp; }

      if (ball.y > s.canvasH + 20) {
        // Shield check
        if (s.shieldActive) {
          s.shieldActive = false;
          ball.y = paddleY - BALL_RADIUS;
          ball.vy = -Math.abs(ball.vy);
          spawnParticles(ball.x, s.canvasH - 10, '#00ddff', 12);
          s.overlayText = '🛡 SHIELD ABSORBED';
          s.overlayEnd = now + 800;
        } else {
          deadBalls.push(bi);
        }
      }
    });

    for (let i = deadBalls.length - 1; i >= 0; i--) s.balls.splice(deadBalls[i], 1);
    if (s.balls.length === 0) {
      s.lives--;
      if (s.lives <= 0) {
        s.status = 'gameover';
        if (s.score > s.bestScore) { s.bestScore = s.score; localStorage.setItem('portalBreakerBest', String(s.score)); }
        submitScore(s.score, s.level);
      } else {
        s.balls = [makeBall(s.canvasW / 2, s.canvasH - 40)];
        s.paddleX = s.canvasW / 2 - s.paddleW / 2;
        s.caughtBall = null;
      }
    }

    // Power-up collection
    s.powerUps = s.powerUps.filter(pu => {
      pu.y += pu.vy * dt * 60;
      if (pu.y > s.canvasH + 20) return false;
      if (pu.y + 10 >= paddleY && pu.x >= s.paddleX && pu.x <= s.paddleX + s.paddleW) {
        const meta = POWER_UP_META[pu.type];

        if (pu.type === 'split') {
          const ref = s.balls[0];
          if (ref) {
            s.balls.push(makeBall(ref.x, ref.y));
            s.balls.push(makeBall(ref.x, ref.y));
          }
        } else if (pu.type === 'shield') {
          s.shieldActive = true;
        } else if (pu.type === 'nuke') {
          let nuked = 0;
          for (const brick of s.bricks) {
            if (brick.alive && brick.y > s.canvasH * 0.3) {
              brick.alive = false; brick.hp = 0;
              s.bricksDestroyed++;
              nuked++;
              spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#ffff00', 6);
            }
          }
          s.score += nuked * 15;
          s.shakeEnd = now + 400;
          s.overlayText = `NUKE! ×${nuked}`;
          s.overlayEnd = now + 1000;
        } else if (pu.type === 'laser') {
          const pcx = s.paddleX + s.paddleW / 2;
          for (const brick of s.bricks) {
            if (brick.alive && pcx >= brick.x && pcx <= brick.x + brick.w) {
              brick.alive = false; brick.hp = 0;
              s.bricksDestroyed++;
              s.score += 15;
              spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, '#ff0000', 8);
            }
          }
          activatePower(s, 'laser', meta.duration, now);
        } else if (pu.type === 'widen') {
          s.paddleW = s.basePaddleW * 1.5;
          activatePower(s, 'widen', meta.duration, now);
        } else if (pu.type === 'gravityfield') {
          s.paddleW = s.basePaddleW * 1.4;
          activatePower(s, 'gravityfield', meta.duration, now);
        } else if (pu.type === 'boostslide') {
          s.paddleSpeedMult = 1.6;
          activatePower(s, 'boostslide', meta.duration, now);
        } else if (pu.type === 'plasma') {
          activatePower(s, 'plasma', meta.duration, now);
          // Give all balls pierce
          for (const b of s.balls) b.pierceLeft = 2;
        } else if (pu.type === 'powersurge') {
          activatePower(s, 'powersurge', meta.duration, now);
        } else if (pu.type === 'magnetcatch') {
          activatePower(s, 'magnetcatch', meta.duration, now);
        } else if (meta.duration > 0) {
          activatePower(s, pu.type, meta.duration, now);
        }
        return false;
      }
      return true;
    });

    s.bricks.forEach(b => { if (b.alive) b.wobble += b.wobbleSpeed * dt; });

    // Level complete
    if (s.bricks.every(b => !b.alive)) {
      s.status = 'levelcomplete';
      s.overlayText = 'PORTAL STABILIZED';
      s.overlayEnd = now + 1500;
      if (s.score > s.bestScore) { s.bestScore = s.score; localStorage.setItem('portalBreakerBest', String(s.score)); }
      setTimeout(() => {
        const ns = stateRef.current;
        if (ns.status !== 'levelcomplete') return;
        ns.level++;
        ns.bricks = buildBricks(ns.level, ns.canvasW);
        ns.balls = [makeBall(ns.canvasW / 2, ns.canvasH - 40)];
        ns.paddleX = ns.canvasW / 2 - ns.paddleW / 2;
        ns.powerUps = [];
        ns.bricksDestroyed = 0;
        ns.caughtBall = null;
        ns.status = 'running';
        ns.overlayText = '';
      }, 1600);
    }
  }, [ballSpeed, submitScore]);

  // ─── Render ────────────────────────────────────────────────────────
  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    const cw = s.canvasW;
    const ch = s.canvasH;
    const now = performance.now();
    const theme = getTheme(s.level);

    if (now < s.shakeEnd) {
      ctx.save();
      ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    }

    // BG gradient
    const bg = ctx.createLinearGradient(0, 0, 0, ch);
    bg.addColorStop(0, theme.bgTop);
    bg.addColorStop(0.5, theme.bgMid);
    bg.addColorStop(1, theme.bgBot);
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // Stars
    s.stars.forEach(st => {
      ctx.globalAlpha = st.a;
      ctx.fillStyle = theme.starTint;
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Portal ring
    const portalCx = cw / 2;
    const portalCy = BRICK_TOP_OFFSET + (BRICK_ROWS * 22) / 2;
    const portalR = Math.min(cw * 0.35, 150);
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(portalCx, portalCy);
      ctx.rotate(s.portalAngle + i * (Math.PI * 2 / 3));
      ctx.strokeStyle = `hsla(${theme.portalHue + i * 40}, 100%, 65%, ${0.15 + Math.sin(now * 0.002 + i) * 0.1})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, portalR + i * 6, 0, Math.PI * 1.2);
      ctx.stroke();
      ctx.restore();
    }
    const portalGlow = ctx.createRadialGradient(portalCx, portalCy, 0, portalCx, portalCy, portalR);
    portalGlow.addColorStop(0, theme.glowRgba + '0.08)');
    portalGlow.addColorStop(1, theme.glowRgba + '0)');
    ctx.fillStyle = portalGlow;
    ctx.fillRect(0, 0, cw, ch);

    // Black hole effect
    if (s.ultimateActive?.type === 'blackhole') {
      const cx = s.ultimateActive.data.cx;
      const cy = s.ultimateActive.data.cy;
      const bhGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 120);
      bhGlow.addColorStop(0, 'rgba(100,0,200,0.4)');
      bhGlow.addColorStop(0.5, 'rgba(50,0,150,0.2)');
      bhGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bhGlow;
      ctx.fillRect(0, 0, cw, ch);
      ctx.strokeStyle = 'rgba(180,0,255,0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, 30 + Math.sin(now * 0.01) * 10, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Laser sweep effect
    if (s.ultimateActive?.type === 'lasersweep') {
      const beamY = s.ultimateActive.data.y;
      ctx.fillStyle = 'rgba(255,0,68,0.3)';
      ctx.fillRect(0, beamY - 8, cw, 16);
      ctx.fillStyle = 'rgba(255,100,150,0.8)';
      ctx.fillRect(0, beamY - 2, cw, 4);
      ctx.shadowColor = '#ff0044';
      ctx.shadowBlur = 20;
      ctx.fillRect(0, beamY - 1, cw, 2);
      ctx.shadowBlur = 0;
    }

    // Bricks
    s.bricks.forEach(b => {
      if (!b.alive) return;
      const bx = b.x + Math.sin(b.wobble) * 2;
      const hpRatio = b.hp / b.maxHp;
      let hue = theme.brickHues[(b.maxHp - 1) % 3];
      let lightness = 40 + hpRatio * 25;
      let borderExtra = '';

      // Special brick visuals
      if (b.special === 'explosive') { hue = 20; lightness = 55; borderExtra = '#ff4400'; }
      else if (b.special === 'charge') { hue = 160; lightness = 60; borderExtra = '#00ffcc'; }
      else if (b.special === 'freeze') { hue = 200; lightness = 70; borderExtra = '#88ddff'; }
      else if (b.special === 'combo') { hue = 50; lightness = 60; borderExtra = '#ffdd00'; }

      const isTargeted = now < s.tactical.activeTargetLock && b.hp === 1;

      // ── Cybernetic brick body ──
      // Dark base fill
      const baseGrad = ctx.createLinearGradient(bx, b.y, bx, b.y + b.h);
      baseGrad.addColorStop(0, `hsl(${hue}, 60%, ${lightness * 0.35}%)`);
      baseGrad.addColorStop(0.5, `hsl(${hue}, 70%, ${lightness * 0.5}%)`);
      baseGrad.addColorStop(1, `hsl(${hue}, 60%, ${lightness * 0.3}%)`);

      ctx.fillStyle = baseGrad;
      ctx.strokeStyle = borderExtra || `hsla(${hue}, 100%, 65%, ${0.6 + hpRatio * 0.4})`;
      ctx.lineWidth = isTargeted ? 2.5 : 1.5;
      ctx.beginPath();
      const cr = 3;
      ctx.moveTo(bx + cr, b.y);
      ctx.lineTo(bx + b.w - cr, b.y); ctx.quadraticCurveTo(bx + b.w, b.y, bx + b.w, b.y + cr);
      ctx.lineTo(bx + b.w, b.y + b.h - cr); ctx.quadraticCurveTo(bx + b.w, b.y + b.h, bx + b.w - cr, b.y + b.h);
      ctx.lineTo(bx + cr, b.y + b.h); ctx.quadraticCurveTo(bx, b.y + b.h, bx, b.y + b.h - cr);
      ctx.lineTo(bx, b.y + cr); ctx.quadraticCurveTo(bx, b.y, bx + cr, b.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // ── Inner circuit pattern based on b.pattern ──
      ctx.save();
      ctx.beginPath();
      ctx.rect(bx + 1, b.y + 1, b.w - 2, b.h - 2);
      ctx.clip();

      ctx.strokeStyle = `hsla(${hue}, 100%, 75%, ${0.25 + hpRatio * 0.2})`;
      ctx.lineWidth = 0.7;
      const s2 = b.seed;

      if (b.pattern === 0) {
        // Horizontal circuit lines with nodes
        const cy1 = b.y + b.h * 0.35;
        const cy2 = b.y + b.h * 0.7;
        ctx.beginPath(); ctx.moveTo(bx + 3, cy1); ctx.lineTo(bx + b.w * 0.4, cy1);
        ctx.lineTo(bx + b.w * 0.45, cy2); ctx.lineTo(bx + b.w - 3, cy2); ctx.stroke();
        // Nodes
        ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.6)`;
        ctx.beginPath(); ctx.arc(bx + b.w * 0.4, cy1, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(bx + b.w * 0.75, cy2, 1.5, 0, Math.PI * 2); ctx.fill();
      } else if (b.pattern === 1) {
        // Grid chip pattern
        for (let i = 0; i < 3; i++) {
          const px = bx + 4 + i * (b.w - 8) / 2.5;
          ctx.strokeRect(px, b.y + 4, 6, b.h - 8);
        }
        ctx.beginPath(); ctx.moveTo(bx + 3, b.y + b.h / 2); ctx.lineTo(bx + b.w - 3, b.y + b.h / 2); ctx.stroke();
      } else if (b.pattern === 2) {
        // Diagonal traces
        ctx.beginPath(); ctx.moveTo(bx + 2, b.y + 2); ctx.lineTo(bx + b.w - 2, b.y + b.h - 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx + b.w * 0.3, b.y + 2); ctx.lineTo(bx + b.w - 2, b.y + b.h * 0.5); ctx.stroke();
        ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.5)`;
        ctx.beginPath(); ctx.arc(bx + b.w / 2, b.y + b.h / 2, 2, 0, Math.PI * 2); ctx.fill();
      } else if (b.pattern === 3) {
        // Center chip with pins
        const chipW = b.w * 0.3; const chipH = b.h * 0.5;
        const chipX = bx + (b.w - chipW) / 2; const chipY = b.y + (b.h - chipH) / 2;
        ctx.strokeRect(chipX, chipY, chipW, chipH);
        for (let i = 0; i < 3; i++) {
          const py = chipY + chipH * (i + 0.5) / 3;
          ctx.beginPath(); ctx.moveTo(bx + 2, py); ctx.lineTo(chipX, py); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(chipX + chipW, py); ctx.lineTo(bx + b.w - 2, py); ctx.stroke();
        }
      } else if (b.pattern === 4) {
        // Hexagonal nodes
        const cx1 = bx + b.w * 0.25; const cx2 = bx + b.w * 0.75;
        const cy = b.y + b.h / 2;
        ctx.beginPath(); ctx.moveTo(cx1, cy); ctx.lineTo(cx2, cy); ctx.stroke();
        for (const cx of [cx1, cx2]) {
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const ax = cx + Math.cos(a * Math.PI / 3) * 4;
            const ay = cy + Math.sin(a * Math.PI / 3) * 4;
            a === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay);
          }
          ctx.closePath(); ctx.stroke();
        }
      } else {
        // Data stream dots
        for (let i = 0; i < 5; i++) {
          const dx = bx + 4 + (i / 4) * (b.w - 8);
          const dy = b.y + b.h * (0.3 + Math.sin(s2 + i * 1.7) * 0.2);
          ctx.fillStyle = `hsla(${hue}, 100%, 80%, ${0.3 + (i % 2) * 0.3})`;
          ctx.beginPath(); ctx.arc(dx, dy, 1.2, 0, Math.PI * 2); ctx.fill();
        }
        ctx.beginPath(); ctx.moveTo(bx + 4, b.y + b.h * 0.5);
        ctx.lineTo(bx + b.w - 4, b.y + b.h * 0.5); ctx.stroke();
      }
      ctx.restore();

      // ── Glowing edge highlight (top) ──
      ctx.fillStyle = `hsla(${hue}, 100%, 85%, ${0.15 + hpRatio * 0.15})`;
      ctx.fillRect(bx + 3, b.y + 1, b.w - 6, 2);

      // ── Pulse glow for high-HP bricks ──
      if (b.maxHp >= 2) {
        const pulse = 0.12 + Math.sin(now * 0.004 + b.seed) * 0.08;
        ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
        ctx.shadowBlur = 8 * pulse * 10;
        ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${pulse})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, b.y, b.w, b.h);
        ctx.shadowBlur = 0;
      }

      if (isTargeted) {
        ctx.strokeStyle = 'rgba(255,68,68,0.8)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(bx - 2, b.y - 2, b.w + 4, b.h + 4);
        ctx.setLineDash([]);
      }

      // Special brick icons
      if (b.special !== 'normal') {
        ctx.fillStyle = '#fff';
        ctx.font = '9px monospace';
        ctx.textAlign = 'center';
        const icon = b.special === 'explosive' ? '💣' : b.special === 'charge' ? '🔋' : b.special === 'freeze' ? '🧊' : '🔥';
        ctx.fillText(icon, bx + b.w / 2, b.y + b.h / 2 + 3);
      }
    });

    // Power-ups
    s.powerUps.forEach(pu => {
      const meta = POWER_UP_META[pu.type];
      ctx.fillStyle = meta.color;
      ctx.shadowColor = meta.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = '7px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(meta.label.charAt(0), pu.x, pu.y + 2.5);
    });

    // Shield indicator at bottom
    if (s.shieldActive) {
      ctx.strokeStyle = 'rgba(0,221,255,0.5)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ddff';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(0, ch - 4);
      ctx.lineTo(cw, ch - 4);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Paddle
    const paddleY = ch - 36;
    const padGrad = ctx.createLinearGradient(s.paddleX, paddleY, s.paddleX + s.paddleW, paddleY);
    padGrad.addColorStop(0, theme.paddleA);
    padGrad.addColorStop(0.5, theme.paddleB);
    padGrad.addColorStop(1, theme.paddleA);
    ctx.fillStyle = padGrad;
    ctx.shadowColor = theme.paddleA;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(s.paddleX, paddleY, s.paddleW, PADDLE_HEIGHT, 7);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Boost slide visual
    if (hasPower(s, 'boostslide', now)) {
      ctx.strokeStyle = 'rgba(255,170,0,0.6)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.roundRect(s.paddleX - 2, paddleY - 2, s.paddleW + 4, PADDLE_HEIGHT + 4, 9);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.globalAlpha = 0.25;
    ctx.strokeStyle = theme.paddleA;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(s.paddleX - 3, paddleY - 3, s.paddleW + 6, PADDLE_HEIGHT + 6, 10);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Balls
    s.balls.forEach(ball => {
      const isFireball = hasPower(s, 'fireball', now);
      const isPlasmaActive = hasPower(s, 'plasma', now);
      const isPowerSurge = hasPower(s, 'powersurge', now);
      const isPhase = hasPower(s, 'phase', now);
      const isElectric = hasPower(s, 'laser', now);
      const isSlow = hasPower(s, 'slow', now);

      // Determine ball style
      let ballColor = theme.orbColor;
      let trailBase = theme.trailColor;
      let glowColor = theme.orbColor;
      let innerColor = '#fff';
      let glowSize = BALL_RADIUS * 2;
      let trailWidth = 0.8;

      if (isFireball) {
        ballColor = '#ff6600'; trailBase = 'rgba(255,100,0,'; glowColor = '#ff4400'; innerColor = '#ffdd44'; glowSize = BALL_RADIUS * 3.5; trailWidth = 1.2;
      } else if (isPlasmaActive) {
        ballColor = '#ff2244'; trailBase = 'rgba(255,34,68,'; glowColor = '#ff0033'; innerColor = '#ffaacc'; glowSize = BALL_RADIUS * 3; trailWidth = 1.0;
      } else if (isElectric) {
        ballColor = '#44aaff'; trailBase = 'rgba(68,170,255,'; glowColor = '#2288ff'; innerColor = '#ccefff'; glowSize = BALL_RADIUS * 3; trailWidth = 1.1;
      } else if (isPowerSurge) {
        ballColor = '#00ff88'; trailBase = 'rgba(0,255,136,'; glowColor = '#00dd66'; innerColor = '#aaffdd'; glowSize = BALL_RADIUS * 2.5; trailWidth = 1.0;
      } else if (isPhase) {
        ballColor = '#ec4899'; trailBase = 'rgba(236,72,153,'; glowColor = '#d946ef'; innerColor = '#ffd6f0'; glowSize = BALL_RADIUS * 2.5; trailWidth = 0.6;
      } else if (isSlow) {
        ballColor = '#a78bfa'; trailBase = 'rgba(167,139,250,'; glowColor = '#8b5cf6'; innerColor = '#e0d4ff'; glowSize = BALL_RADIUS * 2.2; trailWidth = 0.7;
      }

      // Trail
      ball.trail.forEach((t, i) => {
        const alpha = (i / ball.trail.length) * (isFireball ? 0.55 : 0.35);
        ctx.fillStyle = trailBase + `${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, BALL_RADIUS * (i / ball.trail.length) * trailWidth, 0, Math.PI * 2);
        ctx.fill();
      });

      // Fireball: flickering flame particles
      if (isFireball) {
        for (let i = 0; i < 4; i++) {
          const flicker = Math.sin(now * 0.02 + i * 1.5) * 4;
          const fx = ball.x + (Math.random() - 0.5) * 10;
          const fy = ball.y + (Math.random() - 0.5) * 10 + flicker;
          const fr = Math.random() * 3 + 1;
          ctx.globalAlpha = 0.5 + Math.random() * 0.3;
          ctx.fillStyle = i % 2 === 0 ? '#ff8800' : '#ffcc00';
          ctx.beginPath(); ctx.arc(fx, fy, fr, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Electric: lightning arcs
      if (isElectric) {
        ctx.strokeStyle = 'rgba(100,200,255,0.7)';
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.moveTo(ball.x, ball.y);
          const ex = ball.x + (Math.random() - 0.5) * 24;
          const ey = ball.y + (Math.random() - 0.5) * 24;
          const mx = (ball.x + ex) / 2 + (Math.random() - 0.5) * 12;
          const my = (ball.y + ey) / 2 + (Math.random() - 0.5) * 12;
          ctx.quadraticCurveTo(mx, my, ex, ey);
          ctx.stroke();
        }
      }

      // Phase: pulsing ghost ring
      if (isPhase) {
        const pulse = 0.5 + Math.sin(now * 0.008) * 0.3;
        ctx.globalAlpha = pulse;
        ctx.strokeStyle = '#d946ef';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS * 2.5 + Math.sin(now * 0.006) * 3, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // Glow
      const orbGrad = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, glowSize);
      orbGrad.addColorStop(0, innerColor);
      orbGrad.addColorStop(0.3, ballColor);
      orbGrad.addColorStop(1, trailBase + '0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = innerColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = isFireball ? 18 : isElectric ? 14 : 8;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // Particles
    particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Ultimate meter bar
    const meterW = 120;
    const meterH = 6;
    const meterX = cw - meterW - 10;
    const meterY = 12;
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(meterX, meterY, meterW, meterH);
    const fill = (s.ultimateMeter / ULTIMATE_MAX) * meterW;
    const meterGrad = ctx.createLinearGradient(meterX, 0, meterX + meterW, 0);
    meterGrad.addColorStop(0, '#8800ff');
    meterGrad.addColorStop(1, '#ff00ff');
    ctx.fillStyle = meterGrad;
    ctx.fillRect(meterX, meterY, fill, meterH);
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(meterX, meterY, meterW, meterH);
    if (s.ultimateMeter >= ULTIMATE_MAX) {
      ctx.fillStyle = '#fff';
      ctx.font = '8px monospace';
      ctx.textAlign = 'right';
      ctx.fillText('Q/SPACE: ULTIMATE', meterX + meterW, meterY + meterH + 12);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '7px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`ULT ${Math.floor(s.ultimateMeter)}%`, meterX + meterW, meterY + meterH + 10);
    }

    // Tactical cooldowns display
    ctx.textAlign = 'left';
    let ty = 14;
    (['shockwave', 'timeslow', 'targetlock'] as TacticalType[]).forEach((t, i) => {
      const meta = TACTICAL_META[t];
      const ready = now >= s.tactical.cooldowns[t];
      ctx.fillStyle = ready ? meta.color : 'rgba(255,255,255,0.3)';
      ctx.font = '9px monospace';
      const label = ready ? `[${i + 1}] ${meta.icon} ${meta.label}` : `[${i + 1}] ${meta.icon} ${Math.ceil((s.tactical.cooldowns[t] - now) / 1000)}s`;
      ctx.fillText(label, 10, ty);
      ty += 14;
    });

    // Overlay
    if (s.overlayText && now < s.overlayEnd) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, ch / 2 - 40, cw, 80);
      ctx.fillStyle = theme.paddleA;
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = theme.paddleB;
      ctx.shadowBlur = 20;
      ctx.fillText(s.overlayText, cw / 2, ch / 2 + 8);
      ctx.shadowBlur = 0;
    }

    // Score multiplier display
    if (s.scoreMultiplier > 1 && now < s.scoreMultiplierEnd) {
      ctx.fillStyle = '#ffdd00';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`SCORE ×${s.scoreMultiplier.toFixed(1)}`, cw / 2, 85);
    }

    // Game over
    if (s.status === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 32px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ec4899';
      ctx.shadowBlur = 20;
      ctx.fillText('PORTAL COLLAPSED', cw / 2, ch / 2 - 30);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#c084fc';
      ctx.font = '16px monospace';
      ctx.fillText(`Score: ${s.score}  |  Best: ${s.bestScore}`, cw / 2, ch / 2 + 10);
      ctx.fillText(`Level Reached: ${s.level}`, cw / 2, ch / 2 + 35);
      ctx.fillStyle = '#00ffcc';
      ctx.font = '14px monospace';
      ctx.fillText('Press RESTART to try again', cw / 2, ch / 2 + 65);
    }

    if (now < s.shakeEnd) ctx.restore();
  }, []);

  // ─── Loop ──────────────────────────────────────────────────────────
  const loop = useCallback((time: number) => {
    const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
    lastTimeRef.current = time;
    update(dt);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) render(ctx);

    const s = stateRef.current;
    const now = performance.now();
    setUiStatus(s.status);
    setUiScore(s.score);
    setUiBest(s.bestScore);
    setUiLives(s.lives);
    setUiLevel(s.level);
    setUiUltimate(s.ultimateMeter);
    setUiShield(s.shieldActive);

    // Active power display
    const activePowerLabels: string[] = [];
    for (const [key, end] of s.activePowers) {
      if (now < end) {
        const remaining = Math.ceil((end - now) / 1000);
        const meta = POWER_UP_META[key as PowerUpType];
        if (meta) activePowerLabels.push(`${meta.label} (${remaining}s)`);
      }
    }
    setUiPower(activePowerLabels.join(' | '));

    // Tactical readiness
    setUiTacticals({
      shockwave: now >= s.tactical.cooldowns.shockwave,
      timeslow: now >= s.tactical.cooldowns.timeslow,
      targetlock: now >= s.tactical.cooldowns.targetlock,
    });

    setUiCombo(now < s.combo.displayEnd ? s.combo.display : '');

    rafRef.current = requestAnimationFrame(loop);
  }, [update, render]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  const startGame = async () => {
    const s = stateRef.current;
    if (s.status === 'idle' || s.status === 'gameover') {
      Object.assign(s, initState(BASE_WIDTH, BASE_HEIGHT));
      s.activePowers = new Map();
      s.status = 'running';
      scoreSubmittedRef.current = false;
    }
  };

  const togglePause = () => {
    const s = stateRef.current;
    if (s.status === 'running') s.status = 'paused';
    else if (s.status === 'paused') s.status = 'running';
  };

  const restartGame = async () => {
    const ns = initState(BASE_WIDTH, BASE_HEIGHT);
    ns.activePowers = new Map();
    Object.assign(stateRef.current, ns);
    stateRef.current.status = 'running';
    particles = [];
    scoreSubmittedRef.current = false;
  };

  const handleTacticalClick = (type: TacticalType) => {
    const s = stateRef.current;
    if (s.status !== 'running') return;
    useTactical(s, type, performance.now());
  };

  const handleUltimateClick = () => {
    const s = stateRef.current;
    if (s.status !== 'running') return;
    useUltimate(s, performance.now());
  };

  const cycleUltimate = () => {
    const s = stateRef.current;
    const types: UltimateType[] = ['overdrive', 'blackhole', 'lasersweep'];
    const idx = types.indexOf(s.selectedUltimate);
    s.selectedUltimate = types[(idx + 1) % types.length];
  };

  const maskWallet = (w: string) => w.length > 10 ? `${w.slice(0, 4)}...${w.slice(-4)}` : w;

  const selUlt = stateRef.current.selectedUltimate;
  const ultMeta = ULTIMATE_META[selUlt];

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
      {/* HUD */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-center">
          <span className="text-muted-foreground">Score</span>
          <p className="text-neon-cyan text-base font-bold">{uiScore}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-center">
          <span className="text-muted-foreground">Lives</span>
          <p className="text-pink-400 text-base font-bold">{'♥'.repeat(Math.max(0, uiLives))} {uiShield && '🛡'}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-center">
          <span className="text-muted-foreground">Level</span>
          <p className="text-purple-300 text-base font-bold">{uiLevel}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-center">
          <span className="text-muted-foreground">Best</span>
          <p className="text-amber-400 text-base font-bold">{uiBest}</p>
        </div>
      </div>

      {/* Active powers / combo / ultimate */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-h-[24px]">
          {uiPower && <span className="text-xs font-mono text-neon-cyan animate-pulse">{uiPower}</span>}
          {uiCombo && <span className="text-xs font-mono text-amber-400 animate-bounce">{uiCombo}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={cycleUltimate}
            className="text-xs font-mono px-2 py-1 rounded border border-purple-500/40 text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            {ultMeta.icon} {ultMeta.label}
          </button>
          <button
            onClick={handleUltimateClick}
            disabled={uiUltimate < ULTIMATE_MAX}
            className={`text-xs font-mono px-3 py-1 rounded font-bold transition-all ${
              uiUltimate >= ULTIMATE_MAX
                ? 'bg-purple-600 text-white animate-pulse shadow-lg shadow-purple-500/50'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            ULT {Math.floor(uiUltimate)}%
          </button>
        </div>
      </div>


      {/* Canvas */}
      <div ref={containerRef} className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-xl border border-purple-500/30 cursor-none touch-none"
          style={{ background: '#0a0015' }}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap justify-center">
        {(uiStatus === 'idle' || uiStatus === 'gameover') && (
          <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-500 text-white gap-2">
            <Play className="w-4 h-4" /> Start
          </Button>
        )}
        {(uiStatus === 'running' || uiStatus === 'paused') && (
          <Button onClick={togglePause} variant="outline" className="border-purple-500/50 gap-2">
            <Pause className="w-4 h-4" /> {uiStatus === 'paused' ? 'Resume' : 'Pause'}
          </Button>
        )}
        <Button onClick={restartGame} variant="outline" className="border-purple-500/50 gap-2">
          <RotateCcw className="w-4 h-4" /> Restart
        </Button>
        <Button onClick={() => { setShowLeaderboard(!showLeaderboard); if (!showLeaderboard) fetchLeaderboard(); }} variant="outline" className="border-amber-500/50 gap-2">
          <Trophy className="w-4 h-4" /> Leaderboard
        </Button>
      </div>

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="w-full bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 font-mono">
          <h3 className="text-center text-amber-400 text-sm font-bold mb-3">🏆 TOP PORTAL BREAKERS</h3>
          {loadingLb ? (
            <p className="text-center text-muted-foreground text-xs">Loading...</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground text-xs">No scores yet. Be the first!</p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {leaderboard.map((entry, i) => (
                <div key={`${entry.user_id}-${entry.created_at}`} className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs ${
                  i === 0 ? 'bg-amber-500/15 border border-amber-500/30' :
                  i === 1 ? 'bg-gray-400/10 border border-gray-400/20' :
                  i === 2 ? 'bg-orange-600/10 border border-orange-600/20' :
                  'bg-white/5'
                } ${entry.user_id === walletAddress ? 'ring-1 ring-neon-cyan/50' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-6 text-center font-bold ${
                      i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-muted-foreground'
                    }`}>
                      {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                    </span>
                    <span className={`${entry.user_id === walletAddress ? 'text-neon-cyan' : 'text-foreground'}`}>
                      {entry.user_id === walletAddress ? 'You' : maskWallet(entry.user_id)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground">Lv.{entry.level}</span>
                    <span className="text-amber-400 font-bold">{entry.score.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!walletAddress && (
            <p className="text-center text-xs text-muted-foreground mt-2">Connect wallet to submit scores</p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-muted-foreground text-center font-mono max-w-md space-y-1">
        <p>Move paddle · Break bricks · Catch power-ups · Don't let the orb fall</p>
        <p className="text-purple-400">[1] Shockwave · [2] Time Slow · [3] Target Lock · [Q/Space] Ultimate</p>
        <p className="text-purple-400">💣 Explosive · 🔋 Charge · 🧊 Freeze · 🔥 Combo bricks</p>
      </div>
    </div>
  );
};

export default PortalBreakerGame;
