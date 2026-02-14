import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, Disc3, CircleDot } from 'lucide-react';
import { DeckState } from '@/hooks/useDJEngine';
import { WaveformDisplay } from './WaveformDisplay';
import { Track } from '@/types/music';

interface DeckControlsProps {
  label: string;
  deck: DeckState;
  color: string;
  tracks: Track[];
  onLoadTrack: (track: Track) => void;
  onPlayPause: () => void;
  onSetCue: () => void;
  onJumpToCue: () => void;
  onVolumeChange: (vol: number) => void;
  onBPMChange: (bpm: number) => void;
  onFilterChange: (freq: number) => void;
  onEchoChange: (wet: number) => void;
  onSeek: (time: number) => void;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export const DeckControls: React.FC<DeckControlsProps> = ({
  label, deck, color, tracks,
  onLoadTrack, onPlayPause, onSetCue, onJumpToCue,
  onVolumeChange, onBPMChange, onFilterChange, onEchoChange, onSeek,
}) => {
  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm">
      {/* Deck Label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc3 className="w-5 h-5 animate-spin" style={{ color, animationDuration: deck.isPlaying ? '2s' : '0s', animationPlayState: deck.isPlaying ? 'running' : 'paused' }} />
          <span className="font-bold text-sm tracking-wider" style={{ color }}>{label}</span>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          {formatTime(deck.currentTime)} / {formatTime(deck.duration)}
        </span>
      </div>

      {/* Track Selector */}
      <select
        className="bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-xs text-white/80 focus:outline-none focus:border-white/40"
        value={deck.track?.id || ''}
        onChange={(e) => {
          const t = tracks.find(tr => tr.id === e.target.value);
          if (t) onLoadTrack(t);
        }}
      >
        <option value="">Load Track...</option>
        {tracks.map(t => (
          <option key={t.id} value={t.id}>{t.artist} - {t.title}</option>
        ))}
      </select>

      {/* Track Info */}
      {deck.track && (
        <div className="text-center">
          <p className="text-sm font-semibold text-white/90 truncate">{deck.track.title}</p>
          <p className="text-xs text-white/50">{deck.track.artist}</p>
        </div>
      )}

      {/* Waveform */}
      <WaveformDisplay data={deck.waveformData} color={color} height={50} />

      {/* Seek bar */}
      <Slider
        value={[deck.currentTime]}
        min={0}
        max={deck.duration || 1}
        step={0.1}
        onValueChange={([v]) => onSeek(v)}
        className="w-full"
      />

      {/* Transport Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button size="sm" variant="outline" onClick={onJumpToCue} className="border-white/20 text-white/70 hover:text-white text-xs px-2">
          <SkipBack className="w-3 h-3 mr-1" /> CUE
        </Button>
        <Button
          size="sm"
          onClick={onPlayPause}
          className="text-xs px-4"
          style={{ backgroundColor: color, color: '#000' }}
        >
          {deck.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button size="sm" variant="outline" onClick={onSetCue} className="border-white/20 text-white/70 hover:text-white text-xs px-2">
          <CircleDot className="w-3 h-3 mr-1" /> SET
        </Button>
      </div>

      {/* BPM Control */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>BPM</span>
          <span className="font-mono" style={{ color }}>{deck.bpm}</span>
        </div>
        <Slider
          value={[deck.bpm]}
          min={60}
          max={200}
          step={1}
          onValueChange={([v]) => onBPMChange(v)}
        />
      </div>

      {/* Volume */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Volume</span>
          <span className="font-mono">{Math.round(deck.volume * 100)}%</span>
        </div>
        <Slider
          value={[deck.volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([v]) => onVolumeChange(v)}
        />
      </div>

      {/* Filter */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Filter</span>
          <span className="font-mono">{deck.filterFreq >= 20000 ? 'OFF' : `${Math.round(deck.filterFreq)}Hz`}</span>
        </div>
        <Slider
          value={[deck.filterFreq]}
          min={100}
          max={20000}
          step={100}
          onValueChange={([v]) => onFilterChange(v)}
        />
      </div>

      {/* Echo */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-white/60">
          <span>Echo FX</span>
          <span className="font-mono">{Math.round(deck.echoWet * 100)}%</span>
        </div>
        <Slider
          value={[deck.echoWet]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={([v]) => onEchoChange(v)}
        />
      </div>
    </div>
  );
};
