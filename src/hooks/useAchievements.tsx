import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  difficulty: string;
  points: number;
  unlock_condition: string;
  requirements: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: number;
  achievement: Achievement;
}

export interface AchievementProgress {
  id: string;
  user_id: string;
  achievement_id: string;
  current_progress: number;
  target_progress: number;
  last_updated: string;
  achievement: Achievement;
}

export const useAchievements = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all available achievements
  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('difficulty', { ascending: true });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  // Fetch user's earned achievements
  const fetchUserAchievements = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setUserAchievements(data || []);
    } catch (error) {
      console.error('Error fetching user achievements:', error);
    }
  };

  // Fetch user's achievement progress
  const fetchAchievementProgress = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('achievement_progress')
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq('user_id', user.id)
        .order('last_updated', { ascending: false });

      if (error) throw error;
      setAchievementProgress(data || []);
    } catch (error) {
      console.error('Error fetching achievement progress:', error);
    }
  };

  // Track achievement progress
  const trackAchievement = async (achievementType: string, incrementAmount: number = 1) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('update_achievement_progress', {
        user_id_param: user.id,
        achievement_type: achievementType,
        increment_amount: incrementAmount
      });

      if (error) throw error;

      // If achievement was earned, show notification
      if ((data as any)?.achievement_earned) {
        toast({
          title: "🎉 Achievement Unlocked!",
          description: "Check your achievements to see what you've earned!",
          duration: 5000,
        });

        // Refresh achievements and progress
        await Promise.all([
          fetchUserAchievements(),
          fetchAchievementProgress()
        ]);
      } else {
        // Just refresh progress
        await fetchAchievementProgress();
      }

      return data;
    } catch (error) {
      console.error('Error tracking achievement:', error);
    }
  };

  // Get achievement statistics
  const getAchievementStats = () => {
    const totalAchievements = achievements.length;
    const earnedAchievements = userAchievements.length;
    const totalPoints = userAchievements.reduce((sum, ua) => sum + (ua.achievement?.points || 0), 0);
    const completionRate = totalAchievements > 0 ? (earnedAchievements / totalAchievements) * 100 : 0;

    const categoryCounts = achievements.reduce((acc, achievement) => {
      acc[achievement.category] = (acc[achievement.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const earnedByCategory = userAchievements.reduce((acc, ua) => {
      const category = ua.achievement?.category;
      if (category) {
        acc[category] = (acc[category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      totalAchievements,
      earnedAchievements,
      totalPoints,
      completionRate,
      categoryCounts,
      earnedByCategory
    };
  };

  // Check if achievement is earned
  const isAchievementEarned = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  // Get progress for specific achievement
  const getAchievementProgressById = (achievementId: string) => {
    return achievementProgress.find(ap => ap.achievement_id === achievementId);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAchievements();
      if (user?.id) {
        await Promise.all([
          fetchUserAchievements(),
          fetchAchievementProgress()
        ]);
      }
      setLoading(false);
    };

    loadData();
  }, [user?.id]);

  // Track first login achievement
  useEffect(() => {
    if (user?.id && achievements.length > 0) {
      trackAchievement('first_login');
    }
  }, [user?.id, achievements.length]);

  return {
    achievements,
    userAchievements,
    achievementProgress,
    loading,
    trackAchievement,
    getAchievementStats,
    isAchievementEarned,
    getAchievementProgressById,
    refetch: async () => {
      await Promise.all([
        fetchAchievements(),
        fetchUserAchievements(),
        fetchAchievementProgress()
      ]);
    }
  };
};