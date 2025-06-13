
import React from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';

interface PlayerControlsProps {
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  progress: number;
  currentTime: string;
  duration: string;
  onPlay: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeToggle: () => void;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  volume,
  isMuted,
  progress,
  currentTime,
  duration,
  onPlay,
  onNext,
  onPrevious,
  onVolumeToggle
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
      {/* Main Controls */}
      <div className="flex flex-col items-center gap-2 md:col-start-2">
        <div className="flex items-center gap-2">
          <Button
            onClick={onPrevious}
            size="sm"
            className="cyber-button p-2"
          >
            <SkipBack size={16} />
          </Button>
          <Button
            onClick={onPlay}
            className="cyber-button p-3 bg-neon-cyan text-black hover:bg-neon-pink"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </Button>
          <Button
            onClick={onNext}
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
            <span>{duration}</span>
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
          onClick={onVolumeToggle}
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
  );
};
