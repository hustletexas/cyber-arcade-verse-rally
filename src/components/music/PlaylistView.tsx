
import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Music, Clock, Filter } from 'lucide-react';
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
  const [activeGenre, setActiveGenre] = useState<string | null>(null);

  const genres = useMemo(() => {
    const genreSet = new Set(tracks.map(t => t.genre));
    return Array.from(genreSet).sort();
  }, [tracks]);

  const filteredTracks = useMemo(() => {
    if (!activeGenre) return tracks.map((track, index) => ({ track, originalIndex: index }));
    return tracks
      .map((track, index) => ({ track, originalIndex: index }))
      .filter(({ track }) => track.genre === activeGenre);
  }, [tracks, activeGenre]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="mt-6 p-4 rounded-lg bg-black/30 border border-neon-purple/30">
      <div className="flex items-center gap-2 mb-3">
        <Music className="text-neon-cyan" size={20} />
        <h3 className="text-neon-cyan font-bold text-lg">Cyber Dreams Playlist</h3>
        <Badge className="bg-neon-purple text-white text-xs">
          {tracks.length} tracks
        </Badge>
      </div>

      {/* Genre Filter Buttons */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        <Filter size={14} className="text-muted-foreground shrink-0" />
        <button
          onClick={() => setActiveGenre(null)}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
            activeGenre === null
              ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50'
              : 'bg-transparent text-muted-foreground border-white/10 hover:border-neon-cyan/30 hover:text-neon-cyan'
          }`}
        >
          All
        </button>
        {genres.map(genre => (
          <button
            key={genre}
            onClick={() => setActiveGenre(activeGenre === genre ? null : genre)}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
              activeGenre === genre
                ? 'bg-neon-pink/20 text-neon-pink border-neon-pink/50'
                : 'bg-transparent text-muted-foreground border-white/10 hover:border-neon-pink/30 hover:text-neon-pink'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>

      {activeGenre && (
        <p className="text-xs text-muted-foreground mb-2">
          Showing {filteredTracks.length} {activeGenre} track{filteredTracks.length !== 1 ? 's' : ''}
        </p>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredTracks.map(({ track, originalIndex }) => (
          <div
            key={track.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${
              originalIndex === currentTrackIndex
                ? 'bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-pink/50'
                : 'bg-black/20 hover:bg-neon-cyan/10 border border-transparent hover:border-neon-cyan/30'
            }`}
            onClick={() => onTrackSelect(originalIndex)}
          >
            {/* Track Number / Play Button */}
            <div className="flex items-center justify-center w-8 h-8">
              {originalIndex === currentTrackIndex && isPlaying ? (
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
                  {(originalIndex + 1).toString().padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className={`font-semibold text-sm truncate ${
                    originalIndex === currentTrackIndex ? 'text-neon-pink' : 'text-neon-cyan'
                  }`}>
                    {track.title}
                  </h4>
                  <p className="text-xs text-neon-purple truncate">{track.artist}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-white/10 text-muted-foreground hidden sm:inline-flex">
                    {track.genre}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-neon-green">
                    <Clock size={12} />
                    {formatDuration(track.duration)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
