import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Search, RefreshCw } from 'lucide-react';
import { TokenSearch } from '@/components/TokenSearch';
import { TokenLists } from '@/components/TokenLists';
import { solanaTokenService, TokenData, TopTokensData } from '@/services/solanaTokenService';
import { useToast } from '@/hooks/use-toast';

// Mock data for token prices and charts
const mockTokensData = [
  {
    name: 'SOL',
    symbol: 'SOL',
    price: 195.42,
    change24h: 4.32,
    volume24h: 2435000000,
    marketCap: 92500000000,
    sparkline: [190, 192, 189, 195, 198, 196, 195.42]
  },
  {
    name: 'Bonk',
    symbol: 'BONK',
    price: 0.000025,
    change24h: -2.15,
    volume24h: 145000000,
    marketCap: 1650000000,
    sparkline: [0.000027, 0.000026, 0.000025, 0.000024, 0.000025, 0.000026, 0.000025]
  },
  {
    name: 'Jupiter',
    symbol: 'JUP',
    price: 0.89,
    change24h: 8.75,
    volume24h: 95000000,
    marketCap: 1200000000,
    sparkline: [0.82, 0.85, 0.87, 0.88, 0.91, 0.90, 0.89]
  },
  {
    name: 'Pyth Network',
    symbol: 'PYTH',
    price: 0.34,
    change24h: -1.22,
    volume24h: 78000000,
    marketCap: 890000000,
    sparkline: [0.35, 0.34, 0.33, 0.34, 0.35, 0.34, 0.34]
  }
];

// Generate mock chart data for different time periods
const generateChartData = (period: string, basePrice: number) => {
  const points = period === '24H' ? 24 : period === '7D' ? 7 : 30;
  const data = [];
  let currentPrice = basePrice * 0.95; // Start slightly lower
  
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.5) * basePrice * 0.05; // 5% max change
    currentPrice += change;
    
    let label;
    if (period === '24H') {
      label = `${i}:00`;
    } else if (period === '7D') {
      label = `Day ${i + 1}`;
    } else {
      label = `${i + 1}`;
    }
    
    data.push({
      time: label,
      price: Number(currentPrice.toFixed(6)),
      volume: Math.random() * 1000000
    });
  }
  
  // Ensure the last point matches current price
  data[data.length - 1].price = basePrice;
  
  return data;
};

