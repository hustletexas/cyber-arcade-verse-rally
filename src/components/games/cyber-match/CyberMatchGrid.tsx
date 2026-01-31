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
  
  return (
    <div 
      className={cn(
        "w-full max-w-[580px] mx-auto p-3 sm:p-4 transition-transform duration-75",
        screenShake && "animate-shake"
      )}
    >
      <div 
        className="grid gap-2 sm:gap-2.5 md:gap-3"
        style={{
          gridTemplateColumns: `repeat(${config.columns}, 1fr)`,
        }}
      >
        {cards.map((card) => (
          <CyberMatchCard
            key={card.id}
            card={card}
            onClick={() => onCardClick(card.id)}
            disabled={isLocked || card.isFlipped || card.isMatched}
            size={difficulty === 'hard' ? 'sm' : 'md'}
          />
        ))}
      </div>
    </div>
  );
};
