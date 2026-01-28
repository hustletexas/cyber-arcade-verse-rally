import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';

export interface ChestEligibility {
  id: string;
  wallet_address: string;
  source_type: string;
  source_id: string;
  earned_at: string;
  is_claimed: boolean;
}

export const useWinnerChests = () => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const [eligibleChests, setEligibleChests] = useState<ChestEligibility[]>([]);
  const [claimedChests, setClaimedChests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const walletAddress = primaryWallet?.address;

  // Fetch eligible chests for the connected wallet
  const fetchEligibility = useCallback(async () => {
    if (!walletAddress) {
      setEligibleChests([]);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch unclaimed eligibility
      const { data: eligibility, error } = await supabase
        .from('winner_chest_eligibility')
        .select('*')
        .eq('wallet_address', walletAddress)
        .eq('is_claimed', false);

      if (error) throw error;
      
      // Type assertion for the data
      setEligibleChests((eligibility as ChestEligibility[]) || []);

      // Fetch claimed chests
      const { data: claims } = await supabase
        .from('winner_chest_claims')
        .select('source_id')
        .eq('wallet_address', walletAddress);

      setClaimedChests((claims || []).map(c => (c as { source_id: string }).source_id));
    } catch (error) {
      console.error('Error fetching chest eligibility:', error);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    fetchEligibility();
  }, [fetchEligibility]);

  // Grant chest eligibility when winning a game or tournament
  const grantChestEligibility = async (sourceType: 'game' | 'tournament', sourceId: string) => {
    if (!walletAddress) return false;

    try {
      const { error } = await supabase
        .from('winner_chest_eligibility')
        .upsert({
          wallet_address: walletAddress,
          source_type: sourceType,
          source_id: sourceId,
          is_claimed: false,
        }, {
          onConflict: 'wallet_address,source_type,source_id'
        });

      if (error) throw error;
      
      await fetchEligibility();
      return true;
    } catch (error) {
      console.error('Error granting chest eligibility:', error);
      return false;
    }
  };

  // Claim a free chest
  const claimChest = async (eligibilityId: string, rewardType: string, rewardValue: string) => {
    if (!walletAddress) return false;

    try {
      // Find the eligibility record
      const eligibility = eligibleChests.find(e => e.id === eligibilityId);
      if (!eligibility) return false;

      // Mark as claimed in eligibility table
      const { error: updateError } = await supabase
        .from('winner_chest_eligibility')
        .update({ is_claimed: true })
        .eq('id', eligibilityId);

      if (updateError) throw updateError;

      // Record the claim
      const { error: claimError } = await supabase
        .from('winner_chest_claims')
        .insert({
          wallet_address: walletAddress,
          source_type: eligibility.source_type,
          source_id: eligibility.source_id,
          reward_type: rewardType,
          reward_value: rewardValue,
        });

      if (claimError) throw claimError;

      await fetchEligibility();
      return true;
    } catch (error) {
      console.error('Error claiming chest:', error);
      return false;
    }
  };

  // Check if wallet has any unclaimed chests
  const hasUnclaimedChests = eligibleChests.length > 0;

  // Get count of unclaimed chests
  const unclaimedCount = eligibleChests.length;

  return {
    eligibleChests,
    claimedChests,
    isLoading,
    hasUnclaimedChests,
    unclaimedCount,
    grantChestEligibility,
    claimChest,
    fetchEligibility,
  };
};
