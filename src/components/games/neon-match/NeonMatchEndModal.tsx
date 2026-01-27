import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Move, X, RotateCcw, Award } from 'lucide-react';
import { GameState } from '@/types/neon-match';

interface NeonMatchEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  finalScore: number;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  canPlayAgain: boolean;
}

export const NeonMatchEndModal: React.FC<NeonMatchEndModalProps> = ({
  isOpen,
  onClose,
  gameState,
  finalScore,
  onPlayAgain,
  onViewLeaderboard,
  canPlayAgain,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isPerfect = gameState.mismatches === 0;
  const isSpeedBonus = gameState.timeSeconds < 90;
  const isEfficiencyBonus = gameState.moves < 60;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] border-2 border-cyan-500/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            🎉 Game Complete!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Final Score */}
          <div className="text-center">
            <div className="text-5xl sm:text-6xl font-bold font-mono bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
              {finalScore.toLocaleString()}
            </div>
            <div className="text-cyan-400/70 text-sm mt-1">FINAL SCORE</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-black/40 rounded-xl p-3 border border-cyan-500/20 text-center">
              <Clock className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
              <div className="text-lg font-bold text-white font-mono">
                {formatTime(gameState.timeSeconds)}
              </div>
              <div className="text-xs text-cyan-400/60">Time</div>
            </div>
            
            <div className="bg-black/40 rounded-xl p-3 border border-pink-500/20 text-center">
              <Move className="w-5 h-5 mx-auto mb-1 text-pink-400" />
              <div className="text-lg font-bold text-white font-mono">
                {gameState.moves}
              </div>
              <div className="text-xs text-pink-400/60">Moves</div>
            </div>
            
            <div className="bg-black/40 rounded-xl p-3 border border-red-500/20 text-center">
              <X className="w-5 h-5 mx-auto mb-1 text-red-400" />
              <div className="text-lg font-bold text-white font-mono">
                {gameState.mismatches}
              </div>
              <div className="text-xs text-red-400/60">Misses</div>
            </div>
          </div>

          {/* Bonuses */}
          <div className="space-y-2">
            {isPerfect && (
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm">Perfect Run!</span>
                </div>
                <span className="text-yellow-400 font-mono">+1000</span>
              </div>
            )}
            {isSpeedBonus && (
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg border border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span className="text-cyan-400 text-sm">Speed Bonus</span>
                </div>
                <span className="text-cyan-400 font-mono">+500</span>
              </div>
            )}
            {isEfficiencyBonus && (
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/30">
                <div className="flex items-center gap-2">
                  <Move className="w-4 h-4 text-pink-400" />
                  <span className="text-pink-400 text-sm">Efficiency Bonus</span>
                </div>
                <span className="text-pink-400 font-mono">+500</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onPlayAgain}
              disabled={!canPlayAgain}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
            <Button
              onClick={onViewLeaderboard}
              variant="outline"
              className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Leaderboard
            </Button>
          </div>

          {!canPlayAgain && (
            <p className="text-center text-sm text-yellow-400/80">
              Daily limit reached. Come back tomorrow!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
