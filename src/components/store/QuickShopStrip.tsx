import React from 'react';
import { Badge } from '@/components/ui/badge';
import { type MerchandiseItem } from '@/data/storeProducts';

interface QuickShopStripProps {
  items: MerchandiseItem[];
  onSelectItem: (item: MerchandiseItem) => void;
}

export const QuickShopStrip = ({ items, onSelectItem }: QuickShopStripProps) => {
  return (
    <section className="py-8">
      <h2 className="font-display text-lg text-white/80 tracking-wider px-6 mb-4">
        QUICK SHOP
      </h2>
      <div className="flex gap-4 overflow-x-auto px-6 pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="flex-none w-40 snap-start cursor-pointer group"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden mb-2 border border-white/10 group-hover:border-[#FF2FAF]/50 transition-colors">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              {item.isLimited && (
                <Badge className="absolute top-2 left-2 bg-[#FF2FAF] text-white text-[10px] px-2 py-0.5 border-0">
                  LIMITED
                </Badge>
              )}
            </div>
            <p className="text-white/80 text-sm font-medium line-clamp-2 leading-tight">
              {item.name}
            </p>
            <p className="text-[#00E5FF] font-display text-sm font-bold mt-1">
              ${item.price}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
