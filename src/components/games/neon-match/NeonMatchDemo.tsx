import React, { useEffect, useState } from 'react';
import { CARD_ICONS, SPRITE_CONFIG } from '@/types/neon-match';
import { cn } from '@/lib/utils';

interface DemoCard {
  id: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const DEMO_PAIRS = ['arcade', 'controller', 'trophy', 'diamond'];

export const NeonMatchDemo: React.FC = () => {
  const [cards, setCards] = useState<DemoCard[]>([]);
  const [animationStep, setAnimationStep] = useState(0);

  // Initialize demo cards
  useEffect(() => {
    const demoCards: DemoCard[] = DEMO_PAIRS.flatMap((pairId, index) => [
      { id: `${pairId}-1`, pairId, isFlipped: false, isMatched: false },
      { id: `${pairId}-2`, pairId, isFlipped: false, isMatched: false },
    ]);
    // Shuffle for display
    const shuffled = [...demoCards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  // Demo animation sequence
  useEffect(() => {
    if (cards.length === 0) return;

    const sequence = [
      // Step 1: Flip first card
      () => {
        setCards(prev => prev.map((c, i) => i === 0 ? { ...c, isFlipped: true } : c));
      },
      // Step 2: Flip second card (match)
      () => {
        const firstCard = cards[0];
        const matchIndex = cards.findIndex((c, i) => i !== 0 && c.pairId === firstCard.pairId);
        setCards(prev => prev.map((c, i) => i === matchIndex ? { ...c, isFlipped: true } : c));
      },
      // Step 3: Show match
      () => {
        const firstCard = cards[0];
        setCards(prev => prev.map(c => 
          c.pairId === firstCard.pairId ? { ...c, isMatched: true } : c
        ));
      },
      // Step 4: Flip third card
      () => {
        const unmatchedIndex = cards.findIndex(c => !c.isFlipped);
        if (unmatchedIndex !== -1) {
          setCards(prev => prev.map((c, i) => i === unmatchedIndex ? { ...c, isFlipped: true } : c));
        }
      },
      // Step 5: Flip non-matching fourth card
      () => {
        const thirdCard = cards.find((c, i) => c.isFlipped && !c.isMatched);
        if (thirdCard) {
          const nonMatchIndex = cards.findIndex((c, i) => !c.isFlipped && c.pairId !== thirdCard.pairId);
          if (nonMatchIndex !== -1) {
            setCards(prev => prev.map((c, i) => i === nonMatchIndex ? { ...c, isFlipped: true } : c));
          }
        }
      },
      // Step 6: Flip back non-matching cards
      () => {
        setCards(prev => prev.map(c => 
          c.isFlipped && !c.isMatched ? { ...c, isFlipped: false } : c
        ));
      },
      // Step 7: Reset and restart
      () => {
        setCards(prev => prev.map(c => ({ ...c, isFlipped: false, isMatched: false })));
        setAnimationStep(0);
      },
    ];

    const timer = setTimeout(() => {
      if (animationStep < sequence.length) {
        sequence[animationStep]();
        setAnimationStep(prev => prev + 1);
      }
    }, animationStep === 0 ? 1500 : 800);

    return () => clearTimeout(timer);
  }, [animationStep, cards]);

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-[200px] mx-auto">
      {cards.map((card) => (
        <DemoCard key={card.id} card={card} />
      ))}
    </div>
  );
};

const DemoCard: React.FC<{ card: DemoCard }> = ({ card }) => {
  const iconData = CARD_ICONS[card.pairId];
  
  const bgPositionX = (iconData.col / (SPRITE_CONFIG.columns - 1)) * 100;
  const bgPositionY = (iconData.row / (SPRITE_CONFIG.rows - 1)) * 100;

  return (
    <div className="relative aspect-square">
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: card.isFlipped || card.isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Card Back */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-md flex items-center justify-center",
            "bg-gradient-to-br from-[#0a0a0f] to-[#1a0a20] border transition-all duration-300",
            "border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-lg opacity-50 font-bold bg-gradient-to-br from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            ?
          </span>
        </div>

        {/* Card Front */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-md overflow-hidden border transition-all duration-300",
            card.isMatched 
              ? "border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]" 
              : "border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${SPRITE_CONFIG.imagePath})`,
              backgroundSize: `${SPRITE_CONFIG.columns * 100}% ${SPRITE_CONFIG.rows * 100}%`,
              backgroundPosition: `${bgPositionX}% ${bgPositionY}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
          {card.isMatched && (
            <div className="absolute inset-0 bg-gradient-to-t from-green-500/30 to-transparent" />
          )}
        </div>
      </div>
    </div>
  );
};
