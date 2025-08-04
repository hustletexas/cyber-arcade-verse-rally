
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PacManGame } from '../games/PacManGame';
import { TetrisGame } from '../games/TetrisGame';
import { GalagaGame } from '../games/GalagaGame';

interface Game {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  thumbnail: string;
  highScore: number;
  rewardMultiplier: number;
  isLocked: boolean;
  unlockRequirement?: string;
}

interface GamePlayerProps {
  game: Game;
  onBack: () => void;
}

export const GamePlayer: React.FC<GamePlayerProps> = ({ game, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    gamesPlayed: 0,
    bestScore: 0,
    tokensEarned: 0
  });

  const handleGameEnd = (score: number) => {
    setCurrentScore(score);
    setIsPlaying(false);
    
    // Calculate token rewards based on score and multiplier
    const baseTokens = Math.floor(score / 100);
    const bonusTokens = Math.floor(baseTokens * (game.rewardMultiplier - 1));
    const totalTokens = baseTokens + bonusTokens;

    setSessionStats(prev => ({
      gamesPlayed: prev.gamesPlayed + 1,
      bestScore: Math.max(prev.bestScore, score),
      tokensEarned: prev.tokensEarned + totalTokens
    }));

    // TODO: Submit score to blockchain/database
    console.log('Game ended:', { score, tokensEarned: totalTokens });
  };

  const startGame = () => {
    setIsPlaying(true);
    setCurrentScore(0);
  };

  const renderGame = () => {
    switch (game.id) {
      case 'pac-man-classic':
        return <PacManGame onGameEnd={handleGameEnd} isActive={isPlaying} />;
      case 'tetris-cyber':
        return <TetrisGame onGameEnd={handleGameEnd} isActive={isPlaying} />;
      case 'galaga-deluxe':
        return <GalagaGame onGameEnd={handleGameEnd} isActive={isPlaying} />;
      default:
        return (
          <Card className="arcade-frame">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">{game.thumbnail}</div>
              <h3 className="text-xl font-bold text-neon-cyan mb-2">{game.title}</h3>
              <p className="text-gray-400 mb-6">Game implementation coming soon...</p>
              <Button onClick={startGame} className="cyber-button" disabled={isPlaying}>
                🎮 {isPlaying ? 'Playing...' : 'Start Game'}
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <Card className="arcade-frame">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{game.thumbnail}</div>
              <div>
                <CardTitle className="font-display text-2xl text-neon-cyan">
                  {game.title}
                </CardTitle>
                <p className="text-muted-foreground">{game.description}</p>
              </div>
            </div>
            <Button onClick={onBack} variant="outline" className="border-neon-pink text-neon-pink">
              ← Back to Library
            </Button>
          </div>
          
          {/* Session Stats */}
          <div className="flex gap-4 mt-4">
            <Badge className="bg-neon-green/20 text-neon-green">
              Games Played: {sessionStats.gamesPlayed}
            </Badge>
            <Badge className="bg-neon-purple/20 text-neon-purple">
              Best Score: {sessionStats.bestScore.toLocaleString()}
            </Badge>
            <Badge className="bg-neon-cyan/20 text-neon-cyan">
              CCTR Earned: {sessionStats.tokensEarned}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Game Area */}
      <div className="relative">
        {!isPlaying && (
          <Card className="arcade-frame mb-4">
            <CardContent className="text-center py-6">
              <div className="space-y-4">
                <div className="text-lg text-neon-cyan font-bold">Ready to Play?</div>
                <div className="flex justify-center gap-4 text-sm text-gray-400">
                  <span>High Score: {game.highScore.toLocaleString()}</span>
                  <span>•</span>
                  <span>Multiplier: {game.rewardMultiplier}x</span>
                  <span>•</span>
                  <span>Difficulty: {game.difficulty}</span>
                </div>
                <Button onClick={startGame} className="cyber-button text-xl px-8 py-4">
                  🎮 START GAME
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {renderGame()}
      </div>

      {/* Reward Notification */}
      {currentScore > 0 && !isPlaying && (
        <Card className="arcade-frame border-neon-green/60">
          <CardContent className="text-center py-6">
            <div className="space-y-2">
              <div className="text-2xl text-neon-green font-bold">
                🎉 Game Complete!
              </div>
              <div className="text-lg text-neon-cyan">
                Score: {currentScore.toLocaleString()}
              </div>
              <div className="text-neon-purple">
                CCTR Earned: {Math.floor(currentScore / 100 * game.rewardMultiplier)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
