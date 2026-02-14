import React from 'react';
import { Button } from '@/components/ui/button';
import { Repeat } from 'lucide-react';

interface Props {
  loopIn: number | null;
  loopOut: number | null;
  isLooping: boolean;
  loopLength: number | null;
  color: string;
  onLoopAuto: (beats: number) => void;
  onLoopIn: () => void;
  onLoopOut: () => void;
  onLoopToggle: () => void;
}

const LOOP_SIZES = [1, 2, 4, 8, 16];

export const LoopControls: React.FC<Props> = ({
  loopIn, loopOut, isLooping, loopLength, color,
  onLoopAuto, onLoopIn, onLoopOut, onLoopToggle,
}) => {
  return (
    <div>
      <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Loop</span>
      <div className="flex items-center gap-1 mt-1">
        {LOOP_SIZES.map(size => (
          <button
            key={size}
            onClick={() => onLoopAuto(size)}
            className="h-6 px-1.5 rounded text-[9px] font-bold transition-all border"
            style={{
              backgroundColor: isLooping && loopLength === size ? `${color}30` : 'rgba(255,255,255,0.05)',
              borderColor: isLooping && loopLength === size ? color : 'rgba(255,255,255,0.1)',
              color: isLooping && loopLength === size ? color : 'rgba(255,255,255,0.4)',
            }}
          >
            {size}
          </button>
        ))}
        <Button
          size="sm"
          variant="ghost"
          onClick={onLoopIn}
          className={`h-6 px-1.5 text-[9px] ${loopIn !== null ? 'text-neon-green' : 'text-white/40'}`}
        >
          IN
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onLoopOut}
          className={`h-6 px-1.5 text-[9px] ${loopOut !== null ? 'text-neon-green' : 'text-white/40'}`}
        >
          OUT
        </Button>
        <Button
          size="sm"
          variant={isLooping ? 'default' : 'ghost'}
          onClick={onLoopToggle}
          className="h-6 px-1.5 text-[9px]"
        >
          <Repeat className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};
