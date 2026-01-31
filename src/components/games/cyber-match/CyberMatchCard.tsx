import React from 'react';
import { Card, CARD_ICONS, SPRITE_CONFIG } from '@/types/cyber-match';
import { cn } from '@/lib/utils';

interface CyberMatchCardProps {
  card: Card;
  onClick: () => void;
  disabled: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const CyberMatchCard: React.FC<CyberMatchCardProps> = ({ 
  card, 
  onClick, 
  disabled,
  size = 'md'
}) => {
  const iconData = CARD_ICONS[card.pairId];
  
  // Calculate background position for sprite sheet (5 cols x 7 rows)
  const bgPositionX = iconData.col * 25;
  const bgPositionY = iconData.row * (100 / (SPRITE_CONFIG.rows - 1));
  
  return (
    <div
      className={cn(
        "relative w-full aspect-square cursor-pointer",
        disabled && "pointer-events-none"
      )}
      onClick={onClick}
      style={{ perspective: '1000px' }}
    >
      <div
        className={cn(
          "absolute inset-0 w-full h-full transition-transform duration-500 ease-out",
          card.isMatched && "animate-match-glow"
        )}
        style={{
          transformStyle: 'preserve-3d',
          transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Card Back (face down) */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-xl flex items-center justify-center",
            "bg-gradient-to-br from-[#0a0a1a] via-[#1a0a25] to-[#0a1a2a]",
            "border-2 transition-all duration-300",
            !card.isMatched && "border-neon-cyan/40 shadow-[0_0_20px_rgba(6,182,212,0.25),inset_0_0_15px_rgba(6,182,212,0.1)]",
            !card.isMatched && "hover:border-neon-pink/60 hover:shadow-[0_0_30px_rgba(236,72,153,0.4),inset_0_0_20px_rgba(236,72,153,0.15)]",
            "hover:scale-105"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Cyber grid pattern */}
          <div 
            className="absolute inset-0 opacity-20 rounded-xl"
            style={{
              backgroundImage: `
                linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(236, 72, 153, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '8px 8px',
            }}
          />
          
          {/* Question mark */}
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-br from-neon-cyan via-neon-pink to-neon-purple bg-clip-text text-transparent animate-pulse">
            ?
          </div>
          
          {/* Corner accents */}
          <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-neon-cyan/60 rounded-tl" />
          <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-neon-cyan/60 rounded-tr" />
          <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-neon-pink/60 rounded-bl" />
          <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-neon-pink/60 rounded-br" />
        </div>

        {/* Card Front (face up) - NFT Image */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-xl overflow-hidden border-2 transition-all duration-300",
            card.isMatched 
              ? "border-neon-green shadow-[0_0_35px_rgba(74,222,128,0.6),inset_0_0_20px_rgba(74,222,128,0.25)]" 
              : "border-neon-cyan shadow-[0_0_25px_rgba(6,182,212,0.4),inset_0_0_15px_rgba(6,182,212,0.15)]"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* NFT Image from Sprite Sheet */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${SPRITE_CONFIG.imagePath})`,
              backgroundSize: `${SPRITE_CONFIG.columns * 100}% ${SPRITE_CONFIG.rows * 100}%`,
              backgroundPosition: `${bgPositionX}% ${bgPositionY}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
          
          {/* Glow overlay */}
          <div className={cn(
            "absolute inset-0 pointer-events-none transition-opacity duration-300",
            card.isMatched 
              ? "bg-gradient-to-t from-neon-green/30 via-transparent to-neon-green/10"
              : "bg-gradient-to-t from-neon-cyan/15 to-transparent"
          )} />
          
          {/* Match burst effect */}
          {card.isMatched && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-neon-green rounded-full animate-ping opacity-75" />
              <div className="absolute top-1 left-1/3 w-1.5 h-1.5 bg-neon-green/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="absolute top-1/3 right-1 w-1.5 h-1.5 bg-neon-green/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="absolute bottom-1 right-1/3 w-1.5 h-1.5 bg-neon-green/80 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
              <div className="absolute bottom-1/3 left-1 w-1.5 h-1.5 bg-neon-green/80 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
