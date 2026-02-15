import React from 'react';
import { Button } from '@/components/ui/button';
import { merchandiseItems, type MerchandiseItem } from '@/data/storeProducts';

interface SpotlightProductProps {
  onSelectItem: (item: MerchandiseItem) => void;
}

export const SpotlightProduct = ({ onSelectItem }: SpotlightProductProps) => {
  const spotlight = merchandiseItems.find(i => i.id === '18')!; // Hustle Jersey

  return (
    <section className="py-12 px-6">
      <div className="max-w-sm mx-auto text-center">
        <div className="rounded-2xl overflow-hidden border border-white/10 mb-6 cursor-pointer"
          onClick={() => onSelectItem(spotlight)}
          style={{ boxShadow: '0 0 40px rgba(0,229,255,0.1)' }}>
          <img
            src={spotlight.image}
            alt={spotlight.name}
            className="w-full aspect-square object-cover"
          />
        </div>
        <h3 className="font-display text-xl font-bold text-white tracking-wider mb-1">
          {spotlight.name}
        </h3>
        <p className="text-[#00E5FF] font-display text-2xl font-black mb-2">
          ${spotlight.price}
        </p>
        <p className="text-white/50 text-sm mb-6">
          Built for competitive players.
        </p>
        <Button
          onClick={() => onSelectItem(spotlight)}
          className="w-full h-14 rounded-2xl text-lg font-display font-bold tracking-wider"
          style={{
            background: 'linear-gradient(135deg, #00E5FF, #0099AA)',
            boxShadow: '0 0 30px rgba(0,229,255,0.3)',
            color: '#000'
          }}
        >
          BUY NOW
        </Button>
      </div>
    </section>
  );
};
