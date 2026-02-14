import React from 'react';
import { Slider } from '@/components/ui/slider';

interface Props {
  eqHi: number;
  eqMid: number;
  eqLow: number;
  gain: number;
  color: string;
  onEQ: (band: 'hi' | 'mid' | 'low', val: number) => void;
  onGain: (val: number) => void;
}

export const EQControls: React.FC<Props> = ({ eqHi, eqMid, eqLow, gain, color, onEQ, onGain }) => {
  return (
    <div className="space-y-1">
      <span className="text-[9px] text-muted-foreground uppercase tracking-widest">EQ</span>
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'HI', value: eqHi, onChange: (v: number) => onEQ('hi', v) },
          { label: 'MID', value: eqMid, onChange: (v: number) => onEQ('mid', v) },
          { label: 'LOW', value: eqLow, onChange: (v: number) => onEQ('low', v) },
          { label: 'GAIN', value: (gain - 1) * 12, onChange: (v: number) => onGain(1 + v / 12) },
        ].map(({ label, value, onChange }) => (
          <div key={label} className="flex flex-col items-center gap-0.5">
            <span className="text-[8px] text-muted-foreground font-bold">{label}</span>
            <div className="h-16 flex items-center justify-center">
              <Slider
                orientation="vertical"
                value={[value]}
                min={-12}
                max={12}
                step={0.5}
                onValueChange={([v]) => onChange(v)}
                className="h-14"
              />
            </div>
            <span className="text-[8px] font-mono" style={{ color: value > 0 ? color : 'rgba(255,255,255,0.4)' }}>
              {value > 0 ? '+' : ''}{value.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
