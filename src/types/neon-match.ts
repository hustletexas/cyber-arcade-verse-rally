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

// Game entry fee in CCTR
export const GAME_ENTRY_FEE = 1;
