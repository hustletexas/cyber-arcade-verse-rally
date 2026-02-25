import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Grid3X3, Heart, Crown, ArrowLeft, Sparkles, Flame } from 'lucide-react';
import { GameMode, Difficulty, DIFFICULTY_CONFIGS } from '@/types/cyber-match';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeasonPass } from '@/hooks/useSeasonPass';

interface CyberMatchModeSelectProps {
  isAuthenticated: boolean;
  hasEnoughCCC: boolean;
  cccBalance: number;
  canPlay: boolean;
  playsRemaining: number;
  onStartGame: (mode: GameMode, difficulty: Difficulty) => void;
}

export const CyberMatchModeSelect: React.FC<CyberMatchModeSelectProps> = ({
  onStartGame
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');
  const { hasPass } = useSeasonPass();
  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];

  const handleStartGame = () => {
    onStartGame('free', selectedDifficulty);
  };

  return (
    <div className="py-4">
      {/* Season Pass Badge */}
      <div className="text-center mb-6">
        <Badge variant="outline" className={cn(
          "text-sm px-4 py-1",
          hasPass 
            ? "border-amber-400/60 text-amber-400 bg-amber-400/10" 
            : "border-muted-foreground/30 text-muted-foreground"
        )}>
          {hasPass ? '🏆 Season Pass — Full Rewards' : '🎮 Free Play — 25% Rewards (Get Season Pass for full rewards)'}
        </Badge>
      </div>

      <div className="text-center mb-8">
        <h2 className="cyber-title text-2xl md:text-3xl text-neon-cyan" data-text="SELECT DIFFICULTY">
          SELECT DIFFICULTY
        </h2>
        <p className="text-muted-foreground mt-2">Free to play • Unlimited games</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
        {difficulties.map(diff => {
          const config = DIFFICULTY_CONFIGS[diff];
          const isSelected = selectedDifficulty === diff;
          return (
            <Card 
              key={diff} 
              onClick={() => setSelectedDifficulty(diff)} 
              className={cn(
                "cyber-glass p-5 cursor-pointer transition-all duration-300",
                diff === 'easy' && isSelected && "border-green-400/70 shadow-[0_0_25px_rgba(74,222,128,0.3)]",
                diff === 'normal' && isSelected && "border-yellow-400/70 shadow-[0_0_25px_rgba(234,179,8,0.3)]",
                diff === 'hard' && isSelected && "border-red-400/70 shadow-[0_0_25px_rgba(239,68,68,0.3)]",
                diff === 'hardest' && isSelected && "border-purple-400/70 shadow-[0_0_25px_rgba(168,85,247,0.3)]",
                !isSelected && "hover:border-neon-cyan/40"
              )}
            >
              <div className="text-center space-y-3">
                <div className={cn(
                  "w-14 h-14 mx-auto rounded-full flex items-center justify-center transition-transform",
                  isSelected && "scale-110",
                  diff === 'easy' && "bg-green-500/20",
                  diff === 'normal' && "bg-yellow-500/20",
                  diff === 'hard' && "bg-red-500/20",
                  diff === 'hardest' && "bg-purple-500/20"
                )}>
                  <Grid3X3 className={cn(
                    "w-7 h-7",
                    diff === 'easy' && "text-green-400",
                    diff === 'normal' && "text-yellow-400",
                    diff === 'hard' && "text-red-400",
                    diff === 'hardest' && "text-purple-400"
                  )} />
                </div>
                <h3 className={cn(
                  "text-xl font-bold",
                  diff === 'easy' && "text-green-400",
                  diff === 'normal' && "text-yellow-400",
                  diff === 'hard' && "text-red-400",
                  diff === 'hardest' && "text-purple-400"
                )}>
                  {config.label.toUpperCase()}
                </h3>
                <p className="text-muted-foreground text-sm">{config.description}</p>
                <Badge variant="outline" className={cn(
                  "text-xs",
                  diff === 'easy' && "border-green-500/50 text-green-400",
                  diff === 'normal' && "border-yellow-500/50 text-yellow-400",
                  diff === 'hard' && "border-red-500/50 text-red-400",
                  diff === 'hardest' && "border-purple-500/50 text-purple-400"
                )}>
                  {config.pairs} pairs
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="text-center mt-8">
        <Button 
          onClick={handleStartGame} 
          size="lg" 
          className="px-10 py-6 text-lg font-bold transition-all hover:scale-105 cyber-cta-primary text-neon-cyan"
        >
          <Play className="w-5 h-5 mr-2" />
          PLAY NOW
        </Button>
      </div>
    </div>
  );
};
