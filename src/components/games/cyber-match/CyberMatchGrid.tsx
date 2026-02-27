import React from 'react';
import { Card, Difficulty, DIFFICULTY_CONFIGS } from '@/types/cyber-match';
import { CyberMatchCard } from './CyberMatchCard';
import { cn } from '@/lib/utils';

interface CyberMatchGridProps {
  cards: Card[];
  onCardClick: (cardId: string) => void;
  isLocked: boolean;
  difficulty: Difficulty;
  screenShake?: boolean;
}

export const CyberMatchGrid: React.FC<CyberMatchGridProps> = ({
  cards,
  onCardClick,
  isLocked,
  difficulty,
  screenShake = false,
}) => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  
  // Use fewer columns on mobile for hard/hardest
  const mobileColumns = config.columns > 4 ? 4 : config.columns;
  
  return (
    <div 
      className={cn(
        "w-full px-2 py-3 sm:p-4 md:p-6 transition-transform duration-75",
        screenShake && "animate-shake"
      )}
    >
      <div 
        className={cn(
          "grid gap-2 sm:gap-3 md:gap-4 mx-auto",
          "max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px]"
        )}
        style={{
          gridTemplateColumns: `repeat(var(--grid-cols), 1fr)`,
          // @ts-ignore CSS custom properties
          '--grid-cols': mobileColumns,
        } as React.CSSProperties}
      >
        <style>{`
          @media (min-width: 640px) {
            [style*="--grid-cols"] {
              --grid-cols: ${config.columns} !important;
            }
          }
        `}</style>
        {cards.map((card) => (
          <CyberMatchCard
            key={card.id}
            card={card}
            onClick={() => onCardClick(card.id)}
            disabled={isLocked || card.isFlipped || card.isMatched}
            size="lg"
          />
        ))}
      </div>
    </div>
  );
};
