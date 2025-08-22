
import React, { useState, useCallback } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';

interface TokenSearchResult {
  symbol: string;
  name: string;
  mintAddress: string;
  logoURI?: string;
  price?: number;
  change24h?: number;
  verified?: boolean;
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

  const searchTokens = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
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
        const filteredTokens = allTokens
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

        setSearchResults(filteredTokens);
        setShowResults(true);
      } else {
        // Fallback to mock search results
        const mockResults: TokenSearchResult[] = [
          {
            symbol: query.toUpperCase(),
            name: `${query} Token`,
            mintAddress: `${query}xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,
            verified: false
          }
        ];
        setSearchResults(mockResults);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Token search error:', error);
      toast({
        title: "Search Error",
        description: "Unable to search tokens. Please try again.",
        variant: "destructive"
      });
      setSearchResults([]);
      setShowResults(false);
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

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-cyan h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => searchQuery && setShowResults(true)}
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
                {searchResults.map((token, index) => (
                  <CommandItem
                    key={`${token.mintAddress}-${index}`}
                    value={token.symbol}
                    onSelect={() => handleTokenSelect(token)}
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-neon-cyan/10 text-neon-cyan"
                  >
                    {token.logoURI ? (
                      <img 
                        src={token.logoURI} 
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-neon-purple/20 flex items-center justify-center text-xs font-bold text-neon-purple">
                        {token.symbol.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{token.symbol}</span>
                        {token.verified && (
                          <span className="text-xs bg-neon-green/20 text-neon-green px-1 rounded">✓</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {token.name}
                      </div>
                      <div className="text-xs text-neon-purple/60 font-mono truncate">
                        {token.mintAddress.slice(0, 8)}...{token.mintAddress.slice(-4)}
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
