import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Trophy } from 'lucide-react';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GalaxySFX } from './CyberGalaxySFX';

// ─── Constants ───────────────────────────────────────────────────────
const BASE_W = 720;
const BASE_H = 780;
const STAR_COUNT = 200;
const PLAYER_W = 40;
const PLAYER_H = 32;
const BULLET_W = 3;
const BULLET_H = 12;
const E_BULLET_W = 4;
const E_BULLET_H = 10;
const MAX_PLAYER_BULLETS = 5;
const SHOOT_COOLDOWN = 200;
const POWER_UP_SIZE = 20;
const POWER_UP_DROP_CHANCE = 0.14;
const WEAPON_DURATION = 20000;
const SHIELD_HITS = 1;
const INVULN_TIME = 1500;
const WAVE_OVERLAY_TIME = 1200;
const DIVE_INTERVAL_BASE = 3500;
const ENEMY_SHOOT_INTERVAL_BASE = 2200;

// ─── Types ───────────────────────────────────────────────────────────
type EnemyType = 'scout' | 'striker' | 'core';
type PowerUpType = 'overcharge' | 'shield' | 'rapidfire' | 'extralife' | 'photonburst' | 'rapidpulse' | 'missileswarm' | 'guardiandrone';
type GameStatus = 'idle' | 'running' | 'paused' | 'gameover';

interface Star { x: number; y: number; r: number; a: number; speed: number; }

interface Player {
  x: number; y: number; w: number; h: number;
  weaponLevel: number; weaponTimer: number;
  shieldActive: boolean; shieldHits: number;
  invulnTimer: number; lives: number;
  rapidFire: boolean; rapidFireEnd: number;
  photonBurst: boolean; photonBurstEnd: number;
  rapidPulse: boolean; rapidPulseEnd: number;
  missileSwarm: boolean; missileSwarmEnd: number;
  guardianDrone: boolean; guardianDroneEnd: number;
}

interface Bullet { x: number; y: number; vx: number; vy: number; piercing?: boolean; weak?: boolean; }

interface Missile { x: number; y: number; vx: number; vy: number; targetIdx: number; life: number; }

interface Enemy {
  type: EnemyType; hp: number; maxHp: number;
  x: number; y: number; w: number; h: number;
  formX: number; formY: number;
  isDiving: boolean; diveT: number;
  diveStartX: number; diveStartY: number;
  diveCurveDir: number;
  shootTimer: number;
  wobble: number;
  reformTimer: number;
  diveShots: number; diveShotsMax: number;
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
  missiles: Missile[];
  stars: Star[];
  portalAngle: number;
  shootCooldown: number;
  diveTimer: number;
  waveOverlayEnd: number;
  shotsFired: number; shotsHit: number;
  activePowerLabel: string; activePowerEnd: number;
  cw: number; ch: number;
}

interface LeaderboardEntry {
  score: number;
  wave: number;
  date: string;
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
  const cols = 10;
  const rows = Math.min(5 + Math.floor(wave / 3), 7);
  const gapX = 52;
  const gapY = 40;
  const startX = (cw - (cols - 1) * gapX) / 2;
  const startY = 90;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let type: EnemyType = 'scout';
      if (wave >= 3 && r === 0 && wave % 3 === 0) type = 'core';
      else if (r < 2 && (wave >= 2 && Math.random() < 0.2 + wave * 0.04)) type = 'striker';

      const meta = ENEMY_META[type];
      // Scale HP with waves: +1 HP every 3 waves
      const bonusHp = Math.floor(wave / 3);
      const totalHp = meta.hp + bonusHp;
      const fx = startX + c * gapX;
      const fy = startY + r * gapY;
      enemies.push({
        type, hp: totalHp, maxHp: totalHp,
        x: fx, y: fy, w: meta.w, h: meta.h,
        formX: fx, formY: fy,
        isDiving: false, diveT: 0,
        diveStartX: 0, diveStartY: 0, diveCurveDir: 1,
        shootTimer: Math.random() * 4000 + 2000,
        wobble: Math.random() * Math.PI * 2,
        reformTimer: 0,
        diveShots: 0, diveShotsMax: 2,
      });
    }
  }
  return enemies;
}

