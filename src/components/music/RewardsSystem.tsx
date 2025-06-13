
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  audiusUrl?: string;
  audiusTrackId?: string;
  solanaAddress?: string;
}

interface RewardsSystemProps {
  isWalletConnected: boolean;
  walletAddress: string;
  currentTrack: Track;
  isPlaying: boolean;
  currentTrackIndex: number;
  totalTracks: number;
  nextTrackTitle: string;
}

export const RewardsSystem: React.FC<RewardsSystemProps> = ({
  isWalletConnected,
  walletAddress,
  currentTrack,
  isPlaying,
  currentTrackIndex,
  totalTracks,
  nextTrackTitle
}) => {
  return (
    <div className="mt-3 space-y-2">
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">
          Track {currentTrackIndex + 1} of {totalTracks} • Next: {nextTrackTitle}
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-xs">
          <span className="text-neon-purple">🎵 Powered by Audius Protocol</span>
          <span className="text-neon-cyan">⛓️ Solana Blockchain</span>
          {isWalletConnected && (
            <span className="text-neon-green">💰 Earning $AUDIO Rewards</span>
          )}
        </div>
      </div>
      
      {isWalletConnected && (
        <div className="text-center p-2 bg-neon-purple/10 rounded border border-neon-purple/30">
          <p className="text-xs text-neon-purple">
            🔗 Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
          </p>
          <p className="text-xs text-neon-green mt-1">
            Artist's Solana Address: {currentTrack.solanaAddress?.slice(0, 8)}...{currentTrack.solanaAddress?.slice(-8)}
          </p>
        </div>
      )}
    </div>
  );
};
