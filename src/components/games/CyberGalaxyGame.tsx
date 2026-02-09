import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

// ─── Constants ───────────────────────────────────────────────────────
const BASE_W = 480;
const BASE_H = 720;
const STAR_COUNT = 150;
const PLAYER_W = 36;
const PLAYER_H = 28;
const BULLET_W = 3;
const BULLET_H = 12;
const E_BULLET_W = 4;
const E_BULLET_H = 10;
const MAX_PLAYER_BULLETS = 5;
const SHOOT_COOLDOWN = 200; // ms
const POWER_UP_SIZE = 18;
const POWER_UP_DROP_CHANCE = 0.08;
const WEAPON_DURATION = 20000;
const SHIELD_HITS = 1;
const INVULN_TIME = 1500;
const WAVE_OVERLAY_TIME = 1200;
const DIVE_INTERVAL_BASE = 3000;
const ENEMY_SHOOT_INTERVAL_BASE = 1200;

// ─── Types ───────────────────────────────────────────────────────────
type EnemyType = 'scout' | 'striker' | 'core';
type PowerUpType = 'overcharge' | 'shield' | 'bomb';
type GameStatus = 'idle' | 'running' | 'paused' | 'gameover';

interface Star { x: number; y: number; r: number; a: number; speed: number; }

interface Player {
  x: number; y: number; w: number; h: number;
  weaponLevel: number; weaponTimer: number;
  shieldActive: boolean; shieldHits: number;
  invulnTimer: number; lives: number;
}

interface Bullet { x: number; y: number; vx: number; vy: number; }

interface Enemy {
  type: EnemyType; hp: number; maxHp: number;
  x: number; y: number; w: number; h: number;
  formX: number; formY: number;
  isDiving: boolean; diveT: number;
  diveStartX: number; diveStartY: number;
  diveCurveDir: number;
  shootTimer: number;
  wobble: number;
}

interface PowerUp { type: PowerUpType; x: number; y: number; vy: number; }

interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; color: string; r: number;
}

interface GameState {
  status: GameStatus;
  score: number; bestScore: number;
  wave: number; bestWave: number;
  player: Player;
  playerBullets: Bullet[];
  enemyBullets: Bullet[];
  enemies: Enemy[];
  powerUps: PowerUp[];
  particles: Particle[];
  stars: Star[];
  portalAngle: number;
  shootCooldown: number;
  diveTimer: number;
  waveOverlayEnd: number;
  shotsFired: number; shotsHit: number;
  activePowerLabel: string; activePowerEnd: number;
  cw: number; ch: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────
function createStars(w: number, h: number): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    r: Math.random() * 1.5 + 0.3, a: Math.random(),
    speed: Math.random() * 0.4 + 0.05,
  }));
}

const ENEMY_META: Record<EnemyType, { hp: number; w: number; h: number; score: number; color: string }> = {
  scout:   { hp: 1, w: 26, h: 22, score: 50,  color: '#00ffcc' },
  striker: { hp: 2, w: 30, h: 26, score: 150, color: '#f59e0b' },
  core:    { hp: 3, w: 38, h: 32, score: 500, color: '#ff3d7f' },
};

function spawnWave(wave: number, cw: number): Enemy[] {
  const enemies: Enemy[] = [];
  const cols = 8;
  const rows = Math.min(5 + Math.floor(wave / 3), 7);
  const gapX = 44;
  const gapY = 38;
  const startX = (cw - (cols - 1) * gapX) / 2;
  const startY = 80;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let type: EnemyType = 'scout';
      if (wave >= 3 && r === 0 && wave % 3 === 0) type = 'core';
      else if (r < 2 && (wave >= 2 && Math.random() < 0.2 + wave * 0.04)) type = 'striker';

      const meta = ENEMY_META[type];
      const fx = startX + c * gapX;
      const fy = startY + r * gapY;
      enemies.push({
        type, hp: meta.hp, maxHp: meta.hp,
        x: fx, y: fy, w: meta.w, h: meta.h,
        formX: fx, formY: fy,
        isDiving: false, diveT: 0,
        diveStartX: 0, diveStartY: 0, diveCurveDir: 1,
        shootTimer: Math.random() * 3000,
        wobble: Math.random() * Math.PI * 2,
      });
    }
  }
  return enemies;
}

