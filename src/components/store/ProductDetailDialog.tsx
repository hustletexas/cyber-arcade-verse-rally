import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { type MerchandiseItem } from '@/data/storeProducts';

interface ProductDetailDialogProps {
  item: MerchandiseItem | null;
  onClose: () => void;
}

export const ProductDetailDialog = ({ item, onClose }: ProductDetailDialogProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  if (!item) return null;

  const handleAdd = () => {
    if (!selectedSize) {
      toast({ title: "Select a size", variant: "destructive" });
      return;
    }
    if (!selectedColor) {
      toast({ title: "Select a color", variant: "destructive" });
      return;
    }
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category,
      selectedSize,
      selectedColor
    });
    toast({ title: "Added to Cart! 🛒", description: `${item.name} (${selectedSize}, ${selectedColor})` });
    setSelectedSize('');
    setSelectedColor('');
    onClose();
  };

  return (
    <Dialog open={!!item} onOpenChange={() => { setSelectedSize(''); setSelectedColor(''); onClose(); }}>
      <DialogContent className="max-w-lg border-[#FF2FAF]/20 p-0 overflow-hidden" style={{ background: '#14002B' }}>
        <img src={item.image} alt={item.name} className="w-full aspect-square object-contain bg-black/30" />
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-white tracking-wider">
              {item.name}
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-black text-[#00E5FF]">${item.price}</span>
            {item.isLimited && (
              <Badge className="bg-[#FF2FAF] text-white border-0">LIMITED</Badge>
            )}
          </div>

          <p className="text-white/50 text-sm">{item.description}</p>

          {/* Sizes */}
          <div>
            <p className="text-white/40 text-xs font-display tracking-wider mb-2">SIZE</p>
            <div className="flex flex-wrap gap-2">
              {item.sizes.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-display transition-all ${
                    selectedSize === s
                      ? 'bg-[#FF2FAF] text-white'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:border-[#FF2FAF]/50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <p className="text-white/40 text-xs font-display tracking-wider mb-2">COLOR</p>
            <div className="flex flex-wrap gap-2">
              {item.colors.map(c => (
                <button
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-display transition-all ${
                    selectedColor === c
                      ? 'bg-[#00E5FF] text-black'
                      : 'bg-white/5 text-white/60 border border-white/10 hover:border-[#00E5FF]/50'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAdd}
            disabled={!selectedSize || !selectedColor}
            className="w-full h-14 rounded-2xl text-lg font-display font-bold tracking-wider"
            style={{
              background: selectedSize && selectedColor
                ? 'linear-gradient(135deg, #FF2FAF, #CC0088)'
                : 'rgba(255,255,255,0.1)',
              boxShadow: selectedSize && selectedColor ? '0 0 25px rgba(255,47,175,0.3)' : 'none'
            }}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            ADD TO CART — ${item.price}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
