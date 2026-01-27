import React from 'react';
import { Trophy, Lock } from 'lucide-react';
import { Achievement } from '@/hooks/useNeonMatchAchievements';
import { cn } from '@/lib/utils';

interface NeonMatchAchievementsProps {
  achievements: Achievement[];
  compact?: boolean;
}

export const NeonMatchAchievements: React.FC<NeonMatchAchievementsProps> = ({
  achievements,
  compact = false,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-yellow-400" />
        <span className="text-sm text-cyan-400/80">
          {unlockedCount}/{achievements.length}
        </span>
        <div className="flex -space-x-1">
          {achievements
            .filter((a) => a.unlocked)
            .slice(0, 5)
            .map((achievement) => (
              <div
                key={achievement.id}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-amber-500/20 border border-yellow-500/50 flex items-center justify-center text-xs"
                title={achievement.name}
              >
                {achievement.icon}
              </div>
            ))}
          {unlockedCount > 5 && (
            <div className="w-6 h-6 rounded-full bg-black/50 border border-cyan-500/30 flex items-center justify-center text-xs text-cyan-400">
              +{unlockedCount - 5}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Achievements
        </h3>
        <span className="text-sm text-cyan-400/70">
          {unlockedCount}/{achievements.length} Unlocked
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              'relative p-3 rounded-lg border transition-all',
              achievement.unlocked
                ? 'bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/40'
                : 'bg-black/30 border-white/10 opacity-60'
            )}
          >
            <div className="flex items-start gap-2">
              <div
                className={cn(
                  'text-2xl',
                  !achievement.unlocked && 'grayscale opacity-50'
                )}
              >
                {achievement.unlocked ? achievement.icon : <Lock className="w-5 h-5 text-white/30" />}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-xs font-semibold truncate',
                    achievement.unlocked ? 'text-yellow-400' : 'text-white/50'
                  )}
                >
                  {achievement.name}
                </p>
                <p className="text-[10px] text-white/40 line-clamp-2">
                  {achievement.description}
                </p>
              </div>
            </div>
            {achievement.unlocked && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
