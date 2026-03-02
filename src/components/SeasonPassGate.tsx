import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSeasonPass } from '@/hooks/useSeasonPass';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { isMobileDevice } from '@/utils/mobileWalletDetection';

interface SeasonPassGateProps {
  children: React.ReactNode;
  featureName?: string;
}

export const SeasonPassGate: React.FC<SeasonPassGateProps> = ({ children, featureName = 'this feature' }) => {
  const { hasPass, isLoading } = useSeasonPass();
  const { isWalletConnected, connectWallet } = useMultiWallet();
  const isMobile = isMobileDevice();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full" />
      </div>
    );
  }

  // On mobile, skip wallet requirement — allow purchase without wallet
  if (!isWalletConnected && !isMobile) {
    return (
      <Card className="max-w-lg mx-auto mt-12 border-neon-cyan/30 bg-card/80 backdrop-blur">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <Lock className="w-12 h-12 text-neon-cyan mx-auto" />
          <h2 className="text-xl font-display text-foreground tracking-wide">WALLET REQUIRED</h2>
          <p className="text-muted-foreground text-sm">
            Connect your wallet to check Season Pass access for {featureName}.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!hasPass) {
    return (
      <Card className="max-w-lg mx-auto mt-12 border-neon-purple/30 bg-card/80 backdrop-blur">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-neon-purple mx-auto" />
          <h2 className="text-xl font-display text-foreground tracking-wide">SEASON PASS REQUIRED</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            A <span className="text-neon-cyan font-semibold">Cyber City Season Pass</span> is required to access {featureName}.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3 text-neon-pink" />
            <span>Unlock full rewards, exclusive games & tournament access</span>
          </div>
          <Link to="/store">
            <Button className="bg-neon-purple/20 border border-neon-purple/50 text-neon-purple hover:bg-neon-purple/30">
              Get Season Pass
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
};
