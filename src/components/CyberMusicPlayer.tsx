
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
}

const defaultTracks: Track[] = [
  {
    id: '1',
    title: 'Cyber Dreams',
    artist: 'Neon Synthwave',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  }
];

export const CyberMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Auto-pause when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        setIsPlaying(false);
        if (audioRef.current) {
          audioRef.current.pause();
        }
      }
      setIsVisible(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  // Update current time and duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleNext);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleNext);
    };
  }, [currentTrack]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % defaultTracks.length);
    setCurrentTime(0);
  };

  const handlePrevious = () => {
    setCurrentTrack((prev) => (prev - 1 + defaultTracks.length) % defaultTracks.length);
    setCurrentTime(0);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio && duration) {
      const newTime = (value[0] / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const track = defaultTracks[currentTrack];

  // Animated equalizer bars
  const EqualizerBars = () => (
    <div className="flex items-end gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t from-neon-cyan to-neon-pink rounded-full transition-all duration-300 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
          style={{
            height: isPlaying ? `${20 + Math.sin(Date.now() * 0.01 + i) * 15}px` : '4px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.5 + i * 0.1}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <Card 
      className="w-full max-w-2xl mx-auto overflow-hidden"
      style={{ 
        background: '#0f0f0f',
        border: '2px solid #00ffcc',
        borderRadius: '16px',
        boxShadow: `
          0 0 20px #00ffcc50,
          0 0 40px #ff00ff30,
          inset 0 0 20px #00ffcc10
        `
      }}
    >
      <CardContent className="p-6">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 
            className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent"
            style={{
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 10px #00ffcc, 0 0 20px #ff00ff',
              filter: 'drop-shadow(0 0 5px #00ffcc)',
            }}
          >
            🎶 CYBER CITY RADIO
          </h2>
        </div>

        {/* Track Info */}
        <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-black/50 border border-neon-purple/30">
          <div className="flex items-center gap-4">
            <EqualizerBars />
            <div>
              <h3 className="text-neon-cyan font-bold text-lg">{track.title}</h3>
              <p className="text-neon-purple text-sm">{track.artist}</p>
            </div>
          </div>
          <div className="text-neon-pink text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className="w-full cyber-slider"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Button
            onClick={handlePrevious}
            size="sm"
            className="cyber-button-small"
            style={{
              background: 'linear-gradient(45deg, #00ffcc, #0088aa)',
              border: '2px solid #00ffcc',
              borderRadius: '8px',
              boxShadow: '0 0 10px #00ffcc50'
            }}
          >
            <SkipBack size={16} />
          </Button>

          <Button
            onClick={handlePlayPause}
            size="lg"
            className="cyber-button-main"
            style={{
              background: isPlaying 
                ? 'linear-gradient(45deg, #ff00ff, #aa0088)' 
                : 'linear-gradient(45deg, #00ffcc, #0088aa)',
              border: `2px solid ${isPlaying ? '#ff00ff' : '#00ffcc'}`,
              borderRadius: '12px',
              boxShadow: `0 0 20px ${isPlaying ? '#ff00ff' : '#00ffcc'}50`,
              width: '60px',
              height: '60px'
            }}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </Button>

          <Button
            onClick={handleNext}
            size="sm"
            className="cyber-button-small"
            style={{
              background: 'linear-gradient(45deg, #00ffcc, #0088aa)',
              border: '2px solid #00ffcc',
              borderRadius: '8px',
              boxShadow: '0 0 10px #00ffcc50'
            }}
          >
            <SkipForward size={16} />
          </Button>
        </div>

        {/* Volume Control */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsMuted(!isMuted)}
            size="sm"
            variant="ghost"
            className="text-neon-cyan hover:text-neon-pink p-2"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </Button>
          <div className="flex-1 max-w-32">
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="cyber-slider"
            />
          </div>
          <span className="text-neon-purple text-sm w-8">{volume}%</span>
        </div>

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={track.url}
          preload="metadata"
        />

        {/* Visual Effects */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, #00ffcc20 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, #ff00ff20 0%, transparent 50%)
            `,
            animation: isPlaying ? 'pulse 2s ease-in-out infinite' : 'none'
          }}
        />
      </CardContent>

      <style jsx>{`
        .cyber-slider .slider-track {
          background: #333;
        }
        .cyber-slider .slider-range {
          background: linear-gradient(90deg, #00ffcc, #ff00ff);
        }
        .cyber-slider .slider-thumb {
          background: #00ffcc;
          border: 2px solid #fff;
          box-shadow: 0 0 10px #00ffcc;
        }
      `}</style>
    </Card>
  );
};
