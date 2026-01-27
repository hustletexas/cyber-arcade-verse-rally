
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from './useMultiWallet';
import { useAuth } from './useAuth';

interface UserBalance {
  cctr_balance: number;
  claimable_rewards: number;
}

export const useUserBalance = () => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { user } = useAuth();
  const [balance, setBalance] = useState<UserBalance>({ cctr_balance: 0, claimable_rewards: 0 });
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!primaryWallet?.address) {
      setBalance({ cctr_balance: 0, claimable_rewards: 0 });
      setLoading(false);
      return;
    }

    try {
      // Try to fetch by wallet address first
      const { data, error } = await supabase
        .from('user_balances')
        .select('cctr_balance, claimable_rewards')
        .eq('wallet_address', primaryWallet.address)
        .maybeSingle();

      if (error) {
        console.error('Error fetching balance:', error);
        setLoading(false);
        return;
      }

      if (data) {
        setBalance({
          cctr_balance: data.cctr_balance || 0,
          claimable_rewards: data.claimable_rewards || 0
        });
      } else {
        // No balance record exists for this wallet - create one with starter tokens
        // Generate a deterministic UUID from wallet address for user_id
        const walletHash = primaryWallet.address.slice(0, 32).padEnd(32, '0');
        const generatedUserId = `${walletHash.slice(0, 8)}-${walletHash.slice(8, 12)}-4${walletHash.slice(13, 16)}-a${walletHash.slice(17, 20)}-${walletHash.slice(20, 32)}`;
        
        const { data: newBalance, error: insertError } = await supabase
          .from('user_balances')
          .insert({
            user_id: generatedUserId,
            wallet_address: primaryWallet.address,
            cctr_balance: 100, // Starter balance
            claimable_rewards: 0
          })
          .select('cctr_balance, claimable_rewards')
          .single();

        if (insertError) {
          console.error('Error creating balance:', insertError);
          setBalance({ cctr_balance: 0, claimable_rewards: 0 });
        } else if (newBalance) {
          setBalance({
            cctr_balance: newBalance.cctr_balance || 0,
            claimable_rewards: newBalance.claimable_rewards || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  }, [primaryWallet?.address]);

  const deductBalance = useCallback(async (amount: number): Promise<{ success: boolean; error?: string }> => {
    if (!primaryWallet?.address) {
      return { success: false, error: 'No wallet connected' };
    }

    if (balance.cctr_balance < amount) {
      return { success: false, error: 'Insufficient CCTR balance' };
    }

    try {
      const { error } = await supabase
        .from('user_balances')
        .update({ 
          cctr_balance: balance.cctr_balance - amount,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', primaryWallet.address);

      if (error) throw error;

      // Update local state
      setBalance(prev => ({
        ...prev,
        cctr_balance: prev.cctr_balance - amount
      }));

      return { success: true };
    } catch (error) {
      console.error('Error deducting balance:', error);
      return { success: false, error: 'Failed to deduct balance' };
    }
  }, [primaryWallet?.address, balance.cctr_balance]);

  const addBalance = useCallback(async (amount: number): Promise<{ success: boolean; error?: string }> => {
    if (!primaryWallet?.address) {
      return { success: false, error: 'No wallet connected' };
    }

    try {
      const { error } = await supabase
        .from('user_balances')
        .update({ 
          cctr_balance: balance.cctr_balance + amount,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', primaryWallet.address);

      if (error) throw error;

      // Update local state
      setBalance(prev => ({
        ...prev,
        cctr_balance: prev.cctr_balance + amount
      }));

      return { success: true };
    } catch (error) {
      console.error('Error adding balance:', error);
      return { success: false, error: 'Failed to add balance' };
    }
  }, [primaryWallet?.address, balance.cctr_balance]);

  const claimRewards = useCallback(async () => {
    if (!primaryWallet?.address || balance.claimable_rewards === 0) {
      return { success: false, error: 'No rewards to claim' };
    }

    try {
      const claimed = balance.claimable_rewards;
      
      const { error } = await supabase
        .from('user_balances')
        .update({ 
          cctr_balance: balance.cctr_balance + claimed,
          claimable_rewards: 0,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', primaryWallet.address);

      if (error) throw error;

      setBalance(prev => ({
        cctr_balance: prev.cctr_balance + claimed,
        claimable_rewards: 0
      }));

      return { success: true, claimed_amount: claimed };
    } catch (error) {
      console.error('Error claiming rewards:', error);
      return { success: false, error };
    }
  }, [primaryWallet?.address, balance]);

  // Admin airdrop function - maintained for backwards compatibility
  const adminAirdrop = useCallback(async (amount: number, targetWalletAddress?: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const targetWallet = targetWalletAddress || primaryWallet?.address;
      if (!targetWallet) return { success: false, error: 'No target wallet' };
      
      // Use the secure RPC function if the user is a Supabase auth user
      if (user.id) {
        const { data, error } = await supabase.rpc('admin_airdrop', {
          target_user_id: user.id,
          amount: amount
        });

        if (error) {
          if (error.message?.includes('Unauthorized')) {
            return { success: false, error: 'Admin privileges required' };
          }
          throw error;
        }

        await fetchBalance();
        return { success: true, data };
      }
      
      return { success: false, error: 'Admin function requires Supabase auth' };
    } catch (error) {
      console.error('Error processing airdrop:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [user, primaryWallet?.address, fetchBalance]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  // Also refetch when wallet connects/disconnects
  useEffect(() => {
    if (isWalletConnected) {
      fetchBalance();
    } else {
      setBalance({ cctr_balance: 0, claimable_rewards: 0 });
      setLoading(false);
    }
  }, [isWalletConnected, fetchBalance]);

  return {
    balance,
    loading,
    claimRewards,
    deductBalance,
    addBalance,
    adminAirdrop,
    refetch: fetchBalance
  };
};
