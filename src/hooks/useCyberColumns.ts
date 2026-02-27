import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BoardCell, GemType, FallingPiece, CyberColumnsState,
  COLS, ROWS, SCORING, BASE_DROP_INTERVAL, MIN_DROP_INTERVAL, LEVEL_SPEED_DECREASE,
} from '@/types/cyber-columns';

const GEM_TYPES: GemType[] = ['energy', 'data', 'circuit', 'quantum'];
const BONUS_SCORE_INTERVAL = 500; // gold gem spawns every 500 points

let gemIdCounter = 0;
const nextId = () => `gem-${++gemIdCounter}`;
let lastBonusThreshold = 0; // track which threshold was last crossed

const randomGem = (): GemType => GEM_TYPES[Math.floor(Math.random() * GEM_TYPES.length)];
const randomTriple = (): [GemType, GemType, GemType] => [randomGem(), randomGem(), randomGem()];

// Generate a triple that includes one bonus gem at a random position
const bonusTriple = (): [GemType, GemType, GemType] => {
  const triple: [GemType, GemType, GemType] = [randomGem(), randomGem(), randomGem()];
  const pos = Math.floor(Math.random() * 3);
  triple[pos] = 'bonus';
  return triple;
};

const createEmptyBoard = (): BoardCell[][] =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

const calcDropInterval = (level: number) =>
  Math.max(MIN_DROP_INTERVAL, BASE_DROP_INTERVAL - level * LEVEL_SPEED_DECREASE);

// ── Matching logic ──────────────────────────────────────────────
function findMatches(board: BoardCell[][]): { coords: [number, number][]; bonusColors: Set<GemType> } {
  const matched = new Set<string>();
  const bonusColors = new Set<GemType>(); // colors that bonus gems matched with
  const key = (r: number, c: number) => `${r},${c}`;

  const directions: [number, number][] = [
    [0, 1],  // horizontal
    [1, 0],  // vertical
    [1, 1],  // diagonal ↘
    [1, -1], // diagonal ↙
  ];

  // Helper: check if two cells match (bonus matches anything)
  const typesMatch = (a: GemType, b: GemType) =>
    a === b || a === 'bonus' || b === 'bonus';

  // Find the "real" color in a run (non-bonus type)
  const realColor = (types: GemType[]): GemType | null =>
    types.find(t => t !== 'bonus') || null;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = board[r][c];
      if (!cell) continue;
      for (const [dr, dc] of directions) {
        const run: [number, number][] = [[r, c]];
        let nr = r + dr, nc = c + dc;
        // Match using the effective type (first non-bonus type in run, or cell type)
        const effectiveType = cell.type === 'bonus' ? null : cell.type;
        while (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
          const next = board[nr][nc];
          if (!next) break;
          if (effectiveType) {
            if (next.type !== effectiveType && next.type !== 'bonus') break;
          } else {
            // Starting cell is bonus — adopt the first non-bonus type we find
            if (next.type !== 'bonus') {
              // Check if we can continue with this type
              const adoptedType = next.type;
              // Re-validate: this run works if all are bonus or adoptedType
              let valid = true;
              // Just continue with adopted type
            }
          }
          run.push([nr, nc]);
          nr += dr;
          nc += dc;
        }
        if (run.length >= 3) {
          // Find the matched color
          const runTypes = run.map(([rr, cc]) => board[rr][cc]!.type);
          const color = realColor(runTypes);
          const hasBonus = runTypes.includes('bonus');
          if (hasBonus && color) {
            bonusColors.add(color);
          }
          run.forEach(([rr, cc]) => matched.add(key(rr, cc)));
        }
      }
    }
  }

  const coords: [number, number][] = [...matched].map(s => {
    const [r, c] = s.split(',').map(Number);
    return [r, c] as [number, number];
  });

  return { coords, bonusColors };
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

