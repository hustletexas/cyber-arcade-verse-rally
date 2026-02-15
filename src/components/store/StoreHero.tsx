import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface StoreHeroProps {
  onShopNow: () => void;
  onLimitedDrop: () => void;
}

export const StoreHero = ({ onShopNow, onLimitedDrop }: StoreHeroProps) => {
  return (
    <section className="relative min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/store/store-hero-bg.png"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(20,0,43,0.5) 0%, rgba(20,0,43,0.3) 40%, rgba(20,0,43,0.6) 100%)'
        }} />
      </div>

      <div className="relative z-10 space-y-6 max-w-md mx-auto">

        <p className="text-white/60 text-lg font-display tracking-widest">
          Level Up Your Reality
        </p>

        <p className="text-white/40 text-xs tracking-wider uppercase">
          Seen in the Houston Esports Scene • All Ages Esports
        </p>

        <div className="space-y-3 pt-4">
          <Button
            onClick={onShopNow}
            className="w-full h-14 rounded-2xl text-lg font-display font-bold tracking-wider bg-transparent backdrop-blur-md border border-[#FF2FAF]/40 text-white hover:bg-[#FF2FAF]/10 transition-all duration-300"
            style={{
              boxShadow: '0 0 20px rgba(255,47,175,0.15), inset 0 0 20px rgba(255,47,175,0.05)'
            }}
          >
            SHOP NOW
          </Button>
          <Button
            onClick={onLimitedDrop}
            className="w-full h-14 rounded-2xl text-lg font-display font-bold tracking-wider bg-transparent backdrop-blur-md border border-[#00E5FF]/40 text-white hover:bg-[#00E5FF]/10 transition-all duration-300"
            style={{
              boxShadow: '0 0 20px rgba(0,229,255,0.15), inset 0 0 20px rgba(0,229,255,0.05)'
            }}
          >
            LIMITED DROP
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-white/30" />
      </div>
    </section>
  );
};
