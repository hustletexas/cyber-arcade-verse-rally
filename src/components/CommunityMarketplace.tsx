
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { Search, Plus, MessageCircle, Star, Filter, ShoppingCart, User, Calendar } from 'lucide-react';

interface MarketplaceListing {
  id: number;
  seller: string;
  sellerAddress: string;
  title: string;
  description: string;
  price: number;
  currency: 'cctr' | 'sol' | 'usdc';
  category: string;
  image: string;
  condition: 'new' | 'like-new' | 'good' | 'fair';
  rating: number;
  reviews: number;
  listedDate: string;
  featured: boolean;
}

const mockListings: MarketplaceListing[] = [
  {
    id: 1,
    seller: "CyberGamer",
    sellerAddress: "7xKX...gAsU",
    title: "Legendary Gaming Headset NFT",
    description: "Ultra-rare cyberpunk gaming headset with special audio enhancement abilities",
    price: 50,
    currency: 'cctr',
    category: 'gaming',
    image: "/lovable-uploads/114fd628-dccf-45c6-ab13-1f49fb075c47.png",
    condition: 'new',
    rating: 4.9,
    reviews: 23,
    listedDate: "2024-01-15",
    featured: true
  },
  {
    id: 2,
    seller: "NeonCollector",
    sellerAddress: "8yLY...hBtV",
    title: "Rare Arcade Token Collection",
    description: "Set of 10 vintage arcade tokens from different cyberpunk games",
    price: 0.25,
    currency: 'sol',
    category: 'collectibles',
    image: "/lovable-uploads/567dbfe3-1f47-49cd-8fe2-6e429df5d3ff.png",
    condition: 'like-new',
    rating: 4.7,
    reviews: 15,
    listedDate: "2024-01-14",
    featured: false
  },
  {
    id: 3,
    seller: "DigitalArtist",
    sellerAddress: "9zMZ...iCwW",
    title: "Custom Avatar Skin",
    description: "Personalized cyberpunk avatar skin with glowing neon effects",
    price: 75,
    currency: 'usdc',
    category: 'avatars',
    image: "/lovable-uploads/ad465959-8a2b-40c4-bb3d-512e3b2246dc.png",
    condition: 'new',
    rating: 5.0,
    reviews: 8,
    listedDate: "2024-01-13",
    featured: true
  },
  {
    id: 4,
    seller: "RetroMaster",
    sellerAddress: "6wKW...fDsS",
    title: "Vintage Arcade Cabinet Model",
    description: "3D model of classic arcade cabinet for virtual spaces",
    price: 120,
    currency: 'cctr',
    category: 'models',
    image: "/lovable-uploads/adc51b6f-7d82-44cc-86b5-e984bc74d2d3.png",
    condition: 'good',
    rating: 4.6,
    reviews: 31,
    listedDate: "2024-01-12",
    featured: false
  },
  {
    id: 5,
    seller: "MusicMaker",
    sellerAddress: "5vJV...eDrR",
    title: "Cyberpunk Music Pack",
    description: "Original cyberpunk soundtrack collection with usage rights",
    price: 0.15,
    currency: 'sol',
    category: 'music',
    image: "/lovable-uploads/fc54726a-fe30-47a9-8b16-766dc230e7c8.png",
    condition: 'new',
    rating: 4.8,
    reviews: 42,
    listedDate: "2024-01-11",
    featured: false
  },
  {
    id: 6,
    seller: "ProGamer",
    sellerAddress: "4uIU...cBqQ",
    title: "Tournament Victory Badge",
    description: "Exclusive badge from Cyber City Championship tournament",
    price: 200,
    currency: 'cctr',
    category: 'achievements',
    image: "/lovable-uploads/618813b4-8ef1-495f-b103-dd4f3612befb.png",
    condition: 'new',
    rating: 4.9,
    reviews: 67,
    listedDate: "2024-01-10",
    featured: true
  }
];

