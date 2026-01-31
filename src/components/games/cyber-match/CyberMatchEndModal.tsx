import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Clock, Move, X, RotateCcw, Award, Gamepad2, Crown, ArrowLeft, Flame, Ticket, Sparkles } from 'lucide-react';
import { GameState, GameMode, Difficulty, DIFFICULTY_CONFIGS } from '@/types/cyber-match';
import { cn } from '@/lib/utils';

interface CyberMatchEndModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameState: GameState;
  finalScore: number;
  ticketsEarned: number;
  onPlayAgain: () => void;
  onViewLeaderboard: () => void;
  canPlayAgain: boolean;
  gameMode: GameMode | null;
  difficulty: Difficulty;
  chestEarned: boolean;
}

export const CyberMatchEndModal: React.FC<CyberMatchEndModalProps> = ({
  isOpen,
  onClose,
  gameState,
  finalScore,
  ticketsEarned,
  onPlayAgain,
  onViewLeaderboard,
  canPlayAgain,
  gameMode,
  difficulty,
  chestEarned,
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const config = DIFFICULTY_CONFIGS[difficulty];
  const isPerfect = gameState.mismatches === 0;
  const isGameOver = gameMode === 'daily' && gameState.mistakesRemaining === 0;
  const isComplete = gameState.matchedPairs === config.pairs;
  const isFreeMode = gameMode === 'free';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-[#0a0a0f] via-[#1a1a2e] to-[#16213e] border-2 border-neon-cyan/50 shadow-[0_0_50px_rgba(6,182,212,0.3)] max-w-md">
        <DialogHeader>
          <DialogTitle className={cn(
            "text-2xl sm:text-3xl font-bold text-center bg-clip-text text-transparent",
            isGameOver 
              ? "bg-gradient-to-r from-red-400 to-orange-400"
              : "bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-purple"
          )}>
            {isGameOver ? '💔 Game Over!' : isComplete ? '🎉 Victory!' : '🎮 Game Complete!'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isFreeMode ? (
              <span className="inline-flex items-center gap-1 text-green-400">
                <Gamepad2 className="w-4 h-4" /> Free Match - {config.label}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-yellow-400">
                <Crown className="w-4 h-4" /> Daily Match Run - {config.label}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Final Score */}
          <div className="text-center">
            <div className={cn(
              "text-5xl sm:text-6xl font-bold font-mono bg-clip-text text-transparent animate-pulse",
              isGameOver 
                ? "bg-gradient-to-r from-red-400 to-orange-400"
                : "bg-gradient-to-r from-neon-green to-neon-cyan"
            )}>
              {finalScore.toLocaleString()}
            </div>
            <div className="text-neon-cyan/70 text-sm mt-1">FINAL SCORE</div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-black/40 rounded-xl p-2 border border-neon-cyan/20 text-center">
              <Clock className="w-4 h-4 mx-auto mb-1 text-neon-cyan" />
              <div className="text-sm font-bold text-white font-mono">
                {formatTime(gameState.timeSeconds)}
              </div>
              <div className="text-[10px] text-neon-cyan/60">Time</div>
            </div>
            
            <div className="bg-black/40 rounded-xl p-2 border border-neon-pink/20 text-center">
              <Move className="w-4 h-4 mx-auto mb-1 text-neon-pink" />
              <div className="text-sm font-bold text-white font-mono">
                {gameState.moves}
              </div>
              <div className="text-[10px] text-neon-pink/60">Moves</div>
            </div>
            
            <div className="bg-black/40 rounded-xl p-2 border border-orange-500/20 text-center">
              <Flame className="w-4 h-4 mx-auto mb-1 text-orange-400" />
              <div className="text-sm font-bold text-white font-mono">
                {gameState.bestStreak}
              </div>
              <div className="text-[10px] text-orange-400/60">Streak</div>
            </div>

            <div className="bg-black/40 rounded-xl p-2 border border-red-500/20 text-center">
              <X className="w-4 h-4 mx-auto mb-1 text-red-400" />
              <div className="text-sm font-bold text-white font-mono">
                {gameState.mismatches}
              </div>
              <div className="text-[10px] text-red-400/60">Misses</div>
            </div>
          </div>

          {/* Rewards & Bonuses */}
          <div className="space-y-2">
            {isPerfect && isComplete && (
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg border border-yellow-500/30 animate-pulse">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="text-yellow-400 text-sm font-bold">PERFECT CLEAR!</span>
                </div>
                <span className="text-yellow-400 font-mono">+500</span>
              </div>
            )}
            
            {ticketsEarned > 0 && !isFreeMode && (
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm">Tickets Earned</span>
                </div>
                <span className="text-purple-400 font-mono font-bold">+{ticketsEarned}</span>
              </div>
            )}

            {chestEarned && (
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-lg border border-amber-500/50 animate-pulse">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 text-sm font-bold">Treasure Chest Earned!</span>
                </div>
                <span className="text-amber-400">🎁</span>
              </div>
            )}

            {gameState.bestStreak >= 3 && (
              <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/30">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-400 text-sm">Hot Streak Bonus</span>
                </div>
                <span className="text-orange-400 font-mono">+{gameState.bestStreak * 50}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={onPlayAgain}
              disabled={!canPlayAgain && !isFreeMode}
              className={cn(
                "flex-1 font-bold",
                isFreeMode 
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  : "bg-gradient-to-r from-neon-cyan to-neon-pink hover:from-cyan-600 hover:to-pink-600"
              )}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {isFreeMode ? 'Play Again' : (canPlayAgain ? 'Play Again' : 'Back')}
            </Button>
            <Button
              onClick={onViewLeaderboard}
              variant="outline"
              className="flex-1 border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/10"
            >
              {isFreeMode ? (
                <>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Menu
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 mr-2" />
                  Leaderboard
                </>
              )}
            </Button>
          </div>

          {!canPlayAgain && !isFreeMode && (
            <p className="text-center text-sm text-yellow-400/80">
              Daily limit reached or insufficient CCTR. Come back tomorrow!
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
