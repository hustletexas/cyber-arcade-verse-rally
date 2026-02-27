import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw, Pause, Play } from 'lucide-react';
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
import { CyberSequencePlayerStats } from '@/components/games/cyber-sequence/CyberSequencePlayerStats';
import { GameMode, GAME_ENTRY_FEE, SCORING } from '@/types/cyber-sequence';
import { toast } from 'sonner';
import { CCCBalanceBar } from '@/components/games/CCCBalanceBar';
import { GalaxyBackground } from '@/components/games/GalaxyBackground';
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

  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { balance, deductBalance, refetch: refreshBalance } = useUserBalance();
  const cctrBalance = balance.cctr_balance;

  const {
    gameState, activeButton, isShaking, correctFlash,
    startGame, handleButtonPress, resetGame, calculateTickets,
  } = useCyberSequence(mode);

  const walletConnected = !!primaryWallet?.address;

  const handleSelectMode = useCallback(async (selectedMode: GameMode) => {
    setMode(selectedMode);
    if (selectedMode === 'daily') {
      const success = await deductBalance(GAME_ENTRY_FEE, 'cyber-sequence');
      if (!success) { toast.error('Failed to deduct entry fee'); return; }
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
          if (error) console.error('Failed to save sequence score:', error);
        });
      }
    }
  }, [gameState.isFinished, gameState.score, personalBest, phase, primaryWallet?.address, mode, gameState.level, gameState.bestStreak, gameState.mistakes]);

  const handlePlayAgain = useCallback(async () => {
    if (mode === 'daily') {
      const success = await deductBalance(GAME_ENTRY_FEE, 'cyber-sequence');
      if (!success) { toast.error('Failed to deduct entry fee.'); setPhase('menu'); resetGame(); return; }
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
    <div className="cyber-columns-container min-h-screen">
      <GalaxyBackground />

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <div className="relative z-20 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}
              className="text-neon-cyan hover:text-cyan-300 hover:bg-cyan-500/10 text-xs sm:text-sm px-2 sm:px-3">
              <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Back
            </Button>
          </div>
          <CCCBalanceBar />
        </div>

        <AnimatePresence mode="wait">
          {phase === 'menu' && (
            <motion.div key="mode-select"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              <div className="text-center py-4 sm:py-8">
                <h1 className="cyber-title font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-neon-cyan mb-2 sm:mb-4"
                  data-text="CYBER SEQUENCE">CYBER SEQUENCE</h1>
                <p className="text-sm sm:text-lg text-gray-400 max-w-xl mx-auto">
                  Watch • Remember • Repeat • Earn rewards
                </p>
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

              {/* Stats & Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <CyberSequencePlayerStats />
                <CyberSequenceLeaderboard />
              </div>
            </motion.div>
          )}

          {phase === 'playing' && (
            <motion.div key="gameplay"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}>
              <div className="text-center mb-4">
                <Badge variant="outline"
                  className={mode === 'free' ? "border-green-500/50 text-green-400" : "border-purple-500/50 text-purple-400"}>
                  {mode === 'free' ? 'FREE PLAY' : 'TOURNAMENT RUN'}
                </Badge>
              </div>

              <CyberSequenceHUD gameState={gameState} mode={mode} />
              <CyberSequenceGrid
                activeButton={activeButton} correctFlash={correctFlash}
                isPlayerTurn={gameState.isPlayerTurn} isPlayingSequence={gameState.isPlayingSequence}
                isFinished={gameState.isFinished} isShaking={isShaking}
                onButtonPress={handleButtonPress}
              />

              <div className="flex justify-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                <Button onClick={() => startGame()} variant="outline" size="sm"
                  className="border-neon-pink/50 text-neon-pink hover:bg-pink-500/10 text-xs sm:text-sm">
                  <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Start
                </Button>
                <Button onClick={() => { resetGame(); setTimeout(() => startGame(), 100); }}
                  variant="outline" size="sm"
                  className="border-neon-pink/50 text-neon-pink hover:bg-pink-500/10 text-xs sm:text-sm">
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Restart
                </Button>
                <Button onClick={handleBackToMenu} variant="outline" size="sm"
                  className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10 text-xs sm:text-sm">
                  <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Exit
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CyberSequenceEndModal
          isOpen={phase === 'finished'} gameState={gameState} mode={mode}
          ticketsEarned={ticketsEarned} isNewPersonalBest={isNewPersonalBest}
          onPlayAgain={handlePlayAgain} onBackToMenu={handleBackToMenu}
        />
      </div>
    </div>
  );
};

export default CyberSequence;
