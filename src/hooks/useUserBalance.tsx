
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
        .single();

      if (error && error.code !== 'PGRST116') {
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
    if (!user) return;

    try {
      const userId = targetUserId || user.id;
      
      // Add to claimable rewards
      const { error: updateError } = await supabase
        .from('user_balances')
        .update({
          claimable_rewards: supabase.rpc('increment_claimable', { amount })
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      // Record the transaction
      const { error: transactionError } = await supabase
        .from('token_transactions')
        .insert({
          user_id: userId,
          amount,
          transaction_type: 'airdrop',
          description: 'Admin airdrop'
        });

      if (transactionError) throw transactionError;

      if (userId === user.id) {
        await fetchBalance();
      }

      return { success: true };
    } catch (error) {
      console.error('Error processing airdrop:', error);
      return { success: false, error };
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
