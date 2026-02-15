import React from 'react';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

interface StoreNavProps {
  onCategorySelect?: (category: string) => void;
}

export const StoreNav = ({ onCategorySelect }: StoreNavProps) => {
  const { setIsOpen, items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-[#FF2FAF]/20"
      style={{ background: 'rgba(20, 0, 43, 0.9)' }}>
      <div className="flex items-center justify-between px-4 h-14">
        <Button variant="ghost" size="icon" className="text-[#FF2FAF]" onClick={() => window.location.href = '/'}>
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <div className="font-display text-sm tracking-wider" style={{
          background: 'linear-gradient(135deg, #FF2FAF, #00E5FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          CYBER CITY STORE
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="relative text-[#00E5FF]"
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#FF2FAF] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  );
};