function initPlayer(cw: number, ch: number): Player {
  return {
    x: cw / 2 - PLAYER_W / 2, y: ch - 60,
    w: PLAYER_W, h: PLAYER_H,
    weaponLevel: 1, weaponTimer: 0,
    shieldActive: false, shieldHits: 0,
    invulnTimer: 0, lives: 3,
  };
}

function initGame(cw: number, ch: number): GameState {
  const bestScore = parseInt(localStorage.getItem('cyberGalaxyBest') || '0', 10);
  const bestWave = parseInt(localStorage.getItem('cyberGalaxyBestWave') || '0', 10);
  return {
    status: 'idle',
    score: 0, bestScore, wave: 1, bestWave,
    player: initPlayer(cw, ch),
    playerBullets: [], enemyBullets: [],
    enemies: spawnWave(1, cw),
    powerUps: [], particles: [],
    stars: createStars(cw, ch),
    portalAngle: 0, shootCooldown: 0,
    diveTimer: DIVE_INTERVAL_BASE,
    waveOverlayEnd: 0,
    shotsFired: 0, shotsHit: 0,
    activePowerLabel: '', activePowerEnd: 0,
    cw, ch,
  };
}

function spawnParticles(particles: Particle[], x: number, y: number, color: string, count = 10) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = Math.random() * 4 + 1;
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, color, r: Math.random() * 3 + 1 });
  }
}

