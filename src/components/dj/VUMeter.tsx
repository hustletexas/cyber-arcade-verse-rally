import React from 'react';

interface Props {
  level: number; // 0–1
  label?: string;
  color?: string;
  height?: number;
}

export const VUMeter: React.FC<Props> = ({ level, label, color = '#00ffff', height = 120 }) => {
  const segments = 20;
  const activeSegments = Math.round(level * segments);

  return (
    <div className="flex flex-col items-center gap-0.5">
      {label && <span className="text-[8px] text-muted-foreground">{label}</span>}
      <div className="flex flex-col-reverse gap-[1px]" style={{ height }}>
        {Array.from({ length: segments }, (_, i) => {
          const isActive = i < activeSegments;
          const isHot = i >= segments * 0.8;
          const isWarm = i >= segments * 0.6;
          const segColor = isHot ? '#ff0000' : isWarm ? '#ffaa00' : color;
          return (
            <div
              key={i}
              className="w-3 rounded-[1px] transition-opacity duration-75"
              style={{
                height: height / segments - 1,
                backgroundColor: isActive ? segColor : 'rgba(255,255,255,0.06)',
                opacity: isActive ? 1 : 0.3,
                boxShadow: isActive ? `0 0 4px ${segColor}40` : 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
