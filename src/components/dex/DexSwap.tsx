import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useMultiWallet } from '@/hooks/useMultiWallet';

type DexOption = 'aqua' | 'stellarx';

const dexOptions: { id: DexOption; name: string; url: string; description: string; walletIcon: string; walletName: string }[] = [
  { 
    id: 'aqua', 
    name: 'Aqua Network', 
    url: 'https://aqua.network/', 
    description: 'Liquidity management & AMM on Stellar',
    walletIcon: '/images/wallets/lobstr.png', 
    walletName: 'LOBSTR' 
  },
  { 
    id: 'stellarx', 
    name: 'StellarX', 
    url: 'https://www.stellarx.com/', 
    description: 'Universal marketplace for Stellar assets',
    walletIcon: '/images/wallets/freighter.png', 
    walletName: 'Freighter' 
  },
];

export const DexSwap: React.FC = () => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const [selectedDex, setSelectedDex] = useState<DexOption>('aqua');

  const currentDex = dexOptions.find(d => d.id === selectedDex) || dexOptions[0];

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
        
        {/* DEX Selection Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {dexOptions.map((dex) => (
            <Button
              key={dex.id}
              variant={selectedDex === dex.id ? 'default' : 'outline'}
              onClick={() => setSelectedDex(dex.id)}
              className={`flex flex-col items-center justify-center gap-1 h-auto py-3 transition-all duration-300 ${
                selectedDex === dex.id 
                  ? 'cyber-button' 
                  : 'border-neon-purple/50 text-neon-purple hover:bg-neon-purple/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <img 
                  src={dex.walletIcon} 
                  alt={dex.walletName} 
                  className="w-5 h-5 rounded-sm"
                />
                <span className="font-semibold">{dex.name}</span>
              </div>
              <span className="text-xs opacity-70">{dex.description}</span>
            </Button>
          ))}
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
            title={`${currentDex.name} - Stellar DEX`}
            src={currentDex.url}
            className="w-full"
            style={{ height: 640, border: '0' }}
            allow="clipboard-read; clipboard-write; accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Powered by {currentDex.name}. Connect your Stellar wallet ({currentDex.walletName} recommended) to start swapping.
        </p>
      </CardContent>
    </Card>
  );
};

export default DexSwap;
