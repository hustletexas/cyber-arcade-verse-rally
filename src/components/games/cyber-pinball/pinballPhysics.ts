import Matter from 'matter-js';

const { Engine, Bodies, Body, Composite, Events, Constraint, Vector } = Matter;

// ── Dimensions (physics space) ──
export const TW = 300;
export const TH = 600;
export const BALL_R = 7;
const WALL = 10;
const BUMPER_R = 16;
const FLIPPER_W = 60;
const FLIPPER_H = 10;
const PLUNGER_LANE_W = 30;

// ── Scoring values ──
const SCORE = {
  BUMPER: 100,
  SLINGSHOT: 50,
  DROP_TARGET: 200,
  CYBER_BONUS: 5000,
  ORBIT: 300,
  RAMP: 500,
  SKILL_SHOT: 3000,
};

export interface GameState {
  score: number;
  balls: number;
  combo: number;
  comboTimer: number;
  cyberTargets: boolean[];
  overdrive: boolean;
  overdriveTimer: number;
  reactorCharge: number;
  demonMode: boolean;
  demonTimer: number;
  demonClears: number;
  multiball: boolean;
  lockedBalls: number;
  gameOver: boolean;
  launched: boolean;
  tilt: boolean;
  nudgeCount: number;
}

export interface PhysicsWorld {
  engine: Matter.Engine;
  ball: Matter.Body | null;
  extraBalls: Matter.Body[];
  leftFlipper: Matter.Body;
  rightFlipper: Matter.Body;
  leftFlipperConstraint: Matter.Constraint;
  rightFlipperConstraint: Matter.Constraint;
  bumpers: Matter.Body[];
  slingshots: Matter.Body[];
  dropTargets: Matter.Body[];
  orbitSensors: Matter.Body[];
  rampSensor: Matter.Body;
  skillShotSensor: Matter.Body;
  walls: Matter.Body[];
  state: GameState;
  cleanup: () => void;
}

const defaultState = (): GameState => ({
  score: 0,
  balls: 3,
  combo: 1,
  comboTimer: 0,
  cyberTargets: [false, false, false, false, false],
  overdrive: false,
  overdriveTimer: 0,
  reactorCharge: 0,
  demonMode: false,
  demonTimer: 0,
  demonClears: 0,
  multiball: false,
  lockedBalls: 0,
  gameOver: false,
  launched: false,
  tilt: false,
  nudgeCount: 0,
});

