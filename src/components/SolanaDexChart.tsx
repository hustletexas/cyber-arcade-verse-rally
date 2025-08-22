import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Activity, RefreshCw, DollarSign, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TokenData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume: number;
}

interface ChartData {
  time: string;
  price: number;
}

// Mock data for chart
const mockChartData: ChartData[] = [
  { time: '00:00', price: 94.50 },
  { time: '01:00', price: 94.75 },
  { time: '02:00', price: 95.10 },
  { time: '03:00', price: 94.90 },
  { time: '04:00', price: 95.20 },
  { time: '05:00', price: 95.42 },
  { time: '06:00', price: 95.30 },
  { time: '07:00', price: 95.50 },
  { time: '08:00', price: 95.75 },
  { time: '09:00', price: 96.00 },
  { time: '10:00', price: 95.80 },
  { time: '11:00', price: 95.90 },
  { time: '12:00', price: 96.10 },
  { time: '13:00', price: 96.20 },
  { time: '14:00', price: 96.30 },
  { time: '15:00', price: 96.15 },
  { time: '16:00', price: 96.40 },
  { time: '17:00', price: 96.50 },
  { time: '18:00', price: 96.30 },
  { time: '19:00', price: 96.00 },
  { time: '20:00', price: 95.80 },
  { time: '21:00', price: 95.60 },
  { time: '22:00', price: 95.50 },
  { time: '23:00', price: 95.40 },
];

// Mock data for top tokens
const mockTopTokensData = [
  { symbol: 'SOL', name: 'Solana', price: 95.42, change24h: 5.23, volume: 2500000000 },
  { symbol: 'RAY', name: 'Raydium', price: 3.45, change24h: -2.15, volume: 150000000 },
  { symbol: 'SRM', name: 'Serum', price: 0.89, change24h: 8.42, volume: 75000000 },
  { symbol: 'ORCA', name: 'Orca', price: 4.56, change24h: 3.78, volume: 45000000 },
  { symbol: 'STEP', name: 'Step Finance', price: 0.12, change24h: -1.23, volume: 25000000 }
];

export const SolanaDexChart = () => {
  const { toast } = useToast();
  const [chartData, setChartData] = useState<ChartData[]>(mockChartData);
  const [topTokens, setTopTokens] = useState<TokenData[]>(mockTopTokensData);
  const [isLoading, setIsLoading] = useState(false);

  const getRandomPriceChange = useCallback(() => {
    const change = (Math.random() - 0.5) * 0.5; // Random change between -0.5 and 0.5
    return change;
  }, []);

  const updateMockData = useCallback(() => {
    const newChartData = chartData.map(item => ({
      ...item,
      price: item.price + getRandomPriceChange()
    }));

    const newTopTokens = topTokens.map(token => ({
      ...token,
      price: token.price + getRandomPriceChange(),
      change24h: token.change24h + getRandomPriceChange()
    }));

    setChartData(newChartData);
    setTopTokens(newTopTokens);
  }, [chartData, getRandomPriceChange, topTokens]);

  useEffect(() => {
    const intervalId = setInterval(updateMockData, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [updateMockData]);

  const handleRefreshData = () => {
    setIsLoading(true);
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest Solana DEX data...",
    });

    setTimeout(() => {
      setIsLoading(false);
      updateMockData();
      toast({
        title: "Data Refreshed",
        description: "Solana DEX data has been updated.",
      });
    }, 2000);
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-neon-green">
          <BarChart3 className="mr-2 inline-block h-5 w-5" />
          Solana DEX Real-Time Chart
        </CardTitle>
        <p className="text-muted-foreground">Live Solana DEX data and top tokens.</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="time" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{ background: '#222', color: '#fff', border: 'none' }}
                itemStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="price" stroke="#61E294" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neon-cyan">Top Solana Tokens</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isLoading}
            className="cyber-button"
          >
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-2 text-sm font-medium text-neon-purple">Symbol</th>
                <th className="px-4 py-2 text-sm font-medium text-neon-purple">Name</th>
                <th className="px-4 py-2 text-sm font-medium text-neon-purple">Price</th>
                <th className="px-4 py-2 text-sm font-medium text-neon-purple">24h Change</th>
                <th className="px-4 py-2 text-sm font-medium text-neon-purple">Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {topTokens.map((token) => (
                <tr key={token.symbol}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-neon-cyan">{token.symbol}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-neon-cyan">{token.name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-neon-cyan">
                    <DollarSign className="mr-1 inline-block h-4 w-4" />
                    {token.price.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-neon-cyan">
                    <Badge
                      className={token.change24h >= 0 ? "bg-green-800 text-green-500" : "bg-red-800 text-red-500"}
                    >
                      {token.change24h >= 0 ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
                      {token.change24h.toFixed(2)}%
                    </Badge>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-neon-cyan">
                    <Activity className="mr-1 inline-block h-4 w-4" />
                    {token.volume.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
