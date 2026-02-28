export type GameMode = 'free' | 'daily';
export type ButtonColor = 'cyan' | 'purple' | 'green' | 'red' | 'orange' | 'pink' | 'yellow' | 'blue' | 'teal' | 'magenta' | 'lime' | 'gold';

export interface SequenceButton {
  id: ButtonColor;
  index: number;
}

export const BUTTON_CONFIG: Record<ButtonColor, { hue: number; label: string }> = {
  cyan: { hue: 180, label: 'Cyan' },
  purple: { hue: 280, label: 'Purple' },
  green: { hue: 120, label: 'Green' },
  red: { hue: 0, label: 'Red' },
  orange: { hue: 30, label: 'Orange' },
  pink: { hue: 330, label: 'Pink' },
  yellow: { hue: 50, label: 'Yellow' },
  blue: { hue: 220, label: 'Blue' },
  teal: { hue: 160, label: 'Teal' },
  magenta: { hue: 300, label: 'Magenta' },
  lime: { hue: 90, label: 'Lime' },
  gold: { hue: 42, label: 'Gold' },
};

export const BUTTON_ORDER: ButtonColor[] = ['cyan', 'purple', 'lime', 'red', 'orange', 'teal', 'pink', 'blue', 'yellow', 'magenta', 'green', 'gold'];

export interface GameState {
  sequence: ButtonColor[];
  playerInput: ButtonColor[];
  currentStep: number;
  isPlayingSequence: boolean;
  isPlayerTurn: boolean;
  isFinished: boolean;
  score: number;
  level: number;
  streak: number;
  bestStreak: number;
  mistakes: number;
  maxMistakes: number | null; // null for free mode
  lastInputTime: number | null;
  comboMultiplier: number;
}

export interface DifficultyConfig {
  baseSpeed: number; // ms per button
  speedDecrement: number; // ms faster per level
  minSpeed: number; // minimum ms per button
  startingLength: number;
  maxMistakes: number | null;
}

export const DIFFICULTY_CONFIGS: Record<GameMode, DifficultyConfig> = {
  free: {
    baseSpeed: 800,
    speedDecrement: 50,
    minSpeed: 180,
    startingLength: 2,
    maxMistakes: null, // unlimited
  },
  daily: {
    baseSpeed: 700,
    speedDecrement: 60,
    minSpeed: 140,
    startingLength: 3,
    maxMistakes: 3,
  },
};

// Scoring constants
export const SCORING = {
  basePoints: 100,
  speedBonusThreshold: 1500, // ms - if input within this time
  speedBonusPoints: 50,
  comboMultiplierStep: 0.25,
  maxComboMultiplier: 3.0,
  levelCompleteBonus: 200,
  ticketsPerRun: 1,
  ticketsPerfectRun: 3,
  ticketsNewPersonalBest: 2,
};

export interface SequenceScore {
  id: string;
  user_id: string;
  score: number;
  max_sequence: number;
  mode: GameMode;
  best_streak: number;
  tickets_earned: number;
  created_at: string;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number;
  max_sequence: number;
  best_streak: number;
}

export interface PlayerStats {
  bestScore: number;
  bestSequence: number;
  bestStreak: number;
  totalRuns: number;
  perfectRuns: number;
  ticketsEarned: number;
}

export const GAME_ENTRY_FEE = 1;
export const MAX_DAILY_PLAYS = 5;
