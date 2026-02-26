import React from 'react';
import { BoardCell, FallingPiece, COLS, ROWS, GemType } from '@/types/cyber-columns';

interface CyberColumnsBoardProps {
  board: BoardCell[][];
  currentPiece: FallingPiece | null;
}

const gemClass = (type: GemType) => `cyber-gem cyber-gem--${type}`;

export const CyberColumnsBoard: React.FC<CyberColumnsBoardProps> = ({ board, currentPiece }) => {
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

  const cellSize = 'w-8 h-8 sm:w-10 sm:h-10';

  return (
    <div className="cyber-columns-board p-1">
      <div
        className="grid gap-[2px]"
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
                {/* Grid background */}
                <div className="absolute inset-0 rounded border border-white/5 bg-white/[0.02]" />

                {/* Placed gem */}
                {cell && !pieceGem && (
                  <div className={`absolute inset-[1px] ${gemClass(cell.type)} ${cell.clearing ? 'cyber-gem--clearing' : ''}`} />
                )}

                {/* Active piece gem */}
                {pieceGem && (
                  <div className={`absolute inset-[1px] ${gemClass(pieceGem)}`} />
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