const CLEAR_ANIMATION_MS = 550; // match the CSS animation duration

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
  const resolvingRef = useRef(false);

  // ── Spawn new piece ───────────────────────────────────────────
  const spawnPiece = useCallback((next: [GemType, GemType, GemType]): FallingPiece => ({
    gems: next,
    col: Math.floor(COLS / 2),
    row: 0,
  }), []);

  // ── Async chain resolution with visible clearing phase ────────
  const resolveChains = useCallback((board: BoardCell[][], prevState: CyberColumnsState) => {
    if (resolvingRef.current) return;
    resolvingRef.current = true;

    let currentBoard = board.map(row => [...row]);
    let totalCleared = 0;
    let chainCount = 0;
    let totalScore = 0;

    const resolveStep = () => {
      const { coords: matches, bonusColors } = findMatches(currentBoard);
      if (matches.length === 0) {
        // Done resolving — spawn next piece
        resolvingRef.current = false;
        setState(prev => {
          const newLinesCleared = prev.linesCleared + totalCleared;
          const newLevel = Math.floor(newLinesCleared / 15) + 1;
          const speedBonus = SCORING.SPEED_BONUS(newLevel);
          const finalScore = prev.score + Math.round(totalScore * speedBonus);
          const isGameOver = currentBoard[0].some(c => c !== null);

          // Check if we crossed a bonus threshold — if so, next piece includes a gold gem
          const currentThreshold = Math.floor(finalScore / BONUS_SCORE_INTERVAL);
          let nextTriple: [GemType, GemType, GemType];
          if (currentThreshold > lastBonusThreshold) {
            lastBonusThreshold = currentThreshold;
            nextTriple = bonusTriple();
          } else {
            nextTriple = randomTriple();
          }

          return {
            ...prev,
            board: currentBoard,
            score: finalScore,
            level: newLevel,
            linesCleared: newLinesCleared,
            chainCount: Math.max(prev.chainCount, chainCount),
            dropInterval: calcDropInterval(newLevel),
            isGameOver,
            isPlaying: !isGameOver,
            currentPiece: isGameOver ? null : spawnPiece(prev.nextPiece),
            nextPiece: nextTriple,
          };
        });
        return;
      }

      // Bonus gem only affects the gems it directly touches in the match — not all of that color

      chainCount++;
      totalCleared += matches.length;
      const chainMultiplier = SCORING.CHAIN_MULTIPLIER(chainCount);
      totalScore += matches.length * SCORING.BASE_CLEAR * chainMultiplier;

      // Step 1: Mark matched gems as clearing (visible to UI)
      for (const [r, c] of matches) {
        if (currentBoard[r][c]) {
          currentBoard[r][c] = { ...currentBoard[r][c]!, clearing: true };
        }
      }
      const clearingBoard = currentBoard.map(row => [...row]);

      setState(prev => ({
        ...prev,
        board: clearingBoard,
        currentPiece: null,
      }));

      // Step 2: After animation delay, remove gems and apply gravity
      setTimeout(() => {
        for (const [r, c] of matches) {
          currentBoard[r][c] = null;
        }
        currentBoard = applyGravity(currentBoard);

        setState(prev => ({
          ...prev,
          board: currentBoard,
        }));

        // Step 3: Check for more matches (chain reaction)
        setTimeout(() => resolveStep(), 100);
      }, CLEAR_ANIMATION_MS);
    };

    resolveStep();
  }, [spawnPiece]);

  // ── Lock piece into board, then resolve chains ────────────────
  const lockAndResolve = useCallback((piece: FallingPiece, board: BoardCell[][]) => {
    const newBoard = board.map(row => [...row]);
    for (let i = 0; i < 3; i++) {
      const r = piece.row + i;
      if (r >= 0 && r < ROWS) {
        newBoard[r][piece.col] = { type: piece.gems[i], id: nextId() };
      }
    }

    setState(prev => ({
      ...prev,
      board: newBoard,
      currentPiece: null,
    }));

    // Start async chain resolution
    setTimeout(() => resolveChains(newBoard, stateRef.current), 50);
  }, [resolveChains]);

  // ── Tick (auto-drop) ──────────────────────────────────────────
  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.isPlaying || s.isPaused || !s.currentPiece || resolvingRef.current) return;

    const piece = s.currentPiece;
    const nextRow = piece.row + 1;

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
    if (resolvingRef.current) return;
    setState(prev => {
      if (!prev.currentPiece || !prev.isPlaying || prev.isPaused) return prev;
      const newCol = prev.currentPiece.col - 1;
      if (newCol < 0) return prev;
      for (let i = 0; i < 3; i++) {
        const r = prev.currentPiece.row + i;
        if (r >= 0 && r < ROWS && prev.board[r][newCol] !== null) return prev;
      }
      return { ...prev, currentPiece: { ...prev.currentPiece, col: newCol } };
    });
  }, []);

  const moveRight = useCallback(() => {
    if (resolvingRef.current) return;
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
    if (resolvingRef.current) return;
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
    if (resolvingRef.current) return;
    tick();
  }, [tick]);

  const hardDrop = useCallback(() => {
    if (resolvingRef.current) return;
    const s = stateRef.current;
    if (!s.currentPiece || !s.isPlaying || s.isPaused) return;
    const piece = { ...s.currentPiece };
    let row = piece.row;
    while (true) {
      const bottomRow = row + 3;
      if (bottomRow >= ROWS || s.board[bottomRow]?.[piece.col] !== null) break;
      row++;
    }
    piece.row = row;
    lockAndResolve(piece, s.board);
  }, [lockAndResolve]);

  const togglePause = useCallback(() => {
    setState(prev => prev.isPlaying ? { ...prev, isPaused: !prev.isPaused } : prev);
  }, []);

  // ── Start / Restart ───────────────────────────────────────────
  const startGame = useCallback(() => {
    resolvingRef.current = false;
    gemIdCounter = 0;
    lastBonusThreshold = 0;
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
    resolvingRef.current = false;
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
