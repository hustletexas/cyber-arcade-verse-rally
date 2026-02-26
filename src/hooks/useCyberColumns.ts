import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BoardCell, GemType, FallingPiece, CyberColumnsState,
  COLS, ROWS, SCORING, BASE_DROP_INTERVAL, MIN_DROP_INTERVAL, LEVEL_SPEED_DECREASE,
} from '@/types/cyber-columns';

const GEM_TYPES: GemType[] = ['energy', 'data', 'circuit', 'quantum'];

let gemIdCounter = 0;
const nextId = () => `gem-${++gemIdCounter}`;

const randomGem = (): GemType => GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
const randomTriple = (): [GemType, GemType, GemType] => [randomGem(), randomGem(), randomGem()];

const createEmptyBoard = (): BoardCell[][] =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const dropInterval = (level: number) =>
  Math.max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - level * LEVEL_SPEED_DECREASE);

// ── Matching logic ──────────────────────────────────────────────
function findMatches(board: BoardCell[][]): [number, number][] {
  const matched = new Set<string>();
  const key = (r: number, c: number) => `${r},${c}`;

  const directions: [number, number][] = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal ↘
    [1, -1], // diagonal ↙
  ];

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      for (const [dr, dc] of directions) {
        const run: [number, number][] = [[r, c]];
        let nr = r + dr, nc = c + dc;
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc]?.type === cell.type) {
          run.push([nr, nc]);
          nr += dr;
          nc += dc;
        }
        if (run.length >= 3) run.forEach(([rr, cc]) => matched.add(key(rr, cc)));
      }
    }
  }

  return [...matched].map(s => {
    const [r, c] = s.split(',').map(Number);
    return [r, c] as [number, number];
  });
}

// Gravity: drop gems down after clearing
function applyGravity(board: BoardCell[][]): BoardCell[][] {
  const newBoard = createEmptyBoard();
  for (let c = 0; c < COLS; c++) {
    let writeRow = ROWS - 1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][c]) {
        newBoard[writeRow][c] = { ...board[r][c]! };
        writeRow--;
      }
    }
  }
  return newBoard;
}

