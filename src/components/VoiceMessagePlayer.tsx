
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2 } from 'lucide-react';

interface VoiceMessagePlayerProps {
  audioBlob: Blob;
  duration: number;
  username: string;
  isOwnMessage: boolean;
}

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({ 
  audioBlob, 
  duration, 
  username, 
  isOwnMessage 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnd = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [audioUrl]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div 
      className={`flex items-center gap-3 p-3 rounded-lg border ${
        isOwnMessage 
          ? 'border-neon-pink/30 bg-neon-pink/5' 
          : 'border-neon-cyan/30 bg-neon-cyan/5'
      }`}
    >
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      {/* Play Button */}
      <Button
        onClick={togglePlayback}
        size="sm"
        className={`rounded-full w-8 h-8 p-0 ${
          isOwnMessage
            ? 'bg-neon-pink/20 hover:bg-neon-pink/30 border-neon-pink'
            : 'bg-neon-cyan/20 hover:bg-neon-cyan/30 border-neon-cyan'
        }`}
      >
        {isPlaying ? <Pause size={12} /> : <Play size={12} />}
      </Button>

      {/* Waveform Visualization (simplified) */}
      <div className="flex-1 flex items-center gap-1">
        <Volume2 size={14} className={isOwnMessage ? 'text-neon-pink' : 'text-neon-cyan'} />
        
        {/* Progress Bar */}
        <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-200 ${
              isOwnMessage ? 'bg-neon-pink' : 'bg-neon-cyan'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Duration */}
        <span className="text-xs text-gray-400 min-w-[35px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      {/* Voice Badge */}
      <Badge 
        className={`${
          isOwnMessage
            ? 'bg-neon-pink/20 text-neon-pink border-neon-pink'
            : 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan'
        }`}
      >
        🎤 Voice
      </Badge>
    </div>
  );
};
