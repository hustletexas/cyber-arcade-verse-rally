import React, { useRef, useEffect, useState, useCallback } from 'react';
import Matter from 'matter-js';

const { Engine, Runner, Bodies, Body, Composite, Events, Constraint, Vector } = Matter;

// ═══════════════════════════════════════════════════════
// CYBER CITY PINBALL — Demon's Tilt inspired
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
    plungerPower: 0, plungerCharging: false,
    combo: 0, comboTimer: 0, maxCombo: 0,
    // Demon targets (6 drop targets in 2 banks)
    demonTargetsL: [false, false, false] as boolean[],
    demonTargetsR: [false, false, false] as boolean[],
    demonMode: false, demonTimer: 0,
    // Orbit tracking
    orbitCount: 0, lastOrbitDir: '',
    // Reactor charge
    reactorCharge: 0, overdriveActive: false, overdriveTimer: 0,
    // Multi-ball
    lockedBalls: 0, multiballActive: false,
    extraBalls: [] as Matter.Body[],
    // Visual
    bumperFlash: new Map<string, number>(),
    trail: [] as { x: number; y: number; age: number }[],
    shake: { x: 0, y: 0, power: 0 },
    lightFlash: 0,
    skillShot: true,
    tiltWarnings: 0, tilted: false,
    // Cyber letters
    cyberLetters: [false, false, false, false, false] as boolean[],
    cyberComplete: 0,
    // Buildings lit
    buildingsLit: 0,
  });

  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(3);
  const [combo, setCombo] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [plungerDisplay, setPlungerDisplay] = useState(0);
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
      // Outer frame
      Bodies.rectangle(WALL / 2, TH / 2, WALL, TH, wallOpts),
      Bodies.rectangle(TW / 2, WALL / 2, TW, WALL, wallOpts),
      Bodies.rectangle(TW / 2, TH + 20, TW, 40, { isStatic: true, label: 'drain' }),
      // Right wall (gap for plunger lane)
      Bodies.rectangle(TW - WALL / 2, TH / 2 - 140, WALL, TH - 280, wallOpts),
      Bodies.rectangle(TW - WALL / 2, TH - 55, WALL, 110, wallOpts),
      // Plunger lane inner wall
      Bodies.rectangle(TW - 34, TH - 190, 4, 200, { ...wallOpts, angle: 0.03 }),
      // Plunger lane top curve
      Bodies.rectangle(TW - 48, TH - 310, 45, 4, { ...wallOpts, angle: -0.32 }),
      // Outlane / inlane guides (left)
      Bodies.rectangle(30, TH - 170, 4, 130, { ...wallOpts, angle: 0.12 }),
      Bodies.rectangle(62, TH - 145, 4, 95, { ...wallOpts, angle: 0.16 }),
      // Outlane / inlane guides (right)
      Bodies.rectangle(TW - 58, TH - 170, 4, 130, { ...wallOpts, angle: -0.12 }),
      Bodies.rectangle(TW - 90, TH - 145, 4, 95, { ...wallOpts, angle: -0.16 }),
      // Orbit lane walls
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

    // ── TIER 1: Upper bumper cluster (Demon's Tilt style triangle + extra) ──
    const bCX = TW / 2, bCY = 225;
    const bumpers = [
      Bodies.circle(bCX, bCY - 40, BUMPER_R, { isStatic: true, label: 'bumper_0', restitution: 1.15 }),
      Bodies.circle(bCX - 36, bCY + 18, BUMPER_R, { isStatic: true, label: 'bumper_1', restitution: 1.15 }),
      Bodies.circle(bCX + 36, bCY + 18, BUMPER_R, { isStatic: true, label: 'bumper_2', restitution: 1.15 }),
      // Upper mini bumpers
      Bodies.circle(bCX - 65, bCY - 55, 10, { isStatic: true, label: 'bumper_3', restitution: 1.2 }),
      Bodies.circle(bCX + 65, bCY - 55, 10, { isStatic: true, label: 'bumper_4', restitution: 1.2 }),
    ];

    // ── Reactor core sensor ──
    const reactorSensor = Bodies.circle(bCX, bCY, 8, sensorOpts('reactor_core'));

    // ── TIER 2: CYBER letter lanes (top) ──
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

    // ── TIER 3: Drop target banks (Demon-style) ──
    const dtY = 410;
    const demonTargetsL = [0, 1, 2].map(i =>
      Bodies.rectangle(60 + i * 22, dtY, 4, 20, sensorOpts(`demon_l_${i}`))
    );
    const demonTargetsR = [0, 1, 2].map(i =>
      Bodies.rectangle(TW - 104 + i * 22, dtY, 4, 20, sensorOpts(`demon_r_${i}`))
    );
    // Backing walls for targets
    walls.push(Bodies.rectangle(82, dtY - 14, 70, 3, wallOpts));
    walls.push(Bodies.rectangle(TW - 82, dtY - 14, 70, 3, wallOpts));

    // ── Orbit sensors ──
    const orbitL = Bodies.rectangle(28, 115, 16, 8, sensorOpts('orbit_left'));
    const orbitR = Bodies.rectangle(TW - 52, 115, 16, 8, sensorOpts('orbit_right'));

    // ── Ramp entries ──
    const rampL = Bodies.rectangle(52, 330, 4, 160, { ...wallOpts, angle: 0.2 });
    const rampLGuide = Bodies.rectangle(76, 330, 4, 160, { ...wallOpts, angle: 0.2 });
    const rampLSensor = Bodies.rectangle(52, 250, 12, 8, sensorOpts('ramp_left'));
    const rampR = Bodies.rectangle(TW - 76, 330, 4, 160, { ...wallOpts, angle: -0.2 });
    const rampRGuide = Bodies.rectangle(TW - 100, 330, 4, 160, { ...wallOpts, angle: -0.2 });
    const rampRSensor = Bodies.rectangle(TW - 76, 250, 12, 8, sensorOpts('ramp_right'));

    // ── Spinner ──
    const spinner = Bodies.rectangle(bCX, bCY - 78, 32, 3, sensorOpts('spinner'));

    // ── Multiball lock ──
    const lockSensor = Bodies.rectangle(bCX, bCY + 60, 26, 6, sensorOpts('multiball_lock'));

    // ── Kickback ──
    const kickback = Bodies.rectangle(14, TH - 210, 6, 30, { isStatic: true, label: 'kickback', restitution: 1.6 });

    // ── Assemble ──
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

        // Drain
        if (labels.includes('drain')) { handleDrain(ball); continue; }

        // Bumpers
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
            // Bounce
            const bmp = pair.bodyA.label === `bumper_${i}` ? pair.bodyA : pair.bodyB;
            if (fin(ball.position.x) && fin(bmp.position.x)) {
              const d = Vector.normalise(Vector.sub(ball.position, bmp.position));
              Body.applyForce(ball, ball.position, { x: d.x * 0.008, y: d.y * 0.008 });
            }
            spawnParticles(ball.position.x, ball.position.y, 8, '#e879f9', 5);
            g.buildingsLit = Math.min(g.buildingsLit + 1, 14);
          }
        }

        // Slingshots
        if (labels.includes('slingshot')) {
          addScore(50);
          g.shake.power = 2;
          spawnParticles(ball.position.x, ball.position.y, 4, '#facc15', 3);
        }

        // CYBER letters
        for (let i = 0; i < 5; i++) {
          if (labels.includes(`cyber_${i}`) && !g.cyberLetters[i]) {
            g.cyberLetters[i] = true;
            setCyberLetters([...g.cyberLetters]);
            addScore(500);
            showMsg(`${'CYBER'[i]} LIT!`);
            spawnParticles(ball.position.x, ball.position.y, 6, '#00e5ff', 4);
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

        // Demon drop targets
        for (let i = 0; i < 3; i++) {
          if (labels.includes(`demon_l_${i}`) && !g.demonTargetsL[i]) {
            g.demonTargetsL[i] = true;
            addScore(200);
            spawnParticles(ball.position.x, ball.position.y, 5, '#ff4444', 4);
          }
          if (labels.includes(`demon_r_${i}`) && !g.demonTargetsR[i]) {
            g.demonTargetsR[i] = true;
            addScore(200);
            spawnParticles(ball.position.x, ball.position.y, 5, '#ff4444', 4);
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

        // Ramps
        if (labels.includes('ramp_left') || labels.includes('ramp_right')) {
          addScore(300);
          showMsg(labels.includes('ramp_left') ? 'DOWNTOWN RAMP!' : 'NEON HIGHWAY!');
          spawnParticles(ball.position.x, ball.position.y, 6, '#22d3ee', 4);
        }

        // Spinner
        if (labels.includes('spinner')) { addScore(25); }

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
                label: 'ball', restitution: 0.5, friction: 0.01, frictionAir: 0.001, density: 0.004,
              });
              Composite.add(engine.world, extra);
              g.extraBalls.push(extra);
              Body.applyForce(extra, extra.position, { x: (Math.random() - 0.5) * 0.004, y: 0.004 });
            }
          }
        }

        // Skill shot
        if (g.skillShot && labels.includes('cyber_2')) {
          addScore(3000);
          showMsg('🎯 SKILL SHOT! +3000', 2500);
          g.skillShot = false;
          spawnParticles(ball.position.x, ball.position.y, 12, '#ffffff', 7);
        }

        // Kickback
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
      setPlungerDisplay(0);
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

      // ── Deep space background ──
      const bgGrad = radGrad(ctx, TW / 2, TH * 0.35, 20, TW / 2, TH * 0.35, TH * 0.85);
      if (bgGrad) {
        bgGrad.addColorStop(0, '#1a0533');
        bgGrad.addColorStop(0.3, '#0c0320');
        bgGrad.addColorStop(0.6, '#060214');
        bgGrad.addColorStop(1, '#02010a');
        ctx.fillStyle = bgGrad;
      } else {
        ctx.fillStyle = '#060214';
      }
      ctx.fillRect(0, 0, TW, TH);

      // ── Subtle grid overlay (Demon's Tilt style) ──
      ctx.globalAlpha = 0.025;
      ctx.strokeStyle = '#6040ff';
      ctx.lineWidth = 0.5;
      for (let y = 0; y < TH; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TW, y); ctx.stroke();
      }
      for (let x = 0; x < TW; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, TH); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // ── Nebula glow ──
      const neb1 = radGrad(ctx, TW * 0.25, TH * 0.45, 8, TW * 0.25, TH * 0.45, 140);
      if (neb1) {
        neb1.addColorStop(0, 'rgba(120, 20, 200, 0.06)');
        neb1.addColorStop(1, 'transparent');
        ctx.fillStyle = neb1; ctx.fillRect(0, 0, TW, TH);
      }
      const neb2 = radGrad(ctx, TW * 0.75, TH * 0.25, 8, TW * 0.75, TH * 0.25, 110);
      if (neb2) {
        neb2.addColorStop(0, 'rgba(0, 100, 220, 0.05)');
        neb2.addColorStop(1, 'transparent');
        ctx.fillStyle = neb2; ctx.fillRect(0, 0, TW, TH);
      }

      // ── Cyber city skyline ──
      const skyY = 125;
      const bldgs = [
        { x: 25, w: 20, h: 70 }, { x: 50, w: 16, h: 50 }, { x: 72, w: 24, h: 88 },
        { x: 102, w: 18, h: 45 }, { x: 125, w: 22, h: 68 }, { x: 152, w: 14, h: 38 },
        { x: 172, w: 28, h: 100 }, { x: 205, w: 20, h: 60 }, { x: 230, w: 18, h: 78 },
        { x: 255, w: 16, h: 48 }, { x: 278, w: 24, h: 82 }, { x: 308, w: 20, h: 55 },
        { x: 333, w: 16, h: 65 }, { x: 358, w: 22, h: 50 },
      ];
      // Skyline glow
      const skyGlow = linGrad(ctx, 0, skyY - 90, 0, skyY + 5);
      if (skyGlow) {
        skyGlow.addColorStop(0, 'rgba(0, 80, 200, 0.07)');
        skyGlow.addColorStop(0.5, 'rgba(80, 0, 180, 0.05)');
        skyGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = skyGlow;
        ctx.fillRect(0, skyY - 90, TW, 95);
      }
      for (let bi = 0; bi < bldgs.length; bi++) {
        const b = bldgs[bi];
        const lit = bi < g.buildingsLit;
        const bx = b.x - b.w / 2, by = skyY - b.h;
        const bGrad = linGrad(ctx, bx, by, bx, skyY);
        if (bGrad) {
          if (lit) {
            bGrad.addColorStop(0, `rgba(0, 160, 255, ${0.12 + Math.sin(t * 2 + bi) * 0.04})`);
            bGrad.addColorStop(1, 'rgba(60, 0, 180, 0.06)');
          } else {
            bGrad.addColorStop(0, 'rgba(25, 20, 50, 0.5)');
            bGrad.addColorStop(1, 'rgba(12, 8, 25, 0.3)');
          }
          ctx.fillStyle = bGrad;
        } else {
          ctx.fillStyle = 'rgba(25, 20, 50, 0.5)';
        }
        ctx.fillRect(bx, by, b.w, b.h);
        ctx.strokeStyle = lit ? 'rgba(0, 180, 255, 0.3)' : 'rgba(50, 40, 80, 0.3)';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(bx, by, b.w, b.h);
        // Windows
        ctx.fillStyle = lit ? 'rgba(255, 200, 50, 0.6)' : 'rgba(60, 60, 100, 0.15)';
        const cols = Math.max(2, Math.floor(b.w / 8));
        for (let wy = by + 4; wy < skyY - 3; wy += 5) {
          for (let wx = 0; wx < cols; wx++) {
            if (Math.random() > (lit ? 0.25 : 0.6)) {
              ctx.fillRect(bx + 2 + wx * (b.w - 4) / cols, wy, 2, 2);
            }
          }
        }
      }

      // ── Reactor core glow ──
      const rcSize = sn(85 + g.reactorCharge * 1.1, 85);
      const rcAlpha = clamp(g.overdriveActive ? 0.22 + Math.sin(t * 6) * 0.08 : 0.05 + g.reactorCharge * 0.002, 0, 1);
      const rcGlow = radGrad(ctx, bCX, bCY, 2, bCX, bCY, rcSize);
      if (rcGlow) {
        rcGlow.addColorStop(0, `rgba(255, 100, 20, ${rcAlpha * 1.5})`);
        rcGlow.addColorStop(0.35, `rgba(180, 40, 80, ${rcAlpha})`);
        rcGlow.addColorStop(0.7, `rgba(100, 20, 160, ${rcAlpha * 0.4})`);
        rcGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = rcGlow;
        ctx.fillRect(bCX - rcSize, bCY - rcSize, rcSize * 2, rcSize * 2);
      }

      // ── Flipper area glow ──
      const fGlow = radGrad(ctx, TW / 2, fY, 8, TW / 2, fY, 110);
      if (fGlow) {
        fGlow.addColorStop(0, 'rgba(255, 0, 100, 0.04)');
        fGlow.addColorStop(0.5, 'rgba(0, 80, 220, 0.02)');
        fGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = fGlow;
        ctx.fillRect(0, TH - 200, TW, 200);
      }

      // ── Lightning flash ──
      if (g.lightFlash > 0.02) {
        ctx.fillStyle = `rgba(160, 180, 255, ${g.lightFlash * 0.12})`;
        ctx.fillRect(0, 0, TW, TH);
        g.lightFlash *= 0.88;
        if (g.lightFlash < 0.03) g.lightFlash = 0;
      }

      // ── Table chrome border ──
      ctx.strokeStyle = '#2a2a4a';
      ctx.lineWidth = 5;
      ctx.strokeRect(2, 2, TW - 4, TH - 4);
      ctx.shadowColor = '#5030cc';
      ctx.shadowBlur = 6;
      ctx.strokeStyle = 'rgba(80, 50, 200, 0.35)';
      ctx.lineWidth = 1.2;
      ctx.strokeRect(6, 6, TW - 12, TH - 12);
      ctx.shadowBlur = 0;

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
        tg.addColorStop(0, `rgba(80, 140, 255, ${a * 0.45})`);
        tg.addColorStop(0.5, `rgba(140, 40, 255, ${a * 0.2})`);
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
        ctx.shadowBlur = 3;
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
          // Glow rings
          for (let r = 3; r >= 1; r--) {
            ctx.fillStyle = `rgba(80, 130, 255, ${0.025 * r})`;
            ctx.beginPath(); ctx.arc(0, 0, BALL_R + r * 6, 0, Math.PI * 2); ctx.fill();
          }
          const bg = radGrad(ctx, -1.5, -2.5, 0.5, 0, 0, BALL_R);
          if (bg) {
            bg.addColorStop(0, '#ffffff');
            bg.addColorStop(0.15, '#ddeeff');
            bg.addColorStop(0.4, '#4488ff');
            bg.addColorStop(0.75, '#1133aa');
            bg.addColorStop(1, '#080830');
            ctx.shadowColor = '#4488ff';
            ctx.shadowBlur = 24;
            ctx.fillStyle = bg;
          } else {
            ctx.fillStyle = '#4488ff';
            ctx.shadowColor = '#4488ff';
            ctx.shadowBlur = 24;
          }
          ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          // Specular
          ctx.fillStyle = 'rgba(255,255,255,0.85)';
          ctx.beginPath(); ctx.arc(-1.5, -1.5, 1.8, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(80,160,255,0.5)';
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(0, 0, BALL_R + 0.3, 0, Math.PI * 2); ctx.stroke();

        // ── Bumpers ──
        } else if (body.label.startsWith('bumper_')) {
          const idx = parseInt(body.label.split('_')[1]);
          const r = idx < 3 ? BUMPER_R : 10;
          const flash = g.bumperFlash.has(body.label) && now < (g.bumperFlash.get(body.label) || 0);
          const bg = radGrad(ctx, 0, -1.5, 1.5, 0, 1.5, r);
          if (bg) {
            bg.addColorStop(0, flash ? '#fff' : '#7777bb');
            bg.addColorStop(0.3, flash ? '#ff7733' : '#3333aa');
            bg.addColorStop(0.7, flash ? '#cc3300' : '#1a1a55');
            bg.addColorStop(1, flash ? '#771100' : '#0a0a2a');
            ctx.fillStyle = bg;
          } else {
            ctx.fillStyle = flash ? '#ff7733' : '#3333aa';
          }
          ctx.shadowColor = flash ? '#ff5500' : '#5544bb';
          ctx.shadowBlur = flash ? 30 : 12;
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          // Rings
          ctx.strokeStyle = flash ? '#ffaa44' : '#5555aa';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
          ctx.strokeStyle = flash ? 'rgba(255,180,80,0.7)' : 'rgba(80,80,150,0.35)';
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(0, 0, r - 4, 0, Math.PI * 2); ctx.stroke();
          // Center gem
          const gem = radGrad(ctx, 0, -0.5, 0, 0, 0, 4);
          if (gem) {
            gem.addColorStop(0, flash ? '#fff' : '#ff7744');
            gem.addColorStop(0.6, flash ? '#ff5500' : '#cc3300');
            gem.addColorStop(1, flash ? '#aa1100' : '#551100');
            ctx.fillStyle = gem;
          }
          ctx.shadowColor = '#ff5500';
          ctx.shadowBlur = flash ? 12 : 4;
          ctx.beginPath(); ctx.arc(0, 0, 4, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;

        // ── Flippers ──
        } else if (body.label === 'leftFlipper' || body.label === 'rightFlipper') {
          const up = body.label === 'leftFlipper' ? g.leftUp : g.rightUp;
          const isLeft = body.label === 'leftFlipper';
          const fg = linGrad(ctx, -FW / 2, -FH / 2, FW / 2, FH / 2);
          if (fg) {
            fg.addColorStop(0, up ? '#ff5599' : '#774455');
            fg.addColorStop(0.3, up ? '#ff77bb' : '#995566');
            fg.addColorStop(0.5, up ? '#ff99cc' : '#bb6677');
            fg.addColorStop(0.7, up ? '#ff77bb' : '#995566');
            fg.addColorStop(1, up ? '#ff3377' : '#553344');
            ctx.fillStyle = fg;
          } else {
            ctx.fillStyle = up ? '#ff5599' : '#774455';
          }
          ctx.shadowColor = '#ff0066';
          ctx.shadowBlur = up ? 20 : 6;
          ctx.beginPath(); ctx.roundRect(-FW / 2, -FH / 2, FW, FH, 5); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255,255,255,${up ? 0.3 : 0.08})`;
          ctx.beginPath(); ctx.roundRect(-FW / 2 + 2, -FH / 2 + 1, FW - 4, 2.5, 2); ctx.fill();
          ctx.strokeStyle = `rgba(255,80,160,${up ? 0.8 : 0.3})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.roundRect(-FW / 2, -FH / 2, FW, FH, 5); ctx.stroke();
          // Pivot
          const px = isLeft ? -FW / 2 + 6 : FW / 2 - 6;
          ctx.fillStyle = up ? '#fff' : 'rgba(255,255,255,0.35)';
          ctx.beginPath(); ctx.arc(px, 0, 2.5, 0, Math.PI * 2); ctx.fill();

        // ── Walls ──
        } else if (body.label === 'wall') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          if (verts.length < 2) { ctx.restore(); continue; }
          ctx.fillStyle = '#1a1735';
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let vi = 1; vi < verts.length; vi++) ctx.lineTo(verts[vi].x, verts[vi].y);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = `rgba(50, 80, 180, ${0.2 + Math.sin(t * 1.5 + body.position.y * 0.02) * 0.08})`;
          ctx.lineWidth = 1;
          ctx.stroke();

        // ── Slingshots ──
        } else if (body.label === 'slingshot') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.fillStyle = '#993366';
          ctx.shadowColor = '#ff0088';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let vi = 1; vi < verts.length; vi++) ctx.lineTo(verts[vi].x, verts[vi].y);
          ctx.closePath(); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(255,120,180,0.45)'; ctx.lineWidth = 0.8; ctx.stroke();

        // ── Ramps ──
        } else if (body.label.startsWith('ramp_') && !body.isSensor) {
          // skip

        // ── CYBER lane sensors ──
        } else if (body.label.startsWith('cyber_')) {
          const idx = parseInt(body.label.split('_')[1]);
          const lit = g.cyberLetters[idx];
          if (lit) {
            ctx.shadowColor = '#00ccff'; ctx.shadowBlur = 18;
            ctx.fillStyle = '#00ddff';
          } else {
            ctx.fillStyle = `rgba(25, 35, 70, ${0.55 + Math.sin(t * 2 + idx) * 0.08})`;
          }
          ctx.beginPath(); ctx.roundRect(-7, -10, 14, 20, 2); ctx.fill();
          ctx.shadowBlur = 0;
          if (!lit) {
            ctx.strokeStyle = 'rgba(0, 120, 220, 0.25)';
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.roundRect(-7, -10, 14, 20, 2); ctx.stroke();
          }
          ctx.fillStyle = lit ? '#002233' : 'rgba(180,200,230,0.4)';
          ctx.font = `bold ${lit ? 11 : 9}px monospace`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('CYBER'[idx], 0, 1);

        // ── Demon drop targets ──
        } else if (body.label.startsWith('demon_')) {
          const side = body.label.includes('_l_') ? 'l' : 'r';
          const idx = parseInt(body.label.split('_')[2]);
          const hit = side === 'l' ? g.demonTargetsL[idx] : g.demonTargetsR[idx];
          if (hit) {
            ctx.shadowColor = '#ff2222'; ctx.shadowBlur = 12;
            ctx.fillStyle = '#ff3333';
          } else {
            ctx.fillStyle = `rgba(100, 30, 30, ${0.5 + Math.sin(t * 3 + idx) * 0.15})`;
          }
          ctx.beginPath(); ctx.roundRect(-5, -10, 10, 20, 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = hit ? '#ff5555' : 'rgba(150,50,50,0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.roundRect(-5, -10, 10, 20, 2); ctx.stroke();
          ctx.fillStyle = hit ? '#440000' : 'rgba(220,100,100,0.4)';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('▼', 0, 1);

        // ── Reactor core ──
        } else if (body.label === 'reactor_core') {
          const charge = g.reactorCharge / 100;
          // Energy rings
          for (let r = 0; r < 3; r++) {
            const ringR = 16 + r * 9 + Math.sin(t * 4 + r * 2) * 2.5;
            const ra = g.overdriveActive ? 0.28 : 0.08 + charge * 0.1;
            ctx.strokeStyle = `rgba(255, ${100 + r * 35}, 0, ${ra - r * 0.025})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.arc(0, 0, ringR, 0, Math.PI * 2); ctx.stroke();
          }
          const cg = radGrad(ctx, 0, 0, 0, 0, 0, 12);
          if (cg) {
            if (g.overdriveActive) {
              cg.addColorStop(0, '#ffffff');
              cg.addColorStop(0.2, '#ffcc33');
              cg.addColorStop(0.5, '#ff5500');
              cg.addColorStop(0.8, '#bb1100');
              cg.addColorStop(1, 'rgba(120,10,0,0.3)');
            } else {
              cg.addColorStop(0, `rgba(255,180,80,${0.25 + charge * 0.7})`);
              cg.addColorStop(0.4, `rgba(255,80,15,${0.15 + charge * 0.55})`);
              cg.addColorStop(0.8, `rgba(160,20,0,${0.08 + charge * 0.25})`);
              cg.addColorStop(1, 'transparent');
            }
            ctx.shadowColor = g.overdriveActive ? '#ff7700' : '#ff3300';
            ctx.shadowBlur = g.overdriveActive ? 30 : 8 + charge * 12;
            ctx.fillStyle = cg;
            ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
          }
          // Charge arc
          ctx.strokeStyle = `rgba(255, 130, 0, ${0.4 + charge * 0.5})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * charge);
          ctx.stroke();

        // ── Spinner ──
        } else if (body.label === 'spinner') {
          // static draw, no rotation tracking needed
          ctx.strokeStyle = '#00bbdd'; ctx.lineWidth = 2.5;
          ctx.shadowColor = '#00ccff'; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(16, 0); ctx.stroke();
          ctx.shadowBlur = 0;

        // ── Kickback ──
        } else if (body.label === 'kickback') {
          ctx.fillStyle = 'rgba(255,0,80,0.4)';
          ctx.shadowColor = '#ff0055';
          ctx.shadowBlur = 6;
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let vi = 1; vi < verts.length; vi++) ctx.lineTo(verts[vi].x, verts[vi].y);
          ctx.closePath(); ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      }

      // ── Plunger bar ──
      if (!g.launched && g.currentBall) {
        const plY = TH - 10;
        const plH = 50 * sn(g.plungerPower, 0);
        ctx.fillStyle = 'rgba(255,0,100,0.05)';
        ctx.fillRect(PLUNGER_X - 6, plY - 54, 12, 54);
        const pg = linGrad(ctx, 0, plY, 0, plY - plH);
        if (pg) {
          pg.addColorStop(0, '#ff006e');
          pg.addColorStop(1, '#ff66aa');
          ctx.fillStyle = pg;
        } else {
          ctx.fillStyle = '#ff006e';
        }
        ctx.shadowColor = '#ff006e';
        ctx.shadowBlur = 8 + sn(g.plungerPower, 0) * 10;
        if (plH > 1) {
          ctx.beginPath(); ctx.roundRect(PLUNGER_X - 3, plY - plH, 6, plH, 2); ctx.fill();
        }
        ctx.beginPath(); ctx.arc(PLUNGER_X, plY - plH, 4, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── Labels ──
      ctx.globalAlpha = 0.65;
      ctx.shadowColor = '#00ccff'; ctx.shadowBlur = 3;
      ctx.fillStyle = '#00ccff'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
      ctx.save();
      ctx.translate(36, 360); ctx.rotate(-0.2);
      ctx.fillText('DOWNTOWN', 0, 0); ctx.fillText('RAMP', 0, 8);
      ctx.restore();
      ctx.save();
      ctx.translate(TW - 58, 360); ctx.rotate(0.2);
      ctx.fillText('NEON', 0, 0); ctx.fillText('HIGHWAY', 0, 8);
      ctx.restore();
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      // Reactor label
      ctx.fillStyle = '#ff7733'; ctx.font = 'bold 6px monospace'; ctx.textAlign = 'center';
      ctx.globalAlpha = 0.55;
      ctx.fillText('REACTOR CORE', bCX, bCY + 45);
      ctx.globalAlpha = 1;

      // Demon targets label
      ctx.fillStyle = 'rgba(255,80,80,0.45)'; ctx.font = 'bold 6px monospace';
      ctx.fillText('DEMON', 82, dtY + 22);
      ctx.fillText('DEMON', TW - 82, dtY + 22);

      // CYBER label
      ctx.fillStyle = 'rgba(0,200,255,0.4)'; ctx.font = 'bold 7px monospace';
      ctx.fillText('▼ C · Y · B · E · R ▼', TW / 2, laneY + 22);

      // ── HUD overlays ──
      // Tilt
      if (g.tilted) {
        ctx.fillStyle = 'rgba(255,0,0,0.1)'; ctx.fillRect(0, 0, TW, TH);
        ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 25;
        ctx.fillStyle = '#ff0000'; ctx.font = 'bold 40px monospace'; ctx.textAlign = 'center';
        ctx.fillText('TILT', TW / 2, TH / 2); ctx.shadowBlur = 0;
      }

      // Message
      if (message) {
        const mg = linGrad(ctx, TW / 2 - 130, 0, TW / 2 + 130, 0);
        if (mg) {
          mg.addColorStop(0, 'rgba(0,0,0,0)');
          mg.addColorStop(0.12, 'rgba(0,0,0,0.85)');
          mg.addColorStop(0.88, 'rgba(0,0,0,0.85)');
          mg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = mg;
        } else {
          ctx.fillStyle = 'rgba(0,0,0,0.85)';
        }
        ctx.fillRect(TW / 2 - 130, TH / 2 - 20, 260, 40);
        ctx.strokeStyle = '#00e5ff'; ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 5; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(TW / 2 - 100, TH / 2 - 17); ctx.lineTo(TW / 2 + 100, TH / 2 - 17); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(TW / 2 - 100, TH / 2 + 17); ctx.lineTo(TW / 2 + 100, TH / 2 + 17); ctx.stroke();
        ctx.shadowBlur = 6; ctx.fillStyle = '#fff'; ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(message, TW / 2, TH / 2); ctx.shadowBlur = 0;
      }

      // Game over
      if (g.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, TW, TH);
        ctx.globalAlpha = 0.03;
        for (let y = 0; y < TH; y += 2) { ctx.fillStyle = '#fff'; ctx.fillRect(0, y, TW, 1); }
        ctx.globalAlpha = 1;
        ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 30;
        ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 32px monospace'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', TW / 2, TH / 2 - 40);
        ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 16;
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 22px monospace';
        ctx.fillText(g.score.toLocaleString(), TW / 2, TH / 2);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.font = '9px monospace';
        ctx.fillText('PRESS SPACE TO RESTART', TW / 2, TH / 2 + 35);
        if (g.maxCombo > 1) {
          ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.font = '8px monospace';
          ctx.fillText(`MAX COMBO: ${g.maxCombo}x`, TW / 2, TH / 2 + 52);
        }
      }

      // Demon mode banner
      if (g.demonMode) {
        const da = 0.55 + Math.sin(t * 7) * 0.35;
        ctx.fillStyle = `rgba(200, 30, 30, ${da * 0.14})`;
        ctx.fillRect(0, 0, TW, 16);
        ctx.fillStyle = `rgba(255, 60, 60, ${da})`;
        ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('👹 DEMON MODE 3x 👹', TW / 2, 11);
      }
      // Overdrive banner
      if (g.overdriveActive) {
        const oa = 0.55 + Math.sin(t * 8) * 0.3;
        ctx.fillStyle = `rgba(150, 70, 230, ${oa * 0.12})`;
        ctx.fillRect(0, g.demonMode ? 16 : 0, TW, 16);
        ctx.fillStyle = `rgba(150, 70, 230, ${oa})`;
        ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
        ctx.fillText('⚡ OVERDRIVE 2x ⚡', TW / 2, (g.demonMode ? 16 : 0) + 11);
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
          // Full reset
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
      if ((e.key === ' ' || e.key === 'Enter') && g.currentBall && !g.launched) {
        const power = clamp(g.plungerPower, 0, 1);
        if (!fin(g.currentBall.position.x) || !fin(g.currentBall.position.y)) return;
        Body.setStatic(g.currentBall, false);
        Body.applyForce(g.currentBall, g.currentBall.position, { x: 0, y: -(0.008 + power * 0.026) });
        g.plungerCharging = false; g.plungerPower = 0; g.launched = true;
        setPlungerDisplay(0);
        if (power > 0.62 && power < 0.8) showMsg('PERFECT LAUNCH!');
      }
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
    if (!g.currentBall || g.launched) return;
    const power = clamp(g.plungerPower, 0, 1);
    if (!fin(g.currentBall.position.x) || !fin(g.currentBall.position.y)) return;
    Body.setStatic(g.currentBall, false);
    Body.applyForce(g.currentBall, g.currentBall.position, { x: 0, y: -(0.008 + power * 0.026) });
    g.plungerCharging = false;
    g.plungerPower = 0;
    g.launched = true;
    setPlungerDisplay(0);
    if (power > 0.62 && power < 0.8) showMsg('PERFECT LAUNCH!');
  }, [showMsg]);

  const handleSliderChange = useCallback((value: number) => {
    const g = G.current;
    if (g.launched || g.gameOver) return;
    const c = clamp(value, 0, 1);
    g.plungerPower = c;
    g.plungerCharging = c > 0;
    setPlungerDisplay(c);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Score HUD */}
      <div className="w-full max-w-[420px] bg-black/60 border border-neon-cyan/30 rounded-xl p-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-neon-cyan font-mono">{score.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Balls</p>
            <div className="flex gap-1 justify-center mt-1">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < balls ? 'bg-neon-pink shadow-[0_0_6px_rgba(255,0,110,0.8)]' : 'bg-muted/30'}`} />
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground">Combo</p>
            <p className={`text-lg font-bold font-mono ${combo > 1 ? 'text-neon-pink' : 'text-muted-foreground'}`}>
              {combo > 0 ? `${Math.min(combo, 8)}x` : '--'}
            </p>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between mt-2 gap-2">
          {/* CYBER letters */}
          <div className="flex gap-1">
            {'CYBER'.split('').map((l, i) => (
              <span key={i} className={`text-[10px] font-bold font-mono px-1 py-0.5 rounded ${cyberLetters[i] ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' : 'bg-muted/10 text-muted-foreground border border-muted/20'}`}>{l}</span>
            ))}
          </div>
          {/* Reactor */}
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] text-muted-foreground">REACTOR</span>
            <div className="w-14 h-2 bg-muted/20 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${overdrive ? 'bg-purple-400 animate-pulse' : 'bg-orange-600'}`} style={{ width: `${reactorCharge}%` }} />
            </div>
          </div>
        </div>

        {/* Mode indicators */}
        <div className="flex justify-center gap-2 mt-1.5">
          {demonMode && <span className="text-[9px] text-red-400 font-bold animate-pulse">👹 DEMON 3x</span>}
          {overdrive && <span className="text-[9px] text-purple-400 font-bold animate-pulse">⚡ OVERDRIVE</span>}
          {lockedBalls > 0 && <span className="text-[9px] text-neon-pink font-bold">🔒 {lockedBalls}/2</span>}
          {tiltW > 0 && (
            <div className="flex items-center gap-0.5">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < tiltW ? 'bg-destructive' : 'bg-muted/30'}`} />
              ))}
              <span className="text-[9px] text-destructive ml-0.5">TILT</span>
            </div>
          )}
        </div>

        {/* Launch power slider */}
        <div className="mt-2 p-2 rounded-lg border border-neon-pink/40 bg-black/40">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] uppercase tracking-widest text-neon-pink font-bold">Launch Power</span>
            <span className="text-[11px] font-mono font-bold text-neon-pink">⚡ {Math.round(plungerDisplay * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(plungerDisplay * 100)}
            onChange={(e) => handleSliderChange(parseInt(e.target.value) / 100)}
            disabled={G.current.launched || gameOver}
            className="w-full h-3 appearance-none rounded-full cursor-pointer accent-neon-pink"
            style={{
              background: `linear-gradient(to right, rgba(255,0,110,0.7) 0%, rgba(255,0,110,0.7) ${plungerDisplay * 100}%, rgba(255,255,255,0.1) ${plungerDisplay * 100}%)`,
            }}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-[9px] text-muted-foreground">Drag slider, then tap LAUNCH</p>
            <div className="text-[8px] text-neon-cyan/50 font-mono">SKILL: 62-80%</div>
          </div>
          <button
            onClick={launchBall}
            disabled={G.current.launched || gameOver || plungerDisplay === 0}
            className="w-full mt-2 py-2.5 rounded-lg font-bold text-sm bg-neon-pink/20 border border-neon-pink/50 text-neon-pink active:bg-neon-pink/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {G.current.launched ? '🎯 LAUNCHED' : '🚀 LAUNCH'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_40px_rgba(124,58,237,0.15)]">
        <canvas ref={canvasRef} className="block" style={{ width: TW, height: TH }} />
      </div>

      {/* Mobile controls */}
      <div className="w-full max-w-[420px] grid grid-cols-3 gap-2 md:hidden touch-none select-none">
        <button className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-bold py-5 rounded-xl active:bg-neon-cyan/40 select-none text-sm touch-none"
          onTouchStart={(e) => { e.preventDefault(); flipperTouch('left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); flipperTouch('left', false); }}
          onTouchCancel={(e) => { e.preventDefault(); flipperTouch('left', false); }}
          onMouseDown={() => flipperTouch('left', true)}
          onMouseUp={() => flipperTouch('left', false)}
          onMouseLeave={() => flipperTouch('left', false)}>◀ LEFT</button>
        <button
          type="button"
          className="border border-neon-pink/40 rounded-xl touch-none select-none bg-neon-pink/20 font-bold text-sm text-neon-pink active:bg-neon-pink/40 disabled:opacity-30 disabled:cursor-not-allowed"
          onClick={launchBall}
          disabled={G.current.launched || gameOver || plungerDisplay === 0}
        >
          {G.current.launched ? '🎯' : `🚀 ${Math.round(plungerDisplay * 100)}%`}
        </button>
        <button className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-bold py-5 rounded-xl active:bg-neon-cyan/40 select-none text-sm touch-none"
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
