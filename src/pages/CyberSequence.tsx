import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useCyberSequence } from '@/hooks/useCyberSequence';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import {
  CyberSequenceGrid,
  CyberSequenceHUD,
  CyberSequenceModeSelect,
  CyberSequenceEndModal,
  CyberSequenceLeaderboard,
} from '@/components/games/cyber-sequence';
import { GameMode, GAME_ENTRY_FEE, LeaderboardEntry, SCORING } from '@/types/cyber-sequence';
import { toast } from 'sonner';
import { CCCBalanceBar } from '@/components/games/CCCBalanceBar';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import './cyber-sequence.css';
import '@/components/games/cyber-sequence/cyber-sequence.css';

type GamePhase = 'menu' | 'playing' | 'finished';

const CyberSequence: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [mode, setMode] = useState<GameMode>('free');
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);
  
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, displayName: '0x7a3f...e2c1', score: 4500, max_sequence: 15, best_streak: 12 },
    { rank: 2, displayName: '0x9b2e...a4d8', score: 3800, max_sequence: 13, best_streak: 10 },
    { rank: 3, displayName: '0x5c1a...f3e9', score: 3200, max_sequence: 11, best_streak: 8 },
  ]);
  
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { balance, deductBalance, refetch: refreshBalance } = useUserBalance();
  const cctrBalance = balance.cctr_balance;
  
  const {
    gameState,
    activeButton,
    isShaking,
    correctFlash,
    startGame,
    handleButtonPress,
    resetGame,
    calculateTickets,
  } = useCyberSequence(mode);

  const walletConnected = !!primaryWallet?.address;

  const handleSelectMode = useCallback(async (selectedMode: GameMode) => {
    setMode(selectedMode);
    
    if (selectedMode === 'daily') {
      const success = await deductBalance(GAME_ENTRY_FEE, 'cyber-sequence');
      if (!success) {
        toast.error('Failed to deduct entry fee');
        return;
      }
      toast.success(`${GAME_ENTRY_FEE} CCC entry fee deducted`);
    }
    
    setPhase('playing');
    setTimeout(() => startGame(), 300);
  }, [deductBalance, startGame]);

  useEffect(() => {
    if (gameState.isFinished && phase === 'playing') {
      if (gameState.score > personalBest) {
        setIsNewPersonalBest(true);
        setPersonalBest(gameState.score);
      } else {
        setIsNewPersonalBest(false);
      }
      setPhase('finished');

      const walletAddr = primaryWallet?.address;
      if (walletAddr && gameState.score > 0) {
        supabase.from('sequence_scores').insert({
          user_id: walletAddr,
          score: gameState.score,
          level: gameState.level,
          best_streak: gameState.bestStreak,
          mistakes: gameState.mistakes,
          mode: mode,
        }).then(({ error }) => {
          if (error) {
            console.error('Failed to save sequence score:', error);
          } else {
            console.log('Sequence score saved:', gameState.score);
          }
        });
      }
    }
  }, [gameState.isFinished, gameState.score, personalBest, phase, primaryWallet?.address, mode, gameState.level, gameState.bestStreak, gameState.mistakes]);

  const handlePlayAgain = useCallback(async () => {
    if (mode === 'daily') {
      const success = await deductBalance(GAME_ENTRY_FEE, 'cyber-sequence');
      if (!success) {
        toast.error('Failed to deduct entry fee. Returning to menu.');
        setPhase('menu');
        resetGame();
        return;
      }
      toast.success(`${GAME_ENTRY_FEE} CCC entry fee deducted`);
    }
    
    setPhase('playing');
    resetGame();
    setTimeout(() => startGame(), 300);
  }, [mode, deductBalance, resetGame, startGame]);

  const handleBackToMenu = useCallback(() => {
    resetGame();
    setPhase('menu');
    refreshBalance();
  }, [resetGame, refreshBalance]);

  const ticketsEarned = calculateTickets() + (isNewPersonalBest ? SCORING.ticketsNewPersonalBest : 0);

  return (
    <div className="cyber-sequence-container min-h-screen">
      {/* Animated Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        {/* Navigation + CCC Balance Bar */}
        <div className="relative z-20 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-neon-cyan hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Arcade
            </Button>
          </div>
          <CCCBalanceBar />
        </div>

        <AnimatePresence mode="wait">
          {/* Menu / Mode Selection */}
          {phase === 'menu' && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <div className="text-center py-8">
                <h1
                  className="cyber-title font-display text-4xl md:text-5xl lg:text-6xl text-neon-cyan mb-4"
                  data-text="CYBER SEQUENCE"
                >
                  CYBER SEQUENCE
                </h1>
                <p className="text-lg text-gray-400 max-w-xl mx-auto">
                  Watch • Remember • Repeat • Earn rewards
                </p>

                {/* Live Activity Ticker */}
                <div className="mt-6 py-2 border-y border-neon-cyan/20 overflow-hidden">
                  <div className="activity-ticker">
                    <div className="activity-ticker-content text-sm text-neon-cyan/70">
                      🔥 Player #15 just hit a 20-sequence! • 🎁 Perfect run unlocked • 
                      🏆 New daily high score: 6,200 pts • ⚡ 89 players online now • 
                      🎮 Daily mode trending • 🔥 Player #15 just hit a 20-sequence!
                    </div>
                  </div>
                </div>
              </div>

              <CyberSequenceModeSelect
                onSelectMode={handleSelectMode}
                cctrBalance={cctrBalance}
                walletConnected={walletConnected}
              />

              {/* Leaderboard */}
              <div className="mt-8">
                <CyberSequenceLeaderboard entries={leaderboard} />
              </div>
            </motion.div>
          )}

          {/* Game In Progress */}
          {phase === 'playing' && (
            <motion.div
              key="gameplay"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {/* Game Header */}
              <div className="text-center mb-4">
                <Badge
                  variant="outline"
                  className={mode === 'free'
                    ? "border-green-500/50 text-green-400"
                    : "border-purple-500/50 text-purple-400"
                  }
                >
                  {mode === 'free' ? 'FREE PLAY' : 'DAILY RUN'}
                </Badge>
              </div>

              <CyberSequenceHUD gameState={gameState} mode={mode} />

              <CyberSequenceGrid
                activeButton={activeButton}
                correctFlash={correctFlash}
                isPlayerTurn={gameState.isPlayerTurn}
                isPlayingSequence={gameState.isPlayingSequence}
                isFinished={gameState.isFinished}
                isShaking={isShaking}
                onButtonPress={handleButtonPress}
              />

              <div className="flex justify-center gap-3 mt-6">
                <Button
                  onClick={handleBackToMenu}
                  variant="outline"
                  className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit
                </Button>
                {mode === 'free' && (
                  <Button
                    onClick={() => {
                      resetGame();
                      setTimeout(() => startGame(), 100);
                    }}
                    variant="outline"
                    className="border-neon-pink/50 text-neon-pink hover:bg-pink-500/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* End modal */}
        <CyberSequenceEndModal
          isOpen={phase === 'finished'}
          gameState={gameState}
          mode={mode}
          ticketsEarned={ticketsEarned}
          isNewPersonalBest={isNewPersonalBest}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={handleBackToMenu}
        />
      </div>
    </div>
  );
};

export default CyberSequence;
