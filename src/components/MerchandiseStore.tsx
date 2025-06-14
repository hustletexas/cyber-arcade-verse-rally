
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
    name: 'Cyber City Arcade Classic Logo Tee',
    price: 19.99,
    image: 'photo-1618160702438-9b02ab6515c9',
    category: 'shirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Black', 'Dark Navy', 'Charcoal Gray'],
    description: 'Premium cotton tee featuring the iconic Cyber City Arcade logo in vibrant neon colors'
  },
  {
    id: '2',
    name: 'Cyber City Arcade Retro Gaming Shirt',
    price: 19.99,
    image: 'photo-1618160702438-9b02ab6515c9',
    category: 'shirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Vintage Black', 'Midnight Blue', 'Forest Green'],
    description: 'Retro-style gaming shirt with distressed Cyber City logo and vintage arcade graphics'
  },
  {
    id: '3',
    name: 'Cyber City Arcade Neon Streets Tee',
    price: 19.99,
    image: 'photo-1618160702438-9b02ab6515c9',
    category: 'shirt',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Jet Black', 'Electric Blue', 'Cyber Purple'],
    description: 'Cyberpunk-inspired design featuring neon street aesthetics and the Cyber City logo'
  },
  {
    id: '4',
    name: 'Cyber City Arcade Official Hoodie',
    price: 49.99,
    image: 'photo-1721322800607-8c38375eef04',
    category: 'hoodie',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Stealth Black', 'Carbon Gray', 'Deep Navy'],
    description: 'Premium fleece hoodie with embroidered Cyber City logo and kangaroo pocket'
  },
  {
    id: '5',
    name: 'Cyber City Arcade Gaming Hoodie',
    price: 49.99,
    image: 'photo-1721322800607-8c38375eef04',
    category: 'hoodie',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Matrix Black', 'Cyber Green', 'Neon Blue'],
    description: 'Cozy gaming hoodie perfect for long arcade sessions, featuring premium materials'
  },
  {
    id: '6',
    name: 'Cyber City Arcade Varsity Jacket',
    price: 89.99,
    image: 'photo-1582562124811-c09040d0a901',
    category: 'jacket',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Classic Black/White', 'Navy/Silver', 'Black/Neon Green'],
    description: 'Premium varsity jacket with embroidered patches and leather sleeves'
  },
  {
    id: '7',
    name: 'Cyber City Arcade Tech Jacket',
    price: 89.99,
    image: 'photo-1582562124811-c09040d0a901',
    category: 'jacket',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Cyberpunk Black', 'Tech Gray', 'Future Blue'],
    description: 'Water-resistant tech jacket with reflective details and multiple pockets'
  },
  {
    id: '8',
    name: 'Cyber City Arcade Bomber Jacket',
    price: 89.99,
    image: 'photo-1582562124811-c09040d0a901',
    category: 'jacket',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Stealth Black', 'Olive Drab', 'Metallic Silver'],
    description: 'Classic bomber style with Cyber City patches and premium satin lining'
  }
];

export const MerchandiseStore = () => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{[key: string]: number}>({});

  const categories = [
    { value: 'all', label: '🎮 ALL ITEMS', icon: '🎮' },
    { value: 'shirt', label: '👕 T-SHIRTS', icon: '👕' },
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
          🎮 CYBER CITY ARCADE OFFICIAL STORE
          <Badge className="bg-neon-pink text-black">AUTHENTIC MERCH</Badge>
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
                  OFFICIAL
                </Badge>
                <Badge className="absolute top-2 left-2 bg-neon-green text-black font-bold">
                  ${item.price}
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
              <h3 className="font-display text-xl text-neon-pink">🛒 Your Cart</h3>
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
              Free shipping on orders over $75
            </p>
          </Card>
          <Card className="holographic p-4">
            <h4 className="text-neon-cyan font-bold mb-2">🔄 EASY RETURNS</h4>
            <p className="text-sm text-muted-foreground">
              30-day return policy on all items
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
