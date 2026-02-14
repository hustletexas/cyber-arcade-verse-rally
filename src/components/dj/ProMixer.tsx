import React, { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Download, Square, Circle } from 'lucide-react';
import { VUMeter } from './VUMeter';
import { FXRack } from './FXRack';
import { ProDeckState } from '@/hooks/useDJEnginePro';

interface Props {
  deckA: ProDeckState;
  deckB: ProDeckState;
  crossfader: number;
  channelFaderA: number;
  channelFaderB: number;
  masterVolume: number;
  masterPeakL: number;
  masterPeakR: number;
  isRecording: boolean;
  recordingDuration: number;
  onCrossfader: (v: number) => void;
  onChannelFaderA: (v: number) => void;
  onChannelFaderB: (v: number) => void;
  onMasterVolume: (v: number) => void;
  onFilterA: (f: number) => void;
  onEchoA: (w: number) => void;
  onActiveFxA: (fx: ProDeckState['activeFx']) => void;
  onFilterB: (f: number) => void;
  onEchoB: (w: number) => void;
  onActiveFxB: (fx: ProDeckState['activeFx']) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onDownloadRecording: () => void;
  hasRecording: boolean;
}

const formatDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

export const ProMixer: React.FC<Props> = ({
  deckA, deckB, crossfader, channelFaderA, channelFaderB,
  masterVolume, masterPeakL, masterPeakR,
  isRecording, recordingDuration,
  onCrossfader, onChannelFaderA, onChannelFaderB, onMasterVolume,
  onFilterA, onEchoA, onActiveFxA,
  onFilterB, onEchoB, onActiveFxB,
  onStartRecording, onStopRecording, onDownloadRecording, hasRecording,
}) => {
  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm">
      {/* FX Rack A */}
      <FXRack
        deckId="A"
        deck={deckA}
        color="#00ffff"
        onFilter={onFilterA}
        onEcho={onEchoA}
        onActiveFx={onActiveFxA}
      />

      {/* Channel Faders + VU */}
      <div className="flex items-end justify-center gap-3">
        {/* Channel A fader */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] text-neon-cyan font-bold">A</span>
          <div className="h-24">
            <Slider
              orientation="vertical"
              value={[channelFaderA]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={([v]) => onChannelFaderA(v)}
              className="h-20"
            />
          </div>
        </div>

        {/* VU Meters */}
        <VUMeter level={deckA.peakLevel} label="A" color="#00ffff" height={90} />
        <VUMeter level={masterPeakL} label="L" color="#00ff00" height={90} />
        <VUMeter level={masterPeakR} label="R" color="#00ff00" height={90} />
        <VUMeter level={deckB.peakLevel} label="B" color="#ff00ff" height={90} />

        {/* Channel B fader */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[8px] text-neon-pink font-bold">B</span>
          <div className="h-24">
            <Slider
              orientation="vertical"
              value={[channelFaderB]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={([v]) => onChannelFaderB(v)}
              className="h-20"
            />
          </div>
        </div>
      </div>

      {/* Master Volume */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px]">
          <span className="text-muted-foreground uppercase tracking-widest">Master</span>
          <span className="font-mono text-neon-green">{Math.round(masterVolume * 100)}%</span>
        </div>
        <Slider value={[masterVolume]} min={0} max={1} step={0.01} onValueChange={([v]) => onMasterVolume(v)} />
      </div>

      {/* Crossfader */}
      <div className="space-y-1">
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Crossfader</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-neon-cyan font-bold">A</span>
          <Slider value={[crossfader]} min={0} max={1} step={0.01} onValueChange={([v]) => onCrossfader(v)} className="flex-1" />
          <span className="text-[10px] text-neon-pink font-bold">B</span>
        </div>
      </div>

      {/* FX Rack B */}
      <FXRack
        deckId="B"
        deck={deckB}
        color="#ff00ff"
        onFilter={onFilterB}
        onEcho={onEchoB}
        onActiveFx={onActiveFxB}
      />

      {/* Record Controls */}
      <div className="flex flex-col items-center gap-1.5 pt-2 border-t border-white/10">
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Record Mix</span>
        {!isRecording ? (
          <Button size="sm" onClick={onStartRecording} className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-7">
            <Circle className="w-3 h-3 mr-1 fill-white" /> REC
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={onStopRecording} className="bg-red-800 hover:bg-red-900 text-white text-[10px] h-7 animate-pulse">
              <Square className="w-3 h-3 mr-1" /> STOP
            </Button>
            <span className="text-[10px] text-red-400 font-mono">{formatDuration(recordingDuration)}</span>
          </div>
        )}
        {hasRecording && (
          <Button
            size="sm"
            variant="outline"
            onClick={onDownloadRecording}
            className="border-neon-green/40 text-neon-green text-[10px] h-7"
          >
            <Download className="w-3 h-3 mr-1" /> Download Mix
          </Button>
        )}
      </div>
    </div>
  );
};
