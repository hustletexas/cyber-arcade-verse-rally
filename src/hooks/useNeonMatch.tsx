import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, GameState, PAIR_IDS, MatchScore, DailyLimit, LeaderboardEntry } from '@/types/neon-match';
import { toast } from '@/hooks/use-toast';

const MAX_DAILY_PLAYS = 3;

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createDeck(): Card[] {
  const cards: Card[] = [];
  PAIR_IDS.forEach((pairId) => {
    cards.push(
      { id: `${pairId}-1`, pairId, isFlipped: false, isMatched: false },
      { id: `${pairId}-2`, pairId, isFlipped: false, isMatched: false }
    );
  });
  return shuffle(cards);
}

function calculateScore(timeSeconds: number, moves: number, mismatches: number): number {
  let score = Math.max(0, 10000 - (timeSeconds * 10) - (moves * 5));
  
  // Bonuses
  if (timeSeconds < 90) score += 500;
  if (moves < 60) score += 500;
  if (mismatches === 0) score += 1000; // Perfect run
  
  return score;
}

const initialGameState: GameState = {
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  moves: 0,
  mismatches: 0,
  timeSeconds: 0,
  isPlaying: false,
  isFinished: false,
  isLocked: false,
};

export function useNeonMatch() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [dailyLimit, setDailyLimit] = useState<DailyLimit | null>(null);
  const [todayLeaderboard, setTodayLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const matchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user can play
  const canPlay = dailyLimit ? dailyLimit.plays_today < MAX_DAILY_PLAYS : true;
  const playsRemaining = dailyLimit ? MAX_DAILY_PLAYS - dailyLimit.plays_today : MAX_DAILY_PLAYS;

  // Fetch daily limit - using raw query since table is new
  const fetchDailyLimit = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Query the daily_limits table directly
      const { data, error } = await supabase
        .rpc('check_rate_limit', { function_name_param: 'neon_match_daily', max_calls: 999, time_window_seconds: 1 })
        .then(() => 
          supabase
            .from('daily_limits')
            .select('user_id, plays_today, last_play_date')
            .eq('user_id', user.id)
            .maybeSingle()
        );

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching daily limit:', error);
        setIsLoading(false);
        return;
      }

      const typedData = data as unknown as DailyLimit | null;

      if (!typedData) {
        // Create new record
        const newLimit: DailyLimit = {
          user_id: user.id,
          plays_today: 0,
          last_play_date: today,
        };
        
        await supabase
          .from('daily_limits')
          .insert(newLimit);
        
        setDailyLimit(newLimit);
      } else {
        // Reset if new day
        if (typedData.last_play_date !== today) {
          const updatedLimit = {
            plays_today: 0,
            last_play_date: today,
          };
          
          await supabase
            .from('daily_limits')
            .update(updatedLimit)
            .eq('user_id', user.id);
          
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
  }, [user]);

  // Fetch leaderboards
  const fetchLeaderboards = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      // Today's leaderboard
      const { data: todayData } = await supabase
        .from('match_scores')
        .select('user_id, score, time_seconds, moves, created_at')
        .gte('created_at', todayStr)
        .order('score', { ascending: false })
        .order('time_seconds', { ascending: true })
        .limit(20);

      // All time leaderboard
      const { data: allTimeData } = await supabase
        .from('match_scores')
        .select('user_id, score, time_seconds, moves, created_at')
        .order('score', { ascending: false })
        .order('time_seconds', { ascending: true })
        .limit(20);

      const formatLeaderboard = (data: unknown[]): LeaderboardEntry[] => {
        return (data || []).map((entry: any, index) => ({
          rank: index + 1,
          displayName: `Player #${entry.user_id?.slice(0, 4) || 'Anon'}`,
          score: entry.score,
          time_seconds: entry.time_seconds,
          moves: entry.moves,
        }));
      };

      setTodayLeaderboard(formatLeaderboard(todayData || []));
      setAllTimeLeaderboard(formatLeaderboard(allTimeData || []));
    } catch (err) {
      console.error('Error fetching leaderboards:', err);
    }
  }, [user]);

  // Initialize
  useEffect(() => {
    fetchDailyLimit();
    fetchLeaderboards();
  }, [fetchDailyLimit, fetchLeaderboards]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    };
  }, []);

  // Start game
  const startGame = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to play",
        variant: "destructive",
      });
      return;
    }

    if (!canPlay) {
      toast({
        title: "Daily Limit Reached",
        description: "Come back tomorrow for more plays!",
        variant: "destructive",
      });
      return;
    }

    // Increment plays_today
    const today = new Date().toISOString().split('T')[0];
    const newPlays = (dailyLimit?.plays_today || 0) + 1;

    await supabase
      .from('daily_limits')
      .upsert({
        user_id: user.id,
        plays_today: newPlays,
        last_play_date: today,
      });

    setDailyLimit(prev => prev ? { ...prev, plays_today: newPlays } : {
      user_id: user.id,
      plays_today: newPlays,
      last_play_date: today,
    });

    // Reset game state
    const newCards = createDeck();
    setGameState({
      cards: newCards,
      flippedCards: [],
      matchedPairs: 0,
      moves: 0,
      mismatches: 0,
      timeSeconds: 0,
      isPlaying: true,
      isFinished: false,
      isLocked: false,
    });
    setShowEndModal(false);

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
  }, [user, canPlay, dailyLimit]);

  // End game
  const endGame = useCallback(async (state: GameState) => {
    if (timerRef.current) clearInterval(timerRef.current);

    const score = calculateScore(state.timeSeconds, state.moves, state.mismatches);
    setFinalScore(score);

    // Save score to database
    if (user) {
      try {
        await supabase
          .from('match_scores')
          .insert({
            user_id: user.id,
            score,
            time_seconds: state.timeSeconds,
            moves: state.moves,
            mismatches: state.mismatches,
          });
        
        fetchLeaderboards();
      } catch (err) {
        console.error('Error saving score:', err);
      }
    }

    setShowEndModal(true);
  }, [user, fetchLeaderboards]);

  // Handle card click
  const onCardClick = useCallback((cardId: string) => {
    setGameState(prev => {
      // Ignore if locked, not playing, or game finished
      if (prev.isLocked || !prev.isPlaying || prev.isFinished) return prev;

      const card = prev.cards.find(c => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return prev;

      // Already have 2 flipped
      if (prev.flippedCards.length >= 2) return prev;

      // Flip the card
      const newCards = prev.cards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      );
      const newFlipped = [...prev.flippedCards, cardId];

      // If this is the second card
      if (newFlipped.length === 2) {
        const [firstId, secondId] = newFlipped;
        const firstCard = newCards.find(c => c.id === firstId)!;
        const secondCard = newCards.find(c => c.id === secondId)!;

        const isMatch = firstCard.pairId === secondCard.pairId;
        const newMoves = prev.moves + 1;
        const newMismatches = isMatch ? prev.mismatches : prev.mismatches + 1;

        if (isMatch) {
          // Match found - mark as matched after short delay
          matchTimeoutRef.current = setTimeout(() => {
            setGameState(innerPrev => {
              const matchedCards = innerPrev.cards.map(c =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isMatched: true }
                  : c
              );
              const newMatchedPairs = innerPrev.matchedPairs + 1;
              const isFinished = newMatchedPairs === 18;

              const newState = {
                ...innerPrev,
                cards: matchedCards,
                flippedCards: [],
                matchedPairs: newMatchedPairs,
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
            isLocked: true,
          };
        } else {
          // No match - flip back after delay
          matchTimeoutRef.current = setTimeout(() => {
            setGameState(innerPrev => ({
              ...innerPrev,
              cards: innerPrev.cards.map(c =>
                c.id === firstId || c.id === secondId
                  ? { ...c, isFlipped: false }
                  : c
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
            isLocked: true,
          };
        }
      }

      return {
        ...prev,
        cards: newCards,
        flippedCards: newFlipped,
      };
    });
  }, [endGame]);

  // Restart game
  const restartGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (matchTimeoutRef.current) clearTimeout(matchTimeoutRef.current);
    setGameState(initialGameState);
    setShowEndModal(false);
    startGame();
  }, [startGame]);

  return {
    gameState,
    dailyLimit,
    canPlay,
    playsRemaining,
    isLoading,
    finalScore,
    showEndModal,
    setShowEndModal,
    todayLeaderboard,
    allTimeLeaderboard,
    startGame,
    onCardClick,
    restartGame,
    isAuthenticated: !!user,
  };
}
