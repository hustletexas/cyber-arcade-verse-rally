import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GalagaGameProps {
  onGameEnd: (score: number) => void;
  isActive: boolean;
}

interface GameObject {
  x: number;
  y: number;
  id: number;
}

const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;

export const GalagaGame = ({ onGameEnd, isActive }: GalagaGameProps) => {
  const [playerPos, setPlayerPos] = useState({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50 });
  const [bullets, setBullets] = useState<GameObject[]>([]);
  const [enemies, setEnemies] = useState<GameObject[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lives, setLives] = useState(3);
  const gameLoopRef = useRef<number>();
  const nextBulletId = useRef(0);
  const nextEnemyId = useRef(0);

  const spawnEnemy = useCallback(() => {
    const newEnemy: GameObject = {
      x: Math.random() * (GAME_WIDTH - 30),
      y: -30,
      id: nextEnemyId.current++
    };
    setEnemies(prev => [...prev, newEnemy]);
  }, []);

  const shoot = useCallback(() => {
    if (gameOver) return;
    
    const newBullet: GameObject = {
      x: playerPos.x,
      y: playerPos.y - 10,
      id: nextBulletId.current++
    };
    setBullets(prev => [...prev, newBullet]);
  }, [playerPos, gameOver]);

  const movePlayer = useCallback((direction: 'left' | 'right') => {
    if (gameOver) return;

    setPlayerPos(prev => {
      const newX = direction === 'left' ? prev.x - 20 : prev.x + 20;
      return {
        ...prev,
        x: Math.max(0, Math.min(GAME_WIDTH - 30, newX))
      };
    });
  }, [gameOver]);

  const updateGame = useCallback(() => {
    // Move bullets
    setBullets(prev => prev
      .map(bullet => ({ ...bullet, y: bullet.y - 10 }))
      .filter(bullet => bullet.y > -10)
    );

    // Move enemies
    setEnemies(prev => prev
      .map(enemy => ({ ...enemy, y: enemy.y + 3 }))
      .filter(enemy => enemy.y < GAME_HEIGHT + 30)
    );

    // Check bullet-enemy collisions
    setBullets(prevBullets => {
      setEnemies(prevEnemies => {
        const remainingBullets: GameObject[] = [];
        const remainingEnemies: GameObject[] = [];
        let scoreIncrease = 0;

        prevBullets.forEach(bullet => {
          let bulletHit = false;
          prevEnemies.forEach(enemy => {
            const distance = Math.sqrt(
              Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
            );
            if (distance < 25 && !bulletHit) {
              bulletHit = true;
              scoreIncrease += 100;
            } else if (!bulletHit) {
              // Only keep enemy if bullet didn't hit it
              if (!remainingEnemies.find(e => e.id === enemy.id)) {
                remainingEnemies.push(enemy);
              }
            }
          });
          
          if (!bulletHit) {
            remainingBullets.push(bullet);
          }
        });

        // Remove enemies that were hit
        prevEnemies.forEach(enemy => {
          let enemyHit = false;
          prevBullets.forEach(bullet => {
            const distance = Math.sqrt(
              Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
            );
            if (distance < 25) {
              enemyHit = true;
            }
          });
          
          if (!enemyHit && !remainingEnemies.find(e => e.id === enemy.id)) {
            remainingEnemies.push(enemy);
          }
        });

        if (scoreIncrease > 0) {
          setScore(prev => prev + scoreIncrease);
        }

        return remainingEnemies;
      });
      
      return prevBullets.filter(bullet => {
        let bulletUsed = false;
        enemies.forEach(enemy => {
          const distance = Math.sqrt(
            Math.pow(bullet.x - enemy.x, 2) + Math.pow(bullet.y - enemy.y, 2)
          );
          if (distance < 25) {
            bulletUsed = true;
          }
        });
        return !bulletUsed && bullet.y > -10;
      });
    });

    // Check player-enemy collisions
    setEnemies(prevEnemies => {
      const collision = prevEnemies.some(enemy => {
        const distance = Math.sqrt(
          Math.pow(playerPos.x - enemy.x, 2) + Math.pow(playerPos.y - enemy.y, 2)
        );
        return distance < 30;
      });

      if (collision) {
        setLives(prev => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameOver(true);
            onGameEnd(score);
          }
          return newLives;
        });
        return prevEnemies.filter(enemy => {
          const distance = Math.sqrt(
            Math.pow(playerPos.x - enemy.x, 2) + Math.pow(playerPos.y - enemy.y, 2)
          );
          return distance >= 30;
        });
      }

      return prevEnemies;
    });
  }, [playerPos, enemies, score, onGameEnd]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isActive) return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer('right');
          break;
        case ' ':
        case 'ArrowUp':
          e.preventDefault();
          shoot();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, movePlayer, shoot]);

  useEffect(() => {
    if (isActive && !gameOver) {
      gameLoopRef.current = window.setInterval(() => {
        updateGame();
        
        // Spawn enemies periodically
        if (Math.random() < 0.1) {
          spawnEnemy();
        }
      }, 100);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [isActive, gameOver, updateGame, spawnEnemy]);

  const resetGame = () => {
    setPlayerPos({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50 });
    setBullets([]);
    setEnemies([]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    nextBulletId.current = 0;
    nextEnemyId.current = 0;
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan">🚀 GALAGA</CardTitle>
        <div className="flex justify-between text-neon-green font-mono">
          <div>Score: {score}</div>
          <div>Lives: {'💚'.repeat(lives)}</div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div 
            className="relative border-2 border-neon-cyan bg-gray-900 overflow-hidden"
            style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
          >
            {/* Player */}
            <div
              className="absolute w-6 h-6 text-center text-neon-cyan"
              style={{ 
                left: playerPos.x, 
                top: playerPos.y,
                transform: 'translate(-50%, -50%)'
              }}
            >
              🚀
            </div>

            {/* Bullets */}
            {bullets.map(bullet => (
              <div
                key={bullet.id}
                className="absolute w-1 h-3 bg-neon-green"
                style={{ 
                  left: bullet.x, 
                  top: bullet.y,
                  transform: 'translate(-50%, 0)'
                }}
              />
            ))}

            {/* Enemies */}
            {enemies.map(enemy => (
              <div
                key={enemy.id}
                className="absolute w-6 h-6 text-center text-neon-pink"
                style={{ 
                  left: enemy.x, 
                  top: enemy.y,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                👾
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            ← → Move | ↑ or Space to Shoot
          </div>
          {gameOver && (
            <div className="space-y-2">
              <div className="text-neon-pink font-bold">GAME OVER!</div>
              <Button onClick={resetGame} className="cyber-button">
                Play Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
