
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PacManGameProps {
  onGameEnd: (score: number) => void;
  isActive: boolean;
}

const BOARD_SIZE = 15;
const CELL_EMPTY = 0;
const CELL_DOT = 1;
const CELL_WALL = 2;
const CELL_PACMAN = 3;
const CELL_GHOST = 4;

export const PacManGame = ({ onGameEnd, isActive }: PacManGameProps) => {
  const [board, setBoard] = useState<number[][]>([]);
  const [pacmanPos, setPacmanPos] = useState({ x: 7, y: 7 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [ghosts, setGhosts] = useState<{ x: number; y: number }[]>([]);
  const gameLoopRef = useRef<number>();

  const createBoard = useCallback(() => {
    const newBoard = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(CELL_DOT));
    
    // Create simple maze pattern
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (x === 0 || x === BOARD_SIZE - 1 || y === 0 || y === BOARD_SIZE - 1) {
          newBoard[y][x] = CELL_WALL;
        } else if ((x % 4 === 0 && y % 4 === 0) || (x % 4 === 3 && y % 4 === 3)) {
          newBoard[y][x] = CELL_WALL;
        }
      }
    }
    
    // Clear starting positions
    newBoard[7][7] = CELL_EMPTY; // Pac-Man start
    newBoard[1][1] = CELL_EMPTY; // Ghost 1
    newBoard[1][BOARD_SIZE - 2] = CELL_EMPTY; // Ghost 2
    newBoard[BOARD_SIZE - 2][1] = CELL_EMPTY; // Ghost 3
    
    return newBoard;
  }, []);

  const initializeGame = useCallback(() => {
    const newBoard = createBoard();
    setBoard(newBoard);
    setPacmanPos({ x: 7, y: 7 });
    setGhosts([
      { x: 1, y: 1 },
      { x: BOARD_SIZE - 2, y: 1 },
      { x: 1, y: BOARD_SIZE - 2 }
    ]);
    setScore(0);
    setGameOver(false);
  }, [createBoard]);

  const isValidMove = useCallback((x: number, y: number) => {
    return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[y] && board[y][x] !== CELL_WALL;
  }, [board]);

  const movePacman = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let newX = pacmanPos.x;
    let newY = pacmanPos.y;

    switch (direction) {
      case 'up':
        newY = pacmanPos.y - 1;
        break;
      case 'down':
        newY = pacmanPos.y + 1;
        break;
      case 'left':
        newX = pacmanPos.x - 1;
        break;
      case 'right':
        newX = pacmanPos.x + 1;
        break;
    }

    if (isValidMove(newX, newY)) {
      setPacmanPos({ x: newX, y: newY });
      
      // Collect dot
      if (board[newY][newX] === CELL_DOT) {
        setScore(prev => prev + 10);
        setBoard(prev => {
          const newBoard = prev.map(row => [...row]);
          newBoard[newY][newX] = CELL_EMPTY;
          return newBoard;
        });
      }
    }
  }, [pacmanPos, gameOver, isValidMove, board]);

  const moveGhosts = useCallback(() => {
    if (gameOver) return;

    setGhosts(prevGhosts => {
      return prevGhosts.map(ghost => {
        const directions = [
          { x: ghost.x, y: ghost.y - 1 }, // up
          { x: ghost.x, y: ghost.y + 1 }, // down
          { x: ghost.x - 1, y: ghost.y }, // left
          { x: ghost.x + 1, y: ghost.y }  // right
        ];

        const validMoves = directions.filter(pos => isValidMove(pos.x, pos.y));
        
        if (validMoves.length > 0) {
          return validMoves[Math.floor(Math.random() * validMoves.length)];
        }
        
        return ghost;
      });
    });
  }, [gameOver, isValidMove]);

  const checkCollisions = useCallback(() => {
    const collision = ghosts.some(ghost => 
      ghost.x === pacmanPos.x && ghost.y === pacmanPos.y
    );

    if (collision) {
      setGameOver(true);
      onGameEnd(score);
    }

    // Check win condition (all dots collected)
    const dotsRemaining = board.flat().filter(cell => cell === CELL_DOT).length;
    if (dotsRemaining === 0) {
      setGameOver(true);
      onGameEnd(score + 1000); // Bonus for completing level
    }
  }, [ghosts, pacmanPos, board, score, onGameEnd]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isActive) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePacman('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePacman('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePacman('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePacman('right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isActive, movePacman]);

  useEffect(() => {
    if (isActive && !gameOver) {
      gameLoopRef.current = window.setInterval(() => {
        moveGhosts();
      }, 800);
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
  }, [isActive, gameOver, moveGhosts]);

  useEffect(() => {
    checkCollisions();
  }, [pacmanPos, ghosts, checkCollisions]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const renderBoard = () => {
    if (!board.length) return null;

    const displayBoard = board.map(row => [...row]);
    
    // Place Pac-Man
    displayBoard[pacmanPos.y][pacmanPos.x] = CELL_PACMAN;
    
    // Place ghosts
    ghosts.forEach(ghost => {
      if (displayBoard[ghost.y] && displayBoard[ghost.y][ghost.x] !== undefined) {
        displayBoard[ghost.y][ghost.x] = CELL_GHOST;
      }
    });

    return displayBoard.map((row, y) => (
      <div key={y} className="flex">
        {row.map((cell, x) => (
          <div
            key={x}
            className="w-6 h-6 flex items-center justify-center text-xs"
          >
            {cell === CELL_WALL && <div className="w-full h-full bg-neon-purple" />}
            {cell === CELL_DOT && <div className="w-1 h-1 bg-neon-green rounded-full" />}
            {cell === CELL_PACMAN && <span className="text-neon-cyan">😊</span>}
            {cell === CELL_GHOST && <span className="text-neon-pink">👻</span>}
          </div>
        ))}
      </div>
    ));
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-cyan">👻 PAC-MAN</CardTitle>
        <div className="text-neon-green font-mono text-xl">Score: {score}</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="inline-block border-2 border-neon-cyan bg-gray-900 p-2">
            {renderBoard()}
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Arrow Keys or WASD to move
          </div>
          {gameOver && (
            <div className="space-y-2">
              <div className="text-neon-pink font-bold">GAME OVER!</div>
              <Button onClick={initializeGame} className="cyber-button">
                Play Again
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
