
import React, { useState, useCallback } from 'react';
import { Search, Loader2, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface TokenSearchResult {
  symbol: string;
  name: string;
  mintAddress: string;
  logoURI?: string;
  price?: number;
  change24h?: number;
  verified?: boolean;
  marketCap?: number;
  volume24h?: number;
}

interface TokenSearchProps {
  onTokenSelect: (token: TokenSearchResult) => void;
  placeholder?: string;
  className?: string;
}

export const TokenSearch: React.FC<TokenSearchProps> = ({
  onTokenSelect,
  placeholder = "Search any Solana token...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  // Popular tokens for quick access
  const popularTokens: TokenSearchResult[] = [
    {
      symbol: 'SOL',
      name: 'Solana',
      mintAddress: 'So11111111111111111111111111111111111111112',
      verified: true,
      price: 98.76
    },
    {
      symbol: 'USDC',
      name: 'USD Coin',
      mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      verified: true,
      price: 1.00
    },
    {
      symbol: 'BONK',
      name: 'Bonk',
      mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      verified: true,
      price: 0.00001234
    }
  ];

  const searchTokens = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults(popularTokens);
      setShowResults(true);
      return;
    }

    setIsSearching(true);
    try {
      // Try Jupiter Token List API first
      const jupiterResponse = await fetch(
        `https://token.jup.ag/strict`,
        { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (jupiterResponse.ok) {
        const allTokens = await jupiterResponse.json();
        
        // Filter tokens based on search query
        let filteredTokens = allTokens
          .filter((token: any) => 
            token.symbol?.toLowerCase().includes(query.toLowerCase()) ||
            token.name?.toLowerCase().includes(query.toLowerCase()) ||
            token.address?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 10) // Limit to 10 results
          .map((token: any) => ({
            symbol: token.symbol || 'Unknown',
            name: token.name || 'Unknown Token',
            mintAddress: token.address,
            logoURI: token.logoURI,
            verified: true
          }));

        // If no results, try DexScreener search
        if (filteredTokens.length === 0) {
          try {
            const dexScreenerResponse = await fetch(
              `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`
            );
            
            if (dexScreenerResponse.ok) {
              const dexData = await dexScreenerResponse.json();
              filteredTokens = dexData.pairs
                ?.filter((pair: any) => pair.chainId === 'solana')
                .slice(0, 10)
                .map((pair: any) => ({
                  symbol: pair.baseToken.symbol,
                  name: pair.baseToken.name,
                  mintAddress: pair.baseToken.address,
                  price: parseFloat(pair.priceUsd),
                  change24h: pair.priceChange?.h24,
                  volume24h: pair.volume?.h24,
                  marketCap: pair.marketCap,
                  verified: true
                })) || [];
            }
          } catch (error) {
            console.error('DexScreener search error:', error);
          }
        }

        setSearchResults(filteredTokens);
        setShowResults(true);
      } else {
        // Fallback to popular tokens if API fails
        setSearchResults(popularTokens);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Token search error:', error);
      toast({
        title: "Search Error",
        description: "Unable to search tokens. Showing popular tokens instead.",
        variant: "destructive"
      });
      setSearchResults(popularTokens);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    
    // Debounce search
    const timeoutId = setTimeout(() => {
      searchTokens(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleTokenSelect = (token: TokenSearchResult) => {
    onTokenSelect(token);
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
    
    toast({
      title: "Token Selected",
      description: `Selected ${token.symbol} (${token.name})`,
    });
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
    return num.toFixed(2);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (searchResults.length === 0) {
              setSearchResults(popularTokens);
              setShowResults(true);
            } else {
              setShowResults(true);
            }
          }}
          className="pl-10 bg-black border-neon-cyan/50 text-neon-cyan placeholder:text-neon-cyan/50 focus:border-neon-cyan"
        />
        {isSearching && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-cyan h-4 w-4 animate-spin" />
        )}
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <Command className="rounded-lg border border-neon-cyan/30 bg-black shadow-lg">
            <CommandList className="max-h-60">
              <CommandGroup>
                {!searchQuery && (
                  <div className="px-3 py-2 text-xs text-neon-cyan/60 border-b border-neon-cyan/20">
                    Popular Tokens
                  </div>
                )}
                {searchResults.map((token, index) => (
                  <CommandItem
                    key={`${token.mintAddress}-${index}`}
                    value={token.symbol}
                    onSelect={() => handleTokenSelect(token)}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-neon-cyan/10 text-neon-cyan"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {token.logoURI ? (
                        <img 
                          src={token.logoURI} 
                          alt={token.symbol}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-sm font-bold text-neon-purple">
                          {token.symbol.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{token.symbol}</span>
                          {token.verified && (
                            <Badge variant="secondary" className="text-xs bg-neon-green/20 text-neon-green">
                              ✓
                            </Badge>
                          )}
                          {!searchQuery && (
                            <Star className="h-3 w-3 text-neon-pink" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {token.name}
                        </div>
                        <div className="text-xs text-neon-purple/60 font-mono truncate">
                          {token.mintAddress.slice(0, 8)}...{token.mintAddress.slice(-4)}
                        </div>
                      </div>
                      <div className="text-right">
                        {token.price && (
                          <div className="text-sm font-bold text-neon-cyan">
                            ${token.price < 1 ? token.price.toFixed(6) : token.price.toFixed(2)}
                          </div>
                        )}
                        {token.change24h !== undefined && (
                          <div className={`text-xs ${token.change24h >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                            {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
                          </div>
                        )}
                        {token.volume24h && (
                          <div className="text-xs text-muted-foreground">
                            Vol: ${formatNumber(token.volume24h)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}

      {showResults && searchResults.length === 0 && !isSearching && searchQuery && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1">
          <Command className="rounded-lg border border-neon-cyan/30 bg-black shadow-lg">
            <CommandEmpty className="py-6 text-center text-sm text-neon-cyan/60">
              No tokens found for "{searchQuery}"
            </CommandEmpty>
          </Command>
        </div>
      )}
    </div>
  );
};
