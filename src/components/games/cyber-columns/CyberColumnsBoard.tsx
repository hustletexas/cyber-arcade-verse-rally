import React from 'react';
import { BoardCell, FallingPiece, COLS, ROWS, GemType } from '@/types/cyber-columns';

interface CyberColumnsBoardProps {
  board: BoardCell[][];
  currentPiece: FallingPiece | null;
  onTapBoard?: () => void;
}

const gemClass = (type: GemType) => `cyber-gem cyber-gem--${type}`;

export const CyberColumnsBoard: React.FC<CyberColumnsBoardProps> = ({ board, currentPiece, onTapBoard }) => {
  // Calculate ghost position
  let ghostRow: number | null = null;
  if (currentPiece) {
    let row = currentPiece.row;
    while (true) {
      const bottomRow = row + 3;
      if (bottomRow >= ROWS || board[bottomRow]?.[currentPiece.col] !== null) break;
      row++;
    }
    ghostRow = row;
  }

  // Big crystal orb cells
  const cellSize = 'w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16';

  return (
    <div className="cyber-columns-board p-2" onClick={onTapBoard}>
      <div
        className="grid gap-[2px] relative z-10"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
      >
        {Array.from({ length: ROWS }).map((_, r) =>
          Array.from({ length: COLS }).map((_, c) => {
            const cell = board[r][c];

            // Check if current piece occupies this cell
            let pieceGem: GemType | null = null;
            if (currentPiece && c === currentPiece.col) {
              const offset = r - currentPiece.row;
              if (offset >= 0 && offset < 3) pieceGem = currentPiece.gems[offset];
            }

            // Ghost preview
            let isGhost = false;
            if (ghostRow !== null && currentPiece && c === currentPiece.col && ghostRow !== currentPiece.row) {
              const offset = r - ghostRow;
              if (offset >= 0 && offset < 3) isGhost = true;
            }

            return (
              <div key={`${r}-${c}`} className={`${cellSize} relative`}>
                {/* Grid cell background */}
                <div className="absolute inset-0 cc-grid-cell" />

                {/* Placed gem */}
                {cell && !pieceGem && (
                  <div
                    className={`absolute inset-[1px] ${gemClass(cell.type)} ${cell.clearing ? `cyber-gem--clearing cc-combo-${Math.min(cell.clearingChain || 1, 4)}` : ''}`}
                    style={cell.clearing ? { '--combo': Math.min(cell.clearingChain || 1, 4) } as React.CSSProperties : undefined}
                  >
                    {cell.clearing && (
                      <>
                        <div className="cc-electric-arc cc-electric-arc--1" />
                        <div className="cc-electric-arc cc-electric-arc--2" />
                        <div className="cc-electric-arc cc-electric-arc--3" />
                        <div className="cc-electric-arc cc-electric-arc--4" />
                        <div className="cc-electric-arc cc-electric-arc--5" />
                        <div className="cc-electric-arc cc-electric-arc--6" />
                        <div className={`cc-burst-color cc-burst-color--${cell.type}`} />
                        {(cell.clearingChain || 1) >= 3 && (
                          <div className="cc-shockwave" />
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Active piece gem */}
                {pieceGem && (
                  <div className={`absolute inset-[1px] ${gemClass(pieceGem)} cc-gem-active`} />
                )}

                {/* Ghost */}
                {isGhost && !pieceGem && !cell && (
                  <div className={`absolute inset-[1px] cyber-gem cyber-gem--ghost`} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
