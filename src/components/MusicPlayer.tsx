
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, ExternalLink } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: string;
  genre: string;
  audiusUrl?: string;
  streamUrl?: string;
}

const playlist: Track[] = [
  {
    id: '1',
    title: 'Digital Dreams',
    artist: 'CyberBeats',
    duration: '3:45',
    genre: 'Synthwave',
    audiusUrl: 'https://audius.co/cyberbeats/digital-dreams',
    streamUrl: 'https://creatornode.audius.co/v1/tracks/stream'
  },
  {
    id: '2',
    title: 'Neon Arcade',
    artist: 'RetroFuture',
    duration: '4:12',
    genre: 'Chiptune',
    audiusUrl: 'https://audius.co/retrofuture/neon-arcade',
    streamUrl: 'https://creatornode.audius.co/v1/tracks/stream'
  },
  {
    id: '3',
    title: 'Pixel Paradise',
    artist: 'GameBeats',
    duration: '3:28',
    genre: 'Electronic',
    audiusUrl: 'https://audius.co/gamebeats/pixel-paradise',
    streamUrl: 'https://creatornode.audius.co/v1/tracks/stream'
  },
  {
    id: '4',
    title: 'Cyber City Nights',
    artist: 'Synthwave Collective',
    duration: '5:03',
    genre: 'Synthwave',
    audiusUrl: 'https://audius.co/synthwave/cyber-city-nights',
    streamUrl: 'https://creatornode.audius.co/v1/tracks/stream'
  },
  {
    id: '5',
    title: 'Retro Runner',
    artist: 'Arcade Masters',
    duration: '3:55',
    genre: 'Chiptune',
    audiusUrl: 'https://audius.co/arcade-masters/retro-runner',
    streamUrl: 'https://creatornode.audius.co/v1/tracks/stream'
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
  const [showAudiusLink, setShowAudiusLink] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Simulate audio progress for demo purposes
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
          
          const totalSeconds = Math.floor((newProgress / 100) * 240);
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
    // In a real implementation, this would interact with Audius API
    console.log(`${isPlaying ? 'Pausing' : 'Playing'} track from Audius:`, currentSong.audiusUrl);
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

  const openAudius = () => {
    if (currentSong.audiusUrl) {
      window.open(currentSong.audiusUrl, '_blank');
    } else {
      window.open('https://audius.co/', '_blank');
    }
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
              onClick={openAudius}
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-neon-purple hover:text-neon-pink"
              title="Open on Audius"
            >
              <ExternalLink size={12} />
            </Button>
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
            <Badge className="bg-neon-purple text-white text-xs">AUDIUS POWERED</Badge>
            {isPlaying && <Badge className="bg-neon-pink text-black text-xs animate-pulse">LIVE</Badge>}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={openAudius}
              size="sm"
              variant="ghost"
              className="text-neon-purple hover:text-neon-pink"
              title="Open on Audius"
            >
              <ExternalLink size={16} />
            </Button>
            <Button
              onClick={() => setIsMinimized(true)}
              size="sm"
              variant="ghost"
              className="text-neon-cyan hover:text-neon-pink"
            >
              ⬇️
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Track Info */}
          <div className="text-center md:text-left">
            <h4 className="font-bold text-neon-cyan text-sm md:text-base">{currentSong.title}</h4>
            <p className="text-xs text-muted-foreground">{currentSong.artist}</p>
            <div className="flex flex-wrap gap-1 mt-1 justify-center md:justify-start">
              <Badge className="bg-neon-pink text-black text-xs">
                {currentSong.genre}
              </Badge>
              <Button
                onClick={openAudius}
                size="sm"
                variant="ghost"
                className="text-xs text-neon-purple hover:text-neon-pink h-5 px-1"
              >
                View on Audius
              </Button>
            </div>
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
              <div className="w-full bg-gray-800 rounded-full h-1 cursor-pointer">
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
            <div className="w-16 bg-gray-800 rounded-full h-1 cursor-pointer">
              <div
                className="bg-neon-green h-1 rounded-full"
                style={{ width: `${isMuted ? 0 : volume * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Playlist Preview & Audius Info */}
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">
            Track {currentTrack + 1} of {playlist.length} • Next: {playlist[(currentTrack + 1) % playlist.length].title}
          </p>
          <p className="text-xs text-neon-purple">
            🎵 Streaming from Audius - Decentralized Music Platform
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
