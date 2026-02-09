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
            "absolute inset-0 w-full h-full rounded-xl overflow-hidden border-2 transition-all duration-500",
            card.isMatched 
              ? "border-neon-green shadow-[0_0_15px_rgba(74,222,128,0.5)]" 
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
          
          {/* Lightning strike effect - plays once then disappears */}
          {card.isMatched && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl animate-lightning-strike">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 140" preserveAspectRatio="none">
                <path d="M55 0 L42 45 L58 42 L30 95 L50 88 L25 140" stroke="#4ade80" strokeWidth="3" fill="none" />
                <path d="M55 0 L42 45 L58 42 L30 95 L50 88 L25 140" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8" />
              </svg>
              <div className="absolute inset-0 bg-white/30" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
