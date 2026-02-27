import React, { useRef, useEffect, useState, useCallback } from 'react';
import Matter from 'matter-js';

const { Engine, Render, Runner, Bodies, Body, Composite, Events, Constraint, Vector } = Matter;

// ── Constants ──
const TABLE_W = 400;
const TABLE_H = 720;
const BALL_R = 8;
const FLIPPER_W = 70;
const FLIPPER_H = 14;
const GRAVITY = 1.2;
const FLIPPER_FORCE = 0.065;
const BUMPER_RESTITUTION = 0.9;
const WALL_T = 12;
const PLUNGER_X = TABLE_W - 20;

// ── Colours ──
const C = {
  bg: '#0a0a12',
  wall: '#1a1a2e',
  wallStroke: '#00e5ff',
  flipper: '#00e5ff',
  ball: '#ff00ff',
  ballGlow: '#ff44ff',
  bumper: '#9333ea',
  bumperHit: '#c084fc',
  bumperStroke: '#e879f9',
  slingshot: '#facc15',
  target: '#00e5ff',
  ramp: '#22d3ee',
  lane: '#334155',
  score: '#00e5ff',
  text: '#e2e8f0',
  neonPink: '#ff006e',
};

interface CyberPinballProps {
  onScoreUpdate?: (score: number) => void;
  onBallLost?: (ballsLeft: number) => void;
  onGameOver?: (finalScore: number) => void;
}

