import React from 'react';
import { Card, CARD_ICONS } from '@/types/neon-match';
import { cn } from '@/lib/utils';

interface NeonMatchCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
}

export const NeonMatchCard: React.FC<NeonMatchCardProps> = ({ card, onClick, disabled }) => {
  const icon = CARD_ICONS[card.pairId];
  
  return (
    <div
      className={cn(
        "relative w-full aspect-square cursor-pointer perspective-1000",
        disabled && "pointer-events-none"
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          "absolute inset-0 w-full h-full transition-transform duration-300 transform-style-preserve-3d",
          (card.isFlipped || card.isMatched) && "rotate-y-180"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Card Back (face down) */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-lg flex items-center justify-center backface-hidden",
            "bg-[#0a0a0f] border-2 transition-all duration-300",
            !card.isMatched && "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3),inset_0_0_10px_rgba(6,182,212,0.1)]",
            !card.isMatched && "hover:border-pink-500/70 hover:shadow-[0_0_20px_rgba(236,72,153,0.4),inset_0_0_15px_rgba(236,72,153,0.15)]",
            "animate-pulse-subtle"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-2xl sm:text-3xl md:text-4xl opacity-30">?</div>
        </div>

        {/* Card Front (face up) */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-lg flex items-center justify-center backface-hidden",
            "bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-2 transition-all duration-300",
            card.isMatched 
              ? "border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.5),inset_0_0_15px_rgba(74,222,128,0.2)]" 
              : "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4),inset_0_0_10px_rgba(6,182,212,0.15)]"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <span className="text-3xl sm:text-4xl md:text-5xl select-none">{icon}</span>
          
          {/* Spark effect on match */}
          {card.isMatched && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-400 rounded-full animate-ping" />
              <div className="absolute top-0 left-1/4 w-1 h-1 bg-green-300 rounded-full animate-bounce delay-100" />
              <div className="absolute top-1/4 right-0 w-1 h-1 bg-green-300 rounded-full animate-bounce delay-200" />
              <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-green-300 rounded-full animate-bounce delay-300" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
