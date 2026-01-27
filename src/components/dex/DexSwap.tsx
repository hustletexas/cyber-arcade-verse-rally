import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMultiWallet } from '@/hooks/useMultiWallet';

export const DexSwap: React.FC = () => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();

  return (
    <Card className="arcade-frame">
      <CardHeader className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-2xl text-neon-pink">
            ✦ STELLAR DEX
          </CardTitle>
          <Badge className="bg-neon-cyan text-black">
            Stellar Network
          </Badge>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {isWalletConnected && primaryWallet?.address ? (
            <Badge className="bg-neon-green text-black">
              ✦ {primaryWallet.address.slice(0, 6)}...{primaryWallet.address.slice(-4)}
            </Badge>
          ) : (
            <Badge variant="outline" className="border-neon-purple text-neon-purple">
              Connect LOBSTR or Freighter to trade
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-xl overflow-hidden border border-border">
          <iframe
            title="StellarX - Stellar DEX"
            src="https://www.stellarx.com/"
            className="w-full"
            style={{ height: 640, border: '0' }}
            allow="clipboard-read; clipboard-write; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Powered by StellarX. Connect your Stellar wallet (LOBSTR or Freighter) to start swapping.
        </p>
      </CardContent>
    </Card>
  );
};

export default DexSwap;
