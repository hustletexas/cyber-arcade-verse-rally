
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

export const Marketplace = () => {
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const nfts = [
    {
      id: '1',
      name: 'Cyber Samurai #001',
      price: 2.5,
      image: '/lovable-uploads/25b4f405-8edd-4c52-9b77-0d270d1b6c90.png',
      rarity: 'Legendary',
      category: 'Gaming NFT'
    },
    {
      id: '2',
      name: 'Neon Warrior #047',
      price: 1.8,
      image: '/lovable-uploads/114fd628-dccf-45c6-ab13-1f49fb075c47.png',
      rarity: 'Epic',
      category: 'Gaming NFT'
    },
    {
      id: '3',
      name: 'Digital Dragon #123',
      price: 3.2,
      image: '/lovable-uploads/1c936dec-1d29-4226-8876-e076e6a4d77a.png',
      rarity: 'Mythic',
      category: 'Gaming NFT'
    },
    {
      id: '4',
      name: 'Pixel Knight #089',
      price: 1.5,
      image: '/lovable-uploads/40d6a951-fd19-4d9f-b892-be71f6f300d5.png',
      rarity: 'Rare',
      category: 'Gaming NFT'
    }
  ];

  const handleAddToCart = async (nft: any) => {
    if (!user && !isWalletConnected) {
      toast({
        title: "Authentication Required",
        description: "Please connect your wallet or log in to purchase NFTs",
        variant: "destructive",
      });
      return;
    }

    setLoading(nft.id);
    
    try {
      addToCart({
        id: nft.id,
        name: nft.name,
        price: nft.price,
        image: nft.image,
        type: 'nft',
        category: nft.category
      });

      toast({
        title: "Added to Cart! 🛒",
        description: `${nft.name} added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Legendary': return 'text-neon-pink';
      case 'Mythic': return 'text-neon-purple';
      case 'Epic': return 'text-neon-cyan';
      case 'Rare': return 'text-neon-green';
      default: return 'text-muted-foreground';
    }
  };

  const isAuthenticated = user || isWalletConnected;

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan flex items-center gap-3">
          🏪 NFT MARKETPLACE
          <Badge className="bg-neon-purple text-black animate-pulse">HOT DEALS</Badge>
        </CardTitle>
        {primaryWallet && (
          <div className="text-center">
            <Badge className="bg-neon-green/20 text-neon-green border-neon-green">
              🔗 Wallet: {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}
            </Badge>
          </div>
        )}
        <p className="text-muted-foreground">
          Discover exclusive gaming NFTs and digital collectibles on the Solana blockchain
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {nfts.map((nft) => (
            <Card key={nft.id} className="vending-machine hover:scale-105 transition-all duration-300">
              <CardContent className="p-0">
                <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 overflow-hidden">
                  <img 
                    src={nft.image} 
                    alt={nft.name} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" 
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="space-y-1">
                    <h3 className="font-bold text-neon-cyan text-sm">{nft.name}</h3>
                    <Badge className={`text-xs ${getRarityColor(nft.rarity)}`} variant="outline">
                      ⭐ {nft.rarity}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-lg font-bold text-neon-green">
                      ◎ {nft.price}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      SOL
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleAddToCart(nft)}
                    disabled={loading === nft.id || !isAuthenticated}
                    className="cyber-button w-full text-xs"
                    size="sm"
                  >
                    {loading === nft.id 
                      ? "⏳ ADDING..." 
                      : !isAuthenticated 
                        ? "🔐 LOGIN TO BUY" 
                        : "🛒 ADD TO CART"
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Collections */}
        <div className="mt-12 space-y-6">
          <h3 className="font-display text-2xl text-neon-purple text-center">🔥 Featured Collections</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="holographic">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🎮</div>
                <h4 className="font-bold text-neon-cyan mb-2">Gaming Legends</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Iconic gaming characters as NFTs
                </p>
                <Badge className="bg-neon-green/20 text-neon-green">12 Available</Badge>
              </CardContent>
            </Card>

            <Card className="holographic">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h4 className="font-bold text-neon-purple mb-2">Tournament Trophies</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Commemorate your victories
                </p>
                <Badge className="bg-neon-purple/20 text-neon-purple">8 Available</Badge>
              </CardContent>
            </Card>

            <Card className="holographic">
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🎨</div>
                <h4 className="font-bold text-neon-pink mb-2">Pixel Art</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Retro-inspired digital art
                </p>
                <Badge className="bg-neon-pink/20 text-neon-pink">15 Available</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {!isAuthenticated && (
          <Card className="arcade-frame border-neon-pink/30 mt-8">
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-neon-pink mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-4">
                Connect your Solana wallet to browse and purchase exclusive NFTs
              </p>
              <Button className="cyber-button" disabled>
                🚀 Connect Wallet to Shop
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
