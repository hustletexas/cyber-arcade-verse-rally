import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────
const BASE_WIDTH = 480;
const BASE_HEIGHT = 640;
const PADDLE_HEIGHT = 14;
const BALL_RADIUS = 7;
const BRICK_ROWS = 6;
const BRICK_COLS = 8;
const BRICK_PAD = 4;
const BRICK_TOP_OFFSET = 100;
const POWER_UP_CHANCE = 0.10;
const COMBO_WINDOW = 2000;
const STAR_COUNT = 120;

type PowerUpType = 'widen' | 'slow' | 'split' | 'phase';
const POWER_UP_META: Record<PowerUpType, { label: string; color: string; duration: number }> = {
  widen: { label: 'WIDEN GATE', color: '#00ffcc', duration: 10000 },
  slow:  { label: 'TIME DILATION', color: '#8b5cf6', duration: 8000 },
  split: { label: 'ORBIT SPLIT', color: '#f59e0b', duration: 0 },
  phase: { label: 'PHASE ORB', color: '#ec4899', duration: 8000 },
};

interface Ball { x: number; y: number; vx: number; vy: number; trail: { x: number; y: number }[]; }
interface Brick { x: number; y: number; w: number; h: number; hp: number; maxHp: number; wobble: number; wobbleSpeed: number; alive: boolean; }
interface PowerUp { type: PowerUpType; x: number; y: number; vy: number; }
interface Star { x: number; y: number; r: number; a: number; speed: number; }

interface GameState {
  status: 'idle' | 'running' | 'paused' | 'gameover' | 'levelcomplete';
  score: number;
  bestScore: number;
  lives: number;
  level: number;
  paddleX: number;
  paddleW: number;
  basePaddleW: number;
  balls: Ball[];
  bricks: Brick[];
  powerUps: PowerUp[];
  activePower: { type: PowerUpType; end: number } | null;
  combo: { count: number; lastTime: number; display: string; displayEnd: number };
  stars: Star[];
  portalAngle: number;
  shakeEnd: number;
  overlayText: string;
  overlayEnd: number;
  bricksDestroyed: number;
  canvasW: number;
  canvasH: number;
}

function createStars(w: number, h: number): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: Math.random() * 1.5 + 0.5, a: Math.random(),
    speed: Math.random() * 0.3 + 0.05,
  }));
}

function buildBricks(level: number, cw: number): Brick[] {
  const bricks: Brick[] = [];
  const totalPadX = 20;
  const bw = (cw - totalPadX * 2 - (BRICK_COLS - 1) * BRICK_PAD) / BRICK_COLS;
  const bh = 18;
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      let hp = 1;
      if (level >= 2 && Math.random() < 0.3 + level * 0.05) hp = 2;
      if (level >= 4 && Math.random() < 0.1 + (level - 4) * 0.03) hp = 3;
      bricks.push({
        x: totalPadX + c * (bw + BRICK_PAD),
        y: BRICK_TOP_OFFSET + r * (bh + BRICK_PAD),
        w: bw, h: bh, hp, maxHp: hp,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: 0.3 + Math.random() * 0.4,
        alive: true,
      });
    }
  }
  return bricks;
}

function makeBall(cx: number, py: number): Ball {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
  const speed = 4;
  return { x: cx, y: py - BALL_RADIUS - 2, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, trail: [] };
}

