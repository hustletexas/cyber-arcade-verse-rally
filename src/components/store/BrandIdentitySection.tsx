import React from 'react';
import { Button } from '@/components/ui/button';

interface BrandIdentitySectionProps {
  onShop: () => void;
}

export const BrandIdentitySection = ({ onShop }: BrandIdentitySectionProps) => {
  return (
    <section className="py-16 px-6 text-center">
      <h2 className="font-display text-2xl font-black text-white tracking-wider mb-4">
        More Than Merch.
      </h2>
      <div className="space-y-1 mb-8">
        <p className="text-white/50 font-display text-sm tracking-widest">Skill {'>'} Luck.</p>
        <p className="text-white/50 font-display text-sm tracking-widest">Hustle Now. Shine Later.</p>
      </div>
      <Button
        onClick={onShop}
        variant="outline"
        className="h-12 px-8 rounded-2xl font-display tracking-wider border-2 border-[#FF2FAF]/50 text-[#FF2FAF] bg-transparent hover:bg-[#FF2FAF]/10"
      >
        Explore the Collection
      </Button>
    </section>
  );
};
