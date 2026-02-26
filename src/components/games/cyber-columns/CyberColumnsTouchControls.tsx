import React from 'react';
import {
  ChevronLeft, ChevronRight, ChevronDown, ChevronsDown, RotateCw,
} from 'lucide-react';

interface CyberColumnsTouchControlsProps {
  onLeft: () => void;
  onRight: () => void;
  onRotate: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
}

export const CyberColumnsTouchControls: React.FC<CyberColumnsTouchControlsProps> = ({
  onLeft, onRight, onRotate, onSoftDrop, onHardDrop,
}) => {
  return (
    <div className="flex items-center justify-center gap-3 mt-4 md:hidden">
      <button className="cyber-columns-touch-btn" onTouchStart={onLeft} onClick={onLeft}>
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button className="cyber-columns-touch-btn" onTouchStart={onSoftDrop} onClick={onSoftDrop}>
        <ChevronDown className="w-6 h-6" />
      </button>
      <button className="cyber-columns-touch-btn" onTouchStart={onRotate} onClick={onRotate}>
        <RotateCw className="w-6 h-6" />
      </button>
      <button className="cyber-columns-touch-btn" onTouchStart={onHardDrop} onClick={onHardDrop}>
        <ChevronsDown className="w-6 h-6" />
      </button>
      <button className="cyber-columns-touch-btn" onTouchStart={onRight} onClick={onRight}>
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};