// ─── Component ───────────────────────────────────────────────────────
const CyberGalaxyGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<GameState>(initGame(BASE_W, BASE_H));
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const scaleRef = useRef(1);
  const keysRef = useRef<Set<string>>(new Set());
  const touchXRef = useRef<number | null>(null);
  const autoFireRef = useRef(false);
  const isMobileRef = useRef(false);

  const [uiStatus, setUiStatus] = useState<GameStatus>('idle');
  const [uiScore, setUiScore] = useState(0);
  const [uiBest, setUiBest] = useState(0);
  const [uiLives, setUiLives] = useState(3);
  const [uiWave, setUiWave] = useState(1);
  const [uiWeapon, setUiWeapon] = useState(1);
  const [uiPower, setUiPower] = useState('');
  const [uiShield, setUiShield] = useState(false);
  const [uiAccuracy, setUiAccuracy] = useState('');

  // ─── Resize ──────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const c = containerRef.current;
      if (!c) return;
      const maxW = Math.min(c.clientWidth, 520);
      const scale = maxW / BASE_W;
      scaleRef.current = scale;
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = BASE_W;
        canvas.height = BASE_H;
        canvas.style.width = `${BASE_W * scale}px`;
        canvas.style.height = `${BASE_H * scale}px`;
      }
    };
    resize();
    isMobileRef.current = 'ontouchstart' in window;
    if (isMobileRef.current) autoFireRef.current = true;
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ─── Keyboard ────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      if (e.key === ' ') e.preventDefault();
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  // ─── Touch ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches[0].clientX - rect.left) / scaleRef.current;
      touchXRef.current = x;
    };
    const handleEnd = () => { touchXRef.current = null; };
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', handleEnd);
    return () => {
      canvas.removeEventListener('touchstart', handleTouch);
      canvas.removeEventListener('touchmove', handleTouch);
      canvas.removeEventListener('touchend', handleEnd);
    };
  }, []);

  // ─── Player shoot ────────────────────────────────────────────────
  const shootPlayer = useCallback((s: GameState) => {
    if (s.playerBullets.length >= MAX_PLAYER_BULLETS) return;
    const p = s.player;
    const cx = p.x + p.w / 2;
    const by = p.y - 4;
    s.shotsFired++;

    if (p.weaponLevel >= 3) {
      s.playerBullets.push({ x: cx, y: by, vx: -1.5, vy: -8 });
      s.playerBullets.push({ x: cx, y: by, vx: 0, vy: -8 });
      s.playerBullets.push({ x: cx, y: by, vx: 1.5, vy: -8 });
    } else if (p.weaponLevel >= 2) {
      s.playerBullets.push({ x: cx - 6, y: by, vx: 0, vy: -8 });
      s.playerBullets.push({ x: cx + 6, y: by, vx: 0, vy: -8 });
    } else {
      s.playerBullets.push({ x: cx, y: by, vx: 0, vy: -8 });
    }
    s.shootCooldown = SHOOT_COOLDOWN;
  }, []);

  // ─── Update ──────────────────────────────────────────────────────
  const update = useCallback((dtMs: number) => {
    const s = stateRef.current;
    const now = performance.now();
    s.portalAngle += dtMs * 0.001;

    // Stars twinkle
    s.stars.forEach(st => { st.a = 0.3 + Math.sin(now * 0.001 * st.speed + st.x) * 0.7; });

    // Particles
    s.particles = s.particles.filter(p => {
      p.x += p.vx; p.y += p.vy; p.life -= dtMs * 0.002;
      p.vy += 0.05; // gravity
      return p.life > 0;
    });

    if (s.status !== 'running') return;

    // Wave overlay
    if (now < s.waveOverlayEnd) return;

    const p = s.player;

    // Active power label
    if (s.activePowerEnd > 0 && now > s.activePowerEnd) {
      s.activePowerLabel = '';
      s.activePowerEnd = 0;
      if (p.weaponLevel > 1) p.weaponLevel = 1;
    }

    // Invulnerability
    if (p.invulnTimer > 0) p.invulnTimer -= dtMs;

    // ── Player movement ──
    const speed = 5;
    const keys = keysRef.current;
    if (keys.has('arrowleft') || keys.has('a')) p.x -= speed;
    if (keys.has('arrowright') || keys.has('d')) p.x += speed;
    if (touchXRef.current !== null) {
      const target = touchXRef.current - p.w / 2;
      const diff = target - p.x;
      p.x += Math.sign(diff) * Math.min(Math.abs(diff), speed * 1.5);
    }
    p.x = Math.max(0, Math.min(s.cw - p.w, p.x));

    // ── Shooting ──
    s.shootCooldown = Math.max(0, s.shootCooldown - dtMs);
    const wantShoot = keys.has(' ') || autoFireRef.current;
    if (wantShoot && s.shootCooldown <= 0) shootPlayer(s);

    // ── Enemy formation sway ──
    const swayX = Math.sin(now * 0.0005) * 20;
    s.enemies.forEach(e => {
      if (!e.isDiving) {
        e.x = e.formX + swayX + Math.sin(e.wobble + now * 0.002) * 3;
        e.y = e.formY + Math.sin(e.wobble + now * 0.0015) * 4;
      }
    });

    // ── Dive timer ──
    const diveInterval = Math.max(800, DIVE_INTERVAL_BASE - s.wave * 150);
    s.diveTimer -= dtMs;
    if (s.diveTimer <= 0) {
      s.diveTimer = diveInterval;
      const nonDiving = s.enemies.filter(e => !e.isDiving);
      const diveCount = Math.min(1 + Math.floor(s.wave / 2), 3, nonDiving.length);
      for (let i = 0; i < diveCount; i++) {
        const e = nonDiving[Math.floor(Math.random() * nonDiving.length)];
        if (e && !e.isDiving) {
          e.isDiving = true;
          e.diveT = 0;
          e.diveStartX = e.x;
          e.diveStartY = e.y;
          e.diveCurveDir = Math.random() > 0.5 ? 1 : -1;
        }
      }
    }

    // ── Update diving enemies ──
    s.enemies.forEach(e => {
      if (!e.isDiving) return;
      e.diveT += dtMs * 0.001;
      const t = e.diveT;
      if (t < 1.5) {
        // Curve down
        e.x = e.diveStartX + Math.sin(t * 2) * 80 * e.diveCurveDir;
        e.y = e.diveStartY + t * (s.ch * 0.5);
      } else {
        // Return to formation
        const returnT = Math.min((t - 1.5) / 1.0, 1);
        e.x = e.x + (e.formX + swayX - e.x) * 0.05;
        e.y = e.y + (e.formY - e.y) * 0.05;
        if (returnT >= 1 || Math.abs(e.y - e.formY) < 3) {
          e.isDiving = false;
        }
      }
    });

    // ── Enemy shooting ──
    const enemyBulletSpeed = 3 + s.wave * 0.15;
    s.enemies.forEach(e => {
      e.shootTimer -= dtMs;
      const interval = e.isDiving ? ENEMY_SHOOT_INTERVAL_BASE * 0.4 : ENEMY_SHOOT_INTERVAL_BASE;
      if (e.shootTimer <= 0) {
        e.shootTimer = interval + Math.random() * 1000;
        if (Math.random() < 0.3 + s.wave * 0.02) {
          const dx = (p.x + p.w / 2) - (e.x + e.w / 2);
          const dy = (p.y) - (e.y + e.h);
          const mag = Math.sqrt(dx * dx + dy * dy) || 1;
          s.enemyBullets.push({
            x: e.x + e.w / 2, y: e.y + e.h,
            vx: (dx / mag) * enemyBulletSpeed * 0.3,
            vy: enemyBulletSpeed,
          });
        }
      }
    });

    // ── Update player bullets ──
    s.playerBullets = s.playerBullets.filter(b => {
      b.x += b.vx; b.y += b.vy;
      return b.y > -20 && b.x > -20 && b.x < s.cw + 20;
    });

    // ── Update enemy bullets ──
    s.enemyBullets = s.enemyBullets.filter(b => {
      b.x += b.vx; b.y += b.vy;
      return b.y < s.ch + 20;
    });

    // ── Update power-ups ──
    s.powerUps = s.powerUps.filter(pu => {
      pu.y += pu.vy;
      if (pu.y > s.ch + 20) return false;
      // Collision with player
      if (pu.x > p.x - POWER_UP_SIZE && pu.x < p.x + p.w + POWER_UP_SIZE &&
          pu.y > p.y - POWER_UP_SIZE && pu.y < p.y + p.h) {
        applyPowerUp(s, pu.type, now);
        return false;
      }
      return true;
    });

    // ── Collisions: player bullets vs enemies ──
    for (let bi = s.playerBullets.length - 1; bi >= 0; bi--) {
      const b = s.playerBullets[bi];
      for (let ei = s.enemies.length - 1; ei >= 0; ei--) {
        const e = s.enemies[ei];
        if (b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
          s.playerBullets.splice(bi, 1);
          s.shotsHit++;
          e.hp--;
          spawnParticles(s.particles, b.x, b.y, ENEMY_META[e.type].color, 5);
          if (e.hp <= 0) {
            const meta = ENEMY_META[e.type];
            const bonus = e.isDiving ? 100 : 0;
            s.score += meta.score + bonus;
            spawnParticles(s.particles, e.x + e.w / 2, e.y + e.h / 2, meta.color, 15);
            // Power-up drop
            if (Math.random() < POWER_UP_DROP_CHANCE) {
              const types: PowerUpType[] = ['overcharge', 'shield', 'bomb'];
              s.powerUps.push({
                type: types[Math.floor(Math.random() * types.length)],
                x: e.x + e.w / 2, y: e.y + e.h / 2, vy: 2,
              });
            }
            s.enemies.splice(ei, 1);
          }
          break;
        }
      }
    }

    // ── Collisions: enemy bullets vs player ──
    if (p.invulnTimer <= 0) {
      for (let bi = s.enemyBullets.length - 1; bi >= 0; bi--) {
        const b = s.enemyBullets[bi];
        if (b.x > p.x && b.x < p.x + p.w && b.y > p.y && b.y < p.y + p.h) {
          s.enemyBullets.splice(bi, 1);
          hitPlayer(s, now);
          break;
        }
      }
    }

    // ── Collisions: enemies vs player ──
    if (p.invulnTimer <= 0) {
      for (const e of s.enemies) {
        if (e.x + e.w > p.x && e.x < p.x + p.w && e.y + e.h > p.y && e.y < p.y + p.h) {
          hitPlayer(s, now);
          break;
        }
      }
    }

    // ── Wave complete ──
    if (s.enemies.length === 0 && s.status === 'running') {
      s.wave++;
      s.enemies = spawnWave(s.wave, s.cw);
      s.waveOverlayEnd = now + WAVE_OVERLAY_TIME;
      s.enemyBullets = [];
      s.powerUps = [];
    }
  }, [shootPlayer]);

  function applyPowerUp(s: GameState, type: PowerUpType, now: number) {
    const p = s.player;
    if (type === 'overcharge') {
      p.weaponLevel = Math.min(p.weaponLevel + 1, 3);
      p.weaponTimer = now + WEAPON_DURATION;
      s.activePowerLabel = 'OVERCHARGE';
      s.activePowerEnd = now + WEAPON_DURATION;
    } else if (type === 'shield') {
      p.shieldActive = true;
      p.shieldHits = SHIELD_HITS;
      s.activePowerLabel = 'SHIELD';
      s.activePowerEnd = 0; // lasts until hit
    } else if (type === 'bomb') {
      // Clear enemy bullets
      s.enemyBullets = [];
      // Damage all enemies 1 HP
      for (let i = s.enemies.length - 1; i >= 0; i--) {
        s.enemies[i].hp--;
        if (s.enemies[i].hp <= 0) {
          const e = s.enemies[i];
          s.score += ENEMY_META[e.type].score;
          spawnParticles(s.particles, e.x + e.w / 2, e.y + e.h / 2, ENEMY_META[e.type].color, 10);
          s.enemies.splice(i, 1);
        }
      }
      // Screen flash effect via particles
      for (let i = 0; i < 30; i++) {
        spawnParticles(s.particles, Math.random() * s.cw, Math.random() * s.ch, '#ffffff', 1);
      }
      s.activePowerLabel = 'BOMB!';
      s.activePowerEnd = performance.now() + 1000;
    }
  }

  function hitPlayer(s: GameState, _now: number) {
    const p = s.player;
    if (p.shieldActive) {
      p.shieldHits--;
      if (p.shieldHits <= 0) {
        p.shieldActive = false;
        s.activePowerLabel = '';
        s.activePowerEnd = 0;
      }
      spawnParticles(s.particles, p.x + p.w / 2, p.y, '#00ccff', 12);
      return;
    }
    p.lives--;
    p.invulnTimer = INVULN_TIME;
    p.weaponLevel = 1;
    p.weaponTimer = 0;
    s.activePowerLabel = '';
    s.activePowerEnd = 0;
    spawnParticles(s.particles, p.x + p.w / 2, p.y + p.h / 2, '#ff3d7f', 20);
    if (p.lives <= 0) {
      endGame(s);
    }
  }

  function endGame(s: GameState) {
    s.status = 'gameover';
    if (s.score > s.bestScore) {
      s.bestScore = s.score;
      localStorage.setItem('cyberGalaxyBest', String(s.score));
    }
    if (s.wave > s.bestWave) {
      s.bestWave = s.wave;
      localStorage.setItem('cyberGalaxyBestWave', String(s.wave));
    }
  }

  // ─── Render ──────────────────────────────────────────────────────
  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const s = stateRef.current;
    const cw = s.cw, ch = s.ch;
    const now = performance.now();

    // Background
    const grad = ctx.createLinearGradient(0, 0, 0, ch);
    grad.addColorStop(0, '#05000f');
    grad.addColorStop(0.5, '#0a0020');
    grad.addColorStop(1, '#050010');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    // Stars
    s.stars.forEach(st => {
      ctx.globalAlpha = st.a;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Portal ring at top center
    const pcx = cw / 2, pcy = 60;
    for (let i = 0; i < 3; i++) {
      const angle = s.portalAngle + (i * Math.PI * 2 / 3);
      ctx.strokeStyle = `hsla(${280 + i * 40}, 100%, 60%, ${0.3 + Math.sin(angle * 2) * 0.15})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(pcx, pcy, 180 + i * 10, 25 + i * 5, angle * 0.3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Particles
    s.particles.forEach(p => {
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Enemies
    s.enemies.forEach(e => {
      const meta = ENEMY_META[e.type];
      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);

      // Glow
      ctx.shadowColor = meta.color;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = meta.color;
      ctx.lineWidth = 1.5;
      ctx.fillStyle = `${meta.color}33`;

      if (e.type === 'scout') {
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -e.h / 2);
        ctx.lineTo(e.w / 2, 0);
        ctx.lineTo(0, e.h / 2);
        ctx.lineTo(-e.w / 2, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      } else if (e.type === 'striker') {
        // Hexagonal
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 2;
          const px = Math.cos(a) * e.w / 2;
          const py = Math.sin(a) * e.h / 2;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill(); ctx.stroke();
      } else {
        // Core: octagon with inner glow
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI / 4) * i - Math.PI / 8;
          const px = Math.cos(a) * e.w / 2;
          const py = Math.sin(a) * e.h / 2;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // Inner dot
        ctx.fillStyle = meta.color;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // HP indicator for multi-hp
      if (e.maxHp > 1) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#fff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${e.hp}`, 0, 3);
      }

      ctx.restore();
    });

    // Player bullets
    s.playerBullets.forEach(b => {
      ctx.fillStyle = '#00ffcc';
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 6;
      ctx.fillRect(b.x - BULLET_W / 2, b.y - BULLET_H / 2, BULLET_W, BULLET_H);
    });
    ctx.shadowBlur = 0;

    // Enemy bullets
    s.enemyBullets.forEach(b => {
      ctx.fillStyle = '#ff3d7f';
      ctx.shadowColor = '#ff3d7f';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(b.x, b.y, E_BULLET_W, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Power-ups
    const puColors: Record<PowerUpType, string> = { overcharge: '#f59e0b', shield: '#00ccff', bomb: '#ff3d7f' };
    const puLabels: Record<PowerUpType, string> = { overcharge: 'W', shield: 'S', bomb: 'B' };
    s.powerUps.forEach(pu => {
      ctx.fillStyle = puColors[pu.type];
      ctx.shadowColor = puColors[pu.type];
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(pu.x, pu.y, POWER_UP_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#000';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(puLabels[pu.type], pu.x, pu.y);
    });
    ctx.shadowBlur = 0;

    // Player ship
    const p = s.player;
    const blink = p.invulnTimer > 0 && Math.floor(now / 100) % 2 === 0;
    if (!blink) {
      ctx.save();
      ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 12;
      ctx.strokeStyle = '#00ffcc';
      ctx.lineWidth = 2;
      ctx.fillStyle = 'rgba(0,255,204,0.15)';

      // Ship shape: arrow/chevron
      ctx.beginPath();
      ctx.moveTo(0, -p.h / 2);           // nose
      ctx.lineTo(p.w / 2, p.h / 2);      // right wing
      ctx.lineTo(p.w / 4, p.h / 4);      // right indent
      ctx.lineTo(0, p.h / 3);            // bottom center
      ctx.lineTo(-p.w / 4, p.h / 4);     // left indent
      ctx.lineTo(-p.w / 2, p.h / 2);     // left wing
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Engine glow
      ctx.fillStyle = '#8b5cf6';
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, p.h / 3 + 4, 4, 6 + Math.sin(now * 0.01) * 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Shield bubble
      if (p.shieldActive) {
        ctx.strokeStyle = 'rgba(0,204,255,0.5)';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00ccff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w * 0.8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Wave overlay
    if (now < s.waveOverlayEnd) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#8b5cf6';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PORTAL OPENING...', cw / 2, ch / 2 - 15);
      ctx.fillStyle = '#00ffcc';
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`WAVE ${s.wave}`, cw / 2, ch / 2 + 20);
    }

    // Game over overlay
    if (s.status === 'gameover') {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#ff3d7f';
      ctx.font = 'bold 26px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PORTAL BREACHED', cw / 2, ch / 2 - 60);

      ctx.fillStyle = '#fff';
      ctx.font = '16px monospace';
      ctx.fillText(`Score: ${s.score}`, cw / 2, ch / 2 - 20);
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`Best: ${s.bestScore}`, cw / 2, ch / 2 + 10);
      ctx.fillStyle = '#8b5cf6';
      ctx.fillText(`Wave: ${s.wave}  |  Best Wave: ${s.bestWave}`, cw / 2, ch / 2 + 40);

      if (s.shotsFired > 0) {
        const acc = Math.round((s.shotsHit / s.shotsFired) * 100);
        ctx.fillStyle = '#00ffcc';
        ctx.font = '12px monospace';
        ctx.fillText(`Accuracy: ${acc}%`, cw / 2, ch / 2 + 65);
      }

      ctx.fillStyle = '#aaa';
      ctx.font = '14px monospace';
      ctx.fillText('Press RESTART to try again', cw / 2, ch / 2 + 95);
    }

    // Idle overlay
    if (s.status === 'idle') {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = '#00ffcc';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CYBER GALAXY', cw / 2, ch / 2 - 20);
      ctx.fillStyle = '#8b5cf6';
      ctx.font = '14px monospace';
      ctx.fillText('Arcade Defense', cw / 2, ch / 2 + 10);
      ctx.fillStyle = '#aaa';
      ctx.font = '12px monospace';
      ctx.fillText('Press START to begin', cw / 2, ch / 2 + 40);
    }
  }, []);

  // ─── Loop ────────────────────────────────────────────────────────
  const loop = useCallback((time: number) => {
    const dt = Math.min(time - lastTimeRef.current, 50);
    lastTimeRef.current = time;
    update(dt);
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) render(ctx);

    const s = stateRef.current;
    setUiStatus(s.status);
    setUiScore(s.score);
    setUiBest(s.bestScore);
    setUiLives(s.player.lives);
    setUiWave(s.wave);
    setUiWeapon(s.player.weaponLevel);
    setUiShield(s.player.shieldActive);
    const now = performance.now();
    setUiPower(s.activePowerEnd > 0 && now < s.activePowerEnd ? s.activePowerLabel : (s.player.shieldActive ? 'SHIELD' : ''));
    if (s.status === 'gameover' && s.shotsFired > 0) {
      setUiAccuracy(`${Math.round((s.shotsHit / s.shotsFired) * 100)}%`);
    } else {
      setUiAccuracy('');
    }

    rafRef.current = requestAnimationFrame(loop);
  }, [update, render]);

  useEffect(() => {
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // ─── Controls ────────────────────────────────────────────────────
  const startGame = () => {
    const s = stateRef.current;
    if (s.status === 'idle' || s.status === 'gameover') {
      Object.assign(s, initGame(BASE_W, BASE_H));
      s.status = 'running';
      s.waveOverlayEnd = performance.now() + WAVE_OVERLAY_TIME;
    }
  };

  const togglePause = () => {
    const s = stateRef.current;
    if (s.status === 'running') s.status = 'paused';
    else if (s.status === 'paused') s.status = 'running';
  };

  const restartGame = () => {
    Object.assign(stateRef.current, initGame(BASE_W, BASE_H));
    stateRef.current.status = 'running';
    stateRef.current.waveOverlayEnd = performance.now() + WAVE_OVERLAY_TIME;
  };

  const fireButton = () => {
    const s = stateRef.current;
    if (s.status === 'running' && s.shootCooldown <= 0) {
      shootPlayer(s);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-4">
      {/* HUD */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
        <div className="bg-black/30 backdrop-blur-sm border border-neon-cyan/30 rounded-lg px-3 py-2 text-center">
          <span className="text-muted-foreground">Score</span>
          <p className="text-neon-cyan text-base font-bold">{uiScore.toLocaleString()}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-neon-cyan/30 rounded-lg px-3 py-2 text-center">
          <span className="text-muted-foreground">Lives</span>
          <p className="text-pink-400 text-base font-bold">{'♥'.repeat(Math.max(0, uiLives))}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-neon-cyan/30 rounded-lg px-3 py-2 text-center">
          <span className="text-muted-foreground">Wave</span>
          <p className="text-purple-300 text-base font-bold">{uiWave}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-neon-cyan/30 rounded-lg px-3 py-2 text-center">
          <span className="text-muted-foreground">Best</span>
          <p className="text-amber-400 text-base font-bold">{uiBest.toLocaleString()}</p>
        </div>
        <div className="bg-black/30 backdrop-blur-sm border border-neon-cyan/30 rounded-lg px-3 py-2 text-center col-span-2 sm:col-span-1">
          <span className="text-muted-foreground">Weapon</span>
          <p className="text-neon-green text-base font-bold">Lv.{uiWeapon}{uiShield ? ' 🛡' : ''}</p>
        </div>
      </div>

      {/* Active power */}
      <div className="h-5 flex items-center gap-3">
        {uiPower && <span className="text-xs font-mono text-amber-400 animate-pulse">{uiPower}</span>}
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="w-full flex justify-center">
        <canvas
          ref={canvasRef}
          className="rounded-xl border border-purple-500/30 cursor-crosshair touch-none"
          style={{ background: '#05000f' }}
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
      </div>

      {/* Mobile Fire Button */}
      {isMobileRef.current && uiStatus === 'running' && (
        <Button
          onTouchStart={fireButton}
          className="w-full max-w-xs bg-neon-pink/20 border border-neon-pink/50 text-neon-pink font-bold text-lg py-4 active:bg-neon-pink/40"
        >
          FIRE
        </Button>
      )}

      {/* Controls hint */}
      <p className="text-xs text-muted-foreground text-center font-mono max-w-sm">
        {isMobileRef.current
          ? 'Touch & drag to move • Auto-fire enabled • Tap FIRE for extra shots'
          : '← → or A/D to move • SPACE to shoot • Destroy all enemies to advance'}
      </p>
    </div>
  );
};

export default CyberGalaxyGame;
