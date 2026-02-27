import React, { useMemo } from 'react';
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

// Generate particle data once
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  duration: `${6 + Math.random() * 8}s`,
  delay: `${Math.random() * 6}s`,
  size: `${2 + Math.random() * 3}px`,
  color: ['hsl(330 100% 65%)', 'hsl(199 100% 60%)', 'hsl(270 80% 65%)', 'hsl(180 90% 55%)', 'hsl(45 100% 60%)'][Math.floor(Math.random() * 5)],
}));

const CyberColumnsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state, startGame, resetGame,
    moveLeft, moveRight, rotate, softDrop, hardDrop, togglePause,
  } = useCyberColumns();

  return (
    <div className="cyber-columns-container min-h-screen">
      {/* ── Galaxy Background Layers ── */}
      <div className="cc-starfield" />
      <div className="cc-nebula" />
      <div className="cc-orbit-ring" />

      {/* Floating particles */}
      <div className="cc-particles">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className="cc-particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 6px ${p.color}`,
              animationDuration: p.duration,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

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
                <Button variant="outline" size="sm" onClick={togglePause} className="border-[hsl(270_60%_50%/0.4)] text-[hsl(270_80%_75%)] hover:bg-[hsl(270_60%_50%/0.1)]">
                  {state.isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                  {state.isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button variant="outline" size="sm" onClick={resetGame} className="border-muted-foreground/30 text-muted-foreground hover:bg-[hsl(0_0%_100%/0.05)]">
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
