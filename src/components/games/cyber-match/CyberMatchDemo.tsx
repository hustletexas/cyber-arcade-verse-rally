import React, { useState, useEffect } from 'react';
import { Card, CARD_ICONS, SPRITE_CONFIG, PAIR_IDS } from '@/types/cyber-match';
import { cn } from '@/lib/utils';

// Demo card component - simplified for demo purposes
const DemoCard: React.FC<{
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}> = ({ pairId, isFlipped, isMatched }) => {
  const iconData = CARD_ICONS[pairId];
  const bgPositionX = iconData.col * 25;
  const bgPositionY = iconData.row * (100 / (SPRITE_CONFIG.rows - 1));

  return (
    <div className="relative aspect-square" style={{ perspective: '600px' }}>
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped || isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Back */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-lg flex items-center justify-center",
            "bg-gradient-to-br from-[#0a0a1a] via-[#1a0a25] to-[#0a1a2a]",
            "border border-neon-cyan/40"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-lg font-bold bg-gradient-to-br from-neon-cyan to-neon-pink bg-clip-text text-transparent">?</span>
        </div>
        
        {/* Front */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-lg overflow-hidden border",
            isMatched 
              ? "border-neon-green shadow-[0_0_15px_rgba(74,222,128,0.5)]" 
              : "border-neon-cyan"
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
          {isMatched && (
            <div className="absolute inset-0 bg-neon-green/20 flex items-center justify-center">
              <div className="w-3 h-3 bg-neon-green rounded-full animate-ping" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const CyberMatchDemo: React.FC = () => {
  // Use 8 cards (4 pairs) for demo - smaller grid
  const demoPairs = PAIR_IDS.slice(0, 4);
  const [cards, setCards] = useState<{ id: string; pairId: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [demoStep, setDemoStep] = useState(0);

  // Initialize demo cards
  useEffect(() => {
    const initialCards = demoPairs.flatMap((pairId, i) => [
      { id: `${pairId}-1`, pairId, isFlipped: false, isMatched: false },
      { id: `${pairId}-2`, pairId, isFlipped: false, isMatched: false },
    ]);
    // Shuffle deterministically for demo
    const shuffled = [...initialCards].sort((a, b) => a.id.localeCompare(b.id));
    setCards(shuffled);
  }, []);

  // Automated demo animation
  useEffect(() => {
    if (cards.length === 0) return;

    const interval = setInterval(() => {
      setDemoStep(prev => (prev + 1) % 12);
    }, 1500);

    return () => clearInterval(interval);
  }, [cards.length]);

  // Update cards based on demo step
  useEffect(() => {
    if (cards.length === 0) return;

    setCards(prev => {
      const updated = prev.map(c => ({ ...c, isFlipped: false }));
      
      // Demo sequence - flip pairs to show matching
      const step = demoStep % 12;
      
      if (step >= 1 && step <= 2) {
        // Flip first pair
        updated[0].isFlipped = true;
        if (step === 2) updated[1].isFlipped = true;
      } else if (step === 3) {
        // Match first pair
        updated[0].isFlipped = true;
        updated[0].isMatched = true;
        updated[1].isFlipped = true;
        updated[1].isMatched = true;
      } else if (step >= 4 && step <= 5) {
        // Keep first matched, flip second pair
        updated[0].isMatched = true;
        updated[1].isMatched = true;
        updated[2].isFlipped = true;
        if (step === 5) updated[3].isFlipped = true;
      } else if (step === 6) {
        // Match second pair
        updated[0].isMatched = true;
        updated[1].isMatched = true;
        updated[2].isFlipped = true;
        updated[2].isMatched = true;
        updated[3].isFlipped = true;
        updated[3].isMatched = true;
      } else if (step >= 7 && step <= 8) {
        // Continue with more matches
        updated[0].isMatched = true;
        updated[1].isMatched = true;
        updated[2].isMatched = true;
        updated[3].isMatched = true;
        updated[4].isFlipped = true;
        if (step === 8) updated[5].isFlipped = true;
      } else if (step >= 9) {
        // All matched - victory state
        updated.forEach(c => {
          c.isFlipped = true;
          c.isMatched = true;
        });
      }
      
      return updated;
    });
  }, [demoStep, cards.length]);

  // Reset all matches periodically
  useEffect(() => {
    if (demoStep === 0 && cards.length > 0) {
      setCards(prev => prev.map(c => ({ ...c, isFlipped: false, isMatched: false })));
    }
  }, [demoStep, cards.length]);

  return (
    <div className="w-[200px] sm:w-[240px]">
      <div className="grid grid-cols-4 gap-1.5 p-3 rounded-xl bg-black/60 backdrop-blur-sm border border-neon-cyan/30">
        {cards.map((card) => (
          <DemoCard
            key={card.id}
            pairId={card.pairId}
            isFlipped={card.isFlipped}
            isMatched={card.isMatched}
          />
        ))}
      </div>
      <div className="text-center mt-2 text-xs text-neon-cyan/60">
        Live Demo
      </div>
    </div>
  );
};
