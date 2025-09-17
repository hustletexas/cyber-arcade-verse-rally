
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useAchievements } from '@/hooks/useAchievements';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Move, List, X } from 'lucide-react';
import { Track, Playlist } from '@/types/music';
import { cyberDreamsPlaylist } from '@/data/musicPlaylist';
import { TrackActions } from '@/components/music/TrackActions';
import { PlaylistView } from '@/components/music/PlaylistView';

export const CyberMusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlist] = useState<Playlist>(cyberDreamsPlaylist);
  const [tracks, setTracks] = useState<Track[]>(cyberDreamsPlaylist.tracks);
  const audioRef = useRef<HTMLAudioElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { trackAchievement } = useAchievements();

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
      // Track music listening achievement when starting to play
      trackAchievement('tracks_played');
    }
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % tracks.length);
    setCurrentTime(0);
  };

  const handlePrevious = () => {
    setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    setCurrentTime(0);
  };

  const handleTrackSelect = (index: number) => {
    setCurrentTrack(index);
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

  const handleLike = () => {
    setTracks(prev => prev.map((track, index) => 
      index === currentTrack 
        ? { 
            ...track, 
            isLiked: !track.isLiked,
            likes: track.isLiked ? track.likes - 1 : track.likes + 1
          }
        : track
    ));
    
    toast({
      title: tracks[currentTrack].isLiked ? "Removed from favorites" : "Added to favorites",
      description: `${tracks[currentTrack].title} ${tracks[currentTrack].isLiked ? 'removed from' : 'added to'} your favorites`,
    });
  };

  const handleComment = () => {
    toast({
      title: "Comments Coming Soon",
      description: "Comment functionality will be available in the next update",
    });
  };

  const handleShare = () => {
    const track = tracks[currentTrack];
    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Check out "${track.title}" by ${track.artist} on Cyber City Radio`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: `Share "${track.title}" with friends`,
      });
    }
  };

  const handleReplay = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audio.play();
        setIsPlaying(true);
      }
    }
    
    toast({
      title: "Replaying Track",
      description: `"${tracks[currentTrack].title}" started from beginning`,
    });
  };

  const handlePurchaseNFT = () => {
    const track = tracks[currentTrack];
    if (track.nft) {
      toast({
        title: "NFT Purchase",
        description: `Initiating purchase of "${track.title}" NFT for ${track.nft.price} SOL`,
      });
      // Here you would integrate with Solana wallet and marketplace
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;
  const track = tracks[currentTrack];

  // Enhanced animated equalizer bars with more dynamic movement
  const EqualizerBars = () => (
    <div className="flex items-end gap-0.5 h-6">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-gradient-to-t from-neon-cyan via-neon-purple to-neon-pink rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-pulse' : ''
          }`}
          style={{
            height: isPlaying 
              ? `${12 + Math.sin(Date.now() * 0.005 + i * 0.8) * 12}px` 
              : '4px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.3 + i * 0.1}s`,
            transform: isPlaying ? `scaleY(${1 + Math.sin(Date.now() * 0.003 + i) * 0.5})` : 'scaleY(1)'
          }}
        />
      ))}
    </div>
  );

  // Floating music notes animation
  const FloatingNotes = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {isPlaying && [...Array(3)].map((_, i) => (
        <div
          key={i}
          className="absolute text-neon-pink opacity-60 animate-float"
          style={{
            left: `${20 + i * 30}%`,
            top: `${20 + i * 15}%`,
            animationDelay: `${i * 0.5}s`,
            animationDuration: `${2 + i * 0.5}s`,
            fontSize: `${12 + i * 2}px`
          }}
        >
          ♪
        </div>
      ))}
    </div>
  );

  return (
    <Card 
      ref={playerRef}
      className={`w-full max-w-2xl mx-auto overflow-hidden relative transition-all duration-300 ${
        isPlaying ? 'scale-105' : 'scale-100'
      }`}
      style={{ 
        background: '#0f0f0f',
        border: `1px solid ${isPlaying ? '#ff00ff' : '#00ffcc'}`,
        borderRadius: '12px',
        boxShadow: isPlaying 
          ? `
            0 0 25px #ff00ff50,
            0 0 50px #00ffcc30,
            inset 0 0 25px #ff00ff10
          `
          : `
            0 0 15px #00ffcc30,
            0 0 30px #ff00ff20,
            inset 0 0 15px #00ffcc05
          `,
        userSelect: 'none'
      }}
    >
      <CardContent className="p-4 relative">
        <FloatingNotes />

        {/* Header with Title and Playlist Toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-xl font-bold text-neon-pink"
            style={{
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff',
              filter: 'drop-shadow(0 0 8px #ff00ff)'
            }}
          >
            🎶 CYBER CITY RADIO
          </h2>
          
          <Button
            onClick={() => setShowPlaylist(!showPlaylist)}
            size="sm"
            variant="ghost"
            className={`h-8 w-8 p-0 transition-all duration-300 ${
              showPlaylist 
                ? 'text-neon-pink bg-neon-pink/20' 
                : 'text-neon-cyan hover:text-neon-pink'
            }`}
          >
            {showPlaylist ? <X size={16} /> : <List size={16} />}
          </Button>
        </div>

        {/* Track Info */}
        <div 
          className={`flex items-center justify-between mb-4 p-3 rounded-lg bg-black/50 border transition-all duration-300 ${
            isPlaying 
              ? 'border-neon-pink/50 shadow-lg shadow-neon-pink/20' 
              : 'border-neon-purple/30'
          }`}
          style={{
            background: isPlaying 
              ? 'linear-gradient(45deg, rgba(255,0,255,0.1), rgba(0,255,255,0.1))'
              : 'rgba(0,0,0,0.5)'
          }}
        >
          <div className="flex items-center gap-3">
            <div className={`transition-transform duration-300 ${isPlaying ? 'scale-110' : 'scale-100'}`}>
              <EqualizerBars />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-neon-cyan font-bold text-sm truncate">{track.title}</h3>
              <p className="text-neon-purple text-xs truncate">{track.artist}</p>
              <p className="text-neon-green text-xs">{track.genre}</p>
            </div>
          </div>
          <div className="text-neon-pink text-xs">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Slider
            value={[progress]}
            onValueChange={handleSeek}
            max={100}
            step={0.1}
            className={`w-full h-2 transition-all duration-300 ${
              isPlaying ? 'drop-shadow-lg' : ''
            }`}
            style={{
              filter: isPlaying ? 'drop-shadow(0 0 5px #00ffcc)' : 'none'
            }}
          />
        </div>

        {/* Enhanced Controls */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <Button
            onClick={handlePrevious}
            size="sm"
            className={`h-10 w-10 p-0 transition-all duration-300 ${
              isPlaying ? 'animate-pulse hover:rotate-12' : 'hover:rotate-6'
            }`}
            style={{
              background: 'linear-gradient(45deg, #00ffcc, #0088aa)',
              border: '1px solid #00ffcc',
              borderRadius: '8px',
              boxShadow: isPlaying 
                ? '0 0 15px #00ffcc50, 0 0 30px #00ffcc30'
                : '0 0 5px #00ffcc30'
            }}
          >
            <SkipBack size={16} />
          </Button>

          <Button
            onClick={handlePlayPause}
            size="sm"
            className={`h-12 w-12 p-0 transition-all duration-300 ${
              isPlaying ? 'animate-bounce hover:scale-110' : 'hover:scale-105'
            }`}
            style={{
              background: isPlaying 
                ? 'linear-gradient(45deg, #ff00ff, #aa0088)' 
                : 'linear-gradient(45deg, #00ffcc, #0088aa)',
              border: `1px solid ${isPlaying ? '#ff00ff' : '#00ffcc'}`,
              borderRadius: '10px',
              boxShadow: isPlaying
                ? '0 0 20px #ff00ff60, 0 0 40px #ff00ff30'
                : '0 0 10px #00ffcc30',
              transform: isPlaying ? 'scale(1.05)' : 'scale(1)'
            }}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>

          <Button
            onClick={handleNext}
            size="sm"
            className={`h-10 w-10 p-0 transition-all duration-300 ${
              isPlaying ? 'animate-pulse hover:-rotate-12' : 'hover:-rotate-6'
            }`}
            style={{
              background: 'linear-gradient(45deg, #00ffcc, #0088aa)',
              border: '1px solid #00ffcc',
              borderRadius: '8px',
              boxShadow: isPlaying 
                ? '0 0 15px #00ffcc50, 0 0 30px #00ffcc30'
                : '0 0 5px #00ffcc30'
            }}
          >
            <SkipForward size={16} />
          </Button>
        </div>

        {/* Track Actions */}
        <TrackActions
          track={track}
          onLike={handleLike}
          onComment={handleComment}
          onShare={handleShare}
          onReplay={handleReplay}
          onPurchaseNFT={handlePurchaseNFT}
        />

        {/* Volume Control */}
        <div className="flex items-center gap-3 mt-4">
          <Button
            onClick={() => setIsMuted(!isMuted)}
            size="sm"
            variant="ghost"
            className={`text-neon-cyan hover:text-neon-pink p-2 h-8 w-8 transition-all duration-300 ${
              isPlaying ? 'animate-pulse' : ''
            }`}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </Button>
          <div className="flex-1">
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="h-2"
            />
          </div>
          <span className={`text-neon-purple text-sm w-10 text-right transition-all duration-300 ${
            isPlaying ? 'text-neon-pink' : ''
          }`}>{volume}%</span>
        </div>

        {/* Playlist View */}
        {showPlaylist && (
          <PlaylistView
            tracks={tracks}
            currentTrackIndex={currentTrack}
            isPlaying={isPlaying}
            onTrackSelect={handleTrackSelect}
            onPlayPause={handlePlayPause}
          />
        )}

        {/* Hidden Audio Element */}
        <audio
          ref={audioRef}
          src={track.url}
          preload="metadata"
        />

        {/* Enhanced Visual Effects */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-all duration-300 ${
            isPlaying ? 'opacity-20' : 'opacity-10'
          }`}
          style={{
            background: `
              radial-gradient(circle at 20% 50%, #00ffcc30 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, #ff00ff30 0%, transparent 50%)
            `,
            animation: isPlaying ? 'pulse 1.5s ease-in-out infinite, float 3s ease-in-out infinite' : 'none',
            transform: isPlaying ? 'rotate(2deg) scale(1.02)' : 'none'
          }}
        />

        {/* Spinning Border Effect */}
        {isPlaying && (
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg, #ff00ff, #00ffcc, #ff00ff)`,
              borderRadius: '12px',
              padding: '1px',
              animation: 'spin 4s linear infinite',
              opacity: 0.3
            }}
          >
            <div 
              className="w-full h-full rounded-lg"
              style={{ background: '#0f0f0f' }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
