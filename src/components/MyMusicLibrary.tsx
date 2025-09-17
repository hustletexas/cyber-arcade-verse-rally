import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSongPurchase } from '@/hooks/useSongPurchase';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CardLoadingSkeleton } from '@/components/ui/loading-states';
import { DataNotFound } from '@/components/ui/error-handling';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Crown, Clock } from 'lucide-react';

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '--:--';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const MyMusicLibrary: React.FC = () => {
  const { songs, loading, ownsSong, getOwnedSongsWithDetails } = useSongPurchase();
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        <CardLoadingSkeleton />
        <CardLoadingSkeleton />
      </div>
    );
  }

  const ownedSongs = getOwnedSongsWithDetails();
  const freeSongs = ownedSongs.filter(song => song.is_free);
  const purchasedSongs = ownedSongs.filter(song => !song.is_free);

  if (ownedSongs.length === 0) {
    return (
      <DataNotFound
        title="Your Music Library is Empty"
        description="You haven't purchased any songs yet. Visit the Music Store to start building your collection!"
        icon={<Music className="mx-auto text-muted-foreground" size={48} />}
        action={{
          label: "Visit Music Store",
          onClick: () => {
            // You can add navigation logic here if needed
            console.log("Navigate to music store");
          }
        }}
      />
    );
  }

  const togglePlay = (songId: string) => {
    if (currentlyPlaying === songId) {
      setCurrentlyPlaying(null);
    } else {
      setCurrentlyPlaying(songId);
    }
  };

  const SongList = ({ songs, title }: { songs: any[], title: string }) => (
    <div className="space-y-3">
      <h3 className="text-lg font-display text-neon-cyan mb-3">{title}</h3>
      {songs.map((song, index) => (
        <Card key={song.id} className="arcade-frame hover:bg-muted/5 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Track Number */}
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-mono">
                {index + 1}
              </div>

              {/* Album Art */}
              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
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
                  <Music className="text-muted-foreground" size={16} />
                )}
              </div>

              {/* Song Details */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground truncate">{song.title}</h4>
                <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                {song.album && (
                  <p className="text-xs text-muted-foreground truncate">{song.album}</p>
                )}
              </div>

              {/* Genre & Duration */}
              <div className="flex flex-col items-end gap-1">
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

              {/* Play Controls */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePlay(song.id)}
                  className="w-8 h-8 p-0"
                >
                  {currentlyPlaying === song.id ? (
                    <Pause className="text-neon-cyan" size={16} />
                  ) : (
                    <Play className="text-neon-green" size={16} />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <CardTitle className="text-neon-cyan font-display flex items-center gap-2">
            <Crown className="text-neon-pink" />
            My Music Library
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Your personal collection of {ownedSongs.length} track{ownedSongs.length !== 1 ? 's' : ''}
          </p>
        </CardHeader>
      </Card>

      {/* Current Player (if playing) */}
      {currentlyPlaying && (
        <Card className="arcade-frame bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-neon-cyan/20 rounded-lg flex items-center justify-center">
                  <Music className="text-neon-cyan" size={20} />
                </div>
                <div>
                  <p className="font-semibold text-neon-cyan">Now Playing</p>
                  <p className="text-sm text-muted-foreground">
                    {songs.find(s => s.id === currentlyPlaying)?.title} - {songs.find(s => s.id === currentlyPlaying)?.artist}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <SkipBack size={16} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentlyPlaying(null)}
                  className="w-8 h-8 p-0"
                >
                  <Pause className="text-neon-cyan" size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <SkipForward size={16} />
                </Button>
                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                  <Volume2 size={16} />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Music Collection */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Songs ({ownedSongs.length})</TabsTrigger>
          <TabsTrigger value="purchased">Purchased ({purchasedSongs.length})</TabsTrigger>
          <TabsTrigger value="free">Free ({freeSongs.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <SongList songs={ownedSongs} title="Complete Collection" />
        </TabsContent>
        
        <TabsContent value="purchased" className="mt-6">
          {purchasedSongs.length > 0 ? (
            <SongList songs={purchasedSongs} title="Purchased Tracks" />
          ) : (
            <DataNotFound
              title="No Purchased Songs"
              description="You haven't purchased any premium tracks yet."
              icon={<Music className="mx-auto text-muted-foreground" size={32} />}
            />
          )}
        </TabsContent>
        
        <TabsContent value="free" className="mt-6">
          {freeSongs.length > 0 ? (
            <SongList songs={freeSongs} title="Free Tracks" />
          ) : (
            <DataNotFound
              title="No Free Songs"
              description="You haven't claimed any free tracks yet."
              icon={<Music className="mx-auto text-muted-foreground" size={32} />}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Library Stats */}
      <Card className="arcade-frame">
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-neon-cyan">{ownedSongs.length}</p>
              <p className="text-sm text-muted-foreground">Total Songs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-neon-green">{freeSongs.length}</p>
              <p className="text-sm text-muted-foreground">Free Tracks</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-neon-pink">{purchasedSongs.length}</p>
              <p className="text-sm text-muted-foreground">Purchased</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};