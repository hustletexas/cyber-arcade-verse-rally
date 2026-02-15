import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { merchandiseItems, type MerchandiseItem } from '@/data/storeProducts';

interface LimitedDropSectionProps {
  onSelectItem: (item: MerchandiseItem) => void;
}

export const LimitedDropSection = ({ onSelectItem }: LimitedDropSectionProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const limitedItem = merchandiseItems.find(i => i.id === '16')!; // Pom Beanie

  // Countdown timer - next Sunday midnight
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const getNextSunday = () => {
      const now = new Date();
      const next = new Date(now);
      next.setDate(now.getDate() + (7 - now.getDay()));
      next.setHours(23, 59, 59, 999);
      return next;
    };

    const target = getNextSunday();
    const interval = setInterval(() => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleQuickAdd = () => {
    addToCart({
      id: limitedItem.id,
      name: limitedItem.name,
      price: limitedItem.price,
      image: limitedItem.image,
      category: limitedItem.category,
      selectedSize: 'M',
      selectedColor: 'Black'
    });
    toast({ title: "Added to Cart! 🔥", description: `${limitedItem.name} added — select size in cart` });
  };

  return (
    <section className="py-12 px-6 relative">
      {/* Neon divider */}
      <div className="w-full h-px mb-8" style={{
        background: 'linear-gradient(90deg, transparent, #FF2FAF, #00E5FF, transparent)'
      }} />

      <h2 className="font-display text-2xl font-black text-center tracking-wider mb-2"
        style={{
          background: 'linear-gradient(135deg, #FF2FAF, #00E5FF)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
        LIMITED DROP
      </h2>

      {/* Countdown */}
      <div className="flex justify-center gap-3 my-6">
        {[
          { val: timeLeft.days, label: 'DAYS' },
          { val: timeLeft.hours, label: 'HRS' },
          { val: timeLeft.mins, label: 'MIN' },
          { val: timeLeft.secs, label: 'SEC' }
        ].map((t, i) => (
          <div key={i} className="text-center">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center font-display text-2xl font-black text-white"
              style={{ background: 'rgba(255,47,175,0.15)', border: '1px solid rgba(255,47,175,0.3)' }}>
              {String(t.val).padStart(2, '0')}
            </div>
            <p className="text-[10px] text-white/40 mt-1 tracking-wider">{t.label}</p>
          </div>
        ))}
      </div>

      {/* Product */}
      <div className="max-w-sm mx-auto cursor-pointer" onClick={() => onSelectItem(limitedItem)}>
        <div className="rounded-2xl overflow-hidden border border-[#FF2FAF]/30 mb-4"
          style={{ boxShadow: '0 0 40px rgba(255,47,175,0.15)' }}>
          <img
            src={limitedItem.image}
            alt={limitedItem.name}
            className="w-full aspect-square object-cover"
          />
        </div>
        <p className="text-white/60 text-sm text-center mb-4">
          {limitedItem.description}
        </p>
      </div>

      <Button
        onClick={handleQuickAdd}
        className="w-full h-14 rounded-2xl text-lg font-display font-bold tracking-wider"
        style={{
          background: 'linear-gradient(135deg, #FF2FAF, #CC0088)',
          boxShadow: '0 0 30px rgba(255,47,175,0.3)'
        }}
      >
        ADD TO CART — ${limitedItem.price}
      </Button>
    </section>
  );
};
