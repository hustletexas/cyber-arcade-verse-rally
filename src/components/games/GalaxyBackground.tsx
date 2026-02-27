import React, { useMemo } from 'react';
import '@/components/games/cyber-columns/cyber-columns.css';

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  duration: `${6 + Math.random() * 8}s`,
  delay: `${Math.random() * 6}s`,
  size: `${2 + Math.random() * 3}px`,
  color: ['hsl(330 100% 65%)', 'hsl(199 100% 60%)', 'hsl(270 80% 65%)', 'hsl(180 90% 55%)', 'hsl(45 100% 60%)'][Math.floor(Math.random() * 5)],
}));

export const GalaxyBackground: React.FC = () => (
  <>
    <div className="cc-starfield" />
    <div className="cc-nebula" />
    <div className="cc-orbit-ring" />
    <div className="cc-particles">
      {PARTICLES.map((p) => (
        <div
          key={p.id}
          className="cc-particle"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            boxShadow: `0 0 6px ${p.color}`,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  </>
);
