import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TW, TH } from './pinballPhysics';

// Scale factor: physics units → 3D units
const S = 0.02;
const W = TW * S;
const H = TH * S;

export const PinballTable: React.FC = () => {
  const wallMaterial = useMemo(() => (
    <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.3} />
  ), []);

  const railMaterial = useMemo(() => (
    <meshStandardMaterial color="#0f3460" metalness={0.9} roughness={0.2} emissive="#00e5ff" emissiveIntensity={0.15} />
  ), []);

  return (
    <group>
      {/* Table surface */}
      <mesh position={[W / 2, -H / 2, -0.05]} receiveShadow>
        <boxGeometry args={[W + 0.2, H + 0.2, 0.08]} />
        <meshStandardMaterial
          color="#0d0d1a"
          metalness={0.6}
          roughness={0.4}
          flatShading
        />
      </mesh>

      {/* Grid lines on table */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={`hline-${i}`} position={[W / 2, -i * (H / 12), -0.005]}>
          <boxGeometry args={[W, 0.003, 0.002]} />
          <meshBasicMaterial color="#1a1a3e" transparent opacity={0.3} />
        </mesh>
      ))}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={`vline-${i}`} position={[i * (W / 8), -H / 2, -0.005]}>
          <boxGeometry args={[0.003, H, 0.002]} />
          <meshBasicMaterial color="#1a1a3e" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Left wall */}
      <mesh position={[-0.1, -H / 2, 0.06]}>
        <boxGeometry args={[0.2, H + 0.4, 0.2]} />
        {railMaterial}
      </mesh>

      {/* Right wall */}
      <mesh position={[W + 0.1, -H / 2, 0.06]}>
        <boxGeometry args={[0.2, H + 0.4, 0.2]} />
        {railMaterial}
      </mesh>

      {/* Top wall */}
      <mesh position={[W / 2, 0.1, 0.06]}>
        <boxGeometry args={[W + 0.2, 0.2, 0.2]} />
        {railMaterial}
      </mesh>

      {/* Plunger lane separator */}
      <mesh position={[(TW - 30) * S, -TH * 0.35 * S, 0.04]}>
        <boxGeometry args={[0.04, TH * 0.5 * S, 0.12]} />
        {railMaterial}
      </mesh>

      {/* Drain guides */}
      <mesh position={[40 * S, -(TH - 60) * S, 0.04]} rotation={[0, 0, Math.PI * 0.2]}>
        <boxGeometry args={[80 * S, 0.04, 0.1]} />
        {railMaterial}
      </mesh>
      <mesh position={[(TW - 70) * S, -(TH - 60) * S, 0.04]} rotation={[0, 0, -Math.PI * 0.2]}>
        <boxGeometry args={[80 * S, 0.04, 0.1]} />
        {railMaterial}
      </mesh>

      {/* City skyline backdrop */}
      <CityBackdrop />
    </group>
  );
};

const CityBackdrop: React.FC = () => {
  const buildings = useMemo(() => {
    const b = [];
    for (let i = 0; i < 12; i++) {
      const w = 0.15 + Math.random() * 0.3;
      const h = 0.5 + Math.random() * 1.5;
      b.push({
        x: -1 + i * 0.55 + Math.random() * 0.2,
        w,
        h,
        color: `hsl(${220 + Math.random() * 40}, 60%, ${8 + Math.random() * 12}%)`,
      });
    }
    return b;
  }, []);

  return (
    <group position={[W / 2, 1.5, -0.5]}>
      {buildings.map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, 0]}>
          <boxGeometry args={[b.w, b.h, 0.1]} />
          <meshStandardMaterial color={b.color} flatShading emissive="#000830" emissiveIntensity={0.3} />
        </mesh>
      ))}
      {/* Neon signs on a few buildings */}
      {buildings.filter((_, i) => i % 3 === 0).map((b, i) => (
        <mesh key={`neon-${i}`} position={[b.x, b.h * 0.7, 0.06]}>
          <boxGeometry args={[b.w * 0.6, 0.03, 0.01]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#00e5ff' : '#ff006e'}
            emissive={i % 2 === 0 ? '#00e5ff' : '#ff006e'}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
};
