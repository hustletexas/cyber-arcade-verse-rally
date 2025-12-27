
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TetrisGame } from './games/TetrisGame';
import { PacManGame } from './games/PacManGame';
import { GalagaGame } from './games/GalagaGame';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TournamentGameInterfaceProps {
  tournamentId: string;
  gameType: 'tetris' | 'pacman' | 'galaga';
  onClose: () => void;
}

export const TournamentGameInterface = ({ 
  tournamentId, 
  gameType, 
  onClose 
}: TournamentGameInterfaceProps) => {
  const { user } = useAuth();
  const [highScore, setHighScore] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  useEffect(() => {
    fetchHighScore();
  }, [user, tournamentId, gameType]);

  useEffect(() => {
    if (isPlaying && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleGameEnd(currentScore);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPlaying, timeRemaining, currentScore]);

  const fetchHighScore = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tournament_participants')
        .select('placement')
        .eq('tournament_id', tournamentId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (data && data.placement) {
        setHighScore(data.placement);
      }
    } catch (error) {
      // No previous score found, using default
    }
  };

  const handleGameEnd = async (score: number) => {
    setCurrentScore(score);
    setIsPlaying(false);
    setGamesPlayed(prev => prev + 1);

    if (score > highScore) {
      setHighScore(score);
      await submitScore(score);
      toast.success(`New high score: ${score}!`);
    } else {
      toast.info(`Score: ${score} (Best: ${highScore})`);
    }
  };

  const submitScore = async (score: number) => {
    if (!user) return;

    try {
      // Use secure server-side function for score submission with validation
      const { data, error } = await supabase.rpc('submit_tournament_score', {
        tournament_id_param: tournamentId,
        score_param: score,
        game_type_param: gameType
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; message?: string; tokens_awarded?: number } | null;

      if (!result?.success) {
        console.error('Score submission failed:', result?.error || result?.message);
        if (result?.error) {
          toast.error(result.error);
        }
        return;
      }

      if (result.tokens_awarded && result.tokens_awarded > 0) {
        toast.success(`Earned ${result.tokens_awarded} CCTR tokens!`);
      }

    } catch (error) {
      console.error('Error submitting score:', error);
      toast.error('Failed to submit score');
    }
  };

  const startGame = () => {
    setIsPlaying(true);
    setCurrentScore(0);
    setTimeRemaining(300);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderGame = () => {
    switch (gameType) {
      case 'tetris':
        return <TetrisGame onGameEnd={handleGameEnd} isActive={isPlaying} />;
      case 'pacman':
        return <PacManGame onGameEnd={handleGameEnd} isActive={isPlaying} />;
      case 'galaga':
        return <GalagaGame onGameEnd={handleGameEnd} isActive={isPlaying} />;
      default:
        return null;
    }
  };

  const getGameTitle = () => {
    switch (gameType) {
      case 'tetris':
        return '🧩 TETRIS TOURNAMENT';
      case 'pacman':
        return '👻 PAC-MAN CHAMPIONSHIP';
      case 'galaga':
        return '🚀 GALAGA BATTLE';
      default:
        return 'TOURNAMENT';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="arcade-frame">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="font-display text-3xl text-neon-cyan">
                {getGameTitle()}
              </CardTitle>
              <Button 
                onClick={onClose}
                variant="outline"
                className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
              >
                ✕ CLOSE
              </Button>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <div className="space-y-1">
                <div className="text-neon-green font-mono">
                  High Score: {highScore}
                </div>
                <div className="text-neon-purple font-mono">
                  Games Played: {gamesPlayed}
                </div>
              </div>
              
              <div className="text-center space-y-1">
                <div className="text-neon-cyan font-mono text-lg">
                  Time: {formatTime(timeRemaining)}
                </div>
                <Badge className={`${isPlaying ? 'bg-neon-green' : 'bg-neon-pink'} text-black`}>
                  {isPlaying ? 'PLAYING' : 'READY'}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {!isPlaying ? (
              <div className="text-center space-y-4">
                <div className="text-lg text-muted-foreground">
                  Ready to compete? You have 5 minutes to achieve your highest score!
                </div>
                <Button 
                  onClick={startGame}
                  className="cyber-button text-xl px-8 py-4"
                  disabled={timeRemaining <= 0}
                >
                  🎮 START GAME
                </Button>
                <div className="text-sm text-muted-foreground">
                  Earn 1 $CCTR token for every 10 points scored!
                </div>
              </div>
            ) : (
              renderGame()
            )}
            
            {timeRemaining <= 0 && !isPlaying && (
              <div className="text-center text-neon-pink font-bold text-xl">
                Tournament Session Complete!
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
