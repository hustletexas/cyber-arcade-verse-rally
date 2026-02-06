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
        "w-full p-4 sm:p-6 transition-transform duration-75",
        screenShake && "animate-shake"
      )}
    >
      <div 
        className="grid gap-3 sm:gap-4 md:gap-5"
        style={{
          gridTemplateColumns: `repeat(${config.columns}, minmax(100px, 160px))`,
          justifyContent: 'center',
        }}
      >
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
