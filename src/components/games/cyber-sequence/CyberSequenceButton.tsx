import React, { useState, useEffect } from 'react';
import { ButtonColor, BUTTON_CONFIG } from '@/types/cyber-sequence';
import { cn } from '@/lib/utils';

interface CyberSequenceButtonProps {
  color: ButtonColor;
  isActive: boolean;
  isCorrect: boolean;
  disabled: boolean;
  onPress: (color: ButtonColor) => void;
}

export const CyberSequenceButton: React.FC<CyberSequenceButtonProps> = ({
  color,
  isActive,
  isCorrect,
  disabled,
  onPress,
}) => {
  const [showRipple, setShowRipple] = useState(false);
  const [showBurst, setShowBurst] = useState(false);

  // Trigger burst on correct input
  useEffect(() => {
    if (isCorrect) {
      setShowBurst(true);
      const timer = setTimeout(() => setShowBurst(false), 550);
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  const handleClick = () => {
    if (disabled) return;
    
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 400);
    
    onPress(color);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        'sequence-button',
        `sequence-button--${color}`,
        isActive && 'sequence-button--active',
        isCorrect && 'sequence-button--correct',
        showBurst && 'burst',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
      aria-label={`${BUTTON_CONFIG[color].label} button`}
    >
      {/* Particle burst effect */}
      <span className="fx">
        <span className="p"></span><span className="p"></span><span className="p"></span>
        <span className="p"></span><span className="p"></span><span className="p"></span>
        <span className="p"></span><span className="p"></span><span className="p"></span>
        <span className="p"></span>
        <span className="spark"></span><span className="spark"></span><span className="spark"></span>
      </span>

      {/* Inner glow effect */}
      <div className="absolute inset-4 rounded-lg bg-white/10 backdrop-blur-sm" />
      
      {/* Center highlight */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={cn(
            'w-8 h-8 rounded-full transition-all duration-200',
            isActive ? 'bg-white/40 scale-150' : 'bg-white/10'
          )} 
        />
      </div>
      
      {/* Ripple effect container */}
      {showRipple && (
        <div className="sequence-button-ripple" />
      )}
    </button>
  );
};
