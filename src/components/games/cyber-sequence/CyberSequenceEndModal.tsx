import React from 'react';
import { GameState, GameMode, SCORING } from '@/types/cyber-sequence';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trophy, Flame, Target, Ticket, RotateCcw, Home } from 'lucide-react';

interface CyberSequenceEndModalProps {
  isOpen: boolean;
  gameState: GameState;
  mode: GameMode;
  ticketsEarned: number;
  isNewPersonalBest: boolean;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const CyberSequenceEndModal: React.FC<CyberSequenceEndModalProps> = ({
  isOpen,
  gameState,
  mode,
  ticketsEarned,
  isNewPersonalBest,
  onPlayAgain,
  onBackToMenu,
}) => {
  const isPerfectRun = gameState.mistakes === 0 && gameState.level > 3;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-gray-900/95 border-purple-500/30 backdrop-blur-xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">
            {isPerfectRun ? (
              <span className="text-yellow-400">🌟 Perfect Run! 🌟</span>
            ) : isNewPersonalBest ? (
              <span className="text-cyan-400">🎉 New Personal Best!</span>
            ) : (
              <span className="text-white">Game Over</span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="sequence-glass-panel p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-cyan-400" />
              <p className="text-2xl font-bold text-white">{gameState.score.toLocaleString()}</p>
              <p className="text-xs text-gray-400 uppercase">Final Score</p>
            </div>
            
            <div className="sequence-glass-panel p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-purple-400" />
              <p className="text-2xl font-bold text-white">{gameState.sequence.length}</p>
              <p className="text-xs text-gray-400 uppercase">Max Sequence</p>
            </div>
            
            <div className="sequence-glass-panel p-4 text-center">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <p className="text-2xl font-bold text-white">{gameState.bestStreak}</p>
              <p className="text-xs text-gray-400 uppercase">Best Streak</p>
            </div>
            
            <div className="sequence-glass-panel p-4 text-center">
              <Ticket className="w-6 h-6 mx-auto mb-2 text-green-400" />
              <p className="text-2xl font-bold text-white">+{ticketsEarned}</p>
              <p className="text-xs text-gray-400 uppercase">Tickets Earned</p>
            </div>
          </div>

          {/* Personal best badge */}
          {isNewPersonalBest && (
            <div className="text-center py-3 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-lg border border-cyan-500/30">
              <p className="text-cyan-400 font-bold">
                🏆 +{SCORING.ticketsNewPersonalBest} Bonus Tickets for New Record!
              </p>
            </div>
          )}

          {/* Mode info */}
          <div className="text-center text-sm text-gray-400">
            {mode === 'daily' ? (
              <p>Your score has been submitted to the leaderboard!</p>
            ) : (
              <p>Play Daily Run to compete on the leaderboard</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onBackToMenu}
              className="flex-1 border-gray-600 hover:bg-gray-800"
            >
              <Home className="w-4 h-4 mr-2" />
              Menu
            </Button>
            <Button
              onClick={onPlayAgain}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Play Again
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
