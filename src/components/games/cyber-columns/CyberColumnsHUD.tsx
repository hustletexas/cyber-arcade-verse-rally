import React from 'react';
import { Badge } from '@/components/ui/badge';
import { GemType, GEM_COLORS } from '@/types/cyber-columns';
import { Zap, Layers, Trophy, Hash } from 'lucide-react';

interface CyberColumnsHUDProps {
  score: number;
  level: number;
  linesCleared: number;
  chainCount: number;
  nextPiece: [GemType, GemType, GemType];
  isPaused: boolean;
}

const MiniGem: React.FC<{ type: GemType }> = ({ type }) => (
  <div
    className={`w-6 h-6 rounded cyber-gem cyber-gem--${type}`}
  />
);

export const CyberColumnsHUD: React.FC<CyberColumnsHUDProps> = ({
  score, level, linesCleared, chainCount, nextPiece, isPaused,
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-3 p-3 rounded-lg bg-black/40 backdrop-blur-sm border border-neon-cyan/20">
      {/* Score */}
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-accent" />
        <span className="text-xs text-muted-foreground">Score</span>
        <span className="text-lg font-bold text-foreground font-mono">{score.toLocaleString()}</span>
      </div>

      {/* Level */}
      <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan gap-1.5">
        <Zap className="w-3 h-3" /> LVL {level}
      </Badge>

      {/* Lines */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Layers className="w-3 h-3" /> Cleared: <span className="text-foreground font-bold">{linesCleared}</span>
      </div>

      {/* Best chain */}
      {chainCount > 0 && (
        <Badge variant="outline" className="border-neon-pink/50 text-neon-pink gap-1">
          <Hash className="w-3 h-3" /> {chainCount}x Chain
        </Badge>
      )}

      {/* Next piece */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">NEXT</span>
        <div className="cyber-columns-next">
          {nextPiece.map((gem, i) => (
            <MiniGem key={i} type={gem} />
          ))}
        </div>
      </div>

      {isPaused && (
        <Badge className="bg-accent text-accent-foreground animate-pulse">PAUSED</Badge>
      )}
    </div>
  );
};
