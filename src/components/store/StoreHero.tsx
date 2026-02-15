import React from 'react';
import { ChevronDown } from 'lucide-react';

export const StoreHero = () => {
  return (
    <section className="relative aspect-[16/9] max-h-[60vh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/images/store/store-hero-bg-v2.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgba(20,0,43,0.3) 0%, rgba(20,0,43,0.1) 40%, rgba(20,0,43,0.5) 100%)'
        }} />
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-6 w-6 text-white/30" />
      </div>
    </section>
  );
};
