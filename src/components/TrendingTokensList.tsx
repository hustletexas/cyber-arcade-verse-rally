
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

interface TopToken {
  symbol: string;
  name: string;
  price: number;
  change: number;
  volume: number;
  marketCap: number;
  mintAddress: string;
}

interface TrendingTokensListProps {
  topGainers: TopToken[];
  topLosers: TopToken[];
  mostViewed: TopToken[];
  onTokenSelect: (token: TopToken) => void;
}

export const TrendingTokensList: React.FC<TrendingTokensListProps> = ({
  topGainers,
  topLosers,
  mostViewed,
  onTokenSelect
}) => {
  const formatNumber = (num: number, decimals: number = 2): string => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const TokenCard = ({ tokens, title, icon, titleColor }: {
    tokens: TopToken[];
    title: string;
    icon: React.ReactNode;
    titleColor: string;
  }) => (
    <Card className="vending-machine">
      <CardHeader className="pb-2">
        <CardTitle className={`text-lg ${titleColor} flex items-center gap-2`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {tokens.map((token) => (
          <div 
            key={token.mintAddress} 
            className="flex justify-between items-center p-2 rounded-lg hover:bg-neon-cyan/5 cursor-pointer transition-colors"
            onClick={() => onTokenSelect(token)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">{token.symbol}</p>
                <Badge variant="outline" className="text-xs">
                  {token.name}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">${token.price < 1 ? token.price.toFixed(6) : token.price.toFixed(2)}</p>
              <div className="flex gap-2 text-xs text-muted-foreground">
                <span>Vol: ${formatNumber(token.volume)}</span>
                <span>MC: ${formatNumber(token.marketCap)}</span>
              </div>
            </div>
            <div className="text-right">
              <Badge className={`${token.change >= 0 ? 'bg-neon-green/20 text-neon-green' : 'bg-red-400/20 text-red-400'}`}>
                {token.change >= 0 ? '+' : ''}{token.change.toFixed(2)}%
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <TokenCard
        tokens={topGainers}
        title="Top Gainers"
        icon={<TrendingUp size={20} />}
        titleColor="text-neon-green"
      />
      <TokenCard
        tokens={topLosers}
        title="Top Losers"
        icon={<TrendingDown size={20} />}
        titleColor="text-red-400"
      />
      <TokenCard
        tokens={mostViewed}
        title="Most Viewed"
        icon={<BarChart3 size={20} />}
        titleColor="text-neon-cyan"
      />
    </div>
  );
};
