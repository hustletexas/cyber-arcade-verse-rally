import React, { useEffect, useState, useRef } from 'react';
import { CARD_ICONS, SPRITE_CONFIG } from '@/types/neon-match';
import { cn } from '@/lib/utils';

interface DemoCard {
  id: string;
  pairId: string;
  isFlipped: boolean;
  isMatched: boolean;
}

// Fixed card layout for predictable demo - 3x4 grid (12 cards, 6 pairs)
const DEMO_LAYOUT: { pairId: string }[] = [
  { pairId: 'arcade' },
  { pairId: 'controller' },
  { pairId: 'trophy' },
  { pairId: 'diamond' },
  { pairId: 'skull' },
  { pairId: 'crown' },
  { pairId: 'arcade' },
  { pairId: 'controller' },
  { pairId: 'trophy' },
  { pairId: 'diamond' },
  { pairId: 'skull' },
  { pairId: 'crown' },
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
          // Flip card 6 (arcade match)
          setFlippedIndices(new Set([0, 6]));
          break;
        case 2:
          // Mark as matched
          setMatchedIndices(new Set([0, 6]));
          break;
        case 3:
          // Flip card 2 (trophy)
          setFlippedIndices(new Set([0, 6, 2]));
          break;
        case 4:
          // Flip card 5 (crown - wrong)
          setFlippedIndices(new Set([0, 6, 2, 5]));
          break;
        case 5:
          // Flip back wrong cards
          setFlippedIndices(new Set([0, 6]));
          break;
        case 6:
          // Flip trophy again
          setFlippedIndices(new Set([0, 6, 2]));
          break;
        case 7:
          // Flip trophy match
          setFlippedIndices(new Set([0, 6, 2, 8]));
          break;
        case 8:
          // Mark trophy as matched
          setMatchedIndices(new Set([0, 6, 2, 8]));
          break;
        case 9:
          // Flip diamond
          setFlippedIndices(new Set([0, 6, 2, 8, 3]));
          break;
        case 10:
          // Flip diamond match
          setFlippedIndices(new Set([0, 6, 2, 8, 3, 9]));
          break;
        case 11:
          // Mark diamond matched
          setMatchedIndices(new Set([0, 6, 2, 8, 3, 9]));
          break;
        case 12:
          // Reset everything
          setFlippedIndices(new Set());
          setMatchedIndices(new Set());
          stepRef.current = -1;
          break;
      }
      
      stepRef.current += 1;
    };

    const timer = setInterval(runAnimation, 800);
    
    // Run first step immediately after a short delay
    const initialTimer = setTimeout(runAnimation, 500);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimer);
    };
  }, []);

  return (
    <div className="grid grid-cols-4 gap-2 w-[220px] p-3 bg-black/40 rounded-xl border border-cyan-500/20">
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
  
  // Calculate background position for the 5x7 sprite grid
  // Each cell is 20% width and ~14.28% height
  const bgPositionX = iconData.col * 25; // 100 / (5-1) = 25
  const bgPositionY = iconData.row * (100 / (SPRITE_CONFIG.rows - 1));

  return (
    <div 
      className="relative w-full aspect-square" 
      style={{ perspective: '400px' }}
    >
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
          <span className="text-sm opacity-60 font-bold bg-gradient-to-br from-cyan-400 to-pink-500 bg-clip-text text-transparent">
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
