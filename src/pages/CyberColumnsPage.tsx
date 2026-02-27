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
import { GalaxyBackground } from '@/components/games/GalaxyBackground';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Pause, Play, RotateCcw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import '@/components/games/cyber-columns/cyber-columns.css';

const CyberColumnsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state, startGame, resetGame,
    moveLeft, moveRight, rotate, softDrop, hardDrop, togglePause,
  } = useCyberColumns();

  return (
    <div className="cyber-columns-container min-h-screen">
      <GalaxyBackground />

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-2xl">
        {/* Nav */}
        <div className="mb-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-[hsl(270_80%_75%)] hover:text-[hsl(330_100%_70%)] hover:bg-[hsl(270_60%_50%/0.1)]">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Arcade
          </Button>
        </div>
        <CCCBalanceBar className="mb-4" />

        <AnimatePresence mode="wait">
          {/* Menu */}
          {!state.isPlaying && !state.isGameOver && (
            <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
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
                <CyberColumnsBoard board={state.board} currentPiece={state.currentPiece} onTapBoard={rotate} />
              </div>

              <CyberColumnsTouchControls
                onLeft={moveLeft}
                onRight={moveRight}
                onRotate={rotate}
                onSoftDrop={softDrop}
                onHardDrop={hardDrop}
              />

              <div className="flex justify-center gap-3 mt-4">
                <Button variant="outline" size="sm" onClick={togglePause} className="border-[hsl(270_60%_50%/0.4)] text-[hsl(270_80%_75%)] hover:bg-[hsl(270_60%_50%/0.1)]">
                  {state.isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                  {state.isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => { resetGame(); startGame(); }} className="border-[hsl(270_60%_50%/0.4)] text-[hsl(270_80%_75%)] hover:bg-[hsl(270_60%_50%/0.1)]">
                  <RotateCcw className="w-4 h-4 mr-1" /> Restart
                </Button>
                <Button variant="outline" size="sm" onClick={resetGame} className="border-muted-foreground/30 text-muted-foreground hover:bg-[hsl(0_0%_100%/0.05)]">
                  <Trophy className="w-4 h-4 mr-1" /> Leaderboard
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
