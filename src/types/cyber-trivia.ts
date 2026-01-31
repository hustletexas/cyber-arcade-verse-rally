// Cyber Trivia Challenge Types

export type TriviaGameMode = 'free_play' | 'daily_run';

export type CosmeticRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CosmeticType = 'avatar_frame' | 'banner' | 'card_skin' | 'button_skin' | 'victory_fx';

export interface TriviaQuestionV2 {
  id: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  answers: string[]; // Array of 4 answers
  correct_index: number; // 0-3
  is_active: boolean;
}

export interface TriviaRun {
  id: string;
  user_id: string;
  mode: TriviaGameMode;
  score: number;
  best_streak: number;
  current_streak: number;
  correct_count: number;
  total_questions: number;
  lives_remaining: number | null; // null for free_play, starts at 2 for daily_run
  combo_multiplier: number;
  speed_bonus: number;
  started_at: string;
  ended_at?: string;
  is_active: boolean;
}

export interface TriviaRunAnswer {
  id: string;
  run_id: string;
  question_id: string;
  selected_index: number | null;
  is_correct: boolean;
  time_remaining: number;
  points_earned: number;
  answered_at: string;
}

export interface TriviaUserStats {
  user_id: string;
  accuracy: number;
  best_streak: number;
  total_correct: number;
  total_questions: number;
  total_runs: number;
  tickets_balance: number;
  best_daily_score: number;
  last_login_date?: string;
  daily_spin_used_at?: string;
  lifeline_5050_charges: number;
  lifeline_time_charges: number;
  lifeline_skip_charges: number;
}

export interface TriviaCosmetic {
  id: string;
  type: CosmeticType;
  name: string;
  rarity: CosmeticRarity;
  css_theme: {
    animation?: string;
    color?: string;
    gradient?: string;
    [key: string]: string | undefined;
  };
  preview_url?: string;
  is_active: boolean;
}

export interface TriviaDailyLeaderboardEntry {
  user_id: string;
  score: number;
  best_streak: number;
  correct_count: number;
  started_at: string;
  rank: number;
}

export interface TriviaGameState {
  mode: TriviaGameMode;
  status: 'idle' | 'loading' | 'playing' | 'paused' | 'finished';
  currentQuestionIndex: number;
  questions: TriviaQuestionV2[];
  score: number;
  streak: number;
  bestStreak: number;
  comboMultiplier: number;
  speedBonus: number;
  correctCount: number;
  livesRemaining: number | null;
  timeRemaining: number;
  selectedAnswer: number | null;
  showResult: boolean;
  lastAnswerCorrect: boolean | null;
  usedLifelines: {
    fiftyFifty: boolean;
    extraTime: boolean;
    skip: boolean;
  };
  eliminatedAnswers: number[];
  runId: string | null;
}

export interface VictoryEffect {
  type: 'neon-pulse' | 'fire-burst' | 'electric-storm' | 'cyber-matrix';
  color: string;
  duration: number;
}

export const RARITY_COLORS: Record<CosmeticRarity, string> = {
  common: 'text-gray-400 border-gray-400',
  rare: 'text-blue-400 border-blue-400',
  epic: 'text-purple-400 border-purple-400',
  legendary: 'text-yellow-400 border-yellow-400'
};

export const RARITY_BG: Record<CosmeticRarity, string> = {
  common: 'bg-gray-400/10',
  rare: 'bg-blue-400/10',
  epic: 'bg-purple-400/10',
  legendary: 'bg-yellow-400/10'
};

// Scoring constants
export const TRIVIA_CONFIG = {
  FREE_PLAY: {
    TIME_PER_QUESTION: 15,
    BASE_POINTS: 100,
    STREAK_BONUS_MULTIPLIER: 0.1, // 10% per streak level
    SPEED_BONUS_MAX: 50, // max bonus for answering quickly
    COMBO_DECAY_TIME: 3, // seconds before combo starts decaying
  },
  DAILY_RUN: {
    TIME_PER_QUESTION: 20,
    TOTAL_QUESTIONS: 10,
    STARTING_LIVES: 2,
    BASE_POINTS: 150,
    STREAK_BONUS_MULTIPLIER: 0.15,
    SPEED_BONUS_MAX: 75,
  },
  TICKETS: {
    PER_CORRECT: 1,
    DAILY_RUN_COMPLETION: 5,
    STREAK_MILESTONE_5: 3,
    STREAK_MILESTONE_10: 10,
    DAILY_LOGIN: 2,
  }
};
