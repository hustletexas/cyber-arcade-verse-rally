import React, { useEffect, useState } from 'react';
import { Achievement } from '@/hooks/useNeonMatchAchievements';
import { cn } from '@/lib/utils';

interface NeonMatchAchievementToastProps {
  achievements: Achievement[];
  onComplete: () => void;
}

export const NeonMatchAchievementToast: React.FC<NeonMatchAchievementToastProps> = ({
  achievements,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (achievements.length === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setIsVisible(false);
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setIsVisible(true);
        }, 300);
      } else {
        setIsVisible(false);
        setTimeout(onComplete, 300);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements.length, onComplete]);

  if (achievements.length === 0) return null;

  const current = achievements[currentIndex];

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div
        className={cn(
          'px-6 py-4 rounded-xl border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-900/90 via-amber-900/90 to-yellow-900/90 backdrop-blur-xl shadow-[0_0_30px_rgba(234,179,8,0.3)] transition-all duration-300',
          isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
        )}
      >
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-bounce">{current.icon}</div>
          <div>
            <p className="text-xs text-yellow-400/80 uppercase tracking-wider font-semibold">
              Achievement Unlocked!
            </p>
            <p className="text-lg font-bold text-white">{current.name}</p>
            <p className="text-sm text-yellow-200/70">{current.description}</p>
          </div>
        </div>
        {achievements.length > 1 && (
          <div className="flex justify-center gap-1 mt-2">
            {achievements.map((_, idx) => (
              <div
                key={idx}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  idx === currentIndex ? 'bg-yellow-400' : 'bg-yellow-400/30'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
