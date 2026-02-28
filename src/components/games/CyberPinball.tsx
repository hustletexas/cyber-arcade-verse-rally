import React, { useRef, useEffect, useState, useCallback } from 'react';
import Matter from 'matter-js';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

const { Engine, Runner, Bodies, Body, Composite, Events, Constraint, Vector } = Matter;

// ═══════════════════════════════════════════════════════
// CYBER PINBALL — Ultimate Neon Cyberpunk Edition
// ═══════════════════════════════════════════════════════

const fin = (v: number) => Number.isFinite(v);
const sn = (v: number, fb = 0) => fin(v) ? v : fb;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, sn(v, lo)));
const radGrad = (ctx: CanvasRenderingContext2D, x0: number, y0: number, r0: number, x1: number, y1: number, r1: number) => {
  if (![x0, y0, r0, x1, y1, r1].every(fin) || r0 < 0 || r1 < 0) return null;
  try { return ctx.createRadialGradient(x0, y0, r0, x1, y1, r1); } catch { return null; }
};
const linGrad = (ctx: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number) => {
  if (![x0, y0, x1, y1].every(fin)) return null;
  try { return ctx.createLinearGradient(x0, y0, x1, y1); } catch { return null; }
};

// ── Dimensions ──
const TW = 420;
const TH = 820;
const BALL_R = 6;
// Cyber Breaker-style ball physics: restitution 1.0, speed controlled per-frame
const BALL_OPTS = { label: 'ball', restitution: 0.6, friction: 0.01, frictionAir: 0.001, density: 0.004 };
const WALL = 8;
const BUMPER_R = 16;
const FW = 64;
const FH = 12;
const MINI_FW = 36;
const MINI_FH = 8;
const PLUNGER_X = TW - 16;
const BG_COLOR = '#0b0f1a';

// ── Cannon constants ──
const CANNON_X = 50;
const CANNON_Y = 60;
const CANNON_MUZZLE_X = 50;
const CANNON_MUZZLE_Y = 70;
const TARGET_SPEED = 7; // Cyber Breaker base speed
const MAX_SPEED = 12;   // Cyber Breaker max speed

// ── Neon color palette ──
const NEON = {
  cyan: '#00ffff',
  pink: '#ff00ff',
  green: '#39ff14',
  yellow: '#fff200',
  orange: '#ff6600',
  red: '#ff0040',
  blue: '#0080ff',
  purple: '#bf00ff',
  white: '#ffffff',
  deepBlue: '#1a0a3e',
};

const maskWallet = (w: string) => w.length > 12 ? `${w.slice(0, 4)}...${w.slice(-4)}` : w;

interface LeaderboardEntry {
  user_id: string;
  score: number;
  balls_used: number;
  created_at: string;
}

interface CyberPinballProps {
  onScoreUpdate?: (score: number) => void;
  onBallLost?: (ballsLeft: number) => void;
  onGameOver?: (finalScore: number) => void;
}

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };
type BGParticle = { x: number; y: number; vx: number; vy: number; size: number; color: string; alpha: number };

