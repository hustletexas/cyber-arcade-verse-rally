import React, { useRef, useEffect, useState, useCallback } from 'react';
import Matter from 'matter-js';

const { Engine, Runner, Bodies, Body, Composite, Events, Constraint, Vector } = Matter;

// ── Table dimensions (wide-body) ──
const TW = 440;
const TH = 780;
const BALL_R = 7;
const FW = 72; // flipper width
const FH = 13;
const WALL = 10;
const BUMPER_R = 16;
const PLUNGER_X = TW - 18;

// ── Colours ──
const C = {
  bg: '#0a0812',
  playfield: '#110a1e',
  wall: '#1a1a2e',
  wallGlow: '#00e5ff',
  flipper: '#00e5ff',
  ball: '#ff00ff',
  bumper: '#9333ea',
  bumperHit: '#e879f9',
  bumperStroke: '#c084fc',
  slingshot: '#facc15',
  rampCyan: '#22d3ee',
  rampPink: '#ff006e',
  target: '#00e5ff',
  pink: '#ff006e',
  purple: '#7c3aed',
  reactorCore: '#a855f7',
  text: '#e2e8f0',
  skyline: '#00e5ff',
};

interface CyberPinballProps {
  onScoreUpdate?: (score: number) => void;
  onBallLost?: (ballsLeft: number) => void;
  onGameOver?: (finalScore: number) => void;
}

type Particle = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number };
type Raindrop = { x: number; y: number; speed: number; len: number };

