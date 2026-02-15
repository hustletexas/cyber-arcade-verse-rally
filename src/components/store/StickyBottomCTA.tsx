import React from 'react';
import { Button } from '@/components/ui/button';

interface StickyBottomCTAProps {
  onShopNow: () => void;
  onLimitedDrop: () => void;
}

export const StickyBottomCTA = ({ onShopNow, onLimitedDrop }: StickyBottomCTAProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2 pointer-events-none">
      <div className="flex gap-2 max-w-md mx-auto pointer-events-auto">
        <Button
          onClick={onShopNow}
          className="flex-1 h-12 rounded-2xl font-display font-bold text-sm tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #FF2FAF, #CC0088)',
            boxShadow: '0 4px 20px rgba(255,47,175,0.4)'
          }}
        >
          SHOP NOW
        </Button>
        <Button
          onClick={onLimitedDrop}
          className="flex-1 h-12 rounded-2xl font-display font-bold text-sm tracking-wider border-2 border-[#00E5FF]/60 text-[#00E5FF] bg-[#14002B]/90 backdrop-blur-md hover:bg-[#00E5FF]/10"
          variant="outline"
        >
          LIMITED DROP
        </Button>
      </div>
    </div>
  );
};
