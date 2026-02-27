import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Trophy, RotateCcw, Home } from 'lucide-react';

interface CyberColumnsEndModalProps {
  isOpen: boolean;
  score: number;
  level: number;
  linesCleared: number;
  chainCount: number;
  onPlayAgain: () => void;
  onBackToMenu: () => void;
}

export const CyberColumnsEndModal: React.FC<CyberColumnsEndModalProps> = ({
  isOpen, score, level, linesCleared, chainCount, onPlayAgain, onBackToMenu,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="bg-[hsl(240_30%_6%/0.95)] border-[hsl(270_60%_50%/0.3)] backdrop-blur-xl max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[hsl(330_100%_65%)] flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6" /> GAME OVER
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-5xl font-bold text-foreground font-mono">{score.toLocaleString()}</div>
          <p className="text-muted-foreground text-sm">points</p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[hsl(199_100%_50%/0.1)] rounded-lg p-3 border border-[hsl(199_100%_50%/0.2)]">
              <div className="text-lg font-bold text-[hsl(199_100%_60%)]">{level}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </div>
            <div className="bg-[hsl(330_100%_60%/0.1)] rounded-lg p-3 border border-[hsl(330_100%_60%/0.2)]">
              <div className="text-lg font-bold text-[hsl(330_100%_65%)]">{linesCleared}</div>
              <div className="text-xs text-muted-foreground">Cleared</div>
            </div>
            <div className="bg-[hsl(270_60%_50%/0.1)] rounded-lg p-3 border border-[hsl(270_60%_50%/0.2)]">
              <div className="text-lg font-bold text-[hsl(270_80%_75%)]">{chainCount}x</div>
              <div className="text-xs text-muted-foreground">Best Chain</div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={onPlayAgain} className="flex-1 bg-gradient-to-r from-[hsl(270_60%_50%/0.3)] to-[hsl(330_100%_60%/0.3)] text-[hsl(330_100%_75%)] border border-[hsl(330_100%_60%/0.5)] hover:from-[hsl(270_60%_50%/0.4)] hover:to-[hsl(330_100%_60%/0.4)]" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" /> Play Again
            </Button>
            <Button onClick={onBackToMenu} variant="outline" className="flex-1 border-muted-foreground/30 text-muted-foreground hover:bg-[hsl(0_0%_100%/0.05)]">
              <Home className="w-4 h-4 mr-2" /> Menu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
