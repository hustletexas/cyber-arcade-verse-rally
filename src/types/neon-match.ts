export interface Card {
  id: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameState {
  cards: Card[];
  flippedCards: string[];
  matchedPairs: number;
  moves: number;
  mismatches: number;
  timeSeconds: number;
  isPlaying: boolean;
  isFinished: boolean;
  isLocked: boolean;
}

export interface MatchScore {
  id: string;
  user_id: string;
  score: number;
  time_seconds: number;
  moves: number;
  mismatches: number;
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
}

export const CARD_ICONS: Record<string, string> = {
  arcade: '🕹️',
  controller: '🎮',
  joystick: '🕹️',
  headphones: '🎧',
  lightning: '⚡',
  trophy: '🏆',
  diamond: '💎',
  coin: '🪙',
  skull: '💀',
  heart: '❤️',
  star: '⭐',
  shield: '🛡️',
  flame: '🔥',
  rocket: '🚀',
  crown: '👑',
  chip: '🎰',
  eye: '👁️',
  portal: '🌀',
};

export const PAIR_IDS = Object.keys(CARD_ICONS);
