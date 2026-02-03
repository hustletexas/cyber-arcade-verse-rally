
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useUserBalance } from '@/hooks/useUserBalance';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletAuth } from '@/hooks/useWalletAuth';
import { useCart } from '@/contexts/CartContext';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { ShoppingCart, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

const mockNFTs = [
  // Legendary NFT
  {
    id: 1,
    name: "Legendary Arcade Pass",
    price: { cctr: 1000, xlm: 1500, usdc: 199, pyusd: 199 },
    image: "/lovable-uploads/legendary-arcade-pass.png",
    rarity: "Legendary",
    seller: "CyberCityArcade",
    description: "The ultimate Cyber City Arcade Pass with gold frame - unlocks all premium features, exclusive tournaments, and legendary rewards",
    supply: { total: 100, remaining: 87 }
  },
  // Epic NFT
  {
    id: 2,
    name: "Epic Arcade Pass",
    price: { cctr: 500, xlm: 1000, usdc: 99, pyusd: 99 },
    image: "/lovable-uploads/epic-arcade-pass.png",
    rarity: "Epic",
    seller: "CyberCityArcade",
    description: "Epic tier Cyber City Arcade Pass with purple neon frame - grants access to exclusive games and epic tournament rewards",
    supply: { total: 500, remaining: 432 }
  },
  // Rare NFT
  {
    id: 3,
    name: "Rare Arcade Pass",
    price: { cctr: 100, xlm: 500, usdc: 49, pyusd: 49 },
    image: "/lovable-uploads/rare-arcade-pass.png",
    rarity: "Rare",
    seller: "CyberCityArcade",
    description: "Rare tier Cyber City Arcade Pass with blue neon frame - unlocks special game modes and rare collectible rewards",
    supply: { total: 1000, remaining: 756 }
  },
  // Common NFT
  {
    id: 4,
    name: "Cyber City NFT",
    price: { cctr: 50, xlm: 250, usdc: 25, pyusd: 25 },
    image: "/lovable-uploads/common-arcade-nft.png",
    rarity: "Common",
    seller: "CyberCityArcade",
    description: "Standard Cyber City Arcade NFT - your entry ticket to the neon-lit world of retro gaming",
    supply: { total: 5000, remaining: 4200 }
  }
];

export const Marketplace = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const { createOrLoginWithWallet } = useWalletAuth();
  const { balance } = useUserBalance();
  const { addToCart, getTotalItems, getTotalPrice, setIsOpen } = useCart();
  const [selectedCurrency, setSelectedCurrency] = useState<'cctr' | 'xlm' | 'usdc' | 'pyusd'>('usdc');
  const [filter, setFilter] = useState('all');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'start', slidesToScroll: 1 });
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Custom autoplay implementation
  useEffect(() => {
    if (!emblaApi || !isAutoPlaying) return;
    
    autoplayIntervalRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, 3000);
    
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
      }
    };
  }, [emblaApi, isAutoPlaying]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const toggleAutoplay = useCallback(() => {
    setIsAutoPlaying(prev => !prev);
  }, []);

  const ensureAuthenticated = async (): Promise<boolean> => {
    if (user?.id) return true;

    if (!isWalletConnected || !primaryWallet?.address) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to continue",
        variant: "destructive"
      });
      return false;
    }

    toast({
      title: "Connecting wallet…",
      description: "Authenticating your wallet to proceed",
    });

    try {
      await createOrLoginWithWallet(primaryWallet.address);
      return true;
    } catch (error) {
      toast({
        title: "Authentication Failed",
        description: "Could not authenticate your wallet. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleAddToCartOrConnect = async (nft: any) => {
    // If wallet is not connected, trigger wallet connection flow
    if (!isWalletConnected) {
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to add NFTs to cart",
      });
      return;
    }

    const isAuthenticated = await ensureAuthenticated();
    if (!isAuthenticated) return;

    // Add NFT to cart with selected currency price
    const price = nft.price[selectedCurrency];
    
    addToCart({
      id: `nft-${nft.id}`,
      name: nft.name,
      price: price,
      image: nft.image,
      category: 'nft',
      selectedSize: selectedCurrency.toUpperCase(),
      selectedColor: nft.rarity
    });

    toast({
      title: "Added to Cart! 🛒",
      description: `${nft.name} added to cart for ${price} ${selectedCurrency.toUpperCase()}`,
    });
  };

  const connectPlatform = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast({
      title: `${platform} Opened!`,
      description: `Redirecting to ${platform} marketplace`,
    });
  };

  const filteredNFTs = filter === 'all' ? mockNFTs : mockNFTs.filter(nft => 
    nft.rarity.toLowerCase() === filter.toLowerCase()
  );

  const getCurrencySymbol = () => {
    switch (selectedCurrency) {
      case 'cctr': return '$CCTR';
      case 'xlm': return 'XLM';
      case 'usdc': return 'USDC';
      case 'pyusd': return 'PYUSD';
      default: return '$CCTR';
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-pink flex items-center gap-3">
          🛒 NFT SEASON PASS
          <Badge className="bg-neon-cyan text-black">STELLAR POWERED</Badge>
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
      <CardContent>
        <div className="space-y-6">
          {/* Wallet Connection Status */}
          <WalletStatusBar />

          {/* Filters and Currency Selection */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className={filter === 'all' ? 'cyber-button' : 'border-neon-cyan text-neon-cyan'}
                >
                  All
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'legendary' ? 'default' : 'outline'}
                  onClick={() => setFilter('legendary')}
                  className={filter === 'legendary' ? 'cyber-button' : 'border-neon-purple text-neon-purple'}
                >
                  Legendary
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'epic' ? 'default' : 'outline'}
                  onClick={() => setFilter('epic')}
                  className={filter === 'epic' ? 'cyber-button' : 'border-neon-pink text-neon-pink'}
                >
                  Epic
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'rare' ? 'default' : 'outline'}
                  onClick={() => setFilter('rare')}
                  className={filter === 'rare' ? 'cyber-button' : 'border-neon-green text-neon-green'}
                >
                  Rare
                </Button>
                <Button
                  size="sm"
                  variant={filter === 'common' ? 'default' : 'outline'}
                  onClick={() => setFilter('common')}
                  className={filter === 'common' ? 'cyber-button' : 'border-gray-400 text-gray-400'}
                >
                  Common
                </Button>
              </div>
            </div>

          </div>

          {/* NFT Carousel */}
          <div className="relative">
            {/* Carousel Controls */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neon-cyan">🎰 Featured NFTs</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleAutoplay}
                  className="border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20"
                >
                  {isAutoPlaying ? <Pause size={16} /> : <Play size={16} />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollPrev}
                  className="border-neon-pink/50 text-neon-pink hover:bg-neon-pink/20"
                >
                  <ChevronLeft size={20} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={scrollNext}
                  className="border-neon-pink/50 text-neon-pink hover:bg-neon-pink/20"
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>

            {/* Embla Carousel */}
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-4">
                {(filter === 'all' ? mockNFTs : mockNFTs.filter(nft => nft.rarity.toLowerCase() === filter.toLowerCase()))
                  .map((nft) => (
                  <div key={nft.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-0 first:pl-0 [perspective:1000px] h-[580px]">
                    <div className="relative mx-2 h-full [transform-style:preserve-3d] transition-transform duration-700 hover:[transform:rotateY(180deg)] cursor-pointer">
                      {/* Front of Card */}
                      <Card className="vending-machine overflow-hidden [backface-visibility:hidden] absolute inset-0">
                        <CardContent className="p-0 h-full flex flex-col">
                          <div className="h-[440px] bg-black flex items-center justify-center overflow-hidden">
                            <img 
                              src={nft.image} 
                              alt={nft.name}
                              className="max-w-full max-h-full object-contain"
                            />
                          </div>
                          <div className="p-4 space-y-2 flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-neon-cyan text-sm">{nft.name}</h3>
                              <Badge className={`text-xs ${
                                nft.rarity === 'Legendary' ? 'bg-neon-purple text-white' :
                                nft.rarity === 'Epic' ? 'bg-neon-pink text-black' :
                                nft.rarity === 'Rare' ? 'bg-neon-green text-black' :
                                'bg-gray-500 text-white'
                              }`}>
                                {nft.rarity}
                              </Badge>
                            </div>
                            <p className="text-neon-pink font-bold">
                              {nft.price[selectedCurrency]} {selectedCurrency === 'cctr' ? '$CCTR' : selectedCurrency.toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">Hover to see details →</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Back of Card */}
                      <Card className="vending-machine overflow-hidden [backface-visibility:hidden] [transform:rotateY(180deg)] h-full">
                        <CardContent className="p-4 h-full flex flex-col justify-between bg-gradient-to-br from-neon-purple/10 via-background to-neon-cyan/10">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-neon-cyan">{nft.name}</h3>
                              <Badge className={`${
                                nft.rarity === 'Legendary' ? 'bg-neon-purple text-white animate-pulse' :
                                nft.rarity === 'Epic' ? 'bg-neon-pink text-black' :
                                nft.rarity === 'Rare' ? 'bg-neon-green text-black' :
                                'bg-gray-500 text-white'
                              }`}>
                                {nft.rarity}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground">{nft.description}</p>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-neon-purple">Seller:</span>
                                <span className="text-foreground">{nft.seller}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neon-cyan">Supply:</span>
                                <span className="text-foreground">{nft.supply.remaining}/{nft.supply.total}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-neon-pink">Price:</span>
                                <span className="text-neon-green font-bold">
                                  {nft.price[selectedCurrency]} {selectedCurrency === 'cctr' ? '$CCTR' : selectedCurrency.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            onClick={() => handleAddToCartOrConnect(nft)}
                            className="w-full cyber-button mt-4"
                          >
                            {!isWalletConnected ? (
                              "🔗 CONNECT WALLET"
                            ) : (
                              <div className="flex items-center gap-2">
                                <ShoppingCart size={16} />
                                ADD TO CART
                              </div>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

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
        </div>
      </CardContent>
    </Card>
  );
};