export const CommunityMarketplace = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { isWalletConnected, primaryWallet } = useMultiWallet();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCurrency, setSelectedCurrency] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  const categories = [
    { value: 'all', label: '🎯 All Categories' },
    { value: 'gaming', label: '🎮 Gaming Items' },
    { value: 'collectibles', label: '💎 Collectibles' },
    { value: 'avatars', label: '👾 Avatar Items' },
    { value: 'models', label: '🏗️ 3D Models' },
    { value: 'music', label: '🎵 Music & Audio' },
    { value: 'achievements', label: '🏆 Achievements' }
  ];

  const currencies = [
    { value: 'all', label: 'All Currencies' },
    { value: 'cctr', label: '$CCTR' },
    { value: 'sol', label: 'SOL' },
    { value: 'usdc', label: 'USDC' }
  ];

  const conditions = [
    { value: 'all', label: 'Any Condition' },
    { value: 'new', label: 'New' },
    { value: 'like-new', label: 'Like New' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-neon-green text-black';
      case 'like-new': return 'bg-neon-cyan text-black';
      case 'good': return 'bg-neon-purple text-white';
      case 'fair': return 'bg-neon-pink text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'cctr': return '$CCTR';
      case 'sol': return 'SOL';
      case 'usdc': return 'USDC';
      default: return currency.toUpperCase();
    }
  };

  const filteredListings = mockListings
    .filter(listing => {
      const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          listing.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || listing.category === selectedCategory;
      const matchesCurrency = selectedCurrency === 'all' || listing.currency === selectedCurrency;
      const matchesCondition = selectedCondition === 'all' || listing.condition === selectedCondition;
      const matchesFeatured = !showFeaturedOnly || listing.featured;
      
      return matchesSearch && matchesCategory && matchesCurrency && matchesCondition && matchesFeatured;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.listedDate).getTime() - new Date(a.listedDate).getTime();
        case 'oldest': return new Date(a.listedDate).getTime() - new Date(b.listedDate).getTime();
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        default: return 0;
      }
    });

  const handleContactSeller = (seller: string) => {
    toast({
      title: "Contact Seller",
      description: `Opening chat with ${seller}...`,
    });
  };

  const handleBuyNow = (listing: MarketplaceListing) => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to make purchases",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "🔄 Processing Purchase",
      description: `Buying ${listing.title} for ${listing.price} ${getCurrencySymbol(listing.currency)}`,
    });

    // Simulate purchase process
    setTimeout(() => {
      toast({
        title: "✅ Purchase Successful!",
        description: `You've successfully purchased ${listing.title}!`,
      });
    }, 2000);
  };

  const handleCreateListing = () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to create listings",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Create Listing",
      description: "Opening listing creation form...",
    });
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-pink flex items-center gap-3">
          🏪 COMMUNITY MARKETPLACE
          <Badge className="bg-neon-cyan text-black">P2P TRADING</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="flex items-center gap-2">
              <Search className="text-neon-cyan" size={20} />
              <Input
                placeholder="Search items, sellers, or collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Button
              onClick={handleCreateListing}
              className="cyber-button flex items-center gap-2"
            >
              <Plus size={16} />
              CREATE LISTING
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {currencies.map(curr => (
                  <SelectItem key={curr.value} value={curr.value}>
                    {curr.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {conditions.map(cond => (
                  <SelectItem key={cond.value} value={cond.value}>
                    {cond.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showFeaturedOnly ? "default" : "outline"}
              onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
              className={showFeaturedOnly ? "cyber-button" : "border-neon-cyan text-neon-cyan"}
            >
              ⭐ Featured
            </Button>

            <Button
              variant="outline"
              className="border-neon-purple text-neon-purple"
            >
              <Filter size={16} />
            </Button>
          </div>

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredListings.length} items found</span>
            <span>Showing results for community marketplace</span>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="vending-machine overflow-hidden hover:scale-105 transition-transform">
                <CardContent className="p-0">
                  {/* Image */}
                  <div className="aspect-square bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 flex items-center justify-center overflow-hidden relative">
                    {listing.featured && (
                      <Badge className="absolute top-2 left-2 bg-neon-pink text-black z-10">
                        ⭐ FEATURED
                      </Badge>
                    )}
                    <img 
                      src={listing.image} 
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Title & Price */}
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-neon-cyan text-sm">{listing.title}</h3>
                      <div className="text-right">
                        <div className="text-lg font-bold text-neon-green">
                          {listing.price} {getCurrencySymbol(listing.currency)}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {listing.description}
                    </p>

                    {/* Seller Info */}
                    <div className="flex items-center gap-2 text-xs">
                      <User size={12} className="text-neon-purple" />
                      <span className="text-neon-purple">{listing.seller}</span>
                      <span className="text-muted-foreground">
                        ({listing.sellerAddress})
                      </span>
                    </div>

                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-yellow-500">{listing.rating}</span>
                      </div>
                      <span className="text-muted-foreground">
                        ({listing.reviews} reviews)
                      </span>
                    </div>

                    {/* Condition & Date */}
                    <div className="flex justify-between items-center text-xs">
                      <Badge className={getConditionColor(listing.condition)}>
                        {listing.condition.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar size={12} />
                        {new Date(listing.listedDate).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleBuyNow(listing)}
                        className="flex-1 cyber-button text-xs py-2"
                      >
                        <ShoppingCart size={12} className="mr-1" />
                        BUY NOW
                      </Button>
                      <Button
                        onClick={() => handleContactSeller(listing.seller)}
                        variant="outline"
                        className="border-neon-cyan text-neon-cyan text-xs py-2"
                      >
                        <MessageCircle size={12} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredListings.length === 0 && (
            <Card className="holographic p-12 text-center">
              <h3 className="text-xl font-bold text-neon-cyan mb-4">No Items Found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search filters or browse different categories
              </p>
              <div className="flex justify-center gap-4">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                    setSelectedCurrency('all');
                    setSelectedCondition('all');
                    setShowFeaturedOnly(false);
                  }}
                  className="cyber-button"
                >
                  Clear Filters
                </Button>
                <Button
                  onClick={handleCreateListing}
                  variant="outline"
                  className="border-neon-purple text-neon-purple"
                >
                  Be the First to List
                </Button>
              </div>
            </Card>
          )}

          {/* Marketplace Stats */}
          <Card className="holographic p-6">
            <h3 className="font-display text-xl text-neon-pink mb-4">📊 Marketplace Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-neon-green">1,234</div>
                <div className="text-sm text-muted-foreground">Active Listings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neon-cyan">567</div>
                <div className="text-sm text-muted-foreground">Total Sellers</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neon-purple">89.5k</div>
                <div className="text-sm text-muted-foreground">SOL Traded</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-neon-pink">4.8/5</div>
                <div className="text-sm text-muted-foreground">Avg Rating</div>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
