import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, CircleDot, RotateCcw, Disc3 } from 'lucide-react';
import { ProDeckState } from '@/hooks/useDJEnginePro';
import { ProWaveform } from './ProWaveform';
import { HotCuePads } from './HotCuePads';
import { LoopControls } from './LoopControls';
import { EQControls } from './EQControls';

interface Props {
  label: string;
  deck: ProDeckState;
  deckId: 'A' | 'B';
  color: string;
  onPlayPause: () => void;
  onSetCue: () => void;
  onJumpToCue: () => void;
  onSync: () => void;
  onSeek: (t: number) => void;
  onBPMChange: (bpm: number) => void;
  onBpmRangeToggle: (range: 8 | 16) => void;
  onTapBPM: () => void;
  onEQ: (band: 'hi' | 'mid' | 'low', val: number) => void;
  onGain: (val: number) => void;
  onHotCueSet: (i: number) => void;
  onHotCueJump: (i: number) => void;
  onHotCueClear: (i: number) => void;
  onLoopAuto: (beats: number) => void;
  onLoopIn: () => void;
  onLoopOut: () => void;
  onLoopToggle: () => void;
}

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export const ProDeckControls: React.FC<Props> = ({
  label, deck, deckId, color,
  onPlayPause, onSetCue, onJumpToCue, onSync, onSeek,
  onBPMChange, onBpmRangeToggle, onTapBPM,
  onEQ, onGain,
  onHotCueSet, onHotCueJump, onHotCueClear,
  onLoopAuto, onLoopIn, onLoopOut, onLoopToggle,
}) => {
  const bpmMin = deck.originalBpm * (1 - deck.bpmRange / 100);
  const bpmMax = deck.originalBpm * (1 + deck.bpmRange / 100);

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Disc3
            className="w-5 h-5 animate-spin"
            style={{ color, animationDuration: deck.isPlaying ? '2s' : '0s', animationPlayState: deck.isPlaying ? 'running' : 'paused' }}
          />
          <span className="font-bold text-xs tracking-widest font-display" style={{ color }}>{label}</span>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {formatTime(deck.currentTime)} / {formatTime(deck.duration)}
        </span>
      </div>

      {/* Track Info */}
      {deck.track && (
        <div className="text-center py-1">
          <p className="text-xs font-semibold text-foreground/90 truncate">{deck.track.title}</p>
          <p className="text-[10px] text-muted-foreground">{deck.track.artist} • {deck.track.genre}</p>
        </div>
      )}

      {/* Waveform */}
      <ProWaveform
        data={deck.waveformData}
        color={color}
        currentTime={deck.currentTime}
        duration={deck.duration}
        cuePoint={deck.isCued ? deck.cuePoint : undefined}
        hotCues={deck.hotCues}
        loopIn={deck.loopIn}
        loopOut={deck.loopOut}
        onSeek={onSeek}
      />

      {/* Seek */}
      <Slider
        value={[deck.currentTime]}
        min={0}
        max={deck.duration || 1}
        step={0.1}
        onValueChange={([v]) => onSeek(v)}
        className="w-full"
      />

      {/* Transport */}
      <div className="flex items-center justify-center gap-1.5">
        <Button size="sm" variant="outline" onClick={onJumpToCue} className="border-white/20 text-white/70 text-[10px] px-2 h-7">
          <SkipBack className="w-3 h-3 mr-0.5" /> CUE
        </Button>
        <Button
          size="sm"
          onClick={onPlayPause}
          className="text-[10px] px-4 h-7 font-bold"
          style={{ backgroundColor: color, color: '#000' }}
        >
          {deck.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <Button size="sm" variant="outline" onClick={onSetCue} className="border-white/20 text-white/70 text-[10px] px-2 h-7">
          <CircleDot className="w-3 h-3 mr-0.5" /> SET
        </Button>
        <Button size="sm" variant="outline" onClick={onSync} className="border-neon-purple/50 text-neon-purple text-[10px] px-2 h-7">
          <RotateCcw className="w-3 h-3 mr-0.5" /> SYNC
        </Button>
      </div>

      {/* BPM */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">BPM</span>
            <Button size="sm" variant="ghost" onClick={onTapBPM} className="h-5 px-1.5 text-[9px] text-neon-cyan">
              TAP
            </Button>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono font-bold" style={{ color }}>{deck.bpm.toFixed(1)}</span>
            <Button
              size="sm"
              variant={deck.bpmRange === 8 ? 'default' : 'ghost'}
              onClick={() => onBpmRangeToggle(8)}
              className="h-5 px-1 text-[8px]"
            >
              ±8%
            </Button>
            <Button
              size="sm"
              variant={deck.bpmRange === 16 ? 'default' : 'ghost'}
              onClick={() => onBpmRangeToggle(16)}
              className="h-5 px-1 text-[8px]"
            >
              ±16%
            </Button>
          </div>
        </div>
        <Slider value={[deck.bpm]} min={bpmMin} max={bpmMax} step={0.1} onValueChange={([v]) => onBPMChange(v)} />
      </div>

      {/* 3-Band EQ + Gain */}
      <EQControls
        eqHi={deck.eqHi}
        eqMid={deck.eqMid}
        eqLow={deck.eqLow}
        gain={deck.gain}
        color={color}
        onEQ={onEQ}
        onGain={onGain}
      />

      {/* Hot Cues */}
      <HotCuePads
        hotCues={deck.hotCues}
        color={color}
        onSet={onHotCueSet}
        onJump={onHotCueJump}
        onClear={onHotCueClear}
      />

      {/* Loop Controls */}
      <LoopControls
        loopIn={deck.loopIn}
        loopOut={deck.loopOut}
        isLooping={deck.isLooping}
        loopLength={deck.loopLength}
        color={color}
        onLoopAuto={onLoopAuto}
        onLoopIn={onLoopIn}
        onLoopOut={onLoopOut}
        onLoopToggle={onLoopToggle}
      />
    </div>
  );
};
