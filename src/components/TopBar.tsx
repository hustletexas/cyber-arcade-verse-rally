import React from 'react';
import { UnifiedWalletDropdown } from './UnifiedWalletDropdown';

export const TopBar = () => {
  return (
    <header className="border-b border-neon-cyan/20 bg-card/30 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between h-12">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎮</span>
              <h1 className="text-lg font-display font-bold bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-purple bg-clip-text text-transparent hidden sm:block">
                CYBER CITY
              </h1>
            </div>
          </div>

          {/* Unified Wallet Dropdown */}
          <UnifiedWalletDropdown />
        </div>
      </div>
    </header>
  );
};
