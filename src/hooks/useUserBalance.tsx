
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserBalance {
  cctr_balance: number;
  claimable_rewards: number;
}

export const useUserBalance = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<UserBalance>({ cctr_balance: 0, claimable_rewards: 0 });
  const [loading, setLoading] = useState(true);

  const fetchBalance = async () => {
    if (!user) {
      setBalance({ cctr_balance: 0, claimable_rewards: 0 });
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('cctr_balance, claimable_rewards')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching balance:', error);
        return;
      }

      if (data) {
        setBalance(data);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimRewards = async () => {
    if (!user || balance.claimable_rewards === 0) return { success: false, error: 'No rewards to claim' };

    try {
      // Use secure server-side function to claim rewards
      const { data, error } = await supabase.rpc('claim_user_rewards');

      if (error) throw error;

      const result = data as { success: boolean; error?: string; claimed_amount?: number; new_balance?: number } | null;

      if (!result?.success) {
        return { success: false, error: result?.error || 'Failed to claim rewards' };
      }

      // Update local state with new balance
      setBalance({
        cctr_balance: result.new_balance || 0,
        claimable_rewards: 0
      });

      return { success: true, claimed_amount: result.claimed_amount };
    } catch (error) {
      console.error('Error claiming rewards:', error);
      return { success: false, error };
    }
  };

  const adminAirdrop = async (amount: number, targetUserId?: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const userId = targetUserId || user.id;
      
      // Call the secure server-side admin_airdrop function
      // This function checks for admin role on the server
      const { data, error } = await supabase.rpc('admin_airdrop', {
        target_user_id: userId,
        amount: amount
      });

      if (error) {
        // Handle authorization errors gracefully
        if (error.message?.includes('Unauthorized')) {
          return { success: false, error: 'Admin privileges required' };
        }
        throw error;
      }

      if (userId === user.id) {
        await fetchBalance();
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error processing airdrop:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  useEffect(() => {
    fetchBalance();
  }, [user]);

  return {
    balance,
    loading,
    claimRewards,
    adminAirdrop,
    refetch: fetchBalance
  };
};
