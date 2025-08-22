import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TrendingUp, TrendingDown, Search, BarChart3, DollarSign, Activity } from 'lucide-react';

interface TokenData {
  symbol: string;
  name: string;
  address: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
}

interface SolanaDexChartProps {
  isWalletConnected: boolean;
}

const mockTopTokensData = [
  {
    symbol: 'SOL',
    name: 'Solana',
    address: 'So11111111111111111111111111111111111111112',
    price: 98.45,
    change24h: 5.67,
    volume24h: 1250000000,
    marketCap: 42500000000
  },
  {
    symbol: 'BONK',
    name: 'Bonk',
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    price: 0.0000245,
    change24h: -12.34,
    volume24h: 89000000,
    marketCap: 1800000000
  },
  {
    symbol: 'JUP',
    name: 'Jupiter',
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    price: 0.87,
    change24h: 8.91,
    volume24h: 156000000,
    marketCap: 1200000000
  }
];

export const SolanaDexChart: React.FC<SolanaDexChartProps> = ({ isWalletConnected }) => {
  const { toast } = useToast();
  const [topTokens, setTopTokens] = useState<TokenData[]>(mockTopTokensData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      const filteredTokens = mockTopTokensData.filter(token =>
        token.name.toLowerCase().includes(term.toLowerCase()) ||
        token.symbol.toLowerCase().includes(term.toLowerCase())
      );
      setTopTokens(filteredTokens);
    } else {
      setTopTokens(mockTopTokensData);
    }
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-purple flex items-center gap-3">
          <BarChart3 size={24} />
          SOLANA DEX CHART
          <Badge className={`${isWalletConnected ? 'bg-neon-green' : 'bg-neon-pink'} text-black`}>
            {isWalletConnected ? '✅ CONNECTED' : '❌ DISCONNECTED'}
          </Badge>
        </CardTitle>
        <p className="text-muted-foreground">
          Real-time data and analytics for Solana DEX tokens.
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center">
          <Input
            type="text"
            placeholder="Search tokens..."
            className="bg-background/50 border-neon-purple flex-grow mr-2"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <Button onClick={() => handleSearch(searchTerm)} className="cyber-button">
            <Search size={16} className="mr-2" />
            Search
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700 text-sm">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-neon-cyan">Token</th>
                <th className="px-4 py-2 text-left text-neon-cyan">Price</th>
                <th className="px-4 py-2 text-left text-neon-cyan">24h Change</th>
                <th className="px-4 py-2 text-left text-neon-cyan">24h Volume</th>
                <th className="px-4 py-2 text-left text-neon-cyan">Market Cap</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {topTokens.map((token) => (
                <tr key={token.address}>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <span className="mr-2">{token.symbol}</span>
                      <span className="text-muted-foreground">{token.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <DollarSign size={14} className="inline-block mr-1" />
                    {token.price.toFixed(5)}
                  </td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center ${token.change24h >= 0 ? 'text-neon-green' : 'text-neon-pink'}`}>
                      {token.change24h >= 0 ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
                      {token.change24h.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Activity size={14} className="inline-block mr-1" />
                    {token.volume24h.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <DollarSign size={14} className="inline-block mr-1" />
                    {token.marketCap.toLocaleString()}
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
