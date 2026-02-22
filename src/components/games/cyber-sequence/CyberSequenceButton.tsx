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
        showRipple && 'lightning-strike',
        disabled && 'opacity-60 cursor-not-allowed'
      )}
      aria-label={`${BUTTON_CONFIG[color].label} button`}
    >
      {/* Lightning bolt overlays */}
      <div className="lightning-container">
        <div className="lightning-bolt lightning-bolt-1" />
        <div className="lightning-bolt lightning-bolt-2" />
        <div className="lightning-bolt lightning-bolt-3" />
      </div>

      {/* Particle burst effect */}
      <span className="fx">
        <span className="p"></span><span className="p"></span><span className="p"></span>
        <span className="p"></span><span className="p"></span><span className="p"></span>
        <span className="p"></span><span className="p"></span><span className="p"></span>
        <span className="p"></span>
        <span className="spark"></span><span className="spark"></span><span className="spark"></span>
      </span>

      {/* Neon glow core */}
      <div className="absolute inset-2 rounded-lg neon-core" />
      
      {/* Center highlight */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className={cn(
            'w-6 h-6 sm:w-10 sm:h-10 rounded-full transition-all duration-200 neon-center',
            isActive ? 'bg-white scale-150 shadow-[0_0_30px_rgba(255,255,255,0.8)]' : 'bg-white/80'
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
