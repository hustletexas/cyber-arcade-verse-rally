import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Zap, Heart } from 'lucide-react';
import cyberColumnsBanner from '@/assets/cyber-columns-banner.png';

interface CyberColumnsModeSelectProps {
  onStart: () => void;
}

export const CyberColumnsModeSelect: React.FC<CyberColumnsModeSelectProps> = ({ onStart }) => {
  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="relative rounded-xl overflow-hidden border border-[hsl(270_60%_50%/0.3)] bg-[hsl(240_30%_8%/0.4)] backdrop-blur-xl text-center space-y-5 p-6">
        {/* Banner image */}
        <div className="relative -mx-6 -mt-6 mb-2">
          <img
            src={cyberColumnsBanner}
            alt="Cyber Columns Galaxy Edition"
            className="w-full h-auto"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(240_30%_8%)] via-transparent to-transparent" />
        </div>

        <p className="text-muted-foreground text-sm">
          Match 3 neon gems — horizontally, vertically, or diagonally. Chain reactions = massive points.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="outline" className="border-[hsl(270_60%_50%/0.5)] text-[hsl(270_80%_75%)]">
            <Zap className="w-3 h-3 mr-1" /> No Entry Fee
          </Badge>
          <Badge variant="outline" className="border-[hsl(330_100%_60%/0.5)] text-[hsl(330_100%_65%)]">
            <Heart className="w-3 h-3 mr-1" /> Unlimited Plays
          </Badge>
        </div>

        {/* Controls info */}
        <div className="text-left text-xs text-muted-foreground space-y-1 bg-[hsl(0_0%_0%/0.3)] rounded-lg p-3 border border-[hsl(270_60%_50%/0.1)]">
          <p className="text-[hsl(330_100%_65%)] font-bold text-sm mb-2">Controls</p>
          <p>← → : Move  •  ↑ : Rotate  •  ↓ : Soft Drop</p>
          <p>Space : Hard Drop  •  P / Esc : Pause</p>
          <p className="mt-1 text-muted-foreground/70">Touch controls available on mobile</p>
        </div>

        <Button
          onClick={onStart}
          className="w-full py-6 text-lg font-bold bg-gradient-to-r from-[hsl(270_60%_50%/0.3)] to-[hsl(330_100%_60%/0.3)] text-[hsl(330_100%_75%)] border border-[hsl(330_100%_60%/0.5)] hover:from-[hsl(270_60%_50%/0.4)] hover:to-[hsl(330_100%_60%/0.4)]"
          variant="outline"
        >
          <Gamepad2 className="w-5 h-5 mr-2" />
          PLAY NOW
        </Button>
      </div>
    </div>
  );
};
