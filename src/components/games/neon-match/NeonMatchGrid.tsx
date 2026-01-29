import React from 'react';
import { Card } from '@/types/neon-match';
import { NeonMatchCard } from './NeonMatchCard';

interface NeonMatchGridProps {
  cards: Card[];
  onCardClick: (cardId: string) => void;
  isLocked: boolean;
}

export const NeonMatchGrid: React.FC<NeonMatchGridProps> = ({
  cards,
  onCardClick,
  isLocked,
}) => {
  return (
    <div className="grid grid-cols-6 gap-2 sm:gap-2.5 md:gap-3 w-full max-w-[580px] mx-auto p-3 sm:p-4">
      {cards.map((card) => (
        <NeonMatchCard
          key={card.id}
          card={card}
          onClick={() => onCardClick(card.id)}
          disabled={isLocked || card.isFlipped || card.isMatched}
        />
      ))}
    </div>
  );
};