export const SolanaDexChart = () => {
  const [selectedToken, setSelectedToken] = useState(mockTokensData[0]);
  const [selectedPeriod, setSelectedPeriod] = useState('24H');
  const [chartData, setChartData] = useState(generateChartData('24H', mockTokensData[0].price));
  const [isLoading, setIsLoading] = useState(false);
  const [topTokensData, setTopTokensData] = useState<TopTokensData>({
    topGainers: [],
    topLosers: [],
    mostViewed: [],
    trending: []
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Update chart data when token or period changes
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const newData = generateChartData(selectedPeriod, selectedToken.price);
      setChartData(newData);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedToken, selectedPeriod]);

  // Load top tokens data on mount and set up real-time updates
  useEffect(() => {
    const loadTopTokensData = async () => {
      setIsLoading(true);
      try {
        const data = await solanaTokenService.getTopTokensData();
        setTopTokensData(data);
      } catch (error) {
        console.error('Error loading top tokens data:', error);
        toast({
          title: "Data Load Error",
          description: "Failed to load token data. Using cached data.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTopTokensData();

    // Set up real-time updates
    const cleanup = solanaTokenService.startRealTimeUpdates((data) => {
      setTopTokensData(data);
    });

    return cleanup;
  }, [toast]);

  // Update data every 5 seconds with slight variations
  useEffect(() => {
    const interval = setInterval(() => {
      // Update token prices slightly
      const updatedTokens = mockTokensData.map(token => ({
        ...token,
        price: token.price * (1 + (Math.random() - 0.5) * 0.01), // 1% max change
        change24h: token.change24h + (Math.random() - 0.5) * 0.5
      }));
      
      // Update selected token if it matches
      const currentToken = updatedTokens.find(t => t.symbol === selectedToken.symbol);
      if (currentToken) {
        setSelectedToken(currentToken);
        setChartData(generateChartData(selectedPeriod, currentToken.price));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedToken, selectedPeriod]);

  const handleTokenSelect = (token: any) => {
    const newToken = {
      ...selectedToken,
      name: token.name,
      symbol: token.symbol,
      price: token.price || selectedToken.price,
      change24h: token.change24h || selectedToken.change24h,
      volume24h: token.volume24h || selectedToken.volume24h,
      marketCap: token.marketCap || selectedToken.marketCap
    };
    
    setSelectedToken(newToken);
    setChartData(generateChartData(selectedPeriod, newToken.price));
    
    toast({
      title: "Token Selected",
      description: `Now viewing ${token.symbol} - ${token.name}`,
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const data = await solanaTokenService.getTopTokensData();
      setTopTokensData(data);
      toast({
        title: "Data Refreshed",
        description: "Token data has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh token data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price < 0.001) {
      return price.toFixed(8);
    } else if (price < 1) {
      return price.toFixed(6);
    } else {
      return price.toFixed(2);
    }
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(2)}B`;
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(2)}M`;
    } else if (volume >= 1000) {
      return `$${(volume / 1000).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-3xl text-neon-cyan">
              📈 SOLANA DEX CHARTS
            </CardTitle>
            <p className="text-muted-foreground">
              Real-time price charts and trading data for Solana tokens
            </p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            variant="outline"
            className="cyber-button"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Token Search */}
        <Card className="holographic">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="text-neon-cyan" size={20} />
              <h3 className="font-bold text-neon-cyan">Search Tokens</h3>
            </div>
            <TokenSearch
              onTokenSelect={handleTokenSelect}
              placeholder="Search any Solana token..."
            />
          </CardContent>
        </Card>

        {/* Top Tokens Lists */}
        <TokenLists
          topGainers={topTokensData.topGainers}
          topLosers={topTokensData.topLosers}
          mostViewed={topTokensData.mostViewed}
          trending={topTokensData.trending}
          onTokenSelect={handleTokenSelect}
        />

        {/* Token Selection */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {mockTokensData.map((token) => (
            <Button
              key={token.symbol}
              onClick={() => setSelectedToken(token)}
              variant={selectedToken.symbol === token.symbol ? "default" : "outline"}
              className="p-4 h-auto flex flex-col items-center cyber-button"
            >
              <span className="font-bold text-sm">{token.symbol}</span>
              <span className="text-xs">${formatPrice(token.price)}</span>
              <span className={`text-xs ${token.change24h >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
              </span>
            </Button>
          ))}
        </div>

        {/* Selected Token Info */}
        <Card className="vending-machine">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-xl font-bold text-neon-cyan">${formatPrice(selectedToken.price)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">24h Change</p>
                <p className={`text-xl font-bold ${selectedToken.change24h >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                  {selectedToken.change24h >= 0 ? '+' : ''}{selectedToken.change24h.toFixed(2)}%
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-xl font-bold text-neon-purple">{formatVolume(selectedToken.volume24h)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-xl font-bold text-neon-pink">{formatVolume(selectedToken.marketCap)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart Section */}
        <Card className="holographic">
          <CardContent className="p-6">
            <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="24H" className="cyber-button">24H</TabsTrigger>
                <TabsTrigger value="7D" className="cyber-button">7D</TabsTrigger>
                <TabsTrigger value="30D" className="cyber-button">30D</TabsTrigger>
              </TabsList>
              
              <div className="h-96 w-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-neon-cyan animate-pulse">Loading chart data...</div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis 
                        dataKey="time" 
                        stroke="#00ffff"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="#00ffff"
                        fontSize={12}
                        tickFormatter={formatPrice}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          border: '1px solid #00ffff',
                          borderRadius: '8px',
                          color: '#00ffff'
                        }}
                        labelStyle={{ color: '#ff00ff' }}
                        formatter={(value: number) => [`$${formatPrice(value)}`, 'Price']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#00ffff" 
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: '#ff00ff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Trading Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="vending-machine">
            <CardContent className="p-4 text-center">
              <TrendingUp className="mx-auto mb-2 text-neon-green" size={24} />
              <p className="text-sm text-muted-foreground">Highest 24h</p>
              <p className="text-lg font-bold text-neon-green">
                ${formatPrice(selectedToken.price * 1.15)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="vending-machine">
            <CardContent className="p-4 text-center">
              <TrendingDown className="mx-auto mb-2 text-red-400" size={24} />
              <p className="text-sm text-muted-foreground">Lowest 24h</p>
              <p className="text-lg font-bold text-red-400">
                ${formatPrice(selectedToken.price * 0.85)}
              </p>
            </CardContent>
          </Card>
          
          <Card className="vending-machine">
            <CardContent className="p-4 text-center">
              <Activity className="mx-auto mb-2 text-neon-cyan" size={24} />
              <p className="text-sm text-muted-foreground">Volatility</p>
              <p className="text-lg font-bold text-neon-cyan">
                {(Math.abs(selectedToken.change24h) * 0.8).toFixed(2)}%
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
