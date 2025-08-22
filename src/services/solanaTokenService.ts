
interface TokenData {
  symbol: string;
  name: string;
  address: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  logoURI?: string;
  verified: boolean;
  views?: number;
}

interface TokenSearchResult extends TokenData {
  mintAddress: string;
}

interface TopTokensData {
  topGainers: TokenData[];
  topLosers: TokenData[];
  mostViewed: TokenData[];
  trending: TokenData[];
}

class SolanaTokenService {
  private cache = new Map<string, any>();
  private cacheExpiry = 30000; // 30 seconds

  async searchTokens(query: string): Promise<TokenSearchResult[]> {
    try {
      // Try Jupiter Token List API
      const response = await fetch('https://token.jup.ag/strict');
      if (!response.ok) throw new Error('Failed to fetch tokens');
      
      const tokens = await response.json();
      
      return tokens
        .filter((token: any) => 
          token.symbol?.toLowerCase().includes(query.toLowerCase()) ||
          token.name?.toLowerCase().includes(query.toLowerCase()) ||
          token.address?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 10)
        .map((token: any) => ({
          symbol: token.symbol || 'Unknown',
          name: token.name || 'Unknown Token',
          address: token.address,
          mintAddress: token.address,
          price: Math.random() * 100, // Mock price
          change24h: (Math.random() - 0.5) * 20,
          volume24h: Math.random() * 10000000,
          marketCap: Math.random() * 1000000000,
          logoURI: token.logoURI,
          verified: true
        }));
    } catch (error) {
      console.error('Token search error:', error);
      return [];
    }
  }

  async getTopTokensData(): Promise<TopTokensData> {
    const cacheKey = 'topTokensData';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    try {
      // Mock data - in production, you'd fetch from actual APIs
      const mockTokens: TokenData[] = [
        {
          symbol: 'SOL',
          name: 'Solana',
          address: 'So11111111111111111111111111111111111111112',
          price: 195.42,
          change24h: 8.45,
          volume24h: 2435000000,
          marketCap: 92500000000,
          verified: true,
          views: 15420
        },
        {
          symbol: 'BONK',
          name: 'Bonk',
          address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
          price: 0.000025,
          change24h: 15.32,
          volume24h: 145000000,
          marketCap: 1650000000,
          verified: true,
          views: 8950
        },
        {
          symbol: 'JUP',
          name: 'Jupiter',
          address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
          price: 0.89,
          change24h: -5.67,
          volume24h: 95000000,
          marketCap: 1200000000,
          verified: true,
          views: 7230
        },
        {
          symbol: 'PYTH',
          name: 'Pyth Network',
          address: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
          price: 0.34,
          change24h: -8.22,
          volume24h: 78000000,
          marketCap: 890000000,
          verified: true,
          views: 5640
        },
        {
          symbol: 'RAY',
          name: 'Raydium',
          address: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
          price: 4.25,
          change24h: 12.88,
          volume24h: 185000000,
          marketCap: 2100000000,
          verified: true,
          views: 9840
        }
      ];

      // Add random variations
      const updatedTokens = mockTokens.map(token => ({
        ...token,
        price: token.price * (1 + (Math.random() - 0.5) * 0.02),
        change24h: token.change24h + (Math.random() - 0.5) * 2,
        volume24h: token.volume24h * (1 + (Math.random() - 0.5) * 0.1),
        views: token.views! + Math.floor(Math.random() * 100)
      }));

      const topGainers = [...updatedTokens].sort((a, b) => b.change24h - a.change24h).slice(0, 5);
      const topLosers = [...updatedTokens].sort((a, b) => a.change24h - b.change24h).slice(0, 5);
      const mostViewed = [...updatedTokens].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
      const trending = [...updatedTokens].sort((a, b) => b.volume24h - a.volume24h).slice(0, 5);

      const data = { topGainers, topLosers, mostViewed, trending };
      
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return data;
    } catch (error) {
      console.error('Error fetching top tokens data:', error);
      return { topGainers: [], topLosers: [], mostViewed: [], trending: [] };
    }
  }

  startRealTimeUpdates(callback: (data: TopTokensData) => void) {
    const updateInterval = setInterval(async () => {
      const data = await this.getTopTokensData();
      callback(data);
    }, 10000); // Update every 10 seconds

    return () => clearInterval(updateInterval);
  }
}

export const solanaTokenService = new SolanaTokenService();
export type { TokenData, TokenSearchResult, TopTokensData };
