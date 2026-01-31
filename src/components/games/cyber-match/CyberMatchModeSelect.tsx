import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Gamepad2, 
  Crown, 
  Play, 
  Coins, 
  Trophy, 
  Sparkles, 
  Zap,
  Grid3X3,
  Heart
} from 'lucide-react';
import { GameMode, Difficulty, DIFFICULTY_CONFIGS, GAME_ENTRY_FEE } from '@/types/cyber-match';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

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

  const difficulties: Difficulty[] = ['easy', 'normal', 'hard'];

  return (
    <div className="py-6 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🎮</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Choose Your Mode</h2>
        <p className="text-neon-cyan/70 max-w-md mx-auto">
          Match pairs of cyber NFT icons. Build streaks for combo multipliers and earn tickets!
        </p>
      </div>

      {/* Mode Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Free Match Card */}
        <Card 
          className={cn(
            "bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-2 transition-all cursor-pointer group hover:scale-[1.02]",
            selectedMode === 'free' 
              ? "border-green-400 shadow-[0_0_30px_rgba(34,197,94,0.4)]" 
              : "border-green-500/30 hover:border-green-400/50 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
          )}
          onClick={() => setSelectedMode('free')}
        >
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-green-400 mb-2">Free Match</h3>
            <p className="text-green-400/70 text-sm mb-4">
              Practice mode - unlimited plays, no pressure!
            </p>
            <div className="space-y-2 text-left text-sm">
              <div className="flex items-center gap-2 text-green-400/80">
                <Sparkles className="w-4 h-4" />
                <span>No entry fee required</span>
              </div>
              <div className="flex items-center gap-2 text-green-400/80">
                <Play className="w-4 h-4" />
                <span>Unlimited plays</span>
              </div>
              <div className="flex items-center gap-2 text-green-400/80">
                <Heart className="w-4 h-4" />
                <span>No mistake limit</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="w-4 h-4" />
                <span>Score not saved to leaderboard</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Daily Match Run Card */}
        <Card 
          className={cn(
            "bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-2 transition-all group",
            isAuthenticated && hasEnoughCCTR && canPlay 
              ? "cursor-pointer hover:scale-[1.02]" 
              : "opacity-80",
            selectedMode === 'daily'
              ? "border-yellow-400 shadow-[0_0_30px_rgba(234,179,8,0.4)]"
              : "border-yellow-500/30 hover:border-yellow-400/50 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]"
          )}
          onClick={() => isAuthenticated && hasEnoughCCTR && canPlay && setSelectedMode('daily')}
        >
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-bold text-yellow-400 mb-2">Daily Match Run</h3>
            <p className="text-yellow-400/70 text-sm mb-4">
              Ranked mode - compete for the leaderboard!
            </p>
            <div className="space-y-2 text-left text-sm">
              <div className="flex items-center gap-2 text-yellow-400/80">
                <Coins className="w-4 h-4" />
                <span>{GAME_ENTRY_FEE} CCTR entry fee</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-400/80">
                <Trophy className="w-4 h-4" />
                <span>Score saved to leaderboard</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-400/80">
                <Zap className="w-4 h-4" />
                <span>Earn tickets for rewards</span>
              </div>
              <div className="flex items-center gap-2 text-red-400/80">
                <Heart className="w-4 h-4" />
                <span>Limited mistakes allowed</span>
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                <p className="text-yellow-400/60 text-xs mb-2">Connect wallet to play</p>
                <WalletStatusBar />
              </div>
            ) : !hasEnoughCCTR ? (
              <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                <p className="text-yellow-400/60 text-xs mb-2">
                  Need {GAME_ENTRY_FEE} CCTR (You have {cctrBalance})
                </p>
                <Link to="/">
                  <Button variant="outline" className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                    Get More CCTR
                  </Button>
                </Link>
              </div>
            ) : !canPlay ? (
              <p className="mt-4 text-yellow-400/60 text-xs">Daily limit reached - come back tomorrow!</p>
            ) : (
              <p className="mt-4 text-yellow-400/60 text-xs">{playsRemaining} plays remaining today</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Difficulty Selection */}
      {selectedMode && (
        <div className="mb-8 animate-fade-in">
          <h3 className="text-lg font-bold text-center mb-4 text-foreground">Select Difficulty</h3>
          <div className="flex justify-center gap-3">
            {difficulties.map((diff) => {
              const config = DIFFICULTY_CONFIGS[diff];
              return (
                <Button
                  key={diff}
                  variant={selectedDifficulty === diff ? "default" : "outline"}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={cn(
                    "flex flex-col h-auto py-3 px-4 gap-1 transition-all",
                    selectedDifficulty === diff 
                      ? "bg-gradient-to-r from-neon-cyan to-neon-pink text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]" 
                      : "border-neon-cyan/30 text-neon-cyan hover:bg-neon-cyan/10"
                  )}
                >
                  <Grid3X3 className="w-5 h-5" />
                  <span className="font-bold">{config.label}</span>
                  <span className="text-xs opacity-70">{config.description}</span>
                  {selectedMode === 'daily' && config.mistakeLimit && (
                    <Badge variant="outline" className="mt-1 text-[10px]">
                      {config.mistakeLimit} mistakes max
                    </Badge>
                  )}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Start Button */}
      {selectedMode && (
        <div className="text-center animate-fade-in">
          <Button
            onClick={handleStartGame}
            size="lg"
            className={cn(
              "px-8 py-6 text-xl font-bold transition-all hover:scale-105",
              selectedMode === 'daily'
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black"
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
            )}
          >
            <Play className="w-6 h-6 mr-2" />
            {selectedMode === 'daily' ? `START (${GAME_ENTRY_FEE} CCTR)` : 'START FREE MATCH'}
          </Button>
        </div>
      )}
    </div>
  );
};
