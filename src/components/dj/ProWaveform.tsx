import React from 'react';

interface Props {
  data: number[];
  color: string;
  currentTime: number;
  duration: number;
  cuePoint?: number;
  hotCues: (number | null)[];
  loopIn: number | null;
  loopOut: number | null;
  onSeek: (t: number) => void;
}

const HOT_CUE_COLORS = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#00ffff', '#0088ff', '#8800ff', '#ff00ff'];

export const ProWaveform: React.FC<Props> = ({
  data, color, currentTime, duration, cuePoint, hotCues, loopIn, loopOut, onSeek,
}) => {
  const barCount = data.length || 64;
  const height = 60;
  const progress = duration > 0 ? currentTime / duration : 0;

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    onSeek(x * duration);
  };

  return (
    <div className="w-full rounded-lg overflow-hidden bg-black/70 border border-white/10 relative cursor-pointer" style={{ height }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${barCount} ${height}`}
        preserveAspectRatio="none"
        onClick={handleClick}
      >
        {/* Loop region */}
        {loopIn !== null && loopOut !== null && duration > 0 && (
          <rect
            x={(loopIn / duration) * barCount}
            y={0}
            width={((loopOut - loopIn) / duration) * barCount}
            height={height}
            fill={color}
            opacity={0.15}
          />
        )}

        {/* Bars */}
        {data.map((val, i) => {
          const barH = (val / 255) * height;
          const barPos = i / barCount;
          const played = barPos <= progress;
          return (
            <rect
              key={i}
              x={i}
              y={height - barH}
              width={0.8}
              height={barH}
              fill={played ? color : `${color}40`}
              opacity={played ? 0.9 : 0.4}
            />
          );
        })}

        {/* Playhead */}
        <line
          x1={progress * barCount}
          y1={0}
          x2={progress * barCount}
          y2={height}
          stroke="white"
          strokeWidth={0.5}
        />

        {/* Cue point marker */}
        {cuePoint !== undefined && duration > 0 && (
          <line
            x1={(cuePoint / duration) * barCount}
            y1={0}
            x2={(cuePoint / duration) * barCount}
            y2={height}
            stroke="#ffff00"
            strokeWidth={0.5}
            strokeDasharray="2,2"
          />
        )}

        {/* Hot cue markers */}
        {hotCues.map((cue, i) => {
          if (cue === null || duration <= 0) return null;
          return (
            <line
              key={i}
              x1={(cue / duration) * barCount}
              y1={0}
              x2={(cue / duration) * barCount}
              y2={height}
              stroke={HOT_CUE_COLORS[i]}
              strokeWidth={0.4}
            />
          );
        })}
      </svg>

      {/* Beat grid overlay (simulated) */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 23px, ${color}10 23px, ${color}10 24px)`,
      }} />
    </div>
  );
};
