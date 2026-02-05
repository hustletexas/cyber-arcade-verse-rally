 import React from 'react';
 import { ShoppingCart, ChevronDown, Gamepad2, Trophy, Users, Bot, ShoppingBag, Gift, Ticket, Sparkles, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
import { UnifiedWalletDropdown } from './UnifiedWalletDropdown';
import { useCart } from '@/contexts/CartContext';
import { STELLAR_NETWORK } from '@/config/stellar';
import { useNavigate } from 'react-router-dom';

// Sections that scroll on homepage
const scrollSections = [
  { id: 'marketplace', label: 'Season Pass', icon: Sparkles },
  { id: 'arcade-hub', label: 'Arcade Hub', icon: Gamepad2 },
  { id: 'community-hub', label: 'Community HQ', icon: Users },
  { id: 'web3-gaming', label: 'Web3 Gaming', icon: Coins },
  { id: 'ai-coach', label: 'AI Coach', icon: Bot },
  { id: 'raffle', label: 'Raffles', icon: Ticket },
];

// Sections that navigate to dedicated pages
const pageSections = [
  { path: '/tournaments', label: 'Live Bracket', icon: Trophy },
  { path: '/store', label: 'Merch Store', icon: ShoppingBag },
  { path: '/cyber-chest', label: 'Cyber Chest', icon: Gift },
  { path: '/cyber-slots', label: 'Cyber Slots', icon: Gamepad2 },
];

export const TopBar = () => {
  const { setIsOpen, items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    // If not on homepage, navigate first
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header className="border-b border-neon-cyan/20 bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between h-12">
          {/* Network indicator */}
          <div className="flex-1 flex items-center gap-2">
            {!STELLAR_NETWORK.isMainnet && (
              <Badge 
                variant="outline" 
                className="bg-amber-500/20 border-amber-500/50 text-amber-400 text-xs font-medium animate-pulse"
              >
                ⚠️ {STELLAR_NETWORK.networkName} • Mainnet Soon
              </Badge>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
           {/* Explore Menu */}
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <Button
                 variant="ghost"
                 className="hover:bg-neon-cyan/10 transition-colors text-neon-cyan gap-1"
               >
                 Explore
                 <ChevronDown className="h-4 w-4" />
               </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent 
               align="end" 
               className="w-48 bg-card/95 backdrop-blur-md border-neon-cyan/30 z-[100]"
             >
            {scrollSections.map((section) => (
              <DropdownMenuItem
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="cursor-pointer hover:bg-neon-cyan/10 focus:bg-neon-cyan/10 text-foreground"
              >
                <section.icon className="h-4 w-4 mr-2 text-neon-cyan" />
                {section.label}
              </DropdownMenuItem>
            ))}
            <div className="my-1 border-t border-neon-cyan/20" />
            {pageSections.map((section) => (
              <DropdownMenuItem
                key={section.path}
                onClick={() => navigate(section.path)}
                className="cursor-pointer hover:bg-neon-cyan/10 focus:bg-neon-cyan/10 text-foreground"
              >
                <section.icon className="h-4 w-4 mr-2 text-neon-pink" />
                {section.label}
              </DropdownMenuItem>
            ))}
             </DropdownMenuContent>
           </DropdownMenu>
 
            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="relative hover:bg-neon-cyan/10 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-neon-cyan" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-neon-pink text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>

            {/* Unified Wallet Dropdown */}
            <UnifiedWalletDropdown />
          </div>
        </div>
      </div>
    </header>
  );
};
