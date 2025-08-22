
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw, DollarSign, Volume2 } from 'lucide-react';
import { TokenSearch } from './TokenSearch';
import { TrendingTokensList } from './TrendingTokensList';
import { useToast } from '@/hooks/use-toast';

interface ChartData {
  time: string;
  price: number;
}

interface TokenData {
  symbol: string;
  name: string;
  mintAddress: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  priceHistory: ChartData[];
}

interface TopToken {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  mintAddress: string;
}

export const SolanaDexChart = () => {
  const [selectedToken, setSelectedToken] = useState<TokenData | null>(null);
  const [timeframe, setTimeframe] = useState('24h');
  const [isLoading, setIsLoading] = useState(false);
  const [topGainers, setTopGainers] = useState<TopToken[]>([]);
  const [topLosers, setTopLosers] = useState<TopToken[]>([]);
  const [mostViewed, setMostViewed] = useState<TopToken[]>([]);
  const { toast } = useToast();

  // Fetch token data from Jupiter and other APIs
  const fetchTokenData = async (mintAddress: string) => {
    setIsLoading(true);
    try {
      // Get price data from Jupiter
      const priceResponse = await fetch(
        `https://price.jup.ag/v6/price?ids=${mintAddress}`
      );
      
      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        const tokenPrice = priceData.data[mintAddress];
        
        if (tokenPrice) {
          // Generate historical data (in production, use real historical API)
          const historicalData = generateHistoricalData(tokenPrice.price);
          
          // Fetch additional market data from DexScreener
          const dexScreenerResponse = await fetch(
            `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`
          );
          
          let marketData = null;
          if (dexScreenerResponse.ok) {
            const dexData = await dexScreenerResponse.json();
            marketData = dexData.pairs?.[0];
          }
          
          const tokenData: TokenData = {
            symbol: tokenPrice.symbol || 'Unknown',
            name: tokenPrice.name || 'Unknown Token',
            mintAddress,
            price: tokenPrice.price,
            change24h: marketData?.priceChange?.h24 || 0,
            volume24h: marketData?.volume?.h24 || 0,
            marketCap: marketData?.marketCap || 0,
            priceHistory: historicalData
          };
          
          setSelectedToken(tokenData);
        }
      }
    } catch (error) {
      console.error('Error fetching token data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch token data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Generate historical price data (replace with real API in production)
  const generateHistoricalData = (currentPrice: number): ChartData[] => {
    const now = new Date();
    const data: ChartData[] = [];
    const hours = timeframe === '1h' ? 1 : timeframe === '24h' ? 24 : timeframe === '7d' ? 168 : 720;
    
    for (let i = hours; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const volatility = 0.05; // 5% volatility
      const randomChange = (Math.random() - 0.5) * volatility;
      const price = currentPrice * (1 + randomChange * (i / hours));
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: Math.max(0, price)
      });
    }
    
    return data;
  };

  // Fetch trending tokens
  const fetchTrendingTokens = async () => {
    try {
      // In production, use real trending API
      const mockTrendingData = {
        topGainers: [
          { symbol: 'BONK', name: 'Bonk', price: 0.00001234, change: 45.67, volume: 12500000, marketCap: 890000000, mintAddress: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
          { symbol: 'WIF', name: 'Dogwifhat', price: 2.34, change: 23.45, volume: 8900000, marketCap: 2340000000, mintAddress: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm' },
          { symbol: 'JUP', name: 'Jupiter', price: 0.87, change: 18.90, volume: 15600000, marketCap: 1260000000, mintAddress: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN' }
        ],
        topLosers: [
          { symbol: 'ORCA', name: 'Orca', price: 3.21, change: -12.34, volume: 4500000, marketCap: 980000000, mintAddress: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE' },
          { symbol: 'RAY', name: 'Raydium', price: 1.89, change: -8.76, volume: 7800000, marketCap: 1560000000, mintAddress: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R' },
          { symbol: 'SRM', name: 'Serum', price: 0.45, change: -15.23, volume: 2100000, marketCap: 450000000, mintAddress: 'SRMuApVNdxXokk5GT7XD5cUUgXMBCoAz2LHeuAoKWRt' }
        ],
        mostViewed: [
          { symbol: 'SOL', name: 'Solana', price: 98.76, change: 5.43, volume: 45600000, marketCap: 45000000000, mintAddress: 'So11111111111111111111111111111111111111112' },
          { symbol: 'USDC', name: 'USD Coin', price: 1.00, change: 0.01, volume: 89700000, marketCap: 32000000000, mintAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
          { symbol: 'USDT', name: 'Tether', price: 1.00, change: -0.02, volume: 156800000, marketCap: 97000000000, mintAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' }
        ]
      };
      
      setTopGainers(mockTrendingData.topGainers);
      setTopLosers(mockTrendingData.topLosers);
      setMostViewed(mockTrendingData.mostViewed);
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
    }
  };

  // Initialize with SOL data
  useEffect(() => {
    fetchTokenData('So11111111111111111111111111111111111111112'); // SOL mint address
    fetchTrendingTokens();
  }, []);

  // Update data when timeframe changes
  useEffect(() => {
    if (selectedToken) {
      fetchTokenData(selectedToken.mintAddress);
    }
  }, [timeframe]);

  const handleTokenSelect = (token: any) => {
    fetchTokenData(token.mintAddress);
  };

  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="font-display text-2xl text-neon-green">
            📊 SOLANA DEX ANALYTICS
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1H</SelectItem>
                <SelectItem value="24h">24H</SelectItem>
                <SelectItem value="7d">7D</SelectItem>
                <SelectItem value="30d">30D</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => selectedToken && fetchTokenData(selectedToken.mintAddress)} 
              variant="outline" 
              size="sm"
              className="gap-2"
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Token Search */}
        <div className="w-full">
          <TokenSearch 
            onTokenSelect={handleTokenSelect}
            placeholder="Search tokens by symbol, name, or address..."
          />
        </div>

        {selectedToken && (
          <>
            {/* Token Info Header */}
            <div className="flex items-center gap-4 p-4 bg-black/50 rounded-lg border border-neon-cyan/30">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-neon-cyan">
                  {selectedToken.symbol} / USDC
                </h3>
                <p className="text-sm text-muted-foreground">{selectedToken.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-neon-cyan">
                  ${selectedToken.price.toFixed(selectedToken.price < 1 ? 6 : 2)}
                </p>
                <p className={`text-sm font-medium ${selectedToken.change24h >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                  {selectedToken.change24h >= 0 ? '+' : ''}{selectedToken.change24h.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-black/30 rounded-lg border border-neon-purple/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Volume2 className="h-4 w-4 text-neon-purple" />
                  <p className="text-sm text-muted-foreground">24h Volume</p>
                </div>
                <p className="text-lg font-bold text-neon-purple">
                  ${formatNumber(selectedToken.volume24h)}
                </p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg border border-neon-pink/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-neon-pink" />
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                </div>
                <p className="text-lg font-bold text-neon-pink">
                  ${formatNumber(selectedToken.marketCap)}
                </p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg border border-neon-green/30">
                <p className="text-sm text-muted-foreground">24h High</p>
                <p className="text-lg font-bold text-neon-green">
                  ${(selectedToken.price * 1.05).toFixed(selectedToken.price < 1 ? 6 : 2)}
                </p>
              </div>
              <div className="text-center p-4 bg-black/30 rounded-lg border border-red-400/30">
                <p className="text-sm text-muted-foreground">24h Low</p>
                <p className="text-lg font-bold text-red-400">
                  ${(selectedToken.price * 0.95).toFixed(selectedToken.price < 1 ? 6 : 2)}
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={selectedToken.priceHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                    tickFormatter={(value) => `$${value.toFixed(selectedToken.price < 1 ? 6 : 2)}`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value: any) => [`$${value.toFixed(selectedToken.price < 1 ? 6 : 2)}`, 'Price']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#00ffff" 
                    strokeWidth={2}
                    dot={{ fill: '#00ffff', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#00ffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {/* Trending Tokens */}
        <TrendingTokensList 
          topGainers={topGainers}
          topLosers={topLosers}
          mostViewed={mostViewed}
          onTokenSelect={handleTokenSelect}
        />
      </CardContent>
    </Card>
  );
};
