
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RadioStreakData {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  totalSeconds: number;
  tier: 'bronze' | 'silver' | 'gold' | 'diamond';
  sessionSeconds: number;
}

export interface RadioMilestone {
  id: string;
  type: 'streak' | 'total_days' | 'total_hours';
  value: number;
  label: string;
  description: string;
  rewardType: string;
  rewardDescription: string;
  cccReward: number;
  icon: string;
  claimed: boolean;
  progress: number;
  target: number;
}

const MILESTONES: Omit<RadioMilestone, 'claimed' | 'progress' | 'target'>[] = [
  { id: 'streak-3', type: 'streak', value: 3, label: '3-Day Streak', description: 'Listen 3 days in a row', rewardType: 'ccc', rewardDescription: '5 CCC + Listener Badge', cccReward: 5, icon: '🔥' },
  { id: 'streak-7', type: 'streak', value: 7, label: '7-Day Streak', description: 'Listen 7 days in a row', rewardType: 'nft_badge', rewardDescription: '15 CCC + Bronze Listener NFT', cccReward: 15, icon: '🏅' },
  { id: 'streak-14', type: 'streak', value: 14, label: '14-Day Streak', description: 'Listen 14 days in a row', rewardType: 'vip_chat', rewardDescription: '30 CCC + VIP Chat Access', cccReward: 30, icon: '💎' },
  { id: 'streak-30', type: 'streak', value: 30, label: '30-Day Streak', description: 'Listen 30 days in a row', rewardType: 'merch_discount', rewardDescription: '75 CCC + 20% Merch Discount', cccReward: 75, icon: '👑' },
  { id: 'hours-1', type: 'total_hours', value: 1, label: '1 Hour Listened', description: 'Listen for a total of 1 hour', rewardType: 'ccc', rewardDescription: '5 CCC', cccReward: 5, icon: '⏱️' },
  { id: 'hours-5', type: 'total_hours', value: 5, label: '5 Hours Listened', description: 'Listen for a total of 5 hours', rewardType: 'nft_badge', rewardDescription: '15 CCC + Silver Listener NFT', cccReward: 15, icon: '🎧' },
  { id: 'hours-10', type: 'total_hours', value: 10, label: '10 Hours Listened', description: 'Listen for 10 hours total', rewardType: 'vip_chat', rewardDescription: '25 CCC + Gold Listener Badge', cccReward: 25, icon: '🌟' },
  { id: 'hours-24', type: 'total_hours', value: 24, label: '24 Hours Listened', description: 'Listen for a full day total', rewardType: 'merch_discount', rewardDescription: '50 CCC + Diamond Badge + 25% Merch Discount', cccReward: 50, icon: '💫' },
  { id: 'days-7', type: 'total_days', value: 7, label: '7 Days Total', description: 'Listen on 7 different days', rewardType: 'ccc', rewardDescription: '10 CCC', cccReward: 10, icon: '📅' },
  { id: 'days-30', type: 'total_days', value: 30, label: '30 Days Total', description: 'Listen on 30 different days', rewardType: 'nft_badge', rewardDescription: '50 CCC + Legendary Listener NFT', cccReward: 50, icon: '🏆' },
];

