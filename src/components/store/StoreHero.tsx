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
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight"
          style={{
            background: 'linear-gradient(135deg, #FFFFFF 0%, #FF2FAF 50%, #00E5FF 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
          CYBER CITY<br />ARCADE STORE
        </h1>

        <p className="text-white/60 text-lg font-display tracking-widest">
          Level Up Your Reality
        </p>

        <p className="text-white/40 text-xs tracking-wider uppercase">
          Seen in the Houston Esports Scene • All Ages Esports
        </p>

        <div className="space-y-3 pt-4">
          <Button
            onClick={onShopNow}
            className="w-full h-14 rounded-2xl text-lg font-display font-bold tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #FF2FAF, #CC0088)',
              boxShadow: '0 0 30px rgba(255,47,175,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
            }}
          >
            SHOP NOW
          </Button>
          <Button
            onClick={onLimitedDrop}
            variant="outline"
            className="w-full h-14 rounded-2xl text-lg font-display font-bold tracking-wider border-2 border-[#00E5FF]/50 text-[#00E5FF] bg-transparent hover:bg-[#00E5FF]/10"
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
