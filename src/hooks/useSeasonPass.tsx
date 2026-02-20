import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from './useMultiWallet';

export type PassTier = 'none' | 'common' | 'rare' | 'epic' | 'legendary';

interface SeasonPassState {
  hasPass: boolean;
  isLoading: boolean;
  rewardMultiplier: number;
  tier: PassTier;
}

const TIER_MULTIPLIERS: Record<PassTier, number> = {
  none: 0.25,
  common: 0.5,
  rare: 0.75,
  epic: 1.0,
  legendary: 1.5,
};

export const TIER_CONFIG: Record<Exclude<PassTier, 'none'>, { label: string; color: string; bgColor: string; borderColor: string; emoji: string }> = {
  common: { label: 'Common', color: 'text-gray-400', bgColor: 'bg-gray-400/10', borderColor: 'border-gray-400/60', emoji: '🎮' },
  rare: { label: 'Rare', color: 'text-blue-400', bgColor: 'bg-blue-400/10', borderColor: 'border-blue-400/60', emoji: '💎' },
  epic: { label: 'Epic', color: 'text-purple-400', bgColor: 'bg-purple-400/10', borderColor: 'border-purple-400/60', emoji: '🔥' },
  legendary: { label: 'Legendary', color: 'text-amber-400', bgColor: 'bg-amber-400/10', borderColor: 'border-amber-400/60', emoji: '👑' },
};

export const useSeasonPass = () => {
  const { primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;

  const [state, setState] = useState<SeasonPassState>({
    hasPass: false,
    isLoading: true,
    rewardMultiplier: 0.25,
    tier: 'none',
  });

  const checkPass = useCallback(async () => {
    if (!walletAddress) {
      setState({ hasPass: false, isLoading: false, rewardMultiplier: 0.25, tier: 'none' });
      return;
    }

    try {
      // Get all completed passes for this wallet, pick the highest tier
      const { data, error } = await supabase
        .from('nft_mints')
        .select('id, metadata')
        .eq('wallet_address', walletAddress)
        .eq('status', 'completed');

      if (error) {
        console.error('[SeasonPass] Check failed:', error);
        setState({ hasPass: false, isLoading: false, rewardMultiplier: 0.25, tier: 'none' });
        return;
      }

      if (!data || data.length === 0) {
        setState({ hasPass: false, isLoading: false, rewardMultiplier: 0.25, tier: 'none' });
        return;
      }

      // Determine highest tier
      const tierOrder: PassTier[] = ['common', 'rare', 'epic', 'legendary'];
      let highestTier: PassTier = 'common'; // default if pass exists but no tier in metadata

      for (const mint of data) {
        const meta = mint.metadata as Record<string, any> | null;
        const mintTier = (meta?.tier as PassTier) || 'common';
        if (tierOrder.indexOf(mintTier) > tierOrder.indexOf(highestTier)) {
          highestTier = mintTier;
        }
      }

      setState({
        hasPass: true,
        isLoading: false,
        rewardMultiplier: TIER_MULTIPLIERS[highestTier],
        tier: highestTier,
      });
    } catch (err) {
      console.error('[SeasonPass] Error:', err);
      setState({ hasPass: false, isLoading: false, rewardMultiplier: 0.25, tier: 'none' });
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
