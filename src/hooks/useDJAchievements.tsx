import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface DJMilestone {
  id: string;
  user_id: string;
  milestone_type: 'first_mix' | 'ten_mixes' | 'featured_mix';
  mix_count: number;
  reached_at: string | null;
  claim_eligible: boolean;
  claimed: boolean;
  claim_transaction_hash: string | null;
  claimed_at: string | null;
}

const BADGE_META: Record<string, { name: string; icon: string; description: string; threshold: number }> = {
  first_mix: { name: 'DJ Rookie Badge', icon: '🎧', description: 'Record your first mix', threshold: 1 },
  ten_mixes: { name: 'DJ Regular Badge', icon: '🎛️', description: 'Complete 10 mixes', threshold: 10 },
  featured_mix: { name: 'DJ Champion Badge', icon: '🏆', description: 'Get a mix featured', threshold: 1 },
};

export const DJ_BADGE_META = BADGE_META;

export function useDJAchievements() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [milestones, setMilestones] = useState<DJMilestone[]>([]);
  const [mixCount, setMixCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMilestones = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('dj_milestones')
        .select('*')
        .eq('user_id', user.id);
      if (error) throw error;
      setMilestones((data as any[]) || []);
    } catch (e) {
      console.error('Error fetching DJ milestones:', e);
    }
  }, [user?.id]);

  const fetchMixCount = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { count, error } = await supabase
        .from('dj_completed_mixes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);
      if (error) throw error;
      setMixCount(count || 0);
    } catch (e) {
      console.error('Error fetching mix count:', e);
    }
  }, [user?.id]);

  // Save a completed mix and check milestones
  const saveMix = useCallback(async (title: string, durationSeconds: number) => {
    if (!user?.id) {
      toast({ title: 'Sign in required', description: 'Log in to save mixes and earn DJ badges.', variant: 'destructive' });
      return null;
    }

    try {
      // Insert mix record
      const { error: insertError } = await supabase
        .from('dj_completed_mixes')
        .insert({ user_id: user.id, title, duration_seconds: durationSeconds });
      if (insertError) throw insertError;

      // Check milestones via RPC
      const { data, error: rpcError } = await supabase.rpc('check_dj_milestones', { p_user_id: user.id });
      if (rpcError) throw rpcError;

      const result = data as any;
      if (result?.new_milestones?.length > 0) {
        for (const m of result.new_milestones) {
          toast({
            title: `🎉 ${m.name} Unlocked!`,
            description: 'You can now claim this as an on-chain NFT badge!',
            duration: 6000,
          });
        }
      }

      // Refresh data
      await Promise.all([fetchMilestones(), fetchMixCount()]);
      return result;
    } catch (e) {
      console.error('Error saving mix:', e);
      toast({ title: 'Error saving mix', description: String(e), variant: 'destructive' });
      return null;
    }
  }, [user?.id, toast, fetchMilestones, fetchMixCount]);

  // Claim badge on-chain (marks as claimed, Soroban interaction via external signing)
  const claimBadge = useCallback(async (milestoneType: string) => {
    if (!user?.id) return;

    const milestone = milestones.find(m => m.milestone_type === milestoneType);
    if (!milestone || !milestone.claim_eligible || milestone.claimed) {
      toast({ title: 'Cannot claim', description: 'Badge not eligible or already claimed.' });
      return;
    }

    try {
      // Mark as claimed in Supabase (Soroban claim happens via external signing service)
      const { error } = await supabase
        .from('dj_milestones')
        .update({ claimed: true, claimed_at: new Date().toISOString() })
        .eq('id', milestone.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: `${BADGE_META[milestoneType]?.icon} Badge Claimed!`,
        description: `${BADGE_META[milestoneType]?.name} NFT will be minted to your wallet via Soroban.`,
        duration: 5000,
      });

      await fetchMilestones();
    } catch (e) {
      console.error('Error claiming badge:', e);
      toast({ title: 'Claim failed', description: String(e), variant: 'destructive' });
    }
  }, [user?.id, milestones, toast, fetchMilestones]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchMilestones(), fetchMixCount()]);
      setLoading(false);
    };
    load();
  }, [fetchMilestones, fetchMixCount]);

  return { milestones, mixCount, loading, saveMix, claimBadge, refetch: fetchMilestones };
}