export const CyberPinball: React.FC<CyberPinballProps> = ({ onScoreUpdate, onBallLost, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const animRef = useRef(0);
  const frame = useRef(0);
  const particles = useRef<Particle[]>([]);
  const bgParticles = useRef<BGParticle[]>([]);
  const touchStartY = useRef<number | null>(null);
  const scoreSubmittedRef = useRef(false);
  const cannonFlashRef = useRef(0); // cannon muzzle flash timer
  const cannonAngleRef = useRef(Math.PI / 4); // default 45° down-right

  // Wallet & leaderboard
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const walletAddress = primaryWallet?.address || '';
  const { deductBalance } = useUserBalance();
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLb, setLoadingLb] = useState(false);
  const [cccEarned, setCccEarned] = useState<number | null>(null);

  // ── Game state ref ──
  const G = useRef({
    score: 0, balls: 3, gameOver: false, launched: false, started: false,
    currentBall: null as Matter.Body | null,
    leftFlipper: null as Matter.Body | null,
    rightFlipper: null as Matter.Body | null,
    topLeftFlipper: null as Matter.Body | null,
    topRightFlipper: null as Matter.Body | null,
    leftUp: false, rightUp: false,
    combo: 0, comboTimer: 0, maxCombo: 0, totalHits: 0,
    // Anti-gravity
    antiGravActive: false, antiGravTimer: 0, antiGravMeter: 0,
    // Combo target bank (5 targets)
    comboTargets: [false, false, false, false, false] as boolean[],
    comboTargetComplete: 0,
    // Magnet bumper
    magnetActive: false, magnetTimer: 0,
    // Rotating rail angle
    railAngle: 0,
    // Modes
    demonTargetsL: [false, false, false] as boolean[],
    demonTargetsR: [false, false, false] as boolean[],
    demonMode: false, demonTimer: 0,
    orbitCount: 0, lastOrbitDir: '',
    reactorCharge: 0, overdriveActive: false, overdriveTimer: 0,
    lockedBalls: 0, multiballActive: false,
    extraBalls: [] as Matter.Body[],
    bumperFlash: new Map<string, number>(),
    trail: [] as { x: number; y: number; age: number }[],
    shake: { x: 0, y: 0, power: 0 },
    lightFlash: 0,
    skillShot: true,
    tiltWarnings: 0, tilted: false,
    cyberLetters: [false, false, false, false, false] as boolean[],
    cyberComplete: 0,
    highScore: parseInt(localStorage.getItem('cyberPinballHigh') || '0', 10),
    screenPulse: 0,
  });

  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(3);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState('');
  const [demonMode, setDemonMode] = useState(false);
  const [overdrive, setOverdrive] = useState(false);
  const [reactorCharge, setReactorCharge] = useState(0);
  const [cyberLetters, setCyberLetters] = useState([false, false, false, false, false]);
  const [lockedBalls, setLockedBalls] = useState(0);
  const [tiltW, setTiltW] = useState(0);
  const [antiGrav, setAntiGrav] = useState(false);
  const [antiGravMeter, setAntiGravMeter] = useState(0);
  const [highScore, setHighScore] = useState(G.current.highScore);

  // ── Leaderboard ──
  const fetchLeaderboard = useCallback(async () => {
    setLoadingLb(true);
    const { data } = await supabase
      .from('pinball_scores')
      .select('user_id, score, balls_used, created_at')
      .order('score', { ascending: false })
      .limit(20);
    setLeaderboard((data as LeaderboardEntry[]) || []);
    setLoadingLb(false);
  }, []);

  const submitScore = useCallback(async (finalScore: number, ballsUsed: number) => {
    if (!walletAddress || finalScore <= 0 || scoreSubmittedRef.current) return;
    scoreSubmittedRef.current = true;
    await supabase.from('pinball_scores').insert({
      user_id: walletAddress,
      score: finalScore,
      balls_used: ballsUsed,
    });
    fetchLeaderboard();
    // Smart contract: submit score for CCC rewards
    try {
      const { data } = await supabase.functions.invoke('submit-score', {
        body: { walletAddress, score: finalScore, gameType: 'arcade' },
      });
      if (data?.tokensAwarded) {
        setCccEarned(data.tokensAwarded);
      }
    } catch (e) {
      console.warn('Score submit to contract failed:', e);
    }
  }, [walletAddress, fetchLeaderboard]);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  const showMsg = useCallback((msg: string, dur = 2000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), dur);
  }, []);

  const addScore = useCallback((pts: number) => {
    const g = G.current;
    if (g.tilted || g.gameOver) return;
    g.combo++;
    g.totalHits++;
    g.comboTimer = Date.now() + 3000;
    if (g.combo > g.maxCombo) g.maxCombo = g.combo;
    const mult = Math.min(g.combo, 8);
    const dm = g.demonMode ? 3 : 1;
    const od = g.overdriveActive ? 2 : 1;
    const ag = g.antiGravActive ? 2 : 1;
    const total = Math.round(pts * mult * dm * od * ag);
    g.score += total;
    setScore(g.score);
    setCombo(g.combo);
    // Anti-gravity meter
    g.antiGravMeter = Math.min(g.antiGravMeter + 1, 10);
    setAntiGravMeter(g.antiGravMeter);
    if (g.antiGravMeter >= 10 && !g.antiGravActive) {
      g.antiGravActive = true;
      g.antiGravTimer = Date.now() + 8000;
      g.antiGravMeter = 0;
      setAntiGrav(true);
      setAntiGravMeter(0);
      showMsg('🌀 ANTI-GRAVITY ACTIVATED!', 3000);
      g.lightFlash = 1.5;
      g.shake.power = 6;
      g.screenPulse = 1;
      if (engineRef.current) {
        engineRef.current.gravity.y = -1.0;
      }
    }
    onScoreUpdate?.(g.score);
  }, [onScoreUpdate, showMsg]);

  const spawnParticles = useCallback((x: number, y: number, count: number, color: string, spread = 5) => {
    if (!fin(x) || !fin(y)) return;
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 0.5) * spread - 2,
        life: 20 + Math.random() * 15,
        color, size: 1 + Math.random() * 2.5,
      });
    }
  }, []);

  // Init background particles
  useEffect(() => {
    const bps: BGParticle[] = [];
    for (let i = 0; i < 60; i++) {
      bps.push({
        x: Math.random() * TW,
        y: Math.random() * TH,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        size: 0.5 + Math.random() * 2,
        color: [NEON.cyan, NEON.pink, NEON.purple, NEON.blue][Math.floor(Math.random() * 4)],
        alpha: 0.1 + Math.random() * 0.3,
      });
    }
    bgParticles.current = bps;
  }, []);

  // ═══════════════════════════════════════
  // ── PHYSICS INIT ──
  // ═══════════════════════════════════════
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = TW;
    canvas.height = TH;

    const engine = Engine.create({ gravity: { x: 0, y: 1.3, scale: 0.001 } });
    engineRef.current = engine;

    const wallOpts = { isStatic: true, label: 'wall', restitution: 0.7 };
    const sensorOpts = (label: string) => ({ isStatic: true, isSensor: true, label });

    // ── Walls ──
    const walls = [
      Bodies.rectangle(WALL / 2, TH / 2, WALL, TH, wallOpts),
      Bodies.rectangle(TW / 2, WALL / 2, TW, WALL, wallOpts),
      Bodies.rectangle(TW / 2, TH + 20, TW, 40, { isStatic: true, label: 'drain' }),
      Bodies.rectangle(TW - WALL / 2, TH / 2 - 140, WALL, TH - 280, wallOpts),
      Bodies.rectangle(TW - WALL / 2, TH - 55, WALL, 110, wallOpts),
      // Plunger lane walls (kept as playfield walls)
      Bodies.rectangle(TW - 34, TH - 190, 4, 200, { ...wallOpts, angle: 0.03 }),
      Bodies.rectangle(TW - 48, TH - 310, 45, 4, { ...wallOpts, angle: -0.32 }),
      // Inner guides
      Bodies.rectangle(30, TH - 170, 4, 130, { ...wallOpts, angle: 0.12 }),
      Bodies.rectangle(62, TH - 145, 4, 95, { ...wallOpts, angle: 0.16 }),
      Bodies.rectangle(TW - 58, TH - 170, 4, 130, { ...wallOpts, angle: -0.12 }),
      Bodies.rectangle(TW - 90, TH - 145, 4, 95, { ...wallOpts, angle: -0.16 }),
      // Top area guides
      Bodies.rectangle(20, 195, 4, 230, wallOpts),
      // removed: top-left guide wall (was touching cannon)
      Bodies.rectangle(TW - 46, 195, 4, 230, wallOpts),
      Bodies.rectangle(TW - 60, 78, 42, 4, { ...wallOpts, angle: 0.3 }),
      // Anti-gravity top drain blocker
      Bodies.rectangle(TW / 2, -10, TW - 50, 8, { ...wallOpts, restitution: 0.8, label: 'top_wall' }),
    ];

    // ── Bottom Flippers ──
    const lfX = TW / 2 - 52, rfX = TW / 2 + 52, fY = TH - 68;
    const lf = Bodies.rectangle(lfX, fY, FW, FH, { label: 'leftFlipper', density: 0.02, frictionAir: 0.02, chamfer: { radius: 4 } });
    const rf = Bodies.rectangle(rfX, fY, FW, FH, { label: 'rightFlipper', density: 0.02, frictionAir: 0.02, chamfer: { radius: 4 } });
    const lp = Constraint.create({ bodyA: lf, pointA: { x: -FW / 2 + 6, y: 0 }, pointB: { x: lfX - FW / 2 + 6, y: fY }, stiffness: 1, length: 0 });
    const rp = Constraint.create({ bodyA: rf, pointA: { x: FW / 2 - 6, y: 0 }, pointB: { x: rfX + FW / 2 - 6, y: fY }, stiffness: 1, length: 0 });
    G.current.leftFlipper = lf;
    G.current.rightFlipper = rf;

    // ── Top Mini Flippers ──
    const tlfX = TW / 2 - 70, trfX = TW / 2 + 70, tfY = 160;
    const tlf = Bodies.rectangle(tlfX, tfY, MINI_FW, MINI_FH, { label: 'topLeftFlipper', density: 0.015, frictionAir: 0.02, chamfer: { radius: 3 } });
    const trf = Bodies.rectangle(trfX, tfY, MINI_FW, MINI_FH, { label: 'topRightFlipper', density: 0.015, frictionAir: 0.02, chamfer: { radius: 3 } });
    const tlp = Constraint.create({ bodyA: tlf, pointA: { x: -MINI_FW / 2 + 4, y: 0 }, pointB: { x: tlfX - MINI_FW / 2 + 4, y: tfY }, stiffness: 1, length: 0 });
    const trp = Constraint.create({ bodyA: trf, pointA: { x: MINI_FW / 2 - 4, y: 0 }, pointB: { x: trfX + MINI_FW / 2 - 4, y: tfY }, stiffness: 1, length: 0 });
    G.current.topLeftFlipper = tlf;
    G.current.topRightFlipper = trf;

    // ── Slingshots ──
    const lSling = Bodies.fromVertices(82, TH - 148, [[{ x: 0, y: 0 }, { x: 30, y: 50 }, { x: -4, y: 50 }]], { isStatic: true, label: 'slingshot', restitution: 1.6 });
    const rSling = Bodies.fromVertices(TW - 108, TH - 148, [[{ x: 0, y: 0 }, { x: 4, y: 50 }, { x: -30, y: 50 }]], { isStatic: true, label: 'slingshot', restitution: 1.6 });

    // ── 4 Neon Bumpers ──
    const bCX = TW / 2, bCY = 240;
    const bumpers = [
      Bodies.circle(bCX - 30, bCY - 35, BUMPER_R, { isStatic: true, label: 'bumper_0', restitution: 1.8 }),
      Bodies.circle(bCX + 30, bCY - 35, BUMPER_R, { isStatic: true, label: 'bumper_1', restitution: 1.8 }),
      Bodies.circle(bCX - 50, bCY + 25, BUMPER_R, { isStatic: true, label: 'bumper_2', restitution: 1.8 }),
      Bodies.circle(bCX + 50, bCY + 25, BUMPER_R, { isStatic: true, label: 'bumper_3', restitution: 1.8 }),
    ];

    const reactorSensor = Bodies.circle(bCX, bCY, 8, sensorOpts('reactor_core'));

    // ── Skill shot lanes ──
    const laneY = 52;
    const skillLaneSensors = [
      Bodies.rectangle(TW / 2 - 40, laneY, 14, 24, sensorOpts('skill_lane_0')),
      Bodies.rectangle(TW / 2, laneY, 14, 24, sensorOpts('skill_lane_1')),
      Bodies.rectangle(TW / 2 + 40, laneY, 14, 24, sensorOpts('skill_lane_2')),
    ];
    const skillLaneGuides = [
      Bodies.rectangle(TW / 2 - 55, laneY, 3, 34, wallOpts),
      Bodies.rectangle(TW / 2 - 25, laneY, 3, 34, wallOpts),
      Bodies.rectangle(TW / 2 + 25, laneY, 3, 34, wallOpts),
      Bodies.rectangle(TW / 2 + 55, laneY, 3, 34, wallOpts),
    ];

    // ── Combo target bank ──
    const ctY = 420;
    const comboTargets = [0, 1, 2, 3, 4].map(i =>
      Bodies.rectangle(TW / 2 - 48 + i * 24, ctY, 5, 22, sensorOpts(`combo_target_${i}`))
    );
    // combo target wall removed

    // ── Portal hole ──
    const portalHole = Bodies.circle(bCX, 560, 10, sensorOpts('portal_hole'));

    // ── Magnet bumper ──
    const magnetBumper = Bodies.circle(TW / 2, 340, 14, { isStatic: true, label: 'magnet_bumper', restitution: 0.3 });

    // ── Rotating rail ramp ──
    const railRamp = Bodies.rectangle(TW / 2 - 80, 300, 80, 4, { isStatic: true, label: 'rail_ramp', angle: -0.15 });
    const railSensor = Bodies.rectangle(TW / 2 - 80, 280, 18, 8, sensorOpts('rail_loop'));

    // ── CYBER letter lanes ──
    const cyberY = 130;
    const cyberSensors = 'CYBER'.split('').map((_, i) =>
      Bodies.rectangle(TW / 2 - 60 + i * 30, cyberY, 10, 24, sensorOpts(`cyber_${i}`))
    );

    // ── Drop targets ──
    const dtY = 520;
    const demonTargetsL = [0, 1, 2].map(i =>
      Bodies.rectangle(60 + i * 22, dtY, 4, 20, sensorOpts(`demon_l_${i}`))
    );
    const demonTargetsR = [0, 1, 2].map(i =>
      Bodies.rectangle(TW - 104 + i * 22, dtY, 4, 20, sensorOpts(`demon_r_${i}`))
    );
    walls.push(Bodies.rectangle(82, dtY - 14, 70, 3, wallOpts));
    

    // ── Orbit sensors ──
    const orbitL = Bodies.rectangle(28, 115, 16, 8, sensorOpts('orbit_left'));
    const orbitR = Bodies.rectangle(TW - 52, 115, 16, 8, sensorOpts('orbit_right'));


    const spinner = Bodies.rectangle(bCX, bCY - 78, 32, 3, sensorOpts('spinner'));
    const lockSensor = Bodies.rectangle(bCX, bCY + 60, 26, 6, sensorOpts('multiball_lock'));
    const kickback = Bodies.rectangle(14, TH - 210, 6, 30, { isStatic: true, label: 'kickback', restitution: 1.6 });

    Composite.add(engine.world, [
      ...walls, lf, rf, lp, rp,
      tlf, trf, tlp, trp,
      ...(lSling ? [lSling] : []), ...(rSling ? [rSling] : []),
      ...bumpers, reactorSensor, portalHole,
      ...skillLaneSensors, ...skillLaneGuides,
      ...comboTargets, magnetBumper, railRamp, railSensor,
      ...cyberSensors,
      ...demonTargetsL, ...demonTargetsR,
      orbitL, orbitR,
      spinner, lockSensor, kickback,
    ]);

    // ═══════════════════════════════════════
    // ── COLLISION HANDLING ──
    // ═══════════════════════════════════════
    Events.on(engine, 'collisionStart', (event) => {
      const g = G.current;
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        const ball = labels.includes('ball') ? (pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB) : null;
        if (!ball) continue;

        if (labels.includes('drain')) { handleDrain(ball); continue; }

        // Bumpers
        for (let i = 0; i < 4; i++) {
          if (labels.includes(`bumper_${i}`)) {
            addScore(100);
            g.bumperFlash.set(`bumper_${i}`, Date.now() + 300);
            g.shake.power = 5;
            g.lightFlash = 0.4;
            g.reactorCharge = Math.min(g.reactorCharge + 12, 100);
            setReactorCharge(g.reactorCharge);
            if (g.reactorCharge >= 100 && !g.overdriveActive) {
              g.overdriveActive = true;
              g.overdriveTimer = Date.now() + 15000;
              setOverdrive(true);
              showMsg('⚡ OVERDRIVE ENGAGED! 2x SCORING!', 3000);
              g.lightFlash = 1;
            }
            const bmp = pair.bodyA.label === `bumper_${i}` ? pair.bodyA : pair.bodyB;
            if (fin(ball.position.x) && fin(bmp.position.x)) {
              const d = Vector.normalise(Vector.sub(ball.position, bmp.position));
              Body.applyForce(ball, ball.position, { x: d.x * 0.018, y: d.y * 0.018 });
            }
            spawnParticles(ball.position.x, ball.position.y, 12, [NEON.cyan, NEON.pink, NEON.green, NEON.purple][i], 6);
          }
        }

        if (labels.includes('slingshot')) {
          addScore(50);
          g.shake.power = 3;
          spawnParticles(ball.position.x, ball.position.y, 6, NEON.yellow, 4);
        }

        // Skill shot lanes
        for (let i = 0; i < 3; i++) {
          if (labels.includes(`skill_lane_${i}`)) {
            if (g.skillShot) {
              addScore(3000);
              showMsg('🎯 SKILL SHOT! +3000', 2500);
              g.skillShot = false;
              spawnParticles(ball.position.x, ball.position.y, 15, NEON.white, 8);
            } else {
              addScore(200);
            }
          }
        }

        // Combo target bank
        for (let i = 0; i < 5; i++) {
          if (labels.includes(`combo_target_${i}`) && !g.comboTargets[i]) {
            g.comboTargets[i] = true;
            addScore(400);
            spawnParticles(ball.position.x, ball.position.y, 6, NEON.orange, 4);
            if (g.comboTargets.every(Boolean)) {
              g.comboTargetComplete++;
              g.comboTargets.fill(false);
              addScore(2000);
              showMsg(`💥 COMBO BANK COMPLETE! +2000`, 3000);
              g.lightFlash = 1;
              g.shake.power = 10;
              spawnParticles(TW / 2, ctY, 25, NEON.orange, 10);
            }
          }
        }

        // Magnet bumper
        if (labels.includes('magnet_bumper')) {
          addScore(75);
          g.magnetActive = true;
          g.magnetTimer = Date.now() + 600;
          if (fin(ball.velocity.x) && fin(ball.velocity.y)) {
            Body.setVelocity(ball, { x: ball.velocity.x * 0.3, y: ball.velocity.y * 0.3 });
          }
          spawnParticles(ball.position.x, ball.position.y, 8, NEON.purple, 3);
          showMsg('⚡ MAGNET!');
        }

        // Rail loop
        if (labels.includes('rail_loop')) {
          addScore(500);
          showMsg('🌀 RAIL LOOP! +500');
          spawnParticles(ball.position.x, ball.position.y, 10, NEON.green, 6);
        }

        // CYBER letters
        for (let i = 0; i < 5; i++) {
          if (labels.includes(`cyber_${i}`) && !g.cyberLetters[i]) {
            g.cyberLetters[i] = true;
            setCyberLetters([...g.cyberLetters]);
            addScore(500);
            showMsg(`${'CYBER'[i]} LIT!`);
            spawnParticles(ball.position.x, ball.position.y, 6, NEON.cyan, 4);
            if (g.cyberLetters.every(Boolean)) {
              g.cyberComplete++;
              g.cyberLetters.fill(false);
              setCyberLetters([false, false, false, false, false]);
              const bonus = 5000 * g.cyberComplete;
              addScore(bonus);
              showMsg(`🌆 CYBER JACKPOT x${g.cyberComplete}! +${bonus.toLocaleString()}`, 3000);
              g.lightFlash = 1;
              g.shake.power = 8;
            }
          }
        }

        // Demon targets
        for (let i = 0; i < 3; i++) {
          if (labels.includes(`demon_l_${i}`) && !g.demonTargetsL[i]) {
            g.demonTargetsL[i] = true;
            addScore(200);
            spawnParticles(ball.position.x, ball.position.y, 5, NEON.red, 4);
          }
          if (labels.includes(`demon_r_${i}`) && !g.demonTargetsR[i]) {
            g.demonTargetsR[i] = true;
            addScore(200);
            spawnParticles(ball.position.x, ball.position.y, 5, NEON.red, 4);
          }
        }
        if (g.demonTargetsL.every(Boolean) && g.demonTargetsR.every(Boolean) && !g.demonMode) {
          g.demonMode = true;
          g.demonTimer = Date.now() + 20000;
          setDemonMode(true);
          showMsg('👹 DEMON MODE! 3x SCORING!', 4000);
          g.lightFlash = 1;
          g.shake.power = 8;
        }

        // Orbits
        if (labels.includes('orbit_left') || labels.includes('orbit_right')) {
          const dir = labels.includes('orbit_left') ? 'left' : 'right';
          if (g.lastOrbitDir !== dir) { g.orbitCount++; g.lastOrbitDir = dir; }
          else { g.orbitCount = 1; g.lastOrbitDir = dir; }
          addScore(150 * g.orbitCount);
          if (g.orbitCount > 1) showMsg(`ORBIT x${g.orbitCount}!`);
        }


        if (labels.includes('spinner')) { addScore(25); }

        // Portal hole
        if (labels.includes('portal_hole')) {
          addScore(250);
          showMsg('🌀 PORTAL! +250');
          g.shake.power = 6;
          g.lightFlash = 0.6;
          spawnParticles(ball.position.x, ball.position.y, 15, NEON.purple, 8);
          Body.setPosition(ball, { x: TW / 2, y: 30 });
          Body.setVelocity(ball, { x: (Math.random() - 0.5) * 3, y: 2 });
          spawnParticles(TW / 2, 30, 12, NEON.purple, 6);
        }

        // Multiball lock
        if (labels.includes('multiball_lock') && !g.multiballActive && g.lockedBalls < 2) {
          g.lockedBalls++;
          setLockedBalls(g.lockedBalls);
          addScore(1000);
          showMsg(`BALL LOCKED! (${g.lockedBalls}/2)`);
          if (g.lockedBalls >= 2) {
            g.multiballActive = true;
            g.lightFlash = 1;
            g.shake.power = 8;
            showMsg('🌩 CYBER STORM MULTIBALL!', 4000);
            for (let b = 0; b < 2; b++) {
              const extra = Bodies.circle(TW / 2 + (b - 0.5) * 35, 100, BALL_R, {
                ...BALL_OPTS,
              });
              Composite.add(engine.world, extra);
              g.extraBalls.push(extra);
              Body.applyForce(extra, extra.position, { x: (Math.random() - 0.5) * 0.004, y: 0.004 });
            }
          }
        }

        if (labels.includes('kickback')) {
          if (fin(ball.position.x)) Body.applyForce(ball, ball.position, { x: 0.003, y: -0.016 });
          addScore(100);
          showMsg('KICKBACK!');
        }
      }
    });

    // ── Drain handler ──
    const handleDrain = (ball: Matter.Body) => {
      const g = G.current;
      try { Composite.remove(engine.world, ball); } catch {}
      const extraIdx = g.extraBalls.indexOf(ball);
      if (extraIdx >= 0) {
        g.extraBalls.splice(extraIdx, 1);
        if (g.extraBalls.length === 0 && g.multiballActive) {
          g.multiballActive = false;
          showMsg('MULTIBALL ENDED');
        }
        return;
      }
      g.currentBall = null;
      g.balls--;
      g.launched = false;
      g.skillShot = true;
      g.orbitCount = 0;
      g.lastOrbitDir = '';
      g.trail = [];
      setBalls(g.balls);
      onBallLost?.(g.balls);
      if (g.balls <= 0) {
        g.gameOver = true;
        setGameOver(true);
        if (g.score > g.highScore) {
          g.highScore = g.score;
          localStorage.setItem('cyberPinballHigh', String(g.score));
          setHighScore(g.score);
        }
        onGameOver?.(g.score);
        // Submit score + smart contract
        submitScore(g.score, 3 - g.balls);
        showMsg('GAME OVER');
      } else {
        showMsg(`BALL LOST — ${g.balls} LEFT`);
        setTimeout(() => spawnBall(), 1000);
      }
    };

    // ── Spawn ball at cannon muzzle (unified) ──
    const spawnBall = () => {
      const g = G.current;
      if (g.currentBall || g.gameOver) return;
      const ball = Bodies.circle(CANNON_MUZZLE_X, CANNON_MUZZLE_Y, BALL_R, {
        ...BALL_OPTS, isStatic: true,
      });
      Composite.add(engine.world, ball);
      g.currentBall = ball;
      g.launched = false;
      g.tilted = false;
      g.tiltWarnings = 0;
      setTiltW(0);
    };

    // ── Cannon launch (unified) ──
    const doLaunch = () => {
      const g = G.current;
      if (g.launched || g.gameOver) return;
      if (!g.started) {
        g.started = true;
        setStarted(true);
      }

      const worldBall = Composite.allBodies(engine.world).find((b) => b.label === 'ball') as Matter.Body | undefined;
      if (!g.currentBall && worldBall) g.currentBall = worldBall;

      if (!g.currentBall) {
        const emergencyBall = Bodies.circle(CANNON_MUZZLE_X, CANNON_MUZZLE_Y, BALL_R, {
          ...BALL_OPTS,
        });
        Composite.add(engine.world, emergencyBall);
        g.currentBall = emergencyBall;
      }
      if (!g.currentBall || !fin(g.currentBall.position.x) || !fin(g.currentBall.position.y)) return;

      Body.setStatic(g.currentBall, false);
      Body.setPosition(g.currentBall, { x: CANNON_MUZZLE_X, y: CANNON_MUZZLE_Y });
      // Fire in aimed direction
      const aimAngle = cannonAngleRef.current;
      const launchSpeed = 10;
      Body.setVelocity(g.currentBall, {
        x: Math.cos(aimAngle) * launchSpeed,
        y: Math.sin(aimAngle) * launchSpeed,
      });
      g.launched = true;
      // Cannon muzzle flash
      cannonFlashRef.current = Date.now() + 400;
      showMsg('🔥 CANNON FIRE!');
      g.shake.power = 6;
      g.screenPulse = 0.5;
      // Muzzle flash particles
      const muzzleTipX = CANNON_X + Math.cos(aimAngle) * 28;
      const muzzleTipY = CANNON_Y + Math.sin(aimAngle) * 28;
      spawnParticles(muzzleTipX, muzzleTipY, 20, NEON.orange, 10);
      spawnParticles(muzzleTipX, muzzleTipY, 10, NEON.yellow, 8);
      spawnParticles(CANNON_MUZZLE_X, CANNON_MUZZLE_Y, 8, NEON.cyan, 6);
    };

    setTimeout(() => spawnBall(), 400);

    const runner = Runner.create();
    Runner.run(runner, engine);
    runnerRef.current = runner;

    // ═══════════════════════════════════════
    // ── RENDER LOOP ──
    // ═══════════════════════════════════════
    const renderLoop = () => {
      const g = G.current;
      const f = frame.current++;
      const t = f * 0.016;

      // ── Ball recovery ──
      if (g.currentBall) {
        const p = g.currentBall.position;
        const v = g.currentBall.velocity;
        if (!fin(p.x) || !fin(p.y) || !fin(v.x) || !fin(v.y)) {
          try { Composite.remove(engine.world, g.currentBall); } catch {}
          g.currentBall = null;
          g.launched = false;
          g.trail = [];
          if (!g.gameOver && g.balls > 0) setTimeout(() => spawnBall(), 600);
        }
      }
      for (let ei = g.extraBalls.length - 1; ei >= 0; ei--) {
        const eb = g.extraBalls[ei];
        if (!fin(eb.position.x) || !fin(eb.position.y)) {
          try { Composite.remove(engine.world, eb); } catch {}
          g.extraBalls.splice(ei, 1);
        }
      }

      // ── Boundary clamping ──
      if (g.currentBall && g.launched && fin(g.currentBall.position.x) && fin(g.currentBall.position.y)) {
        const bx = g.currentBall.position.x;
        const by = g.currentBall.position.y;
        const margin = WALL + BALL_R + 2;
        let clamped = false;
        let cx = bx, cy = by;
        if (bx < margin) { cx = margin; clamped = true; }
        if (bx > TW - margin) { cx = TW - margin; clamped = true; }
        if (by < margin) { cy = margin; clamped = true; }
        if (clamped) {
          Body.setPosition(g.currentBall, { x: cx, y: cy });
          const vx = g.currentBall.velocity.x;
          const vy = g.currentBall.velocity.y;
          Body.setVelocity(g.currentBall, {
            x: bx < margin ? Math.abs(vx) : bx > TW - margin ? -Math.abs(vx) : vx,
            y: by < margin ? Math.abs(vy) : vy,
          });
          spawnParticles(cx, cy, 4, NEON.cyan, 3);
        }
      }
      // Also clamp extra balls
      for (const eb of g.extraBalls) {
        if (fin(eb.position.x) && fin(eb.position.y)) {
          const margin = WALL + BALL_R + 2;
          let cx = eb.position.x, cy = eb.position.y;
          let clamped = false;
          if (cx < margin) { cx = margin; clamped = true; }
          if (cx > TW - margin) { cx = TW - margin; clamped = true; }
          if (cy < margin) { cy = margin; clamped = true; }
          if (clamped) {
            Body.setPosition(eb, { x: cx, y: cy });
            Body.setVelocity(eb, {
              x: eb.position.x < margin ? Math.abs(eb.velocity.x) : eb.position.x > TW - margin ? -Math.abs(eb.velocity.x) : eb.velocity.x,
              y: eb.position.y < margin ? Math.abs(eb.velocity.y) : eb.velocity.y,
            });
          }
        }
      }

      // ── Top curve ──
      if (g.currentBall && g.launched && fin(g.currentBall.position.y) && fin(g.currentBall.velocity.y)) {
        const by = g.currentBall.position.y;
        const bx = g.currentBall.position.x;
        const vy = g.currentBall.velocity.y;
        if (by < 80 && vy < -2) {
          const dirX = bx > TW / 2 ? -1 : 1;
          const curvePower = 0.006 * Math.abs(vy / 12);
          Body.applyForce(g.currentBall, g.currentBall.position, { x: dirX * curvePower, y: 0.002 });
        }
      }

      // ── Speed cap only (natural gravity, no forced normalization) ──
      if (g.currentBall && g.launched && fin(g.currentBall.velocity.x) && fin(g.currentBall.velocity.y)) {
        const vx = g.currentBall.velocity.x;
        const vy = g.currentBall.velocity.y;
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > MAX_SPEED) {
          const scale = MAX_SPEED / speed;
          Body.setVelocity(g.currentBall, { x: vx * scale, y: vy * scale });
        }
      }
      // Same cap for extra balls
      for (const eb of g.extraBalls) {
        if (fin(eb.velocity.x) && fin(eb.velocity.y)) {
          const speed = Math.sqrt(eb.velocity.x ** 2 + eb.velocity.y ** 2);
          if (speed > MAX_SPEED) {
            const scale = MAX_SPEED / speed;
            Body.setVelocity(eb, { x: eb.velocity.x * scale, y: eb.velocity.y * scale });
          }
        }
      }

      // ── Timers ──
      const now = Date.now();
      if (g.combo > 0 && now > g.comboTimer) { g.combo = 0; setCombo(0); }
      if (g.overdriveActive && now > g.overdriveTimer) {
        g.overdriveActive = false; g.reactorCharge = 0;
        setOverdrive(false); setReactorCharge(0);
      }
      if (g.demonMode && now > g.demonTimer) {
        g.demonMode = false;
        g.demonTargetsL.fill(false);
        g.demonTargetsR.fill(false);
        setDemonMode(false);
      }
      if (g.antiGravActive && now > g.antiGravTimer) {
        g.antiGravActive = false;
        setAntiGrav(false);
        if (engineRef.current) {
          engineRef.current.gravity.y = 1.3;
        }
        showMsg('GRAVITY RESTORED');
      }
      if (g.magnetActive && now > g.magnetTimer) {
        g.magnetActive = false;
      }

      // Screen pulse decay
      if (g.screenPulse > 0.01) {
        g.screenPulse *= 0.95;
        if (g.screenPulse < 0.02) g.screenPulse = 0;
      }

      // ── Rotating rail ramp ──
      g.railAngle += 0.008;
      Body.setAngle(railRamp, Math.sin(g.railAngle) * 0.25 - 0.15);

      // ── Flipper physics ──
      if (g.leftFlipper) {
        const ta = g.leftUp ? -0.62 : 0.38;
        Body.setAngularVelocity(g.leftFlipper, (ta - g.leftFlipper.angle) * 0.55);
      }
      if (g.rightFlipper) {
        const ta = g.rightUp ? 0.62 : -0.38;
        Body.setAngularVelocity(g.rightFlipper, (ta - g.rightFlipper.angle) * 0.55);
      }
      if (g.topLeftFlipper) {
        const ta = g.leftUp ? -0.55 : 0.3;
        Body.setAngularVelocity(g.topLeftFlipper, (ta - g.topLeftFlipper.angle) * 0.45);
      }
      if (g.topRightFlipper) {
        const ta = g.rightUp ? 0.55 : -0.3;
        Body.setAngularVelocity(g.topRightFlipper, (ta - g.topRightFlipper.angle) * 0.45);
      }

      // ═══════════════════════════════════════
      // ── DRAW ──
      // ═══════════════════════════════════════
      ctx.save();

      // Shake
      if (g.shake.power > 0.2) {
        g.shake.x = (Math.random() - 0.5) * g.shake.power;
        g.shake.y = (Math.random() - 0.5) * g.shake.power;
        ctx.translate(g.shake.x, g.shake.y);
        g.shake.power *= 0.82;
        if (g.shake.power < 0.3) g.shake.power = 0;
      }

      // ── DARK BACKGROUND ──
      ctx.fillStyle = BG_COLOR;
      ctx.fillRect(0, 0, TW, TH);

      // ── Animated background particles ──
      for (const bp of bgParticles.current) {
        bp.x += bp.vx;
        bp.y += bp.vy;
        if (bp.y < -5) bp.y = TH + 5;
        if (bp.y > TH + 5) bp.y = -5;
        if (bp.x < -5) bp.x = TW + 5;
        if (bp.x > TW + 5) bp.x = -5;
        ctx.globalAlpha = bp.alpha * (0.5 + Math.sin(t * 2 + bp.x * 0.01) * 0.5);
        ctx.fillStyle = bp.color;
        ctx.beginPath(); ctx.arc(bp.x, bp.y, bp.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;

      // ── Neon grid ──
      ctx.globalAlpha = 0.04;
      ctx.strokeStyle = NEON.blue;
      ctx.lineWidth = 0.5;
      for (let y = 0; y < TH; y += 28) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TW, y); ctx.stroke();
      }
      for (let x = 0; x < TW; x += 28) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, TH); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // ── Neon graffiti text background ──
      ctx.save();
      ctx.globalAlpha = 0.03;
      const graffitiWords = ['CYBER', 'CITY', 'NEON', 'PINBALL', 'ARCADE', 'TURBO', 'HACK', 'GLITCH', 'FLUX', 'VOLT'];
      const graffitiColors = [NEON.cyan, NEON.pink, NEON.purple, NEON.blue, NEON.green, NEON.orange];
      for (let i = 0; i < 25; i++) {
        const seed = i * 7919;
        const gx = (seed * 131) % TW;
        const gy = (seed * 97) % TH;
        const angle = ((seed * 37) % 120 - 60) * Math.PI / 180;
        const size = 12 + (seed % 28);
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(angle);
        ctx.font = `bold ${size}px monospace`;
        ctx.fillStyle = graffitiColors[i % graffitiColors.length];
        ctx.textAlign = 'center';
        ctx.fillText(graffitiWords[i % graffitiWords.length], 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // ── Animated neon glow washes ──
      const nGlow1 = radGrad(ctx, TW * 0.3, TH * 0.3, 8, TW * 0.3, TH * 0.3, 160);
      if (nGlow1) {
        nGlow1.addColorStop(0, `rgba(0, 128, 255, ${0.035 + Math.sin(t) * 0.015})`);
        nGlow1.addColorStop(1, 'transparent');
        ctx.fillStyle = nGlow1; ctx.fillRect(0, 0, TW, TH);
      }
      const nGlow2 = radGrad(ctx, TW * 0.7, TH * 0.6, 8, TW * 0.7, TH * 0.6, 140);
      if (nGlow2) {
        nGlow2.addColorStop(0, `rgba(255, 0, 255, ${0.03 + Math.sin(t * 1.3 + 2) * 0.012})`);
        nGlow2.addColorStop(1, 'transparent');
        ctx.fillStyle = nGlow2; ctx.fillRect(0, 0, TW, TH);
      }
      const nGlow3 = radGrad(ctx, TW * 0.5, TH * 0.12, 8, TW * 0.5, TH * 0.12, 120);
      if (nGlow3) {
        nGlow3.addColorStop(0, `rgba(191, 0, 255, ${0.025 + Math.sin(t * 0.7 + 4) * 0.01})`);
        nGlow3.addColorStop(1, 'transparent');
        ctx.fillStyle = nGlow3; ctx.fillRect(0, 0, TW, TH);
      }

      // ── Anti-gravity screen effects ──
      if (g.antiGravActive) {
        const agPulse = Math.sin(t * 5) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(191, 0, 255, ${0.04 + agPulse * 0.03})`;
        ctx.fillRect(0, 0, TW, TH);
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 8; i++) {
          const sx = ((i * 53 + f * 2) % TW);
          const sy = TH - (f * 3 + i * 100) % TH;
          ctx.strokeStyle = NEON.purple;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy - 20); ctx.stroke();
        }
        ctx.globalAlpha = 1;
      }

      // ── Screen pulse effect ──
      if (g.screenPulse > 0.01) {
        ctx.fillStyle = `rgba(191, 0, 255, ${g.screenPulse * 0.15})`;
        ctx.fillRect(0, 0, TW, TH);
      }

      // ── Reactor core glow ──
      const bCXd = bCX, bCYd = bCY;
      const rcSize = sn(85 + g.reactorCharge * 1.1, 85);
      const rcAlpha = clamp(g.overdriveActive ? 0.22 + Math.sin(t * 6) * 0.08 : 0.05 + g.reactorCharge * 0.002, 0, 1);
      const rcGlow = radGrad(ctx, bCXd, bCYd, 2, bCXd, bCYd, rcSize);
      if (rcGlow) {
        rcGlow.addColorStop(0, `rgba(0, 128, 255, ${rcAlpha * 1.5})`);
        rcGlow.addColorStop(0.35, `rgba(255, 0, 255, ${rcAlpha})`);
        rcGlow.addColorStop(0.7, `rgba(191, 0, 255, ${rcAlpha * 0.4})`);
        rcGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = rcGlow;
        ctx.fillRect(bCXd - rcSize, bCYd - rcSize, rcSize * 2, rcSize * 2);
      }

      // ── Flipper area glow ──
      const fGlow = radGrad(ctx, TW / 2, fY, 8, TW / 2, fY, 110);
      if (fGlow) {
        fGlow.addColorStop(0, 'rgba(0, 128, 255, 0.04)');
        fGlow.addColorStop(0.5, 'rgba(255, 0, 255, 0.02)');
        fGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = fGlow;
        ctx.fillRect(0, TH - 200, TW, 200);
      }

      // ── Lightning flash ──
      if (g.lightFlash > 0.02) {
        ctx.fillStyle = `rgba(0, 128, 255, ${g.lightFlash * 0.12})`;
        ctx.fillRect(0, 0, TW, TH);
        g.lightFlash *= 0.88;
        if (g.lightFlash < 0.03) g.lightFlash = 0;
      }

      // ── Electric table border ──
      ctx.shadowColor = NEON.cyan;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = `rgba(0, 255, 255, 0.5)`;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(3, 3, TW - 6, TH - 6);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255, 0, 255, 0.15)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(5, 5, TW - 10, TH - 10);
      const corners = [[6, 6], [TW - 6, 6], [6, TH - 6], [TW - 6, TH - 6]];
      for (let ci = 0; ci < corners.length; ci++) {
        const [cx, cy] = corners[ci];
        ctx.fillStyle = `rgba(0, 255, 255, 0.6)`;
        ctx.shadowColor = NEON.cyan;
        ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(cx, cy, 2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      const arcX = 6 + ((t * 60) % (TW - 12));
      ctx.fillStyle = NEON.cyan;
      ctx.shadowColor = NEON.cyan;
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(arcX, 3, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;

      // ══════════════════════════════════════
      // ── DRAW CANNON (top-left) ──
      // ══════════════════════════════════════
      const cannonFlashing = now < cannonFlashRef.current;
      ctx.save();
      ctx.translate(CANNON_X, CANNON_Y);
      ctx.rotate(cannonAngleRef.current); // dynamic aim angle

      // ── Aim laser line (when not launched) ──
      if (!g.launched && !g.gameOver) {
        ctx.save();
        ctx.strokeStyle = `${NEON.orange}44`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(30, 0);
        ctx.lineTo(200, 0);
        ctx.stroke();
        ctx.setLineDash([]);
        // Aim dot at end
        const dotPulse = 0.3 + Math.sin(t * 5) * 0.3;
        ctx.fillStyle = NEON.orange;
        ctx.globalAlpha = dotPulse;
        ctx.beginPath(); ctx.arc(200, 0, 3, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      
      // Cannon base (circle)
      ctx.shadowColor = NEON.orange;
      ctx.shadowBlur = cannonFlashing ? 30 : 12;
      ctx.fillStyle = '#1a1a2e';
      ctx.strokeStyle = cannonFlashing ? NEON.yellow : NEON.orange;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.shadowBlur = 0;
      
      // Cannon barrel
      const barrelGrad = linGrad(ctx, 0, -3, 30, -3);
      if (barrelGrad) {
        barrelGrad.addColorStop(0, '#2a2a4e');
        barrelGrad.addColorStop(0.5, cannonFlashing ? NEON.orange : '#3a3a5e');
        barrelGrad.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = barrelGrad;
      } else {
        ctx.fillStyle = '#2a2a4e';
      }
      ctx.beginPath();
      ctx.roundRect(0, -5, 28, 10, 2);
      ctx.fill();
      ctx.strokeStyle = cannonFlashing ? NEON.yellow : NEON.orange;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      // Barrel details (rivets)
      ctx.fillStyle = cannonFlashing ? NEON.yellow : `${NEON.orange}88`;
      ctx.beginPath(); ctx.arc(8, -3, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(8, 3, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(18, -3, 1.5, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(18, 3, 1.5, 0, Math.PI * 2); ctx.fill();
      
      // Muzzle tip
      ctx.fillStyle = cannonFlashing ? '#fff' : NEON.orange;
      ctx.shadowColor = cannonFlashing ? NEON.yellow : NEON.orange;
      ctx.shadowBlur = cannonFlashing ? 20 : 6;
      ctx.beginPath(); ctx.arc(28, 0, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      
      // Muzzle flash effect
      if (cannonFlashing) {
        const flashIntensity = 1 - (now - (cannonFlashRef.current - 400)) / 400;
        if (flashIntensity > 0) {
          ctx.globalAlpha = flashIntensity;
          // Flame burst
          const flameGrad = radGrad(ctx, 30, 0, 2, 30, 0, 25);
          if (flameGrad) {
            flameGrad.addColorStop(0, '#ffffff');
            flameGrad.addColorStop(0.3, NEON.yellow);
            flameGrad.addColorStop(0.6, NEON.orange);
            flameGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = flameGrad;
            ctx.beginPath(); ctx.arc(30, 0, 25, 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }
      
      // Base emblem
      ctx.fillStyle = cannonFlashing ? NEON.yellow : NEON.orange;
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⚡', 0, 0);
      
      ctx.restore();
      
      // Cannon label removed (no blinking tap text)

      // ── Ball trail ──
      if (g.currentBall && g.launched && fin(g.currentBall.position.x) && fin(g.currentBall.position.y)) {
        g.trail.push({ x: g.currentBall.position.x, y: g.currentBall.position.y, age: 0 });
        if (g.trail.length > 30) g.trail.shift();
      }
      for (let i = g.trail.length - 1; i >= 0; i--) {
        const pt = g.trail[i];
        pt.age++;
        if (pt.age > 30 || !fin(pt.x) || !fin(pt.y)) { g.trail.splice(i, 1); continue; }
        const a = 1 - pt.age / 30;
        const s = Math.max(0, BALL_R * a);
        const tg = radGrad(ctx, pt.x, pt.y, 0, pt.x, pt.y, s + 5);
        if (!tg) continue;
        tg.addColorStop(0, `rgba(${g.antiGravActive ? '191,0,255' : '0,128,255'}, ${a * 0.6})`);
        tg.addColorStop(0.5, `rgba(255,0,255, ${a * 0.25})`);
        tg.addColorStop(1, 'transparent');
        ctx.fillStyle = tg;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, s + 5, 0, Math.PI * 2); ctx.fill();
      }

      // ── Game particles ──
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
        if (p.life <= 0 || !fin(p.x) || !fin(p.y)) { particles.current.splice(i, 1); continue; }
        const a = p.life / 35;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = clamp(a, 0, 1);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      // ═══════════════════════════════════════
      // ── DRAW BODIES ──
      // ═══════════════════════════════════════
      const bodies = Composite.allBodies(engine.world);
      for (const body of bodies) {
        if (body.label === 'drain' || body.label === 'top_wall') continue;
        if (!fin(body.position.x) || !fin(body.position.y) || !fin(body.angle)) continue;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        // ── Ball ──
        if (body.label === 'ball') {
          const ballGlow = g.antiGravActive ? 1.5 : 1;
          const ballColor = g.antiGravActive ? NEON.purple : NEON.cyan;
          for (let r = 3; r >= 1; r--) {
            ctx.fillStyle = `rgba(${g.antiGravActive ? '191,0,255' : '0,128,255'}, ${0.04 * r * ballGlow})`;
            ctx.beginPath(); ctx.arc(0, 0, BALL_R + r * 7, 0, Math.PI * 2); ctx.fill();
          }
          const bg = radGrad(ctx, -1.5, -2.5, 0.5, 0, 0, BALL_R);
          if (bg) {
            bg.addColorStop(0, '#ffffff');
            bg.addColorStop(0.15, g.antiGravActive ? '#eeccff' : '#cceeff');
            bg.addColorStop(0.4, ballColor);
            bg.addColorStop(0.75, g.antiGravActive ? '#3a0066' : '#004466');
            bg.addColorStop(1, '#000a1a');
            ctx.shadowColor = ballColor;
            ctx.shadowBlur = 28 * ballGlow;
            ctx.fillStyle = bg;
          } else {
            ctx.fillStyle = ballColor;
            ctx.shadowColor = ballColor;
            ctx.shadowBlur = 28;
          }
          ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath(); ctx.arc(-1.5, -1.5, 2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `${ballColor}88`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(0, 0, BALL_R + 0.3, 0, Math.PI * 2); ctx.stroke();

        // ── Bumpers ──
        } else if (body.label.startsWith('bumper_')) {
          const idx = parseInt(body.label.split('_')[1]);
          const flash = g.bumperFlash.has(body.label) && now < (g.bumperFlash.get(body.label) || 0);
          const neonCol = flash ? NEON.white : [NEON.cyan, NEON.pink, NEON.green, NEON.purple][idx];
          const bg = radGrad(ctx, 0, -1.5, 1.5, 0, 1.5, BUMPER_R);
          if (bg) {
            bg.addColorStop(0, flash ? '#fff' : neonCol);
            bg.addColorStop(0.5, flash ? neonCol : `${neonCol}88`);
            bg.addColorStop(1, BG_COLOR);
            ctx.fillStyle = bg;
          } else {
            ctx.fillStyle = neonCol;
          }
          ctx.shadowColor = neonCol;
          ctx.shadowBlur = flash ? 40 : 18;
          ctx.beginPath(); ctx.arc(0, 0, BUMPER_R, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = neonCol;
          ctx.lineWidth = 2.5;
          ctx.beginPath(); ctx.arc(0, 0, BUMPER_R, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = `${neonCol}55`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(0, 0, BUMPER_R - 5, 0, Math.PI * 2); ctx.stroke();
          const pulseR = BUMPER_R + 3 + Math.sin(t * 4 + idx) * 2;
          ctx.globalAlpha = 0.2 + Math.sin(t * 3 + idx * 2) * 0.1;
          ctx.strokeStyle = neonCol;
          ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.arc(0, 0, pulseR, 0, Math.PI * 2); ctx.stroke();
          ctx.globalAlpha = 1;
          ctx.fillStyle = flash ? '#fff' : neonCol;
          ctx.shadowColor = neonCol;
          ctx.shadowBlur = flash ? 18 : 8;
          ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          if (flash) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('100', 0, -BUMPER_R - 5);
          }

        // ── Portal hole ──
        } else if (body.label === 'portal_hole') {
          const pulseP = 10 + Math.sin(t * 5) * 2;
          ctx.shadowColor = NEON.purple;
          ctx.shadowBlur = 20;
          ctx.strokeStyle = NEON.purple;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, pulseP, 0, Math.PI * 2); ctx.stroke();
          ctx.shadowBlur = 10;
          ctx.strokeStyle = `${NEON.cyan}aa`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(0, 0, pulseP - 4, t * 3, t * 3 + Math.PI * 1.5); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#0b0f1a';
          ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = NEON.purple;
          ctx.globalAlpha = 0.6 + Math.sin(t * 6) * 0.3;
          ctx.beginPath(); ctx.arc(0, 0, 2, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;

        // ── Flippers ──
        } else if (body.label.includes('Flipper')) {
          const isTop = body.label.startsWith('top');
          const isLeft = body.label.includes('Left');
          const up = isLeft ? g.leftUp : g.rightUp;
          const fw = isTop ? MINI_FW : FW;
          const fh = isTop ? MINI_FH : FH;
          const col = isLeft ? NEON.cyan : NEON.pink;
          const fg = linGrad(ctx, -fw / 2, -fh / 2, fw / 2, fh / 2);
          if (fg) {
            fg.addColorStop(0, up ? col : `${col}55`);
            fg.addColorStop(0.5, up ? `${col}cc` : `${col}33`);
            fg.addColorStop(1, up ? col : `${col}22`);
            ctx.fillStyle = fg;
          } else {
            ctx.fillStyle = up ? col : `${col}55`;
          }
          ctx.shadowColor = col;
          ctx.shadowBlur = up ? 25 : 10;
          ctx.beginPath(); ctx.roundRect(-fw / 2, -fh / 2, fw, fh, isTop ? 3 : 5); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255,255,255,${up ? 0.35 : 0.08})`;
          ctx.beginPath(); ctx.roundRect(-fw / 2 + 2, -fh / 2 + 1, fw - 4, 2, 2); ctx.fill();
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.roundRect(-fw / 2, -fh / 2, fw, fh, isTop ? 3 : 5); ctx.stroke();
          const px = isLeft ? -fw / 2 + (isTop ? 4 : 6) : fw / 2 - (isTop ? 4 : 6);
          ctx.fillStyle = up ? '#fff' : 'rgba(255,255,255,0.35)';
          ctx.beginPath(); ctx.arc(px, 0, isTop ? 1.5 : 2.5, 0, Math.PI * 2); ctx.fill();

        // ── Magnet bumper ──
        } else if (body.label === 'magnet_bumper') {
          const mFlash = g.magnetActive;
          ctx.shadowColor = NEON.purple;
          ctx.shadowBlur = mFlash ? 30 : 12;
          const mg = radGrad(ctx, 0, 0, 0, 0, 0, 14);
          if (mg) {
            mg.addColorStop(0, mFlash ? '#fff' : NEON.purple);
            mg.addColorStop(0.5, `${NEON.purple}88`);
            mg.addColorStop(1, BG_COLOR);
            ctx.fillStyle = mg;
          } else {
            ctx.fillStyle = NEON.purple;
          }
          ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = NEON.purple;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.stroke();
          for (let r = 0; r < 3; r++) {
            const rr = 18 + r * 6 + Math.sin(t * 3 + r) * 2;
            ctx.globalAlpha = 0.1 - r * 0.03;
            ctx.strokeStyle = NEON.purple;
            ctx.lineWidth = 0.5;
            ctx.beginPath(); ctx.arc(0, 0, rr, 0, Math.PI * 2); ctx.stroke();
          }
          ctx.globalAlpha = 1;
          ctx.fillStyle = mFlash ? '#fff' : NEON.purple;
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('⚡', 0, 1);

        // ── Rail ramp ──
        } else if (body.label === 'rail_ramp') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.strokeStyle = NEON.green;
          ctx.shadowColor = NEON.green;
          ctx.shadowBlur = 10;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let vi = 1; vi < verts.length; vi++) ctx.lineTo(verts[vi].x, verts[vi].y);
          ctx.closePath(); ctx.stroke();
          ctx.shadowBlur = 0;
          for (let d = 0; d < 5; d++) {
            const dt = ((t * 2 + d * 0.2) % 1);
            const dx = verts[0].x + (verts[1].x - verts[0].x) * dt;
            const dy = verts[0].y + (verts[1].y - verts[0].y) * dt;
            ctx.fillStyle = NEON.green;
            ctx.globalAlpha = 0.6;
            ctx.beginPath(); ctx.arc(dx, dy, 1.5, 0, Math.PI * 2); ctx.fill();
          }
          ctx.globalAlpha = 1;

        // ── Walls ──
        } else if (body.label === 'wall') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          if (verts.length < 2) { ctx.restore(); continue; }
          ctx.fillStyle = '#080c18';
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let vi = 1; vi < verts.length; vi++) ctx.lineTo(verts[vi].x, verts[vi].y);
          ctx.closePath(); ctx.fill();
          ctx.shadowColor = NEON.cyan;
          ctx.shadowBlur = 10;
          ctx.strokeStyle = `rgba(0, 255, 255, 0.35)`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `rgba(255, 0, 255, 0.12)`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          const wallLen = Math.sqrt((verts[1].x - verts[0].x) ** 2 + (verts[1].y - verts[0].y) ** 2);
          if (wallLen > 20) {
            const dotCount = Math.floor(wallLen / 10);
            ctx.fillStyle = NEON.cyan;
            ctx.globalAlpha = 0.5;
            for (let d = 0; d < dotCount; d++) {
              const prog = ((d / dotCount) + t * 0.3) % 1;
              const dx = verts[0].x + (verts[1].x - verts[0].x) * prog;
              const dy = verts[0].y + (verts[1].y - verts[0].y) * prog;
              ctx.beginPath(); ctx.arc(dx, dy, 0.8, 0, Math.PI * 2); ctx.fill();
            }
            ctx.globalAlpha = 1;
          }

        // ── Slingshots ──
        } else if (body.label === 'slingshot') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.fillStyle = `${NEON.yellow}44`;
          ctx.shadowColor = NEON.yellow;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let vi = 1; vi < verts.length; vi++) ctx.lineTo(verts[vi].x, verts[vi].y);
          ctx.closePath(); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = NEON.yellow; ctx.lineWidth = 1.5; ctx.stroke();

        // ── Skill lane sensors ──
        } else if (body.label.startsWith('skill_lane_')) {
          const idx = parseInt(body.label.split('_')[2]);
          const colors = [NEON.cyan, NEON.pink, NEON.green];
          const col = colors[idx];
          ctx.fillStyle = g.skillShot ? `${col}66` : `${col}22`;
          ctx.shadowColor = col;
          ctx.shadowBlur = g.skillShot ? 12 : 4;
          ctx.beginPath(); ctx.roundRect(-7, -12, 14, 24, 3); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = g.skillShot ? col : `${col}44`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(-7, -12, 14, 24, 3); ctx.stroke();
          ctx.fillStyle = g.skillShot ? col : `${col}88`;
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(['I', 'II', 'III'][idx], 0, 1);

        // ── Combo targets ──
        } else if (body.label.startsWith('combo_target_')) {
          const idx = parseInt(body.label.split('_')[2]);
          const hit = g.comboTargets[idx];
          if (hit) {
            ctx.shadowColor = NEON.orange; ctx.shadowBlur = 16;
            ctx.fillStyle = NEON.orange;
          } else {
            ctx.fillStyle = `${NEON.orange}33`;
          }
          ctx.beginPath(); ctx.roundRect(-4, -11, 8, 22, 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = hit ? NEON.orange : `${NEON.orange}55`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(-4, -11, 8, 22, 2); ctx.stroke();

        // ── CYBER lane sensors ──
        } else if (body.label.startsWith('cyber_')) {
          const idx = parseInt(body.label.split('_')[1]);
          const lit = g.cyberLetters[idx];
          const letterColor = [NEON.cyan, NEON.pink, NEON.green, NEON.yellow, NEON.purple][idx];
          if (lit) {
            ctx.shadowColor = letterColor; ctx.shadowBlur = 22;
            ctx.fillStyle = letterColor;
          } else {
            ctx.fillStyle = `${letterColor}22`;
          }
          ctx.beginPath(); ctx.roundRect(-7, -10, 14, 20, 2); ctx.fill();
          ctx.shadowBlur = 0;
          if (!lit) {
            ctx.strokeStyle = `${letterColor}44`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.roundRect(-7, -10, 14, 20, 2); ctx.stroke();
          }
          ctx.fillStyle = lit ? '#000' : `${letterColor}88`;
          ctx.font = `bold ${lit ? 11 : 9}px monospace`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('CYBER'[idx], 0, 1);

        // ── Demon drop targets ──
        } else if (body.label.startsWith('demon_')) {
          const side = body.label.includes('_l_') ? 'l' : 'r';
          const idx = parseInt(body.label.split('_')[2]);
          const hit = side === 'l' ? g.demonTargetsL[idx] : g.demonTargetsR[idx];
          if (hit) {
            ctx.shadowColor = NEON.red; ctx.shadowBlur = 14;
            ctx.fillStyle = NEON.red;
          } else {
            ctx.fillStyle = `${NEON.red}33`;
          }
          ctx.beginPath(); ctx.roundRect(-5, -10, 10, 20, 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = hit ? NEON.red : `${NEON.red}55`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(-5, -10, 10, 20, 2); ctx.stroke();

        // ── Reactor core ──
        } else if (body.label === 'reactor_core') {
          const charge = g.reactorCharge / 100;
          for (let r = 0; r < 3; r++) {
            const ringR = 16 + r * 9 + Math.sin(t * 4 + r * 2) * 2.5;
            const ra = g.overdriveActive ? 0.3 : 0.08 + charge * 0.12;
            const ringCol = [NEON.blue, NEON.pink, NEON.purple][r];
            ctx.strokeStyle = ringCol;
            ctx.globalAlpha = ra - r * 0.025;
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(0, 0, ringR, 0, Math.PI * 2); ctx.stroke();
          }
          ctx.globalAlpha = 1;
          const cg = radGrad(ctx, 0, 0, 0, 0, 0, 12);
          if (cg) {
            if (g.overdriveActive) {
              cg.addColorStop(0, '#ffffff');
              cg.addColorStop(0.2, NEON.blue);
              cg.addColorStop(0.5, NEON.pink);
              cg.addColorStop(0.8, NEON.purple);
              cg.addColorStop(1, 'rgba(0,0,0,0.3)');
            } else {
              cg.addColorStop(0, `rgba(0, 128, 255, ${0.25 + charge * 0.7})`);
              cg.addColorStop(0.4, `rgba(255, 0, 255, ${0.15 + charge * 0.55})`);
              cg.addColorStop(0.8, `rgba(191, 0, 255, ${0.08 + charge * 0.25})`);
              cg.addColorStop(1, 'transparent');
            }
            ctx.shadowColor = g.overdriveActive ? NEON.blue : NEON.pink;
            ctx.shadowBlur = g.overdriveActive ? 30 : 8 + charge * 12;
            ctx.fillStyle = cg;
            ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
          }
          ctx.strokeStyle = NEON.blue;
          ctx.globalAlpha = 0.4 + charge * 0.5;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * charge);
          ctx.stroke();
          ctx.globalAlpha = 1;

        // ── Spinner ──
        } else if (body.label === 'spinner') {
          ctx.strokeStyle = NEON.green; ctx.lineWidth = 2.5;
          ctx.shadowColor = NEON.green; ctx.shadowBlur = 8;
          ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.stroke();
          ctx.shadowBlur = 0;

        // ── Kickback ──
        } else if (body.label === 'kickback') {
          ctx.fillStyle = `${NEON.orange}66`;
          ctx.shadowColor = NEON.orange;
          ctx.shadowBlur = 8;
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let vi = 1; vi < verts.length; vi++) ctx.lineTo(verts[vi].x, verts[vi].y);
          ctx.closePath(); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = NEON.orange;
          ctx.lineWidth = 1;
          ctx.stroke();

        // ── Sensor defaults ──
        } else if (body.isSensor) {
          // sensors are invisible except handled above
        } else {
          // Generic body fallback
        }

        ctx.restore();
      }

      // ── Labels ──

      ctx.fillStyle = `${NEON.orange}88`; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
      ctx.fillText('▼ COMBO TARGETS ▼', TW / 2, ctY + 22);

      ctx.fillStyle = NEON.blue; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
      ctx.globalAlpha = 0.55;
      ctx.fillText('REACTOR CORE', bCXd, bCYd + 45);
      ctx.globalAlpha = 1;

      ctx.fillStyle = `${NEON.red}88`; ctx.font = 'bold 6px monospace';
      ctx.fillText('DEMON', 82, dtY + 22);
      ctx.fillText('DEMON', TW - 82, dtY + 22);

      ctx.fillStyle = `${NEON.cyan}66`; ctx.font = 'bold 7px monospace';
      ctx.fillText('▼ C · Y · B · E · R ▼', TW / 2, cyberY + 22);

      // ── HUD overlays ──
      if (g.started && !g.gameOver) {
        ctx.save();
        ctx.shadowColor = NEON.cyan;
        ctx.shadowBlur = 10;
        ctx.fillStyle = NEON.cyan;
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(g.score.toLocaleString(), TW / 2, 22);
        ctx.shadowBlur = 0;
        if (g.combo > 1) {
          ctx.fillStyle = NEON.pink;
          ctx.shadowColor = NEON.pink;
          ctx.shadowBlur = 6;
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${Math.min(g.combo, 8)}x`, 14, 20);
          ctx.shadowBlur = 0;
        }
        ctx.textAlign = 'right';
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i < g.balls ? NEON.cyan : 'rgba(255,255,255,0.15)';
          if (i < g.balls) { ctx.shadowColor = NEON.cyan; ctx.shadowBlur = 6; }
          ctx.beginPath(); ctx.arc(TW - 18 - i * 14, 16, 4, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
        }
        ctx.textAlign = 'right';
        ctx.fillStyle = g.antiGravActive ? NEON.purple : `${NEON.purple}88`;
        ctx.font = 'bold 7px monospace';
        ctx.fillText(g.antiGravActive ? 'ANTI-GRAV!' : `AG: ${g.antiGravMeter}/10`, TW - 14, 34);
        const agBarW = 50;
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.fillRect(TW - 14 - agBarW, 37, agBarW, 4);
        const agFill = g.antiGravActive ? 1 : g.antiGravMeter / 10;
        ctx.fillStyle = g.antiGravActive ? NEON.purple : `${NEON.purple}cc`;
        ctx.shadowColor = NEON.purple;
        ctx.shadowBlur = g.antiGravActive ? 8 : 0;
        ctx.fillRect(TW - 14 - agBarW, 37, agBarW * agFill, 4);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      if (g.tilted) {
        ctx.fillStyle = 'rgba(255,0,0,0.1)'; ctx.fillRect(0, 0, TW, TH);
        ctx.shadowColor = NEON.red; ctx.shadowBlur = 30;
        ctx.fillStyle = NEON.red; ctx.font = 'bold 40px monospace'; ctx.textAlign = 'center';
        ctx.fillText('TILT', TW / 2, TH / 2); ctx.shadowBlur = 0;
      }

      if (message && !g.gameOver && g.started) {
        const mg = linGrad(ctx, TW / 2 - 130, 0, TW / 2 + 130, 0);
        if (mg) {
          mg.addColorStop(0, 'rgba(0,0,0,0)');
          mg.addColorStop(0.12, 'rgba(0,0,0,0.9)');
          mg.addColorStop(0.88, 'rgba(0,0,0,0.9)');
          mg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = mg;
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.9)';
        }
        ctx.fillRect(TW / 2 - 130, TH / 2 - 20, 260, 40);
        ctx.strokeStyle = NEON.blue; ctx.shadowColor = NEON.blue; ctx.shadowBlur = 8; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(TW / 2 - 100, TH / 2 - 17); ctx.lineTo(TW / 2 + 100, TH / 2 - 17); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(TW / 2 - 100, TH / 2 + 17); ctx.lineTo(TW / 2 + 100, TH / 2 + 17); ctx.stroke();
        ctx.shadowBlur = 8; ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(message, TW / 2, TH / 2); ctx.shadowBlur = 0;
      }

      // ── START SCREEN ──
      if (!g.started) {
        ctx.fillStyle = 'rgba(11, 15, 26, 0.92)'; ctx.fillRect(0, 0, TW, TH);
        ctx.globalAlpha = 0.03;
        for (let y = 0; y < TH; y += 2) { ctx.fillStyle = NEON.blue; ctx.fillRect(0, y, TW, 1); }
        ctx.globalAlpha = 1;
        ctx.shadowColor = NEON.blue; ctx.shadowBlur = 40;
        ctx.fillStyle = NEON.blue; ctx.font = 'bold 38px monospace'; ctx.textAlign = 'center';
        ctx.fillText('CYBER', TW / 2, TH / 2 - 80);
        ctx.shadowColor = NEON.pink; ctx.shadowBlur = 40;
        ctx.fillStyle = NEON.pink; ctx.font = 'bold 38px monospace';
        ctx.fillText('PINBALL', TW / 2, TH / 2 - 40);
        ctx.shadowBlur = 0;
        ctx.fillStyle = `${NEON.purple}cc`; ctx.font = '10px monospace';
        ctx.fillText('NEON CYBERPUNK EDITION', TW / 2, TH / 2 - 15);
        const startPulse = 0.4 + Math.sin(t * 3) * 0.4;
        ctx.globalAlpha = startPulse;
        ctx.shadowColor = NEON.green; ctx.shadowBlur = 20;
        ctx.fillStyle = NEON.green; ctx.font = 'bold 16px monospace';
        ctx.fillText('TAP TO LAUNCH', TW / 2, TH / 2 + 30);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.fillStyle = `${NEON.cyan}88`; ctx.font = '8px monospace';
        ctx.fillText('Click/Tap to Launch  |  ←→ Flippers', TW / 2, TH / 2 + 65);
        ctx.fillText('Mobile: Tap Canvas = Launch  |  Buttons = Flippers', TW / 2, TH / 2 + 80);
        if (g.highScore > 0) {
          ctx.fillStyle = NEON.yellow;
          ctx.font = 'bold 10px monospace';
          ctx.fillText(`HIGH SCORE: ${g.highScore.toLocaleString()}`, TW / 2, TH / 2 + 110);
        }
      }

      // ── GAME OVER SCREEN ──
      if (g.gameOver) {
        ctx.fillStyle = 'rgba(11, 15, 26, 0.94)'; ctx.fillRect(0, 0, TW, TH);
        ctx.globalAlpha = 0.03;
        for (let y = 0; y < TH; y += 2) { ctx.fillStyle = NEON.blue; ctx.fillRect(0, y, TW, 1); }
        ctx.globalAlpha = 1;
        ctx.shadowColor = NEON.red; ctx.shadowBlur = 40;
        ctx.fillStyle = NEON.red; ctx.font = 'bold 36px monospace'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', TW / 2, TH / 2 - 60);
        ctx.shadowBlur = 0;
        ctx.shadowColor = NEON.cyan; ctx.shadowBlur = 20;
        ctx.fillStyle = NEON.cyan; ctx.font = 'bold 14px monospace';
        ctx.fillText('FINAL SCORE', TW / 2, TH / 2 - 25);
        ctx.fillStyle = NEON.pink; ctx.font = 'bold 28px monospace';
        ctx.shadowColor = NEON.pink; ctx.shadowBlur = 25;
        ctx.fillText(g.score.toLocaleString(), TW / 2, TH / 2 + 5);
        ctx.shadowBlur = 0;
        ctx.fillStyle = NEON.yellow; ctx.font = 'bold 11px monospace';
        ctx.fillText(`HIGH SCORE: ${g.highScore.toLocaleString()}`, TW / 2, TH / 2 + 35);
        if (g.score >= g.highScore && g.score > 0) {
          const newPulse = 0.5 + Math.sin(t * 5) * 0.5;
          ctx.globalAlpha = newPulse;
          ctx.shadowColor = NEON.yellow; ctx.shadowBlur = 15;
          ctx.fillStyle = NEON.yellow; ctx.font = 'bold 14px monospace';
          ctx.fillText('★ NEW HIGH SCORE! ★', TW / 2, TH / 2 + 55);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
        if (g.maxCombo > 1) {
          ctx.fillStyle = `${NEON.purple}aa`; ctx.font = '9px monospace';
          ctx.fillText(`MAX COMBO: ${g.maxCombo}x`, TW / 2, TH / 2 + 75);
        }
        // CCC earned display
        if (cccEarned && cccEarned > 0) {
          ctx.fillStyle = NEON.green; ctx.font = 'bold 12px monospace';
          ctx.shadowColor = NEON.green; ctx.shadowBlur = 10;
          ctx.fillText(`+${cccEarned} CCC EARNED!`, TW / 2, TH / 2 + 92);
          ctx.shadowBlur = 0;
        }
        const rPulse = 0.4 + Math.sin(t * 3) * 0.35;
        ctx.globalAlpha = rPulse;
        ctx.shadowColor = NEON.green; ctx.shadowBlur = 15;
        ctx.fillStyle = NEON.green; ctx.font = 'bold 13px monospace';
        ctx.fillText('TAP TO PLAY AGAIN', TW / 2, TH / 2 + 115);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }

      // ── Bottom title ──
      if (g.started && !g.gameOver) {
        ctx.save();
        ctx.globalAlpha = 0.12 + Math.sin(t * 0.8) * 0.04;
        ctx.shadowColor = NEON.blue;
        ctx.shadowBlur = 15;
        ctx.fillStyle = NEON.blue;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CYBER PINBALL', TW / 2, TH - 12);
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Demon mode banner
      if (g.demonMode) {
        const da = 0.55 + Math.sin(t * 7) * 0.35;
        ctx.fillStyle = `rgba(255, 0, 64, ${da * 0.15})`;
        ctx.fillRect(0, 0, TW, 16);
        ctx.shadowColor = NEON.red; ctx.shadowBlur = 6;
        ctx.fillStyle = NEON.red;
        ctx.globalAlpha = da;
        ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('👹 DEMON MODE 3x 👹', TW / 2, 11);
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
      if (g.overdriveActive) {
        const oa = 0.55 + Math.sin(t * 8) * 0.3;
        ctx.fillStyle = `rgba(191, 0, 255, ${oa * 0.12})`;
        ctx.fillRect(0, g.demonMode ? 16 : 0, TW, 16);
        ctx.shadowColor = NEON.purple; ctx.shadowBlur = 6;
        ctx.fillStyle = NEON.purple;
        ctx.globalAlpha = oa;
        ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('⚡ OVERDRIVE 2x ⚡', TW / 2, (g.demonMode ? 16 : 0) + 11);
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }
      if (g.antiGravActive) {
        const aa = 0.6 + Math.sin(t * 6) * 0.35;
        const bannerY = (g.demonMode ? 16 : 0) + (g.overdriveActive ? 16 : 0);
        ctx.fillStyle = `rgba(191, 0, 255, ${aa * 0.15})`;
        ctx.fillRect(0, bannerY, TW, 16);
        ctx.shadowColor = NEON.purple; ctx.shadowBlur = 8;
        ctx.fillStyle = NEON.purple;
        ctx.globalAlpha = aa;
        ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('🌀 ANTI-GRAVITY x2 🌀', TW / 2, bannerY + 11);
        ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      }

      ctx.restore(); // shake

      animRef.current = requestAnimationFrame(renderLoop);
    };

    animRef.current = requestAnimationFrame(renderLoop);

    // ═══════════════════════════════════════
    // ── KEYBOARD ──
    // ═══════════════════════════════════════
    const onKeyDown = (e: KeyboardEvent) => {
      const g = G.current;
      if (e.key === 'ArrowLeft' || e.key === 'z' || e.key === 'Z') { e.preventDefault(); g.leftUp = true; }
      if (e.key === 'ArrowRight' || e.key === '/' || e.key === 'm' || e.key === 'M') { e.preventDefault(); g.rightUp = true; }
      if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (g.gameOver) {
          g.score = 0; g.balls = 3; g.gameOver = false; g.combo = 0; g.maxCombo = 0; g.totalHits = 0;
          g.cyberLetters.fill(false); g.cyberComplete = 0;
          g.demonTargetsL.fill(false); g.demonTargetsR.fill(false);
          g.demonMode = false; g.reactorCharge = 0; g.overdriveActive = false;
          g.lockedBalls = 0; g.multiballActive = false;
          g.comboTargets.fill(false); g.comboTargetComplete = 0;
          g.antiGravActive = false; g.antiGravMeter = 0;
          g.trail = []; g.screenPulse = 0;
          if (engineRef.current) engineRef.current.gravity.y = 1.3;
          setScore(0); setBalls(3); setGameOver(false); setCombo(0);
          setCyberLetters([false, false, false, false, false]);
          setDemonMode(false); setReactorCharge(0); setOverdrive(false); setLockedBalls(0);
          setAntiGrav(false); setAntiGravMeter(0);
          scoreSubmittedRef.current = false;
          setCccEarned(null);
          spawnBall();
          return;
        }
      }
      if (e.key === 't' || e.key === 'T') {
        if (g.tilted || !g.currentBall) return;
        g.tiltWarnings++;
        setTiltW(g.tiltWarnings);
        if (g.tiltWarnings >= 3) {
          g.tilted = true;
          showMsg('TILT! SCORE LOCKED');
          g.leftUp = false; g.rightUp = false;
        } else {
          showMsg(`TILT WARNING ${g.tiltWarnings}/3`);
          if (g.currentBall && fin(g.currentBall.position.x)) {
            Body.applyForce(g.currentBall, g.currentBall.position, { x: (Math.random() - 0.5) * 0.003, y: -0.002 });
          }
        }
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      const g = G.current;
      if (e.key === 'ArrowLeft' || e.key === 'z' || e.key === 'Z') g.leftUp = false;
      if (e.key === 'ArrowRight' || e.key === '/' || e.key === 'm' || e.key === 'M') g.rightUp = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      cancelAnimationFrame(animRef.current);
      if (runnerRef.current) Runner.stop(runnerRef.current);
      Engine.clear(engine);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Touch / click handlers ──
  const flipperTouch = useCallback((side: 'left' | 'right', down: boolean) => {
    if (side === 'left') G.current.leftUp = down;
    else G.current.rightUp = down;
  }, []);

  const launchBall = useCallback(() => {
    const g = G.current;
    if (g.gameOver) {
      // Restart game
      g.score = 0; g.balls = 3; g.gameOver = false; g.combo = 0; g.maxCombo = 0; g.totalHits = 0;
      g.cyberLetters.fill(false); g.cyberComplete = 0;
      g.demonTargetsL.fill(false); g.demonTargetsR.fill(false);
      g.demonMode = false; g.reactorCharge = 0; g.overdriveActive = false;
      g.lockedBalls = 0; g.multiballActive = false;
      g.comboTargets.fill(false); g.comboTargetComplete = 0;
      g.antiGravActive = false; g.antiGravMeter = 0;
      g.trail = []; g.screenPulse = 0;
      if (engineRef.current) engineRef.current.gravity.y = 1.3;
      setScore(0); setBalls(3); setGameOver(false); setCombo(0);
      setCyberLetters([false, false, false, false, false]);
      setDemonMode(false); setReactorCharge(0); setOverdrive(false); setLockedBalls(0);
      setAntiGrav(false); setAntiGravMeter(0);
      scoreSubmittedRef.current = false;
      setCccEarned(null);
      const engine = engineRef.current;
      if (engine) {
        const oldBalls = Composite.allBodies(engine.world).filter(b => b.label === 'ball');
        oldBalls.forEach(b => { try { Composite.remove(engine.world, b); } catch {} });
        g.currentBall = null;
        g.launched = false;
        const ball = Bodies.circle(CANNON_MUZZLE_X, CANNON_MUZZLE_Y, BALL_R, {
          ...BALL_OPTS, isStatic: true,
        });
        Composite.add(engine.world, ball);
        g.currentBall = ball;
      }
      return;
    }
    if (g.launched) return;
    if (!g.started) {
      g.started = true;
      setStarted(true);
    }

    const engine = engineRef.current;
    if (!engine) return;

    const worldBall = Composite.allBodies(engine.world).find((b) => b.label === 'ball') as Matter.Body | undefined;
    if (!g.currentBall && worldBall) g.currentBall = worldBall;

    if (!g.currentBall) {
      const emergencyBall = Bodies.circle(CANNON_MUZZLE_X, CANNON_MUZZLE_Y, BALL_R, {
        ...BALL_OPTS,
      });
      Composite.add(engine.world, emergencyBall);
      g.currentBall = emergencyBall;
    }
    if (!g.currentBall || !fin(g.currentBall.position.x) || !fin(g.currentBall.position.y)) return;

    Body.setStatic(g.currentBall, false);
    Body.setPosition(g.currentBall, { x: CANNON_MUZZLE_X, y: CANNON_MUZZLE_Y });
    // Fire in aimed direction
    const aimAngle = cannonAngleRef.current;
    const launchSpeed = 10;
    Body.setVelocity(g.currentBall, {
      x: Math.cos(aimAngle) * launchSpeed,
      y: Math.sin(aimAngle) * launchSpeed,
    });
    g.launched = true;
    cannonFlashRef.current = Date.now() + 400;
    showMsg('🔥 CANNON FIRE!');
    g.shake.power = 6;
    g.screenPulse = 0.5;
    const muzzleTipX = CANNON_X + Math.cos(aimAngle) * 28;
    const muzzleTipY = CANNON_Y + Math.sin(aimAngle) * 28;
    spawnParticles(muzzleTipX, muzzleTipY, 20, NEON.orange, 10);
    spawnParticles(muzzleTipX, muzzleTipY, 10, NEON.yellow, 8);
    spawnParticles(CANNON_MUZZLE_X, CANNON_MUZZLE_Y, 8, NEON.cyan, 6);
  }, [showMsg, spawnParticles]);

  // Mouse/touch aim handler — updates cannon angle based on pointer position
  const handleCanvasPointerMove = useCallback((clientX: number, clientY: number) => {
    const g = G.current;
    if (g.launched && !g.gameOver) return; // only aim when ball not launched
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = TW / rect.width;
    const scaleY = TH / rect.height;
    const mx = (clientX - rect.left) * scaleX;
    const my = (clientY - rect.top) * scaleY;
    const dx = mx - CANNON_X;
    const dy = my - CANNON_Y;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      cannonAngleRef.current = Math.atan2(dy, dx);
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    handleCanvasPointerMove(e.clientX, e.clientY);
  }, [handleCanvasPointerMove]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleCanvasPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, [handleCanvasPointerMove]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Canvas */}
      <div
        className="relative rounded-xl overflow-hidden shadow-[0_0_60px_rgba(0,128,255,0.2)]"
        style={{ border: '2px solid rgba(0, 128, 255, 0.3)' }}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onClick={launchBall}
        role="button"
        tabIndex={0}
      >
        <canvas ref={canvasRef} className="block cursor-crosshair" style={{ width: TW, height: TH }} />
      </div>

      {/* Mobile controls */}
      <div className="w-full max-w-[420px] grid grid-cols-3 gap-2 md:hidden touch-none select-none">
        <button className="font-bold py-5 rounded-xl select-none text-sm touch-none"
          style={{ background: 'rgba(0,128,255,0.15)', border: '1px solid rgba(0,128,255,0.4)', color: NEON.cyan }}
          onTouchStart={(e) => { e.preventDefault(); flipperTouch('left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); flipperTouch('left', false); }}
          onTouchCancel={(e) => { e.preventDefault(); flipperTouch('left', false); }}
          onMouseDown={() => flipperTouch('left', true)}
          onMouseUp={() => flipperTouch('left', false)}
          onMouseLeave={() => flipperTouch('left', false)}>◀ LEFT</button>
        <button
          type="button"
          className="rounded-xl touch-none select-none font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed"
          style={{
            background: G.current.launched ? 'rgba(255,255,255,0.05)' : 'rgba(255,102,0,0.2)',
            border: '1px solid rgba(255,102,0,0.5)',
            color: NEON.orange,
          }}
          onClick={launchBall}
          disabled={G.current.launched || gameOver}
        >
          {G.current.launched ? '🎯' : '💥 FIRE!'}
        </button>
        <button className="font-bold py-5 rounded-xl select-none text-sm touch-none"
          style={{ background: 'rgba(255,0,255,0.15)', border: '1px solid rgba(255,0,255,0.4)', color: NEON.pink }}
          onTouchStart={(e) => { e.preventDefault(); flipperTouch('right', true); }}
          onTouchEnd={(e) => { e.preventDefault(); flipperTouch('right', false); }}
          onTouchCancel={(e) => { e.preventDefault(); flipperTouch('right', false); }}
          onMouseDown={() => flipperTouch('right', true)}
          onMouseUp={() => flipperTouch('right', false)}
          onMouseLeave={() => flipperTouch('right', false)}>RIGHT ▶</button>
      </div>

      {/* Desktop hints */}
      <div className="hidden md:flex gap-5 text-xs text-muted-foreground">
        <span><kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">←</kbd>/<kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">Z</kbd> Left</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">→</kbd>/<kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">M</kbd> Right</span>
        <span>🖱️ Click to Fire Cannon</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">T</kbd> Nudge</span>
      </div>

      {/* Leaderboard toggle */}
      <div className="flex gap-2">
        <Button
          onClick={() => { setShowLeaderboard(!showLeaderboard); if (!showLeaderboard) fetchLeaderboard(); }}
          variant="outline"
          className="border-amber-500/50 gap-2 text-xs"
        >
          <Trophy className="w-4 h-4" /> Leaderboard
        </Button>
      </div>

      {/* Leaderboard panel */}
      {showLeaderboard && (
        <div className="w-full max-w-[420px] bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 font-mono">
          <h3 className="text-center text-amber-400 text-sm font-bold mb-3">🏆 TOP PINBALL PLAYERS</h3>
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
                } ${entry.user_id === walletAddress ? 'ring-1 ring-cyan-400/50' : ''}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-6 text-center font-bold ${
                      i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-orange-400' : 'text-muted-foreground'
                    }`}>
                      {i < 3 ? ['🥇','🥈','🥉'][i] : `#${i + 1}`}
                    </span>
                    <span className={`${entry.user_id === walletAddress ? 'text-cyan-400' : 'text-foreground'}`}>
                      {entry.user_id === walletAddress ? 'You' : maskWallet(entry.user_id)}
                    </span>
                  </div>
                  <span className="text-amber-400 font-bold">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
          {!walletAddress && (
            <p className="text-center text-xs text-muted-foreground mt-2">Connect wallet to submit scores</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CyberPinball;
