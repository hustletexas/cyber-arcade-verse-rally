import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { ExternalLink } from 'lucide-react';

export const DexSwap: React.FC = () => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();

  const jupiterUrl = new URL('https://jup.ag/swap/USDC-SOL');
  jupiterUrl.searchParams.set('theme', 'dark');
  jupiterUrl.searchParams.set('padding', '12');
  // Note: The embedded widget will handle wallet connection itself.
  // If the app uses Solana Wallet Adapter, we could pass-through the wallet,
  // but here we keep it simple and let Jupiter handle connect flow.

  return (
    <Card className="arcade-frame">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-2xl text-neon-pink">
            🔁 DECENTRALIZED EXCHANGE
          </CardTitle>
          <a href="https://jup.ag" target="_blank" rel="noreferrer">
            <Button variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black">
              Jupiter <ExternalLink size={14} className="ml-1" />
            </Button>
          </a>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-neon-cyan text-black">Solana Aggregator</Badge>
          {isWalletConnected && primaryWallet?.address ? (
            <Badge className="bg-neon-green text-black">
              {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-neon-purple text-neon-purple">
              Connect wallet in widget
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl overflow-hidden border border-border">
          <iframe
            title="Jupiter Swap"
            src={jupiterUrl.toString()}
            className="w-full"
            style={{ height: 640, border: '0' }}
            allow="clipboard-read; clipboard-write; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Powered by Jupiter. Connect your Solana wallet in the widget to start swapping.
        </p>
      </CardContent>
    </Card>
  );
};

export default DexSwap;
