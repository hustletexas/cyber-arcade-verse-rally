import React from 'react';
import { Card, CARD_ICONS, SPRITE_CONFIG } from '@/types/neon-match';
import { cn } from '@/lib/utils';

interface NeonMatchCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
}

export const NeonMatchCard: React.FC<NeonMatchCardProps> = ({ card, onClick, disabled }) => {
  const iconData = CARD_ICONS[card.pairId];
  
  // Calculate background position for sprite sheet (5 cols x 6 rows)
  // For 5 columns: 0%, 25%, 50%, 75%, 100%
  // For 6 rows: 0%, 20%, 40%, 60%, 80%, 100%
  const bgPositionX = iconData.col * 25; // 100 / 4 = 25
  const bgPositionY = iconData.row * 20; // 100 / 5 = 20
  
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
            "bg-gradient-to-br from-[#0a0a0f] to-[#1a0a20] border-2 transition-all duration-300",
            !card.isMatched && "border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3),inset_0_0_10px_rgba(6,182,212,0.1)]",
            !card.isMatched && "hover:border-pink-500/70 hover:shadow-[0_0_20px_rgba(236,72,153,0.4),inset_0_0_15px_rgba(236,72,153,0.15)]",
            "animate-pulse-subtle"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* NFT Card Back Design */}
          <div className="absolute inset-2 rounded-md border border-purple-500/30 flex items-center justify-center">
            <div className="text-3xl sm:text-4xl md:text-5xl opacity-50 font-bold bg-gradient-to-br from-cyan-400 to-pink-500 bg-clip-text text-transparent">
              ?
            </div>
          </div>
          {/* Corner accents */}
          <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400/50 rounded-tl" />
          <div className="absolute top-1 right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400/50 rounded-tr" />
          <div className="absolute bottom-1 left-1 w-2 h-2 border-b-2 border-l-2 border-pink-400/50 rounded-bl" />
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b-2 border-r-2 border-pink-400/50 rounded-br" />
        </div>

        {/* Card Front (face up) - NFT Image */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-lg overflow-hidden border-2 transition-all duration-300",
            card.isMatched 
              ? "border-green-400 shadow-[0_0_25px_rgba(74,222,128,0.5),inset_0_0_15px_rgba(74,222,128,0.2)]" 
              : "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4),inset_0_0_10px_rgba(6,182,212,0.15)]"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* NFT Image from Sprite Sheet */}
          <div 
            className="absolute inset-0 rounded-md"
            style={{
              backgroundImage: `url(${SPRITE_CONFIG.imagePath})`,
              backgroundSize: '500% 600%',
              backgroundPosition: `${bgPositionX}% ${bgPositionY}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
          
          {/* Glow overlay */}
          <div className={cn(
            "absolute inset-0 pointer-events-none",
            card.isMatched 
              ? "bg-gradient-to-t from-green-500/20 to-transparent"
              : "bg-gradient-to-t from-cyan-500/10 to-transparent"
          )} />
          
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