export const CyberPinball: React.FC<CyberPinballProps> = ({
  onScoreUpdate,
  onBallLost,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Array<{x:number,y:number,vx:number,vy:number,life:number,color:string,size:number}>>([]);
  const raindropsRef = useRef<Array<{x:number,y:number,speed:number,length:number}>>([]);
  const frameCountRef = useRef(0);
  const gameRef = useRef({
    score: 0,
    balls: 3,
    currentBall: null as Matter.Body | null,
    leftFlipperUp: false,
    rightFlipperUp: false,
    leftFlipper: null as Matter.Body | null,
    rightFlipper: null as Matter.Body | null,
    plungerPower: 0,
    plungerCharging: false,
    launched: false,
    tiltWarnings: 0,
    tilted: false,
    bumperFlash: new Map<string, number>(),
    combo: 0,
    comboTimer: 0,
    ccaLanes: [false, false, false] as boolean[],
    multiball: false,
    extraBalls: [] as Matter.Body[],
    jackpotActive: false,
    spinnerAngle: 0,
    spinnerSpeed: 0,
    gameOver: false,
    skillShotActive: true,
    lightningFlash: 0,
    screenShake: { x: 0, y: 0, intensity: 0 },
    ballTrail: [] as Array<{x:number,y:number,age:number}>,
  });

  const [score, setScore] = useState(0);
  const [balls, setBalls] = useState(3);
  const [tiltWarnings, setTiltWarnings] = useState(0);
  const [tilted, setTilted] = useState(false);
  const [plungerPower, setPlungerPower] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);
  const [ccaLanes, setCcaLanes] = useState([false, false, false]);
  const [message, setMessage] = useState('');

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 2000);
  }, []);

  const addScore = useCallback((pts: number) => {
    const g = gameRef.current;
    if (g.tilted || g.gameOver) return;

    // Combo multiplier
    g.combo++;
    g.comboTimer = Date.now() + 3000;
    const multiplier = Math.min(g.combo, 5);
    const total = pts * multiplier;
    g.score += total;
    setScore(g.score);
    setCombo(g.combo);
    onScoreUpdate?.(g.score);

    if (multiplier > 1) {
      showMessage(`${multiplier}x COMBO! +${total}`);
    }
  }, [onScoreUpdate, showMessage]);

  // ── Initialize physics ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = Engine.create({
      gravity: { x: 0, y: GRAVITY, scale: 0.001 },
    });
    engineRef.current = engine;

    const ctx = canvas.getContext('2d')!;
    canvas.width = TABLE_W;
    canvas.height = TABLE_H;

    // ── Build table ──
    const walls: Matter.Body[] = [];

    // Left wall
    walls.push(Bodies.rectangle(WALL_T / 2, TABLE_H / 2, WALL_T, TABLE_H, {
      isStatic: true, label: 'wall',
      render: { fillStyle: C.wall },
    }));
    // Right wall (with plunger lane gap at bottom)
    walls.push(Bodies.rectangle(TABLE_W - WALL_T / 2, TABLE_H / 2 - 100, WALL_T, TABLE_H - 200, {
      isStatic: true, label: 'wall',
      render: { fillStyle: C.wall },
    }));
    // Top wall
    walls.push(Bodies.rectangle(TABLE_W / 2, WALL_T / 2, TABLE_W, WALL_T, {
      isStatic: true, label: 'wall',
      render: { fillStyle: C.wall },
    }));
    // Bottom drain
    walls.push(Bodies.rectangle(TABLE_W / 2, TABLE_H + 20, TABLE_W, 40, {
      isStatic: true, label: 'drain',
    }));

    // Plunger lane right wall (lower section)
    walls.push(Bodies.rectangle(TABLE_W - WALL_T / 2, TABLE_H - 50, WALL_T, 100, {
      isStatic: true, label: 'wall',
    }));

    // Plunger lane divider
    walls.push(Bodies.rectangle(TABLE_W - 40, TABLE_H - 180, 6, 200, {
      isStatic: true, label: 'wall', angle: 0.05,
    }));

    // Plunger lane top curve guide (angled)
    walls.push(Bodies.rectangle(TABLE_W - 50, TABLE_H - 300, 60, 6, {
      isStatic: true, label: 'wall', angle: -0.4,
    }));

    // ── Outlanes & inlanes ──
    // Left outlane wall
    walls.push(Bodies.rectangle(35, TABLE_H - 160, 6, 120, {
      isStatic: true, label: 'wall', angle: 0.15,
    }));
    // Right outlane wall
    walls.push(Bodies.rectangle(TABLE_W - 65, TABLE_H - 160, 6, 120, {
      isStatic: true, label: 'wall', angle: -0.15,
    }));
    // Left inlane guide
    walls.push(Bodies.rectangle(70, TABLE_H - 130, 6, 80, {
      isStatic: true, label: 'wall', angle: 0.2,
    }));
    // Right inlane guide
    walls.push(Bodies.rectangle(TABLE_W - 100, TABLE_H - 130, 6, 80, {
      isStatic: true, label: 'wall', angle: -0.2,
    }));

    // ── Flippers ──
    const leftFlipperX = TABLE_W / 2 - 55;
    const rightFlipperX = TABLE_W / 2 + 55;
    const flipperY = TABLE_H - 70;

    const leftFlipper = Bodies.rectangle(leftFlipperX, flipperY, FLIPPER_W, FLIPPER_H, {
      label: 'leftFlipper', density: 0.02, frictionAir: 0.02,
      chamfer: { radius: 6 },
      render: { fillStyle: C.flipper },
    });
    const rightFlipper = Bodies.rectangle(rightFlipperX, flipperY, FLIPPER_W, FLIPPER_H, {
      label: 'rightFlipper', density: 0.02, frictionAir: 0.02,
      chamfer: { radius: 6 },
      render: { fillStyle: C.flipper },
    });

    const leftPivot = Constraint.create({
      bodyA: leftFlipper,
      pointA: { x: -FLIPPER_W / 2 + 8, y: 0 },
      pointB: { x: leftFlipperX - FLIPPER_W / 2 + 8, y: flipperY },
      stiffness: 1, length: 0,
    });
    const rightPivot = Constraint.create({
      bodyA: rightFlipper,
      pointA: { x: FLIPPER_W / 2 - 8, y: 0 },
      pointB: { x: rightFlipperX + FLIPPER_W / 2 - 8, y: flipperY },
      stiffness: 1, length: 0,
    });

    gameRef.current.leftFlipper = leftFlipper;
    gameRef.current.rightFlipper = rightFlipper;

    // ── Slingshots ──
    const leftSlingshot = Bodies.fromVertices(85, TABLE_H - 140, [[
      { x: 0, y: 0 }, { x: 30, y: 50 }, { x: -5, y: 50 },
    ]], {
      isStatic: true, label: 'slingshot', restitution: 1.2,
      render: { fillStyle: C.slingshot },
    });
    const rightSlingshot = Bodies.fromVertices(TABLE_W - 115, TABLE_H - 140, [[
      { x: 0, y: 0 }, { x: 5, y: 50 }, { x: -30, y: 50 },
    ]], {
      isStatic: true, label: 'slingshot', restitution: 1.2,
      render: { fillStyle: C.slingshot },
    });

    // ── Pop Bumpers (triangle formation) ──
    const bumperR = 18;
    const bumperCenterX = TABLE_W / 2;
    const bumperCenterY = 220;
    const bumpers = [
      Bodies.circle(bumperCenterX, bumperCenterY - 40, bumperR, {
        isStatic: true, label: 'bumper_0', restitution: BUMPER_RESTITUTION,
        render: { fillStyle: C.bumper },
      }),
      Bodies.circle(bumperCenterX - 35, bumperCenterY + 20, bumperR, {
        isStatic: true, label: 'bumper_1', restitution: BUMPER_RESTITUTION,
        render: { fillStyle: C.bumper },
      }),
      Bodies.circle(bumperCenterX + 35, bumperCenterY + 20, bumperR, {
        isStatic: true, label: 'bumper_2', restitution: BUMPER_RESTITUTION,
        render: { fillStyle: C.bumper },
      }),
    ];

    // ── Rollover lanes (C-C-A) at top ──
    const laneY = 60;
    const laneTargets = [
      Bodies.rectangle(TABLE_W / 2 - 50, laneY, 12, 30, {
        isStatic: true, isSensor: true, label: 'cca_0',
      }),
      Bodies.rectangle(TABLE_W / 2, laneY, 12, 30, {
        isStatic: true, isSensor: true, label: 'cca_1',
      }),
      Bodies.rectangle(TABLE_W / 2 + 50, laneY, 12, 30, {
        isStatic: true, isSensor: true, label: 'cca_2',
      }),
    ];

    // Lane guides
    const laneGuides = [
      Bodies.rectangle(TABLE_W / 2 - 75, laneY, 4, 40, { isStatic: true, label: 'wall' }),
      Bodies.rectangle(TABLE_W / 2 - 25, laneY, 4, 40, { isStatic: true, label: 'wall' }),
      Bodies.rectangle(TABLE_W / 2 + 25, laneY, 4, 40, { isStatic: true, label: 'wall' }),
      Bodies.rectangle(TABLE_W / 2 + 75, laneY, 4, 40, { isStatic: true, label: 'wall' }),
    ];

    // ── Ramps ──
    // Left ramp ("Downtown Rush")
    const leftRamp = Bodies.rectangle(60, 300, 6, 160, {
      isStatic: true, label: 'ramp_left', angle: 0.25,
      render: { fillStyle: C.ramp },
    });
    // Right ramp ("Neon Highway")
    const rightRamp = Bodies.rectangle(TABLE_W - 90, 300, 6, 160, {
      isStatic: true, label: 'ramp_right', angle: -0.25,
      render: { fillStyle: C.ramp },
    });

    // ── Center spinner ("Galaxy Core Reactor") ──
    const spinner = Bodies.rectangle(TABLE_W / 2, 140, 40, 4, {
      isStatic: true, isSensor: true, label: 'spinner',
    });

    // ── Kickback lane (left side) ──
    const kickback = Bodies.rectangle(18, TABLE_H - 200, 8, 40, {
      isStatic: true, label: 'kickback', restitution: 1.5,
    });

    // ── Drop targets ──
    const dropTargets = [
      Bodies.rectangle(120, 350, 6, 20, { isStatic: true, isSensor: true, label: 'drop_0' }),
      Bodies.rectangle(140, 340, 6, 20, { isStatic: true, isSensor: true, label: 'drop_1' }),
      Bodies.rectangle(160, 330, 6, 20, { isStatic: true, isSensor: true, label: 'drop_2' }),
    ];

    // Composite add
    Composite.add(engine.world, [
      ...walls,
      leftFlipper, rightFlipper,
      leftPivot, rightPivot,
      leftSlingshot || Bodies.circle(0,0,1, {isStatic:true}),
      rightSlingshot || Bodies.circle(0,0,1, {isStatic:true}),
      ...bumpers,
      ...laneTargets,
      ...laneGuides,
      leftRamp, rightRamp,
      spinner, kickback,
      ...dropTargets,
    ]);

    // ── Collision events ──
    Events.on(engine, 'collisionStart', (event) => {
      const g = gameRef.current;
      for (const pair of event.pairs) {
        const labels = [pair.bodyA.label, pair.bodyB.label];
        const ball = labels.includes('ball') 
          ? (pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB)
          : null;

        if (!ball) continue;

        // Drain
        if (labels.includes('drain')) {
          handleBallDrain(ball);
          continue;
        }

        // Bumpers
        for (let i = 0; i < 3; i++) {
          if (labels.includes(`bumper_${i}`)) {
            addScore(100);
            g.bumperFlash.set(`bumper_${i}`, Date.now() + 250);
            g.screenShake.intensity = 4;
            g.lightningFlash = 0.3;
            // Apply bounce force
            const bumper = pair.bodyA.label === `bumper_${i}` ? pair.bodyA : pair.bodyB;
            const dir = Vector.sub(ball.position, bumper.position);
            const norm = Vector.normalise(dir);
            Body.applyForce(ball, ball.position, { x: norm.x * 0.008, y: norm.y * 0.008 });
            // Spawn particles
            for (let p = 0; p < 8; p++) {
              particlesRef.current.push({
                x: ball.position.x, y: ball.position.y,
                vx: (Math.random() - 0.5) * 5, vy: (Math.random() - 0.5) * 5 - 2,
                life: 25 + Math.random() * 15,
                color: 'rgba(232, 121, 249, 1)',
                size: 2 + Math.random() * 3,
              });
            }
          }
        }

        // Slingshots
        if (labels.includes('slingshot')) {
          addScore(50);
          showMessage('SLINGSHOT!');
        }

        // CCA lanes
        for (let i = 0; i < 3; i++) {
          if (labels.includes(`cca_${i}`) && !g.ccaLanes[i]) {
            g.ccaLanes[i] = true;
            setCcaLanes([...g.ccaLanes]);
            addScore(500);
            const letters = ['C', 'C', 'A'];
            showMessage(`${letters[i]} LANE LIT!`);

            if (g.ccaLanes.every(Boolean)) {
              addScore(5000);
              showMessage('C-C-A COMPLETE! BONUS 5000!');
              g.ccaLanes = [false, false, false];
              setCcaLanes([false, false, false]);
            }
          }
        }

        // Spinner
        if (labels.includes('spinner')) {
          g.spinnerSpeed = 15;
          addScore(25);
        }

        // Ramps
        if (labels.includes('ramp_left')) {
          addScore(250);
          showMessage('DOWNTOWN RUSH! +250');
        }
        if (labels.includes('ramp_right')) {
          addScore(250);
          showMessage('NEON HIGHWAY! +250');
        }

        // Drop targets
        for (let i = 0; i < 3; i++) {
          if (labels.includes(`drop_${i}`)) {
            addScore(200);
          }
        }

        // Kickback
        if (labels.includes('kickback')) {
          Body.applyForce(ball, ball.position, { x: 0, y: -0.015 });
          addScore(75);
          showMessage('KICKBACK!');
        }

        // Skill shot check
        if (g.skillShotActive && labels.includes('cca_1')) {
          addScore(2000);
          showMessage('SKILL SHOT! +2000');
          g.skillShotActive = false;
        }
      }
    });

    const handleBallDrain = (ball: Matter.Body) => {
      const g = gameRef.current;
      Composite.remove(engine.world, ball);

      // Check extra balls
      const extraIdx = g.extraBalls.indexOf(ball);
      if (extraIdx >= 0) {
        g.extraBalls.splice(extraIdx, 1);
        return;
      }

      g.currentBall = null;
      g.balls--;
      g.launched = false;
      g.skillShotActive = true;
      setBalls(g.balls);
      onBallLost?.(g.balls);

      if (g.balls <= 0) {
        g.gameOver = true;
        setGameOver(true);
        onGameOver?.(g.score);
        showMessage('GAME OVER');
      } else {
        showMessage(`BALL LOST - ${g.balls} LEFT`);
        // Auto spawn new ball after delay
        setTimeout(() => spawnBall(), 1500);
      }
    };

    // ── Spawn ball ──
    const spawnBall = () => {
      const g = gameRef.current;
      if (g.currentBall || g.gameOver) return;

      const ball = Bodies.circle(PLUNGER_X, TABLE_H - 40, BALL_R, {
        label: 'ball',
        restitution: 0.4,
        friction: 0.01,
        frictionAir: 0.001,
        density: 0.004,
        render: { fillStyle: C.ball },
      });
      Composite.add(engine.world, ball);
      g.currentBall = ball;
      g.launched = false;
      g.tilted = false;
      g.tiltWarnings = 0;
      setTilted(false);
      setTiltWarnings(0);
    };

    // Initial ball
    setTimeout(() => spawnBall(), 500);

    // ── Runner ──
    const runner = Runner.create();
    Runner.run(runner, engine);
    runnerRef.current = runner;

    // ── Render loop ──
    const renderLoop = () => {
      const g = gameRef.current;

      // Combo timeout
      if (g.combo > 0 && Date.now() > g.comboTimer) {
        g.combo = 0;
        setCombo(0);
      }

      // Flipper physics
      if (g.leftFlipper) {
        const targetAngle = g.leftFlipperUp ? -0.6 : 0.4;
        const angleDiff = targetAngle - g.leftFlipper.angle;
        Body.setAngularVelocity(g.leftFlipper, angleDiff * 0.3);
      }
      if (g.rightFlipper) {
        const targetAngle = g.rightFlipperUp ? 0.6 : -0.4;
        const angleDiff = targetAngle - g.rightFlipper.angle;
        Body.setAngularVelocity(g.rightFlipper, angleDiff * 0.3);
      }

      // Plunger
      if (g.plungerCharging && !g.launched) {
        g.plungerPower = Math.min(g.plungerPower + 0.02, 1);
        setPlungerPower(g.plungerPower);
      }

      // Spinner decay
      if (g.spinnerSpeed > 0) {
        g.spinnerSpeed *= 0.97;
        g.spinnerAngle += g.spinnerSpeed;
        if (g.spinnerSpeed < 0.5) g.spinnerSpeed = 0;
      }

      // ── Draw ──
      const frame = frameCountRef.current++;
      const t = frame * 0.016; // approximate time

      // Screen shake
      ctx.save();
      if (g.screenShake.intensity > 0) {
        ctx.translate(g.screenShake.x, g.screenShake.y);
        g.screenShake.intensity *= 0.85;
        g.screenShake.x = (Math.random() - 0.5) * g.screenShake.intensity;
        g.screenShake.y = (Math.random() - 0.5) * g.screenShake.intensity;
        if (g.screenShake.intensity < 0.3) g.screenShake.intensity = 0;
      }

      // ── Playfield base: dark brushed metal ──
      const metalGrad = ctx.createLinearGradient(0, 0, TABLE_W, TABLE_H);
      metalGrad.addColorStop(0, '#08080f');
      metalGrad.addColorStop(0.3, '#0d0d18');
      metalGrad.addColorStop(0.5, '#0a0a14');
      metalGrad.addColorStop(0.7, '#0d0d18');
      metalGrad.addColorStop(1, '#08080f');
      ctx.fillStyle = metalGrad;
      ctx.fillRect(0, 0, TABLE_W, TABLE_H);

      // Brushed metal texture
      ctx.globalAlpha = 0.04;
      for (let y = 0; y < TABLE_H; y += 2) {
        ctx.strokeStyle = y % 4 === 0 ? '#ffffff' : '#000000';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin(y * 0.1) * 0.5);
        ctx.lineTo(TABLE_W, y + Math.sin(y * 0.1 + 2) * 0.5);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // ── Rain reflection overlay ──
      const rains = raindropsRef.current;
      if (rains.length < 40) {
        rains.push({ x: Math.random() * TABLE_W, y: -10, speed: 2 + Math.random() * 3, length: 8 + Math.random() * 15 });
      }
      ctx.globalAlpha = 0.06;
      for (let i = rains.length - 1; i >= 0; i--) {
        const r = rains[i];
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        ctx.lineTo(r.x - 1, r.y + r.length);
        ctx.stroke();
        r.y += r.speed;
        if (r.y > TABLE_H) { rains.splice(i, 1); }
      }
      ctx.globalAlpha = 1;

      // ── Ambient glow zones ──
      // Upper purple zone
      const upperGlow = ctx.createRadialGradient(TABLE_W/2, 200, 20, TABLE_W/2, 200, 150);
      upperGlow.addColorStop(0, 'rgba(147, 51, 234, 0.08)');
      upperGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = upperGlow;
      ctx.fillRect(0, 50, TABLE_W, 300);

      // Lower cyan zone near flippers
      const lowerGlow = ctx.createRadialGradient(TABLE_W/2, TABLE_H - 100, 20, TABLE_W/2, TABLE_H - 100, 120);
      lowerGlow.addColorStop(0, 'rgba(0, 229, 255, 0.06)');
      lowerGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = lowerGlow;
      ctx.fillRect(0, TABLE_H - 250, TABLE_W, 250);

      // ── Lightning flash ──
      if (g.lightningFlash > 0) {
        ctx.fillStyle = `rgba(200, 220, 255, ${g.lightningFlash * 0.15})`;
        ctx.fillRect(0, 0, TABLE_W, TABLE_H);
        g.lightningFlash *= 0.85;
        if (g.lightningFlash < 0.05) g.lightningFlash = 0;
      }

      // ── Neon grid (subtle) ──
      ctx.globalAlpha = 0.02 + Math.sin(t * 0.5) * 0.005;
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < TABLE_W; x += 30) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, TABLE_H); ctx.stroke();
      }
      for (let y = 0; y < TABLE_H; y += 30) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TABLE_W, y); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // ── Ball trail ──
      if (g.currentBall && g.launched) {
        g.ballTrail.push({ x: g.currentBall.position.x, y: g.currentBall.position.y, age: 0 });
        if (g.ballTrail.length > 20) g.ballTrail.shift();
      }
      for (let i = g.ballTrail.length - 1; i >= 0; i--) {
        const pt = g.ballTrail[i];
        pt.age++;
        if (pt.age > 20) { g.ballTrail.splice(i, 1); continue; }
        const alpha = 1 - pt.age / 20;
        const size = BALL_R * alpha * 0.6;
        ctx.fillStyle = `rgba(255, 0, 255, ${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Particles ──
      const parts = particlesRef.current;
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        const a = p.life / 30;
        ctx.fillStyle = p.color.replace('1)', `${a})`);
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── Draw all bodies ──
      const bodies = Composite.allBodies(engine.world);
      for (const body of bodies) {
        if (body.label === 'drain') continue;

        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        if (body.label === 'ball') {
          // Outer glow rings
          for (let r = 3; r >= 1; r--) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(255, 0, 255, ${0.05 * r})`;
            ctx.beginPath();
            ctx.arc(0, 0, BALL_R + r * 5, 0, Math.PI * 2);
            ctx.fill();
          }
          // Chrome ball with gradient
          const ballGrad = ctx.createRadialGradient(-2, -3, 1, 0, 0, BALL_R);
          ballGrad.addColorStop(0, '#ffffff');
          ballGrad.addColorStop(0.3, '#ff66ff');
          ballGrad.addColorStop(0.7, '#cc00cc');
          ballGrad.addColorStop(1, '#660066');
          ctx.shadowColor = '#ff00ff';
          ctx.shadowBlur = 25;
          ctx.fillStyle = ballGrad;
          ctx.beginPath();
          ctx.arc(0, 0, BALL_R, 0, Math.PI * 2);
          ctx.fill();
          // Specular highlight
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(-2, -3, 2.5, 0, Math.PI * 2);
          ctx.fill();
          // Ring
          ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, BALL_R + 1, 0, Math.PI * 2);
          ctx.stroke();
        } else if (body.label.startsWith('bumper_')) {
          const isFlashing = g.bumperFlash.has(body.label) && Date.now() < g.bumperFlash.get(body.label)!;
          // Outer glow
          ctx.shadowColor = isFlashing ? '#fff' : C.bumperStroke;
          ctx.shadowBlur = isFlashing ? 35 : 12;
          // Multi-ring bumper
          const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, bumperR);
          grad.addColorStop(0, isFlashing ? '#ffffff' : '#c084fc');
          grad.addColorStop(0.5, isFlashing ? '#e879f9' : '#9333ea');
          grad.addColorStop(1, isFlashing ? '#c026d3' : '#581c87');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, bumperR, 0, Math.PI * 2);
          ctx.fill();
          // Chrome ring
          ctx.shadowBlur = 0;
          ctx.strokeStyle = isFlashing ? '#fff' : C.bumperStroke;
          ctx.lineWidth = 2.5;
          ctx.stroke();
          // Inner ring
          ctx.strokeStyle = `rgba(232, 121, 249, ${isFlashing ? 0.9 : 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(0, 0, bumperR - 5, 0, Math.PI * 2);
          ctx.stroke();
          // Score dot
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('100', 0, 1);
          // Spawn particles on hit
          if (isFlashing && Math.random() > 0.7) {
            for (let p = 0; p < 4; p++) {
              parts.push({
                x: body.position.x, y: body.position.y,
                vx: (Math.random() - 0.5) * 4, vy: (Math.random() - 0.5) * 4 - 2,
                life: 20 + Math.random() * 10,
                color: 'rgba(232, 121, 249, 1)',
                size: 2 + Math.random() * 2,
              });
            }
          }
        } else if (body.label === 'leftFlipper' || body.label === 'rightFlipper') {
          const isUp = body.label === 'leftFlipper' ? g.leftFlipperUp : g.rightFlipperUp;
          // Metallic flipper with gradient
          const flipGrad = ctx.createLinearGradient(-FLIPPER_W/2, -FLIPPER_H/2, FLIPPER_W/2, FLIPPER_H/2);
          flipGrad.addColorStop(0, isUp ? '#00ffff' : '#0099aa');
          flipGrad.addColorStop(0.5, isUp ? '#66ffff' : '#00ccdd');
          flipGrad.addColorStop(1, isUp ? '#00cccc' : '#006677');
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = isUp ? 20 : 8;
          ctx.fillStyle = flipGrad;
          ctx.beginPath();
          ctx.roundRect(-FLIPPER_W/2, -FLIPPER_H/2, FLIPPER_W, FLIPPER_H, 7);
          ctx.fill();
          // Top highlight
          ctx.shadowBlur = 0;
          ctx.fillStyle = `rgba(255, 255, 255, ${isUp ? 0.3 : 0.1})`;
          ctx.beginPath();
          ctx.roundRect(-FLIPPER_W/2 + 4, -FLIPPER_H/2 + 1, FLIPPER_W - 8, 4, 2);
          ctx.fill();
          // Border
          ctx.strokeStyle = `rgba(0, 229, 255, ${isUp ? 0.8 : 0.4})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(-FLIPPER_W/2, -FLIPPER_H/2, FLIPPER_W, FLIPPER_H, 7);
          ctx.stroke();
        } else if (body.label === 'wall') {
          // Metallic wall with neon edge
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          const wallGrad = ctx.createLinearGradient(verts[0].x, verts[0].y, verts[verts.length-1].x, verts[verts.length-1].y);
          wallGrad.addColorStop(0, '#1a1a2e');
          wallGrad.addColorStop(0.5, '#252540');
          wallGrad.addColorStop(1, '#1a1a2e');
          ctx.fillStyle = wallGrad;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath();
          ctx.fill();
          // Neon edge glow
          ctx.shadowColor = '#00e5ff';
          ctx.shadowBlur = 4;
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.25 + Math.sin(t * 2 + body.position.x * 0.05) * 0.1})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (body.label === 'slingshot') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          // Electric slingshot
          const slingGrad = ctx.createLinearGradient(0, -25, 0, 25);
          slingGrad.addColorStop(0, '#fbbf24');
          slingGrad.addColorStop(1, '#f59e0b');
          ctx.fillStyle = slingGrad;
          ctx.shadowColor = '#facc15';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (body.label === 'kickback') {
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.fillStyle = C.neonPink;
          ctx.shadowColor = C.neonPink;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
          // Pulsing arrow
          const pulse = Math.sin(t * 4) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(255, 0, 110, ${pulse})`;
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('▲', 0, 0);
        } else if (body.label.startsWith('ramp_')) {
          // Neon rail ramp
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.shadowColor = C.ramp;
          ctx.shadowBlur = 8;
          ctx.strokeStyle = C.ramp;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath();
          ctx.stroke();
          ctx.shadowBlur = 0;
          // Dotted inner rail (animated)
          ctx.setLineDash([4, 8]);
          ctx.lineDashOffset = -t * 30;
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.setLineDash([]);
        } else if (body.label.startsWith('cca_')) {
          const idx = parseInt(body.label.split('_')[1]);
          const lit = g.ccaLanes[idx];
          // Glowing insert
          if (lit) {
            ctx.shadowColor = C.target;
            ctx.shadowBlur = 18;
            const insertGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10);
            insertGrad.addColorStop(0, '#ffffff');
            insertGrad.addColorStop(0.4, '#00e5ff');
            insertGrad.addColorStop(1, 'rgba(0, 229, 255, 0.3)');
            ctx.fillStyle = insertGrad;
          } else {
            ctx.fillStyle = `rgba(0, 229, 255, ${0.1 + Math.sin(t * 2 + idx) * 0.05})`;
          }
          ctx.beginPath();
          ctx.arc(0, 0, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          // Ring
          ctx.strokeStyle = lit ? '#00e5ff' : 'rgba(0, 229, 255, 0.3)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // Letter
          ctx.fillStyle = lit ? '#fff' : 'rgba(255,255,255,0.5)';
          ctx.font = `bold ${lit ? 10 : 8}px monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(['C', 'C', 'A'][idx], 0, 1);
        } else if (body.label.startsWith('drop_')) {
          // Glowing target insert
          const pulse = Math.sin(t * 3 + parseInt(body.label.split('_')[1])) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(0, 229, 255, ${pulse})`;
          ctx.shadowColor = C.target;
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.roundRect(-4, -10, 8, 20, 3);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else if (body.label === 'spinner') {
          ctx.save();
          ctx.rotate((g.spinnerAngle * Math.PI) / 180);
          const spinGlow = g.spinnerSpeed > 2 ? 20 : 6;
          ctx.shadowColor = C.ramp;
          ctx.shadowBlur = spinGlow;
          ctx.strokeStyle = C.ramp;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(20, 0);
          ctx.stroke();
          // Cross-bar
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -6);
          ctx.lineTo(0, 6);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        ctx.restore();
      }

      // ── Plunger ──
      if (!g.launched && g.currentBall) {
        const plY = TABLE_H - 15;
        const plH = 50 * g.plungerPower;
        // Plunger track
        ctx.fillStyle = 'rgba(255, 0, 110, 0.08)';
        ctx.fillRect(PLUNGER_X - 8, plY - 55, 16, 55);
        // Power bar with gradient
        const plGrad = ctx.createLinearGradient(0, plY, 0, plY - plH);
        plGrad.addColorStop(0, '#ff006e');
        plGrad.addColorStop(0.5, '#ff3388');
        plGrad.addColorStop(1, '#ff66aa');
        ctx.fillStyle = plGrad;
        ctx.shadowColor = '#ff006e';
        ctx.shadowBlur = 12 + g.plungerPower * 10;
        ctx.beginPath();
        ctx.roundRect(PLUNGER_X - 5, plY - plH, 10, plH, 3);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Cap
        ctx.fillStyle = '#ff006e';
        ctx.beginPath();
        ctx.arc(PLUNGER_X, plY - plH, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(PLUNGER_X - 1, plY - plH - 1, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Ramp labels with glow ──
      ctx.save();
      ctx.shadowColor = C.ramp;
      ctx.shadowBlur = 4;
      ctx.fillStyle = C.ramp;
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.7;
      ctx.translate(40, 340);
      ctx.rotate(-0.25);
      ctx.fillText('DOWNTOWN', 0, 0);
      ctx.fillText('RUSH', 0, 10);
      ctx.restore();

      ctx.save();
      ctx.shadowColor = C.ramp;
      ctx.shadowBlur = 4;
      ctx.fillStyle = C.ramp;
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.7;
      ctx.translate(TABLE_W - 70, 340);
      ctx.rotate(0.25);
      ctx.fillText('NEON', 0, 0);
      ctx.fillText('HIGHWAY', 0, 10);
      ctx.restore();

      // Spinner label with glow
      ctx.shadowColor = C.ramp;
      ctx.shadowBlur = 3;
      ctx.fillStyle = C.ramp;
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.5 + (g.spinnerSpeed > 0 ? 0.3 : 0);
      ctx.fillText('GALAXY CORE', TABLE_W / 2, 160);
      ctx.fillText('REACTOR', TABLE_W / 2, 169);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      // ── Skyline silhouette at top ──
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#00e5ff';
      // Simple city skyline
      const buildings = [
        [30, 85], [50, 70], [70, 90], [95, 55], [115, 80], [135, 65],
        [160, 50], [180, 75], [200, 45], [220, 60], [240, 85],
        [260, 55], [280, 70], [300, 80], [320, 60], [340, 75], [360, 90],
      ];
      for (const [x, h] of buildings) {
        ctx.fillRect(x - 8, 95 - h + 50, 16, h);
        // Window dots
        ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
        for (let wy = 95 - h + 55; wy < 95 + 45; wy += 8) {
          ctx.fillRect(x - 4, wy, 2, 2);
          ctx.fillRect(x + 2, wy, 2, 2);
        }
        ctx.fillStyle = 'rgba(0, 229, 255, 0.06)';
      }
      ctx.restore();

      // ── HUD overlay on canvas ──
      // Tilt warning
      if (g.tilted) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
        ctx.fillRect(0, 0, TABLE_W, TABLE_H);
        // Scan lines
        ctx.globalAlpha = 0.1;
        for (let y = 0; y < TABLE_H; y += 3) {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(0, y, TABLE_W, 1);
        }
        ctx.globalAlpha = 1;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 42px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TILT', TABLE_W / 2, TABLE_H / 2);
        ctx.shadowBlur = 0;
      }

      // Message
      if (message) {
        const msgGrad = ctx.createLinearGradient(TABLE_W/2 - 130, 0, TABLE_W/2 + 130, 0);
        msgGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
        msgGrad.addColorStop(0.2, 'rgba(0, 0, 0, 0.8)');
        msgGrad.addColorStop(0.8, 'rgba(0, 0, 0, 0.8)');
        msgGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = msgGrad;
        ctx.fillRect(TABLE_W / 2 - 130, TABLE_H / 2 - 20, 260, 40);
        // Top/bottom neon lines
        ctx.strokeStyle = C.score;
        ctx.shadowColor = C.score;
        ctx.shadowBlur = 8;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(TABLE_W / 2 - 100, TABLE_H / 2 - 18);
        ctx.lineTo(TABLE_W / 2 + 100, TABLE_H / 2 - 18);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(TABLE_W / 2 - 100, TABLE_H / 2 + 18);
        ctx.lineTo(TABLE_W / 2 + 100, TABLE_H / 2 + 18);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = C.score;
        ctx.shadowBlur = 10;
        ctx.fillText(message, TABLE_W / 2, TABLE_H / 2);
        ctx.shadowBlur = 0;
      }

      // Game over
      if (g.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, TABLE_W, TABLE_H);
        // Scan lines
        ctx.globalAlpha = 0.05;
        for (let y = 0; y < TABLE_H; y += 2) {
          ctx.fillStyle = '#fff';
          ctx.fillRect(0, y, TABLE_W, 1);
        }
        ctx.globalAlpha = 1;
        ctx.shadowColor = '#00e5ff';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#00e5ff';
        ctx.font = 'bold 32px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', TABLE_W / 2, TABLE_H / 2 - 40);
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#ff00ff';
        ctx.font = 'bold 22px monospace';
        ctx.fillText(`${g.score.toLocaleString()}`, TABLE_W / 2, TABLE_H / 2 + 5);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.font = '11px monospace';
        ctx.fillText('PRESS SPACE TO RESTART', TABLE_W / 2, TABLE_H / 2 + 45);
        // Decorative lines
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(TABLE_W/2 - 80, TABLE_H/2 - 55);
        ctx.lineTo(TABLE_W/2 + 80, TABLE_H/2 - 55);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(TABLE_W/2 - 60, TABLE_H/2 + 25);
        ctx.lineTo(TABLE_W/2 + 60, TABLE_H/2 + 25);
        ctx.stroke();
      }

      ctx.restore(); // screen shake

      animRef.current = requestAnimationFrame(renderLoop);
    };

    animRef.current = requestAnimationFrame(renderLoop);

    // ── Keyboard controls ──
    const handleKeyDown = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'z' || e.key === 'Z') {
        e.preventDefault();
        g.leftFlipperUp = true;
      }
      if (e.key === 'ArrowRight' || e.key === '/' || e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        g.rightFlipperUp = true;
      }
      if (e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (g.gameOver) {
          // Restart
          g.score = 0; g.balls = 3; g.gameOver = false; g.combo = 0;
          g.ccaLanes = [false, false, false];
          setScore(0); setBalls(3); setGameOver(false); setCombo(0);
          setCcaLanes([false, false, false]);
          spawnBall();
          return;
        }
        if (!g.launched && g.currentBall) {
          g.plungerCharging = true;
        }
      }
      // Tilt (nudge)
      if (e.key === 't' || e.key === 'T') {
        if (g.tilted || !g.currentBall) return;
        g.tiltWarnings++;
        setTiltWarnings(g.tiltWarnings);
        if (g.tiltWarnings >= 3) {
          g.tilted = true;
          setTilted(true);
          showMessage('TILT! SCORE LOCKED');
          // Kill flippers
          g.leftFlipperUp = false;
          g.rightFlipperUp = false;
        } else {
          showMessage(`TILT WARNING ${g.tiltWarnings}/3`);
          // Nudge ball
          if (g.currentBall) {
            Body.applyForce(g.currentBall, g.currentBall.position, {
              x: (Math.random() - 0.5) * 0.003,
              y: -0.002,
            });
          }
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const g = gameRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'z' || e.key === 'Z') {
        g.leftFlipperUp = false;
      }
      if (e.key === 'ArrowRight' || e.key === '/' || e.key === 'm' || e.key === 'M') {
        g.rightFlipperUp = false;
      }
      if ((e.key === ' ' || e.key === 'ArrowDown') && g.plungerCharging && g.currentBall && !g.launched) {
        // Launch!
        const power = g.plungerPower;
        const force = 0.008 + power * 0.025;
        Body.applyForce(g.currentBall, g.currentBall.position, { x: 0, y: -force });
        g.plungerCharging = false;
        g.plungerPower = 0;
        g.launched = true;
        setPlungerPower(0);

        // Skill shot hint
        if (power > 0.7 && power < 0.85) {
          showMessage('PERFECT LAUNCH!');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animRef.current);
      if (runnerRef.current) Runner.stop(runnerRef.current);
      Engine.clear(engine);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Touch controls for mobile
  const handleFlipperTouch = useCallback((side: 'left' | 'right', down: boolean) => {
    const g = gameRef.current;
    if (side === 'left') g.leftFlipperUp = down;
    else g.rightFlipperUp = down;
  }, []);

  const handlePlungerTouch = useCallback((down: boolean) => {
    const g = gameRef.current;
    if (down && !g.launched && g.currentBall) {
      g.plungerCharging = true;
    } else if (!down && g.plungerCharging && g.currentBall && !g.launched) {
      const power = g.plungerPower;
      const force = 0.008 + power * 0.025;
      Body.applyForce(g.currentBall!, g.currentBall!.position, { x: 0, y: -force });
      g.plungerCharging = false;
      g.plungerPower = 0;
      g.launched = true;
      setPlungerPower(0);
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score display */}
      <div className="w-full max-w-[400px] bg-black/60 border border-neon-cyan/30 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Score</p>
            <p className="text-2xl font-bold text-neon-cyan font-mono">{score.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Balls</p>
            <div className="flex gap-1 justify-center mt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < balls ? 'bg-neon-pink shadow-[0_0_6px_rgba(255,0,110,0.8)]' : 'bg-muted/30'}`} />
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Combo</p>
            <p className={`text-lg font-bold font-mono ${combo > 1 ? 'text-neon-pink' : 'text-muted-foreground'}`}>
              {combo > 0 ? `${Math.min(combo, 5)}x` : '--'}
            </p>
          </div>
        </div>

        {/* CCA progress */}
        <div className="flex justify-center gap-3 mt-2">
          {['C', 'C', 'A'].map((letter, i) => (
            <span key={i} className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${ccaLanes[i] ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50' : 'bg-muted/10 text-muted-foreground border border-muted/20'}`}>
              {letter}
            </span>
          ))}
        </div>

        {/* Tilt warnings */}
        {tiltWarnings > 0 && (
          <div className="flex justify-center gap-1 mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${i < tiltWarnings ? 'bg-destructive' : 'bg-muted/30'}`} />
            ))}
            <span className="text-[10px] text-destructive ml-1 uppercase">Tilt</span>
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="relative rounded-xl overflow-hidden border-2 border-neon-cyan/30 shadow-[0_0_30px_rgba(0,229,255,0.15)]">
        <canvas
          ref={canvasRef}
          className="block"
          style={{ width: TABLE_W, height: TABLE_H }}
        />
      </div>

      {/* Mobile controls */}
      <div className="w-full max-w-[400px] grid grid-cols-3 gap-2 md:hidden">
        <button
          className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-bold py-4 rounded-xl active:bg-neon-cyan/40 select-none text-sm"
          onTouchStart={() => handleFlipperTouch('left', true)}
          onTouchEnd={() => handleFlipperTouch('left', false)}
          onMouseDown={() => handleFlipperTouch('left', true)}
          onMouseUp={() => handleFlipperTouch('left', false)}
        >
          ◀ LEFT
        </button>
        <button
          className="bg-neon-pink/20 border border-neon-pink/40 text-neon-pink font-bold py-4 rounded-xl active:bg-neon-pink/40 select-none text-sm"
          onTouchStart={() => handlePlungerTouch(true)}
          onTouchEnd={() => handlePlungerTouch(false)}
          onMouseDown={() => handlePlungerTouch(true)}
          onMouseUp={() => handlePlungerTouch(false)}
        >
          🎯 LAUNCH
        </button>
        <button
          className="bg-neon-cyan/20 border border-neon-cyan/40 text-neon-cyan font-bold py-4 rounded-xl active:bg-neon-cyan/40 select-none text-sm"
          onTouchStart={() => handleFlipperTouch('right', true)}
          onTouchEnd={() => handleFlipperTouch('right', false)}
          onMouseDown={() => handleFlipperTouch('right', true)}
          onMouseUp={() => handleFlipperTouch('right', false)}
        >
          RIGHT ▶
        </button>
      </div>

      {/* Controls hint (desktop) */}
      <div className="hidden md:flex gap-6 text-xs text-muted-foreground">
        <span><kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">←</kbd> / <kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">Z</kbd> Left Flipper</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">→</kbd> / <kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">M</kbd> Right Flipper</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">Space</kbd> Launch</span>
        <span><kbd className="px-1.5 py-0.5 bg-muted/20 rounded border border-muted/30 text-foreground">T</kbd> Tilt/Nudge</span>
      </div>
    </div>
  );
};

export default CyberPinball;
