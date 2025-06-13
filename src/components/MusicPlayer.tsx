
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
}

const playlist: Track[] = [
  {
    id: '1',
    title: 'Cyber Dreams',
    artist: 'Neon Synthwave',
    duration: '3:45',
    genre: 'Synthwave'
  },
  {
    id: '2',
    title: 'Digital Arcade',
    artist: 'RetroFuture',
    duration: '4:12',
    genre: 'Chiptune'
  },
  {
    id: '3',
    title: 'Pixel Paradise',
    artist: 'GameBeats',
    duration: '3:28',
    genre: 'Electronic'
  },
  {
    id: '4',
    title: 'Neon Nights',
    artist: 'CyberPunk Collective',
    duration: '5:03',
    genre: 'Synthwave'
  },
  {
    id: '5',
    title: 'Retro Runner',
    artist: 'Arcade Masters',
    duration: '3:55',
    genre: 'Chiptune'
  }
];

export const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [isMinimized, setIsMinimized] = useState(false);

  // Simulate audio progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1;
          if (newProgress >= 100) {
            handleNext();
            return 0;
          }
          
          // Update current time display
          const totalSeconds = Math.floor((newProgress / 100) * 240); // Assume 4min max
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          setCurrentTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          
          return newProgress;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % playlist.length);
    setProgress(0);
    setCurrentTime('0:00');
  };

  const handlePrevious = () => {
    setCurrentTrack((prev) => (prev - 1 + playlist.length) % playlist.length);
    setProgress(0);
    setCurrentTime('0:00');
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
  };

  const currentSong = playlist[currentTrack];

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="bg-black/90 border border-neon-cyan/50 p-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePlay}
              size="sm"
              className="cyber-button p-2 h-8 w-8"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </Button>
            <div className="text-xs text-neon-cyan min-w-0">
              <p className="truncate max-w-32">{currentSong.title}</p>
            </div>
            <Button
              onClick={() => setIsMinimized(false)}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-neon-cyan hover:text-neon-pink"
            >
              ⬆️
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <Card className="arcade-frame sticky bottom-0 z-40 bg-black/95">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Music className="text-neon-cyan" size={20} />
            <span className="font-display text-neon-green">🎵 CYBER VIBES</span>
            <Badge className="bg-neon-purple text-white text-xs">PLAYING</Badge>
          </div>
          <Button
            onClick={() => setIsMinimized(true)}
            size="sm"
            variant="ghost"
            className="text-neon-cyan hover:text-neon-pink"
          >
            ⬇️
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Track Info */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-neon-cyan text-sm md:text-base">{currentSong.title}</h4>
            <p className="text-xs text-muted-foreground">{currentSong.artist}</p>
            <Badge className="bg-neon-pink text-black text-xs mt-1">
              {currentSong.genre}
            </Badge>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePrevious}
                size="sm"
                className="cyber-button p-2"
              >
                <SkipBack size={16} />
              </Button>
              <Button
                onClick={handlePlay}
                className="cyber-button p-3 bg-neon-cyan text-black hover:bg-neon-pink"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              <Button
                onClick={handleNext}
                size="sm"
                className="cyber-button p-2"
              >
                <SkipForward size={16} />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-md">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>{currentTime}</span>
                <span>{currentSong.duration}</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1">
                <div
                  className="bg-neon-cyan h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Volume Control */}
          <div className="flex items-center justify-center md:justify-end gap-2">
            <Button
              onClick={handleVolumeToggle}
              size="sm"
              variant="ghost"
              className="text-neon-cyan hover:text-neon-pink p-2"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </Button>
            <div className="w-16 bg-gray-800 rounded-full h-1">
              <div
                className="bg-neon-green h-1 rounded-full"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Playlist Preview */}
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            Track {currentTrack + 1} of {playlist.length} • Next: {playlist[(currentTrack + 1) % playlist.length].title}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