export function createPhysicsWorld(onScore?: (label: string, points: number) => void): PhysicsWorld {
  const engine = Engine.create({
    gravity: { x: 0, y: 1.2, scale: 0.001 },
  });

  const state = defaultState();
  const bodies: Matter.Body[] = [];

  // ── Walls ──
  const wallOpts = { isStatic: true, restitution: 0.4, friction: 0.1, label: 'wall' };
  const leftWall = Bodies.rectangle(-WALL / 2, TH / 2, WALL, TH + 40, wallOpts);
  const rightWall = Bodies.rectangle(TW + WALL / 2, TH / 2, WALL, TH + 40, wallOpts);
  const topWall = Bodies.rectangle(TW / 2, -WALL / 2, TW + 20, WALL, wallOpts);
  
  // Plunger lane separator
  const plungerSep = Bodies.rectangle(TW - PLUNGER_LANE_W, TH * 0.35, WALL / 2, TH * 0.5, { ...wallOpts, label: 'plunger-sep' });
  
  // Plunger lane bottom guide
  const plungerBottom = Bodies.rectangle(TW - PLUNGER_LANE_W / 2, TH * 0.6, PLUNGER_LANE_W, WALL / 2, { ...wallOpts, label: 'plunger-guide' });
  
  // Drain walls (angled guides to flippers)
  const drainGuideL = Bodies.rectangle(40, TH - 60, 80, WALL, { ...wallOpts, angle: Math.PI * 0.2, label: 'drain-guide' });
  const drainGuideR = Bodies.rectangle(TW - 70, TH - 60, 80, WALL, { ...wallOpts, angle: -Math.PI * 0.2, label: 'drain-guide' });

  const walls = [leftWall, rightWall, topWall, plungerSep, plungerBottom, drainGuideL, drainGuideR];
  bodies.push(...walls);

  // ── Bumpers ──
  const bumperOpts = { isStatic: true, restitution: 1.5, label: 'bumper', circleRadius: BUMPER_R };
  const bumper1 = Bodies.circle(TW * 0.35, TH * 0.22, BUMPER_R, { ...bumperOpts });
  const bumper2 = Bodies.circle(TW * 0.55, TH * 0.18, BUMPER_R, { ...bumperOpts });
  const bumper3 = Bodies.circle(TW * 0.45, TH * 0.3, BUMPER_R, { ...bumperOpts });
  const bumpers = [bumper1, bumper2, bumper3];
  bodies.push(...bumpers);

  // ── Slingshots ──
  const slingshotOpts = { isStatic: true, restitution: 1.2, label: 'slingshot' };
  const slingshotL = Bodies.fromVertices(55, TH - 130, [
    [{ x: 0, y: 0 }, { x: 30, y: -50 }, { x: 10, y: -50 }] as any
  ], { ...slingshotOpts });
  const slingshotR = Bodies.fromVertices(TW - 85, TH - 130, [
    [{ x: 0, y: 0 }, { x: -30, y: -50 }, { x: -10, y: -50 }] as any
  ], { ...slingshotOpts });
  // Fallback if fromVertices fails
  const slingshotLBody = slingshotL || Bodies.rectangle(55, TH - 130, 15, 50, { ...slingshotOpts, angle: 0.3 });
  const slingshotRBody = slingshotR || Bodies.rectangle(TW - 85, TH - 130, 15, 50, { ...slingshotOpts, angle: -0.3 });
  const slingshots = [slingshotLBody, slingshotRBody];
  bodies.push(...slingshots);

  // ── Drop targets (C-Y-B-E-R) ──
  const dropTargets: Matter.Body[] = [];
  const targetLabels = ['C', 'Y', 'B', 'E', 'R'];
  for (let i = 0; i < 5; i++) {
    const x = TW * 0.25 + i * 25;
    const y = TH * 0.4;
    const dt = Bodies.rectangle(x, y, 8, 20, {
      isStatic: true,
      restitution: 0.5,
      label: `drop-${targetLabels[i]}-${i}`,
    });
    dropTargets.push(dt);
    bodies.push(dt);
  }

  // ── Orbit sensors (left and right return lanes) ──
  const orbitL = Bodies.rectangle(20, TH * 0.15, 15, 30, { isStatic: true, isSensor: true, label: 'orbit-left' });
  const orbitR = Bodies.rectangle(TW - 50, TH * 0.15, 15, 30, { isStatic: true, isSensor: true, label: 'orbit-right' });
  const orbitSensors = [orbitL, orbitR];
  bodies.push(...orbitSensors);

  // ── Ramp sensor ──
  const rampSensor = Bodies.rectangle(TW * 0.45, TH * 0.12, 30, 10, { isStatic: true, isSensor: true, label: 'ramp' });
  bodies.push(rampSensor);

  // ── Skill shot sensor ──
  const skillShotSensor = Bodies.rectangle(TW - PLUNGER_LANE_W / 2, TH * 0.05, 25, 10, { isStatic: true, isSensor: true, label: 'skill-shot' });
  bodies.push(skillShotSensor);

  // ── Flippers ──
  const flipperOpts = { restitution: 0.05, friction: 0.1, density: 0.03, label: 'flipper' };
  
  const leftFlipperX = TW * 0.3;
  const rightFlipperX = TW * 0.6;
  const flipperY = TH - 45;

  const leftFlipper = Bodies.rectangle(leftFlipperX, flipperY, FLIPPER_W, FLIPPER_H, {
    ...flipperOpts,
    label: 'flipper-left',
  });
  const rightFlipper = Bodies.rectangle(rightFlipperX, flipperY, FLIPPER_W, FLIPPER_H, {
    ...flipperOpts,
    label: 'flipper-right',
  });

  const leftFlipperConstraint = Constraint.create({
    bodyA: leftFlipper,
    pointA: { x: -FLIPPER_W / 2 + 5, y: 0 },
    pointB: { x: leftFlipperX - FLIPPER_W / 2 + 5, y: flipperY },
    stiffness: 1,
    length: 0,
  });

  const rightFlipperConstraint = Constraint.create({
    bodyA: rightFlipper,
    pointA: { x: FLIPPER_W / 2 - 5, y: 0 },
    pointB: { x: rightFlipperX + FLIPPER_W / 2 - 5, y: flipperY },
    stiffness: 1,
    length: 0,
  });

  bodies.push(leftFlipper, rightFlipper);

  // Add everything to world
  Composite.add(engine.world, [...bodies, leftFlipperConstraint, rightFlipperConstraint]);

  // ── Collision handling ──
  Events.on(engine, 'collisionStart', (event) => {
    for (const pair of event.pairs) {
      const labels = [pair.bodyA.label, pair.bodyB.label];
      const isBall = labels.some(l => l === 'ball');
      if (!isBall) continue;

      const other = labels.find(l => l !== 'ball') || '';

      if (other === 'bumper') {
        const bumperBody = pair.bodyA.label === 'bumper' ? pair.bodyA : pair.bodyB;
        const ballBody = pair.bodyA.label === 'ball' ? pair.bodyA : pair.bodyB;
        // Kick the ball away from bumper
        const dx = ballBody.position.x - bumperBody.position.x;
        const dy = ballBody.position.y - bumperBody.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        Body.applyForce(ballBody, ballBody.position, {
          x: (dx / dist) * 0.008,
          y: (dy / dist) * 0.008,
        });
        addScore('bumper', SCORE.BUMPER);
        state.reactorCharge = Math.min(100, state.reactorCharge + 5);
        if (state.reactorCharge >= 100 && !state.overdrive) {
          state.overdrive = true;
          state.overdriveTimer = 15000;
          state.reactorCharge = 0;
        }
      }

      if (other === 'slingshot') {
        addScore('slingshot', SCORE.SLINGSHOT);
      }

      if (other.startsWith('drop-')) {
        const idx = parseInt(other.split('-')[2]);
        if (!state.cyberTargets[idx]) {
          state.cyberTargets[idx] = true;
          addScore('drop-target', SCORE.DROP_TARGET);
          // Check for full CYBER
          if (state.cyberTargets.every(Boolean)) {
            addScore('cyber-bonus', SCORE.CYBER_BONUS);
            state.demonClears++;
            state.cyberTargets = [false, false, false, false, false];
            // Respawn targets
            dropTargets.forEach(dt => {
              Body.setPosition(dt, { x: dt.position.x, y: TH * 0.4 });
            });
            if (state.demonClears >= 2 && !state.demonMode) {
              state.demonMode = true;
              state.demonTimer = 20000;
              state.demonClears = 0;
            }
          }
        }
      }

      if (other.startsWith('orbit-')) {
        addScore('orbit', SCORE.ORBIT);
        bumpCombo();
      }

      if (other === 'ramp') {
        addScore('ramp', SCORE.RAMP);
        state.lockedBalls++;
        if (state.lockedBalls >= 2 && !state.multiball) {
          state.multiball = true;
          state.lockedBalls = 0;
        }
      }

      if (other === 'skill-shot' && !state.launched) {
        addScore('skill-shot', SCORE.SKILL_SHOT);
      }
    }
  });

  function addScore(label: string, base: number) {
    let mult = state.combo;
    if (state.overdrive) mult *= 2;
    if (state.demonMode) mult *= 3;
    const pts = base * mult;
    state.score += pts;
    onScore?.(label, pts);
  }

  function bumpCombo() {
    state.combo = Math.min(5, state.combo + 1);
    state.comboTimer = 3000;
  }

  // ── Ball management ──
  let ball: Matter.Body | null = null;
  const extraBalls: Matter.Body[] = [];

  function spawnBall(launch = false): Matter.Body {
    const b = Bodies.circle(TW - PLUNGER_LANE_W / 2, TH * 0.55, BALL_R, {
      restitution: 0.35,
      friction: 0.02,
      density: 0.0025,
      label: 'ball',
      isStatic: !launch,
    });
    Composite.add(engine.world, b);
    return b;
  }

  ball = spawnBall();

  // ── Timer updates ──
  Events.on(engine, 'beforeUpdate', () => {
    const dt = engine.timing.lastDelta || 16;
    
    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) {
        state.combo = 1;
        state.comboTimer = 0;
      }
    }
    if (state.overdrive && state.overdriveTimer > 0) {
      state.overdriveTimer -= dt;
      if (state.overdriveTimer <= 0) {
        state.overdrive = false;
        state.overdriveTimer = 0;
      }
    }
    if (state.demonMode && state.demonTimer > 0) {
      state.demonTimer -= dt;
      if (state.demonTimer <= 0) {
        state.demonMode = false;
        state.demonTimer = 0;
      }
    }

    // Check drain
    const checkDrain = (b: Matter.Body) => b.position.y > TH + 20;
    
    if (ball && checkDrain(ball)) {
      Composite.remove(engine.world, ball);
      if (extraBalls.length > 0) {
        ball = extraBalls.pop()!;
      } else {
        state.balls--;
        if (state.balls <= 0) {
          state.gameOver = true;
          ball = null;
        } else {
          state.launched = false;
          ball = spawnBall();
        }
      }
    }

    // Drain extra balls
    for (let i = extraBalls.length - 1; i >= 0; i--) {
      if (checkDrain(extraBalls[i])) {
        Composite.remove(engine.world, extraBalls[i]);
        extraBalls.splice(i, 1);
      }
    }

    // Ball recovery (NaN check)
    if (ball && (!Number.isFinite(ball.position.x) || !Number.isFinite(ball.position.y))) {
      Composite.remove(engine.world, ball);
      ball = spawnBall();
      state.launched = false;
    }

    // Flipper angle limits
    const maxAngle = 0.6;
    if (leftFlipper.angle < -maxAngle) Body.setAngle(leftFlipper, -maxAngle);
    if (leftFlipper.angle > 0.1) Body.setAngle(leftFlipper, 0.1);
    if (rightFlipper.angle > maxAngle) Body.setAngle(rightFlipper, maxAngle);
    if (rightFlipper.angle < -0.1) Body.setAngle(rightFlipper, -0.1);
  });

  const cleanup = () => {
    Events.off(engine, 'collisionStart', undefined as any);
    Events.off(engine, 'beforeUpdate', undefined as any);
    Engine.clear(engine);
    Composite.clear(engine.world, false);
  };

  const world: PhysicsWorld = {
    engine,
    ball,
    extraBalls,
    leftFlipper,
    rightFlipper,
    leftFlipperConstraint,
    rightFlipperConstraint,
    bumpers,
    slingshots,
    dropTargets,
    orbitSensors,
    rampSensor,
    skillShotSensor,
    walls,
    state,
    cleanup,
  };

  return world;
}

