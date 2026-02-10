import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from './useMultiWallet';

interface SeasonPassState {
  hasPass: boolean;
  isLoading: boolean;
  rewardMultiplier: number; // 1.0 for pass holders, 0.25 for non-holders
}

export const useSeasonPass = () => {
  const { primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;

  const [state, setState] = useState<SeasonPassState>({
    hasPass: false,
    isLoading: true,
    rewardMultiplier: 0.25,
  });

  const checkPass = useCallback(async () => {
    if (!walletAddress) {
      setState({ hasPass: false, isLoading: false, rewardMultiplier: 0.25 });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('nft_mints')
        .select('id')
        .eq('wallet_address', walletAddress)
        .eq('status', 'completed')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[SeasonPass] Check failed:', error);
        setState({ hasPass: false, isLoading: false, rewardMultiplier: 0.25 });
        return;
      }

      const hasPass = !!data;
      setState({
        hasPass,
        isLoading: false,
        rewardMultiplier: hasPass ? 1.0 : 0.25,
      });
    } catch (err) {
      console.error('[SeasonPass] Error:', err);
      setState({ hasPass: false, isLoading: false, rewardMultiplier: 0.25 });
    }
  }, [walletAddress]);

  useEffect(() => {
    checkPass();
  }, [checkPass]);

  const applyMultiplier = useCallback((amount: number): number => {
    return Math.floor(amount * state.rewardMultiplier);
  }, [state.rewardMultiplier]);

  return { ...state, refetchPass: checkPass, applyMultiplier };
};
