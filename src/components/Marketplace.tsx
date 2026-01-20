
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
import { ShoppingCart, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import useEmblaCarousel from 'embla-carousel-react';

const mockNFTs = [
  // Legendary NFTs
  {
    id: 1,
    name: "Retro Future Ride",
    price: { cctr: 1000, sol: 1.75, usdc: 157, pyusd: 157 },
    image: "/lovable-uploads/1131ab8a-f1c5-43a1-bc8a-bbbe7f2f9fd1.png",
    rarity: "Legendary",
    seller: "CyberMotors",
    description: "Ultra-rare cyberpunk DeLorean in neon cityscape - the ultimate collector's ride",
    supply: { total: 100, remaining: 87 }
  },
  {
    id: 2,
    name: "Cyber City Console",
    price: { cctr: 1000, sol: 2.1, usdc: 189, pyusd: 189 },
    image: "/lovable-uploads/adc51b6f-7d82-44cc-86b5-e984bc74d2d3.png",
    rarity: "Legendary",
    seller: "ArcadeMaster",
    description: "Ultimate cyberpunk arcade console with holographic city display - grants access to all premium games",
    supply: { total: 100, remaining: 94 }
  },
  {
    id: 3,
    name: "Cyber City Arcade",
    price: { cctr: 1000, sol: 2.5, usdc: 225, pyusd: 225 },
    image: "/lovable-uploads/25b4f405-8edd-4c52-9b77-0d270d1b6c90.png",
    rarity: "Legendary",
    seller: "RetroMaster",
    description: "Iconic Cyber City arcade building with neon signage - the heart of the digital gaming universe",
    supply: { total: 100, remaining: 76 }
  },
  // Epic NFTs
  {
    id: 4,
    name: "Solana Arcade Champion",
    price: { cctr: 500, sol: 1.4, usdc: 126, pyusd: 126 },
    image: "/lovable-uploads/ad465959-8a2b-40c4-bb3d-512e3b2246dc.png",
    rarity: "Epic",
    seller: "SolanaGaming",
    description: "Elite cyberpunk gamer with VR headset exploring the neon-lit Solana blockchain arcade district",
    supply: { total: 500, remaining: 432 }
  },
  {
    id: 5,
    name: "Neon Arcade Portal",
    price: { cctr: 500, sol: 1.6, usdc: 144, pyusd: 144 },
    image: "/lovable-uploads/f7fdd876-ef2a-4140-9a9e-961af057b14c.png",
    rarity: "Epic",
    seller: "PortalMaster",
    description: "Mystical arcade portal gateway to the digital realm - witness the birth of virtual reality gaming",
    supply: { total: 500, remaining: 378 }
  },
  {
    id: 6,
    name: "Cyber City Genesis #001",
    price: { cctr: 500, sol: 2.0, usdc: 180, pyusd: 180 },
    image: "/lovable-uploads/e0346804-3303-4132-accf-7a80c53b7b8c.png",
    rarity: "Epic",
    seller: "GenesisCollection",
    description: "Genesis edition arcade cabinet from the original Cyber City collection - limited first edition piece",
    supply: { total: 500, remaining: 445 }
  },
  // Rare NFTs
  {
    id: 7,
    name: "Cyber City Mobile Gamer",
    price: { cctr: 100, sol: 0.9, usdc: 81, pyusd: 81 },
    image: "/lovable-uploads/fa16ab59-6385-4247-ac77-1ef0cf685f60.png",
    rarity: "Rare",
    seller: "MobileGamingCorp",
    description: "Cyberpunk mobile gamer with alien tech device - the future of portable gaming in neon cityscapes",
    supply: { total: 1000, remaining: 756 }
  },
  {
    id: 8,
    name: "VR Racing Champion",
    price: { cctr: 100, sol: 1.1, usdc: 99, pyusd: 99 },
    image: "/lovable-uploads/7aefc14a-b1ec-4889-8990-4f12e95eec7d.png",
    rarity: "Rare",
    seller: "VRRacingLeague",
    description: "Professional VR racing simulator setup with cyberpunk aesthetic - experience the ultimate driving simulation",
    supply: { total: 1000, remaining: 823 }
  },
  {
    id: 9,
    name: "Cyber City Arcade Gamer",
    price: { cctr: 100, sol: 1.0, usdc: 90, pyusd: 90 },
    image: "/lovable-uploads/499520d8-632b-415d-9e5a-5599ef4eca14.png",
    rarity: "Rare",
    seller: "CyberCityElite",
    description: "Elite cyberpunk gamer with advanced neural interface - master of the Cyber City Arcade realm",
    supply: { total: 1000, remaining: 667 }
  }
];

export const Marketplace = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const { createOrLoginWithWallet } = useWalletAuth();
  const { balance } = useUserBalance();
  const { addToCart, getTotalItems, getTotalPrice, setIsOpen } = useCart();
  const [selectedCurrency, setSelectedCurrency] = useState<'cctr' | 'sol' | 'usdc' | 'pyusd'>('cctr');
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
      case 'sol': return 'SOL';
      case 'usdc': return 'USDC';
      case 'pyusd': return 'PYUSD';
      default: return '$CCTR';
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-pink flex items-center gap-3">
          🛒 NFT MARKETPLACE
          <Badge className="bg-neon-cyan text-black">SOLANA POWERED</Badge>
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
          {/* Platform Connections */}
          <Card className="holographic p-6">
            <h3 className="font-bold text-neon-cyan mb-4">🔗 Platform Connections</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button 
                onClick={() => connectPlatform('Magic Eden', 'https://magiceden.io/')}
                className="cyber-button flex items-center justify-center gap-2 hover-scale hover:shadow-lg hover:shadow-neon-pink/30 transition-all duration-300 w-full py-3"
              >
                🪄 Magic Eden
              </Button>
              <Button 
                onClick={() => connectPlatform('OpenSea', 'https://opensea.io/')}
                className="cyber-button flex items-center justify-center gap-2 hover-scale hover:shadow-lg hover:shadow-neon-cyan/30 transition-all duration-300 w-full py-3"
              >
                🌊 OpenSea
              </Button>
              <Button 
                onClick={() => connectPlatform('Litemint', 'https://market.litemint.com/')}
                className="cyber-button flex items-center justify-center gap-2 hover-scale hover:shadow-lg hover:shadow-neon-green/30 transition-all duration-300 w-full py-3"
              >
                🍃 Litemint
              </Button>
            </div>
          </Card>

          {/* Wallet Status */}
          {isWalletConnected && primaryWallet && (
            <Card className="vending-machine p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-neon-green text-black">
                    CONNECTED
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
                  </span>
                </div>
                <div className="text-sm text-neon-cyan">
                  {selectedCurrency === 'cctr' && `${balance.cctr_balance} $CCTR`}
                </div>
              </div>
            </Card>
          )}

          {/* Filters and Currency Selection */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
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
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neon-cyan font-bold">Pay with:</span>
              <Select value={selectedCurrency} onValueChange={(value: 'cctr' | 'sol' | 'usdc' | 'pyusd') => setSelectedCurrency(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sol">☀️ SOL</SelectItem>
                  <SelectItem value="usdc">💵 USDC</SelectItem>
                  <SelectItem value="pyusd">💰 PYUSD</SelectItem>
                  <SelectItem value="cctr">💎 $CCTR</SelectItem>
                </SelectContent>
              </Select>
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
                  <div key={nft.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-0 first:pl-0 [perspective:1000px] h-[480px]">
                    <div className="relative mx-2 h-full [transform-style:preserve-3d] transition-transform duration-700 hover:[transform:rotateY(180deg)] cursor-pointer">
                      {/* Front of Card */}
                      <Card className="vending-machine overflow-hidden [backface-visibility:hidden] absolute inset-0">
                        <CardContent className="p-0 h-full flex flex-col">
                          <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center overflow-hidden">
                            <img 
                              src={nft.image} 
                              alt={nft.name}
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                          <div className="p-4 space-y-2 flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-neon-cyan text-sm">{nft.name}</h3>
                              <Badge className={`text-xs ${
                                nft.rarity === 'Legendary' ? 'bg-neon-purple text-white' :
                                nft.rarity === 'Epic' ? 'bg-neon-pink text-black' :
                                'bg-neon-green text-black'
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
                                'bg-neon-green text-black'
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