function initPlayer(cw: number, ch: number): Player {
  return {
    x: cw / 2 - PLAYER_W / 2, y: ch - 70,
    w: PLAYER_W, h: PLAYER_H,
    weaponLevel: 1, weaponTimer: 0,
    shieldActive: false, shieldHits: 0,
    invulnTimer: 0, lives: 3,
    rapidFire: false, rapidFireEnd: 0,
    photonBurst: false, photonBurstEnd: 0,
    rapidPulse: false, rapidPulseEnd: 0,
    missileSwarm: false, missileSwarmEnd: 0,
    guardianDrone: false, guardianDroneEnd: 0,
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
    powerUps: [], particles: [], missiles: [],
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

function getLeaderboard(): LeaderboardEntry[] {
  try {
    return JSON.parse(localStorage.getItem('cyberGalaxyLeaderboard') || '[]');
  } catch { return []; }
}

function saveToLeaderboard(score: number, wave: number) {
  const lb = getLeaderboard();
  lb.push({ score, wave, date: new Date().toLocaleDateString() });
  lb.sort((a, b) => b.score - a.score);
  localStorage.setItem('cyberGalaxyLeaderboard', JSON.stringify(lb.slice(0, 10)));
}

// ─── Component ───────────────────────────────────────────────────────
const CyberGalaxyGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { deductBalance } = useUserBalance();
  const { primaryWallet } = useMultiWallet();
  const scoreSubmittedRef = useRef(false);
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
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // ─── Resize ──────────────────────────────────────────────────────
  useEffect(() => {
    const resize = () => {
      const c = containerRef.current;
      if (!c) return;
      const maxW = Math.min(c.clientWidth, 800);
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

    // Photon Burst: piercing beam
    if (p.photonBurst) {
      s.playerBullets.push({ x: cx, y: by, vx: 0, vy: -10, piercing: true });
      GalaxySFX.shootPhoton();
    } else if (p.rapidPulse) {
      // Rapid Pulse: faster weaker shots
      s.playerBullets.push({ x: cx, y: by, vx: 0, vy: -10, weak: true });
    } else if (p.weaponLevel >= 3) {
      s.playerBullets.push({ x: cx, y: by, vx: -1.5, vy: -8 });
      s.playerBullets.push({ x: cx, y: by, vx: 0, vy: -8 });
      s.playerBullets.push({ x: cx, y: by, vx: 1.5, vy: -8 });
    } else if (p.weaponLevel >= 2) {
      s.playerBullets.push({ x: cx - 6, y: by, vx: 0, vy: -8 });
      s.playerBullets.push({ x: cx + 6, y: by, vx: 0, vy: -8 });
    } else {
      s.playerBullets.push({ x: cx, y: by, vx: 0, vy: -8 });
    }
    if (!p.photonBurst) GalaxySFX.shoot();
    // Rapid Pulse fires faster
    const cooldown = (p.rapidPulse || p.rapidFire) ? SHOOT_COOLDOWN * 0.35 : SHOOT_COOLDOWN;
    s.shootCooldown = cooldown;

    // Missile Swarm: launch homing missiles on each shot
    if (p.missileSwarm && s.enemies.length > 0) {
      GalaxySFX.missile();
      for (let i = 0; i < 2; i++) {
        const targetIdx = Math.floor(Math.random() * s.enemies.length);
        s.missiles.push({
          x: cx + (i === 0 ? -10 : 10), y: by,
          vx: (i === 0 ? -2 : 2), vy: -3,
          targetIdx, life: 3000,
        });
      }
    }
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
      p.vy += 0.05;
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
      p.rapidFire = false;
      p.photonBurst = false;
      p.rapidPulse = false;
      p.missileSwarm = false;
      p.guardianDrone = false;
    }

    // Photon burst timer
    if (p.photonBurst && now > p.photonBurstEnd) p.photonBurst = false;
    // Rapid pulse timer
    if (p.rapidPulse && now > p.rapidPulseEnd) p.rapidPulse = false;
    // Missile swarm timer
    if (p.missileSwarm && now > p.missileSwarmEnd) p.missileSwarm = false;
    // Guardian drone timer
    if (p.guardianDrone && now > p.guardianDroneEnd) p.guardianDrone = false;

    // Invulnerability
    if (p.invulnTimer > 0) p.invulnTimer -= dtMs;

    // Rapid fire timer
    if (p.rapidFire && now > p.rapidFireEnd) {
      p.rapidFire = false;
    }

    // ── Player movement ──
    const speed = 5;
    const keys = keysRef.current;
    if (keys.has('arrowleft') || keys.has('a')) p.x -= speed;
    if (keys.has('arrowright') || keys.has('d')) p.x += speed;
    if (touchXRef.current !== null) {
      const target = touchXRef.current - p.w / 2;
      const diff = target - p.x;
      // Move quickly toward finger — nearly instant tracking
      p.x += Math.sign(diff) * Math.min(Math.abs(diff), Math.max(speed * 4, Math.abs(diff) * 0.4));
    }
    p.x = Math.max(0, Math.min(s.cw - p.w, p.x));

    // ── Shooting ──
    s.shootCooldown = Math.max(0, s.shootCooldown - dtMs);
    const wantShoot = keys.has(' ') || autoFireRef.current;
    if (wantShoot && s.shootCooldown <= 0) shootPlayer(s);

    // ── Enemy formation sway ──
    const swayX = Math.sin(now * 0.0005) * 25;
    s.enemies.forEach(e => {
      // Tick down reform cooldown for non-diving enemies
      if (!e.isDiving && e.reformTimer > 0) {
        e.reformTimer -= dtMs;
      }
      if (!e.isDiving) {
        e.x = e.formX + swayX + Math.sin(e.wobble + now * 0.002) * 3;
        e.y = e.formY + Math.sin(e.wobble + now * 0.0015) * 4;
      }
    });

    // ── Dive timer — don't send new divers until all current ones return ──
    const diveInterval = Math.max(800, DIVE_INTERVAL_BASE - s.wave * 150);
    const currentlyDiving = s.enemies.filter(e => e.isDiving).length;
    s.diveTimer -= dtMs;

    // Only launch new divers when NO enemies are currently diving
    if (s.diveTimer <= 0 && currentlyDiving === 0) {
      s.diveTimer = diveInterval;
      const nonDiving = s.enemies.filter(e => !e.isDiving && e.reformTimer <= 0);
      const maxDivers = s.wave <= 10 ? 2 : Math.min(1 + Math.floor(s.wave / 2), 4);
      const diveCount = Math.min(maxDivers, nonDiving.length);
      // Pick from left and right halves of the stage
      const midX = s.cw / 2;
      const leftPool = nonDiving.filter(e => e.formX < midX);
      const rightPool = nonDiving.filter(e => e.formX >= midX);
      const picks: typeof nonDiving = [];
      if (leftPool.length > 0) picks.push(leftPool[Math.floor(Math.random() * leftPool.length)]);
      if (rightPool.length > 0 && picks.length < diveCount) picks.push(rightPool[Math.floor(Math.random() * rightPool.length)]);
      // Fill remaining from any pool if needed
      while (picks.length < diveCount && nonDiving.length > picks.length) {
        const remaining = nonDiving.filter(e => !picks.includes(e));
        if (remaining.length === 0) break;
        picks.push(remaining[Math.floor(Math.random() * remaining.length)]);
      }
      if (picks.length > 0) GalaxySFX.enemyDive();
      for (const e of picks) {
        e.isDiving = true;
        e.diveT = 0;
        e.diveShots = 0;
        e.diveShotsMax = 2 + Math.floor(Math.random() * 2);
        e.shootTimer = 150 + Math.random() * 150;
        e.diveStartX = e.x;
        e.diveStartY = e.y;
        // Left-side enemies curve right, right-side enemies curve left
        e.diveCurveDir = e.formX < midX ? 1 : -1;
      }
    }

    // ── Update diving enemies ──
    s.enemies.forEach(e => {
      if (!e.isDiving) return;
      e.diveT += dtMs * 0.0007; // slowed down from 0.001
      const t = e.diveT;

      if (t < 1.2) {
        // Dive downward with a sine curve (slower descent)
        e.x = e.diveStartX + Math.sin(t * 2) * 80 * e.diveCurveDir;
        e.y = e.diveStartY + t * (s.ch * 0.45);
      } else {
        // Past dive phase — descend at moderate speed
        e.y += 5;
        if (e.y > s.ch + 20) {
          // Snap directly back into formation and start cooldown
          e.x = e.formX + swayX;
          e.y = e.formY;
          e.isDiving = false;
          e.diveT = 0;
          e.reformTimer = 2000 + Math.random() * 2000;
        }
      }
    });

    // ── Enemy shooting — starts slow, speeds up with waves ──
    // Wave 1: bullet speed ~1.5, Wave 5: ~2.5, Wave 10: ~3.5
    const enemyBulletSpeed = 1.5 + s.wave * 0.2;
    // Wave 1: shoot chance ~10%, scales up slowly
    const shootChance = Math.min(0.1 + s.wave * 0.025, 0.5);
    // Shoot interval decreases with waves (starts very generous)
    const baseInterval = Math.max(1200, ENEMY_SHOOT_INTERVAL_BASE - s.wave * 80);
    
    s.enemies.forEach(e => {
      e.shootTimer -= dtMs;
      if (!e.isDiving) return;
      if (e.shootTimer <= 0 && (!e.diveShots || e.diveShots < (e.diveShotsMax || 2))) {
        e.diveShots = (e.diveShots || 0) + 1;
        e.shootTimer = 400 + Math.random() * 200;
        const ex = e.x + e.w / 2, ey = e.y + e.h;
        const dx = (p.x + p.w / 2) - ex;
        const dy = (p.y + p.h / 2) - ey;
        const mag = Math.sqrt(dx * dx + dy * dy) || 1;

        if (e.type === 'scout') {
          // Scout: single aimed shot
          s.enemyBullets.push({ x: ex, y: ey, vx: (dx / mag) * enemyBulletSpeed, vy: (dy / mag) * enemyBulletSpeed });
        } else if (e.type === 'striker') {
          // Striker: 3-way spread
          const baseAngle = Math.atan2(dy, dx);
          for (const offset of [-0.2, 0, 0.2]) {
            const a = baseAngle + offset;
            s.enemyBullets.push({ x: ex, y: ey, vx: Math.cos(a) * enemyBulletSpeed, vy: Math.sin(a) * enemyBulletSpeed });
          }
        } else {
          // Core: 5-way burst
          const baseAngle = Math.atan2(dy, dx);
          for (const offset of [-0.35, -0.17, 0, 0.17, 0.35]) {
            const a = baseAngle + offset;
            s.enemyBullets.push({ x: ex, y: ey, vx: Math.cos(a) * enemyBulletSpeed * 0.9, vy: Math.sin(a) * enemyBulletSpeed * 0.9 });
          }
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
      if (b.y >= s.ch + 20) return false;
      // Guardian drone intercepts nearby enemy bullets
      if (p.guardianDrone) {
        const droneAngle = now * 0.003;
        const droneX = p.x + p.w / 2 + Math.cos(droneAngle) * 40;
        const droneY = p.y + p.h / 2 + Math.sin(droneAngle) * 40;
        const dx = b.x - droneX, dy = b.y - droneY;
        if (dx * dx + dy * dy < 625) {
          spawnParticles(s.particles, b.x, b.y, '#00ddff', 4);
          return false;
        }
      }
      return true;
    });

    // ── Update power-ups ──
    s.powerUps = s.powerUps.filter(pu => {
      pu.y += pu.vy;
      if (pu.y > s.ch + 20) return false;
      if (pu.x > p.x - POWER_UP_SIZE && pu.x < p.x + p.w + POWER_UP_SIZE &&
          pu.y > p.y - POWER_UP_SIZE && pu.y < p.y + p.h) {
        applyPowerUp(s, pu.type, now);
        if (pu.type === 'extralife') GalaxySFX.extraLife(); else GalaxySFX.powerUp();
        return false;
      }
      return true;
    });

    // ── Collisions: player bullets vs enemies ──
    for (let bi = s.playerBullets.length - 1; bi >= 0; bi--) {
      const b = s.playerBullets[bi];
      let bulletConsumed = false;
      for (let ei = s.enemies.length - 1; ei >= 0; ei--) {
        const e = s.enemies[ei];
        if (b.x > e.x && b.x < e.x + e.w && b.y > e.y && b.y < e.y + e.h) {
          s.shotsHit++;
          const dmg = b.weak ? 0.5 : 1;
          e.hp -= dmg;
          spawnParticles(s.particles, b.x, b.y, ENEMY_META[e.type].color, 5);
          if (e.hp <= 0) {
            GalaxySFX.enemyDestroy();
            const meta = ENEMY_META[e.type];
            const bonus = e.isDiving ? 100 : 0;
            s.score += meta.score + bonus;
            spawnParticles(s.particles, e.x + e.w / 2, e.y + e.h / 2, meta.color, 15);
            if (Math.random() < POWER_UP_DROP_CHANCE) {
              const types: PowerUpType[] = ['overcharge', 'shield', 'rapidfire', 'extralife', 'photonburst', 'rapidpulse', 'missileswarm', 'guardiandrone'];
              const weights = [0.20, 0.18, 0.13, 0.08, 0.12, 0.10, 0.09, 0.10];
              let r = Math.random();
              let selectedType: PowerUpType = 'overcharge';
              for (let ti = 0; ti < types.length; ti++) {
                r -= weights[ti];
                if (r <= 0) { selectedType = types[ti]; break; }
              }
              s.powerUps.push({
                type: selectedType,
                x: e.x + e.w / 2, y: e.y + e.h / 2, vy: 1.5,
              });
            }
            s.enemies.splice(ei, 1);
          } else {
            GalaxySFX.enemyHit();
          }
          // Piercing bullets pass through, others are consumed
          if (!b.piercing) { bulletConsumed = true; break; }
        }
      }
      if (bulletConsumed) s.playerBullets.splice(bi, 1);
    }

    // ── Update missiles (homing) ──
    s.missiles = s.missiles.filter(m => {
      m.life -= dtMs;
      if (m.life <= 0 || s.enemies.length === 0) return false;
      // Re-acquire target if out of range
      if (m.targetIdx >= s.enemies.length) m.targetIdx = Math.floor(Math.random() * s.enemies.length);
      const target = s.enemies[m.targetIdx];
      const dx = (target.x + target.w / 2) - m.x;
      const dy = (target.y + target.h / 2) - m.y;
      const mag = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = 5;
      m.vx += (dx / mag) * 0.5; m.vy += (dy / mag) * 0.5;
      const vmag = Math.sqrt(m.vx * m.vx + m.vy * m.vy) || 1;
      m.vx = (m.vx / vmag) * speed; m.vy = (m.vy / vmag) * speed;
      m.x += m.vx; m.y += m.vy;
      // Check collision with target
      if (m.x > target.x && m.x < target.x + target.w && m.y > target.y && m.y < target.y + target.h) {
        target.hp -= 2;
        spawnParticles(s.particles, m.x, m.y, '#ff6600', 8);
        GalaxySFX.missileHit();
        if (target.hp <= 0) {
          const meta = ENEMY_META[target.type];
          s.score += meta.score;
          spawnParticles(s.particles, target.x + target.w / 2, target.y + target.h / 2, meta.color, 15);
          const idx = s.enemies.indexOf(target);
          if (idx >= 0) s.enemies.splice(idx, 1);
        }
        return false;
      }
      return m.y > -50 && m.y < s.ch + 50 && m.x > -50 && m.x < s.cw + 50;
    });

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
      GalaxySFX.waveComplete();
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
      s.activePowerEnd = 0;
    } else if (type === 'rapidfire') {
      p.rapidFire = true;
      p.rapidFireEnd = now + 10000;
      s.activePowerLabel = 'RAPID FIRE';
      s.activePowerEnd = now + 10000;
    } else if (type === 'extralife') {
      p.lives = Math.min(p.lives + 1, 5);
      s.activePowerLabel = '+1 LIFE';
      s.activePowerEnd = now + 1500;
      spawnParticles(s.particles, p.x + p.w / 2, p.y, '#00ff88', 15);
    } else if (type === 'photonburst') {
      p.photonBurst = true;
      p.photonBurstEnd = now + 6000;
      s.activePowerLabel = 'PHOTON BURST';
      s.activePowerEnd = now + 6000;
      spawnParticles(s.particles, p.x + p.w / 2, p.y, '#aa66ff', 12);
    } else if (type === 'rapidpulse') {
      p.rapidPulse = true;
      p.rapidPulseEnd = now + 5000;
      s.activePowerLabel = 'RAPID PULSE';
      s.activePowerEnd = now + 5000;
      spawnParticles(s.particles, p.x + p.w / 2, p.y, '#ffee00', 12);
    } else if (type === 'missileswarm') {
      p.missileSwarm = true;
      p.missileSwarmEnd = now + 7000;
      s.activePowerLabel = 'MISSILE SWARM';
      s.activePowerEnd = now + 7000;
      spawnParticles(s.particles, p.x + p.w / 2, p.y, '#ff6600', 12);
    } else if (type === 'guardiandrone') {
      p.guardianDrone = true;
      p.guardianDroneEnd = now + 10000;
      s.activePowerLabel = 'GUARDIAN DRONE';
      s.activePowerEnd = now + 10000;
      spawnParticles(s.particles, p.x + p.w / 2, p.y, '#00ddff', 12);
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
      GalaxySFX.shieldHit();
      return;
    }
    p.lives--;
    GalaxySFX.playerHit();
    p.invulnTimer = INVULN_TIME;
    p.weaponLevel = 1;
    p.weaponTimer = 0;
    p.rapidFire = false;
    s.activePowerLabel = '';
    s.activePowerEnd = 0;
    spawnParticles(s.particles, p.x + p.w / 2, p.y + p.h / 2, '#ff3d7f', 20);
    if (p.lives <= 0) {
      endGame(s);
    }
  }

  function endGame(s: GameState) {
    s.status = 'gameover';
    GalaxySFX.gameOver();
    if (s.score > s.bestScore) {
      s.bestScore = s.score;
      localStorage.setItem('cyberGalaxyBest', String(s.score));
    }
    if (s.wave > s.bestWave) {
      s.bestWave = s.wave;
      localStorage.setItem('cyberGalaxyBestWave', String(s.wave));
    }
    saveToLeaderboard(s.score, s.wave);
    setLeaderboard(getLeaderboard());

    // Submit score to Supabase
    const wallet = primaryWallet?.address;
    if (wallet && s.score > 0 && !scoreSubmittedRef.current) {
      scoreSubmittedRef.current = true;
      supabase
        .from('galaxy_scores')
        .insert({ user_id: wallet, score: s.score, wave: s.wave })
        .then(({ error }) => {
          if (error) console.error('[CyberGalaxy] Score submit error:', error);
        });
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

    // Portal ring
    const pcx = cw / 2, pcy = 65;
    for (let i = 0; i < 3; i++) {
      const angle = s.portalAngle + (i * Math.PI * 2 / 3);
      ctx.strokeStyle = `hsla(${280 + i * 40}, 100%, 60%, ${0.3 + Math.sin(angle * 2) * 0.15})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(pcx, pcy, 260 + i * 12, 28 + i * 5, angle * 0.3, 0, Math.PI * 2);
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

    // Enemies — shapes evolve every 3 waves (tier 0-4+)
    const shapeTier = Math.min(Math.floor((s.wave - 1) / 3), 4);
    s.enemies.forEach(e => {
      const meta = ENEMY_META[e.type];
      ctx.save();
      ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
      ctx.shadowColor = meta.color;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = meta.color;
      ctx.lineWidth = 1.5;
      ctx.fillStyle = `${meta.color}33`;

      const hw = e.w / 2, hh = e.h / 2;

      if (e.type === 'scout') {
        if (shapeTier === 0) {
          // Basic dart
          ctx.beginPath();
          ctx.moveTo(0, hh); ctx.lineTo(-hw, -hh); ctx.lineTo(0, -hh * 0.4); ctx.lineTo(hw, -hh);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        } else if (shapeTier === 1) {
          // Swept-wing fighter
          ctx.beginPath();
          ctx.moveTo(0, hh); ctx.lineTo(-hw * 0.3, 0); ctx.lineTo(-hw, -hh);
          ctx.lineTo(-hw * 0.4, -hh * 0.5); ctx.lineTo(0, -hh * 0.7);
          ctx.lineTo(hw * 0.4, -hh * 0.5); ctx.lineTo(hw, -hh);
          ctx.lineTo(hw * 0.3, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else if (shapeTier === 2) {
          // Crescent drone
          ctx.beginPath();
          ctx.arc(0, 0, hw, Math.PI * 0.2, Math.PI * 0.8, false);
          ctx.lineTo(0, hh * 0.6);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, -hh * 0.2, hw * 0.4, 0, Math.PI * 2); ctx.stroke();
        } else if (shapeTier === 3) {
          // Tri-blade
          for (let i = 0; i < 3; i++) {
            const a = (i * Math.PI * 2 / 3) + Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(a - 0.3) * hw, Math.sin(a - 0.3) * hh);
            ctx.lineTo(Math.cos(a) * hw * 1.2, Math.sin(a) * hh * 1.2);
            ctx.lineTo(Math.cos(a + 0.3) * hw, Math.sin(a + 0.3) * hh);
            ctx.closePath(); ctx.fill(); ctx.stroke();
          }
        } else {
          // Hex insect
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI / 3) - Math.PI / 6;
            const px = Math.cos(a) * hw, py = Math.sin(a) * hh;
            i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.fill(); ctx.stroke();
          // Antennae
          ctx.beginPath(); ctx.moveTo(-hw * 0.3, -hh); ctx.lineTo(-hw * 0.5, -hh * 1.4);
          ctx.moveTo(hw * 0.3, -hh); ctx.lineTo(hw * 0.5, -hh * 1.4); ctx.stroke();
        }
      } else if (e.type === 'striker') {
        if (shapeTier <= 1) {
          // Standard striker ship
          ctx.beginPath();
          ctx.moveTo(0, hh); ctx.lineTo(-hw * 0.25, hh * 0.2);
          ctx.lineTo(-hw, -hh * 0.7); ctx.lineTo(-hw * 0.3, -hh * 0.6);
          ctx.lineTo(0, -hh); ctx.lineTo(hw * 0.3, -hh * 0.6);
          ctx.lineTo(hw, -hh * 0.7); ctx.lineTo(hw * 0.25, hh * 0.2);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        } else if (shapeTier === 2) {
          // Hammerhead
          ctx.beginPath();
          ctx.moveTo(0, hh); ctx.lineTo(-hw * 0.3, hh * 0.3);
          ctx.lineTo(-hw, hh * 0.1); ctx.lineTo(-hw, -hh * 0.5);
          ctx.lineTo(-hw * 0.4, -hh); ctx.lineTo(hw * 0.4, -hh);
          ctx.lineTo(hw, -hh * 0.5); ctx.lineTo(hw, hh * 0.1);
          ctx.lineTo(hw * 0.3, hh * 0.3);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        } else if (shapeTier === 3) {
          // X-wing
          ctx.beginPath();
          ctx.moveTo(0, hh); ctx.lineTo(-hw * 0.2, 0); ctx.lineTo(-hw, -hh);
          ctx.lineTo(-hw * 0.4, -hh * 0.3); ctx.lineTo(0, -hh * 0.6);
          ctx.lineTo(hw * 0.4, -hh * 0.3); ctx.lineTo(hw, -hh);
          ctx.lineTo(hw * 0.2, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
          // Cannons
          ctx.beginPath();
          ctx.moveTo(-hw, -hh); ctx.lineTo(-hw * 1.1, -hh * 1.3);
          ctx.moveTo(hw, -hh); ctx.lineTo(hw * 1.1, -hh * 1.3); ctx.stroke();
        } else {
          // Scorpion — body + tail
          ctx.beginPath();
          ctx.ellipse(0, 0, hw * 0.7, hh * 0.6, 0, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          // Claws
          ctx.beginPath();
          ctx.moveTo(-hw * 0.5, hh * 0.3); ctx.lineTo(-hw, hh);
          ctx.moveTo(hw * 0.5, hh * 0.3); ctx.lineTo(hw, hh); ctx.stroke();
          // Tail
          ctx.beginPath();
          ctx.moveTo(0, -hh * 0.6); ctx.quadraticCurveTo(-hw * 0.5, -hh * 1.3, 0, -hh * 1.5);
          ctx.stroke();
          ctx.beginPath(); ctx.arc(0, -hh * 1.5, 3, 0, Math.PI * 2); ctx.fill();
        }
        // Twin engines for all tiers
        ctx.fillStyle = meta.color; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.ellipse(-hw * 0.2, -hh * 0.5, 2.5, 4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(hw * 0.2, -hh * 0.5, 2.5, 4, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        // Core — evolves through tiers
        if (shapeTier <= 1) {
          // Classic capital ship
          ctx.beginPath();
          ctx.moveTo(0, hh); ctx.lineTo(-hw * 0.5, hh * 0.3);
          ctx.lineTo(-hw, 0); ctx.lineTo(-hw * 0.5, -hh * 0.5);
          ctx.lineTo(-hw * 0.3, -hh); ctx.lineTo(0, -hh * 0.7);
          ctx.lineTo(hw * 0.3, -hh); ctx.lineTo(hw * 0.5, -hh * 0.5);
          ctx.lineTo(hw, 0); ctx.lineTo(hw * 0.5, hh * 0.3);
          ctx.closePath(); ctx.fill(); ctx.stroke();
        } else if (shapeTier === 2) {
          // Ring fortress
          ctx.beginPath(); ctx.arc(0, 0, hw * 0.9, 0, Math.PI * 2); ctx.stroke();
          ctx.beginPath(); ctx.arc(0, 0, hw * 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
          // Turrets
          for (let i = 0; i < 4; i++) {
            const a = (i * Math.PI / 2) + now * 0.001;
            ctx.beginPath(); ctx.arc(Math.cos(a) * hw * 0.7, Math.sin(a) * hh * 0.7, 3, 0, Math.PI * 2); ctx.fill();
          }
        } else if (shapeTier === 3) {
          // Star destroyer shape
          ctx.beginPath();
          ctx.moveTo(0, hh * 1.1); ctx.lineTo(-hw * 0.8, -hh * 0.2);
          ctx.lineTo(-hw, -hh); ctx.lineTo(0, -hh * 0.5);
          ctx.lineTo(hw, -hh); ctx.lineTo(hw * 0.8, -hh * 0.2);
          ctx.closePath(); ctx.fill(); ctx.stroke();
          // Bridge
          ctx.fillStyle = meta.color;
          ctx.beginPath(); ctx.rect(-hw * 0.15, -hh * 0.7, hw * 0.3, hh * 0.3); ctx.fill();
        } else {
          // Eldritch eye
          ctx.beginPath();
          ctx.ellipse(0, 0, hw, hh * 0.5, 0, 0, Math.PI * 2);
          ctx.fill(); ctx.stroke();
          // Pupil
          ctx.fillStyle = meta.color; ctx.shadowBlur = 16;
          ctx.globalAlpha = 0.8 + Math.sin(now * 0.006) * 0.2;
          ctx.beginPath(); ctx.arc(0, 0, hw * 0.3, 0, Math.PI * 2); ctx.fill();
          ctx.globalAlpha = 1;
          // Tentacles
          for (let i = 0; i < 6; i++) {
            const a = (i * Math.PI / 3) + now * 0.0008;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * hw * 0.8, Math.sin(a) * hh * 0.4);
            ctx.quadraticCurveTo(
              Math.cos(a + 0.3) * hw * 1.5, Math.sin(a + 0.3) * hh,
              Math.cos(a) * hw * 1.8, Math.sin(a) * hh * 0.8
            );
            ctx.stroke();
          }
        }
        // Core glow
        ctx.fillStyle = meta.color; ctx.shadowBlur = 16;
        ctx.globalAlpha = 0.6 + Math.sin(now * 0.005) * 0.3;
        ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Engine glow for scouts
      if (e.type === 'scout') {
        ctx.fillStyle = meta.color; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.ellipse(0, -hh * 0.5, 3, 4, 0, 0, Math.PI * 2); ctx.fill();
      }

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
      if (b.piercing) {
        // Photon burst beam — taller, purple
        ctx.fillStyle = '#aa66ff';
        ctx.shadowColor = '#aa66ff';
        ctx.shadowBlur = 12;
        ctx.fillRect(b.x - 3, b.y - 12, 6, 24);
      } else if (b.weak) {
        // Rapid pulse — small yellow
        ctx.fillStyle = '#ffee00';
        ctx.shadowColor = '#ffee00';
        ctx.shadowBlur = 4;
        ctx.fillRect(b.x - 1.5, b.y - 4, 3, 8);
      } else {
        ctx.fillStyle = '#00ffcc';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 6;
        ctx.fillRect(b.x - BULLET_W / 2, b.y - BULLET_H / 2, BULLET_W, BULLET_H);
      }
    });
    ctx.shadowBlur = 0;

    // Missiles
    s.missiles.forEach(m => {
      ctx.fillStyle = '#ff6600';
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
      ctx.fill();
      // Trail
      ctx.fillStyle = 'rgba(255,102,0,0.3)';
      ctx.beginPath();
      ctx.arc(m.x - m.vx * 2, m.y - m.vy * 2, 2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Enemy bullets — varied colors
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
    const puColors: Record<PowerUpType, string> = { overcharge: '#f59e0b', shield: '#00ccff', rapidfire: '#00ff88', extralife: '#ff69b4', photonburst: '#aa66ff', rapidpulse: '#ffee00', missileswarm: '#ff6600', guardiandrone: '#00ddff' };
    const puLabels: Record<PowerUpType, string> = { overcharge: 'W', shield: 'S', rapidfire: 'R', extralife: '♥', photonburst: 'P', rapidpulse: 'Z', missileswarm: 'M', guardiandrone: 'D' };
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

      ctx.beginPath();
      ctx.moveTo(0, -p.h / 2);
      ctx.lineTo(p.w / 2, p.h / 2);
      ctx.lineTo(p.w / 4, p.h / 4);
      ctx.lineTo(0, p.h / 3);
      ctx.lineTo(-p.w / 4, p.h / 4);
      ctx.lineTo(-p.w / 2, p.h / 2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#8b5cf6';
      ctx.shadowColor = '#8b5cf6';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.ellipse(0, p.h / 3 + 4, 4, 6 + Math.sin(now * 0.01) * 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

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

      // Guardian drone orbiting player
      if (p.guardianDrone) {
        const droneAngle = now * 0.003;
        const droneX = p.x + p.w / 2 + Math.cos(droneAngle) * 40;
        const droneY = p.y + p.h / 2 + Math.sin(droneAngle) * 40;
        ctx.save();
        ctx.translate(droneX, droneY);
        ctx.fillStyle = '#00ddff';
        ctx.shadowColor = '#00ddff';
        ctx.shadowBlur = 10;
        // Small diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, 6);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        // Detection radius indicator
        ctx.strokeStyle = 'rgba(0,221,255,0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
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

  // All games are now free to play unlimited
  const startGame = () => {
    const s = stateRef.current;
    if (s.status === 'idle' || s.status === 'gameover') {
      Object.assign(s, initGame(BASE_W, BASE_H));
      s.status = 'running';
      s.waveOverlayEnd = performance.now() + WAVE_OVERLAY_TIME;
      scoreSubmittedRef.current = false;
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
    scoreSubmittedRef.current = false;
  };

  const fireButton = () => {
    const s = stateRef.current;
    if (s.status === 'running' && s.shootCooldown <= 0) {
      shootPlayer(s);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-4">
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
        <span className="text-xs font-mono text-neon-green">🎮 Free to Play</span>
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
        <Button onClick={() => { setLeaderboard(getLeaderboard()); setShowLeaderboard(!showLeaderboard); }} variant="outline" className="border-amber-500/50 text-amber-400 gap-2">
          <Trophy className="w-4 h-4" /> Leaderboard
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

      {/* Leaderboard */}
      {showLeaderboard && (
        <div className="w-full bg-black/40 backdrop-blur-sm border border-amber-500/30 rounded-xl p-4 space-y-3">
          <h3 className="text-amber-400 font-mono font-bold text-center text-lg flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" /> TOP 10 SCORES
          </h3>
          {leaderboard.length === 0 ? (
            <p className="text-muted-foreground text-center text-sm font-mono">No scores yet. Play to set a record!</p>
          ) : (
            <div className="space-y-1">
              {leaderboard.map((entry, i) => (
                <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg font-mono text-sm ${i === 0 ? 'bg-amber-500/20 border border-amber-500/40' : i < 3 ? 'bg-purple-500/10 border border-purple-500/20' : 'bg-black/20'}`}>
                  <span className={`font-bold w-8 ${i === 0 ? 'text-amber-400' : i < 3 ? 'text-purple-300' : 'text-muted-foreground'}`}>
                    #{i + 1}
                  </span>
                  <span className="text-neon-cyan flex-1">{entry.score.toLocaleString()}</span>
                  <span className="text-purple-300 mr-3">W{entry.wave}</span>
                  <span className="text-muted-foreground text-xs">{entry.date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Power-up Legend */}
      <div className="w-full flex flex-wrap justify-center gap-3 text-xs font-mono text-muted-foreground">
        <span><span className="text-amber-400">W</span> Overcharge</span>
        <span><span className="text-cyan-400">S</span> Shield</span>
        <span><span className="text-green-400">R</span> Rapid Fire</span>
        <span><span className="text-pink-300">♥</span> Extra Life</span>
      </div>

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
