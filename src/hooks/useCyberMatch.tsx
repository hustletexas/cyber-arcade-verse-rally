import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useWinnerChests } from '@/hooks/useWinnerChests';
import {
  Card,
  GameState,
  GameMode,
  Difficulty,
  DailyLimit,
  LeaderboardEntry,
  PlayerStats,
  PAIR_IDS,
  DIFFICULTY_CONFIGS,
  GAME_ENTRY_FEE,
  MAX_DAILY_PLAYS,
  SCORING,
} from '@/types/cyber-match';
import { toast } from '@/hooks/use-toast';

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createDeck(difficulty: Difficulty): Card[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const selectedPairs = shuffle(PAIR_IDS).slice(0, config.pairs);
  
  const cards: Card[] = [];
  selectedPairs.forEach((pairId) => {
    cards.push(
      { id: `${pairId}-1`, pairId, isFlipped: false, isMatched: false },
      { id: `${pairId}-2`, pairId, isFlipped: false, isMatched: false }
    );
  });
  return shuffle(cards);
}

function calculateScore(
  matchedPairs: number,
  timeSeconds: number,
  moves: number,
  mismatches: number,
  bestStreak: number,
  difficulty: Difficulty
): number {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const diffMultiplier = SCORING.difficultyMultiplier[difficulty];
  
  // Base score from matches
  let score = matchedPairs * SCORING.baseMatchPoints * diffMultiplier;
  
  // Streak bonus
  score += bestStreak * 50 * diffMultiplier;
  
  // Time bonus (faster = more points)
  const timeBonus = Math.max(0, 300 - timeSeconds) * 2;
  score += timeBonus;
  
  // Efficiency bonus
  const minMoves = config.pairs;
  const efficiency = Math.max(0, 1 - (moves - minMoves) / (minMoves * 2));
  score += Math.floor(efficiency * 500 * diffMultiplier);
  
  // Perfect clear bonus
  if (mismatches === 0) {
    score += SCORING.perfectClearBonus * diffMultiplier;
  }
  
  return Math.floor(score);
}

function calculateTickets(mismatches: number, difficulty: Difficulty): number {
  const diffMultiplier = SCORING.difficultyMultiplier[difficulty];
  if (mismatches === 0) {
    return Math.floor(SCORING.ticketsPerfectClear * diffMultiplier);
  }
  return Math.floor(SCORING.ticketsPerRun * diffMultiplier);
}

const initialGameState: GameState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  mismatches: 0,
  mistakesRemaining: null,
  timeSeconds: 0,
  isPlaying: false,
  isFinished: false,
  isLocked: false,
  streak: 0,
  bestStreak: 0,
  comboMultiplier: 1.0,
  totalScore: 0,
  lastMatchTime: null,
};

