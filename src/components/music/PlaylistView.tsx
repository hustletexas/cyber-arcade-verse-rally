
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Music, Clock, Coins } from 'lucide-react';
import { Track } from '@/types/music';

interface PlaylistViewProps {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  onTrackSelect: (index: number) => void;
  onPlayPause: () => void;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({
  tracks,
  currentTrackIndex,
  isPlaying,
  onTrackSelect,
  onPlayPause
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-6 p-4 rounded-lg bg-black/30 border border-neon-purple/30">
      <div className="flex items-center gap-2 mb-4">
        <Music className="text-neon-cyan" size={20} />
        <h3 className="text-neon-cyan font-bold text-lg">Cyber Dreams Playlist</h3>
        <Badge className="bg-neon-purple text-white text-xs">
          {tracks.length} tracks
        </Badge>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tracks.map((track, index) => (
          <div
            key={track.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
              index === currentTrackIndex
                ? 'bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-pink/50'
                : 'bg-black/20 hover:bg-neon-cyan/10 border border-transparent hover:border-neon-cyan/30'
            }`}
            onClick={() => onTrackSelect(index)}
          >
            {/* Track Number / Play Button */}
            <div className="flex items-center justify-center w-8 h-8">
              {index === currentTrackIndex && isPlaying ? (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayPause();
                  }}
                  size="sm"
                  className="h-6 w-6 p-0 bg-neon-pink text-black hover:bg-neon-pink/80"
                >
                  <Pause size={12} />
                </Button>
              ) : (
                <span className="text-neon-cyan text-sm font-mono">
                  {(index + 1).toString().padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold text-sm truncate ${
                    index === currentTrackIndex ? 'text-neon-pink' : 'text-neon-cyan'
                  }`}>
                    {track.title}
                  </h4>
                  <p className="text-xs text-neon-purple truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-xs text-neon-green">
                    <Clock size={12} />
                    {formatDuration(track.duration)}
                  </div>
                  {track.nft && track.nft.isForSale && (
                    <div className="flex items-center gap-1 text-xs text-neon-pink">
                      <Coins size={12} />
                      {track.nft.price} SOL
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