function initState(cw: number, ch: number): GameState {
  const pw = cw * 0.22;
  const best = parseInt(localStorage.getItem('portalBreakerBest') || '0', 10);
  return {
    status: 'idle', score: 0, bestScore: best, lives: 3, level: 1,
    paddleX: cw / 2 - pw / 2, paddleW: pw, basePaddleW: pw,
    balls: [makeBall(cw / 2, ch - 40)],
    bricks: buildBricks(1, cw),
    powerUps: [], activePower: null,
    combo: { count: 0, lastTime: 0, display: '', displayEnd: 0 },
    stars: createStars(cw, ch), portalAngle: 0, shakeEnd: 0,
    overlayText: '', overlayEnd: 0, bricksDestroyed: 0,
    canvasW: cw, canvasH: ch,
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

// ─── Component ───────────────────────────────────────────────────────
const PortalBreakerGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState>(initState(BASE_WIDTH, BASE_HEIGHT));
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const [uiStatus, setUiStatus] = useState<GameState['status']>('idle');
  const [uiScore, setUiScore] = useState(0);
  const [uiBest, setUiBest] = useState(0);
  const [uiLives, setUiLives] = useState(3);
  const [uiLevel, setUiLevel] = useState(1);
  const [uiPower, setUiPower] = useState('');
  const [uiCombo, setUiCombo] = useState('');
  const [uiOverlay, setUiOverlay] = useState('');
  const scaleRef = useRef(1);

  // Resize
  useEffect(() => {
    const resize = () => {
      const c = containerRef.current;
      if (!c) return;
      const maxW = Math.min(c.clientWidth, 520);
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
    };
    const onMouse = (e: MouseEvent) => handleMove(e.clientX);
    const onTouch = (e: TouchEvent) => { e.preventDefault(); handleMove(e.touches[0].clientX); };
    canvas.addEventListener('mousemove', onMouse);
    canvas.addEventListener('touchmove', onTouch, { passive: false });
    canvas.addEventListener('touchstart', onTouch, { passive: false });
    return () => {
      canvas.removeEventListener('mousemove', onMouse);
      canvas.removeEventListener('touchmove', onTouch);
      canvas.removeEventListener('touchstart', onTouch);
    };
  }, []);

  const ballSpeed = useCallback((level: number, destroyed: number) => {
    let sp = 4 + (level - 1) * 0.3 + Math.floor(destroyed / 10) * 0.15;
    return Math.min(sp, 8);
  }, []);

  // ─── Game loop ─────────────────────────────────────────────────────
  const update = useCallback((dt: number) => {
    const s = stateRef.current;
    const now = performance.now();
    s.portalAngle += dt * 0.8;

    // Stars twinkle
    s.stars.forEach(st => { st.a = 0.4 + Math.sin(now * 0.001 * st.speed + st.x) * 0.6; });

    // Particles
    particles = particles.filter(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt * 1.5; return p.life > 0; });

    // Power-up timer
    if (s.activePower && now > s.activePower.end) {
      if (s.activePower.type === 'widen') s.paddleW = s.basePaddleW;
      s.activePower = null;
    }

    if (s.status !== 'running') return;

    const paddleY = s.canvasH - 36;
    const sp = ballSpeed(s.level, s.bricksDestroyed);

    // Balls
    const deadBalls: number[] = [];
    s.balls.forEach((ball, bi) => {
      // Slow power
      const speedMult = s.activePower?.type === 'slow' ? 0.55 : 1;
      ball.x += ball.vx * dt * 60 * speedMult;
      ball.y += ball.vy * dt * 60 * speedMult;

      // Trail
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > 12) ball.trail.shift();

      // Wall bounce
      if (ball.x - BALL_RADIUS < 0) { ball.x = BALL_RADIUS; ball.vx = Math.abs(ball.vx); }
      if (ball.x + BALL_RADIUS > s.canvasW) { ball.x = s.canvasW - BALL_RADIUS; ball.vx = -Math.abs(ball.vx); }
      if (ball.y - BALL_RADIUS < 0) { ball.y = BALL_RADIUS; ball.vy = Math.abs(ball.vy); }

      // Paddle collision
      if (ball.vy > 0 && ball.y + BALL_RADIUS >= paddleY && ball.y + BALL_RADIUS <= paddleY + PADDLE_HEIGHT + 4
          && ball.x >= s.paddleX && ball.x <= s.paddleX + s.paddleW) {
        const hitPos = (ball.x - s.paddleX) / s.paddleW; // 0..1
        const angle = -Math.PI * (0.15 + hitPos * 0.7);
        const mag = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        ball.vx = Math.cos(angle) * mag;
        ball.vy = Math.sin(angle) * mag;
        ball.y = paddleY - BALL_RADIUS;
      }

      // Brick collision
      const isPhase = s.activePower?.type === 'phase';
      for (const brick of s.bricks) {
        if (!brick.alive) continue;
        const bx = brick.x + Math.sin(brick.wobble) * 2;
        if (ball.x + BALL_RADIUS > bx && ball.x - BALL_RADIUS < bx + brick.w
            && ball.y + BALL_RADIUS > brick.y && ball.y - BALL_RADIUS < brick.y + brick.h) {
          brick.hp--;
          if (brick.hp <= 0) {
            brick.alive = false;
            s.bricksDestroyed++;
            const pts = brick.maxHp === 1 ? 10 : brick.maxHp === 2 ? 25 : 40;
            // Combo
            if (now - s.combo.lastTime < COMBO_WINDOW) {
              s.combo.count++;
              const bonus = s.combo.count * 5;
              s.score += pts + bonus;
              s.combo.display = `PORTAL COMBO x${s.combo.count}`;
              s.combo.displayEnd = now + 1200;
              if (s.combo.count >= 5) s.shakeEnd = now + 200;
            } else {
              s.combo.count = 1;
              s.score += pts;
            }
            s.combo.lastTime = now;
            // Particles
            const hues = ['#00ffcc', '#8b5cf6', '#ec4899', '#f59e0b'];
            spawnParticles(bx + brick.w / 2, brick.y + brick.h / 2, hues[brick.maxHp % hues.length], 10);
            // Power-up spawn
            if (Math.random() < POWER_UP_CHANCE) {
              const types: PowerUpType[] = ['widen', 'slow', 'split', 'phase'];
              s.powerUps.push({ type: types[Math.floor(Math.random() * types.length)], x: bx + brick.w / 2, y: brick.y + brick.h, vy: 2 });
            }
          }
          if (!isPhase) {
            // Reflect
            const overlapLeft = ball.x + BALL_RADIUS - bx;
            const overlapRight = bx + brick.w - (ball.x - BALL_RADIUS);
            const overlapTop = ball.y + BALL_RADIUS - brick.y;
            const overlapBottom = brick.y + brick.h - (ball.y - BALL_RADIUS);
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            if (minOverlap === overlapLeft || minOverlap === overlapRight) ball.vx = -ball.vx;
            else ball.vy = -ball.vy;
          }
          break; // one collision per frame per ball
        }
      }

      // Normalize speed
      const curMag = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
      if (curMag > 0) { ball.vx = (ball.vx / curMag) * sp; ball.vy = (ball.vy / curMag) * sp; }

      // Fell below
      if (ball.y > s.canvasH + 20) deadBalls.push(bi);
    });

    // Remove dead balls
    for (let i = deadBalls.length - 1; i >= 0; i--) s.balls.splice(deadBalls[i], 1);
    if (s.balls.length === 0) {
      s.lives--;
      if (s.lives <= 0) {
        s.status = 'gameover';
        if (s.score > s.bestScore) { s.bestScore = s.score; localStorage.setItem('portalBreakerBest', String(s.score)); }
      } else {
        s.balls = [makeBall(s.canvasW / 2, s.canvasH - 40)];
        s.paddleX = s.canvasW / 2 - s.paddleW / 2;
      }
    }

    // Power-ups fall
    s.powerUps = s.powerUps.filter(pu => {
      pu.y += pu.vy * dt * 60;
      if (pu.y > s.canvasH + 20) return false;
      if (pu.y + 10 >= paddleY && pu.x >= s.paddleX && pu.x <= s.paddleX + s.paddleW) {
        // Apply
        const meta = POWER_UP_META[pu.type];
        if (pu.type === 'split') {
          s.balls.push(makeBall(s.balls[0]?.x ?? s.canvasW / 2, s.balls[0]?.y ?? s.canvasH / 2));
          s.balls.push(makeBall(s.balls[0]?.x ?? s.canvasW / 2, s.balls[0]?.y ?? s.canvasH / 2));
        } else if (pu.type === 'widen') {
          s.paddleW = s.basePaddleW * 1.5;
          s.activePower = { type: 'widen', end: now + meta.duration };
        } else {
          s.activePower = { type: pu.type, end: now + meta.duration };
        }
        return false;
      }
      return true;
    });

    // Brick wobble
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
        ns.status = 'running';
        ns.overlayText = '';
      }, 1600);
    }
  }, [ballSpeed]);

  // ─── Render ────────────────────────────────────────────────────────
  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    const cw = s.canvasW;
    const ch = s.canvasH;
    const now = performance.now();

    // Shake
    if (now < s.shakeEnd) {
      ctx.save();
      ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
    }

    // BG gradient
    const bg = ctx.createLinearGradient(0, 0, 0, ch);
    bg.addColorStop(0, '#0a0015');
    bg.addColorStop(0.5, '#0d0028');
    bg.addColorStop(1, '#050010');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, cw, ch);

    // Stars
    s.stars.forEach(st => {
      ctx.globalAlpha = st.a;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Portal ring behind bricks
    const portalCx = cw / 2;
    const portalCy = BRICK_TOP_OFFSET + (BRICK_ROWS * 22) / 2;
    const portalR = Math.min(cw * 0.35, 150);
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(portalCx, portalCy);
      ctx.rotate(s.portalAngle + i * (Math.PI * 2 / 3));
      ctx.strokeStyle = `hsla(${270 + i * 40}, 100%, 65%, ${0.15 + Math.sin(now * 0.002 + i) * 0.1})`;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, portalR + i * 6, 0, Math.PI * 1.2);
      ctx.stroke();
      ctx.restore();
    }
    // Portal glow
    const portalGlow = ctx.createRadialGradient(portalCx, portalCy, 0, portalCx, portalCy, portalR);
    portalGlow.addColorStop(0, 'rgba(139,92,246,0.08)');
    portalGlow.addColorStop(1, 'rgba(139,92,246,0)');
    ctx.fillStyle = portalGlow;
    ctx.fillRect(0, 0, cw, ch);

    // Bricks
    s.bricks.forEach(b => {
      if (!b.alive) return;
      const bx = b.x + Math.sin(b.wobble) * 2;
      const hpRatio = b.hp / b.maxHp;
      const hue = b.maxHp === 1 ? 180 : b.maxHp === 2 ? 270 : 330;
      const lightness = 40 + hpRatio * 25;
      ctx.fillStyle = `hsl(${hue}, 90%, ${lightness}%)`;
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${0.5 + hpRatio * 0.5})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const r = 3;
      ctx.moveTo(bx + r, b.y);
      ctx.lineTo(bx + b.w - r, b.y);
      ctx.quadraticCurveTo(bx + b.w, b.y, bx + b.w, b.y + r);
      ctx.lineTo(bx + b.w, b.y + b.h - r);
      ctx.quadraticCurveTo(bx + b.w, b.y + b.h, bx + b.w - r, b.y + b.h);
      ctx.lineTo(bx + r, b.y + b.h);
      ctx.quadraticCurveTo(bx, b.y + b.h, bx, b.y + b.h - r);
      ctx.lineTo(bx, b.y + r);
      ctx.quadraticCurveTo(bx, b.y, bx + r, b.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Glow
      ctx.shadowColor = `hsl(${hue}, 100%, 60%)`;
      ctx.shadowBlur = 6 * hpRatio;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    // Power-ups falling
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

    // Paddle
    const paddleY = ch - 36;
    const padGrad = ctx.createLinearGradient(s.paddleX, paddleY, s.paddleX + s.paddleW, paddleY);
    padGrad.addColorStop(0, '#00ffcc');
    padGrad.addColorStop(0.5, '#8b5cf6');
    padGrad.addColorStop(1, '#00ffcc');
    ctx.fillStyle = padGrad;
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.roundRect(s.paddleX, paddleY, s.paddleW, PADDLE_HEIGHT, 7);
    ctx.fill();
    ctx.shadowBlur = 0;
    // Field effect
    ctx.strokeStyle = 'rgba(0,255,204,0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(s.paddleX - 3, paddleY - 3, s.paddleW + 6, PADDLE_HEIGHT + 6, 10);
    ctx.stroke();

    // Balls
    s.balls.forEach(ball => {
      // Trail
      ball.trail.forEach((t, i) => {
        const alpha = (i / ball.trail.length) * 0.35;
        ctx.fillStyle = `rgba(139,92,246,${alpha})`;
        ctx.beginPath();
        ctx.arc(t.x, t.y, BALL_RADIUS * (i / ball.trail.length) * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
      // Orb
      const orbGrad = ctx.createRadialGradient(ball.x, ball.y, 0, ball.x, ball.y, BALL_RADIUS * 2);
      orbGrad.addColorStop(0, '#fff');
      orbGrad.addColorStop(0.3, '#c084fc');
      orbGrad.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
      ctx.fill();
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

    // Overlay
    if (s.overlayText && now < s.overlayEnd) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, ch / 2 - 40, cw, 80);
      ctx.fillStyle = '#c084fc';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 20;
      ctx.fillText(s.overlayText, cw / 2, ch / 2 + 8);
      ctx.shadowBlur = 0;
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

    // Sync UI
    const s = stateRef.current;
    setUiStatus(s.status);
    setUiScore(s.score);
    setUiBest(s.bestScore);
    setUiLives(s.lives);
    setUiLevel(s.level);
    const now = performance.now();
    if (s.activePower && now < s.activePower.end) {
      const remaining = Math.ceil((s.activePower.end - now) / 1000);
      setUiPower(`${POWER_UP_META[s.activePower.type].label} (${remaining}s)`);
    } else {
      setUiPower('');
    }
    setUiCombo(now < s.combo.displayEnd ? s.combo.display : '');
    setUiOverlay(now < s.overlayEnd ? s.overlayText : '');

    rafRef.current = requestAnimationFrame(loop);
  }, [update, render]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  const startGame = () => {
    const s = stateRef.current;
    if (s.status === 'idle' || s.status === 'gameover') {
      Object.assign(s, initState(BASE_WIDTH, BASE_HEIGHT));
      s.status = 'running';
    }
  };

  const togglePause = () => {
    const s = stateRef.current;
    if (s.status === 'running') s.status = 'paused';
    else if (s.status === 'paused') s.status = 'running';
  };

  const restartGame = () => {
    Object.assign(stateRef.current, initState(BASE_WIDTH, BASE_HEIGHT));
    particles = [];
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
      {/* HUD */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-center">
          <span className="text-muted-foreground">Score</span>
          <p className="text-neon-cyan text-base font-bold">{uiScore}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-center">
          <span className="text-muted-foreground">Lives</span>
          <p className="text-pink-400 text-base font-bold">{'♥'.repeat(uiLives)}</p>
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

      {/* Active power / combo */}
      <div className="h-6 flex items-center gap-3">
        {uiPower && <span className="text-xs font-mono text-neon-cyan animate-pulse">{uiPower}</span>}
        {uiCombo && <span className="text-xs font-mono text-amber-400 animate-bounce">{uiCombo}</span>}
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
      <div className="flex gap-3">
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
      </div>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground text-center font-mono max-w-sm">
        Move paddle. Break shards. Catch drops. Don't let the orb fall.
      </p>
    </div>
  );
};

export default PortalBreakerGame;
