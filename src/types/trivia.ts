
export interface TriviaQuestion {
  id: string;
  category: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  updated_at: string;
}

export interface TriviaSession {
  id: string;
  user_id: string;
  category: string;
  total_questions: number;
  correct_answers: number;
  total_score: number;
  speed_bonus: number;
  session_type: 'single' | 'multiplayer' | 'private';
  status: 'active' | 'completed' | 'abandoned';
  started_at: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TriviaAnswer {
  id: string;
  session_id: string;
  question_id: string;
  user_answer?: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  response_time: number;
  points_awarded: number;
  answered_at: string;
}

export interface TriviaLeaderboardEntry {
  user_id: string;
  username: string;
  wallet_address?: string;
  category: string;
  total_score: number;
  correct_answers: number;
  total_questions: number;
  accuracy_percentage: number;
  speed_bonus: number;
  completed_at: string;
  rank: number;
}

export interface TriviaUserStats {
  totalGames: number;
  totalScore: number;
  bestScore: number;
  winRate: number;
}
