import React, { useState, useCallback } from 'react';
import { Search, Loader2, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';

interface TokenSearchResult {
  symbol: string;
  name: string;
  assetCode: string;
  issuer: string;
  domain?: string;
  logoURI?: string;
  verified?: boolean;
}

interface TokenSearchProps {
  onTokenSelect: (token: TokenSearchResult) => void;
  placeholder?: string;
  className?: string;
}

// Popular Stellar assets for quick access
const POPULAR_STELLAR_ASSETS: TokenSearchResult[] = [
  { symbol: 'XLM', name: 'Stellar Lumens', assetCode: 'XLM', issuer: 'native', verified: true },
  { symbol: 'USDC', name: 'USD Coin', assetCode: 'USDC', issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN', domain: 'centre.io', verified: true },
  { symbol: 'yXLM', name: 'Ultra Stellar', assetCode: 'yXLM', issuer: 'GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55', domain: 'ultrastellar.com', verified: true },
  { symbol: 'AQUA', name: 'Aquarius', assetCode: 'AQUA', issuer: 'GBNZILSTVQZ4R7IKQDGHYGY2QXL5QOFJYQMXPKWRRM5PAV7Y4M67AQUA', domain: 'aqua.network', verified: true },
  { symbol: 'SHX', name: 'Stronghold', assetCode: 'SHX', issuer: 'GDSTRSHXHGJ7ZIVRBXEYE5Q74XUVCUSEZ6JQFMXQVCYCQER52FZ42T7V', domain: 'stronghold.co', verified: true },
  { symbol: 'PYUSD', name: 'PayPal USD', assetCode: 'PYUSD', issuer: 'GCNY5OXYSY4FKHOPT2SPOQZAOEIGXB5LBYW3HVU3OWSTQITS65M5RCNY', domain: 'paxos.com', verified: true },
];

export const TokenSearch: React.FC<TokenSearchProps> = ({
  onTokenSelect,
  placeholder = "Search any Stellar token...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const searchTokens = useCallback(async (query: string) => {
    if (!query || query.length < 1) {
      setSearchResults(POPULAR_STELLAR_ASSETS);
      setShowResults(true);
      return;
    }

    setIsSearching(true);
    try {
      // Search StellarExpert API for assets
      const response = await fetch(
        `https://api.stellar.expert/explorer/public/asset?search=${encodeURIComponent(query)}&limit=15`,
        { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        const filteredTokens: TokenSearchResult[] = data._embedded?.records?.map((asset: any) => ({
          symbol: asset.asset_code || 'XLM',
          name: asset.domain || asset.asset_code || 'Unknown Token',
          assetCode: asset.asset_code || 'XLM',
          issuer: asset.asset_issuer || 'native',
          domain: asset.domain,
          logoURI: asset.toml_info?.image,
          verified: asset.rating?.average > 3 || asset.payments > 1000
        })) || [];

        // Also filter popular assets by query
        const matchingPopular = POPULAR_STELLAR_ASSETS.filter(
          asset => 
            asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
            asset.name.toLowerCase().includes(query.toLowerCase())
        );

        // Combine and deduplicate
        const combined = [...matchingPopular, ...filteredTokens];
        const unique = combined.filter((asset, index, self) =>
          index === self.findIndex(a => a.assetCode === asset.assetCode && a.issuer === asset.issuer)
        );

        setSearchResults(unique.slice(0, 12));
        setShowResults(true);
      } else {
        // Fallback to filtering popular assets
        const filtered = POPULAR_STELLAR_ASSETS.filter(
          asset => 
            asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
            asset.name.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Stellar token search error:', error);
      // Fallback to popular assets on error
      const filtered = POPULAR_STELLAR_ASSETS.filter(
        asset => 
          asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
          asset.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered.length > 0 ? filtered : POPULAR_STELLAR_ASSETS);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

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

  const handleFocus = () => {
    if (searchQuery) {
      setShowResults(true);
    } else {
      setSearchResults(POPULAR_STELLAR_ASSETS);
      setShowResults(true);
    }
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
          onFocus={handleFocus}
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
              <CommandGroup heading={searchQuery ? "Search Results" : "Popular Stellar Assets"}>
                {searchResults.map((token, index) => (
                  <CommandItem
                    key={`${token.assetCode}-${token.issuer}-${index}`}
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
                          <Star className="w-3 h-3 text-neon-green fill-neon-green" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {token.name}
                      </div>
                      {token.domain && (
                        <div className="text-xs text-neon-purple/60 truncate">
                          {token.domain}
                        </div>
                      )}
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
              No Stellar tokens found for "{searchQuery}"
            </CommandEmpty>
          </Command>
        </div>
      )}
    </div>
  );
};
