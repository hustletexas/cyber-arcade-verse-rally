import React from 'react';
import { Card, CARD_ICONS, SPRITE_CONFIG } from '@/types/cyber-match';
import { cn } from '@/lib/utils';
import cardBackImage from '@/assets/cyber-match-card-back.png';

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
        "relative w-full aspect-[3/4] cursor-pointer",
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
        {/* Card Back (face down) - Cyber City Arcade Image */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-xl overflow-hidden",
            "border-2 transition-all duration-300",
            !card.isMatched && "border-neon-cyan/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]",
            !card.isMatched && "hover:border-neon-pink/60 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]",
            "hover:scale-105"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img 
            src={cardBackImage} 
            alt="Card Back" 
            className="w-full h-full object-cover"
          />
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
          
          {/* Electric lightning match effect */}
          {card.isMatched && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
              {/* Lightning bolts via SVG */}
              <svg className="absolute inset-0 w-full h-full animate-pulse" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M30 0 L25 35 L40 32 L20 65 L35 60 L15 100" stroke="#4ade80" strokeWidth="2" fill="none" opacity="0.9" className="animate-[lightning-flicker_0.3s_ease-in-out_infinite]" />
                <path d="M70 0 L75 30 L60 28 L80 60 L65 55 L85 100" stroke="#22d3ee" strokeWidth="1.5" fill="none" opacity="0.7" className="animate-[lightning-flicker_0.4s_ease-in-out_infinite_0.1s]" />
                <path d="M50 0 L45 20 L55 18 L40 50 L55 45 L50 100" stroke="#a78bfa" strokeWidth="1" fill="none" opacity="0.6" className="animate-[lightning-flicker_0.35s_ease-in-out_infinite_0.2s]" />
              </svg>
              {/* Electric glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-neon-green/20 via-transparent to-cyan-400/20 animate-pulse" />
              {/* Spark dots */}
              <div className="absolute top-1 left-1/4 w-1 h-1 bg-neon-green rounded-full animate-ping" />
              <div className="absolute bottom-2 right-1/4 w-1 h-1 bg-cyan-400 rounded-full animate-ping" style={{ animationDelay: '0.15s' }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
