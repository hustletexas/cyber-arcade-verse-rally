
import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSolanaScore } from '@/hooks/useSolanaScore';
import { useToast } from '@/hooks/use-toast';

interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Player {
  x: number;
  y: number;
  width: number;
  height: number;
  velocityY: number;
  speed: number;
  onGround: boolean;
}

interface SolajumpGameProps {
  onGameEnd: (score: number) => void;
  isActive: boolean;
}

export const SolajumpGame: React.FC<SolajumpGameProps> = ({ onGameEnd, isActive }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const animationIdRef = useRef<number>();
  const [score, setScore] = useState(0);
  const [highestPlatform, setHighestPlatform] = useState(0);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'ended'>('idle');
  const { submitScore, isSubmitting } = useSolanaScore();
  const { toast } = useToast();

  // Game state refs
  const playerRef = useRef<Player>({
    x: 375,
    y: 500,
    width: 30,
    height: 30,
    velocityY: 0,
    speed: 5,
    onGround: false
  });

  const platformsRef = useRef<Platform[]>([]);
  const cameraYRef = useRef(0);
  const keysRef = useRef({ left: false, right: false, space: false });

  const initializePlatforms = () => {
    platformsRef.current = [];
    
    // Ground platform
    platformsRef.current.push({
      x: 0,
      y: 580,
      width: 800,
      height: 20
    });

    // Generate platforms going up
    for (let i = 1; i < 100; i++) {
      platformsRef.current.push({
        x: Math.random() * (800 - 120) + 10,
        y: 580 - (i * 100),
        width: 100 + Math.random() * 50,
        height: 20
      });
    }
  };

  const resetGame = () => {
    playerRef.current = {
      x: 375,
      y: 500,
      width: 30,
      height: 30,
      velocityY: 0,
      speed: 5,
      onGround: false
    };
    cameraYRef.current = 0;
    setScore(0);
    setHighestPlatform(0);
    initializePlatforms();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        keysRef.current.left = true;
        e.preventDefault();
        break;
      case 'ArrowRight':
      case 'KeyD':
        keysRef.current.right = true;
        e.preventDefault();
        break;
      case 'Space':
      case 'ArrowUp':
      case 'KeyW':
        keysRef.current.space = true;
        e.preventDefault();
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        keysRef.current.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        keysRef.current.right = false;
        break;
      case 'Space':
      case 'ArrowUp':
      case 'KeyW':
        keysRef.current.space = false;
        break;
    }
  };

  const gameLoop = () => {
    if (gameState !== 'playing' || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const player = playerRef.current;
    const platforms = platformsRef.current;

    // Handle input
    if (keysRef.current.left && player.x > 0) {
      player.x -= player.speed;
    }
    if (keysRef.current.right && player.x < canvas.width - player.width) {
      player.x += player.speed;
    }
    if (keysRef.current.space && player.onGround) {
      player.velocityY = -15;
      player.onGround = false;
    }

    // Apply gravity
    player.velocityY += 0.6;
    player.y += player.velocityY;

    // Platform collision
    player.onGround = false;
    for (let i = 0; i < platforms.length; i++) {
      const platform = platforms[i];
      
      // Check collision
      if (
        player.x < platform.x + platform.width &&
        player.x + player.width > platform.x &&
        player.y + player.height > platform.y &&
        player.y + player.height < platform.y + platform.height + 15 &&
        player.velocityY >= 0
      ) {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.onGround = true;

        // Update score based on height
        if (i > highestPlatform) {
          setHighestPlatform(i);
          setScore(i * 100);
        }
        break;
      }
    }

    // Update camera to follow player
    const targetCameraY = Math.max(0, player.y - 400);
    cameraYRef.current += (targetCameraY - cameraYRef.current) * 0.05;

    // Game over condition
    if (player.y > cameraYRef.current + 700) {
      setGameState('ended');
      onGameEnd(score);
      return;
    }

    // Clear canvas
    ctx.fillStyle = '#000022';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#00ff88';
    platforms.forEach((platform) => {
      const screenY = platform.y - cameraYRef.current;
      if (screenY > -50 && screenY < canvas.height + 50) {
        ctx.fillRect(platform.x, screenY, platform.width, platform.height);
      }
    });

    // Draw player
    const playerScreenY = player.y - cameraYRef.current;
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(player.x, playerScreenY, player.width, player.height);

    // Draw UI
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 20, 40);
    ctx.fillText(`Height: ${Math.max(0, Math.floor((580 - player.y) / 10))}m`, 20, 80);

    // Draw controls (only show when first starting)
    if (score === 0) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#cccccc';
      ctx.fillText('← → or A/D to Move', 20, canvas.height - 60);
      ctx.fillText('SPACE or ↑/W to Jump', 20, canvas.height - 40);
    }

    animationIdRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 800;
    canvas.height = 600;

    if (isActive && gameState === 'playing') {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      
      resetGame();
      animationIdRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isActive, gameState]);

  const startGame = () => {
    setGameState('playing');
  };

  const handleSubmitScore = async () => {
    if (score > 0) {
      const result = await submitScore(score, 'solajump');
      if (result.success) {
        toast({
          title: "Score Submitted! 🚀",
          description: `Earned ${result.tokensEarned} CCTR tokens for your SolaJump performance!`,
        });
      }
    }
  };

  return (
    <Card className="arcade-frame">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-neon-cyan mb-2">🚀 SolaJump</h3>
            <p className="text-gray-400">Jump as high as you can! Each platform increases your score.</p>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              className="border-2 border-neon-cyan/30 rounded-lg mx-auto block bg-gradient-to-b from-slate-900 to-slate-800"
              tabIndex={0}
            />
            
            {gameState === 'idle' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 rounded-lg">
                <div className="text-center space-y-4">
                  <div className="text-4xl">🚀</div>
                  <div className="text-xl font-bold text-neon-cyan">Ready to Jump?</div>
                  <Button onClick={startGame} className="cyber-button">
                    START GAME
                  </Button>
                </div>
              </div>
            )}

            {gameState === 'ended' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-lg">
                <div className="text-center space-y-4">
                  <div className="text-4xl">💥</div>
                  <div className="text-xl font-bold text-neon-pink">Game Over!</div>
                  <div className="text-lg text-neon-green">Final Score: {score}</div>
                  <div className="text-sm text-gray-400">
                    Max Height: {Math.max(0, Math.floor(highestPlatform * 10))}m
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={startGame} className="cyber-button">
                      PLAY AGAIN
                    </Button>
                    <Button 
                      onClick={handleSubmitScore} 
                      className="cyber-button"
                      disabled={isSubmitting || score === 0}
                    >
                      {isSubmitting ? 'SUBMITTING...' : 'SUBMIT SCORE'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="text-center text-sm text-gray-400">
            <p>💰 Earn CCTR tokens based on your height achieved!</p>
            <p>🏆 Higher scores = Better rewards!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