export function useCyberMatch() {
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const { balance, deductBalance, refetch: refetchBalance } = useUserBalance();
  const { grantChestEligibility } = useWinnerChests();
  const walletAddress = primaryWallet?.address;
  
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [dailyLimit, setDailyLimit] = useState<DailyLimit | null>(null);
  const [todayLeaderboard, setTodayLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [ticketsEarned, setTicketsEarned] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [chestEarned, setChestEarned] = useState(false);
  const [screenShake, setScreenShake] = useState(false);
  const [comboPulse, setComboPulse] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const matchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Derived state
  const canPlayDaily = dailyLimit ? dailyLimit.plays_today < MAX_DAILY_PLAYS : true;
  const playsRemaining = dailyLimit ? MAX_DAILY_PLAYS - dailyLimit.plays_today : MAX_DAILY_PLAYS;
  const hasEnoughCCTR = balance.cctr_balance >= GAME_ENTRY_FEE;
  const cctrBalance = balance.cctr_balance;
  const totalPairs = gameMode ? DIFFICULTY_CONFIGS[difficulty].pairs : 0;

  // Fetch daily limit
  const fetchDailyLimit = useCallback(async () => {
    if (!walletAddress) {
      setIsLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('daily_limits')
        .select('user_id, plays_today, last_play_date')
        .eq('user_id', walletAddress)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily limit:', error);
        setIsLoading(false);
        return;
      }

      const typedData = data as unknown as DailyLimit | null;

      if (!typedData) {
        const newLimit: DailyLimit = {
          user_id: walletAddress,
          plays_today: 0,
          last_play_date: today,
        };
        
        await supabase.from('daily_limits').insert(newLimit);
        setDailyLimit(newLimit);
      } else {
        if (typedData.last_play_date !== today) {
          const updatedLimit = { plays_today: 0, last_play_date: today };
          await supabase.from('daily_limits').update(updatedLimit).eq('user_id', walletAddress);
          setDailyLimit({ ...typedData, ...updatedLimit });
        } else {
          setDailyLimit(typedData);
        }
      }
    } catch (err) {
      console.error('Error in fetchDailyLimit:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  // Fetch leaderboards
  const fetchLeaderboards = useCallback(async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const { data: todayData } = await supabase
        .from('match_scores')
        .select('user_id, score, time_seconds, moves, created_at')
        .gte('created_at', todayStr)
        .order('score', { ascending: false })
        .order('time_seconds', { ascending: true })
        .limit(20);

      const { data: allTimeData } = await supabase
        .from('match_scores')
        .select('user_id, score, time_seconds, moves, created_at')
        .order('score', { ascending: false })
        .order('time_seconds', { ascending: true })
        .limit(20);

      const formatLeaderboard = (data: unknown[]): LeaderboardEntry[] => {
        return (data || []).map((entry: any, index) => ({
          rank: index + 1,
          displayName: `Player #${entry.user_id?.slice(0, 6) || 'Anon'}`,
          score: entry.score,
          time_seconds: entry.time_seconds,
          moves: entry.moves,
          difficulty: 'normal' as Difficulty,
          best_streak: 0,
        }));
      };

      setTodayLeaderboard(formatLeaderboard(todayData || []));
      setAllTimeLeaderboard(formatLeaderboard(allTimeData || []));
    } catch (err) {
      console.error('Error fetching leaderboards:', err);
    }
  }, []);

  // Fetch player stats
  const fetchPlayerStats = useCallback(async () => {
    if (!walletAddress) return;

    try {
      const { data } = await supabase
        .from('match_scores')
        .select('score, moves, mismatches')
        .eq('user_id', walletAddress);

      if (data && data.length > 0) {
        const stats: PlayerStats = {
          bestScore: Math.max(...data.map((d: any) => d.score)),
          bestStreak: 0, // Would need to add to DB
          totalMatches: data.reduce((sum: number, d: any) => sum + (18 - d.mismatches), 0),
          totalRuns: data.length,
          perfectRuns: data.filter((d: any) => d.mismatches === 0).length,
          ticketsEarned: data.length * SCORING.ticketsPerRun,
        };
        setPlayerStats(stats);
      }
    } catch (err) {
      console.error('Error fetching player stats:', err);
    }
  }, [walletAddress]);

  // Initialize
  useEffect(() => {
    fetchDailyLimit();
    fetchLeaderboards();
    fetchPlayerStats();
  }, [fetchDailyLimit, fetchLeaderboards, fetchPlayerStats]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    };
  }, []);

  // Start game
  const startGame = useCallback(async (mode: GameMode, diff: Difficulty) => {
    // Daily mode requires wallet
    if (mode === 'daily' && !walletAddress) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to play Daily Match Run",
        variant: "destructive",
      });
      return;
    }

    if (mode === 'daily') {
      if (!canPlayDaily) {
        toast({
          title: "Daily Limit Reached",
          description: "Come back tomorrow for more Daily Match plays!",
          variant: "destructive",
        });
        return;
      }

      // Deduct CCTR entry fee
      const result = await deductBalance(GAME_ENTRY_FEE);
      if (!result.success) {
        toast({
          title: "Insufficient Balance",
          description: result.error || `You need ${GAME_ENTRY_FEE} CCTR to play Daily Match`,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Entry Fee Paid",
        description: `${GAME_ENTRY_FEE} CCTR deducted. Good luck!`,
      });

      // Increment plays_today
      const today = new Date().toISOString().split('T')[0];
      const newPlays = (dailyLimit?.plays_today || 0) + 1;

      await supabase.from('daily_limits').upsert({
        user_id: walletAddress,
        plays_today: newPlays,
        last_play_date: today,
      });

      setDailyLimit(prev => prev ? { ...prev, plays_today: newPlays } : {
        user_id: walletAddress!,
        plays_today: newPlays,
        last_play_date: today,
      });
    }

    const config = DIFFICULTY_CONFIGS[diff];
    setGameMode(mode);
    setDifficulty(diff);

    // Reset game state
    const newCards = createDeck(diff);
    setGameState({
      cards: newCards,
      flippedCards: [],
      matchedPairs: 0,
      moves: 0,
      mismatches: 0,
      mistakesRemaining: mode === 'daily' ? config.mistakeLimit : null,
      timeSeconds: 0,
      isPlaying: true,
      isFinished: false,
      isLocked: false,
      streak: 0,
      bestStreak: 0,
      comboMultiplier: 1.0,
      totalScore: 0,
      lastMatchTime: null,
    });
    setShowEndModal(false);
    setChestEarned(false);

    // Start timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (!prev.isPlaying || prev.isFinished) {
          if (timerRef.current) clearInterval(timerRef.current);
          return prev;
        }
        return { ...prev, timeSeconds: prev.timeSeconds + 1 };
      });
    }, 1000);
  }, [walletAddress, canPlayDaily, dailyLimit, deductBalance]);

  // End game
  const endGame = useCallback(async (state: GameState, isGameOver: boolean = false) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const score = calculateScore(
      state.matchedPairs,
      state.timeSeconds,
      state.moves,
      state.mismatches,
      state.bestStreak,
      difficulty
    );
    const tickets = isGameOver ? 0 : calculateTickets(state.mismatches, difficulty);
    
    setFinalScore(score);
    setTicketsEarned(tickets);
    setChestEarned(false);

    // Only save score for daily mode
    if (gameMode === 'daily' && walletAddress && !isGameOver) {
      try {
        await supabase.from('match_scores').insert({
          user_id: walletAddress,
          score,
          time_seconds: state.timeSeconds,
          moves: state.moves,
          mismatches: state.mismatches,
        });
        
        fetchLeaderboards();
        fetchPlayerStats();

        // Grant chest for perfect game
        if (state.mismatches === 0) {
          const chestGranted = await grantChestEligibility('game', `cyber-match-${difficulty}-perfect`);
          if (chestGranted) {
            setChestEarned(true);
            toast({
              title: "🏆 PERFECT CLEAR!",
              description: "You earned a FREE Winner's Treasure Chest!",
            });
          }
        }
      } catch (err) {
        console.error('Error saving score:', err);
      }
    }

    setShowEndModal(true);
  }, [walletAddress, gameMode, difficulty, fetchLeaderboards, fetchPlayerStats, grantChestEligibility]);

  // Handle card click
  const onCardClick = useCallback((cardId: string) => {
    setGameState(prev => {
      if (prev.isLocked || !prev.isPlaying || prev.isFinished) return prev;

      const card = prev.cards.find(c => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return prev;
      if (prev.flippedCards.length >= 2) return prev;

      const newCards = prev.cards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      );
      const newFlipped = [...prev.flippedCards, cardId];

      if (newFlipped.length === 2) {
        const [firstId, secondId] = newFlipped;
        const firstCard = newCards.find(c => c.id === firstId)!;
        const secondCard = newCards.find(c => c.id === secondId)!;

        const isMatch = firstCard.pairId === secondCard.pairId;
        const newMoves = prev.moves + 1;

        if (isMatch) {
          // MATCH!
          const now = Date.now();
          const timeSinceLastMatch = prev.lastMatchTime ? (now - prev.lastMatchTime) / 1000 : 999;
          const isSpeedBonus = timeSinceLastMatch < SCORING.speedBonusThreshold;
          
          const newStreak = prev.streak + 1;
          const newBestStreak = Math.max(prev.bestStreak, newStreak);
          const newCombo = Math.min(SCORING.maxComboMultiplier, 1 + (newStreak - 1) * SCORING.comboMultiplierStep);
          
          // Calculate points for this match
          let matchPoints = Math.floor(SCORING.baseMatchPoints * newCombo * SCORING.difficultyMultiplier[difficulty]);
          if (isSpeedBonus) matchPoints += SCORING.speedBonusPoints;
          
          // Trigger combo pulse effect
          if (newStreak >= 2) {
            setComboPulse(true);
            setTimeout(() => setComboPulse(false), 300);
          }

          matchTimeoutRef.current = setTimeout(() => {
            setGameState(innerPrev => {
              const matchedCards = innerPrev.cards.map(c =>
                c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
              );
              const newMatchedPairs = innerPrev.matchedPairs + 1;
              const totalPairsCount = DIFFICULTY_CONFIGS[difficulty].pairs;
              const isFinished = newMatchedPairs === totalPairsCount;

              const newState = {
                ...innerPrev,
                cards: matchedCards,
                flippedCards: [],
                matchedPairs: newMatchedPairs,
                streak: newStreak,
                bestStreak: newBestStreak,
                comboMultiplier: newCombo,
                totalScore: innerPrev.totalScore + matchPoints,
                lastMatchTime: now,
                isFinished,
                isLocked: false,
              };

              if (isFinished) {
                endGame(newState);
              }

              return newState;
            });
          }, 200);

          return { 
            ...prev, 
            cards: newCards, 
            flippedCards: newFlipped, 
            moves: newMoves, 
            isLocked: true 
          };
        } else {
          // MISMATCH!
          const newMismatches = prev.mismatches + 1;
          const newMistakesRemaining = prev.mistakesRemaining !== null 
            ? prev.mistakesRemaining - 1 
            : null;

          // Trigger shake effect
          setScreenShake(true);
          setTimeout(() => setScreenShake(false), 300);

          // Check if game over (daily mode with mistake limit)
          if (newMistakesRemaining !== null && newMistakesRemaining <= 0) {
            matchTimeoutRef.current = setTimeout(() => {
              setGameState(innerPrev => {
                const resetCards = innerPrev.cards.map(c =>
                  c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
                );
                const finalState = {
                  ...innerPrev,
                  cards: resetCards,
                  flippedCards: [],
                  isLocked: false,
                  isFinished: true,
                  mismatches: newMismatches,
                  mistakesRemaining: 0,
                  streak: 0,
                  comboMultiplier: 1.0,
                };
                endGame(finalState, true);
                return finalState;
              });
            }, 600);

            return { 
              ...prev, 
              cards: newCards, 
              flippedCards: newFlipped, 
              moves: newMoves, 
              mismatches: newMismatches,
              mistakesRemaining: 0,
              streak: 0,
              comboMultiplier: 1.0,
              isLocked: true 
            };
          }

          matchTimeoutRef.current = setTimeout(() => {
            setGameState(innerPrev => ({
              ...innerPrev,
              cards: innerPrev.cards.map(c =>
                c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
              ),
              flippedCards: [],
              isLocked: false,
            }));
          }, 600);

          return { 
            ...prev, 
            cards: newCards, 
            flippedCards: newFlipped, 
            moves: newMoves, 
            mismatches: newMismatches,
            mistakesRemaining: newMistakesRemaining,
            streak: 0,
            comboMultiplier: 1.0,
            isLocked: true 
          };
        }
      }

      return { ...prev, cards: newCards, flippedCards: newFlipped };
    });
  }, [endGame, difficulty]);

  // Restart game
  const restartGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    setGameState(initialGameState);
    setShowEndModal(false);
    if (gameMode && difficulty) {
      startGame(gameMode, difficulty);
    }
  }, [startGame, gameMode, difficulty]);

  // Back to mode selection
  const backToModeSelect = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    setGameState(initialGameState);
    setShowEndModal(false);
    setGameMode(null);
    refetchBalance();
  }, [refetchBalance]);

  return {
    gameState,
    dailyLimit,
    canPlay: canPlayDaily,
    playsRemaining,
    isLoading,
    finalScore,
    ticketsEarned,
    showEndModal,
    setShowEndModal,
    todayLeaderboard,
    allTimeLeaderboard,
    playerStats,
    startGame,
    onCardClick,
    restartGame,
    backToModeSelect,
    isAuthenticated: isWalletConnected,
    cctrBalance,
    hasEnoughCCTR,
    entryFee: GAME_ENTRY_FEE,
    gameMode,
    difficulty,
    setDifficulty,
    totalPairs,
    chestEarned,
    screenShake,
    comboPulse,
  };
}
