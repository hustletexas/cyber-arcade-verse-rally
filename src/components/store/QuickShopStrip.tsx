import React, { useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { type MerchandiseItem } from '@/data/storeProducts';

interface QuickShopStripProps {
  items: MerchandiseItem[];
  onSelectItem: (item: MerchandiseItem) => void;
}

export const QuickShopStrip = ({ items, onSelectItem }: QuickShopStripProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const amount = 280;
    if (direction === 'right' && container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
      container.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === 'left' && container.scrollLeft <= 10) {
      container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
    } else {
      container.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, item: MerchandiseItem) => {
    e.stopPropagation();
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      selectedSize: item.sizes[1] || item.sizes[0],
      selectedColor: item.colors[0],
    });
    toast({
      title: "Added to Cart! 🛒",
      description: `${item.name} (${item.sizes[1] || item.sizes[0]}, ${item.colors[0]})`,
    });
  };

  return (
    <section className="py-10">
      <div className="flex items-center justify-between px-6 mb-5">
        <h2 className="font-display text-lg text-white/80 tracking-wider">
          QUICK SHOP
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-[#FF2FAF]/50 hover:bg-[#FF2FAF]/10 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="h-8 w-8 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-[#FF2FAF]/50 hover:bg-[#FF2FAF]/10 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto px-6 pb-6 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="flex-none w-64 snap-center cursor-pointer group"
          >
            <div
              className="rounded-2xl overflow-hidden border border-white/10 group-hover:border-[#FF2FAF]/40 transition-all duration-300"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,47,175,0.04) 100%)',
              }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                <div
                  className="absolute inset-x-0 bottom-0 h-1/3"
                  style={{
                    background: 'linear-gradient(to top, rgba(20,0,43,0.95), transparent)',
                  }}
                />
                {item.isLimited && (
                  <Badge className="absolute top-3 left-3 bg-[#FF2FAF]/90 backdrop-blur-sm text-white text-[10px] px-2.5 py-1 border-0 font-display tracking-wider">
                    LIMITED DROP
                  </Badge>
                )}
                <div className="absolute bottom-3 left-3">
                  <span className="font-display text-2xl font-black text-[#00E5FF] drop-shadow-lg">
                    ${item.price}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                <p className="text-white/90 text-sm font-semibold line-clamp-2 leading-snug min-h-[2.5rem]">
                  {item.name}
                </p>
                <p className="text-white/40 text-xs line-clamp-1">
                  {item.description}
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {item.sizes.slice(0, 5).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-white/40 font-display"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                <Button
                  onClick={(e) => handleQuickAdd(e, item)}
                  className="w-full h-11 rounded-xl text-sm font-display font-bold tracking-wider gap-2 transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #FF2FAF, #CC0088)',
                    boxShadow: '0 0 20px rgba(255,47,175,0.2)',
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  QUICK ADD
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
