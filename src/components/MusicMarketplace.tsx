import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSongPurchase, Song } from '@/hooks/useSongPurchase';
import { useUserBalance } from '@/hooks/useUserBalance';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LoadingText, CardLoadingSkeleton } from '@/components/ui/loading-states';
import { ErrorDisplay, DataNotFound } from '@/components/ui/error-handling';
import { Music, Play, ShoppingCart, Coins, Clock, Crown } from 'lucide-react';

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

interface SongCardProps {
  song: Song;
  isOwned: boolean;
  isPurchasing: boolean;
  onPurchase: (songId: string) => void;
  userBalance: number;
}

const SongCard: React.FC<SongCardProps> = ({
  song,
  isOwned,
  isPurchasing,
  onPurchase,
  userBalance
}) => {
  const canAfford = userBalance >= song.price_cctr || song.is_free;

  return (
    <Card className="arcade-frame hover:shadow-neon-cyan/20 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Album Art */}
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
            {song.cover_art_url ? (
              <img 
                src={song.cover_art_url} 
                alt={`${song.title} cover`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <Music className="text-muted-foreground" size={24} />
            )}
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{song.title}</h3>
            <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
            {song.album && (
              <p className="text-xs text-muted-foreground truncate">{song.album}</p>
            )}
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {song.genre}
              </Badge>
              {song.duration && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={10} />
                  {formatDuration(song.duration)}
                </div>
              )}
            </div>
          </div>

          {/* Purchase/Status */}
          <div className="flex flex-col items-end gap-2">
            {isOwned ? (
              <div className="flex items-center gap-2">
                <Crown className="text-neon-green" size={16} />
                <Badge className="bg-neon-green text-black">OWNED</Badge>
              </div>
            ) : song.is_free ? (
              <Button
                onClick={() => onPurchase(song.id)}
                disabled={isPurchasing}
                className="cyber-button h-8 text-xs"
              >
                {isPurchasing ? <LoadingSpinner size="xs" /> : <Play size={12} />}
                {isPurchasing ? '' : 'GET FREE'}
              </Button>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-sm font-bold text-neon-cyan">
                  <Coins size={14} />
                  {song.price_cctr} CCTR
                </div>
                <Button
                  onClick={() => onPurchase(song.id)}
                  disabled={isPurchasing || !canAfford}
                  className="cyber-button h-8 text-xs"
                  variant={canAfford ? "default" : "outline"}
                >
                  {isPurchasing ? (
                    <LoadingSpinner size="xs" />
                  ) : (
                    <ShoppingCart size={12} />
                  )}
                  {isPurchasing ? '' : canAfford ? 'BUY' : 'INSUFFICIENT'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const MusicMarketplace: React.FC = () => {
  const { songs, loading, purchasing, purchaseSong, ownsSong } = useSongPurchase();
  const { balance } = useUserBalance();

  if (loading) {
    return (
      <div className="space-y-4">
        <CardLoadingSkeleton />
        <CardLoadingSkeleton />
        <CardLoadingSkeleton />
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <DataNotFound
        title="No Songs Available"
        description="The Cyber City Radio catalog is currently empty. Check back soon for new tracks!"
        icon={<Music className="mx-auto text-muted-foreground" size={48} />}
      />
    );
  }

  const freeSongs = songs.filter(song => song.is_free);
  const paidSongs = songs.filter(song => !song.is_free);

  return (
    <div className="space-y-6">
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="text-neon-cyan font-display flex items-center gap-2">
            <Music className="text-neon-pink" />
            Cyber City Radio - Music Store
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Expand your digital music collection with exclusive Cyber City tracks
          </p>
        </CardHeader>
      </Card>

      {/* Free Songs Section */}
      {freeSongs.length > 0 && (
        <div>
          <h2 className="text-xl font-display text-neon-green mb-4 flex items-center gap-2">
            <Crown size={20} />
            Free Tracks
          </h2>
          <div className="grid gap-3">
            {freeSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                isOwned={ownsSong(song.id)}
                isPurchasing={purchasing === song.id}
                onPurchase={purchaseSong}
                userBalance={balance.cctr_balance}
              />
            ))}
          </div>
        </div>
      )}

      {/* Paid Songs Section */}
      {paidSongs.length > 0 && (
        <div>
          <h2 className="text-xl font-display text-neon-cyan mb-4 flex items-center gap-2">
            <ShoppingCart size={20} />
            Premium Tracks
          </h2>
          <div className="grid gap-3">
            {paidSongs.map((song) => (
              <SongCard
                key={song.id}
                song={song}
                isOwned={ownsSong(song.id)}
                isPurchasing={purchasing === song.id}
                onPurchase={purchaseSong}
                userBalance={balance.cctr_balance}
              />
            ))}
          </div>
        </div>
      )}

      {/* Balance Display */}
      <Card className="arcade-frame bg-gradient-to-r from-neon-purple/10 to-neon-pink/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Your CCTR Balance:</span>
            <div className="flex items-center gap-2 text-lg font-bold text-neon-cyan">
              <Coins size={20} />
              {balance.cctr_balance.toLocaleString()} CCTR
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};