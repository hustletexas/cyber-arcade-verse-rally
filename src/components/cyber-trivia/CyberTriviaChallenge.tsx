import React, { useEffect } from 'react';
import { useCyberTrivia } from '@/hooks/useCyberTrivia';
import { CyberTriviaHome } from './CyberTriviaHome';
import { CyberTriviaGameplay } from './CyberTriviaGameplay';
import { CyberTriviaResults } from './CyberTriviaResults';
import { motion, AnimatePresence } from 'framer-motion';

import './cyber-trivia.css';

export const CyberTriviaChallenge: React.FC = () => {
  const trivia = useCyberTrivia();

  useEffect(() => {
    trivia.loadUserStats();
    trivia.loadDailyLeaderboard();
  }, []);

  return (
    <div className="cyber-trivia-container min-h-[600px]">
      {/* Animated background grid */}
      <div className="cyber-grid-bg" />
      
      <AnimatePresence mode="wait">
        {trivia.gameState.status === 'idle' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <CyberTriviaHome
              onStartFreePlay={(category, playMode) => trivia.startGame('free_play', category)}
              onStartDailyRun={() => trivia.startGame('daily_run')}
              userStats={trivia.userStats}
              dailyLeaderboard={trivia.dailyLeaderboard}
              loading={trivia.loading}
            />
          </motion.div>
        )}

        {trivia.gameState.status === 'playing' && (
          <motion.div
            key="gameplay"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <CyberTriviaGameplay
              gameState={trivia.gameState}
              userStats={trivia.userStats}
              onSelectAnswer={trivia.selectAnswer}
              onSubmitAnswer={trivia.submitAnswer}
              onNextQuestion={trivia.nextQuestion}
              onUseFiftyFifty={trivia.useFiftyFifty}
              onUseExtraTime={trivia.useExtraTime}
              onUseSkip={trivia.useSkip}
              onQuit={trivia.resetGame}
            />
          </motion.div>
        )}

        {trivia.gameState.status === 'finished' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CyberTriviaResults
              gameState={trivia.gameState}
              dailyLeaderboard={trivia.dailyLeaderboard}
              userStats={trivia.userStats}
              onPlayAgain={() => trivia.startGame(trivia.gameState.mode)}
              onBackToMenu={trivia.resetGame}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
