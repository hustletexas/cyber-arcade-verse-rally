export interface Card {
  id: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export type GameMode = 'free' | 'daily';
export type Difficulty = 'easy' | 'normal' | 'hard' | 'hardest';

export interface DifficultyConfig {
  gridSize: number;
  pairs: number;
  columns: number;
  mistakeLimit: number | null; // null for free mode (unlimited)
  label: string;
  description: string;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    gridSize: 12,
    pairs: 6,
    columns: 4,
    mistakeLimit: 8,
    label: 'Easy',
    description: '12 cards (6 pairs)',
  },
  normal: {
    gridSize: 16,
    pairs: 8,
    columns: 4,
    mistakeLimit: 6,
    label: 'Normal',
    description: '16 cards (8 pairs)',
  },
  hard: {
    gridSize: 24,
    pairs: 12,
    columns: 6,
    mistakeLimit: 5,
    label: 'Hard',
    description: '24 cards (12 pairs)',
  },
  hardest: {
    gridSize: 36,
    pairs: 18,
    columns: 6,
    mistakeLimit: 4,
    label: 'Hardest',
    description: '36 cards (18 pairs)',
  },
};

export interface GameState {
  cards: Card[];
  flippedCards: string[];
  matchedPairs: number;
  moves: number;
  mismatches: number;
  mistakesRemaining: number | null;
  timeSeconds: number;
  isPlaying: boolean;
  isFinished: boolean;
  isLocked: boolean;
  streak: number;
  bestStreak: number;
  comboMultiplier: number;
  totalScore: number;
  lastMatchTime: number | null;
}

export interface MatchScore {
  id: string;
  user_id: string;
  score: number;
  time_seconds: number;
  moves: number;
  mismatches: number;
  difficulty: Difficulty;
  best_streak: number;
  tickets_earned: number;
  created_at: string;
}

export interface DailyLimit {
  user_id: string;
  plays_today: number;
  last_play_date: string;
}

export interface LeaderboardEntry {
  rank: number;
  displayName: string;
  score: number;
  time_seconds: number;
  moves: number;
  difficulty: Difficulty;
  best_streak: number;
}

export interface PlayerStats {
  bestScore: number;
  bestStreak: number;
  totalMatches: number;
  totalRuns: number;
  perfectRuns: number;
  ticketsEarned: number;
}

// NFT card icons - using sprite sheet positions (column, row)
// The sprite sheet is 5 columns x 7 rows (35 total icons, using first 18)
export const CARD_ICONS: Record<string, { col: number; row: number; name: string }> = {
  arcade: { col: 0, row: 0, name: 'Arcade Machine' },
  controller: { col: 1, row: 0, name: 'Game Controller' },
  joystick: { col: 2, row: 0, name: 'Joystick' },
  headphones: { col: 3, row: 0, name: 'VIP Headphones' },
  trophy: { col: 4, row: 0, name: 'Winner Trophy' },
  diamond: { col: 0, row: 1, name: 'Diamond' },
  coins: { col: 1, row: 1, name: 'CCTR Coins' },
  skull: { col: 2, row: 1, name: 'Cyber Skull' },
  heart: { col: 3, row: 1, name: 'Pixel Heart' },
  lightning: { col: 4, row: 1, name: 'Lightning Bolt' },
  flame: { col: 0, row: 2, name: 'Flame' },
  rocket: { col: 1, row: 2, name: 'Rocket' },
  crown: { col: 2, row: 2, name: 'Royal Crown' },
  shield: { col: 3, row: 2, name: 'Shield' },
  portal: { col: 4, row: 2, name: 'Portal Ring' },
  cctr: { col: 0, row: 3, name: 'CCTR Token' },
  mystery: { col: 1, row: 3, name: 'Mystery Box' },
  chip: { col: 2, row: 3, name: 'Casino Chip' },
};

export const PAIR_IDS = Object.keys(CARD_ICONS);

// Sprite sheet configuration - 5 columns x 7 rows
export const SPRITE_CONFIG = {
  imagePath: '/images/nft-cards/nft-icons-grid.png',
  columns: 5,
  rows: 7,
};

// Game constants
export const GAME_ENTRY_FEE = 1;
export const MAX_DAILY_PLAYS = 5;

// Scoring constants
export const SCORING = {
  baseMatchPoints: 100,
  comboMultiplierStep: 0.25, // +25% per consecutive match
  maxComboMultiplier: 3.0,
  speedBonusThreshold: 3, // seconds - if match within 3s of last match
  speedBonusPoints: 50,
  perfectClearBonus: 500,
  ticketsPerRun: 1,
  ticketsPerfectClear: 3,
  difficultyMultiplier: {
    easy: 1.0,
    normal: 1.5,
    hard: 2.0,
    hardest: 2.5,
  },
};