export function useCyberColumns() {
  const [state, setState] = useState<CyberColumnsState>({
    board: createEmptyBoard(),
    currentPiece: null,
    nextPiece: randomTriple(),
    score: 0,
    level: 1,
    linesCleared: 0,
    chainCount: 0,
    isPlaying: false,
    isGameOver: false,
    isPaused: false,
    dropInterval: BASE_DROP_INTERVAL,
  });

  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  // ── Spawn new piece ───────────────────────────────────────────
  const spawnPiece = useCallback((next: [GemType, GemType, GemType]): FallingPiece => ({
    gems: next,
    col: Math.floor(COLS / 2),
    row: 0,
  }), []);

  // ── Lock piece into board, then resolve chains ────────────────
  const lockAndResolve = useCallback((piece: FallingPiece, board: BoardCell[][]) => {
    const newBoard = board.map(row => [...row]);
    for (let i = 0; i < 3; i++) {
      const r = piece.row + i;
      if (r >= 0 && r < ROWS) {
        newBoard[r][piece.col] = { type: piece.gems[i], id: nextId() };
      }
    }

    // Check game over — if any part of piece is above row 0
    if (piece.row < 0 || newBoard[0][piece.col] !== null && piece.row <= 0) {
      // Check if top row in the column was already occupied before locking
      let gameOver = false;
      for (let i = 0; i < 3; i++) {
        const r = piece.row + i;
        if (r < 0) { gameOver = true; break; }
      }
      if (newBoard[0].some(c => c !== null) && piece.row <= 0) {
        // Simplified: game over if piece locked at row 0 and overlap
        const topOccupied = board[piece.row]?.[piece.col] !== null && piece.row <= 0;
        if (topOccupied || piece.row < 0) gameOver = true;
      }
    }

    // Resolve chains
    let resolvedBoard = newBoard;
    let totalCleared = 0;
    let chainCount = 0;
    let totalScore = 0;

    while (true) {
      const matches = findMatches(resolvedBoard);
      if (matches.length === 0) break;
      chainCount++;
      totalCleared += matches.length;
      const chainMultiplier = SCORING.CHAIN_MULTIPLIER(chainCount);
      totalScore += matches.length * SCORING.BASE_CLEAR * chainMultiplier;
      
      for (const [r, c] of matches) {
        resolvedBoard[r][c] = null;
      }
      resolvedBoard = applyGravity(resolvedBoard);
    }

    setState(prev => {
      const newLinesCleared = prev.linesCleared + totalCleared;
      const newLevel = Math.floor(newLinesCleared / 15) + 1;
      const speedBonus = SCORING.SPEED_BONUS(newLevel);
      const finalScore = prev.score + Math.round(totalScore * speedBonus);

      // Check game over: top row has gems
      const isGameOver = resolvedBoard[0].some(c => c !== null);

      const nextTriple = randomTriple();
      return {
        ...prev,
        board: resolvedBoard,
        score: finalScore,
        level: newLevel,
        linesCleared: newLinesCleared,
        chainCount: Math.max(prev.chainCount, chainCount),
        dropInterval: dropInterval(newLevel),
        isGameOver,
        isPlaying: !isGameOver,
        currentPiece: isGameOver ? null : spawnPiece(prev.nextPiece),
        nextPiece: nextTriple,
      };
    });
  }, [spawnPiece]);

  // ── Tick (auto-drop) ──────────────────────────────────────────
  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying || s.isPaused || !s.currentPiece) return;

    const piece = s.currentPiece;
    const nextRow = piece.row + 1;

    // Check if piece can drop
    const bottomGemRow = nextRow + 2;
    if (bottomGemRow >= ROWS || s.board[bottomGemRow]?.[piece.col] !== null) {
      lockAndResolve(piece, s.board);
    } else {
      setState(prev => ({
        ...prev,
        currentPiece: prev.currentPiece ? { ...prev.currentPiece, row: nextRow } : null,
      }));
    }
  }, [lockAndResolve]);

  // ── Timer management ──────────────────────────────────────────
  useEffect(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    if (state.isPlaying && !state.isPaused) {
      tickRef.current = setInterval(tick, state.dropInterval);
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current); };
  }, [state.isPlaying, state.isPaused, state.dropInterval, tick]);

  // ── Controls ──────────────────────────────────────────────────
  const moveLeft = useCallback(() => {
    setState(prev => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isPaused) return prev;
      const newCol = prev.currentPiece.col - 1;
      if (newCol < 0) return prev;
      // Check collision
      for (let i = 0; i < 3; i++) {
        const r = prev.currentPiece.row + i;
        if (r >= 0 && r < ROWS && prev.board[r][newCol] !== null) return prev;
      }
      return { ...prev, currentPiece: { ...prev.currentPiece, col: newCol } };
    });
  }, []);

  const moveRight = useCallback(() => {
    setState(prev => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isPaused) return prev;
      const newCol = prev.currentPiece.col + 1;
      if (newCol >= COLS) return prev;
      for (let i = 0; i < 3; i++) {
        const r = prev.currentPiece.row + i;
        if (r >= 0 && r < ROWS && prev.board[r][newCol] !== null) return prev;
      }
      return { ...prev, currentPiece: { ...prev.currentPiece, col: newCol } };
    });
  }, []);

  const rotate = useCallback(() => {
    setState(prev => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isPaused) return prev;
      const [a, b, c] = prev.currentPiece.gems;
      return {
        ...prev,
        currentPiece: { ...prev.currentPiece, gems: [c, a, b] },
      };
    });
  }, []);

  const softDrop = useCallback(() => {
    tick();
  }, [tick]);

  const hardDrop = useCallback(() => {
    setState(prev => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isPaused) return prev;
      const piece = { ...prev.currentPiece };
      let row = piece.row;
      while (true) {
        const bottomRow = row + 3;
        if (bottomRow >= ROWS || prev.board[bottomRow]?.[piece.col] !== null) break;
        row++;
      }
      piece.row = row;
      // We'll lock synchronously via lockAndResolve
      setTimeout(() => lockAndResolve(piece, prev.board), 0);
      return { ...prev, currentPiece: { ...piece, row } };
    });
  }, [lockAndResolve]);

  const togglePause = useCallback(() => {
    setState(prev => prev.isPlaying ? { ...prev, isPaused: !prev.isPaused } : prev);
  }, []);

  // ── Start / Restart ───────────────────────────────────────────
  const startGame = useCallback(() => {
    gemIdCounter = 0;
    const nextPiece = randomTriple();
    const firstPiece = randomTriple();
    setState({
      board: createEmptyBoard(),
      currentPiece: { gems: firstPiece, col: Math.floor(COLS / 2), row: 0 },
      nextPiece,
      score: 0,
      level: 1,
      linesCleared: 0,
      chainCount: 0,
      isPlaying: true,
      isGameOver: false,
      isPaused: false,
      dropInterval: BASE_DROP_INTERVAL,
    });
  }, []);

  const resetGame = useCallback(() => {
    if (tickRef.current) clearInterval(tickRef.current);
    setState({
      board: createEmptyBoard(),
      currentPiece: null,
      nextPiece: randomTriple(),
      score: 0,
      level: 1,
      linesCleared: 0,
      chainCount: 0,
      isPlaying: false,
      isGameOver: false,
      isPaused: false,
      dropInterval: BASE_DROP_INTERVAL,
    });
  }, []);

  // ── Keyboard controls ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!stateRef.current.isPlaying) return;
      switch (e.key) {
        case 'ArrowLeft': case 'a': e.preventDefault(); moveLeft(); break;
        case 'ArrowRight': case 'd': e.preventDefault(); moveRight(); break;
        case 'ArrowUp': case 'w': e.preventDefault(); rotate(); break;
        case 'ArrowDown': case 's': e.preventDefault(); softDrop(); break;
        case ' ': e.preventDefault(); hardDrop(); break;
        case 'p': case 'Escape': e.preventDefault(); togglePause(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [moveLeft, moveRight, rotate, softDrop, hardDrop, togglePause]);

  return {
    state,
    startGame,
    resetGame,
    moveLeft,
    moveRight,
    rotate,
    softDrop,
    hardDrop,
    togglePause,
  };
}
