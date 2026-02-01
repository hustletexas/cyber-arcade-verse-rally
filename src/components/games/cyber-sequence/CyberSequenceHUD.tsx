import React from 'react';
import { GameState, GameMode, SCORING } from '@/types/cyber-sequence';
import { cn } from '@/lib/utils';
import { Zap, Target, Flame, Heart, Trophy } from 'lucide-react';

interface CyberSequenceHUDProps {
  gameState: GameState;
  mode: GameMode;
}

export const CyberSequenceHUD: React.FC<CyberSequenceHUDProps> = ({
  gameState,
  mode,
}) => {
  const comboPercentage = ((gameState.comboMultiplier - 1) / (SCORING.maxComboMultiplier - 1)) * 100;
  const showStreak = gameState.streak >= 3;
  const mistakesRemaining = gameState.maxMistakes !== null 
    ? gameState.maxMistakes - gameState.mistakes 
    : null;

  return (
    <div className="sequence-glass-panel p-4 mb-4">
      <div className="sequence-hud">
        {/* Score */}
        <div className="sequence-stat">
          <div className="sequence-stat-label">Score</div>
          <div className="sequence-stat-value flex items-center gap-1">
            <Trophy className="w-4 h-4" />
            {gameState.score.toLocaleString()}
          </div>
        </div>

        {/* Level / Sequence Length */}
        <div className="sequence-stat">
          <div className="sequence-stat-label">Level</div>
          <div className="sequence-stat-value flex items-center gap-1">
            <Target className="w-4 h-4" />
            {gameState.level}
          </div>
        </div>

        {/* Streak */}
        <div className="sequence-stat">
          <div className="sequence-stat-label">Streak</div>
          <div className={cn(
            'sequence-stat-value flex items-center gap-1',
            showStreak && 'sequence-streak-fire'
          )}>
            <Flame className="w-4 h-4" />
            {gameState.streak}
          </div>
        </div>

        {/* Combo Multiplier */}
        <div className="sequence-stat">
          <div className="sequence-stat-label">Combo</div>
          <div className="sequence-stat-value flex items-center gap-1">
            <Zap className="w-4 h-4" />
            {gameState.comboMultiplier.toFixed(2)}x
          </div>
        </div>

        {/* Mistakes/Lives (only for daily mode) */}
        {mode === 'daily' && mistakesRemaining !== null && (
          <div className="sequence-stat">
            <div className="sequence-stat-label">Lives</div>
            <div className={cn(
              'sequence-stat-value flex items-center gap-1',
              mistakesRemaining <= 1 && 'text-red-400'
            )}>
              {Array.from({ length: mistakesRemaining }).map((_, i) => (
                <Heart key={i} className="w-4 h-4 fill-current text-red-500" />
              ))}
              {mistakesRemaining === 0 && <span>💀</span>}
            </div>
          </div>
        )}
      </div>

      {/* Combo meter */}
      <div className="mt-3">
        <div className="sequence-combo-meter">
          <div 
            className="sequence-combo-fill" 
            style={{ width: `${comboPercentage}%` }}
          />
        </div>
      </div>

      {/* Progress indicator */}
      <div className="sequence-progress mt-2">
        {gameState.sequence.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'sequence-progress-dot',
              idx < gameState.playerInput.length && 'sequence-progress-dot--completed',
              idx === gameState.playerInput.length && gameState.isPlayerTurn && 'sequence-progress-dot--active'
            )}
          />
        ))}
      </div>
    </div>
  );
};
