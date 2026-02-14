import React from 'react';
import { Slider } from '@/components/ui/slider';
import { ProDeckState } from '@/hooks/useDJEnginePro';

interface Props {
  deckId: 'A' | 'B';
  deck: ProDeckState;
  color: string;
  onFilter: (freq: number) => void;
  onEcho: (wet: number) => void;
  onActiveFx: (fx: ProDeckState['activeFx']) => void;
}

const FX_LIST: { id: ProDeckState['activeFx']; label: string }[] = [
  { id: 'filter', label: 'FILTER' },
  { id: 'echo', label: 'ECHO' },
  { id: 'reverb', label: 'REVERB' },
  { id: 'flanger', label: 'FLANGER' },
];

export const FXRack: React.FC<Props> = ({ deckId, deck, color, onFilter, onEcho, onActiveFx }) => {
  const getMainValue = () => {
    switch (deck.activeFx) {
      case 'filter': return deck.filterFreq >= 20000 ? 1 : deck.filterFreq / 20000;
      case 'echo': return deck.echoWet;
      case 'reverb': return deck.reverbWet;
      case 'flanger': return deck.flangerWet;
      default: return 0;
    }
  };

  const setMainValue = (v: number) => {
    switch (deck.activeFx) {
      case 'filter': onFilter(v * 20000); break;
      case 'echo': onEcho(v); break;
      // reverb & flanger are placeholder since Web Audio needs ConvolverNode etc.
      default: break;
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-muted-foreground uppercase tracking-widest">FX • Deck {deckId}</span>
      </div>
      <div className="flex gap-1">
        {FX_LIST.map(fx => (
          <button
            key={fx.id}
            onClick={() => onActiveFx(deck.activeFx === fx.id ? null : fx.id)}
            className="flex-1 h-6 rounded text-[8px] font-bold transition-all border"
            style={{
              backgroundColor: deck.activeFx === fx.id ? `${color}25` : 'rgba(255,255,255,0.03)',
              borderColor: deck.activeFx === fx.id ? color : 'rgba(255,255,255,0.08)',
              color: deck.activeFx === fx.id ? color : 'rgba(255,255,255,0.35)',
            }}
          >
            {fx.label}
          </button>
        ))}
      </div>
      {deck.activeFx && (
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-muted-foreground w-8">{deck.activeFx === 'filter' ? 'FREQ' : 'WET'}</span>
          <Slider
            value={[getMainValue()]}
            min={0}
            max={1}
            step={0.01}
            onValueChange={([v]) => setMainValue(v)}
            className="flex-1"
          />
          <span className="text-[9px] font-mono w-8 text-right" style={{ color }}>
            {Math.round(getMainValue() * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};
