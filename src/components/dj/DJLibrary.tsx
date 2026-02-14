import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Upload, ChevronDown, ChevronUp } from 'lucide-react';
import { Track } from '@/types/music';

interface Props {
  tracks: Track[];
  onLoadToDeck: (deck: 'A' | 'B', track: Track) => void;
}

export const DJLibrary: React.FC<Props> = ({ tracks, onLoadToDeck }) => {
  const [search, setSearch] = useState('');
  const [genreFilter, setGenreFilter] = useState<string>('all');
  const [collapsed, setCollapsed] = useState(false);

  const genres = useMemo(() => {
    const set = new Set(tracks.map(t => t.genre));
    return ['all', ...Array.from(set).sort()];
  }, [tracks]);

  const filtered = useMemo(() => {
    return tracks.filter(t => {
      const matchesSearch = search === '' || t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase());
      const matchesGenre = genreFilter === 'all' || t.genre === genreFilter;
      return matchesSearch && matchesGenre;
    });
  }, [tracks, search, genreFilter]);

  return (
    <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 transition"
      >
        <span className="text-xs font-bold text-neon-cyan tracking-wider font-display">
          TRACK LIBRARY ({filtered.length})
        </span>
        {collapsed ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
      </button>

      {!collapsed && (
        <div className="p-2 space-y-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tracks..."
              className="pl-7 h-7 text-xs bg-black/40 border-white/10"
            />
          </div>

          {/* Genre filter */}
          <div className="flex flex-wrap gap-1">
            {genres.map(g => (
              <button
                key={g}
                onClick={() => setGenreFilter(g)}
                className="px-2 py-0.5 rounded text-[9px] transition-all border"
                style={{
                  backgroundColor: genreFilter === g ? 'hsl(var(--neon-cyan) / 0.15)' : 'transparent',
                  borderColor: genreFilter === g ? 'hsl(var(--neon-cyan) / 0.5)' : 'rgba(255,255,255,0.1)',
                  color: genreFilter === g ? 'hsl(var(--neon-cyan))' : 'rgba(255,255,255,0.5)',
                }}
              >
                {g === 'all' ? 'All' : g}
              </button>
            ))}
          </div>

          {/* Track list */}
          <div className="max-h-48 overflow-y-auto space-y-0.5 scrollbar-thin">
            {filtered.map(track => (
              <div
                key={track.id}
                className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-white/5 transition group"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-[10px] font-semibold text-foreground/90 truncate">{track.title}</p>
                  <p className="text-[9px] text-muted-foreground truncate">{track.artist} • {track.genre}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onLoadToDeck('A', track)}
                    className="h-5 px-1.5 text-[8px] text-neon-cyan hover:bg-neon-cyan/10"
                  >
                    A
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onLoadToDeck('B', track)}
                    className="h-5 px-1.5 text-[8px] text-neon-pink hover:bg-neon-pink/10"
                  >
                    B
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
