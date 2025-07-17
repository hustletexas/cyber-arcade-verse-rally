
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, Shirt, Eye } from 'lucide-react';

interface MerchandiseItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'shirt' | 'hoodie' | 'jacket';
  sizes: string[];
  colors: string[];
  description: string;
}

const merchandiseItems: MerchandiseItem[] = [
  {
    id: '1',
    name: 'Cyber City Arcade Retro Gaming Tee',
    price: 19.99,
    image: '/lovable-uploads/05befe90-0669-44d1-9093-c0aac4755a61.png',
    category: 'shirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Charcoal'],
    description: 'Premium cotton tee featuring the iconic Cyber City Arcade cabinet with neon cityscape design'
  },
  {
    id: '2',
    name: 'Cyber City Arcade Premium Hoodie',
    price: 49.99,
    image: '/lovable-uploads/d02c55c8-cdcf-4072-814b-340278e7ba0d.png',
    category: 'hoodie',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Dark Gray', 'Navy'],
    description: 'Premium hoodie featuring the complete Cyber City Arcade design with neon cityscape and retro arcade cabinet'
  },
  {
    id: '3',
    name: 'Cyber City Arcade Bomber Jacket',
    price: 89.99,
    image: '/lovable-uploads/6cc1e7b7-f790-42ba-9363-08220cbc8ae1.png',
    category: 'jacket',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Navy', 'Charcoal'],
    description: 'Premium bomber jacket featuring the complete Cyber City Arcade design with neon cityscape'
  }
];

export const MerchandiseStore = () => {
  const { toast } = useToast();
  const { addToCart, getTotalItems, getTotalPrice, setIsOpen } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<MerchandiseItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  const categories = [
    { value: 'all', label: '🎮 ALL ITEMS', icon: '🎮' },
    { value: 'shirt', label: '👕 T-SHIRTS', icon: '👕' },
    { value: 'hoodie', label: '🧥 HOODIES', icon: '🧥' },
    { value: 'jacket', label: '🧥 JACKETS', icon: '🧥' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? merchandiseItems 
    : merchandiseItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: MerchandiseItem) => {
    if (!selectedSize) {
      toast({
        title: "Please Select Size",
        description: "Choose a size before adding to cart",
        variant: "destructive",
      });
      return;
    }

    if (!selectedColor) {
      toast({
        title: "Please Select Color",
        description: "Choose a color before adding to cart",
        variant: "destructive",
      });
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

    toast({
      title: "Added to Cart! 🛒",
      description: `${item.name} (${selectedSize}, ${selectedColor}) added to cart`,
    });

    // Reset selections
    setSelectedSize('');
    setSelectedColor('');
    setSelectedItem(null);
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-green flex items-center gap-3">
          🎮 CYBER CITY ARCADE OFFICIAL STORE
          <Badge className="bg-neon-pink text-black">AUTHENTIC MERCH</Badge>
          {getTotalItems() > 0 && (
            <Button
              onClick={() => setIsOpen(true)}
              className="bg-neon-cyan text-black ml-auto hover:bg-neon-cyan/80 flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              {getTotalItems()} items - ${getTotalPrice().toFixed(2)}
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center">
          {categories.map((category) => (
            <Button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              variant={selectedCategory === category.value ? "default" : "outline"}
              className={selectedCategory === category.value 
                ? "cyber-button" 
                : "border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
              }
            >
              {category.label}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="vending-machine hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <img 
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                />
                <Badge className="absolute top-2 right-2 bg-neon-purple text-black">
                  OFFICIAL
                </Badge>
                <Badge className="absolute top-2 left-2 bg-neon-green text-black font-bold">
                  ${item.price}
                </Badge>
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                     onClick={() => setSelectedItem(item)}>
                  <Eye size={32} className="text-white" />
                </div>
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-neon-cyan text-lg cursor-pointer hover:text-neon-pink transition-colors"
                      onClick={() => setSelectedItem(item)}>
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-neon-green">${item.price}</span>
                  <Badge className="bg-neon-yellow text-black">
                    <Shirt size={14} className="mr-1" />
                    AUTHENTIC
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-neon-purple font-bold">AVAILABLE COLORS:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.colors.map((color, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-neon-pink text-neon-pink">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-neon-cyan font-bold">AVAILABLE SIZES:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.sizes.map((size, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-neon-green text-neon-green">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => setSelectedItem(item)}
                    className="flex-1 cyber-button flex items-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    ADD TO CART
                  </Button>
                  <Button 
                    onClick={() => setSelectedItem(item)}
                    variant="outline"
                    className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                  >
                    <Eye size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Item Detail Dialog */}
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl arcade-frame">
            {selectedItem && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl text-neon-cyan font-display">
                    {selectedItem.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <img 
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      className="w-full h-96 object-cover rounded-lg"
                    />
                    <div className="flex justify-center">
                      <Badge className="bg-neon-green text-black text-xl px-4 py-2 font-bold">
                        ${selectedItem.price}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-bold text-neon-purple mb-2">DESCRIPTION</h3>
                      <p className="text-foreground leading-relaxed">{selectedItem.description}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-bold text-neon-purple mb-3">AVAILABLE COLORS</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedItem.colors.map((color, index) => (
                          <Badge key={index} className="bg-neon-pink text-black px-3 py-1">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-neon-purple mb-3">SELECT SIZE</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedItem.sizes.map((size, index) => (
                          <Button
                            key={index}
                            variant={selectedSize === size ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedSize(size)}
                            className={selectedSize === size 
                              ? "bg-neon-cyan text-black" 
                              : "border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black"
                            }
                          >
                            {size}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-neon-purple mb-3">SELECT COLOR</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {selectedItem.colors.map((color, index) => (
                          <Button
                            key={index}
                            variant={selectedColor === color ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedColor(color)}
                            className={selectedColor === color 
                              ? "bg-neon-pink text-black" 
                              : "border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                            }
                          >
                            {color}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-neon-yellow text-black">
                          <Shirt size={14} className="mr-1" />
                          AUTHENTIC MERCH
                        </Badge>
                        <Badge className="bg-neon-purple text-black">
                          OFFICIAL CYBER CITY
                        </Badge>
                      </div>
                      
                      <Button 
                        onClick={() => handleAddToCart(selectedItem)}
                        disabled={!selectedSize || !selectedColor}
                        className="w-full cyber-button flex items-center gap-2 text-lg py-3"
                      >
                        <ShoppingCart size={20} />
                        ADD TO CART - ${selectedItem.price}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Quick Cart Access */}
        {getTotalItems() > 0 && (
          <Card className="holographic p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl text-neon-pink">🛒 Your Cart</h3>
              <div className="text-right">
                <p className="text-neon-cyan">{getTotalItems()} items</p>
                <p className="text-2xl font-bold text-neon-green">${getTotalPrice().toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => setIsOpen(true)}
                className="flex-1 cyber-button"
              >
                🚀 VIEW CART & CHECKOUT
              </Button>
            </div>
          </Card>
        )}

        {/* Store Info - Updated without Easy Returns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
          <Card className="holographic p-4">
            <h4 className="text-neon-green font-bold mb-2">🚀 FREE SHIPPING</h4>
            <p className="text-sm text-muted-foreground">
              Free shipping on orders over $75
            </p>
          </Card>
          <Card className="holographic p-4">
            <h4 className="text-neon-pink font-bold mb-2">⭐ PREMIUM QUALITY</h4>
            <p className="text-sm text-muted-foreground">
              High-quality materials and printing
            </p>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
