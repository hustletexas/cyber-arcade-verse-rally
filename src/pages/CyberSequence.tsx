import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { useCyberSequence } from '@/hooks/useCyberSequence';
import { useMultiChainWallet } from '@/hooks/useMultiChainWallet';
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
import './cyber-sequence.css';
import '@/components/games/cyber-sequence/cyber-sequence.css';

type GamePhase = 'menu' | 'playing' | 'finished';

const CyberSequence: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<GamePhase>('menu');
  const [mode, setMode] = useState<GameMode>('free');
  const [isNewPersonalBest, setIsNewPersonalBest] = useState(false);
  const [personalBest, setPersonalBest] = useState(0);
  
  // Mock leaderboard data - in production, fetch from Supabase
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, displayName: '0x7a3f...e2c1', score: 4500, max_sequence: 15, best_streak: 12 },
    { rank: 2, displayName: '0x9b2e...a4d8', score: 3800, max_sequence: 13, best_streak: 10 },
    { rank: 3, displayName: '0x5c1a...f3e9', score: 3200, max_sequence: 11, best_streak: 8 },
  ]);
  
  const { primaryWallet } = useMultiChainWallet();
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

  // Handle mode selection and game start
  const handleSelectMode = useCallback(async (selectedMode: GameMode) => {
    setMode(selectedMode);
    
    if (selectedMode === 'daily') {
      // Deduct entry fee
      const success = await deductBalance(GAME_ENTRY_FEE, 'cyber-sequence');
      if (!success) {
        toast.error('Failed to deduct entry fee');
        return;
      }
      toast.success(`${GAME_ENTRY_FEE} CCTR entry fee deducted`);
    }
    
    setPhase('playing');
    setTimeout(() => startGame(), 300);
  }, [deductBalance, startGame]);

  // Watch for game end
  useEffect(() => {
    if (gameState.isFinished && phase === 'playing') {
      // Check for personal best
      if (gameState.score > personalBest) {
        setIsNewPersonalBest(true);
        setPersonalBest(gameState.score);
      } else {
        setIsNewPersonalBest(false);
      }
      setPhase('finished');
    }
  }, [gameState.isFinished, gameState.score, personalBest, phase]);

  const handlePlayAgain = useCallback(async () => {
    if (mode === 'daily') {
      const success = await deductBalance(GAME_ENTRY_FEE, 'cyber-sequence');
      if (!success) {
        toast.error('Failed to deduct entry fee. Returning to menu.');
        setPhase('menu');
        resetGame();
        return;
      }
      toast.success(`${GAME_ENTRY_FEE} CCTR entry fee deducted`);
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
    <div className="cyber-sequence-container min-h-screen p-4 md:p-8">
      <div className="relative z-10 max-w-4xl mx-auto">
        {phase === 'menu' && (
          <>
            <CyberSequenceModeSelect
              onSelectMode={handleSelectMode}
              cctrBalance={cctrBalance}
              walletConnected={walletConnected}
            />
            
            {/* Leaderboard */}
            <div className="mt-8">
              <CyberSequenceLeaderboard entries={leaderboard} />
            </div>
          </>
        )}

        {phase === 'playing' && (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToMenu}
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit
              </Button>
              
              <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                CYBER SEQUENCE
              </h1>
              
              <Button
                variant="ghost"
                onClick={() => {
                  resetGame();
                  setTimeout(() => startGame(), 100);
                }}
                className="text-gray-400 hover:text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Restart
              </Button>
            </div>
            
            {/* HUD */}
            <CyberSequenceHUD gameState={gameState} mode={mode} />
            
            {/* Game grid */}
            <CyberSequenceGrid
              activeButton={activeButton}
              correctFlash={correctFlash}
              isPlayerTurn={gameState.isPlayerTurn}
              isPlayingSequence={gameState.isPlayingSequence}
              isFinished={gameState.isFinished}
              isShaking={isShaking}
              onButtonPress={handleButtonPress}
            />
          </>
        )}

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
