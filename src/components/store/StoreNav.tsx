import React from 'react';
import { Menu, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const StoreNav = () => {
  const { setIsOpen, items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-[#FF2FAF]/20"
      style={{ background: 'rgba(20, 0, 43, 0.9)' }}>
      <div className="flex items-center justify-between px-4 h-14">
        {/* Hamburger */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-[#FF2FAF]">
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-[#14002B]/95 backdrop-blur-md border-[#FF2FAF]/30">
            <DropdownMenuItem onClick={() => navigate('/')} className="text-white/80 hover:text-white focus:text-white hover:bg-[#FF2FAF]/10 focus:bg-[#FF2FAF]/10">
              🎮 Arcade Home
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/tournaments')} className="text-white/80 hover:text-white focus:text-white hover:bg-[#FF2FAF]/10 focus:bg-[#FF2FAF]/10">
              🏆 Tournaments
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/rewards')} className="text-white/80 hover:text-white focus:text-white hover:bg-[#FF2FAF]/10 focus:bg-[#FF2FAF]/10">
              🎁 Rewards
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/about')} className="text-white/80 hover:text-white focus:text-white hover:bg-[#FF2FAF]/10 focus:bg-[#FF2FAF]/10">
              ℹ️ About
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Center Logo */}
        <div className="font-display text-sm tracking-wider" style={{
          background: 'linear-gradient(135deg, #FF2FAF, #00E5FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          CYBER CITY STORE
        </div>

        {/* Cart */}
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
