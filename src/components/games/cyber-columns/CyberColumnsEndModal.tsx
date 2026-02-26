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
      <DialogContent className="bg-black/90 border-neon-cyan/30 backdrop-blur-xl max-w-sm text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-neon-cyan flex items-center justify-center gap-2">
            <Trophy className="w-6 h-6" /> GAME OVER
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-5xl font-bold text-foreground font-mono">{score.toLocaleString()}</div>
          <p className="text-muted-foreground text-sm">points</p>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-lg font-bold text-neon-cyan">{level}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-lg font-bold text-neon-pink">{linesCleared}</div>
              <div className="text-xs text-muted-foreground">Cleared</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="text-lg font-bold text-accent">{chainCount}x</div>
              <div className="text-xs text-muted-foreground">Best Chain</div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={onPlayAgain} className="flex-1 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-neon-cyan/30" variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" /> Play Again
            </Button>
            <Button onClick={onBackToMenu} variant="outline" className="flex-1 border-muted-foreground/30 text-muted-foreground hover:bg-white/5">
              <Home className="w-4 h-4 mr-2" /> Menu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