export function launchBall(world: PhysicsWorld, power: number) {
  if (!world.ball || world.state.launched) return;
  const force = -(0.015 + Math.min(power, 1) * 0.03);
  Body.setStatic(world.ball, false);
  Body.applyForce(world.ball, world.ball.position, { x: 0, y: force });
  world.state.launched = true;
}

export function activateFlipper(world: PhysicsWorld, side: 'left' | 'right') {
  const flipper = side === 'left' ? world.leftFlipper : world.rightFlipper;
  const angVel = side === 'left' ? -0.35 : 0.35;
  Body.setAngularVelocity(flipper, angVel);
}

export function releaseFlipper(world: PhysicsWorld, side: 'left' | 'right') {
  const flipper = side === 'left' ? world.leftFlipper : world.rightFlipper;
  const angVel = side === 'left' ? 0.08 : -0.08;
  Body.setAngularVelocity(flipper, angVel);
}

export function spawnMultiball(world: PhysicsWorld) {
  if (!world.ball) return;
  for (let i = 0; i < 2; i++) {
    const b = Bodies.circle(
      world.ball.position.x + (i === 0 ? -15 : 15),
      world.ball.position.y - 20,
      BALL_R,
      { restitution: 0.35, friction: 0.02, density: 0.0025, label: 'ball' }
    );
    Matter.Composite.add(world.engine.world, b);
    world.extraBalls.push(b);
  }
  world.state.multiball = false;
}

export function resetGame(world: PhysicsWorld): PhysicsWorld {
  world.cleanup();
  return createPhysicsWorld();
}

export function stepEngine(world: PhysicsWorld, delta: number) {
  Engine.update(world.engine, delta);
  
  // Sync ball ref (it might have changed)
  // Check multiball trigger
  if (world.state.multiball) {
    spawnMultiball(world);
  }
}
