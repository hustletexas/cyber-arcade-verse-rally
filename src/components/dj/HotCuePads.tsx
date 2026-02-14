import React from 'react';

const HOT_CUE_COLORS = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#0088ff', '#8800ff', '#ff00ff'];

interface Props {
  hotCues: (number | null)[];
  color: string;
  onSet: (i: number) => void;
  onJump: (i: number) => void;
  onClear: (i: number) => void;
}

export const HotCuePads: React.FC<Props> = ({ hotCues, onSet, onJump, onClear }) => {
  return (
    <div>
      <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Hot Cues</span>
      <div className="grid grid-cols-8 gap-0.5 mt-1">
        {hotCues.map((cue, i) => (
          <button
            key={i}
            onClick={() => cue !== null ? onJump(i) : onSet(i)}
            onContextMenu={(e) => { e.preventDefault(); onClear(i); }}
            className="h-7 rounded text-[9px] font-bold transition-all border"
            style={{
              backgroundColor: cue !== null ? `${HOT_CUE_COLORS[i]}30` : 'rgba(255,255,255,0.05)',
              borderColor: cue !== null ? HOT_CUE_COLORS[i] : 'rgba(255,255,255,0.1)',
              color: cue !== null ? HOT_CUE_COLORS[i] : 'rgba(255,255,255,0.3)',
            }}
            title={cue !== null ? `Jump to cue ${i + 1} (right-click to clear)` : `Set cue ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};