export const CyberPinball: React.FC<CyberPinballProps> = ({ onScoreUpdate, onBallLost, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const animRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const rain = useRef<Raindrop[]>([]);
  const frame = useRef(0);

  const G = useRef({
    score: 0, balls: 3, gameOver: false,
    currentBall: null as Matter.Body | null,
    leftUp: false, rightUp: false,
    leftFlipper: null as Matter.Body | null,
    rightFlipper: null as Matter.Body | null,
    plungerPower: 0, plungerCharging: false, launched: false,
    tiltWarnings: 0, tilted: false,
    combo: 0, comboTimer: 0,
    // CCA lanes
    ccaLanes: [false, false, false] as boolean[],
    // Reactor Core
    reactorCharge: 0, // 0-100
    overdrive: false, overdriveTimer: 0,
    // CYBER targets (5 in sequence)
    cyberTargets: [false, false, false, false, false] as boolean[],
    cyberIndex: 0, // next expected target
    cyberSurge: false, cyberSurgeTimer: 0,
    // Ramp hit counts
    downtownHits: 0, neonHits: 0,
    downtownRush: false, downtownRushTimer: 0,
    // Orbit combo
    orbitCombo: 0, lastOrbitSide: '' as string,
    // Multiball
    lockedBalls: 0, multiball: false,
    extraBalls: [] as Matter.Body[],
    // Kickback
    kickbackActive: false,
    // Visuals
    bumperFlash: new Map<string, number>(),
    lightningFlash: 0,
    shake: { x: 0, y: 0, power: 0 },
    trail: [] as Array<{ x: number; y: number; age: number }>,
    spinnerAngle: 0, spinnerSpeed: 0,
    skillShot: true,
    // Skyline buildings that light up
    buildingLit: new Array(12).fill(false) as boolean[],
  });

  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(3);
  const [tiltW, setTiltW] = useState(0);
  const [tilted, setTilted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [ccaLanes, setCcaLanes] = useState([false, false, false]);
  const [reactorCharge, setReactorCharge] = useState(0);
  const [overdrive, setOverdrive] = useState(false);
  const [cyberTargets, setCyberTargets] = useState([false, false, false, false, false]);
  const [message, setMessage] = useState('');
  const [downtownHits, setDowntownHits] = useState(0);
  const [neonHits, setNeonHits] = useState(0);
  const [lockedBalls, setLockedBalls] = useState(0);

  const showMsg = useCallback((msg: string, dur = 2000) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), dur);
  }, []);

  const addScore = useCallback((pts: number) => {
    const g = G.current;
    if (g.tilted || g.gameOver) return;
    g.combo++;
    g.comboTimer = Date.now() + 3000;
    const mult = Math.min(g.combo, 5);
    const overdriveMult = g.overdrive ? 2 : 1;
    const surgeMult = g.cyberSurge ? 1.5 : 1;
    const total = Math.round(pts * mult * overdriveMult * surgeMult);
    g.score += total;
    setScore(g.score);
    setCombo(g.combo);
    onScoreUpdate?.(g.score);
    if (mult > 1) showMsg(`${mult}x COMBO! +${total}`);
  }, [onScoreUpdate, showMsg]);

  const spawnParticles = useCallback((x: number, y: number, count: number, color: string, spread = 5) => {
    for (let i = 0; i < count; i++) {
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 0.5) * spread - 2,
        life: 25 + Math.random() * 15,
        maxLife: 40,
        color, size: 1.5 + Math.random() * 2.5,
      });
    }
  }, []);

  // ── Initialize physics ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = Engine.create({ gravity: { x: 0, y: 1.4, scale: 0.001 } });
    engineRef.current = engine;
    const ctx = canvas.getContext('2d')!;
    canvas.width = TW;
    canvas.height = TH;

    const w: Matter.Body[] = []; // walls

    // ── Outer walls ──
    w.push(Bodies.rectangle(WALL / 2, TH / 2, WALL, TH, { isStatic: true, label: 'wall' }));
    w.push(Bodies.rectangle(TW - WALL / 2, TH / 2 - 120, WALL, TH - 240, { isStatic: true, label: 'wall' }));
    w.push(Bodies.rectangle(TW / 2, WALL / 2, TW, WALL, { isStatic: true, label: 'wall' }));
    w.push(Bodies.rectangle(TW / 2, TH + 20, TW, 40, { isStatic: true, label: 'drain' }));
    // Plunger lane walls
    w.push(Bodies.rectangle(TW - WALL / 2, TH - 60, WALL, 120, { isStatic: true, label: 'wall' }));
    w.push(Bodies.rectangle(TW - 38, TH - 200, 5, 220, { isStatic: true, label: 'wall', angle: 0.04 }));
    w.push(Bodies.rectangle(TW - 55, TH - 330, 55, 5, { isStatic: true, label: 'wall', angle: -0.35 }));

    // ── Left orbit lane (curved wall segments) ──
    w.push(Bodies.rectangle(22, 200, 5, 250, { isStatic: true, label: 'orbit_wall' }));
    w.push(Bodies.rectangle(40, 75, 50, 5, { isStatic: true, label: 'orbit_wall', angle: -0.3 }));
    // Right orbit
    w.push(Bodies.rectangle(TW - 50, 200, 5, 250, { isStatic: true, label: 'orbit_wall' }));
    w.push(Bodies.rectangle(TW - 65, 75, 50, 5, { isStatic: true, label: 'orbit_wall', angle: 0.3 }));

    // Orbit sensors
    const leftOrbitSensor = Bodies.rectangle(30, 120, 20, 10, { isStatic: true, isSensor: true, label: 'orbit_left' });
    const rightOrbitSensor = Bodies.rectangle(TW - 58, 120, 20, 10, { isStatic: true, isSensor: true, label: 'orbit_right' });

    // ── Outlanes & inlanes ──
    w.push(Bodies.rectangle(32, TH - 180, 5, 140, { isStatic: true, label: 'wall', angle: 0.12 }));
    w.push(Bodies.rectangle(TW - 62, TH - 180, 5, 140, { isStatic: true, label: 'wall', angle: -0.12 }));
    w.push(Bodies.rectangle(68, TH - 150, 5, 100, { isStatic: true, label: 'wall', angle: 0.18 }));
    w.push(Bodies.rectangle(TW - 98, TH - 150, 5, 100, { isStatic: true, label: 'wall', angle: -0.18 }));

    // ── Flippers ──
    const lfX = TW / 2 - 58, rfX = TW / 2 + 58, fY = TH - 72;
    const lf = Bodies.rectangle(lfX, fY, FW, FH, { label: 'leftFlipper', density: 0.02, frictionAir: 0.02, chamfer: { radius: 5 } });
    const rf = Bodies.rectangle(rfX, fY, FW, FH, { label: 'rightFlipper', density: 0.02, frictionAir: 0.02, chamfer: { radius: 5 } });
    const lp = Constraint.create({ bodyA: lf, pointA: { x: -FW / 2 + 7, y: 0 }, pointB: { x: lfX - FW / 2 + 7, y: fY }, stiffness: 1, length: 0 });
    const rp = Constraint.create({ bodyA: rf, pointA: { x: FW / 2 - 7, y: 0 }, pointB: { x: rfX + FW / 2 - 7, y: fY }, stiffness: 1, length: 0 });
    G.current.leftFlipper = lf;
    G.current.rightFlipper = rf;

    // ── Slingshots (wider) ──
    const lSling = Bodies.fromVertices(88, TH - 155, [[ { x: 0, y: 0 }, { x: 35, y: 55 }, { x: -5, y: 55 } ]], { isStatic: true, label: 'slingshot', restitution: 1.3 });
    const rSling = Bodies.fromVertices(TW - 118, TH - 155, [[ { x: 0, y: 0 }, { x: 5, y: 55 }, { x: -35, y: 55 } ]], { isStatic: true, label: 'slingshot', restitution: 1.3 });

    // ── ZONE 2: Reactor Core (3 bumpers + center) ──
    const rcX = TW / 2, rcY = 240;
    const bumpers = [
      Bodies.circle(rcX, rcY - 42, BUMPER_R, { isStatic: true, label: 'bumper_0', restitution: 1.1 }),
      Bodies.circle(rcX - 38, rcY + 22, BUMPER_R, { isStatic: true, label: 'bumper_1', restitution: 1.1 }),
      Bodies.circle(rcX + 38, rcY + 22, BUMPER_R, { isStatic: true, label: 'bumper_2', restitution: 1.1 }),
    ];
    // Reactor core sensor (center of triangle)
    const reactorSensor = Bodies.circle(rcX, rcY, 10, { isStatic: true, isSensor: true, label: 'reactor_core' });

    // ── ZONE 1: CCA Rollover lanes ──
    const laneY = 55;
    const ccaSensors = [
      Bodies.rectangle(TW / 2 - 55, laneY, 12, 28, { isStatic: true, isSensor: true, label: 'cca_0' }),
      Bodies.rectangle(TW / 2, laneY, 12, 28, { isStatic: true, isSensor: true, label: 'cca_1' }),
      Bodies.rectangle(TW / 2 + 55, laneY, 12, 28, { isStatic: true, isSensor: true, label: 'cca_2' }),
    ];
    const laneGuides = [
      Bodies.rectangle(TW / 2 - 82, laneY, 3, 38, { isStatic: true, label: 'wall' }),
      Bodies.rectangle(TW / 2 - 28, laneY, 3, 38, { isStatic: true, label: 'wall' }),
      Bodies.rectangle(TW / 2 + 28, laneY, 3, 38, { isStatic: true, label: 'wall' }),
      Bodies.rectangle(TW / 2 + 82, laneY, 3, 38, { isStatic: true, label: 'wall' }),
    ];

    // ── ZONE 3: Downtown Ramp (left) ──
    const lRamp = Bodies.rectangle(55, 340, 5, 180, { isStatic: true, label: 'ramp_left', angle: 0.22 });
    const lRampGuide = Bodies.rectangle(80, 340, 5, 180, { isStatic: true, label: 'ramp_guide', angle: 0.22 });
    const lRampSensor = Bodies.rectangle(55, 250, 15, 10, { isStatic: true, isSensor: true, label: 'ramp_left_hit' });

    // ── ZONE 4: Neon Highway Ramp (right) ──
    const rRamp = Bodies.rectangle(TW - 85, 340, 5, 180, { isStatic: true, label: 'ramp_right', angle: -0.22 });
    const rRampGuide = Bodies.rectangle(TW - 110, 340, 5, 180, { isStatic: true, label: 'ramp_guide', angle: -0.22 });
    const rRampSensor = Bodies.rectangle(TW - 85, 250, 15, 10, { isStatic: true, isSensor: true, label: 'ramp_right_hit' });

    // ── ZONE 5: CYBER Target Bank (5 narrow targets) ──
    const cyberY = 440;
    const cyberSpacing = 28;
    const cyberStartX = TW / 2 - (cyberSpacing * 2);
    const cyberBodies = 'CYBER'.split('').map((_, i) =>
      Bodies.rectangle(cyberStartX + i * cyberSpacing, cyberY, 5, 22, { isStatic: true, isSensor: true, label: `cyber_${i}` })
    );
    // Backing wall behind targets
    w.push(Bodies.rectangle(TW / 2, cyberY - 15, cyberSpacing * 5 + 10, 4, { isStatic: true, label: 'wall' }));

    // ── Spinner (Reactor area) ──
    const spinner = Bodies.rectangle(rcX, rcY - 80, 36, 3, { isStatic: true, isSensor: true, label: 'spinner' });

    // ── Kickback (left outlane) ──
    const kickback = Bodies.rectangle(16, TH - 220, 7, 35, { isStatic: true, label: 'kickback', restitution: 1.8 });

    // ── Multiball lock sensor (behind reactor) ──
    const lockSensor = Bodies.rectangle(rcX, rcY + 65, 30, 8, { isStatic: true, isSensor: true, label: 'multiball_lock' });

    // Add all
    Composite.add(engine.world, [
      ...w, lf, rf, lp, rp,
      lSling || Bodies.circle(0, 0, 1, { isStatic: true }),
      rSling || Bodies.circle(0, 0, 1, { isStatic: true }),
      ...bumpers, reactorSensor,
      ...ccaSensors, ...laneGuides,
      lRamp, lRampGuide, lRampSensor,
      rRamp, rRampGuide, rRampSensor,
      ...cyberBodies,
      spinner, kickback, lockSensor,
      leftOrbitSensor, rightOrbitSensor,
    ]);

    // ── Collision events ──
    Events.on(engine, 'collisionStart', (event) => {
      const g = G.current;
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        const ball = labels.includes('ball') ? (pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB) : null;
        if (!ball) continue;

        // Drain
        if (labels.includes('drain')) { handleDrain(ball); continue; }

        // Bumpers → Reactor charge
        for (let i = 0; i < 3; i++) {
          if (labels.includes(`bumper_${i}`)) {
            addScore(100);
            g.bumperFlash.set(`bumper_${i}`, Date.now() + 300);
            g.shake.power = 5;
            g.lightningFlash = 0.4;
            // Reactor charge
            g.reactorCharge = Math.min(g.reactorCharge + 12, 100);
            setReactorCharge(g.reactorCharge);
            if (g.reactorCharge >= 100 && !g.overdrive) {
              g.overdrive = true;
              g.overdriveTimer = Date.now() + 12000;
              setOverdrive(true);
              showMsg('⚡ OVERDRIVE! 2x SCORING!', 3000);
              g.lightningFlash = 1;
            }
            // Bounce
            const bmp = pair.bodyA.label === `bumper_${i}` ? pair.bodyA : pair.bodyB;
            const d = Vector.normalise(Vector.sub(ball.position, bmp.position));
            Body.applyForce(ball, ball.position, { x: d.x * 0.009, y: d.y * 0.009 });
            spawnParticles(ball.position.x, ball.position.y, 10, 'rgba(232, 121, 249, 1)', 6);
            // Light a building
            const unlit = g.buildingLit.findIndex(b => !b);
            if (unlit >= 0) g.buildingLit[unlit] = true;
          }
        }

        // Slingshots
        if (labels.includes('slingshot')) {
          addScore(50);
          g.shake.power = 2;
          spawnParticles(ball.position.x, ball.position.y, 5, 'rgba(250, 204, 21, 1)', 4);
        }

        // CCA lanes
        for (let i = 0; i < 3; i++) {
          if (labels.includes(`cca_${i}`) && !g.ccaLanes[i]) {
            g.ccaLanes[i] = true;
            setCcaLanes([...g.ccaLanes]);
            addScore(500);
            showMsg(['C', 'C', 'A'][i] + ' LANE LIT!');
            // Light building
            const unlit = g.buildingLit.findIndex(b => !b);
            if (unlit >= 0) g.buildingLit[unlit] = true;
            if (g.ccaLanes.every(Boolean)) {
              addScore(10000);
              showMsg('🌆 SKYLINE JACKPOT! +10,000', 3000);
              g.ccaLanes = [false, false, false];
              setCcaLanes([false, false, false]);
              g.buildingLit = new Array(12).fill(true);
              g.lightningFlash = 1;
              setTimeout(() => { g.buildingLit = new Array(12).fill(false); }, 5000);
            }
          }
        }

        // Orbits
        if (labels.includes('orbit_left') || labels.includes('orbit_right')) {
          const side = labels.includes('orbit_left') ? 'left' : 'right';
          if (g.lastOrbitSide !== side) {
            g.orbitCombo++;
            g.lastOrbitSide = side;
            addScore(200 * g.orbitCombo);
            showMsg(`ORBIT x${g.orbitCombo}! +${200 * g.orbitCombo}`);
          } else {
            g.orbitCombo = 1;
            g.lastOrbitSide = side;
            addScore(200);
          }
        }

        // Ramps
        if (labels.includes('ramp_left_hit')) {
          g.downtownHits++;
          setDowntownHits(g.downtownHits);
          addScore(300);
          showMsg(`DOWNTOWN RUSH! (${g.downtownHits}/3)`);
          if (g.downtownHits >= 3 && !g.downtownRush) {
            g.downtownRush = true;
            g.downtownRushTimer = Date.now() + 15000;
            showMsg('🔥 DOWNTOWN RUSH MODE!', 3000);
          }
          spawnParticles(ball.position.x, ball.position.y, 6, 'rgba(34, 211, 238, 1)');
        }
        if (labels.includes('ramp_right_hit')) {
          g.neonHits++;
          setNeonHits(g.neonHits);
          addScore(300);
          showMsg(`NEON HIGHWAY! (${g.neonHits})`);
          spawnParticles(ball.position.x, ball.position.y, 6, 'rgba(255, 0, 110, 1)');
        }

        // CYBER targets (must hit in sequence)
        for (let i = 0; i < 5; i++) {
          if (labels.includes(`cyber_${i}`)) {
            if (i === g.cyberIndex) {
              g.cyberTargets[i] = true;
              setCyberTargets([...g.cyberTargets]);
              g.cyberIndex++;
              addScore(400);
              showMsg('CYBER'.charAt(i) + ' HIT!');
              spawnParticles(ball.position.x, ball.position.y, 8, 'rgba(0, 229, 255, 1)');
              if (g.cyberIndex >= 5) {
                g.cyberSurge = true;
                g.cyberSurgeTimer = Date.now() + 15000;
                showMsg('⚡ CYBER SURGE! 1.5x SCORING!', 3000);
                g.lightningFlash = 0.8;
              }
            } else {
              // Wrong sequence — reset
              g.cyberTargets.fill(false);
              g.cyberIndex = 0;
              setCyberTargets([false, false, false, false, false]);
              showMsg('SEQUENCE RESET');
            }
          }
        }

        // Spinner
        if (labels.includes('spinner')) {
          g.spinnerSpeed = 18;
          addScore(25);
        }

        // Kickback
        if (labels.includes('kickback') && g.kickbackActive) {
          Body.applyForce(ball, ball.position, { x: 0.003, y: -0.018 });
          addScore(100);
          showMsg('KICKBACK!');
          g.kickbackActive = false;
        }

        // Multiball lock
        if (labels.includes('multiball_lock') && !g.multiball && g.lockedBalls < 2) {
          g.lockedBalls++;
          setLockedBalls(g.lockedBalls);
          addScore(1000);
          showMsg(`BALL LOCKED! (${g.lockedBalls}/2)`);
          if (g.lockedBalls >= 2) {
            // CYBER STORM MULTIBALL
            g.multiball = true;
            g.lightningFlash = 1;
            g.shake.power = 8;
            showMsg('🌩 CYBER STORM MULTIBALL!', 4000);
            // Spawn 2 extra balls
            for (let b = 0; b < 2; b++) {
              const extra = Bodies.circle(TW / 2 + (b - 0.5) * 40, 100, BALL_R, {
                label: 'ball', restitution: 0.45, friction: 0.01, frictionAir: 0.001, density: 0.004,
              });
              Composite.add(engine.world, extra);
              g.extraBalls.push(extra);
              Body.applyForce(extra, extra.position, { x: (Math.random() - 0.5) * 0.005, y: 0.005 });
            }
          }
        }

        // Skill shot
        if (g.skillShot && labels.includes('cca_1')) {
          addScore(3000);
          showMsg('🎯 SKILL SHOT! +3000', 2500);
          g.skillShot = false;
          spawnParticles(ball.position.x, ball.position.y, 15, 'rgba(255, 255, 255, 1)', 8);
        }
      }
    });

    const handleDrain = (ball: Matter.Body) => {
      const g = G.current;
      Composite.remove(engine.world, ball);
      const extraIdx = g.extraBalls.indexOf(ball);
      if (extraIdx >= 0) {
        g.extraBalls.splice(extraIdx, 1);
        if (g.extraBalls.length === 0 && g.multiball) {
          g.multiball = false;
          showMsg('MULTIBALL ENDED');
        }
        return;
      }
      g.currentBall = null;
      g.balls--;
      g.launched = false;
      g.skillShot = true;
      g.orbitCombo = 0;
      g.lastOrbitSide = '';
      setBalls(g.balls);
      onBallLost?.(g.balls);
      if (g.balls <= 0) {
        g.gameOver = true;
        setGameOver(true);
        onGameOver?.(g.score);
        showMsg('GAME OVER');
      } else {
        showMsg(`BALL LOST — ${g.balls} LEFT`);
        setTimeout(() => spawnBall(), 1200);
      }
    };

    const spawnBall = () => {
      const g = G.current;
      if (g.currentBall || g.gameOver) return;
      const ball = Bodies.circle(PLUNGER_X, TH - 40, BALL_R, {
        label: 'ball', restitution: 0.45, friction: 0.01, frictionAir: 0.001, density: 0.004,
      });
      Composite.add(engine.world, ball);
      g.currentBall = ball;
      g.launched = false;
      g.tilted = false;
      g.tiltWarnings = 0;
      setTilted(false);
      setTiltW(0);
    };

    setTimeout(() => spawnBall(), 500);

    const runner = Runner.create();
    Runner.run(runner, engine);
    runnerRef.current = runner;

    // ═══════════════════════════════════════
    // ──────── RENDER LOOP ────────
    // ═══════════════════════════════════════
    const renderLoop = () => {
      const g = G.current;
      const f = frame.current++;
      const t = f * 0.016;

      // Timers
      if (g.combo > 0 && Date.now() > g.comboTimer) { g.combo = 0; setCombo(0); }
      if (g.overdrive && Date.now() > g.overdriveTimer) {
        g.overdrive = false; g.reactorCharge = 0;
        setOverdrive(false); setReactorCharge(0);
      }
      if (g.cyberSurge && Date.now() > g.cyberSurgeTimer) {
        g.cyberSurge = false;
        g.cyberTargets.fill(false); g.cyberIndex = 0;
        setCyberTargets([false, false, false, false, false]);
      }
      if (g.downtownRush && Date.now() > g.downtownRushTimer) {
        g.downtownRush = false; g.downtownHits = 0;
        setDowntownHits(0);
      }

      // Unlock kickback after completing CYBER targets once
      if (g.cyberIndex >= 5) g.kickbackActive = true;

      // Flipper physics
      if (g.leftFlipper) {
        const ta = g.leftUp ? -0.55 : 0.4;
        Body.setAngularVelocity(g.leftFlipper, (ta - g.leftFlipper.angle) * 0.35);
      }
      if (g.rightFlipper) {
        const ta = g.rightUp ? 0.55 : -0.4;
        Body.setAngularVelocity(g.rightFlipper, (ta - g.rightFlipper.angle) * 0.35);
      }

      // Plunger
      if (g.plungerCharging && !g.launched) {
        g.plungerPower = Math.min(g.plungerPower + 0.018, 1);
      }

      // Spinner
      if (g.spinnerSpeed > 0) {
        g.spinnerSpeed *= 0.96;
        g.spinnerAngle += g.spinnerSpeed;
        if (g.spinnerSpeed < 0.5) g.spinnerSpeed = 0;
      }

      // ══════ DRAW ══════
      ctx.save();

      // Screen shake
      if (g.shake.power > 0) {
        g.shake.x = (Math.random() - 0.5) * g.shake.power;
        g.shake.y = (Math.random() - 0.5) * g.shake.power;
        ctx.translate(g.shake.x, g.shake.y);
        g.shake.power *= 0.82;
        if (g.shake.power < 0.2) g.shake.power = 0;
      }

      // ── Dark purple playfield ──
      const pfGrad = ctx.createLinearGradient(0, 0, 0, TH);
      pfGrad.addColorStop(0, '#0d0820');
      pfGrad.addColorStop(0.3, '#110a1e');
      pfGrad.addColorStop(0.6, '#0e0918');
      pfGrad.addColorStop(1, '#0a0612');
      ctx.fillStyle = pfGrad;
      ctx.fillRect(0, 0, TW, TH);

      // Brushed metal texture
      ctx.globalAlpha = 0.025;
      for (let y = 0; y < TH; y += 3) {
        ctx.strokeStyle = y % 6 === 0 ? '#8b5cf6' : '#000';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(TW, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // ── Rain ──
      const rd = rain.current;
      if (rd.length < 50) rd.push({ x: Math.random() * TW, y: -10, speed: 2 + Math.random() * 3, len: 10 + Math.random() * 18 });
      ctx.globalAlpha = 0.05;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 0.5;
      for (let i = rd.length - 1; i >= 0; i--) {
        const r = rd[i];
        ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.lineTo(r.x - 0.8, r.y + r.len); ctx.stroke();
        r.y += r.speed;
        if (r.y > TH) rd.splice(i, 1);
      }
      ctx.globalAlpha = 1;

      // ── Ambient glow ──
      // Reactor glow
      const reactorGlowSize = 80 + g.reactorCharge * 0.8;
      const reactorGlowAlpha = g.overdrive ? 0.2 + Math.sin(t * 6) * 0.08 : 0.05 + g.reactorCharge * 0.001;
      const rGlow = ctx.createRadialGradient(rcX, rcY, 5, rcX, rcY, reactorGlowSize);
      rGlow.addColorStop(0, `rgba(168, 85, 247, ${reactorGlowAlpha})`);
      rGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = rGlow;
      ctx.fillRect(rcX - reactorGlowSize, rcY - reactorGlowSize, reactorGlowSize * 2, reactorGlowSize * 2);

      // Flipper glow
      const fGlow = ctx.createRadialGradient(TW / 2, fY, 10, TW / 2, fY, 100);
      fGlow.addColorStop(0, 'rgba(0, 229, 255, 0.05)');
      fGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = fGlow;
      ctx.fillRect(0, TH - 200, TW, 200);

      // ── Lightning ──
      if (g.lightningFlash > 0) {
        ctx.fillStyle = `rgba(200, 220, 255, ${g.lightningFlash * 0.12})`;
        ctx.fillRect(0, 0, TW, TH);
        g.lightningFlash *= 0.88;
        if (g.lightningFlash < 0.03) g.lightningFlash = 0;
      }

      // ── Neon grid ──
      ctx.globalAlpha = 0.015 + Math.sin(t * 0.5) * 0.003;
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < TW; x += 35) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, TH); ctx.stroke(); }
      for (let y = 0; y < TH; y += 35) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TW, y); ctx.stroke(); }
      ctx.globalAlpha = 1;

      // ── Houston Skyline (top) ──
      const bldgs = [
        { x: 25, h: 70 }, { x: 55, h: 55 }, { x: 80, h: 82 }, { x: 110, h: 48 },
        { x: 140, h: 65 }, { x: 165, h: 40 }, { x: 195, h: 88 }, { x: 220, h: 60 },
        { x: 250, h: 72 }, { x: 280, h: 50 }, { x: 310, h: 78 }, { x: 345, h: 58 },
      ];
      ctx.save();
      for (let bi = 0; bi < bldgs.length; bi++) {
        const b = bldgs[bi];
        const lit = g.buildingLit[bi];
        const baseAlpha = lit ? 0.2 + Math.sin(t * 3 + bi) * 0.05 : 0.04;
        ctx.fillStyle = lit ? `rgba(0, 229, 255, ${baseAlpha})` : `rgba(100, 100, 140, ${baseAlpha})`;
        ctx.fillRect(b.x - 9, 90 - b.h + 40, 18, b.h);
        // Windows
        const wAlpha = lit ? 0.5 : 0.08;
        ctx.fillStyle = `rgba(0, 229, 255, ${wAlpha})`;
        for (let wy = 90 - b.h + 46; wy < 90 + 34; wy += 7) {
          ctx.fillRect(b.x - 5, wy, 2, 2);
          ctx.fillRect(b.x + 2, wy, 2, 2);
        }
        // Glow if lit
        if (lit) {
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 8;
          ctx.fillStyle = 'rgba(0, 229, 255, 0.03)';
          ctx.fillRect(b.x - 12, 90 - b.h + 35, 24, b.h + 10);
          ctx.shadowBlur = 0;
        }
      }
      ctx.restore();

      // ── Ball trail (plasma) ──
      if (g.currentBall && g.launched) {
        g.trail.push({ x: g.currentBall.position.x, y: g.currentBall.position.y, age: 0 });
        if (g.trail.length > 25) g.trail.shift();
      }
      for (let i = g.trail.length - 1; i >= 0; i--) {
        const pt = g.trail[i];
        pt.age++;
        if (pt.age > 25) { g.trail.splice(i, 1); continue; }
        const a = 1 - pt.age / 25;
        const s = BALL_R * a * 0.7;
        const trailGrad = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, s + 3);
        trailGrad.addColorStop(0, `rgba(255, 0, 255, ${a * 0.35})`);
        trailGrad.addColorStop(1, `rgba(168, 85, 247, 0)`);
        ctx.fillStyle = trailGrad;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, s + 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Particles ──
      const parts = particles.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life--;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        const a = p.life / p.maxLife;
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${a})`);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── Draw bodies ──
      const bodies = Composite.allBodies(engine.world);
      for (const body of bodies) {
        if (body.label === 'drain') continue;
        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        if (body.label === 'ball') {
          // Plasma ball
          for (let r = 3; r >= 1; r--) {
            ctx.fillStyle = `rgba(255, 0, 255, ${0.04 * r})`;
            ctx.beginPath(); ctx.arc(0, 0, BALL_R + r * 6, 0, Math.PI * 2); ctx.fill();
          }
          const bg = ctx.createRadialGradient(-2, -2, 1, 0, 0, BALL_R);
          bg.addColorStop(0, '#ffffff');
          bg.addColorStop(0.25, '#ff88ff');
          bg.addColorStop(0.6, '#cc00cc');
          bg.addColorStop(1, '#550055');
          ctx.shadowColor = '#ff00ff';
          ctx.shadowBlur = 28;
          ctx.fillStyle = bg;
          ctx.beginPath(); ctx.arc(0, 0, BALL_R, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.beginPath(); ctx.arc(-2, -2, 2, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(255,0,255,0.5)';
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.arc(0, 0, BALL_R + 1, 0, Math.PI * 2); ctx.stroke();
        } else if (body.label.startsWith('bumper_')) {
          const flashing = g.bumperFlash.has(body.label) && Date.now() < g.bumperFlash.get(body.label)!;
          ctx.shadowColor = flashing ? '#fff' : C.bumperStroke;
          ctx.shadowBlur = flashing ? 40 : 14;
          const bg = ctx.createRadialGradient(0, 0, 2, 0, 0, BUMPER_R);
          bg.addColorStop(0, flashing ? '#fff' : '#c084fc');
          bg.addColorStop(0.5, flashing ? '#e879f9' : '#7c3aed');
          bg.addColorStop(1, flashing ? '#a855f7' : '#4c1d95');
          ctx.fillStyle = bg;
          ctx.beginPath(); ctx.arc(0, 0, BUMPER_R, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = flashing ? '#fff' : C.bumperStroke;
          ctx.lineWidth = 2.5; ctx.stroke();
          ctx.strokeStyle = `rgba(232,121,249,${flashing ? 1 : 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(0, 0, BUMPER_R - 5, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('100', 0, 1);
        } else if (body.label === 'leftFlipper' || body.label === 'rightFlipper') {
          const up = body.label === 'leftFlipper' ? g.leftUp : g.rightUp;
          const fg = ctx.createLinearGradient(-FW / 2, 0, FW / 2, 0);
          fg.addColorStop(0, up ? '#00ffff' : '#007788');
          fg.addColorStop(0.5, up ? '#66ffff' : '#00aacc');
          fg.addColorStop(1, up ? '#00dddd' : '#005566');
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = up ? 22 : 6;
          ctx.fillStyle = fg;
          ctx.beginPath(); ctx.roundRect(-FW / 2, -FH / 2, FW, FH, 6); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255,255,255,${up ? 0.3 : 0.08})`;
          ctx.beginPath(); ctx.roundRect(-FW / 2 + 3, -FH / 2 + 1, FW - 6, 3, 2); ctx.fill();
          ctx.strokeStyle = `rgba(0,229,255,${up ? 0.8 : 0.3})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.roundRect(-FW / 2, -FH / 2, FW, FH, 6); ctx.stroke();
        } else if (body.label === 'wall' || body.label === 'orbit_wall' || body.label === 'ramp_guide') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.fillStyle = '#1a1a30';
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath(); ctx.fill();
          ctx.shadowColor = body.label === 'orbit_wall' ? '#7c3aed' : '#00e5ff';
          ctx.shadowBlur = 3;
          ctx.strokeStyle = body.label === 'orbit_wall'
            ? `rgba(124, 58, 237, ${0.3 + Math.sin(t * 1.5 + body.position.y * 0.02) * 0.1})`
            : `rgba(0, 229, 255, ${0.2 + Math.sin(t * 2 + body.position.x * 0.03) * 0.08})`;
          ctx.lineWidth = 1.5; ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (body.label === 'slingshot') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.fillStyle = '#d97706';
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath(); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(255,255,255,0.3)'; ctx.lineWidth = 1; ctx.stroke();
        } else if (body.label.startsWith('ramp_left') || body.label.startsWith('ramp_right')) {
          if (!body.label.includes('hit') && !body.label.includes('guide')) {
            const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
            const isLeft = body.label.includes('left');
            ctx.shadowColor = isLeft ? C.rampCyan : C.pink;
            ctx.shadowBlur = 8;
            ctx.strokeStyle = isLeft ? C.rampCyan : C.pink;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(verts[0].x, verts[0].y);
            for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
            ctx.closePath(); ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.setLineDash([5, 8]);
            ctx.lineDashOffset = -t * 35;
            ctx.strokeStyle = isLeft ? 'rgba(34,211,238,0.35)' : 'rgba(255,0,110,0.35)';
            ctx.lineWidth = 1; ctx.stroke();
            ctx.setLineDash([]);
          }
        } else if (body.label.startsWith('cca_')) {
          const idx = parseInt(body.label.split('_')[1]);
          const lit = g.ccaLanes[idx];
          if (lit) {
            ctx.shadowColor = C.target; ctx.shadowBlur = 18;
            const ig = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
            ig.addColorStop(0, '#fff'); ig.addColorStop(0.4, '#00e5ff'); ig.addColorStop(1, 'rgba(0,229,255,0.2)');
            ctx.fillStyle = ig;
          } else {
            ctx.fillStyle = `rgba(0,229,255,${0.08 + Math.sin(t * 2 + idx) * 0.04})`;
          }
          ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = lit ? '#00e5ff' : 'rgba(0,229,255,0.25)';
          ctx.lineWidth = 1.5; ctx.stroke();
          ctx.fillStyle = lit ? '#fff' : 'rgba(255,255,255,0.4)';
          ctx.font = `bold ${lit ? 10 : 8}px monospace`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(['C', 'C', 'A'][idx], 0, 1);
        } else if (body.label.startsWith('cyber_')) {
          const idx = parseInt(body.label.split('_')[1]);
          const hit = g.cyberTargets[idx];
          const isNext = idx === g.cyberIndex;
          const pulse = isNext ? Math.sin(t * 5) * 0.3 + 0.7 : 0.3;
          ctx.fillStyle = hit ? '#00e5ff' : `rgba(0, 229, 255, ${pulse})`;
          if (hit) { ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 12; }
          else if (isNext) { ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 6; }
          ctx.beginPath(); ctx.roundRect(-3, -11, 6, 22, 2); ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = hit ? '#00e5ff' : 'rgba(0,229,255,0.4)';
          ctx.lineWidth = 1; ctx.stroke();
          ctx.fillStyle = hit ? '#fff' : 'rgba(255,255,255,0.6)';
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText('CYBER'[idx], 0, 1);
        } else if (body.label === 'spinner') {
          ctx.save();
          ctx.rotate((g.spinnerAngle * Math.PI) / 180);
          ctx.shadowColor = C.rampCyan;
          ctx.shadowBlur = g.spinnerSpeed > 2 ? 18 : 5;
          ctx.strokeStyle = C.rampCyan; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(18, 0); ctx.stroke();
          ctx.strokeStyle = 'rgba(34,211,238,0.4)'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(0, -5); ctx.lineTo(0, 5); ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.restore();
        } else if (body.label === 'kickback') {
          const active = g.kickbackActive;
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.fillStyle = active ? C.pink : 'rgba(255,0,110,0.2)';
          ctx.shadowColor = C.pink;
          ctx.shadowBlur = active ? 14 : 3;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath(); ctx.fill();
          ctx.shadowBlur = 0;
          if (active) {
            ctx.fillStyle = `rgba(255,0,110,${Math.sin(t * 4) * 0.3 + 0.7})`;
            ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
            ctx.fillText('▲', 0, 0);
          }
        } else if (body.label === 'reactor_core') {
          // Reactor core visual
          const charge = g.reactorCharge / 100;
          const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);
          coreGrad.addColorStop(0, g.overdrive ? '#fff' : `rgba(168,85,247,${0.3 + charge * 0.7})`);
          coreGrad.addColorStop(0.5, g.overdrive ? '#a855f7' : `rgba(124,58,237,${0.2 + charge * 0.5})`);
          coreGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = coreGrad;
          ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
          // Pulsing rings
          if (g.overdrive) {
            for (let r = 0; r < 3; r++) {
              const ringR = 15 + r * 8 + Math.sin(t * 8 + r * 2) * 3;
              ctx.strokeStyle = `rgba(168,85,247,${0.3 - r * 0.08})`;
              ctx.lineWidth = 1;
              ctx.beginPath(); ctx.arc(0, 0, ringR, 0, Math.PI * 2); ctx.stroke();
            }
          }
          // Charge indicator ring
          ctx.strokeStyle = `rgba(168,85,247,${0.4 + charge * 0.4})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(0, 0, 14, -Math.PI / 2, -Math.PI / 2 + (Math.PI * 2 * charge));
          ctx.stroke();
        }

        ctx.restore();
      }

      // ── Plunger ──
      if (!g.launched && g.currentBall) {
        const plY = TH - 12;
        const plH = 55 * g.plungerPower;
        ctx.fillStyle = 'rgba(255,0,110,0.06)';
        ctx.fillRect(PLUNGER_X - 7, plY - 58, 14, 58);
        const pg = ctx.createLinearGradient(0, plY, 0, plY - plH);
        pg.addColorStop(0, '#ff006e'); pg.addColorStop(1, '#ff66aa');
        ctx.fillStyle = pg;
        ctx.shadowColor = '#ff006e'; ctx.shadowBlur = 10 + g.plungerPower * 12;
        ctx.beginPath(); ctx.roundRect(PLUNGER_X - 4, plY - plH, 8, plH, 3); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ff006e';
        ctx.beginPath(); ctx.arc(PLUNGER_X, plY - plH, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(PLUNGER_X - 1, plY - plH - 1, 1.5, 0, Math.PI * 2); ctx.fill();
      }

      // ── Labels ──
      ctx.save();
      ctx.shadowColor = C.rampCyan; ctx.shadowBlur = 3;
      ctx.fillStyle = C.rampCyan; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
      ctx.globalAlpha = 0.65;
      ctx.translate(38, 370); ctx.rotate(-0.22);
      ctx.fillText('DOWNTOWN', 0, 0); ctx.fillText('RUSH', 0, 9);
      ctx.restore();

      ctx.save();
      ctx.shadowColor = C.pink; ctx.shadowBlur = 3;
      ctx.fillStyle = C.pink; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
      ctx.globalAlpha = 0.65;
      ctx.translate(TW - 65, 370); ctx.rotate(0.22);
      ctx.fillText('NEON', 0, 0); ctx.fillText('HIGHWAY', 0, 9);
      ctx.restore();

      // Reactor label
      ctx.shadowColor = '#a855f7'; ctx.shadowBlur = 3;
      ctx.fillStyle = '#a855f7'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center';
      ctx.globalAlpha = 0.5 + (g.overdrive ? 0.4 : g.spinnerSpeed > 0 ? 0.2 : 0);
      ctx.fillText('REACTOR', rcX, rcY + 50);
      ctx.fillText('CORE', rcX, rcY + 59);
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;

      // CYBER label above targets
      ctx.fillStyle = 'rgba(0,229,255,0.3)'; ctx.font = 'bold 8px monospace'; ctx.textAlign = 'center';
      ctx.fillText('▼ CYBER TARGETS ▼', TW / 2, cyberY - 22);

      // Orbit labels
      ctx.fillStyle = 'rgba(124,58,237,0.4)'; ctx.font = 'bold 6px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ORBIT', 30, 155); ctx.fillText('ORBIT', TW - 58, 155);

      // ── HUD overlays ──
      if (g.tilted) {
        ctx.fillStyle = 'rgba(255,0,0,0.12)'; ctx.fillRect(0, 0, TW, TH);
        ctx.globalAlpha = 0.08;
        for (let y = 0; y < TH; y += 3) { ctx.fillStyle = '#ff0000'; ctx.fillRect(0, y, TW, 1); }
        ctx.globalAlpha = 1;
        ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 30;
        ctx.fillStyle = '#ff0000'; ctx.font = 'bold 44px monospace'; ctx.textAlign = 'center';
        ctx.fillText('TILT', TW / 2, TH / 2); ctx.shadowBlur = 0;
      }

      if (message) {
        const mg = ctx.createLinearGradient(TW / 2 - 140, 0, TW / 2 + 140, 0);
        mg.addColorStop(0, 'rgba(0,0,0,0)'); mg.addColorStop(0.15, 'rgba(0,0,0,0.85)');
        mg.addColorStop(0.85, 'rgba(0,0,0,0.85)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = mg; ctx.fillRect(TW / 2 - 140, TH / 2 - 22, 280, 44);
        ctx.strokeStyle = C.target; ctx.shadowColor = C.target; ctx.shadowBlur = 6; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(TW / 2 - 110, TH / 2 - 19); ctx.lineTo(TW / 2 + 110, TH / 2 - 19); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(TW / 2 - 110, TH / 2 + 19); ctx.lineTo(TW / 2 + 110, TH / 2 + 19); ctx.stroke();
        ctx.shadowBlur = 8; ctx.fillStyle = '#fff'; ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(message, TW / 2, TH / 2); ctx.shadowBlur = 0;
      }

      if (g.gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.88)'; ctx.fillRect(0, 0, TW, TH);
        ctx.globalAlpha = 0.04;
        for (let y = 0; y < TH; y += 2) { ctx.fillStyle = '#fff'; ctx.fillRect(0, y, TW, 1); }
        ctx.globalAlpha = 1;
        ctx.shadowColor = '#00e5ff'; ctx.shadowBlur = 35;
        ctx.fillStyle = '#00e5ff'; ctx.font = 'bold 34px monospace'; ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', TW / 2, TH / 2 - 45);
        ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 20;
        ctx.fillStyle = '#ff00ff'; ctx.font = 'bold 24px monospace';
        ctx.fillText(g.score.toLocaleString(), TW / 2, TH / 2);
        ctx.shadowBlur = 0; ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.font = '10px monospace';
        ctx.fillText('PRESS SPACE TO RESTART', TW / 2, TH / 2 + 40);
      }

      // Overdrive banner
      if (g.overdrive) {
        const oa = 0.6 + Math.sin(t * 8) * 0.3;
        ctx.fillStyle = `rgba(168, 85, 247, ${oa * 0.15})`;
        ctx.fillRect(0, 0, TW, 18);
        ctx.fillStyle = `rgba(168, 85, 247, ${oa})`;
        ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('⚡ OVERDRIVE 2x ⚡', TW / 2, 12);
      }

      // Cyber Surge banner
      if (g.cyberSurge) {
        const sa = 0.6 + Math.sin(t * 6) * 0.3;
        ctx.fillStyle = `rgba(0, 229, 255, ${sa * 0.12})`;
        ctx.fillRect(0, TH - 18, TW, 18);
        ctx.fillStyle = `rgba(0, 229, 255, ${sa})`;
        ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center';
        ctx.fillText('⚡ CYBER SURGE 1.5x ⚡', TW / 2, TH - 6);
      }

      ctx.restore(); // shake

      animRef.current = requestAnimationFrame(renderLoop);
    };

    animRef.current = requestAnimationFrame(renderLoop);

    // ── Keyboard ──
    const onKeyDown = (e: KeyboardEvent) => {
      const g = G.current;
      if (e.key === 'ArrowLeft' || e.key === 'z' || e.key === 'Z') { e.preventDefault(); g.leftUp = true; }
      if (e.key === 'ArrowRight' || e.key === '/' || e.key === 'm' || e.key === 'M') { e.preventDefault(); g.rightUp = true; }
      if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (g.gameOver) {
          // Reset
          g.score = 0; g.balls = 3; g.gameOver = false; g.combo = 0;
          g.ccaLanes = [false, false, false];
          g.reactorCharge = 0; g.overdrive = false;
          g.cyberTargets = [false, false, false, false, false]; g.cyberIndex = 0; g.cyberSurge = false;
          g.downtownHits = 0; g.neonHits = 0; g.downtownRush = false;
          g.lockedBalls = 0; g.multiball = false;
          g.kickbackActive = false; g.buildingLit = new Array(12).fill(false);
          setScore(0); setBalls(3); setGameOver(false); setCombo(0);
          setCcaLanes([false, false, false]); setReactorCharge(0); setOverdrive(false);
          setCyberTargets([false, false, false, false, false]);
          setDowntownHits(0); setNeonHits(0); setLockedBalls(0);
          spawnBall();
          return;
        }
        if (!g.launched && g.currentBall) g.plungerCharging = true;
      }
      if (e.key === 't' || e.key === 'T') {
        if (g.tilted || !g.currentBall) return;
        g.tiltWarnings++;
        setTiltW(g.tiltWarnings);
        if (g.tiltWarnings >= 3) {
          g.tilted = true; setTilted(true);
          showMsg('TILT! SCORE LOCKED');
          g.leftUp = false; g.rightUp = false;
        } else {
          showMsg(`TILT WARNING ${g.tiltWarnings}/3`);
          if (g.currentBall) Body.applyForce(g.currentBall, g.currentBall.position, { x: (Math.random() - 0.5) * 0.003, y: -0.002 });
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const g = G.current;
      if (e.key === 'ArrowLeft' || e.key === 'z' || e.key === 'Z') g.leftUp = false;
      if (e.key === 'ArrowRight' || e.key === '/' || e.key === 'm' || e.key === 'M') g.rightUp = false;
      if ((e.key === ' ' || e.key === 'ArrowDown') && g.plungerCharging && g.currentBall && !g.launched) {
        const power = g.plungerPower;
        Body.applyForce(g.currentBall, g.currentBall.position, { x: 0, y: -(0.009 + power * 0.028) });
        g.plungerCharging = false; g.plungerPower = 0; g.launched = true;
        if (power > 0.65 && power < 0.82) showMsg('PERFECT LAUNCH!');
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

  const flipperTouch = useCallback((side: 'left' | 'right', down: boolean) => {
    if (side === 'left') G.current.leftUp = down;
    else G.current.rightUp = down;
  }, []);

  const plungerTouch = useCallback((down: boolean) => {
    const g = G.current;
    if (down && !g.launched && g.currentBall) g.plungerCharging = true;
    else if (!down && g.plungerCharging && g.currentBall && !g.launched) {
      Body.applyForce(g.currentBall!, g.currentBall!.position, { x: 0, y: -(0.009 + g.plungerPower * 0.028) });
      g.plungerCharging = false; g.plungerPower = 0; g.launched = true;
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Score HUD */}
      <div className="w-full max-w-[440px] bg-black/60 border border-neon-cyan/30 rounded-xl p-3">
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
              {combo > 0 ? `${Math.min(combo, 5)}x` : '--'}
            </p>
          </div>
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between mt-2 gap-2">
          {/* CCA */}
          <div className="flex gap-1.5">
            {['C', 'C', 'A'].map((l, i) => (
              <span key={i} className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${ccaLanes[i] ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' : 'bg-muted/10 text-muted-foreground border border-muted/20'}`}>{l}</span>
            ))}
          </div>
          {/* Reactor */}
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-muted-foreground">REACTOR</span>
            <div className="w-16 h-2 bg-muted/20 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all ${overdrive ? 'bg-purple-400 animate-pulse' : 'bg-purple-600'}`} style={{ width: `${reactorCharge}%` }} />
            </div>
          </div>
          {/* CYBER */}
          <div className="flex gap-0.5">
            {'CYBER'.split('').map((l, i) => (
              <span key={i} className={`text-[9px] font-bold font-mono w-4 text-center ${cyberTargets[i] ? 'text-neon-cyan' : 'text-muted-foreground/40'}`}>{l}</span>
            ))}
          </div>
        </div>

        {/* Mode indicators */}
        <div className="flex justify-center gap-2 mt-1.5">
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
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border-2 border-purple-500/30 shadow-[0_0_40px_rgba(124,58,237,0.15)]">
        <canvas ref={canvasRef} className="block" style={{ width: TW, height: TH }} />
      </div>

      {/* Mobile controls */}
      <div className="w-full max-w-[440px] grid grid-cols-3 gap-2 md:hidden touch-none select-none">
        <button className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-bold py-5 rounded-xl active:bg-neon-cyan/40 select-none text-sm touch-none"
          onTouchStart={(e) => { e.preventDefault(); flipperTouch('left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); flipperTouch('left', false); }}
          onTouchCancel={(e) => { e.preventDefault(); flipperTouch('left', false); }}
          onMouseDown={() => flipperTouch('left', true)}
          onMouseUp={() => flipperTouch('left', false)}
          onMouseLeave={() => flipperTouch('left', false)}>◀ LEFT</button>
        <button className={`border font-bold py-5 rounded-xl select-none text-sm touch-none transition-colors ${
          G.current.plungerCharging
            ? 'bg-neon-pink/40 border-neon-pink/70 text-neon-pink scale-95'
            : 'bg-neon-pink/20 border-neon-pink/40 text-neon-pink'
        }`}
          onTouchStart={(e) => { e.preventDefault(); plungerTouch(true); }}
          onTouchEnd={(e) => { e.preventDefault(); plungerTouch(false); }}
          onTouchCancel={(e) => { e.preventDefault(); plungerTouch(false); }}
          onMouseDown={() => plungerTouch(true)}
          onMouseUp={() => plungerTouch(false)}
          onMouseLeave={() => plungerTouch(false)}>
          {G.current.launched ? '🎯 LAUNCH' : '⬇ HOLD'}
        </button>
        <button className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-bold py-5 rounded-xl active:bg-neon-cyan/40 select-none text-sm touch-none"
          onTouchStart={(e) => { e.preventDefault(); flipperTouch('right', true); }}
          onTouchEnd={(e) => { e.preventDefault(); flipperTouch('right', false); }}
          onTouchCancel={(e) => { e.preventDefault(); flipperTouch('right', false); }}
          onMouseDown={() => flipperTouch('right', true)}
          onMouseUp={() => flipperTouch('right', false)}
          onMouseLeave={() => flipperTouch('right', false)}>RIGHT ▶</button>
      </div>

      {/* Desktop controls hint */}
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
