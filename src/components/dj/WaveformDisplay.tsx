import React from 'react';

interface WaveformDisplayProps {
  data: number[];
  color: string;
  height?: number;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({ data, color, height = 60 }) => {
  const barCount = data.length || 64;
  const barWidth = 100 / barCount;

  return (
    <div className="w-full rounded-lg overflow-hidden bg-black/60 border border-white/10" style={{ height }}>
      <svg width="100%" height="100%" viewBox={`0 0 ${barCount} ${height}`} preserveAspectRatio="none">
        {data.map((val, i) => {
          const barH = (val / 255) * height;
          return (
            <rect
              key={i}
              x={i}
              y={height - barH}
              width={0.8}
              height={barH}
              fill={color}
              opacity={0.7 + (val / 255) * 0.3}
            />
          );
        })}
      </svg>
    </div>
  );
};
