
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Eye, Activity } from 'lucide-react';
import { TokenData } from '@/services/solanaTokenService';

interface TokenListsProps {
  topGainers: TokenData[];
  topLosers: TokenData[];
  mostViewed: TokenData[];
  trending: TokenData[];
  onTokenSelect: (token: TokenData) => void;
}

export const TokenLists: React.FC<TokenListsProps> = ({
  topGainers,
  topLosers,
  mostViewed,
  trending,
  onTokenSelect
}) => {
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

  const TokenItem = ({ token, showViews = false }: { token: TokenData; showViews?: boolean }) => (
    <div
      onClick={() => onTokenSelect(token)}
      className="flex items-center justify-between p-3 rounded-lg border border-neon-cyan/20 hover:border-neon-cyan/50 cursor-pointer transition-colors bg-black/40"
    >
      <div className="flex items-center gap-3">
        {token.logoURI ? (
          <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-neon-purple/20 flex items-center justify-center text-xs font-bold text-neon-purple">
            {token.symbol.charAt(0)}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-neon-cyan">{token.symbol}</span>
            {token.verified && (
              <Badge className="text-xs bg-neon-green/20 text-neon-green">✓</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">${formatPrice(token.price)}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-bold ${token.change24h >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
          {token.change24h >= 0 ? '+' : ''}{token.change24h.toFixed(2)}%
        </div>
        {showViews && token.views && (
          <div className="text-xs text-neon-purple">{token.views.toLocaleString()} views</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="vending-machine">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-neon-green">
            <TrendingUp size={20} />
            Top Gainers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topGainers.map((token, index) => (
            <TokenItem key={`gainer-${token.address}-${index}`} token={token} />
          ))}
        </CardContent>
      </Card>

      <Card className="vending-machine">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-400">
            <TrendingDown size={20} />
            Top Losers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {topLosers.map((token, index) => (
            <TokenItem key={`loser-${token.address}-${index}`} token={token} />
          ))}
        </CardContent>
      </Card>

      <Card className="vending-machine">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-neon-purple">
            <Eye size={20} />
            Most Viewed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {mostViewed.map((token, index) => (
            <TokenItem key={`viewed-${token.address}-${index}`} token={token} showViews />
          ))}
        </CardContent>
      </Card>

      <Card className="vending-machine">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-neon-cyan">
            <Activity size={20} />
            Trending
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {trending.map((token, index) => (
            <TokenItem key={`trending-${token.address}-${index}`} token={token} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
