import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TriviaGameState, TriviaUserStats, TRIVIA_CONFIG } from '@/types/cyber-trivia';
import { Flame, Zap, Heart, Clock, Target, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CyberTriviaGameplayProps {
  gameState: TriviaGameState;
  userStats: TriviaUserStats | null;
  onSelectAnswer: (index: number) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  onUseFiftyFifty: () => void;
  onUseExtraTime: () => void;
  onUseSkip: () => void;
  onQuit: () => void;
}

export const CyberTriviaGameplay: React.FC<CyberTriviaGameplayProps> = ({
  gameState,
  userStats,
  onSelectAnswer,
  onSubmitAnswer,
  onNextQuestion,
  onUseFiftyFifty,
  onUseExtraTime,
  onUseSkip,
  onQuit,
}) => {
  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const config = gameState.mode === 'daily_run' ? TRIVIA_CONFIG.DAILY_RUN : TRIVIA_CONFIG.FREE_PLAY;
  const timePercent = (gameState.timeRemaining / config.TIME_PER_QUESTION) * 100;
  const isUrgent = gameState.timeRemaining <= 5;

  // Auto-submit when time runs out
  useEffect(() => {
    if (gameState.timeRemaining === 0 && !gameState.showResult) {
      onSubmitAnswer();
    }
  }, [gameState.timeRemaining, gameState.showResult, onSubmitAnswer]);

  // Auto-advance after showing result
  useEffect(() => {
    if (gameState.showResult) {
      const timer = setTimeout(onNextQuestion, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.showResult, onNextQuestion]);

  if (!currentQuestion) return null;

  const getAnswerClass = (index: number) => {
    if (gameState.eliminatedAnswers.includes(index)) {
      return 'answer-eliminated';
    }
    if (gameState.showResult) {
      if (index === currentQuestion.correct_index) {
        return 'answer-correct';
      }
      if (index === gameState.selectedAnswer && !gameState.lastAnswerCorrect) {
        return 'answer-wrong';
      }
    }
    if (gameState.selectedAnswer === index) {
      return 'border-neon-cyan bg-neon-cyan/10';
    }
    return 'hover:border-neon-cyan/50';
  };

  const difficultyColors = {
    easy: 'bg-green-500/20 text-green-400 border-green-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    hard: 'bg-red-500/20 text-red-400 border-red-500/50',
  };

  return (
    <div className="relative z-10 space-y-4 max-w-4xl mx-auto">
      {/* Top Bar - Stats & Timer */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Progress & Lives */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="border-gray-600 text-gray-300 px-3 py-1">
            Q{gameState.currentQuestionIndex + 1}
            {gameState.mode === 'daily_run' && `/${TRIVIA_CONFIG.DAILY_RUN.TOTAL_QUESTIONS}`}
          </Badge>
          
          {gameState.livesRemaining !== null && (
            <div className="flex items-center gap-1">
              {[...Array(TRIVIA_CONFIG.DAILY_RUN.STARTING_LIVES)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-5 h-5 life-heart ${
                    i >= gameState.livesRemaining! ? 'lost text-gray-600' : 'text-red-500 fill-red-500'
                  }`}
                />
              ))}
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onQuit}
            className="text-gray-500 hover:text-red-400"
          >
            <X className="w-4 h-4 mr-1" /> Quit
          </Button>
        </div>

        {/* Right: Score & Streak */}
        <div className="flex items-center gap-4">
          {/* Streak */}
          <div className="flex items-center gap-2">
            <Flame className={`w-5 h-5 ${gameState.streak > 0 ? 'flame-icon text-orange-500' : 'text-gray-600'}`} />
            <span className={`font-bold ${gameState.streak >= 5 ? 'combo-glow text-orange-400' : 'text-gray-400'}`}>
              {gameState.streak}
            </span>
          </div>

          {/* Combo */}
          {gameState.comboMultiplier > 1 && (
            <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50 combo-glow">
              <Zap className="w-3 h-3 mr-1" />
              {gameState.comboMultiplier.toFixed(1)}x
            </Badge>
          )}

          {/* Score */}
          <div className="text-right">
            <div className="text-2xl font-bold text-neon-cyan">{gameState.score}</div>
            <div className="text-xs text-gray-500">points</div>
          </div>
        </div>
      </div>

      {/* Streak Meter */}
      {gameState.streak > 0 && (
        <div className="streak-meter rounded-full overflow-hidden">
          <motion.div 
            className="streak-meter-fill"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((gameState.streak / 10) * 100, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}

      {/* Timer */}
      <Card className={`cyber-glass p-3 ${isUrgent ? 'timer-urgent border-red-500/50' : ''}`}>
        <div className="flex items-center gap-3">
          <Clock className={`w-5 h-5 ${isUrgent ? 'text-red-500' : 'text-neon-cyan'}`} />
          <Progress 
            value={timePercent} 
            className="flex-1 h-3"
          />
          <span className={`font-mono font-bold min-w-[3ch] text-right ${
            isUrgent ? 'text-red-500' : 'text-neon-cyan'
          }`}>
            {gameState.timeRemaining}s
          </span>
        </div>
      </Card>

      {/* Question Card */}
      <Card className="cyber-glass p-6">
        {/* Question Meta */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={difficultyColors[currentQuestion.difficulty as keyof typeof difficultyColors]}>
            {currentQuestion.difficulty.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
            {currentQuestion.category}
          </Badge>
        </div>

        {/* Question Text */}
        <h2 className="text-xl md:text-2xl font-bold text-white mb-6 leading-relaxed">
          {currentQuestion.question}
        </h2>

        {/* Answer Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentQuestion.answers.map((answer, index) => (
            <motion.button
              key={index}
              onClick={() => onSelectAnswer(index)}
              disabled={gameState.showResult || gameState.eliminatedAnswers.includes(index)}
              whileHover={{ scale: gameState.showResult ? 1 : 1.02 }}
              whileTap={{ scale: gameState.showResult ? 1 : 0.98 }}
              className={`cyber-answer-btn p-4 text-left rounded-lg border-2 border-gray-700 
                transition-all duration-200 ${getAnswerClass(index)}`}
            >
              <span className="font-bold text-neon-cyan mr-3">
                {String.fromCharCode(65 + index)}.
              </span>
              <span className="text-gray-200">{answer}</span>
            </motion.button>
          ))}
        </div>

        {/* Submit Button */}
        {!gameState.showResult && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={onSubmitAnswer}
              disabled={gameState.selectedAnswer === null}
              className="cyber-cta-primary px-12 py-6 text-lg font-bold text-neon-cyan"
            >
              <Target className="w-5 h-5 mr-2" />
              SUBMIT ANSWER
            </Button>
          </div>
        )}

        {/* Result Feedback */}
        <AnimatePresence>
          {gameState.showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 text-center"
            >
              {gameState.lastAnswerCorrect ? (
                <div className={`text-2xl font-bold text-green-400 ${
                  gameState.streak >= 3 ? 'victory-fire-burst inline-block px-4 py-2 rounded' : ''
                }`}>
                  🔥 CORRECT!
                </div>
              ) : (
                <div className="text-2xl font-bold text-red-400">
                  ❌ {gameState.timeRemaining === 0 ? "TIME'S UP!" : 'WRONG!'}
                </div>
              )}
              <p className="text-gray-500 text-sm mt-2">Next question in 2s...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Lifelines */}
      {!gameState.showResult && userStats && (
        <div className="flex justify-center gap-3">
          <Button
            onClick={onUseFiftyFifty}
            disabled={gameState.usedLifelines.fiftyFifty || userStats.lifeline_5050_charges <= 0}
            variant="outline"
            size="sm"
            className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
          >
            🎯 50/50 ({userStats.lifeline_5050_charges})
          </Button>
          <Button
            onClick={onUseExtraTime}
            disabled={gameState.usedLifelines.extraTime || userStats.lifeline_time_charges <= 0}
            variant="outline"
            size="sm"
            className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
          >
            ⏰ +5s ({userStats.lifeline_time_charges})
          </Button>
          <Button
            onClick={onUseSkip}
            disabled={gameState.usedLifelines.skip || userStats.lifeline_skip_charges <= 0}
            variant="outline"
            size="sm"
            className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
          >
            ⏭️ Skip ({userStats.lifeline_skip_charges})
          </Button>
        </div>
      )}
    </div>
  );
};
