import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';
import { 
  TriviaGameMode, 
  TriviaQuestionV2, 
  TriviaGameState, 
  TriviaUserStats,
  TriviaDailyLeaderboardEntry,
  TRIVIA_CONFIG 
} from '@/types/cyber-trivia';

const initialGameState: TriviaGameState = {
  mode: 'free_play',
  status: 'idle',
  currentQuestionIndex: 0,
  questions: [],
  score: 0,
  streak: 0,
  bestStreak: 0,
  comboMultiplier: 1.0,
  speedBonus: 0,
  correctCount: 0,
  livesRemaining: null,
  timeRemaining: 15,
  selectedAnswer: null,
  showResult: false,
  lastAnswerCorrect: null,
  usedLifelines: { fiftyFifty: false, extraTime: false, skip: false },
  eliminatedAnswers: [],
  runId: null,
};

export const useCyberTrivia = () => {
  const { primaryWallet } = useMultiWallet();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<TriviaGameState>(initialGameState);
  const [userStats, setUserStats] = useState<TriviaUserStats | null>(null);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<TriviaDailyLeaderboardEntry[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<TriviaDailyLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const answeredIdsRef = useRef<Set<string>>(new Set());

  const userId = primaryWallet?.address || `anon_${Date.now()}`;

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (gameState.status === 'playing' && !gameState.showResult) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          if (prev.timeRemaining <= 1) {
            // Time's up
            return { ...prev, timeRemaining: 0, showResult: true, lastAnswerCorrect: false };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState.status, gameState.showResult, gameState.currentQuestionIndex]);

  // Load user stats
  const loadUserStats = useCallback(async () => {
    if (!primaryWallet?.address) return;

    try {
      const { data, error } = await supabase
        .from('trivia_user_stats')
        .select('*')
        .eq('user_id', primaryWallet.address)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading stats:', error);
        return;
      }

      if (data) {
        setUserStats(data as unknown as TriviaUserStats);
      } else {
        // Create default stats
        const defaultStats: TriviaUserStats = {
          user_id: primaryWallet.address,
          accuracy: 0,
          best_streak: 0,
          total_correct: 0,
          total_questions: 0,
          total_runs: 0,
          tickets_balance: 0,
          best_daily_score: 0,
          lifeline_5050_charges: 1,
          lifeline_time_charges: 1,
          lifeline_skip_charges: 1,
        };
        setUserStats(defaultStats);
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  }, [primaryWallet?.address]);

  // Load daily leaderboard
  const loadDailyLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('trivia_daily_leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading leaderboard:', error);
        return;
      }

      const formatted: TriviaDailyLeaderboardEntry[] = (data || []).map((entry: any, idx: number) => ({
        user_id: entry.player_id || '',
        score: entry.score || 0,
        best_streak: entry.best_streak || 0,
        correct_count: entry.correct_count || 0,
        started_at: entry.started_at || '',
        rank: entry.rank || idx + 1,
      }));

      setDailyLeaderboard(formatted);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  }, []);

  // Load all-time leaderboard
  const loadAllTimeLeaderboard = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('trivia_user_stats')
        .select('user_id, best_daily_score, best_streak, total_correct')
        .order('best_daily_score', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading all-time leaderboard:', error);
        return;
      }

      const formatted: TriviaDailyLeaderboardEntry[] = (data || []).map((entry, idx) => ({
        user_id: entry.user_id,
        score: entry.best_daily_score || 0,
        best_streak: entry.best_streak || 0,
        correct_count: entry.total_correct || 0,
        started_at: '',
        rank: idx + 1,
      }));

      setAllTimeLeaderboard(formatted);
    } catch (error) {
      console.error('Error loading all-time leaderboard:', error);
    }
  }, []);

  // Subscribe to realtime trivia score updates (like CyberMatch)
  useEffect(() => {
    const channel = supabase
      .channel('trivia_leaderboard_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trivia_runs',
        },
        () => {
          loadDailyLeaderboard();
          loadAllTimeLeaderboard();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trivia_runs',
        },
        () => {
          loadDailyLeaderboard();
          loadAllTimeLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadDailyLeaderboard, loadAllTimeLeaderboard]);

  // Fetch questions
  const fetchQuestions = useCallback(async (category?: string): Promise<TriviaQuestionV2[]> => {
    try {
      let query = supabase
        .from('trivia_questions_v2')
        .select('*')
        .eq('is_active', true);

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching questions:', error);
        return [];
      }

      // Shuffle and filter out previously answered questions
      const questions = (data || []) as unknown as TriviaQuestionV2[];
      const filtered = questions.filter(q => !answeredIdsRef.current.has(q.id));
      // If we filtered too many, fall back to all questions (reset memory)
      if (filtered.length < 5 && questions.length >= 5) {
        answeredIdsRef.current.clear();
        return questions.sort(() => Math.random() - 0.5);
      }
      return filtered.sort(() => Math.random() - 0.5);
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  }, []);

  // Start game
  const startGame = useCallback(async (mode: TriviaGameMode, category?: string) => {
    setLoading(true);
    
    try {
      const questions = await fetchQuestions(category);
      
      if (questions.length === 0) {
        toast({
          title: "No Questions Available",
          description: "Please try again later or select a different category.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const config = mode === 'daily_run' ? TRIVIA_CONFIG.DAILY_RUN : TRIVIA_CONFIG.FREE_PLAY;
      const gameQuestions = mode === 'daily_run' 
        ? questions.slice(0, TRIVIA_CONFIG.DAILY_RUN.TOTAL_QUESTIONS)
        : questions;

      // Create run in database
      const { data: runData, error: runError } = await supabase
        .from('trivia_runs')
        .insert({
          user_id: userId,
          mode,
          lives_remaining: mode === 'daily_run' 
            ? TRIVIA_CONFIG.DAILY_RUN.STARTING_LIVES 
            : TRIVIA_CONFIG.FREE_PLAY.MAX_WRONG_ANSWERS,
        })
        .select()
        .single();

      if (runError) {
        console.error('Error creating run:', runError);
      }

      setGameState({
        ...initialGameState,
        mode,
        status: 'playing',
        questions: gameQuestions,
        timeRemaining: config.TIME_PER_QUESTION,
        livesRemaining: mode === 'daily_run' 
          ? TRIVIA_CONFIG.DAILY_RUN.STARTING_LIVES 
          : TRIVIA_CONFIG.FREE_PLAY.MAX_WRONG_ANSWERS,
        runId: runData?.id || null,
      });

      toast({
        title: mode === 'daily_run' ? "🎯 Daily Run Started!" : "🎮 Free Play Started!",
        description: mode === 'daily_run' 
          ? `${TRIVIA_CONFIG.DAILY_RUN.TOTAL_QUESTIONS} questions, ${TRIVIA_CONFIG.DAILY_RUN.STARTING_LIVES} lives. Good luck!`
          : `3 wrong answers and you're out! 10s per question.`,
      });
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        title: "Error",
        description: "Failed to start game. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [fetchQuestions, userId, toast]);

  // Select answer
  const selectAnswer = useCallback((index: number) => {
    if (gameState.showResult || gameState.eliminatedAnswers.includes(index)) return;
    setGameState(prev => ({ ...prev, selectedAnswer: index }));
  }, [gameState.showResult, gameState.eliminatedAnswers]);

  // Submit answer
  const submitAnswer = useCallback(async () => {
    if (gameState.selectedAnswer === null || gameState.showResult) return;

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const isCorrect = gameState.selectedAnswer === currentQuestion.correct_index;
    const config = gameState.mode === 'daily_run' ? TRIVIA_CONFIG.DAILY_RUN : TRIVIA_CONFIG.FREE_PLAY;

    // Calculate points
    let pointsEarned = 0;
    let newStreak = gameState.streak;
    let newCombo = gameState.comboMultiplier;
    let ticketsEarned = 0;

    if (isCorrect) {
      // Track this question so it won't appear again
      answeredIdsRef.current.add(currentQuestion.id);
      newStreak = gameState.streak + 1;
      newCombo = Math.min(1 + (newStreak * config.STREAK_BONUS_MULTIPLIER), 3.0);
      
      // Base points with combo
      pointsEarned = Math.round(config.BASE_POINTS * newCombo);
      
      // Speed bonus (more time left = more bonus)
      const speedBonus = Math.round((gameState.timeRemaining / config.TIME_PER_QUESTION) * config.SPEED_BONUS_MAX);
      pointsEarned += speedBonus;

      // Tickets
      ticketsEarned = TRIVIA_CONFIG.TICKETS.PER_CORRECT;
      if (newStreak === 5) ticketsEarned += TRIVIA_CONFIG.TICKETS.STREAK_MILESTONE_5;
      if (newStreak === 10) ticketsEarned += TRIVIA_CONFIG.TICKETS.STREAK_MILESTONE_10;
    } else {
      newStreak = 0;
      newCombo = 1.0;
    }

    // Save answer to database
    if (gameState.runId) {
      await supabase.from('trivia_run_answers').insert({
        run_id: gameState.runId,
        question_id: currentQuestion.id,
        selected_index: gameState.selectedAnswer,
        is_correct: isCorrect,
        time_remaining: gameState.timeRemaining,
        points_earned: pointsEarned,
      });
    }

    setGameState(prev => ({
      ...prev,
      showResult: true,
      lastAnswerCorrect: isCorrect,
      streak: newStreak,
      bestStreak: Math.max(prev.bestStreak, newStreak),
      comboMultiplier: newCombo,
      score: prev.score + pointsEarned,
      speedBonus: prev.speedBonus + (isCorrect ? Math.round((gameState.timeRemaining / config.TIME_PER_QUESTION) * config.SPEED_BONUS_MAX) : 0),
      correctCount: prev.correctCount + (isCorrect ? 1 : 0),
      livesRemaining: !isCorrect && prev.livesRemaining !== null 
        ? prev.livesRemaining - 1 
        : prev.livesRemaining,
    }));

    // Show result toast
    if (isCorrect) {
      toast({
        title: `🔥 Correct! +${pointsEarned} pts`,
        description: newStreak >= 3 ? `${newStreak}x Streak! Combo: ${newCombo.toFixed(1)}x` : undefined,
      });
    } else {
      toast({
        title: "❌ Wrong!",
        description: `Correct: ${currentQuestion.answers[currentQuestion.correct_index]}`,
        variant: "destructive",
      });
    }
  }, [gameState, toast]);

  // Next question or end game
  const nextQuestion = useCallback(async () => {
    const isLastQuestion = gameState.currentQuestionIndex >= gameState.questions.length - 1;
    const noLivesLeft = gameState.livesRemaining !== null && gameState.livesRemaining <= 0;

    if (isLastQuestion || noLivesLeft) {
      // End game
      if (gameState.runId) {
        await supabase
          .from('trivia_runs')
          .update({
            score: gameState.score,
            best_streak: gameState.bestStreak,
            correct_count: gameState.correctCount,
            total_questions: gameState.currentQuestionIndex + 1,
            combo_multiplier: gameState.comboMultiplier,
            speed_bonus: gameState.speedBonus,
            ended_at: new Date().toISOString(),
            is_active: false,
          })
          .eq('id', gameState.runId);
      }

      // Update user stats
      if (primaryWallet?.address) {
        const { data: existingStats } = await supabase
          .from('trivia_user_stats')
          .select('*')
          .eq('user_id', primaryWallet.address)
          .single();

        const newTotalQuestions = (existingStats?.total_questions || 0) + gameState.currentQuestionIndex + 1;
        const newTotalCorrect = (existingStats?.total_correct || 0) + gameState.correctCount;
        const newAccuracy = newTotalQuestions > 0 ? (newTotalCorrect / newTotalQuestions) * 100 : 0;

        await supabase
          .from('trivia_user_stats')
          .upsert({
            user_id: primaryWallet.address,
            accuracy: newAccuracy,
            best_streak: Math.max(existingStats?.best_streak || 0, gameState.bestStreak),
            total_correct: newTotalCorrect,
            total_questions: newTotalQuestions,
            total_runs: (existingStats?.total_runs || 0) + 1,
            best_daily_score: gameState.mode === 'daily_run' 
              ? Math.max(existingStats?.best_daily_score || 0, gameState.score)
              : existingStats?.best_daily_score || 0,
            updated_at: new Date().toISOString(),
          });

        loadUserStats();
      }

      setGameState(prev => ({ ...prev, status: 'finished' }));
      return;
    }

    // Move to next question
    const config = gameState.mode === 'daily_run' ? TRIVIA_CONFIG.DAILY_RUN : TRIVIA_CONFIG.FREE_PLAY;
    setGameState(prev => ({
      ...prev,
      currentQuestionIndex: prev.currentQuestionIndex + 1,
      timeRemaining: config.TIME_PER_QUESTION,
      selectedAnswer: null,
      showResult: false,
      lastAnswerCorrect: null,
      usedLifelines: { fiftyFifty: false, extraTime: false, skip: false },
      eliminatedAnswers: [],
    }));
  }, [gameState, primaryWallet?.address, loadUserStats]);

  // Use lifelines
  const useFiftyFifty = useCallback(() => {
    if (gameState.usedLifelines.fiftyFifty || !userStats || userStats.lifeline_5050_charges <= 0) return;

    const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
    const wrongAnswers = [0, 1, 2, 3].filter(i => i !== currentQuestion.correct_index);
    const toEliminate = wrongAnswers.sort(() => Math.random() - 0.5).slice(0, 2);

    setGameState(prev => ({
      ...prev,
      eliminatedAnswers: toEliminate,
      usedLifelines: { ...prev.usedLifelines, fiftyFifty: true },
    }));

    toast({ title: "🎯 50/50 Used!", description: "Two wrong answers eliminated." });
  }, [gameState, userStats, toast]);

  const useExtraTime = useCallback(() => {
    if (gameState.usedLifelines.extraTime || !userStats || userStats.lifeline_time_charges <= 0) return;

    setGameState(prev => ({
      ...prev,
      timeRemaining: prev.timeRemaining + 5,
      usedLifelines: { ...prev.usedLifelines, extraTime: true },
    }));

    toast({ title: "⏰ +5 Seconds!", description: "Extra time added." });
  }, [gameState, userStats, toast]);

  const useSkip = useCallback(() => {
    if (gameState.usedLifelines.skip || !userStats || userStats.lifeline_skip_charges <= 0) return;

    setGameState(prev => ({
      ...prev,
      usedLifelines: { ...prev.usedLifelines, skip: true },
    }));

    nextQuestion();
    toast({ title: "⏭️ Question Skipped!", description: "No penalty applied." });
  }, [gameState, userStats, nextQuestion, toast]);

  // Reset game
  const resetGame = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  return {
    gameState,
    userStats,
    dailyLeaderboard,
    allTimeLeaderboard,
    loading,
    startGame,
    selectAnswer,
    submitAnswer,
    nextQuestion,
    useFiftyFifty,
    useExtraTime,
    useSkip,
    resetGame,
    loadUserStats,
    loadDailyLeaderboard,
    loadAllTimeLeaderboard,
  };
};
