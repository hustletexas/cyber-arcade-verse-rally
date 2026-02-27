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
            g.bumperFlash.set(`bumper_${i}`, Date.now() + 200);
            // Apply bounce force
            const bumper = pair.bodyA.label === `bumper_${i}` ? pair.bodyA : pair.bodyB;
            const dir = Vector.sub(ball.position, bumper.position);
            const norm = Vector.normalise(dir);
            Body.applyForce(ball, ball.position, { x: norm.x * 0.008, y: norm.y * 0.008 });
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
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, TABLE_W, TABLE_H);

      // Grid pattern
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < TABLE_W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, TABLE_H); ctx.stroke();
      }
      for (let y = 0; y < TABLE_H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(TABLE_W, y); ctx.stroke();
      }

      // Draw all bodies
      const bodies = Composite.allBodies(engine.world);
      for (const body of bodies) {
        if (body.label === 'drain') continue;

        ctx.save();
        ctx.translate(body.position.x, body.position.y);
        ctx.rotate(body.angle);

        if (body.label === 'ball') {
          // Neon ball with glow
          ctx.shadowColor = C.ballGlow;
          ctx.shadowBlur = 15;
          ctx.fillStyle = C.ball;
          ctx.beginPath();
          ctx.arc(0, 0, BALL_R, 0, Math.PI * 2);
          ctx.fill();
          // Inner bright core
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.beginPath();
          ctx.arc(-2, -2, 3, 0, Math.PI * 2);
          ctx.fill();
        } else if (body.label.startsWith('bumper_')) {
          const isFlashing = g.bumperFlash.has(body.label) && Date.now() < g.bumperFlash.get(body.label)!;
          ctx.shadowColor = C.bumperStroke;
          ctx.shadowBlur = isFlashing ? 20 : 8;
          ctx.fillStyle = isFlashing ? C.bumperHit : C.bumper;
          ctx.beginPath();
          ctx.arc(0, 0, bumperR, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = C.bumperStroke;
          ctx.lineWidth = 2;
          ctx.stroke();
          // Score text
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('100', 0, 0);
        } else if (body.label === 'leftFlipper' || body.label === 'rightFlipper') {
          ctx.shadowColor = C.flipper;
          ctx.shadowBlur = 10;
          ctx.fillStyle = C.flipper;
          ctx.beginPath();
          const hw = FLIPPER_W / 2;
          const hh = FLIPPER_H / 2;
          ctx.roundRect(-hw, -hh, FLIPPER_W, FLIPPER_H, 6);
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (body.label === 'wall') {
          ctx.fillStyle = C.wall;
          ctx.strokeStyle = C.wallStroke;
          ctx.lineWidth = 1;
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (body.label === 'slingshot') {
          ctx.fillStyle = C.slingshot;
          ctx.shadowColor = C.slingshot;
          ctx.shadowBlur = 6;
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (body.label === 'kickback') {
          ctx.fillStyle = C.neonPink;
          ctx.shadowColor = C.neonPink;
          ctx.shadowBlur = 8;
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        } else if (body.label.startsWith('ramp_')) {
          ctx.strokeStyle = C.ramp;
          ctx.shadowColor = C.ramp;
          ctx.shadowBlur = 6;
          ctx.lineWidth = 3;
          const verts = body.vertices.map(v => ({ x: v.x - body.position.x, y: v.y - body.position.y }));
          ctx.beginPath();
          ctx.moveTo(verts[0].x, verts[0].y);
          for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
          ctx.closePath();
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else if (body.label.startsWith('cca_')) {
          const idx = parseInt(body.label.split('_')[1]);
          const lit = g.ccaLanes[idx];
          ctx.fillStyle = lit ? C.target : 'rgba(0, 229, 255, 0.2)';
          if (lit) { ctx.shadowColor = C.target; ctx.shadowBlur = 10; }
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(['C', 'C', 'A'][idx], 0, 0);
        } else if (body.label.startsWith('drop_')) {
          ctx.fillStyle = C.target;
          ctx.fillRect(-3, -10, 6, 20);
        } else if (body.label === 'spinner') {
          ctx.save();
          ctx.rotate((g.spinnerAngle * Math.PI) / 180);
          ctx.strokeStyle = C.ramp;
          ctx.lineWidth = 3;
          ctx.shadowColor = C.ramp;
          ctx.shadowBlur = g.spinnerSpeed > 0 ? 12 : 4;
          ctx.beginPath();
          ctx.moveTo(-20, 0);
          ctx.lineTo(20, 0);
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
        ctx.fillStyle = C.neonPink;
        ctx.shadowColor = C.neonPink;
        ctx.shadowBlur = 8;
        ctx.fillRect(PLUNGER_X - 6, plY - plH, 12, plH);
        ctx.shadowBlur = 0;
        // Spring lines
        for (let i = 0; i < 5; i++) {
          const sy = plY - (plH / 5) * i;
          ctx.strokeStyle = 'rgba(255, 0, 110, 0.5)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(PLUNGER_X - 8, sy);
          ctx.lineTo(PLUNGER_X + 8, sy);
          ctx.stroke();
        }
      }

      // ── Ramp labels ──
      ctx.save();
      ctx.fillStyle = C.ramp;
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.6;
      ctx.translate(40, 340);
      ctx.rotate(-0.25);
      ctx.fillText('DOWNTOWN', 0, 0);
      ctx.fillText('RUSH', 0, 10);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = C.ramp;
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.6;
      ctx.translate(TABLE_W - 70, 340);
      ctx.rotate(0.25);
      ctx.fillText('NEON', 0, 0);
      ctx.fillText('HIGHWAY', 0, 10);
      ctx.restore();

      // Spinner label
      ctx.fillStyle = C.ramp;
      ctx.font = 'bold 7px monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.5;
      ctx.fillText('GALAXY CORE', TABLE_W / 2, 160);
      ctx.fillText('REACTOR', TABLE_W / 2, 169);
      ctx.globalAlpha = 1;

      // ── HUD overlay on canvas ──
      // Tilt warning
      if (g.tilted) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, TABLE_W, TABLE_H);
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('TILT', TABLE_W / 2, TABLE_H / 2);
      }

      // Message
      if (message) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(TABLE_W / 2 - 120, TABLE_H / 2 - 25, 240, 50);
        ctx.strokeStyle = C.score;
        ctx.lineWidth = 1;
        ctx.strokeRect(TABLE_W / 2 - 120, TABLE_H / 2 - 25, 240, 50);
        ctx.fillStyle = C.score;
        ctx.font = 'bold 14px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(message, TABLE_W / 2, TABLE_H / 2);
      }

      // Game over
      if (g.gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, TABLE_W, TABLE_H);
        ctx.fillStyle = C.score;
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', TABLE_W / 2, TABLE_H / 2 - 30);
        ctx.font = 'bold 18px monospace';
        ctx.fillText(`SCORE: ${g.score.toLocaleString()}`, TABLE_W / 2, TABLE_H / 2 + 10);
        ctx.fillStyle = C.text;
        ctx.font = '12px monospace';
        ctx.fillText('Press SPACE to restart', TABLE_W / 2, TABLE_H / 2 + 45);
      }

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
