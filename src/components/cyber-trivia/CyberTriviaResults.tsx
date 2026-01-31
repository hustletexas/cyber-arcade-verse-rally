import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { TriviaGameState, TriviaUserStats, TriviaDailyLeaderboardEntry } from '@/types/cyber-trivia';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { Trophy, Flame, Target, Zap, RotateCcw, Home, Ticket, Award } from 'lucide-react';
import { motion } from 'framer-motion';

interface CyberTriviaResultsProps {
  gameState: TriviaGameState;
  dailyLeaderboard: TriviaDailyLeaderboardEntry[];
  userStats: TriviaUserStats | null;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const CyberTriviaResults: React.FC<CyberTriviaResultsProps> = ({
  gameState,
  dailyLeaderboard,
  userStats,
  onPlayAgain,
  onBackToMenu,
}) => {
  const { primaryWallet } = useMultiWallet();
  const accuracy = gameState.currentQuestionIndex > 0 
    ? Math.round((gameState.correctCount / (gameState.currentQuestionIndex + 1)) * 100)
    : 0;

  const userRank = dailyLeaderboard.findIndex(e => e.user_id === primaryWallet?.address) + 1;
  const isNewBest = userStats && gameState.bestStreak > (userStats.best_streak || 0);
  const isTopScore = userRank === 1;

  // Victory effect based on performance
  const getVictoryClass = () => {
    if (isTopScore) return 'victory-cyber-matrix';
    if (gameState.bestStreak >= 10) return 'victory-electric-storm';
    if (gameState.bestStreak >= 5) return 'victory-fire-burst';
    if (accuracy >= 80) return 'victory-neon-pulse';
    return '';
  };

  return (
    <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
      {/* Results Header */}
      <motion.div 
        className="text-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
      >
        <div className={`inline-block p-8 rounded-full ${getVictoryClass()}`}>
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">
          {gameState.mode === 'daily_run' ? 'DAILY RUN COMPLETE!' : 'RUN COMPLETE!'}
        </h1>
        {isNewBest && (
          <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/50 text-lg px-4 py-1">
            🎉 NEW BEST STREAK!
          </Badge>
        )}
      </motion.div>

      {/* Score Card */}
      <Card className={`cyber-glass p-6 ${getVictoryClass()}`}>
        <div className="text-center mb-6">
          <div className="text-5xl font-bold text-neon-cyan mb-2">{gameState.score}</div>
          <div className="text-gray-400">Total Points</div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div 
            className="text-center p-4 rounded-lg bg-black/30"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Target className="w-6 h-6 mx-auto mb-2 text-green-400" />
            <div className="text-2xl font-bold text-white">{gameState.correctCount}</div>
            <div className="text-xs text-gray-500">Correct</div>
          </motion.div>

          <motion.div 
            className="text-center p-4 rounded-lg bg-black/30"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
            <div className="text-2xl font-bold text-white">{gameState.bestStreak}</div>
            <div className="text-xs text-gray-500">Best Streak</div>
          </motion.div>

          <motion.div 
            className="text-center p-4 rounded-lg bg-black/30"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Zap className="w-6 h-6 mx-auto mb-2 text-purple-400" />
            <div className="text-2xl font-bold text-white">{accuracy}%</div>
            <div className="text-xs text-gray-500">Accuracy</div>
          </motion.div>

          <motion.div 
            className="text-center p-4 rounded-lg bg-black/30"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Award className="w-6 h-6 mx-auto mb-2 text-neon-cyan" />
            <div className="text-2xl font-bold text-white">{gameState.speedBonus}</div>
            <div className="text-xs text-gray-500">Speed Bonus</div>
          </motion.div>
        </div>
      </Card>

      {/* Tickets Earned */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="cyber-glass-pink p-4">
          <div className="flex items-center justify-center gap-3">
            <Ticket className="w-6 h-6 text-pink-400 ticket-earned" />
            <span className="text-lg font-bold text-white">
              +{gameState.correctCount + (gameState.bestStreak >= 5 ? 3 : 0) + (gameState.bestStreak >= 10 ? 10 : 0)} Tickets Earned!
            </span>
          </div>
        </Card>
      </motion.div>

      {/* Daily Leaderboard Position */}
      {gameState.mode === 'daily_run' && userRank > 0 && (
        <Card className="cyber-glass-purple p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className={`w-6 h-6 ${
                userRank === 1 ? 'text-yellow-400' :
                userRank === 2 ? 'text-gray-300' :
                userRank === 3 ? 'text-orange-400' : 'text-purple-400'
              }`} />
              <span className="text-white">Your Rank Today</span>
            </div>
            <span className="text-2xl font-bold text-purple-400">#{userRank}</span>
          </div>
          {userStats && (
            <div className="mt-2 text-sm text-gray-400 text-center">
              Your Best: {userStats.best_daily_score} pts
            </div>
          )}
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={onPlayAgain}
          className="cyber-cta-primary px-8 py-6 text-lg font-bold text-neon-cyan"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          PLAY AGAIN
        </Button>
        <Button
          onClick={onBackToMenu}
          variant="outline"
          className="border-gray-600 text-gray-300 px-8 py-6 text-lg hover:bg-gray-800"
        >
          <Home className="w-5 h-5 mr-2" />
          BACK TO MENU
        </Button>
      </div>
    </div>
  );
};
