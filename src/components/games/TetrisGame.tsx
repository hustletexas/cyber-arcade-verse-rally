
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TetrisGameProps {
  onGameEnd: (score: number) => void;
  isActive: boolean;
}

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TETROMINOS = {
  I: [[1, 1, 1, 1]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  Z: [[1, 1, 0], [0, 1, 1]],
  J: [[1, 0, 0], [1, 1, 1]],
  L: [[0, 0, 1], [1, 1, 1]]
};

export const TetrisGame = ({ onGameEnd, isActive }: TetrisGameProps) => {
  const [board, setBoard] = useState<number[][]>(() => 
    Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0))
  );
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentPiece, setCurrentPiece] = useState<any>(null);
  const [position, setPosition] = useState({ x: 4, y: 0 });
  const gameLoopRef = useRef<number>();

  const createRandomPiece = useCallback(() => {
    const pieces = Object.keys(TETROMINOS);
    const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
    return {
      shape: TETROMINOS[randomPiece as keyof typeof TETROMINOS],
      type: randomPiece
    };
  }, []);

  const checkCollision = useCallback((piece: number[][], pos: { x: number; y: number }, board: number[][]) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT) {
            return true;
          }
          
          if (newY >= 0 && board[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);

  const clearLines = useCallback((board: number[][]) => {
    const newBoard = board.filter(row => row.some(cell => cell === 0));
    const linesCleared = BOARD_HEIGHT - newBoard.length;
    
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    
    return { newBoard, linesCleared };
  }, []);

  const placePiece = useCallback(() => {
    if (!currentPiece) return;

    const newBoard = board.map(row => [...row]);
    
    for (let y = 0; y < currentPiece.shape.length; y++) {
      for (let x = 0; x < currentPiece.shape[y].length; x++) {
        if (currentPiece.shape[y][x] !== 0) {
          const boardY = position.y + y;
          const boardX = position.x + x;
          if (boardY >= 0) {
            newBoard[boardY][boardX] = 1;
          }
        }
      }
    }

    const { newBoard: clearedBoard, linesCleared } = clearLines(newBoard);
    setBoard(clearedBoard);
    setScore(prev => prev + linesCleared * 100 + 10);

    // Check game over
    if (position.y <= 1) {
      setGameOver(true);
      onGameEnd(score + linesCleared * 100 + 10);
      return;
    }

    // Create new piece
    const newPiece = createRandomPiece();
    setCurrentPiece(newPiece);
    setPosition({ x: 4, y: 0 });
  }, [board, currentPiece, position, score, clearLines, createRandomPiece, onGameEnd]);

  const dropPiece = useCallback(() => {
    if (!currentPiece || gameOver) return;

    const newPosition = { ...position, y: position.y + 1 };
    
    if (checkCollision(currentPiece.shape, newPosition, board)) {
      placePiece();
    } else {
      setPosition(newPosition);
    }
  }, [currentPiece, position, board, gameOver, checkCollision, placePiece]);

  const movePiece = useCallback((direction: 'left' | 'right') => {
    if (!currentPiece || gameOver) return;

    const newPosition = { 
      ...position, 
      x: position.x + (direction === 'left' ? -1 : 1) 
    };
    
    if (!checkCollision(currentPiece.shape, newPosition, board)) {
      setPosition(newPosition);
    }
  }, [currentPiece, position, board, gameOver, checkCollision]);

  const rotatePiece = useCallback(() => {
    if (!currentPiece || gameOver) return;

    const rotated = currentPiece.shape[0].map((_: any, index: number) =>
      currentPiece.shape.map((row: any) => row[index]).reverse()
    );

    if (!checkCollision(rotated, position, board)) {
      setCurrentPiece({ ...currentPiece, shape: rotated });
    }
  }, [currentPiece, position, board, gameOver, checkCollision]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isActive) return;

      switch (e.key) {
        case 'ArrowLeft':
          movePiece('left');
          break;
        case 'ArrowRight':
          movePiece('right');
          break;
        case 'ArrowDown':
          dropPiece();
          break;
        case 'ArrowUp':
          rotatePiece();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, movePiece, dropPiece, rotatePiece]);

  useEffect(() => {
    if (isActive && !gameOver) {
      gameLoopRef.current = window.setInterval(dropPiece, 1000);
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
  }, [isActive, gameOver, dropPiece]);

  useEffect(() => {
    if (!currentPiece) {
      setCurrentPiece(createRandomPiece());
    }
  }, [currentPiece, createRandomPiece]);

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    
    // Add current piece to display board
    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x] !== 0) {
            const boardY = position.y + y;
            const boardX = position.x + x;
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = 2; // Current piece
            }
          }
        }
      }
    }

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className={`w-6 h-6 border border-gray-600 ${
              cell === 1 ? 'bg-neon-cyan' : 
              cell === 2 ? 'bg-neon-pink' : 
              'bg-gray-900'
            }`}
          />
        ))}
      </div>
    ));
  };

  const resetGame = () => {
    setBoard(Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(0)));
    setScore(0);
    setGameOver(false);
    setCurrentPiece(createRandomPiece());
    setPosition({ x: 4, y: 0 });
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan">🧩 TETRIS</CardTitle>
        <div className="text-neon-green font-mono text-xl">Score: {score}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="inline-block border-2 border-neon-cyan">
            {renderBoard()}
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            ← → Move | ↓ Drop | ↑ Rotate
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
