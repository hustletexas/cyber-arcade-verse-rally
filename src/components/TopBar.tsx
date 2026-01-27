import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UnifiedWalletDropdown } from './UnifiedWalletDropdown';
import { useCart } from '@/contexts/CartContext';
import { STELLAR_NETWORK } from '@/config/stellar';

export const TopBar = () => {
  const { setIsOpen, items } = useCart();
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

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
