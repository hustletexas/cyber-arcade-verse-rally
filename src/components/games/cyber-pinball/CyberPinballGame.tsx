import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PinballTable } from './PinballTable';
import { PinballObjects } from './PinballObjects';
import { PinballHUD } from './PinballHUD';
import {
  createPhysicsWorld,
  launchBall,
  activateFlipper,
  releaseFlipper,
  stepEngine,
  PhysicsWorld,
  GameState,
} from './pinballPhysics';

// Physics sync component that runs inside Canvas
const PhysicsLoop: React.FC<{ worldRef: React.MutableRefObject<PhysicsWorld | null> }> = ({ worldRef }) => {
  useFrame((_, delta) => {
    if (worldRef.current) {
      // Clamp delta to avoid physics explosions on tab switch
      const dt = Math.min(delta * 1000, 32);
      stepEngine(worldRef.current, dt);
    }
  });
  return null;
};

interface CyberPinballGameProps {
  onGameOver?: (score: number) => void;
}

export const CyberPinballGame: React.FC<CyberPinballGameProps> = ({ onGameOver }) => {
  const worldRef = useRef<PhysicsWorld | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [charging, setCharging] = useState(false);
  const [power, setPower] = useState(0);
  const chargeInterval = useRef<number | null>(null);
  const gameOverFired = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Score flash callback
  const onScoreRef = useRef<((label: string, points: number) => void) | null>(null);

  // Initialize physics
  const initWorld = useCallback(() => {
    if (worldRef.current) {
      worldRef.current.cleanup();
    }
    gameOverFired.current = false;
    const w = createPhysicsWorld((label, pts) => {
      // Could trigger visual effects here
    });
    worldRef.current = w;
    setGameState({ ...w.state });
  }, []);

  useEffect(() => {
    initWorld();
    return () => {
      worldRef.current?.cleanup();
    };
  }, [initWorld]);

  // Sync game state to React at 10fps (for HUD updates)
  useEffect(() => {
    const interval = setInterval(() => {
      if (worldRef.current) {
        const s = worldRef.current.state;
        setGameState({ ...s });
        if (s.gameOver && !gameOverFired.current) {
          gameOverFired.current = true;
          onGameOver?.(s.score);
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [onGameOver]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!worldRef.current || worldRef.current.state.gameOver) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (!charging && !worldRef.current.state.launched) {
            setCharging(true);
            setPower(0);
            let p = 0;
            chargeInterval.current = window.setInterval(() => {
              p = Math.min(1, p + 0.025);
              setPower(p);
            }, 30);
          }
          break;
        case 'ArrowLeft':
        case 'z':
        case 'Z':
          e.preventDefault();
          activateFlipper(worldRef.current, 'left');
          break;
        case 'ArrowRight':
        case 'm':
        case 'M':
          e.preventDefault();
          activateFlipper(worldRef.current, 'right');
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!worldRef.current) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (charging) {
            if (chargeInterval.current) {
              clearInterval(chargeInterval.current);
              chargeInterval.current = null;
            }
            launchBall(worldRef.current, power);
            setCharging(false);
            setPower(0);
          }
          break;
        case 'ArrowLeft':
        case 'z':
        case 'Z':
          releaseFlipper(worldRef.current, 'left');
          break;
        case 'ArrowRight':
        case 'm':
        case 'M':
          releaseFlipper(worldRef.current, 'right');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (chargeInterval.current) clearInterval(chargeInterval.current);
    };
  }, [charging, power]);

  const handleRestart = useCallback(() => {
    initWorld();
  }, [initWorld]);

  return (
    <div ref={containerRef} className="relative w-[400px] h-[700px] max-w-full mx-auto rounded-lg overflow-hidden border-2 border-neon-cyan/30 bg-black">
      <Canvas
        camera={{
          position: [3, -4, 8],
          fov: 45,
          near: 0.1,
          far: 100,
        }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#050510' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} color="#4a4a8a" />
        <directionalLight position={[3, 5, 8]} intensity={0.8} color="#ffffff" castShadow />
        <pointLight position={[3, -2, 3]} intensity={0.6} color="#00e5ff" distance={15} />
        <pointLight position={[3, -8, 3]} intensity={0.4} color="#ff006e" distance={15} />

        {/* Table */}
        <PinballTable />

        {/* Dynamic objects */}
        <PinballObjects worldRef={worldRef} />

        {/* Physics loop */}
        <PhysicsLoop worldRef={worldRef} />
      </Canvas>

      {/* HUD overlay */}
      {gameState && (
        <PinballHUD
          state={gameState}
          power={power}
          charging={charging}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
};

export default CyberPinballGame;
