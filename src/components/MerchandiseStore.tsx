
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Shirt } from 'lucide-react';

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
    name: 'Cyber City Arcade Official T-Shirt',
    price: 32.99,
    image: 'photo-1618160702438-9b02ab6515c9',
    category: 'shirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Cyber Black', 'Neon Cyan', 'Electric Purple'],
    description: 'Official Cyber City Arcade tee with glowing logo and circuit board sleeve design'
  },
  {
    id: '2',
    name: 'Cyber City Arcade Gaming Hoodie',
    price: 67.99,
    image: 'photo-1721322800607-8c38375eef04',
    category: 'hoodie',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Matrix Black', 'Neon Green', 'Cyber Blue'],
    description: 'Premium hoodie featuring the iconic Cyber City logo with holographic hood lining'
  },
  {
    id: '3',
    name: 'Cyber City Arcade Varsity Jacket',
    price: 94.99,
    image: 'photo-1582562124811-c09040d0a901',
    category: 'jacket',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Midnight Black', 'Neon Pink Trim', 'Cyan Accent'],
    description: 'Limited edition varsity jacket with embroidered Cyber City logo and LED accent strips'
  },
  {
    id: '4',
    name: 'Cyber City Arcade Player Tee',
    price: 28.99,
    image: 'photo-1618160702438-9b02ab6515c9',
    category: 'shirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Retro White', 'Arcade Black', 'Neon Yellow'],
    description: 'Classic player tee with vintage Cyber City Arcade logo and "LEVEL UP" back print'
  },
  {
    id: '5',
    name: 'Cyber City Arcade Tech Hoodie',
    price: 72.99,
    image: 'photo-1721322800607-8c38375eef04',
    category: 'hoodie',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Tech Gray', 'Matrix Green', 'Cyber Purple'],
    description: 'Tech-wear inspired hoodie with QR code patterns and reflective Cyber City branding'
  },
  {
    id: '6',
    name: 'Cyber City Arcade Champion Jacket',
    price: 109.99,
    image: 'photo-1582562124811-c09040d0a901',
    category: 'jacket',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Champion Black', 'Gold Neon', 'Silver Chrome'],
    description: 'Elite champion jacket with premium Cyber City logo embroidery and tournament badges'
  }
];

export const MerchandiseStore = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{[key: string]: number}>({});

  const categories = [
    { value: 'all', label: '🎮 ALL ITEMS', icon: '🎮' },
    { value: 'shirt', label: '👕 TEES', icon: '👕' },
    { value: 'hoodie', label: '🧥 HOODIES', icon: '🧥' },
    { value: 'jacket', label: '🧥 JACKETS', icon: '🧥' }
  ];

  const filteredItems = selectedCategory === 'all' 
    ? merchandiseItems 
    : merchandiseItems.filter(item => item.category === selectedCategory);

  const addToCart = (itemId: string, itemName: string) => {
    setCart(prev => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
    toast({
      title: "Added to Cart! 🛒",
      description: `${itemName} has been added to your cart`,
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, count) => sum + count, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((total, [itemId, count]) => {
      const item = merchandiseItems.find(i => i.id === itemId);
      return total + (item ? item.price * count : 0);
    }, 0);
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-green flex items-center gap-3">
          🎮 CYBER CITY ARCADE STORE
          <Badge className="bg-neon-pink text-black">OFFICIAL MERCH</Badge>
          {getTotalItems() > 0 && (
            <Badge className="bg-neon-cyan text-black ml-auto">
              <ShoppingCart size={16} className="mr-1" />
              {getTotalItems()} items - ${getTotalPrice().toFixed(2)}
            </Badge>
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
                  src={`https://images.unsplash.com/${item.image}?w=400&h=300&fit=crop`}
                  alt={item.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <Badge className="absolute top-2 right-2 bg-neon-purple text-black">
                  CYBER CITY
                </Badge>
              </div>
              <CardContent className="p-4 space-y-4">
                <div>
                  <h3 className="font-bold text-neon-cyan text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-neon-green">${item.price}</span>
                  <Badge className="bg-neon-yellow text-black">
                    <Shirt size={14} className="mr-1" />
                    OFFICIAL
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-neon-purple font-bold">CYBER COLORS:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.colors.map((color, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-neon-pink text-neon-pink">
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-neon-cyan font-bold">PLAYER SIZES:</p>
                  <div className="flex flex-wrap gap-1">
                    {item.sizes.map((size, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-neon-green text-neon-green">
                        {size}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => addToCart(item.id, item.name)}
                  className="w-full cyber-button flex items-center gap-2"
                >
                  <ShoppingCart size={16} />
                  ADD TO CART
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Cart Summary */}
        {getTotalItems() > 0 && (
          <Card className="holographic p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-xl text-neon-pink">🛒 Your Cyber Cart</h3>
              <div className="text-right">
                <p className="text-neon-cyan">{getTotalItems()} items</p>
                <p className="text-2xl font-bold text-neon-green">${getTotalPrice().toFixed(2)}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button className="flex-1 cyber-button">
                🚀 PROCEED TO CHECKOUT
              </Button>
              <Button 
                variant="outline" 
                className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                onClick={() => setCart({})}
              >
                🗑️ CLEAR CART
              </Button>
            </div>
          </Card>
        )}

        {/* Store Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <Card className="holographic p-4">
            <h4 className="text-neon-green font-bold mb-2">🚀 FREE SHIPPING</h4>
            <p className="text-sm text-muted-foreground">
              Free worldwide shipping on orders over $50
            </p>
          </Card>
          <Card className="holographic p-4">
            <h4 className="text-neon-cyan font-bold mb-2">🔄 EASY RETURNS</h4>
            <p className="text-sm text-muted-foreground">
              30-day return policy for all official merch
            </p>
          </Card>
          <Card className="holographic p-4">
            <h4 className="text-neon-pink font-bold mb-2">⭐ AUTHENTIC GEAR</h4>
            <p className="text-sm text-muted-foreground">
              Official Cyber City Arcade merchandise only
            </p>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
