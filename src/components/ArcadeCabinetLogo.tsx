
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TetrisGame } from './games/TetrisGame';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ArcadeCabinetLogo = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tetrisActive, setTetrisActive] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  const handleGameEnd = async (score: number) => {
    setTetrisActive(false);
    
    if (score > highScore) {
      setHighScore(score);
      
      if (user) {
        await submitScore(score);
      } else {
        toast({
          title: "Great Score!",
          description: `Score: ${score} - Login to earn CCTR rewards!`,
        });
      }
    } else {
      toast({
        title: "Game Over",
        description: `Score: ${score} (Best: ${highScore})`,
      });
    }
  };

  const submitScore = async (score: number) => {
    if (!user || isSubmittingScore) return;
    
    setIsSubmittingScore(true);
    
    try {
      // Award CCTR tokens based on score
      const cctrReward = Math.floor(score / 100); // 1 CCTR per 100 points
      
      if (cctrReward > 0) {
        const { error } = await supabase
          .from('token_transactions')
          .insert({
            user_id: user.id,
            amount: cctrReward,
            transaction_type: 'game_reward',
            description: `Tetris high score reward: ${score} points = ${cctrReward} CCTR`
          });

        if (error) throw error;

        toast({
          title: "New High Score!",
          description: `Score: ${score} - Earned ${cctrReward} CCTR tokens!`,
        });
      } else {
        toast({
          title: "New High Score!",
          description: `Score: ${score} - Keep playing to earn CCTR!`,
        });
      }
    } catch (error) {
      console.error('Error submitting score:', error);
      toast({
        title: "Score Saved",
        description: `High score: ${score} - Error awarding tokens`,
        variant: "destructive",
      });
    } finally {
      setIsSubmittingScore(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mb-12">
      <div className="arcade-cabinet-logo">
        {/* Logo Header */}
        <div className="relative">
          <img 
            src="/lovable-uploads/e69784e2-74e3-4705-8685-3738058bf5e2.png" 
            alt="Cyber City Arcade" 
            className="w-full max-w-4xl mx-auto h-auto object-contain neon-glow hover:scale-105 transition-transform duration-300"
          />
          
          {/* Integrated Arcade Screen Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="arcade-screen-overlay">
              <Card className="bg-black/90 border-4 border-neon-cyan p-4 rounded-lg shadow-2xl">
                <CardContent className="p-0">
                  {tetrisActive ? (
                    <div className="w-80 h-96">
                      <TetrisGame 
                        onGameEnd={handleGameEnd} 
                        isActive={tetrisActive} 
                      />
                    </div>
                  ) : (
                    <div className="w-80 h-96 flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="text-4xl mb-4">🧩</div>
                      <h3 className="font-display text-2xl text-neon-cyan">TETRIS</h3>
                      <div className="space-y-2">
                        <div className="text-neon-green font-mono">
                          High Score: {highScore}
                        </div>
                        <Badge className="bg-neon-purple text-black">
                          🪙 Earn CCTR Tokens!
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => setTetrisActive(true)}
                        className="cyber-button px-8 py-3"
                        disabled={isSubmittingScore}
                      >
                        🎮 PLAY TETRIS
                      </Button>
                      <div className="text-xs text-muted-foreground">
                        1 CCTR per 100 points
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Arcade Controls */}
        <div className="arcade-controls-logo mt-8">
          <div className="flex justify-center gap-8">
            <Button 
              onClick={() => setTetrisActive(!tetrisActive)}
              className="arcade-start-button-logo"
              disabled={isSubmittingScore}
            >
              {tetrisActive ? 'PAUSE' : 'START'} GAME
            </Button>
            
            {user && (
              <div className="flex items-center gap-2">
                <Badge className="bg-neon-green text-black">
                  🔐 {user.user_metadata?.username || user.email?.split('@')[0]}
                </Badge>
                <Badge className="bg-neon-cyan text-black">
                  🏆 {highScore}
                </Badge>
              </div>
            )}
          </div>
          
          {!user && (
            <div className="text-center mt-4">
              <Badge className="bg-neon-pink text-black">
                🔐 Login to earn CCTR rewards!
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
