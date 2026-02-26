import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCyberColumns } from '@/hooks/useCyberColumns';
import {
  CyberColumnsBoard,
  CyberColumnsHUD,
  CyberColumnsModeSelect,
  CyberColumnsEndModal,
  CyberColumnsTouchControls,
} from '@/components/games/cyber-columns';
import { CCCBalanceBar } from '@/components/games/CCCBalanceBar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pause, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import '@/components/games/cyber-columns/cyber-columns.css';

const CyberColumnsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state, startGame, resetGame,
    moveLeft, moveRight, rotate, softDrop, hardDrop, togglePause,
  } = useCyberColumns();

  return (
    <div className="cyber-columns-container min-h-screen bg-gradient-to-br from-black via-cyan-950/30 to-blue-950/40">
      {/* Background effects */}
      <div className="cyber-grid-bg" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/8 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '2s' }} />

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-2xl">
        {/* Nav */}
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-neon-cyan hover:text-cyan-300 hover:bg-cyan-500/10">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Arcade
          </Button>
        </div>
        <CCCBalanceBar className="mb-4" />

        <AnimatePresence mode="wait">
          {/* Menu */}
          {!state.isPlaying && !state.isGameOver && (
            <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center py-6">
                <h1 className="cyber-title font-display text-4xl md:text-5xl text-neon-cyan mb-2" data-text="CYBER COLUMNS">CYBER COLUMNS</h1>
                <p className="text-muted-foreground">Drop gems • Match 3 • Chain combos</p>
              </div>
              <CyberColumnsModeSelect onStart={startGame} />
            </motion.div>
          )}

          {/* Gameplay */}
          {state.isPlaying && (
            <motion.div key="play" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <CyberColumnsHUD
                score={state.score}
                level={state.level}
                linesCleared={state.linesCleared}
                chainCount={state.chainCount}
                nextPiece={state.nextPiece}
                isPaused={state.isPaused}
              />

              <div className="flex justify-center">
                <CyberColumnsBoard board={state.board} currentPiece={state.currentPiece} />
              </div>

              <CyberColumnsTouchControls
                onLeft={moveLeft}
                onRight={moveRight}
                onRotate={rotate}
                onSoftDrop={softDrop}
                onHardDrop={hardDrop}
              />

              <div className="flex justify-center gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={togglePause} className="border-neon-cyan/40 text-neon-cyan hover:bg-cyan-500/10">
                  {state.isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                  {state.isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button variant="outline" size="sm" onClick={resetGame} className="border-muted-foreground/30 text-muted-foreground hover:bg-white/5">
                  <ArrowLeft className="w-4 h-4 mr-1" /> Quit
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* End modal */}
      <CyberColumnsEndModal
        isOpen={state.isGameOver}
        score={state.score}
        level={state.level}
        linesCleared={state.linesCleared}
        chainCount={state.chainCount}
        onPlayAgain={startGame}
        onBackToMenu={resetGame}
      />
    </div>
  );
};

export default CyberColumnsPage;
