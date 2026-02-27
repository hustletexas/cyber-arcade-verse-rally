import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { PhysicsWorld, TW, TH, BALL_R } from './pinballPhysics';

const S = 0.02; // physics → 3D scale

interface PinballObjectsProps {
  worldRef: React.MutableRefObject<PhysicsWorld | null>;
}

export const PinballObjects: React.FC<PinballObjectsProps> = ({ worldRef }) => {
  const ballRef = useRef<THREE.Mesh>(null);
  const extraBallRefs = useRef<THREE.Mesh[]>([]);
  const leftFlipperRef = useRef<THREE.Mesh>(null);
  const rightFlipperRef = useRef<THREE.Mesh>(null);
  const bumperRefs = useRef<(THREE.Mesh | null)[]>([null, null, null]);
  const bumperGlowRef = useRef<number[]>([0, 0, 0]);
  const dropTargetRefs = useRef<(THREE.Mesh | null)[]>([]);
  const trailRef = useRef<THREE.Vector3[]>([]);

  useFrame(() => {
    const w = worldRef.current;
    if (!w) return;

    // Ball position
    if (w.ball && ballRef.current) {
      const bx = w.ball.position.x * S;
      const by = -w.ball.position.y * S;
      if (Number.isFinite(bx) && Number.isFinite(by)) {
        ballRef.current.position.set(bx, by, BALL_R * S);
        ballRef.current.visible = true;
        // Trail
        trailRef.current.push(new THREE.Vector3(bx, by, BALL_R * S));
        if (trailRef.current.length > 8) trailRef.current.shift();
      }
    } else if (ballRef.current) {
      ballRef.current.visible = false;
    }

    // Flippers
    if (leftFlipperRef.current) {
      const lf = w.leftFlipper;
      leftFlipperRef.current.position.set(lf.position.x * S, -lf.position.y * S, 0.04);
      leftFlipperRef.current.rotation.z = -lf.angle;
    }
    if (rightFlipperRef.current) {
      const rf = w.rightFlipper;
      rightFlipperRef.current.position.set(rf.position.x * S, -rf.position.y * S, 0.04);
      rightFlipperRef.current.rotation.z = -rf.angle;
    }

    // Bumper glow decay
    bumperGlowRef.current = bumperGlowRef.current.map(g => Math.max(0, g - 0.03));
  });

  return (
    <group>
      {/* Ball */}
      <mesh ref={ballRef} castShadow>
        <sphereGeometry args={[BALL_R * S, 16, 16]} />
        <meshStandardMaterial
          color="#c0c0c0"
          metalness={0.95}
          roughness={0.05}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* Ball trail */}
      <BallTrail trailRef={trailRef} />

      {/* Left flipper */}
      <mesh ref={leftFlipperRef} castShadow>
        <boxGeometry args={[60 * S, 10 * S, 0.06]} />
        <meshStandardMaterial
          color="#ff006e"
          emissive="#ff006e"
          emissiveIntensity={0.6}
          metalness={0.7}
          roughness={0.3}
          flatShading
        />
      </mesh>

      {/* Right flipper */}
      <mesh ref={rightFlipperRef} castShadow>
        <boxGeometry args={[60 * S, 10 * S, 0.06]} />
        <meshStandardMaterial
          color="#ff006e"
          emissive="#ff006e"
          emissiveIntensity={0.6}
          metalness={0.7}
          roughness={0.3}
          flatShading
        />
      </mesh>

      {/* Bumpers */}
      <Bumper position={[TW * 0.35 * S, -TH * 0.22 * S, 0.05]} index={0} glowRef={bumperGlowRef} meshRef={(el) => { bumperRefs.current[0] = el; }} />
      <Bumper position={[TW * 0.55 * S, -TH * 0.18 * S, 0.05]} index={1} glowRef={bumperGlowRef} meshRef={(el) => { bumperRefs.current[1] = el; }} />
      <Bumper position={[TW * 0.45 * S, -TH * 0.3 * S, 0.05]} index={2} glowRef={bumperGlowRef} meshRef={(el) => { bumperRefs.current[2] = el; }} />

      {/* Slingshots */}
      <mesh position={[55 * S, -(TH - 130) * S, 0.04]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[15 * S, 50 * S, 0.06]} />
        <meshStandardMaterial color="#7b2ff7" emissive="#7b2ff7" emissiveIntensity={0.4} flatShading />
      </mesh>
      <mesh position={[(TW - 85) * S, -(TH - 130) * S, 0.04]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[15 * S, 50 * S, 0.06]} />
        <meshStandardMaterial color="#7b2ff7" emissive="#7b2ff7" emissiveIntensity={0.4} flatShading />
      </mesh>

      {/* Drop targets (CYBER) */}
      <DropTargets worldRef={worldRef} />

      {/* Orbit lane markers */}
      <mesh position={[20 * S, -TH * 0.15 * S, 0.04]}>
        <boxGeometry args={[15 * S, 30 * S, 0.04]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>
      <mesh position={[(TW - 50) * S, -TH * 0.15 * S, 0.04]}>
        <boxGeometry args={[15 * S, 30 * S, 0.04]} />
        <meshStandardMaterial color="#00e5ff" emissive="#00e5ff" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>

      {/* Ramp indicator */}
      <mesh position={[TW * 0.45 * S, -TH * 0.12 * S, 0.04]}>
        <boxGeometry args={[30 * S, 10 * S, 0.03]} />
        <meshStandardMaterial color="#ffbe0b" emissive="#ffbe0b" emissiveIntensity={0.6} transparent opacity={0.7} />
      </mesh>
    </group>
  );
};

