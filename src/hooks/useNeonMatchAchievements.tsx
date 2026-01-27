import { useState, useEffect, useCallback } from 'react';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (stats: GameStats) => boolean;
}

export interface GameStats {
  score: number;
  timeSeconds: number;
  moves: number;
  mismatches: number;
}

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'perfect_run',
    name: 'Perfect Memory',
    description: 'Complete a game with zero mismatches',
    icon: '🎯',
    check: (stats) => stats.mismatches === 0,
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete a game in under 60 seconds',
    icon: '⚡',
    check: (stats) => stats.timeSeconds < 60,
  },
  {
    id: 'lightning_fast',
    name: 'Lightning Fast',
    description: 'Complete a game in under 45 seconds',
    icon: '🌩️',
    check: (stats) => stats.timeSeconds < 45,
  },
  {
    id: 'time_lord',
    name: 'Time Lord',
    description: 'Complete a game in under 30 seconds',
    icon: '⏱️',
    check: (stats) => stats.timeSeconds < 30,
  },
  {
    id: 'efficient',
    name: 'Efficient Player',
    description: 'Complete a game in under 40 moves',
    icon: '🧠',
    check: (stats) => stats.moves < 40,
  },
  {
    id: 'master',
    name: 'Match Master',
    description: 'Score over 5000 points in a single game',
    icon: '👑',
    check: (stats) => stats.score >= 5000,
  },
  {
    id: 'legend',
    name: 'Neon Legend',
    description: 'Perfect run under 60 seconds',
    icon: '🏆',
    check: (stats) => stats.mismatches === 0 && stats.timeSeconds < 60,
  },
];

const STORAGE_KEY = 'neon_match_achievements';

export const useNeonMatchAchievements = (walletAddress: string | null) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  // Load achievements from localStorage
  useEffect(() => {
    const storageKey = walletAddress ? `${STORAGE_KEY}_${walletAddress}` : STORAGE_KEY;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        setAchievements(JSON.parse(stored));
      } catch {
        initializeAchievements();
      }
    } else {
      initializeAchievements();
    }
  }, [walletAddress]);

  const initializeAchievements = useCallback(() => {
    const initial: Achievement[] = ACHIEVEMENT_DEFINITIONS.map((def) => ({
      id: def.id,
      name: def.name,
      description: def.description,
      icon: def.icon,
      unlocked: false,
    }));
    setAchievements(initial);
  }, []);

  const saveAchievements = useCallback((updated: Achievement[]) => {
    const storageKey = walletAddress ? `${STORAGE_KEY}_${walletAddress}` : STORAGE_KEY;
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setAchievements(updated);
  }, [walletAddress]);

  const checkAchievements = useCallback((stats: GameStats): Achievement[] => {
    const unlocked: Achievement[] = [];
    
    const updated = achievements.map((achievement) => {
      if (achievement.unlocked) return achievement;
      
      const definition = ACHIEVEMENT_DEFINITIONS.find((d) => d.id === achievement.id);
      if (definition && definition.check(stats)) {
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: new Date().toISOString(),
        };
        unlocked.push(unlockedAchievement);
        return unlockedAchievement;
      }
      return achievement;
    });

    if (unlocked.length > 0) {
      saveAchievements(updated);
      setNewlyUnlocked(unlocked);
    }

    return unlocked;
  }, [achievements, saveAchievements]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return {
    achievements,
    newlyUnlocked,
    checkAchievements,
    clearNewlyUnlocked,
    unlockedCount,
    totalCount,
  };
};
