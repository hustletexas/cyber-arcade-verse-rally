import React, { useRef, useCallback, useEffect } from 'react';
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

const HOLD_DELAY = 300; // ms before repeat starts
const HOLD_INTERVAL = 100; // ms between repeats

/** A button that fires once on tap, or repeats on hold */
const HoldButton: React.FC<{
  onAction: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ onAction, children, className }) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const stopHold = useCallback(() => {
    if (timeoutRef.current) { clearTimeout(timeoutRef.current); timeoutRef.current = null; }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const startHold = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    firedRef.current = false;
    onAction();
    firedRef.current = true;
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        onAction();
      }, HOLD_INTERVAL);
    }, HOLD_DELAY);
  }, [onAction]);

  const endHold = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    stopHold();
  }, [stopHold]);

  useEffect(() => stopHold, [stopHold]);

  return (
    <button
      className={className}
      onTouchStart={startHold}
      onTouchEnd={endHold}
      onTouchCancel={endHold}
      onMouseDown={startHold}
      onMouseUp={endHold}
      onMouseLeave={endHold}
      onClick={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
};

/** A button that only fires on tap (no hold repeat) */
const TapButton: React.FC<{
  onAction: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ onAction, children, className }) => {
  const handleTouch = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    onAction();
  }, [onAction]);

  return (
    <button
      className={className}
      onTouchStart={handleTouch}
      onClick={(e) => { e.preventDefault(); onAction(); }}
    >
      {children}
    </button>
  );
};

export const CyberColumnsTouchControls: React.FC<CyberColumnsTouchControlsProps> = ({
  onLeft, onRight, onRotate, onSoftDrop, onHardDrop,
}) => {
  const btn = 'cyber-columns-touch-btn';
  return (
    <div className="flex items-center justify-center gap-3 mt-4 md:hidden">
      <HoldButton onAction={onLeft} className={btn}>
        <ChevronLeft className="w-6 h-6" />
      </HoldButton>
      <HoldButton onAction={onSoftDrop} className={btn}>
        <ChevronDown className="w-6 h-6" />
      </HoldButton>
      <TapButton onAction={onRotate} className={btn}>
        <RotateCw className="w-6 h-6" />
      </TapButton>
      <TapButton onAction={onHardDrop} className={btn}>
        <ChevronsDown className="w-6 h-6" />
      </TapButton>
      <HoldButton onAction={onRight} className={btn}>
        <ChevronRight className="w-6 h-6" />
      </HoldButton>
    </div>
  );
};
