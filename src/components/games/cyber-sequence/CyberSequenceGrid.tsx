import React from 'react';
import { CyberSequenceButton } from './CyberSequenceButton';
import { ButtonColor, BUTTON_ORDER } from '@/types/cyber-sequence';
import { cn } from '@/lib/utils';

interface CyberSequenceGridProps {
  activeButton: ButtonColor | null;
  correctFlash: ButtonColor | null;
  isPlayerTurn: boolean;
  isPlayingSequence: boolean;
  isFinished: boolean;
  isShaking: boolean;
  onButtonPress: (color: ButtonColor) => void;
}

export const CyberSequenceGrid: React.FC<CyberSequenceGridProps> = ({
  activeButton,
  correctFlash,
  isPlayerTurn,
  isPlayingSequence,
  isFinished,
  isShaking,
  onButtonPress,
}) => {
  const disabled = !isPlayerTurn || isPlayingSequence || isFinished;

  return (
    <div className={cn('sequence-glass-panel p-4', isShaking && 'sequence-shake')}>
      {/* Status indicator */}
      <div className="text-center mb-2 sm:mb-4">
        {isPlayingSequence && (
          <span className="text-cyan-400 font-medium text-sm sm:text-base sequence-watching-pulse">
            👁️ Watch the sequence...
          </span>
        )}
        {isPlayerTurn && !isFinished && (
          <span className="text-green-400 font-medium text-sm sm:text-base">
            🎮 Your turn!
          </span>
        )}
        {isFinished && (
          <span className="text-red-400 font-medium text-sm sm:text-base">
            Game Over
          </span>
        )}
      </div>

      {/* Button grid */}
      <div className="sequence-button-grid">
        {BUTTON_ORDER.map((color) => (
          <CyberSequenceButton
            key={color}
            color={color}
            isActive={activeButton === color}
            isCorrect={correctFlash === color}
            disabled={disabled}
            onPress={onButtonPress}
          />
        ))}
      </div>
    </div>
  );
};
