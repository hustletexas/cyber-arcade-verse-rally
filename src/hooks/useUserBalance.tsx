
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
    if (!user || balance.claimable_rewards === 0) return;

    try {
      // Move claimable rewards to main balance
      const newBalance = balance.cctr_balance + balance.claimable_rewards;
      
      const { error: updateError } = await supabase
        .from('user_balances')
        .update({
          cctr_balance: newBalance,
          claimable_rewards: 0,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: balance.claimable_rewards,
          transaction_type: 'claim',
          description: 'Claimed accumulated rewards'
        });

      if (transactionError) throw transactionError;

      setBalance({
        cctr_balance: newBalance,
        claimable_rewards: 0
      });

      return { success: true };
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