export const useRadioStreaks = (walletAddress: string | null, isPlaying: boolean) => {
  const [streakData, setStreakData] = useState<RadioStreakData>({
    currentStreak: 0,
    longestStreak: 0,
    totalDays: 0,
    totalSeconds: 0,
    tier: 'bronze',
    sessionSeconds: 0,
  });
  const [milestones, setMilestones] = useState<RadioMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionSecondsRef = useRef(0);
  const { toast } = useToast();

  // Load streak data and claimed milestones
  const loadStreakData = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    try {
      const { data: streakRow } = await supabase
        .from('radio_streaks' as any)
        .select('*')
        .eq('user_id', walletAddress)
        .single();

      const { data: claimedRows } = await supabase
        .from('radio_milestone_claims' as any)
        .select('milestone_type, milestone_value')
        .eq('user_id', walletAddress);

      const claimed = new Set(
        (claimedRows || []).map((r: any) => `${r.milestone_type}-${r.milestone_value}`)
      );

      const streak = streakRow as any;
      const currentStreak = streak?.current_streak || 0;
      const longestStreak = streak?.longest_streak || 0;
      const totalDays = streak?.total_listen_days || 0;
      const totalSeconds = streak?.total_listen_seconds || 0;
      const tier = (streak?.tier || 'bronze') as RadioStreakData['tier'];

      setStreakData(prev => ({
        ...prev,
        currentStreak,
        longestStreak,
        totalDays,
        totalSeconds,
        tier,
      }));

      // Build milestones with progress
      const builtMilestones: RadioMilestone[] = MILESTONES.map(m => {
        let progress = 0;
        let target = m.value;
        if (m.type === 'streak') progress = currentStreak;
        else if (m.type === 'total_days') progress = totalDays;
        else if (m.type === 'total_hours') progress = Math.floor(totalSeconds / 3600);
        
        return {
          ...m,
          claimed: claimed.has(`${m.type}-${m.value}`),
          progress: Math.min(progress, target),
          target,
        };
      });

      setMilestones(builtMilestones);
    } catch (err) {
      console.error('Failed to load radio streaks:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    loadStreakData();
  }, [loadStreakData]);

  // Track session time while playing
  useEffect(() => {
    if (isPlaying && walletAddress) {
      sessionTimerRef.current = setInterval(() => {
        sessionSecondsRef.current += 1;
        setStreakData(prev => ({
          ...prev,
          sessionSeconds: sessionSecondsRef.current,
        }));
      }, 1000);
    } else {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
        sessionTimerRef.current = null;
      }
    }

    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, [isPlaying, walletAddress]);

  // Sync listen time to Supabase every 5 minutes
  useEffect(() => {
    if (isPlaying && walletAddress) {
      syncTimerRef.current = setInterval(async () => {
        if (sessionSecondsRef.current >= 300) {
          const secondsToSync = sessionSecondsRef.current;
          sessionSecondsRef.current = 0;
          
          try {
            const { data } = await supabase.rpc('record_radio_listen', {
              p_wallet_address: walletAddress,
              p_seconds: Math.min(secondsToSync, 3600),
            });

            if (data && (data as any).success) {
              const d = data as any;
              setStreakData(prev => ({
                ...prev,
                currentStreak: d.current_streak,
                longestStreak: d.longest_streak,
                totalDays: d.total_days,
                totalSeconds: d.total_seconds,
                tier: d.tier,
                sessionSeconds: 0,
              }));
              loadStreakData(); // refresh milestones
            }
          } catch (err) {
            console.error('Failed to sync radio listen:', err);
          }
        }
      }, 300000); // 5 minutes
    } else {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    }

    return () => {
      if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    };
  }, [isPlaying, walletAddress, loadStreakData]);

  // Sync on pause/unmount
  useEffect(() => {
    return () => {
      if (sessionSecondsRef.current > 60 && walletAddress) {
        supabase.rpc('record_radio_listen', {
          p_wallet_address: walletAddress,
          p_seconds: Math.min(sessionSecondsRef.current, 3600),
        }).then(() => {
          sessionSecondsRef.current = 0;
        });
      }
    };
  }, [walletAddress]);

  const claimMilestone = useCallback(async (milestone: RadioMilestone) => {
    if (!walletAddress || milestone.claimed) return;

    try {
      const { data } = await supabase.rpc('claim_radio_milestone', {
        p_wallet_address: walletAddress,
        p_milestone_type: milestone.type,
        p_milestone_value: milestone.value,
        p_reward_type: milestone.rewardType,
        p_reward_description: milestone.rewardDescription,
      });

      const result = data as any;
      if (result?.success) {
        toast({
          title: `${milestone.icon} Milestone Claimed!`,
          description: `${milestone.label}: +${result.ccc_awarded} CCC awarded!`,
        });
        loadStreakData();
      } else {
        toast({
          title: 'Claim Failed',
          description: result?.error || 'Could not claim milestone',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Failed to claim milestone:', err);
    }
  }, [walletAddress, toast, loadStreakData]);

  const formatListenTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}m`;
    return `${mins}m`;
  };

  return {
    streakData,
    milestones,
    isLoading,
    claimMilestone,
    formatListenTime,
  };
};
