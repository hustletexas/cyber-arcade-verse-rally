import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Zap, Heart, ArrowDown } from 'lucide-react';

interface CyberColumnsModeSelectProps {
  onStart: () => void;
}

export const CyberColumnsModeSelect: React.FC<CyberColumnsModeSelectProps> = ({ onStart }) => {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="cyber-glass p-6 border-neon-cyan/30 bg-cyan-950/20 text-center space-y-4 rounded-xl border">
        <div className="w-16 h-16 mx-auto rounded-full bg-neon-cyan/10 flex items-center justify-center">
          <ArrowDown className="w-8 h-8 text-neon-cyan" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">CYBER COLUMNS</h2>
        <p className="text-muted-foreground text-sm">
          Match 3 neon gems — horizontally, vertically, or diagonally. Chain reactions = massive points.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
            <Zap className="w-3 h-3 mr-1" /> No Entry Fee
          </Badge>
          <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
            <Heart className="w-3 h-3 mr-1" /> Unlimited Plays
          </Badge>
        </div>

        {/* Controls info */}
        <div className="text-left text-xs text-muted-foreground space-y-1 bg-black/30 rounded-lg p-3 border border-white/5">
          <p className="text-neon-cyan font-bold text-sm mb-2">Controls</p>
          <p>← → : Move  •  ↑ : Rotate  •  ↓ : Soft Drop</p>
          <p>Space : Hard Drop  •  P / Esc : Pause</p>
          <p className="mt-1 text-muted-foreground/70">Touch controls available on mobile</p>
        </div>

        <Button
          onClick={onStart}
          className="w-full py-6 text-lg font-bold bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30"
          variant="outline"
        >
          <Gamepad2 className="w-5 h-5 mr-2" />
          PLAY NOW
        </Button>
      </div>
    </div>
  );
};
