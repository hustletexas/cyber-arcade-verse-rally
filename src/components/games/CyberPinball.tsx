import React, { useRef, useEffect, useState, useCallback } from 'react';
import Matter from 'matter-js';

const { Engine, Runner, Bodies, Body, Composite, Events, Constraint, Vector } = Matter;

// ═══════════════════════════════════════════════════════
// CYBER CITY PINBALL — Full Neon Theme
// ═══════════════════════════════════════════════════════

// ── Safe rendering helpers ──
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
const WALL = 8;
const BUMPER_R = 15;
const FW = 62;
const FH = 11;
const PLUNGER_X = TW - 16;

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
};

interface CyberPinballProps {
  onScoreUpdate?: (score: number) => void;
  onBallLost?: (ballsLeft: number) => void;
  onGameOver?: (finalScore: number) => void;
}

type Particle = { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number };

export const CyberPinball: React.FC<CyberPinballProps> = ({ onScoreUpdate, onBallLost, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const animRef = useRef(0);
  const frame = useRef(0);
  const particles = useRef<Particle[]>([]);

  // ── Game state ref ──
  const G = useRef({
    score: 0, balls: 3, gameOver: false, launched: false,
    currentBall: null as Matter.Body | null,
    leftFlipper: null as Matter.Body | null,
    rightFlipper: null as Matter.Body | null,
    leftUp: false, rightUp: false,
    combo: 0, comboTimer: 0, maxCombo: 0,
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
    buildingsLit: 0,
  });

  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(3);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [demonMode, setDemonMode] = useState(false);
  const [overdrive, setOverdrive] = useState(false);
  const [reactorCharge, setReactorCharge] = useState(0);
  const [cyberLetters, setCyberLetters] = useState([false, false, false, false, false]);
  const [lockedBalls, setLockedBalls] = useState(0);
  const [tiltW, setTiltW] = useState(0);

  const showMsg = useCallback((msg: string, dur = 2000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), dur);
  }, []);

  const addScore = useCallback((pts: number) => {
    const g = G.current;
    if (g.tilted || g.gameOver) return;
    g.combo++;
    g.comboTimer = Date.now() + 3000;
    if (g.combo > g.maxCombo) g.maxCombo = g.combo;
    const mult = Math.min(g.combo, 8);
    const dm = g.demonMode ? 3 : 1;
    const od = g.overdriveActive ? 2 : 1;
    const total = Math.round(pts * mult * dm * od);
    g.score += total;
    setScore(g.score);
    setCombo(g.combo);
    onScoreUpdate?.(g.score);
  }, [onScoreUpdate]);

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

    const wallOpts = { isStatic: true, label: 'wall', restitution: 0.3 };
    const sensorOpts = (label: string) => ({ isStatic: true, isSensor: true, label });

    // ── Walls ──
    const walls = [
      Bodies.rectangle(WALL / 2, TH / 2, WALL, TH, wallOpts),
      Bodies.rectangle(TW / 2, WALL / 2, TW, WALL, wallOpts),
      Bodies.rectangle(TW / 2, TH + 20, TW, 40, { isStatic: true, label: 'drain' }),
      Bodies.rectangle(TW - WALL / 2, TH / 2 - 140, WALL, TH - 280, wallOpts),
      Bodies.rectangle(TW - WALL / 2, TH - 55, WALL, 110, wallOpts),
      Bodies.rectangle(TW - 34, TH - 190, 4, 200, { ...wallOpts, angle: 0.03 }),
      Bodies.rectangle(TW - 48, TH - 310, 45, 4, { ...wallOpts, angle: -0.32 }),
      Bodies.rectangle(30, TH - 170, 4, 130, { ...wallOpts, angle: 0.12 }),
      Bodies.rectangle(62, TH - 145, 4, 95, { ...wallOpts, angle: 0.16 }),
      Bodies.rectangle(TW - 58, TH - 170, 4, 130, { ...wallOpts, angle: -0.12 }),
      Bodies.rectangle(TW - 90, TH - 145, 4, 95, { ...wallOpts, angle: -0.16 }),
      Bodies.rectangle(20, 195, 4, 230, wallOpts),
      Bodies.rectangle(38, 78, 42, 4, { ...wallOpts, angle: -0.3 }),
      Bodies.rectangle(TW - 46, 195, 4, 230, wallOpts),
      Bodies.rectangle(TW - 60, 78, 42, 4, { ...wallOpts, angle: 0.3 }),
    ];

    // ── Flippers ──
    const lfX = TW / 2 - 52, rfX = TW / 2 + 52, fY = TH - 68;
    const lf = Bodies.rectangle(lfX, fY, FW, FH, { label: 'leftFlipper', density: 0.02, frictionAir: 0.02, chamfer: { radius: 4 } });
    const rf = Bodies.rectangle(rfX, fY, FW, FH, { label: 'rightFlipper', density: 0.02, frictionAir: 0.02, chamfer: { radius: 4 } });
    const lp = Constraint.create({ bodyA: lf, pointA: { x: -FW / 2 + 6, y: 0 }, pointB: { x: lfX - FW / 2 + 6, y: fY }, stiffness: 1, length: 0 });
    const rp = Constraint.create({ bodyA: rf, pointA: { x: FW / 2 - 6, y: 0 }, pointB: { x: rfX + FW / 2 - 6, y: fY }, stiffness: 1, length: 0 });
    G.current.leftFlipper = lf;
    G.current.rightFlipper = rf;

    // ── Slingshots ──
    const lSling = Bodies.fromVertices(82, TH - 148, [[{ x: 0, y: 0 }, { x: 30, y: 50 }, { x: -4, y: 50 }]], { isStatic: true, label: 'slingshot', restitution: 1.3 });
    const rSling = Bodies.fromVertices(TW - 108, TH - 148, [[{ x: 0, y: 0 }, { x: 4, y: 50 }, { x: -30, y: 50 }]], { isStatic: true, label: 'slingshot', restitution: 1.3 });

    // ── Bumpers ──
    const bCX = TW / 2, bCY = 225;
    const bumpers = [
      Bodies.circle(bCX, bCY - 40, BUMPER_R, { isStatic: true, label: 'bumper_0', restitution: 1.15 }),
      Bodies.circle(bCX - 36, bCY + 18, BUMPER_R, { isStatic: true, label: 'bumper_1', restitution: 1.15 }),
      Bodies.circle(bCX + 36, bCY + 18, BUMPER_R, { isStatic: true, label: 'bumper_2', restitution: 1.15 }),
      Bodies.circle(bCX - 65, bCY - 55, 10, { isStatic: true, label: 'bumper_3', restitution: 1.2 }),
      Bodies.circle(bCX + 65, bCY - 55, 10, { isStatic: true, label: 'bumper_4', restitution: 1.2 }),
    ];

    const reactorSensor = Bodies.circle(bCX, bCY, 8, sensorOpts('reactor_core'));

    // ── CYBER letter lanes ──
    const laneY = 52;
    const cyberSensors = 'CYBER'.split('').map((_, i) =>
      Bodies.rectangle(TW / 2 - 60 + i * 30, laneY, 10, 24, sensorOpts(`cyber_${i}`))
    );
    const laneGuides = [
      Bodies.rectangle(TW / 2 - 78, laneY, 3, 34, wallOpts),
      Bodies.rectangle(TW / 2 - 45, laneY, 3, 34, wallOpts),
      Bodies.rectangle(TW / 2 - 15, laneY, 3, 34, wallOpts),
      Bodies.rectangle(TW / 2 + 15, laneY, 3, 34, wallOpts),
      Bodies.rectangle(TW / 2 + 45, laneY, 3, 34, wallOpts),
      Bodies.rectangle(TW / 2 + 78, laneY, 3, 34, wallOpts),
    ];

    // ── Drop targets ──
    const dtY = 410;
    const demonTargetsL = [0, 1, 2].map(i =>
      Bodies.rectangle(60 + i * 22, dtY, 4, 20, sensorOpts(`demon_l_${i}`))
    );
    const demonTargetsR = [0, 1, 2].map(i =>
      Bodies.rectangle(TW - 104 + i * 22, dtY, 4, 20, sensorOpts(`demon_r_${i}`))
    );
    walls.push(Bodies.rectangle(82, dtY - 14, 70, 3, wallOpts));
    walls.push(Bodies.rectangle(TW - 82, dtY - 14, 70, 3, wallOpts));

    // ── Orbit sensors ──
    const orbitL = Bodies.rectangle(28, 115, 16, 8, sensorOpts('orbit_left'));
    const orbitR = Bodies.rectangle(TW - 52, 115, 16, 8, sensorOpts('orbit_right'));

    // ── Ramps ──
    const rampL = Bodies.rectangle(52, 330, 4, 160, { ...wallOpts, angle: 0.2 });
    const rampLGuide = Bodies.rectangle(76, 330, 4, 160, { ...wallOpts, angle: 0.2 });
    const rampLSensor = Bodies.rectangle(52, 250, 12, 8, sensorOpts('ramp_left'));
    const rampR = Bodies.rectangle(TW - 76, 330, 4, 160, { ...wallOpts, angle: -0.2 });
    const rampRGuide = Bodies.rectangle(TW - 100, 330, 4, 160, { ...wallOpts, angle: -0.2 });
    const rampRSensor = Bodies.rectangle(TW - 76, 250, 12, 8, sensorOpts('ramp_right'));

    const spinner = Bodies.rectangle(bCX, bCY - 78, 32, 3, sensorOpts('spinner'));
    const lockSensor = Bodies.rectangle(bCX, bCY + 60, 26, 6, sensorOpts('multiball_lock'));
    const kickback = Bodies.rectangle(14, TH - 210, 6, 30, { isStatic: true, label: 'kickback', restitution: 1.6 });

    Composite.add(engine.world, [
      ...walls, lf, rf, lp, rp,
      ...(lSling ? [lSling] : []), ...(rSling ? [rSling] : []),
      ...bumpers, reactorSensor,
      ...cyberSensors, ...laneGuides,
      ...demonTargetsL, ...demonTargetsR,
      orbitL, orbitR,
      rampL, rampLGuide, rampLSensor,
      rampR, rampRGuide, rampRSensor,
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

        for (let i = 0; i < 5; i++) {
          if (labels.includes(`bumper_${i}`)) {
            const pts = i < 3 ? 100 : 75;
            addScore(pts);
            g.bumperFlash.set(`bumper_${i}`, Date.now() + 250);
            g.shake.power = 4;
            g.lightFlash = 0.3;
            g.reactorCharge = Math.min(g.reactorCharge + 10, 100);
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
              Body.applyForce(ball, ball.position, { x: d.x * 0.008, y: d.y * 0.008 });
            }
            spawnParticles(ball.position.x, ball.position.y, 8, NEON.cyan, 5);
            g.buildingsLit = Math.min(g.buildingsLit + 1, 14);
          }
        }

        if (labels.includes('slingshot')) {
          addScore(50);
          g.shake.power = 2;
          spawnParticles(ball.position.x, ball.position.y, 4, NEON.yellow, 3);
        }

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
              showMsg(`🌆 CYBER CITY JACKPOT x${g.cyberComplete}! +${bonus.toLocaleString()}`, 3000);
              g.lightFlash = 1;
              g.shake.power = 6;
              g.buildingsLit = 14;
            }
          }
        }

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

        if (labels.includes('orbit_left') || labels.includes('orbit_right')) {
          const dir = labels.includes('orbit_left') ? 'left' : 'right';
          if (g.lastOrbitDir !== dir) { g.orbitCount++; g.lastOrbitDir = dir; }
          else { g.orbitCount = 1; g.lastOrbitDir = dir; }
          addScore(150 * g.orbitCount);
          if (g.orbitCount > 1) showMsg(`ORBIT x${g.orbitCount}!`);
        }

        if (labels.includes('ramp_left') || labels.includes('ramp_right')) {
          addScore(300);
          showMsg(labels.includes('ramp_left') ? 'DOWNTOWN RAMP!' : 'NEON HIGHWAY!');
          spawnParticles(ball.position.x, ball.position.y, 6, NEON.green, 4);
        }

        if (labels.includes('spinner')) { addScore(25); }

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
                label: 'ball', restitution: 0.5, friction: 0.01, frictionAir: 0.001, density: 0.004,
              });
              Composite.add(engine.world, extra);
              g.extraBalls.push(extra);
              Body.applyForce(extra, extra.position, { x: (Math.random() - 0.5) * 0.004, y: 0.004 });
            }
          }
        }

        if (g.skillShot && labels.includes('cyber_2')) {
          addScore(3000);
          showMsg('🎯 SKILL SHOT! +3000', 2500);
          g.skillShot = false;
          spawnParticles(ball.position.x, ball.position.y, 12, NEON.white, 7);
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
        onGameOver?.(g.score);
        showMsg('GAME OVER');
      } else {
        showMsg(`BALL LOST — ${g.balls} LEFT`);
        setTimeout(() => spawnBall(), 1000);
      }
    };

    // ── Spawn ball ──
    const spawnBall = () => {
      const g = G.current;
      if (g.currentBall || g.gameOver) return;
      const ball = Bodies.circle(PLUNGER_X, TH - 38, BALL_R, {
        label: 'ball', restitution: 0.5, friction: 0.01, frictionAir: 0.001, density: 0.004,
        isStatic: true,
      });
      Composite.add(engine.world, ball);
      g.currentBall = ball;
      g.launched = false;
      g.tilted = false;
      g.tiltWarnings = 0;
      setTiltW(0);
    };

    // ── Instant launch helper ──
    const doLaunch = () => {
      const g = G.current;
      if (!g.currentBall || g.launched || g.gameOver) return;
      if (!fin(g.currentBall.position.x) || !fin(g.currentBall.position.y)) return;
      Body.setStatic(g.currentBall, false);
      // Full power instant launch
      Body.applyForce(g.currentBall, g.currentBall.position, { x: 0, y: -0.032 });
      g.launched = true;
      g.lightFlash = 0.2;
      g.shake.power = 3;
      spawnParticles(PLUNGER_X, TH - 38, 10, NEON.cyan, 6);
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

      // ── Flipper physics ──
      if (g.leftFlipper) {
        const ta = g.leftUp ? -0.52 : 0.38;
        Body.setAngularVelocity(g.leftFlipper, (ta - g.leftFlipper.angle) * 0.35);
      }
      if (g.rightFlipper) {
        const ta = g.rightUp ? 0.52 : -0.38;
        Body.setAngularVelocity(g.rightFlipper, (ta - g.rightFlipper.angle) * 0.35);
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

      // ── NEON BLACK BACKGROUND ──
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, TW, TH);

      // ── Neon grid ──
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = NEON.cyan;
      ctx.lineWidth = 0.5;
      for (let y = 0; y < TH; y += 24) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TW, y); ctx.stroke();
      }
      for (let x = 0; x < TW; x += 24) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, TH); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // ── NEON GRAFFITI TEXT BACKGROUND ──
      ctx.save();
      ctx.globalAlpha = 0.04;
      const graffitiWords = ['CYBER', 'CITY', 'NEON', 'PINBALL', 'ARCADE', 'TILT', 'COMBO', 'BOOST', 'TURBO', 'HACK', 'GLITCH', 'PIXEL', 'GRID', 'FLUX', 'VOLT'];
      const graffitiColors = [NEON.cyan, NEON.pink, NEON.green, NEON.yellow, NEON.purple, NEON.orange];
      // Use frame-based seed for stable positions
      for (let i = 0; i < 35; i++) {
        const seed = i * 7919;
        const gx = (seed * 131) % TW;
        const gy = (seed * 97) % TH;
        const angle = ((seed * 37) % 120 - 60) * Math.PI / 180;
        const size = 10 + (seed % 30);
        const word = graffitiWords[i % graffitiWords.length];
        const color = graffitiColors[i % graffitiColors.length];
        ctx.save();
        ctx.translate(gx, gy);
        ctx.rotate(angle);
        ctx.font = `bold ${size}px monospace`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.fillText(word, 0, 0);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
      ctx.restore();

      // ── Animated neon glow washes ──
      const nGlow1 = radGrad(ctx, TW * 0.3, TH * 0.3, 8, TW * 0.3, TH * 0.3, 160);
      if (nGlow1) {
        nGlow1.addColorStop(0, `rgba(0, 255, 255, ${0.03 + Math.sin(t) * 0.015})`);
        nGlow1.addColorStop(1, 'transparent');
        ctx.fillStyle = nGlow1; ctx.fillRect(0, 0, TW, TH);
      }
      const nGlow2 = radGrad(ctx, TW * 0.7, TH * 0.6, 8, TW * 0.7, TH * 0.6, 140);
      if (nGlow2) {
        nGlow2.addColorStop(0, `rgba(255, 0, 255, ${0.025 + Math.sin(t * 1.3 + 2) * 0.012})`);
        nGlow2.addColorStop(1, 'transparent');
        ctx.fillStyle = nGlow2; ctx.fillRect(0, 0, TW, TH);
      }
      const nGlow3 = radGrad(ctx, TW * 0.5, TH * 0.15, 8, TW * 0.5, TH * 0.15, 120);
      if (nGlow3) {
        nGlow3.addColorStop(0, `rgba(57, 255, 20, ${0.02 + Math.sin(t * 0.7 + 4) * 0.01})`);
        nGlow3.addColorStop(1, 'transparent');
        ctx.fillStyle = nGlow3; ctx.fillRect(0, 0, TW, TH);
      }

      // ── Large "CYBER CITY PINBALL" graffiti title (center, faint) ──
      ctx.save();
      ctx.globalAlpha = 0.035 + Math.sin(t * 0.5) * 0.01;
      ctx.font = 'bold 42px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = NEON.cyan;
      ctx.shadowBlur = 20;
      ctx.fillStyle = NEON.cyan;
      ctx.fillText('CYBER', TW / 2, TH * 0.42);
      ctx.shadowColor = NEON.pink;
      ctx.fillStyle = NEON.pink;
      ctx.fillText('CITY', TW / 2, TH * 0.48);
      ctx.shadowColor = NEON.green;
      ctx.fillStyle = NEON.green;
      ctx.font = 'bold 32px monospace';
      ctx.fillText('PINBALL', TW / 2, TH * 0.53);
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── Reactor core glow ──
      const rcSize = sn(85 + g.reactorCharge * 1.1, 85);
      const rcAlpha = clamp(g.overdriveActive ? 0.22 + Math.sin(t * 6) * 0.08 : 0.05 + g.reactorCharge * 0.002, 0, 1);
      const rcGlow = radGrad(ctx, bCX, bCY, 2, bCX, bCY, rcSize);
      if (rcGlow) {
        rcGlow.addColorStop(0, `rgba(0, 255, 255, ${rcAlpha * 1.5})`);
        rcGlow.addColorStop(0.35, `rgba(255, 0, 255, ${rcAlpha})`);
        rcGlow.addColorStop(0.7, `rgba(57, 255, 20, ${rcAlpha * 0.4})`);
        rcGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = rcGlow;
        ctx.fillRect(bCX - rcSize, bCY - rcSize, rcSize * 2, rcSize * 2);
      }

      // ── Flipper area glow ──
      const fGlow = radGrad(ctx, TW / 2, fY, 8, TW / 2, fY, 110);
      if (fGlow) {
        fGlow.addColorStop(0, 'rgba(0, 255, 255, 0.04)');
        fGlow.addColorStop(0.5, 'rgba(255, 0, 255, 0.02)');
        fGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = fGlow;
        ctx.fillRect(0, TH - 200, TW, 200);
      }

      // ── Lightning flash ──
      if (g.lightFlash > 0.02) {
        ctx.fillStyle = `rgba(0, 255, 255, ${g.lightFlash * 0.12})`;
        ctx.fillRect(0, 0, TW, TH);
        g.lightFlash *= 0.88;
        if (g.lightFlash < 0.03) g.lightFlash = 0;
      }

      // ── Table neon border ──
      ctx.shadowColor = NEON.cyan;
      ctx.shadowBlur = 10;
      ctx.strokeStyle = NEON.cyan;
      ctx.lineWidth = 2;
      ctx.strokeRect(3, 3, TW - 6, TH - 6);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(0, 255, 255, 0.15)`;
      ctx.lineWidth = 1;
      ctx.strokeRect(7, 7, TW - 14, TH - 14);

      // ── Ball trail ──
      if (g.currentBall && g.launched && fin(g.currentBall.position.x) && fin(g.currentBall.position.y)) {
        g.trail.push({ x: g.currentBall.position.x, y: g.currentBall.position.y, age: 0 });
        if (g.trail.length > 25) g.trail.shift();
      }
      for (let i = g.trail.length - 1; i >= 0; i--) {
        const pt = g.trail[i];
        pt.age++;
        if (pt.age > 25 || !fin(pt.x) || !fin(pt.y)) { g.trail.splice(i, 1); continue; }
        const a = 1 - pt.age / 25;
        const s = Math.max(0, BALL_R * a);
        const tg = radGrad(ctx, pt.x, pt.y, 0, pt.x, pt.y, s + 4);
        if (!tg) continue;
        tg.addColorStop(0, `rgba(0, 255, 255, ${a * 0.5})`);
        tg.addColorStop(0.5, `rgba(255, 0, 255, ${a * 0.25})`);
        tg.addColorStop(1, 'transparent');
        ctx.fillStyle = tg;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, s + 4, 0, Math.PI * 2); ctx.fill();
      }

      // ── Particles ──
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
        if (p.life <= 0 || !fin(p.x) || !fin(p.y)) { particles.current.splice(i, 1); continue; }
        const a = p.life / 35;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = clamp(a, 0, 1);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.globalAlpha = 1;

      // ═══════════════════════════════════════
      // ── DRAW BODIES ──
      // ═══════════════════════════════════════
      const bodies = Composite.allBodies(engine.world);
      for (const body of bodies) {
        if (body.label === 'drain') continue;
        if (!fin(body.position.x) || !fin(body.position.y) || !fin(body.angle)) continue;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        // ── Ball ──
        if (body.label === 'ball') {
          for (let r = 3; r >= 1; r--) {
            ctx.fillStyle = `rgba(0, 255, 255, ${0.03 * r})`;
            ctx.beginPath(); ctx.arc(0, 0, BALL_R + r * 6, 0, Math.PI * 2); ctx.fill();
          }
          const bg = radGrad(ctx, -1.5, -2.5, 0.5, 0, 0, BALL_R);
          if (bg) {
            bg.addColorStop(0, '#ffffff');
            bg.addColorStop(0.15, '#ccffff');
            bg.addColorStop(0.4, NEON.cyan);
            bg.addColorStop(0.75, '#006666');
            bg.addColorStop(1, '#001a1a');
            ctx.shadowColor = NEON.cyan;
            ctx.shadowBlur = 24;
            ctx.fillStyle = bg;
          } else {
            ctx.fillStyle = NEON.cyan;
            ctx.shadowColor = NEON.cyan;
            ctx.shadowBlur = 24;
          }
          ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.beginPath(); ctx.arc(-1.5, -1.5, 1.8, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = `rgba(0, 255, 255, 0.5)`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(0, 0, BALL_R + 0.3, 0, Math.PI * 2); ctx.stroke();

        // ── Bumpers ──
        } else if (body.label.startsWith('bumper_')) {
          const idx = parseInt(body.label.split('_')[1]);
          const r = idx < 3 ? BUMPER_R : 10;
          const flash = g.bumperFlash.has(body.label) && now < (g.bumperFlash.get(body.label) || 0);
          const neonCol = flash ? NEON.white : [NEON.cyan, NEON.pink, NEON.green, NEON.yellow, NEON.purple][idx];
          const bg = radGrad(ctx, 0, -1.5, 1.5, 0, 1.5, r);
          if (bg) {
            bg.addColorStop(0, flash ? '#fff' : neonCol);
            bg.addColorStop(0.5, flash ? neonCol : `${neonCol}88`);
            bg.addColorStop(1, '#050510');
            ctx.fillStyle = bg;
          } else {
            ctx.fillStyle = neonCol;
          }
          ctx.shadowColor = neonCol;
          ctx.shadowBlur = flash ? 35 : 15;
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = neonCol;
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = `${neonCol}66`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(0, 0, r - 4, 0, Math.PI * 2); ctx.stroke();
          // Center dot
          ctx.fillStyle = flash ? '#fff' : neonCol;
          ctx.shadowColor = neonCol;
          ctx.shadowBlur = flash ? 15 : 6;
          ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;

        // ── Flippers ──
        } else if (body.label === 'leftFlipper' || body.label === 'rightFlipper') {
          const up = body.label === 'leftFlipper' ? g.leftUp : g.rightUp;
          const isLeft = body.label === 'leftFlipper';
          const col = isLeft ? NEON.cyan : NEON.pink;
          const fg = linGrad(ctx, -FW / 2, -FH / 2, FW / 2, FH / 2);
          if (fg) {
            fg.addColorStop(0, up ? col : `${col}55`);
            fg.addColorStop(0.5, up ? `${col}cc` : `${col}33`);
            fg.addColorStop(1, up ? col : `${col}22`);
            ctx.fillStyle = fg;
          } else {
            ctx.fillStyle = up ? col : `${col}55`;
          }
          ctx.shadowColor = col;
          ctx.shadowBlur = up ? 22 : 8;
          ctx.beginPath(); ctx.roundRect(-FW / 2, -FH / 2, FW, FH, 5); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255,255,255,${up ? 0.3 : 0.08})`;
          ctx.beginPath(); ctx.roundRect(-FW / 2 + 2, -FH / 2 + 1, FW - 4, 2.5, 2); ctx.fill();
          ctx.strokeStyle = col;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.roundRect(-FW / 2, -FH / 2, FW, FH, 5); ctx.stroke();
          const px = isLeft ? -FW / 2 + 6 : FW / 2 - 6;
          ctx.fillStyle = up ? '#fff' : 'rgba(255,255,255,0.35)';
          ctx.beginPath(); ctx.arc(px, 0, 2.5, 0, Math.PI * 2); ctx.fill();

        // ── Walls ──
        } else if (body.label === 'wall') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          if (verts.length < 2) { ctx.restore(); continue; }
          ctx.fillStyle = '#0a0a1a';
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let vi = 1; vi < verts.length; vi++) ctx.lineTo(verts[vi].x, verts[vi].y);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.15 + Math.sin(t * 1.5 + body.position.y * 0.02) * 0.08})`;
          ctx.lineWidth = 1;
          ctx.stroke();

        // ── Slingshots ──
        } else if (body.label === 'slingshot') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.fillStyle = `${NEON.yellow}44`;
          ctx.shadowColor = NEON.yellow;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let vi = 1; vi < verts.length; vi++) ctx.lineTo(verts[vi].x, verts[vi].y);
          ctx.closePath(); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = NEON.yellow; ctx.lineWidth = 1; ctx.stroke();

        // ── Ramps ──
        } else if (body.label.startsWith('ramp_') && !body.isSensor) {
          // skip

        // ── CYBER lane sensors ──
        } else if (body.label.startsWith('cyber_')) {
          const idx = parseInt(body.label.split('_')[1]);
          const lit = g.cyberLetters[idx];
          const letterColor = [NEON.cyan, NEON.pink, NEON.green, NEON.yellow, NEON.purple][idx];
          if (lit) {
            ctx.shadowColor = letterColor; ctx.shadowBlur = 20;
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
          ctx.fillStyle = hit ? '#000' : `${NEON.red}66`;
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('▼', 0, 1);

        // ── Reactor core ──
        } else if (body.label === 'reactor_core') {
          const charge = g.reactorCharge / 100;
          for (let r = 0; r < 3; r++) {
            const ringR = 16 + r * 9 + Math.sin(t * 4 + r * 2) * 2.5;
            const ra = g.overdriveActive ? 0.3 : 0.08 + charge * 0.12;
            const ringCol = [NEON.cyan, NEON.pink, NEON.green][r];
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
              cg.addColorStop(0.2, NEON.cyan);
              cg.addColorStop(0.5, NEON.pink);
              cg.addColorStop(0.8, NEON.purple);
              cg.addColorStop(1, 'rgba(0,0,0,0.3)');
            } else {
              cg.addColorStop(0, `rgba(0, 255, 255, ${0.25 + charge * 0.7})`);
              cg.addColorStop(0.4, `rgba(255, 0, 255, ${0.15 + charge * 0.55})`);
              cg.addColorStop(0.8, `rgba(57, 255, 20, ${0.08 + charge * 0.25})`);
              cg.addColorStop(1, 'transparent');
            }
            ctx.shadowColor = g.overdriveActive ? NEON.cyan : NEON.pink;
            ctx.shadowBlur = g.overdriveActive ? 30 : 8 + charge * 12;
            ctx.fillStyle = cg;
            ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
          }
          ctx.strokeStyle = NEON.cyan;
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
        }

        ctx.restore();
      }

      // ── Plunger ready indicator ──
      if (!g.launched && g.currentBall) {
        const pulseA = 0.4 + Math.sin(t * 4) * 0.3;
        ctx.shadowColor = NEON.cyan;
        ctx.shadowBlur = 12;
        ctx.fillStyle = `rgba(0, 255, 255, ${pulseA})`;
        ctx.beginPath(); ctx.arc(PLUNGER_X, TH - 38, BALL_R + 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        // "TAP" text
        ctx.fillStyle = NEON.cyan;
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.globalAlpha = pulseA;
        ctx.fillText('TAP', PLUNGER_X, TH - 52);
        ctx.fillText('SPACE', PLUNGER_X, TH - 44);
        ctx.globalAlpha = 1;
      }

      // ── Labels ──
      ctx.globalAlpha = 0.65;
      ctx.shadowColor = NEON.green; ctx.shadowBlur = 4;
      ctx.fillStyle = NEON.green; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(36, 360); ctx.rotate(-0.2);
      ctx.fillText('DOWNTOWN', 0, 0); ctx.fillText('RAMP', 0, 8);
      ctx.restore();
      ctx.save();
      ctx.translate(TW - 58, 360); ctx.rotate(0.2);
      ctx.shadowColor = NEON.pink;
      ctx.fillStyle = NEON.pink;
      ctx.fillText('NEON', 0, 0); ctx.fillText('HIGHWAY', 0, 8);
      ctx.restore();
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      // Reactor label
      ctx.fillStyle = NEON.cyan; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
      ctx.globalAlpha = 0.55;
      ctx.fillText('REACTOR CORE', bCX, bCY + 45);
      ctx.globalAlpha = 1;

      // Demon targets label
      ctx.fillStyle = `${NEON.red}88`; ctx.font = 'bold 6px monospace';
      ctx.fillText('DEMON', 82, dtY + 22);
      ctx.fillText('DEMON', TW - 82, dtY + 22);

      // CYBER label
      ctx.fillStyle = `${NEON.cyan}66`; ctx.font = 'bold 7px monospace';
      ctx.fillText('▼ C · Y · B · E · R ▼', TW / 2, laneY + 22);

      // ── HUD overlays ──
      if (g.tilted) {
        ctx.fillStyle = 'rgba(255,0,0,0.1)'; ctx.fillRect(0, 0, TW, TH);
        ctx.shadowColor = NEON.red; ctx.shadowBlur = 30;
        ctx.fillStyle = NEON.red; ctx.font = 'bold 40px monospace'; ctx.textAlign = 'center';
        ctx.fillText('TILT', TW / 2, TH / 2); ctx.shadowBlur = 0;
      }

      if (message) {
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
        ctx.strokeStyle = NEON.cyan; ctx.shadowColor = NEON.cyan; ctx.shadowBlur = 8; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(TW / 2 - 100, TH / 2 - 17); ctx.lineTo(TW / 2 + 100, TH / 2 - 17); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(TW / 2 - 100, TH / 2 + 17); ctx.lineTo(TW / 2 + 100, TH / 2 + 17); ctx.stroke();
        ctx.shadowBlur = 8; ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(message, TW / 2, TH / 2); ctx.shadowBlur = 0;
      }

      if (g.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.92)'; ctx.fillRect(0, 0, TW, TH);
        // Scanlines
        ctx.globalAlpha = 0.03;
        for (let y = 0; y < TH; y += 2) { ctx.fillStyle = NEON.cyan; ctx.fillRect(0, y, TW, 1); }
        ctx.globalAlpha = 1;
        ctx.shadowColor = NEON.cyan; ctx.shadowBlur = 35;
        ctx.fillStyle = NEON.cyan; ctx.font = 'bold 32px monospace'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', TW / 2, TH / 2 - 40);
        ctx.shadowColor = NEON.pink; ctx.shadowBlur = 20;
        ctx.fillStyle = NEON.pink; ctx.font = 'bold 22px monospace';
        ctx.fillText(g.score.toLocaleString(), TW / 2, TH / 2);
        ctx.shadowBlur = 0;
        ctx.fillStyle = `${NEON.green}88`; ctx.font = '9px monospace';
        ctx.fillText('PRESS SPACE TO RESTART', TW / 2, TH / 2 + 35);
        if (g.maxCombo > 1) {
          ctx.fillStyle = `${NEON.yellow}55`; ctx.font = '8px monospace';
          ctx.fillText(`MAX COMBO: ${g.maxCombo}x`, TW / 2, TH / 2 + 52);
        }
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
      // Overdrive banner
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
          g.score = 0; g.balls = 3; g.gameOver = false; g.combo = 0; g.maxCombo = 0;
          g.cyberLetters.fill(false); g.cyberComplete = 0;
          g.demonTargetsL.fill(false); g.demonTargetsR.fill(false);
          g.demonMode = false; g.reactorCharge = 0; g.overdriveActive = false;
          g.lockedBalls = 0; g.multiballActive = false;
          g.buildingsLit = 0; g.trail = [];
          setScore(0); setBalls(3); setGameOver(false); setCombo(0);
          setCyberLetters([false, false, false, false, false]);
          setDemonMode(false); setReactorCharge(0); setOverdrive(false); setLockedBalls(0);
          spawnBall();
          return;
        }
        // Instant launch on tap
        doLaunch();
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
    if (!g.currentBall || g.launched || g.gameOver) return;
    if (!fin(g.currentBall.position.x) || !fin(g.currentBall.position.y)) return;
    Body.setStatic(g.currentBall, false);
    Body.applyForce(g.currentBall, g.currentBall.position, { x: 0, y: -0.032 });
    g.launched = true;
    g.lightFlash = 0.2;
    g.shake.power = 3;
    spawnParticles(PLUNGER_X, g.currentBall.position.y, 10, NEON.cyan, 6);
  }, [spawnParticles]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Score HUD */}
      <div className="w-full max-w-[420px] bg-black/80 border border-[hsl(180,100%,50%)]/30 rounded-xl p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-[hsl(180,100%,50%)] font-mono">{score.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Balls</p>
            <div className="flex gap-1 justify-center mt-1">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < balls ? 'bg-[hsl(180,100%,50%)] shadow-[0_0_6px_hsl(180,100%,50%)]' : 'bg-muted/30'}`} />
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Combo</p>
            <p className={`text-lg font-bold font-mono ${combo > 1 ? 'text-[hsl(300,100%,50%)]' : 'text-muted-foreground'}`}>
              {combo > 0 ? `${Math.min(combo, 8)}x` : '--'}
            </p>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between mt-2 gap-2">
          <div className="flex gap-1">
            {'CYBER'.split('').map((l, i) => {
              const cols = ['hsl(180,100%,50%)', 'hsl(300,100%,50%)', 'hsl(110,100%,54%)', 'hsl(55,100%,47%)', 'hsl(280,100%,50%)'];
              return (
                <span key={i} className={`text-[10px] font-bold font-mono px-1 py-0.5 rounded border`}
                  style={{
                    color: cyberLetters[i] ? cols[i] : 'var(--muted-foreground)',
                    borderColor: cyberLetters[i] ? `${cols[i]}` : 'rgba(255,255,255,0.1)',
                    backgroundColor: cyberLetters[i] ? `${cols[i]}22` : 'rgba(255,255,255,0.03)',
                    textShadow: cyberLetters[i] ? `0 0 8px ${cols[i]}` : 'none',
                  }}>{l}</span>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-muted-foreground">REACTOR</span>
            <div className="w-14 h-2 bg-muted/20 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all`}
                style={{
                  width: `${reactorCharge}%`,
                  background: overdrive ? 'linear-gradient(90deg, hsl(180,100%,50%), hsl(300,100%,50%))' : 'hsl(180,100%,50%)',
                  boxShadow: overdrive ? '0 0 8px hsl(180,100%,50%)' : 'none',
                }} />
            </div>
          </div>
        </div>

        {/* Mode indicators */}
        <div className="flex justify-center gap-2 mt-1.5">
          {demonMode && <span className="text-[9px] font-bold animate-pulse" style={{ color: NEON.red, textShadow: `0 0 6px ${NEON.red}` }}>👹 DEMON 3x</span>}
          {overdrive && <span className="text-[9px] font-bold animate-pulse" style={{ color: NEON.purple, textShadow: `0 0 6px ${NEON.purple}` }}>⚡ OVERDRIVE</span>}
          {lockedBalls > 0 && <span className="text-[9px] font-bold" style={{ color: NEON.pink }}>🔒 {lockedBalls}/2</span>}
          {tiltW > 0 && (
            <div className="flex items-center gap-0.5">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full`} style={{ background: i < tiltW ? NEON.red : 'rgba(255,255,255,0.15)' }} />
              ))}
              <span className="text-[9px] ml-0.5" style={{ color: NEON.red }}>TILT</span>
            </div>
          )}
        </div>

        {/* Launch button - simple tap */}
        <button
          onClick={launchBall}
          disabled={G.current.launched || gameOver}
          className="w-full mt-2 py-3 rounded-lg font-bold text-sm border active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          style={{
            background: G.current.launched ? 'rgba(255,255,255,0.05)' : 'rgba(0,255,255,0.15)',
            borderColor: G.current.launched ? 'rgba(255,255,255,0.1)' : 'rgba(0,255,255,0.5)',
            color: G.current.launched ? 'rgba(255,255,255,0.3)' : NEON.cyan,
            textShadow: G.current.launched ? 'none' : `0 0 10px ${NEON.cyan}`,
          }}
        >
          {G.current.launched ? '🎯 IN PLAY' : '🚀 LAUNCH'}
        </button>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border-2 border-[hsl(180,100%,50%)]/30 shadow-[0_0_40px_rgba(0,255,255,0.15)]">
        <canvas ref={canvasRef} className="block" style={{ width: TW, height: TH }} />
      </div>

      {/* Mobile controls */}
      <div className="w-full max-w-[420px] grid grid-cols-3 gap-2 md:hidden touch-none select-none">
        <button className="font-bold py-5 rounded-xl select-none text-sm touch-none border"
          style={{ background: 'rgba(0,255,255,0.15)', borderColor: 'rgba(0,255,255,0.4)', color: NEON.cyan }}
          onTouchStart={(e) => { e.preventDefault(); flipperTouch('left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); flipperTouch('left', false); }}
          onTouchCancel={(e) => { e.preventDefault(); flipperTouch('left', false); }}
          onMouseDown={() => flipperTouch('left', true)}
          onMouseUp={() => flipperTouch('left', false)}
          onMouseLeave={() => flipperTouch('left', false)}>◀ LEFT</button>
        <button
          type="button"
          className="rounded-xl touch-none select-none font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed border"
          style={{
            background: G.current.launched ? 'rgba(255,255,255,0.05)' : 'rgba(0,255,255,0.15)',
            borderColor: 'rgba(0,255,255,0.4)',
            color: NEON.cyan,
          }}
          onClick={launchBall}
          disabled={G.current.launched || gameOver}
        >
          {G.current.launched ? '🎯' : '🚀 LAUNCH'}
        </button>
        <button className="font-bold py-5 rounded-xl select-none text-sm touch-none border"
          style={{ background: 'rgba(255,0,255,0.15)', borderColor: 'rgba(255,0,255,0.4)', color: NEON.pink }}
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
        <span><kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">Space</kbd> Launch</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">T</kbd> Nudge</span>
      </div>
    </div>
  );
};

export default CyberPinball;
