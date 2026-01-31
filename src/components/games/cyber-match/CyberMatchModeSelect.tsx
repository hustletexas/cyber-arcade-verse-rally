import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Crown, 
  Play, 
  Coins, 
  Trophy, 
  Sparkles, 
  Flame,
  Grid3X3,
  Heart,
  Ticket,
  ArrowLeft
} from 'lucide-react';
import { GameMode, Difficulty, DIFFICULTY_CONFIGS, GAME_ENTRY_FEE } from '@/types/cyber-match';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CyberMatchModeSelectProps {
  isAuthenticated: boolean;
  hasEnoughCCTR: boolean;
  cctrBalance: number;
  canPlay: boolean;
  playsRemaining: number;
  onStartGame: (mode: GameMode, difficulty: Difficulty) => void;
}

export const CyberMatchModeSelect: React.FC<CyberMatchModeSelectProps> = ({
  isAuthenticated,
  hasEnoughCCTR,
  cctrBalance,
  canPlay,
  playsRemaining,
  onStartGame,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');

  const handleStartGame = () => {
    if (selectedMode) {
      onStartGame(selectedMode, selectedDifficulty);
    }
  };

  const handleBack = () => {
    setSelectedMode(null);
  };

  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];

  return (
    <AnimatePresence mode="wait">
      {selectedMode ? (
        <motion.div
          key="difficulty-select"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="py-4"
        >
          {/* Difficulty Selection */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="text-neon-cyan hover:text-neon-cyan/80 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h2 className="cyber-title text-2xl md:text-3xl text-neon-cyan" data-text="SELECT DIFFICULTY">
              SELECT DIFFICULTY
            </h2>
            <p className="text-gray-400 mt-2">
              {selectedMode === 'free' ? 'Free Match - Practice Mode' : 'Daily Run - Ranked Mode'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {difficulties.map((diff) => {
              const config = DIFFICULTY_CONFIGS[diff];
              const isSelected = selectedDifficulty === diff;
              const colorClass = diff === 'easy' ? 'green' : diff === 'normal' ? 'yellow' : 'red';
              
              return (
                <Card
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={cn(
                    "cyber-glass p-5 cursor-pointer transition-all duration-300",
                    isSelected && `border-${colorClass}-400/70 shadow-[0_0_25px_rgba(var(--${colorClass}-glow),0.3)]`,
                    diff === 'easy' && isSelected && "border-green-400/70 shadow-[0_0_25px_rgba(74,222,128,0.3)]",
                    diff === 'normal' && isSelected && "border-yellow-400/70 shadow-[0_0_25px_rgba(234,179,8,0.3)]",
                    diff === 'hard' && isSelected && "border-red-400/70 shadow-[0_0_25px_rgba(239,68,68,0.3)]",
                    !isSelected && "hover:border-neon-cyan/40"
                  )}
                >
                  <div className="text-center space-y-3">
                    <div className={cn(
                      "w-14 h-14 mx-auto rounded-full flex items-center justify-center transition-transform",
                      isSelected && "scale-110",
                      diff === 'easy' && "bg-green-500/20",
                      diff === 'normal' && "bg-yellow-500/20",
                      diff === 'hard' && "bg-red-500/20"
                    )}>
                      <Grid3X3 className={cn(
                        "w-7 h-7",
                        diff === 'easy' && "text-green-400",
                        diff === 'normal' && "text-yellow-400",
                        diff === 'hard' && "text-red-400"
                      )} />
                    </div>
                    <h3 className={cn(
                      "text-xl font-bold",
                      diff === 'easy' && "text-green-400",
                      diff === 'normal' && "text-yellow-400",
                      diff === 'hard' && "text-red-400"
                    )}>
                      {config.label.toUpperCase()}
                    </h3>
                    <p className="text-gray-400 text-sm">{config.description}</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="outline" className={cn(
                        "text-xs",
                        diff === 'easy' && "border-green-500/50 text-green-400",
                        diff === 'normal' && "border-yellow-500/50 text-yellow-400",
                        diff === 'hard' && "border-red-500/50 text-red-400"
                      )}>
                        {config.pairs} pairs
                      </Badge>
                      {selectedMode === 'daily' && config.mistakeLimit && (
                        <Badge variant="outline" className="border-gray-500/50 text-gray-400 text-xs">
                          {config.mistakeLimit} mistakes
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Start Button */}
          <div className="text-center mt-8">
            <Button
              onClick={handleStartGame}
              size="lg"
              className={cn(
                "px-10 py-6 text-lg font-bold transition-all hover:scale-105",
                selectedMode === 'daily'
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
                  : "cyber-cta-primary text-neon-cyan"
              )}
            >
              <Play className="w-5 h-5 mr-2" />
              {selectedMode === 'daily' ? `START (${GAME_ENTRY_FEE} CCTR)` : 'START FREE MATCH'}
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="mode-select"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Mode Selection CTAs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Match Card */}
            <Card 
              className={cn(
                "cyber-glass p-6 cursor-pointer transition-all duration-300 hover:border-neon-cyan/50",
                "hover:shadow-[0_0_30px_rgba(6,182,212,0.2)]"
              )}
              onClick={() => setSelectedMode('free')}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-neon-cyan/10 flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 text-neon-cyan" />
                </div>
                <h2 className="text-2xl font-bold text-white">FREE MATCH</h2>
                <p className="text-gray-400 text-sm">
                  Practice mode • Unlimited plays • No pressure
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
                    <Flame className="w-3 h-3 mr-1" />
                    Streak Meter
                  </Badge>
                  <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Combo Multiplier
                  </Badge>
                  <Badge variant="outline" className="border-neon-cyan/50 text-neon-cyan">
                    <Heart className="w-3 h-3 mr-1" />
                    Unlimited Mistakes
                  </Badge>
                </div>
                <Button 
                  className="cyber-cta-primary w-full py-6 text-lg font-bold text-neon-cyan"
                >
                  🎮 PLAY FREE
                </Button>
              </div>
            </Card>

            {/* Daily Match Run Card */}
            <Card 
              className={cn(
                "cyber-glass-pink p-6 transition-all duration-300",
                isAuthenticated && hasEnoughCCTR && canPlay 
                  ? "cursor-pointer hover:border-neon-pink/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]" 
                  : "opacity-80"
              )}
              onClick={() => isAuthenticated && hasEnoughCCTR && canPlay && setSelectedMode('daily')}
            >
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-neon-pink/10 flex items-center justify-center">
                  <Crown className="w-8 h-8 text-neon-pink" />
                </div>
                <h2 className="text-2xl font-bold text-white">DAILY RUN</h2>
                <p className="text-gray-400 text-sm">
                  Ranked mode • {GAME_ENTRY_FEE} CCTR entry • Compete for leaderboard
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  <Badge variant="outline" className="border-neon-pink/50 text-neon-pink">
                    <Trophy className="w-3 h-3 mr-1" />
                    Leaderboard
                  </Badge>
                  <Badge variant="outline" className="border-neon-pink/50 text-neon-pink">
                    <Ticket className="w-3 h-3 mr-1" />
                    Earn Tickets
                  </Badge>
                  <Badge variant="outline" className="border-neon-pink/50 text-neon-pink">
                    <Coins className="w-3 h-3 mr-1" />
                    Win Rewards
                  </Badge>
                </div>

                {!isAuthenticated ? (
                  <div className="pt-2">
                    <p className="text-neon-pink/60 text-xs mb-2">Connect wallet to play</p>
                    <Button 
                      variant="outline"
                      className="w-full py-5 border-neon-pink/50 text-neon-pink"
                      disabled
                    >
                      🔒 WALLET REQUIRED
                    </Button>
                  </div>
                ) : !hasEnoughCCTR ? (
                  <div className="pt-2">
                    <p className="text-neon-pink/60 text-xs mb-2">
                      Need {GAME_ENTRY_FEE} CCTR (You have {cctrBalance})
                    </p>
                    <Button 
                      variant="outline"
                      className="w-full py-5 border-yellow-500/50 text-yellow-400"
                    >
                      💰 GET MORE CCTR
                    </Button>
                  </div>
                ) : !canPlay ? (
                  <div className="pt-2">
                    <p className="text-neon-pink/60 text-xs mb-2">Daily limit reached</p>
                    <Button 
                      variant="outline"
                      className="w-full py-5 border-neon-pink/50 text-neon-pink"
                      disabled
                    >
                      ⏰ COME BACK TOMORROW
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="cyber-cta-secondary w-full py-6 text-lg font-bold text-neon-pink"
                  >
                    🏆 START DAILY RUN
                    <span className="ml-2 text-sm opacity-70">({playsRemaining} left)</span>
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
