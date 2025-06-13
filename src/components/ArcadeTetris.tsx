
import React from 'react';
import { Card } from '@/components/ui/card';
import { TetrisGame } from '@/components/games/TetrisGame';

export const ArcadeTetris = () => {
  const handleGameEnd = (score: number) => {
    console.log(`Tetris game ended with score: ${score}`);
  };

  return (
    <div className="arcade-cabinet max-w-2xl mx-auto">
      {/* Arcade Cabinet Top */}
      <div className="arcade-cabinet-top">
        <div className="text-neon-cyan font-display text-xl font-bold mb-2">
          CYBER CITY ARCADE
        </div>
        <div className="text-neon-pink text-sm">
          INSERT COIN TO PLAY
        </div>
      </div>

      {/* Arcade Screen Container with Tetris */}
      <div className="relative bg-black border-4 border-neon-cyan/50 rounded-lg overflow-hidden" style={{ height: '600px' }}>
        {/* Logo Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <img 
            src="/lovable-uploads/e69784e2-74e3-4705-8685-3738058bf5e2.png" 
            alt="Cyber City Arcade" 
            className="w-full h-full object-contain"
            style={{ 
              filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.3))',
              maxWidth: '80%',
              maxHeight: '80%'
            }}
          />
        </div>
        
        {/* Tetris Game Overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-full h-full flex items-center justify-center p-4">
            <TetrisGame onGameEnd={handleGameEnd} isActive={true} />
          </div>
        </div>
      </div>

      {/* Arcade Controls */}
      <div className="arcade-controls bg-gray-800 p-6 border-4 border-neon-cyan/50 border-t-0">
        <div className="arcade-control-panel">
          <div className="control-stick bg-neon-purple border-2 border-neon-purple hover:bg-neon-purple/80 transition-colors"></div>
          <div className="text-center">
            <div className="text-neon-green font-mono text-sm mb-2">
              ← → MOVE • ↓ DROP • ↑ ROTATE
            </div>
            <div className="text-neon-cyan font-display text-xs">
              FULLY FUNCTIONAL TETRIS
            </div>
          </div>
          <div className="action-buttons">
            <div className="action-button bg-neon-pink border-2 border-neon-pink hover:bg-neon-pink/80 transition-colors"></div>
            <div className="action-button bg-neon-green border-2 border-neon-green hover:bg-neon-green/80 transition-colors"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
