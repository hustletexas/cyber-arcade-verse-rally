import React from 'react';
import { GameState } from './pinballPhysics';

interface PinballHUDProps {
  state: GameState;
  power: number;
  charging: boolean;
  onRestart: () => void;
}

export const PinballHUD: React.FC<PinballHUDProps> = ({ state, power, charging, onRestart }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top bar */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          {/* Score */}
          <div className="bg-black/70 border border-neon-cyan/40 rounded px-3 py-1.5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
            <div className="text-lg font-bold text-neon-cyan font-mono tabular-nums">
              {state.score.toLocaleString()}
            </div>
          </div>
          {/* Balls */}
          <div className="bg-black/70 border border-neon-pink/40 rounded px-3 py-1.5">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Balls</div>
            <div className="text-lg font-bold text-neon-pink font-mono">
              {'●'.repeat(state.balls)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Combo */}
          {state.combo > 1 && (
            <div className="bg-black/70 border border-neon-purple/40 rounded px-3 py-1.5 animate-pulse">
              <div className="text-sm font-bold text-neon-purple">{state.combo}x COMBO</div>
            </div>
          )}
          {/* Overdrive */}
          {state.overdrive && (
            <div className="bg-neon-cyan/20 border border-neon-cyan rounded px-3 py-1.5 animate-pulse">
              <div className="text-sm font-bold text-neon-cyan">⚡ OVERDRIVE 2x</div>
            </div>
          )}
          {/* Demon Mode */}
          {state.demonMode && (
            <div className="bg-neon-pink/20 border border-neon-pink rounded px-3 py-1.5 animate-pulse">
              <div className="text-sm font-bold text-neon-pink">🔥 DEMON MODE 3x</div>
            </div>
          )}
        </div>
      </div>

      {/* CYBER targets indicator */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2">
        <div className="flex gap-1">
          {['C', 'Y', 'B', 'E', 'R'].map((letter, i) => (
            <div
              key={letter}
              className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold border ${
                state.cyberTargets[i]
                  ? 'bg-neon-pink/30 border-neon-pink text-neon-pink'
                  : 'bg-black/50 border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {letter}
            </div>
          ))}
        </div>
      </div>

      {/* Reactor charge bar */}
      {!state.overdrive && state.reactorCharge > 0 && (
        <div className="absolute bottom-20 left-3 w-3 h-32">
          <div className="w-full h-full bg-black/50 border border-neon-cyan/30 rounded-full overflow-hidden">
            <div
              className="w-full bg-gradient-to-t from-neon-cyan to-neon-purple transition-all duration-300 rounded-full"
              style={{ height: `${state.reactorCharge}%` }}
            />
          </div>
          <div className="text-[8px] text-neon-cyan text-center mt-1">REACTOR</div>
        </div>
      )}

      {/* Plunger power indicator */}
      {charging && (
        <div className="absolute bottom-20 right-3 w-3 h-32">
          <div className="w-full h-full bg-black/50 border border-neon-pink/30 rounded-full overflow-hidden">
            <div
              className="w-full bg-gradient-to-t from-neon-pink to-yellow-400 transition-all duration-100 rounded-full"
              style={{ height: `${power * 100}%` }}
            />
          </div>
          <div className="text-[8px] text-neon-pink text-center mt-1">POWER</div>
        </div>
      )}

      {/* Mobile controls */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-between px-4 sm:hidden pointer-events-auto">
        <button
          className="w-20 h-16 bg-neon-pink/20 border border-neon-pink/50 rounded-lg active:bg-neon-pink/40 text-neon-pink font-bold text-sm"
          onTouchStart={(e) => { e.preventDefault(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'z' })); }}
          onTouchEnd={(e) => { e.preventDefault(); document.dispatchEvent(new KeyboardEvent('keyup', { key: 'z' })); }}
        >
          ◀ FLIP
        </button>
        <button
          className="w-16 h-16 bg-neon-cyan/20 border border-neon-cyan/50 rounded-full active:bg-neon-cyan/40 text-neon-cyan font-bold text-xs"
          onTouchStart={(e) => { e.preventDefault(); document.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' })); }}
          onTouchEnd={(e) => { e.preventDefault(); document.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' })); }}
        >
          LAUNCH
        </button>
        <button
          className="w-20 h-16 bg-neon-pink/20 border border-neon-pink/50 rounded-lg active:bg-neon-pink/40 text-neon-pink font-bold text-sm"
          onTouchStart={(e) => { e.preventDefault(); document.dispatchEvent(new KeyboardEvent('keydown', { key: 'm' })); }}
          onTouchEnd={(e) => { e.preventDefault(); document.dispatchEvent(new KeyboardEvent('keyup', { key: 'm' })); }}
        >
          FLIP ▶
        </button>
      </div>

      {/* Game Over overlay */}
      {state.gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 pointer-events-auto">
          <div className="text-4xl font-bold text-neon-pink mb-2">GAME OVER</div>
          <div className="text-2xl font-bold text-neon-cyan font-mono mb-6">
            {state.score.toLocaleString()} PTS
          </div>
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-neon-cyan/20 border border-neon-cyan text-neon-cyan font-bold rounded-lg hover:bg-neon-cyan/30 transition-colors"
          >
            PLAY AGAIN
          </button>
        </div>
      )}

      {/* CRT scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />
    </div>
  );
};
