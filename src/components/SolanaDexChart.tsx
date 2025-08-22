import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, BarChart3, RefreshCw } from 'lucide-react';

interface ChartData {
  time: string;
  price: number;
}

interface TopToken {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
}

interface TopTokensData {
  topGainers: TopToken[];
  topLosers: TopToken[];
  mostViewed: TopToken[];
}

const generateMockData = (): ChartData[] => {
  const now = new Date();
  const data: ChartData[] = [];
  for (let i = 0; i < 24; i++) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const price = Math.random() * 5 + 95;
    data.push({ time, price });
  }
  return data.reverse();
};

const mockTopTokensData = {
  topGainers: [
    { symbol: 'BONK', name: 'Bonk', price: 0.00001234, change: 45.67, volume: 12500000 },
    { symbol: 'WIF', name: 'Dogwifhat', price: 2.34, change: 23.45, volume: 8900000 },
    { symbol: 'JUP', name: 'Jupiter', price: 0.87, change: 18.90, volume: 15600000 }
  ],
  topLosers: [
    { symbol: 'ORCA', name: 'Orca', price: 3.21, change: -12.34, volume: 4500000 },
    { symbol: 'RAY', name: 'Raydium', price: 1.89, change: -8.76, volume: 7800000 },
    { symbol: 'SRM', name: 'Serum', price: 0.45, change: -15.23, volume: 2100000 }
  ],
  mostViewed: [
    { symbol: 'SOL', name: 'Solana', price: 98.76, change: 5.43, volume: 45600000 },
    { symbol: 'USDC', name: 'USD Coin', price: 1.00, change: 0.01, volume: 89700000 },
    { symbol: 'USDT', name: 'Tether', price: 1.00, change: -0.02, volume: 156800000 }
  ]
};

export const SolanaDexChart = () => {
  const [data, setData] = useState<ChartData[]>(generateMockData());
  const [selectedToken, setSelectedToken] = useState('SOL');
  const [timeframe, setTimeframe] = useState('24h');
  const [currentPrice, setCurrentPrice] = useState(100.00);
  const [priceChange, setPriceChange] = useState(2.50);
  const [volume, setVolume] = useState(1000000);
  const [marketCap, setMarketCap] = useState(50000000);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(generateMockData());
      setCurrentPrice(Math.random() * 5 + 95);
      setPriceChange(Math.random() * 5 - 2.5);
      setVolume(Math.floor(Math.random() * 10000000));
      setMarketCap(Math.floor(Math.random() * 100000000));
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  
  return (
    <Card className="arcade-frame">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="font-display text-2xl text-neon-green">
            📊 SOLANA DEX ANALYTICS
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOL">SOL/USDC</SelectItem>
                <SelectItem value="RAY">RAY/USDC</SelectItem>
                <SelectItem value="ORCA">ORCA/USDC</SelectItem>
                <SelectItem value="SRM">SRM/USDC</SelectItem>
              </SelectContent>
            </Select>
            
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
              onClick={() => setData(generateMockData())} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Price Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Current Price</p>
            <p className="text-2xl font-bold text-neon-cyan">${currentPrice}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">24h Change</p>
            <p className={`text-2xl font-bold ${priceChange >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Volume</p>
            <p className="text-2xl font-bold text-neon-purple">${volume.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Market Cap</p>
            <p className="text-2xl font-bold text-neon-pink">${marketCap}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="time" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => [`$${value}`, 'Price']}
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

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Gainers */}
          <Card className="vending-machine">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-neon-green flex items-center gap-2">
                <TrendingUp size={20} />
                Top Gainers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockTopTokensData.topGainers.map((token) => (
                <div key={token.symbol} className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">${token.price}</p>
                  </div>
                  <Badge className="bg-neon-green/20 text-neon-green">
                    +{token.change}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card className="vending-machine">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-400 flex items-center gap-2">
                <TrendingDown size={20} />
                Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockTopTokensData.topLosers.map((token) => (
                <div key={token.symbol} className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">${token.price}</p>
                  </div>
                  <Badge className="bg-red-400/20 text-red-400">
                    {token.change}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Most Viewed */}
          <Card className="vending-machine">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-neon-cyan flex items-center gap-2">
                <BarChart3 size={20} />
                Most Viewed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockTopTokensData.mostViewed.map((token) => (
                <div key={token.symbol} className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-sm">{token.symbol}</p>
                    <p className="text-xs text-muted-foreground">${token.price}</p>
                  </div>
                  <Badge className={`${token.change >= 0 ? 'bg-neon-green/20 text-neon-green' : 'bg-red-400/20 text-red-400'}`}>
                    {token.change >= 0 ? '+' : ''}{token.change}%
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
