// Tournament system types

export type TournamentFormat = 'single_elimination' | 'double_elimination' | 'round_robin' | 'swiss';
export type TournamentStatus = 'draft' | 'published' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
export type PayoutSchema = 'winner_takes_all' | 'top_3' | 'top_5' | 'top_10' | 'custom';
export type MatchStatus = 'pending' | 'in_progress' | 'completed' | 'disputed' | 'cancelled';

export interface Tournament {
  id: string;
  title: string;
  description?: string;
  game: string;
  format: TournamentFormat;
  max_players: number;
  min_players: number;
  start_time: string;
  registration_deadline?: string;
  entry_fee_usd: number;
  entry_fee_usdc: number;
  prize_pool_usd: number;
  payout_schema: PayoutSchema;
  custom_payout_percentages?: Record<number, number>;
  requires_pass: boolean;
  required_pass_tier?: string;
  status: TournamentStatus;
  rules?: string;
  bracket_data?: BracketData;
  admin_id: string;
  created_at: string;
  updated_at: string;
}

export interface TournamentRegistration {
  id: string;
  tournament_id: string;
  user_id: string;
  wallet_address: string;
  payment_method?: string;
  payment_status: string;
  payment_transaction_id?: string;
  pass_verified: boolean;
  pass_tier?: string;
  checked_in: boolean;
  checked_in_at?: string;
  seed_number?: number;
  registered_at: string;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round_number: number;
  match_number: number;
  bracket_position?: string;
  player_a_id?: string;
  player_a_wallet?: string;
  player_b_id?: string;
  player_b_wallet?: string;
  player_a_score?: number;
  player_b_score?: number;
  winner_id?: string;
  winner_wallet?: string;
  status: MatchStatus;
  match_code?: string;
  scheduled_time?: string;
  started_at?: string;
  completed_at?: string;
  reported_by?: string;
  reported_at?: string;
  disputed: boolean;
  dispute_reason?: string;
  match_metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TournamentStanding {
  id: string;
  tournament_id: string;
  user_id: string;
  wallet_address: string;
  placement: number;
  wins: number;
  losses: number;
  points: number;
  prize_amount_usd: number;
  prize_amount_usdc: number;
  finalized: boolean;
  finalized_at?: string;
  created_at: string;
}

export interface TournamentPayout {
  id: string;
  tournament_id: string;
  user_id: string;
  wallet_address: string;
  placement: number;
  amount_usd: number;
  amount_usdc: number;
  payout_method?: string;
  status: string;
  transaction_hash?: string;
  attestation_hash?: string;
  nonce?: string;
  deadline?: string;
  paid_at?: string;
  created_at: string;
}

// Using Json type for database compatibility
export type BracketData = {
  rounds?: Array<{
    round_number: number;
    matches: Array<{
      match_id: string;
      position: string;
      player_a?: { id: string; wallet: string; name?: string };
      player_b?: { id: string; wallet: string; name?: string };
      winner?: string;
      next_match_position?: string;
    }>;
  }>;
  seeds?: number[];
} | null;

export interface BracketMatch {
  match_id: string;
  position: string;
  player_a?: { id: string; wallet: string; name?: string };
  player_b?: { id: string; wallet: string; name?: string };
  winner?: string;
  next_match_position?: string;
}

export interface CreateTournamentInput {
  title: string;
  description?: string;
  game: string;
  format: TournamentFormat;
  max_players: number;
  min_players?: number;
  start_time: string;
  registration_deadline?: string;
  entry_fee_usd?: number;
  entry_fee_usdc?: number;
  prize_pool_usd?: number;
  payout_schema: PayoutSchema;
  custom_payout_percentages?: Record<number, number>;
  requires_pass?: boolean;
  required_pass_tier?: string;
  rules?: string;
}

export const PAYOUT_PERCENTAGES: Record<PayoutSchema, Record<number, number>> = {
  winner_takes_all: { 1: 100 },
  top_3: { 1: 50, 2: 30, 3: 20 },
  top_5: { 1: 40, 2: 25, 3: 15, 4: 12, 5: 8 },
  top_10: { 1: 30, 2: 20, 3: 15, 4: 10, 5: 8, 6: 6, 7: 4, 8: 3, 9: 2, 10: 2 },
  custom: {}
};

export const GAME_OPTIONS = [
  { value: 'tetris', label: 'Tetris', icon: '🟦' },
  { value: 'pacman', label: 'Pac-Man', icon: '🟡' },
  { value: 'galaga', label: 'Galaga', icon: '🚀' },
  { value: 'trivia', label: 'Trivia', icon: '❓' },
  { value: 'custom', label: 'Custom Game', icon: '🎮' }
];

export const PASS_TIERS = [
  { value: 'bronze', label: 'Bronze', color: '#CD7F32' },
  { value: 'silver', label: 'Silver', color: '#C0C0C0' },
  { value: 'gold', label: 'Gold', color: '#FFD700' },
  { value: 'platinum', label: 'Platinum', color: '#E5E4E2' }
];
