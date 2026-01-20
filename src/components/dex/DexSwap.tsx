import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { ExternalLink } from 'lucide-react';

type DexOption = 'jupiter' | 'stellarx' | 'uniswap';

const dexOptions: { id: DexOption; name: string; url: string; badge: string; color: string }[] = [
  { id: 'jupiter', name: 'Jupiter', url: 'https://jup.ag/swap/USDC-SOL?theme=dark&padding=12', badge: 'Solana', color: 'neon-cyan' },
  { id: 'stellarx', name: 'StellarX', url: 'https://www.stellarx.com/markets', badge: 'Stellar', color: 'neon-purple' },
  { id: 'uniswap', name: 'Uniswap', url: 'https://app.uniswap.org/', badge: 'Ethereum', color: 'neon-pink' },
];

export const DexSwap: React.FC = () => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const [selectedDex, setSelectedDex] = useState<DexOption>('jupiter');

  const currentDex = dexOptions.find(d => d.id === selectedDex) || dexOptions[0];

  return (
    <Card className="arcade-frame">
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-display text-2xl text-neon-pink">
            🔁 DECENTRALIZED EXCHANGE
          </CardTitle>
        </div>
        
        {/* DEX Selection Buttons */}
        <div className="grid grid-cols-3 gap-2">
          {dexOptions.map((dex) => (
            <Button
              key={dex.id}
              variant={selectedDex === dex.id ? 'default' : 'outline'}
              onClick={() => setSelectedDex(dex.id)}
              className={`flex items-center justify-center gap-1 transition-all duration-300 ${
                selectedDex === dex.id 
                  ? `cyber-button` 
                  : `border-${dex.color}/50 text-${dex.color} hover:bg-${dex.color}/20`
              }`}
            >
              {dex.name}
              <ExternalLink size={12} />
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`bg-${currentDex.color} text-black`}>
            {currentDex.badge} Network
          </Badge>
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
            title={`${currentDex.name} Swap`}
            src={currentDex.url}
            className="w-full"
            style={{ height: 640, border: '0' }}
            allow="clipboard-read; clipboard-write; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Powered by {currentDex.name}. Connect your {currentDex.badge} wallet in the widget to start swapping.
        </p>
      </CardContent>
    </Card>
  );
};

export default DexSwap;
