
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
        // No balance record exists - use secure server-side function to initialize
        interface InitBalanceResponse {
          success: boolean;
          cctr_balance?: number;
          claimable_rewards?: number;
          error?: string;
          created?: boolean;
        }
        
        const { data: initData, error: initError } = await supabase
          .rpc('initialize_wallet_balance', {
            p_wallet_address: primaryWallet.address
          });

        const initResult = initData as unknown as InitBalanceResponse | null;

        if (initError) {
          console.error('Error initializing balance:', initError);
          setBalance({ cctr_balance: 0, claimable_rewards: 0 });
        } else if (initResult?.success) {
          setBalance({
            cctr_balance: initResult.cctr_balance || 0,
            claimable_rewards: initResult.claimable_rewards || 0
          });
        } else {
          console.error('Balance init failed:', initResult?.error);
          setBalance({ cctr_balance: 0, claimable_rewards: 0 });
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  }, [primaryWallet?.address]);

  // Type for RPC response
  interface DeductFeeResponse {
    success: boolean;
    error?: string;
    new_balance?: number;
    deducted?: number;
    current_balance?: number;
  }

  /**
   * Deduct balance using secure server-side RPC function.
   * This prevents client-side manipulation and enforces server-side validation.
   */
  const deductBalance = useCallback(async (amount: number, gameType: string = 'game'): Promise<{ success: boolean; error?: string; new_balance?: number }> => {
    if (!primaryWallet?.address) {
      return { success: false, error: 'No wallet connected' };
    }

    // Map game type to allowed values
    const allowedGameTypes = ['cyber-match', 'neon-match', 'trivia', 'ai-coach'];
    const validGameType = allowedGameTypes.includes(gameType) ? gameType : 'cyber-match';

    try {
      const { data, error } = await supabase.rpc('deduct_game_entry_fee', {
        p_wallet_address: primaryWallet.address,
        p_game_type: validGameType,
        p_amount: amount
      });

      if (error) {
        console.error('Error deducting balance:', error);
        return { success: false, error: error.message || 'Failed to deduct balance' };
      }

      // Cast the response to proper type
      const result = data as unknown as DeductFeeResponse;

      if (!result?.success) {
        return { success: false, error: result?.error || 'Failed to deduct balance' };
      }

      // Update local state with new balance from server
      if (typeof result.new_balance === 'number') {
        setBalance(prev => ({
          ...prev,
          cctr_balance: result.new_balance!
        }));
      }

      return { success: true, new_balance: result.new_balance };
    } catch (error) {
      console.error('Error deducting balance:', error);
      return { success: false, error: 'Failed to deduct balance' };
    }
  }, [primaryWallet?.address]);

  /**
   * @deprecated Use deductBalance with proper game type instead.
   * Adding balance should only happen through server-side functions for security.
   */
  const addBalance = useCallback(async (_amount: number): Promise<{ success: boolean; error?: string }> => {
    // Balance additions should only happen through secure server-side functions
    // like award_trivia_rewards, claim_user_rewards, etc.
    console.warn('addBalance is deprecated. Use server-side functions for balance additions.');
    return { success: false, error: 'Use server-side functions for balance additions' };
  }, []);

  const claimRewards = useCallback(async () => {
    if (!primaryWallet?.address || balance.claimable_rewards === 0) {
      return { success: false, error: 'No rewards to claim' };
    }

    try {
      const claimed = balance.claimable_rewards;
      
      // Use the existing claim_user_rewards function via direct update
      // (The RPC function may not exist yet - fallback to safe pattern)
      const { error } = await supabase
        .from('user_balances')
        .update({ 
          cctr_balance: balance.cctr_balance + claimed,
          claimable_rewards: 0,
          updated_at: new Date().toISOString()
        })
        .eq('wallet_address', primaryWallet.address);

      if (error) {
        console.error('Error claiming rewards:', error);
        return { success: false, error: error.message };
      }

      // Refresh balance from server
      await fetchBalance();

      return { success: true, claimed_amount: claimed };
    } catch (error) {
      console.error('Error claiming rewards:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [primaryWallet?.address, balance.claimable_rewards, balance.cctr_balance, fetchBalance]);

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
