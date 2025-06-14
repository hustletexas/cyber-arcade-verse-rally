
import React, { useState, useEffect } from 'react';

interface GameElement {
  id: number;
  x: number;
  y: number;
  type: 'player' | 'enemy' | 'bullet';
}

export const ArcadeScreenAnimation = () => {
  const [gameElements, setGameElements] = useState<GameElement[]>([]);
  const [nextId, setNextId] = useState(0);

  useEffect(() => {
    // Initialize with player
    setGameElements([
      { id: 0, x: 50, y: 85, type: 'player' }
    ]);
    setNextId(1);

    const interval = setInterval(() => {
      setGameElements(prev => {
        let newElements = [...prev];
        
        // Move existing elements
        newElements = newElements.map(element => {
          if (element.type === 'enemy') {
            return { ...element, y: element.y + 2 };
          }
          if (element.type === 'bullet') {
            return { ...element, y: element.y - 3 };
          }
          return element;
        }).filter(element => element.y > -5 && element.y < 105);

        // Spawn enemies occasionally
        if (Math.random() < 0.1) {
          newElements.push({
            id: Date.now(),
            x: Math.random() * 90 + 5,
            y: -5,
            type: 'enemy'
          });
        }

        // Spawn bullets occasionally
        if (Math.random() < 0.2) {
          const player = newElements.find(e => e.type === 'player');
          if (player) {
            newElements.push({
              id: Date.now() + 1000,
              x: player.x,
              y: player.y - 5,
              type: 'bullet'
            });
          }
        }

        // Move player left and right
        newElements = newElements.map(element => {
          if (element.type === 'player') {
            const newX = element.x + (Math.random() > 0.5 ? 2 : -2);
            return { ...element, x: Math.max(5, Math.min(95, newX)) };
          }
          return element;
        });

        return newElements;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Position the screen overlay on the arcade cabinet */}
      <div 
        className="absolute bg-black/80 border border-neon-cyan/50 rounded-sm overflow-hidden"
        style={{
          width: '80px',
          height: '100px',
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          boxShadow: '0 0 10px rgba(0, 255, 255, 0.3)',
        }}
      >
        {/* Game elements */}
        {gameElements.map(element => (
          <div
            key={element.id}
            className="absolute text-xs"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
              transform: 'translate(-50%, -50%)',
              color: element.type === 'player' ? '#00ff00' : 
                     element.type === 'enemy' ? '#ff00ff' : '#00ffff'
            }}
          >
            {element.type === 'player' ? '🚀' : 
             element.type === 'enemy' ? '👾' : '•'}
          </div>
        ))}
        
        {/* Screen scanlines effect */}
        <div 
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 255, 255, 0.1) 1px, rgba(0, 255, 255, 0.1) 2px)',
            animation: 'vhs-lines 0.1s linear infinite'
          }}
        />
        
        {/* Screen glow */}
        <div 
          className="absolute inset-0 bg-neon-cyan/5 rounded-sm animate-pulse"
        />
      </div>
    </div>
  );
};
