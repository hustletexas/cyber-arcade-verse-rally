import React from 'react';
import { ShoppingCart, ChevronDown, Radio, ShoppingBag, Heart, Info, Scale, GraduationCap, Award, Swords, Trophy, Handshake } from 'lucide-react';
import { useSeasonPass, TIER_CONFIG } from '@/hooks/useSeasonPass';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
 } from '@/components/ui/dropdown-menu';
import { UnifiedWalletDropdown } from './UnifiedWalletDropdown';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useRadioVisibility } from '@/contexts/RadioVisibilityContext';

// Sections that scroll on homepage
const scrollSections: { id: string; label: string; icon: any }[] = [];

// Sections that navigate to dedicated pages
const pageSections = [
  { path: '/store', label: 'Merch', icon: ShoppingBag },
  { path: '/tournaments', label: 'Tournament', icon: Trophy },
  { path: '/esports', label: 'Cyber City Esports', icon: Swords },
  { path: '/after-school', label: 'After-School Program', icon: GraduationCap },
  { path: '/sponsorships', label: 'Sponsorships', icon: Handshake },
  { path: '/foundation', label: 'Foundation', icon: Heart },
  { path: '/tournament-rules', label: 'Rules', icon: Scale },
  { path: '/about', label: 'About Us', icon: Info },
];

export const TopBar = () => {
  const { setIsOpen, items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const navigate = useNavigate();
  const { hasPass, tier } = useSeasonPass();
  const tierConfig = tier !== 'none' ? TIER_CONFIG[tier] : null;
  const { isRadioVisible, toggleRadio } = useRadioVisibility();

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
          {/* Radio toggle */}
          <div className="flex-1 flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={toggleRadio}
              className={cn(
                "hover:bg-neon-cyan/10 transition-colors gap-1 text-xs",
                isRadioVisible ? "text-neon-pink" : "text-neon-cyan"
              )}
            >
              <Radio className="h-4 w-4" />
              Radio {isRadioVisible ? '▾' : '▸'}
            </Button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Season Pass Badge */}
            {hasPass && tierConfig && (
              <Badge variant="outline" className={cn(
                "text-xs px-3 py-1 hidden sm:flex",
                tierConfig.borderColor, tierConfig.color, tierConfig.bgColor
              )}>
                {tierConfig.emoji} {tierConfig.label} Pass
              </Badge>
            )}
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
