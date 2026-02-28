// ═══════════════════════════════════════════════════════
// CYBER GALAXY — Retro Synth Sound Effects (Web Audio API)
// ═══════════════════════════════════════════════════════

let ctx: AudioContext | null = null;

const getCtx = (): AudioContext => {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
};

const osc = (
  ac: AudioContext,
  type: OscillatorType,
  freq: number,
  duration: number,
  volume = 0.12,
  freqEnd?: number,
) => {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ac.currentTime);
  if (freqEnd !== undefined) {
    o.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 20), ac.currentTime + duration);
  }
  g.gain.setValueAtTime(volume, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  o.connect(g).connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + duration);
};

const noise = (ac: AudioContext, duration: number, volume = 0.04) => {
  const bufSize = ac.sampleRate * duration;
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource();
  src.buffer = buf;
  const g = ac.createGain();
  g.gain.setValueAtTime(volume, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  const hp = ac.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 3000;
  src.connect(hp).connect(g).connect(ac.destination);
  src.start();
  src.stop(ac.currentTime + duration);
};

export const GalaxySFX = {
  /** Player laser shot */
  shoot() {
    const ac = getCtx();
    osc(ac, 'square', 900, 0.06, 0.07, 400);
  },

  /** Photon burst (piercing) shot */
  shootPhoton() {
    const ac = getCtx();
    osc(ac, 'sawtooth', 1400, 0.1, 0.08, 600);
    osc(ac, 'sine', 700, 0.08, 0.05, 300);
  },

  /** Enemy hit (not destroyed) */
  enemyHit() {
    const ac = getCtx();
    osc(ac, 'square', 600, 0.04, 0.06, 300);
    noise(ac, 0.03, 0.03);
  },

  /** Enemy destroyed */
  enemyDestroy() {
    const ac = getCtx();
    osc(ac, 'sawtooth', 300, 0.15, 0.1, 60);
    osc(ac, 'square', 800, 0.08, 0.06, 200);
    noise(ac, 0.1, 0.06);
  },

  /** Player hit / damage */
  playerHit() {
    const ac = getCtx();
    osc(ac, 'sawtooth', 200, 0.25, 0.12, 50);
    osc(ac, 'square', 100, 0.3, 0.08, 30);
    noise(ac, 0.15, 0.08);
  },

  /** Shield absorb hit */
  shieldHit() {
    const ac = getCtx();
    osc(ac, 'sine', 1200, 0.12, 0.1, 600);
    osc(ac, 'triangle', 800, 0.08, 0.06, 400);
  },

  /** Power-up collected */
  powerUp() {
    const ac = getCtx();
    const t = ac.currentTime;
    [660, 880, 1100].forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t + i * 0.06);
      g.gain.setValueAtTime(0, t);
      g.gain.setValueAtTime(0.1, t + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.15);
      o.connect(g).connect(ac.destination);
      o.start(t + i * 0.06);
      o.stop(t + i * 0.06 + 0.15);
    });
  },

  /** Extra life collected */
  extraLife() {
    const ac = getCtx();
    const t = ac.currentTime;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, t + i * 0.08);
      g.gain.setValueAtTime(0.12, t + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
      o.connect(g).connect(ac.destination);
      o.start(t + i * 0.08);
      o.stop(t + i * 0.08 + 0.2);
    });
  },

  /** Wave complete */
  waveComplete() {
    const ac = getCtx();
    const t = ac.currentTime;
    [440, 554, 659, 880].forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(freq, t + i * 0.1);
      g.gain.setValueAtTime(0.1, t + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.25);
      o.connect(g).connect(ac.destination);
      o.start(t + i * 0.1);
      o.stop(t + i * 0.1 + 0.25);
    });
    osc(ac, 'sawtooth', 220, 0.5, 0.06, 880);
  },

  /** Game over */
  gameOver() {
    const ac = getCtx();
    const t = ac.currentTime;
    [440, 370, 330, 220, 165].forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, t + i * 0.18);
      g.gain.setValueAtTime(0.1, t + i * 0.18);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.4);
      o.connect(g).connect(ac.destination);
      o.start(t + i * 0.18);
      o.stop(t + i * 0.18 + 0.4);
    });
  },

  /** Missile launch */
  missile() {
    const ac = getCtx();
    osc(ac, 'sawtooth', 150, 0.12, 0.06, 400);
    noise(ac, 0.08, 0.04);
  },

  /** Missile impact */
  missileHit() {
    const ac = getCtx();
    osc(ac, 'square', 400, 0.1, 0.08, 80);
    noise(ac, 0.08, 0.06);
  },

  /** Enemy dive warning swoosh */
  enemyDive() {
    const ac = getCtx();
    osc(ac, 'triangle', 300, 0.15, 0.04, 800);
  },
};
