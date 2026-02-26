// Cyber Columns — Neon falling-column puzzle game types

export type GemType = 'energy' | 'data' | 'circuit' | 'quantum' | 'bonus';

export interface GemCell {
  type: GemType;
  id: string;
  clearing?: boolean;
}

export type BoardCell = GemCell | null;

export const COLS = 6;
export const ROWS = 13;

export const GEM_COLORS: Record<GemType, { label: string; hsl: string; emoji: string }> = {
  energy:  { label: 'Energy Core',   hsl: '199 100% 60%', emoji: '🔵' },
  data:    { label: 'Data Shard',    hsl: '330 100% 65%', emoji: '🩷' },
  circuit: { label: 'Circuit Chip',  hsl: '145 80% 50%',  emoji: '🟢' },
  quantum: { label: 'Quantum Node',  hsl: '270 80% 60%',  emoji: '🟣' },
  bonus:   { label: 'Bonus Token',   hsl: '45 100% 55%',  emoji: '🟡' },
};

export interface FallingPiece {
  gems: [GemType, GemType, GemType];
  col: number;
  row: number; // topmost gem row (can be fractional for smooth drop)
}

export interface CyberColumnsState {
  board: BoardCell[][];       // [row][col]
  currentPiece: FallingPiece | null;
  nextPiece: [GemType, GemType, GemType];
  score: number;
  level: number;
  linesCleared: number;
  chainCount: number;
  isPlaying: boolean;
  isGameOver: boolean;
  isPaused: boolean;
  dropInterval: number;       // ms between drops
}

export const SCORING = {
  BASE_CLEAR: 10,
  CHAIN_MULTIPLIER: (chain: number) => chain,
  SPEED_BONUS: (level: number) => 1 + level * 0.05,
};

export const BASE_DROP_INTERVAL = 800; // ms
export const MIN_DROP_INTERVAL = 100;
export const LEVEL_SPEED_DECREASE = 40; // ms faster per level
