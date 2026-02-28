// ═══════════════════════════════════════════════════════
// CYBER PINBALL — Retro Synth Sound Effects (Web Audio API)
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
  volume = 0.15,
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

const noise = (ac: AudioContext, duration: number, volume = 0.06) => {
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
  hp.frequency.value = 2000;
  src.connect(hp).connect(g).connect(ac.destination);
  src.start();
  src.stop(ac.currentTime + duration);
};

export const SFX = {
  bumper() {
    const ac = getCtx();
    // Punchy synth hit — high freq sweep down
    osc(ac, 'square', 880, 0.08, 0.12, 220);
    osc(ac, 'sine', 440, 0.12, 0.1, 110);
    noise(ac, 0.05, 0.08);
  },

  flipper() {
    const ac = getCtx();
    // Quick mechanical click
    osc(ac, 'square', 1200, 0.03, 0.08, 600);
    noise(ac, 0.02, 0.04);
  },

  cannon() {
    const ac = getCtx();
    // Explosive bass blast + sweep
    osc(ac, 'sawtooth', 120, 0.3, 0.2, 30);
    osc(ac, 'square', 600, 0.15, 0.1, 80);
    noise(ac, 0.12, 0.15);
    // Bright top layer
    osc(ac, 'sine', 1400, 0.08, 0.06, 200);
  },

  slingshot() {
    const ac = getCtx();
    // Twangy spring sound
    osc(ac, 'triangle', 660, 0.1, 0.1, 330);
    osc(ac, 'square', 1320, 0.06, 0.05, 440);
  },

  drain() {
    const ac = getCtx();
    // Sad descending tone
    osc(ac, 'sawtooth', 400, 0.5, 0.12, 60);
    osc(ac, 'sine', 200, 0.6, 0.08, 40);
  },

  portal() {
    const ac = getCtx();
    // Sci-fi warp — ascending sweep
    osc(ac, 'sine', 200, 0.3, 0.1, 1600);
    osc(ac, 'triangle', 400, 0.25, 0.06, 2000);
  },

  modeActivate() {
    const ac = getCtx();
    // Epic power-up fanfare — 3-note arpeggio
    const t = ac.currentTime;
    const notes = [440, 660, 880];
    notes.forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(freq, t + i * 0.08);
      g.gain.setValueAtTime(0, t);
      g.gain.setValueAtTime(0.12, t + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.2);
      o.connect(g).connect(ac.destination);
      o.start(t + i * 0.08);
      o.stop(t + i * 0.08 + 0.2);
    });
    // Sweep underneath
    osc(ac, 'sawtooth', 220, 0.4, 0.08, 880);
  },

  multiball() {
    const ac = getCtx();
    // Intense alarm + power chord
    const t = ac.currentTime;
    [330, 440, 550, 660, 880].forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, t + i * 0.06);
      g.gain.setValueAtTime(0.1, t + i * 0.06);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.25);
      o.connect(g).connect(ac.destination);
      o.start(t + i * 0.06);
      o.stop(t + i * 0.06 + 0.25);
    });
  },

  comboBank() {
    const ac = getCtx();
    // Satisfying ding cascade
    [880, 1100, 1320, 1760].forEach((freq, i) => {
      setTimeout(() => osc(ac, 'sine', freq, 0.15, 0.1), i * 40);
    });
  },

  letterLit() {
    const ac = getCtx();
    // Quick chirp
    osc(ac, 'sine', 1200, 0.08, 0.08, 800);
  },

  cyberJackpot() {
    const ac = getCtx();
    // Big jackpot fanfare
    const t = ac.currentTime;
    [523, 659, 784, 1047].forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'square';
      o.frequency.setValueAtTime(freq, t + i * 0.1);
      g.gain.setValueAtTime(0.12, t + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.3);
      o.connect(g).connect(ac.destination);
      o.start(t + i * 0.1);
      o.stop(t + i * 0.1 + 0.3);
    });
    osc(ac, 'sawtooth', 262, 0.5, 0.08, 1047);
  },

  gameOver() {
    const ac = getCtx();
    // Descending minor arpeggio
    const t = ac.currentTime;
    [440, 370, 330, 220].forEach((freq, i) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(freq, t + i * 0.15);
      g.gain.setValueAtTime(0.1, t + i * 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.15 + 0.4);
      o.connect(g).connect(ac.destination);
      o.start(t + i * 0.15);
      o.stop(t + i * 0.15 + 0.4);
    });
  },

  orbit() {
    const ac = getCtx();
    osc(ac, 'triangle', 500, 0.12, 0.08, 1000);
  },

  magnet() {
    const ac = getCtx();
    // Electric hum
    osc(ac, 'sawtooth', 60, 0.2, 0.06, 120);
    osc(ac, 'sine', 180, 0.15, 0.05, 90);
  },

  antiGravity() {
    const ac = getCtx();
    // Reverse gravity whoosh
    osc(ac, 'sine', 100, 0.5, 0.12, 2000);
    osc(ac, 'sawtooth', 200, 0.4, 0.06, 1200);
    noise(ac, 0.2, 0.06);
  },

  skillShot() {
    const ac = getCtx();
    // Triumphant rising
    osc(ac, 'sine', 600, 0.2, 0.12, 1800);
    osc(ac, 'square', 1200, 0.15, 0.06, 2400);
  },

  railLoop() {
    const ac = getCtx();
    osc(ac, 'triangle', 700, 0.15, 0.08, 1400);
    osc(ac, 'sine', 350, 0.1, 0.05, 700);
  },
};
