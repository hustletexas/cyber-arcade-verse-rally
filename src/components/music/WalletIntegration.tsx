
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Coins } from 'lucide-react';

interface WalletIntegrationProps {
  isWalletConnected: boolean;
  walletAddress: string;
  audioRewards: number;
  onWalletConnect: () => void;
  onTipArtist: () => void;
  currentArtist: string;
}

export const WalletIntegration: React.FC<WalletIntegrationProps> = ({
  isWalletConnected,
  walletAddress,
  audioRewards,
  onWalletConnect,
  onTipArtist,
  currentArtist
}) => {
  return (
    <div className="flex items-center gap-2">
      {!isWalletConnected ? (
        <Button
          onClick={onWalletConnect}
          size="sm"
          className="cyber-button text-xs"
        >
          <Wallet size={16} className="mr-1" />
          CONNECT
        </Button>
      ) : (
        <div className="flex items-center gap-2">
          <Badge className="bg-neon-green text-black text-xs">
            <Coins size={12} className="mr-1" />
            {audioRewards.toFixed(1)} $AUDIO
          </Badge>
          <Button
            onClick={onTipArtist}
            size="sm"
            className="cyber-button text-xs"
          >
            TIP ARTIST
          </Button>
        </div>
      )}
    </div>
  );
};