// ── Sub-components ──

const Bumper: React.FC<{
  position: [number, number, number];
  index: number;
  glowRef: React.MutableRefObject<number[]>;
  meshRef: (el: THREE.Mesh | null) => void;
}> = ({ position, index, glowRef, meshRef }) => {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(() => {
    if (matRef.current) {
      const glow = glowRef.current[index] || 0;
      matRef.current.emissiveIntensity = 0.5 + glow * 2;
    }
  });

  return (
    <mesh ref={(el) => { ref.current = el; meshRef(el); }} position={position} castShadow>
      <cylinderGeometry args={[16 * 0.02, 16 * 0.02, 0.12, 8]} />
      <meshStandardMaterial
        ref={matRef}
        color="#00e5ff"
        emissive="#00e5ff"
        emissiveIntensity={0.5}
        metalness={0.6}
        roughness={0.3}
        flatShading
      />
    </mesh>
  );
};

const DropTargets: React.FC<{ worldRef: React.MutableRefObject<PhysicsWorld | null> }> = ({ worldRef }) => {
  const labels = ['C', 'Y', 'B', 'E', 'R'];
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const matRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame(() => {
    const w = worldRef.current;
    if (!w) return;
    w.state.cyberTargets.forEach((hit, i) => {
      if (matRefs.current[i]) {
        matRefs.current[i]!.emissiveIntensity = hit ? 0.1 : 1.2;
        matRefs.current[i]!.opacity = hit ? 0.3 : 1;
      }
    });
  });

  return (
    <group>
      {labels.map((letter, i) => {
        const x = (TW * 0.25 + i * 25) * S;
        const y = -TH * 0.4 * S;
        return (
          <mesh
            key={letter}
            ref={(el) => { refs.current[i] = el; }}
            position={[x, y, 0.05]}
          >
            <boxGeometry args={[8 * S, 20 * S, 0.08]} />
            <meshStandardMaterial
              ref={(el) => { matRefs.current[i] = el; }}
              color="#ff006e"
              emissive="#ff006e"
              emissiveIntensity={1.2}
              transparent
              flatShading
            />
          </mesh>
        );
      })}
    </group>
  );
};

const BallTrail: React.FC<{ trailRef: React.MutableRefObject<THREE.Vector3[]> }> = ({ trailRef }) => {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const trail = trailRef.current;
    for (let i = 0; i < 8; i++) {
      const mesh = meshRefs.current[i];
      if (!mesh) continue;
      if (i < trail.length) {
        mesh.visible = true;
        mesh.position.copy(trail[i]);
        const alpha = (i + 1) / trail.length;
        mesh.scale.setScalar(alpha * 0.7);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = alpha * 0.4;
      } else {
        mesh.visible = false;
      }
    }
  });

  return (
    <group>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} ref={(el) => { meshRefs.current[i] = el; }} visible={false}>
          <sphereGeometry args={[BALL_R * S * 0.8, 6, 6]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
};
