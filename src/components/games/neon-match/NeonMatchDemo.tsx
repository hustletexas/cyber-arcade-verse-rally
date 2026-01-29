import React, { useEffect, useState, useRef } from 'react';
import { CARD_ICONS, SPRITE_CONFIG } from '@/types/neon-match';
import { cn } from '@/lib/utils';

interface DemoCard {
  id: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Fixed card layout for predictable demo
const DEMO_LAYOUT: { pairId: string }[] = [
  { pairId: 'arcade' },
  { pairId: 'controller' },
  { pairId: 'trophy' },
  { pairId: 'diamond' },
  { pairId: 'arcade' },
  { pairId: 'controller' },
  { pairId: 'trophy' },
  { pairId: 'diamond' },
];

export const NeonMatchDemo: React.FC = () => {
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());
  const [matchedIndices, setMatchedIndices] = useState<Set<number>>(new Set());
  const stepRef = useRef(0);

  useEffect(() => {
    const runAnimation = () => {
      const step = stepRef.current;
      
      switch (step) {
        case 0:
          // Flip card 0 (arcade)
          setFlippedIndices(new Set([0]));
          break;
        case 1:
          // Flip card 4 (arcade match)
          setFlippedIndices(new Set([0, 4]));
          break;
        case 2:
          // Mark as matched
          setMatchedIndices(new Set([0, 4]));
          break;
        case 3:
          // Flip card 1 (controller)
          setFlippedIndices(new Set([0, 4, 1]));
          break;
        case 4:
          // Flip card 3 (diamond - wrong)
          setFlippedIndices(new Set([0, 4, 1, 3]));
          break;
        case 5:
          // Flip back wrong cards
          setFlippedIndices(new Set([0, 4]));
          break;
        case 6:
          // Flip controller again
          setFlippedIndices(new Set([0, 4, 1]));
          break;
        case 7:
          // Flip controller match
          setFlippedIndices(new Set([0, 4, 1, 5]));
          break;
        case 8:
          // Mark controller as matched
          setMatchedIndices(new Set([0, 4, 1, 5]));
          break;
        case 9:
          // Reset everything
          setFlippedIndices(new Set());
          setMatchedIndices(new Set());
          stepRef.current = -1;
          break;
      }
      
      stepRef.current += 1;
    };

    const timer = setInterval(runAnimation, 900);
    
    // Run first step immediately after a short delay
    const initialTimer = setTimeout(runAnimation, 500);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimer);
    };
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2 w-full max-w-[180px] mx-auto p-2">
      {DEMO_LAYOUT.map((layout, index) => (
        <DemoCard 
          key={index} 
          pairId={layout.pairId}
          isFlipped={flippedIndices.has(index)}
          isMatched={matchedIndices.has(index)}
        />
      ))}
    </div>
  );
};

const DemoCard: React.FC<{ pairId: string; isFlipped: boolean; isMatched: boolean }> = ({ 
  pairId, 
  isFlipped, 
  isMatched 
}) => {
  const iconData = CARD_ICONS[pairId];
  
  const bgPositionX = (iconData.col / (SPRITE_CONFIG.columns - 1)) * 100;
  const bgPositionY = (iconData.row / (SPRITE_CONFIG.rows - 1)) * 100;

  return (
    <div className="relative aspect-square" style={{ perspective: '400px' }}>
      <div
        className="absolute inset-0 w-full h-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped || isMatched ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Card Back */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-md flex items-center justify-center",
            "bg-gradient-to-br from-[#0a0a0f] to-[#1a0a20] border transition-all duration-300",
            "border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]"
          )}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <span className="text-base opacity-60 font-bold bg-gradient-to-br from-cyan-400 to-pink-500 bg-clip-text text-transparent">
            ?
          </span>
        </div>

        {/* Card Front */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full rounded-md overflow-hidden border transition-all duration-300",
            isMatched 
              ? "border-green-400 shadow-[0_0_12px_rgba(74,222,128,0.6)]" 
              : "border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
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
            <div className="absolute inset-0 bg-gradient-to-t from-green-500/40 to-transparent animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
};
