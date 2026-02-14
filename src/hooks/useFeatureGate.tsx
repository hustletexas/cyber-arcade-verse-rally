import { useState, useCallback } from 'react';
import { useTieredAuth, GatedFeature } from '@/contexts/AuthContext';

/**
 * Hook that provides feature gating with automatic upgrade modal trigger.
 * 
 * Usage:
 * ```tsx
 * const { gate, UpgradePrompt } = useFeatureGate();
 * 
 * const handleJoinTournament = () => {
 *   if (!gate('tournaments')) return; // shows modal if guest
 *   // ... proceed with tournament logic
 * };
 * 
 * return (
 *   <>
 *     <Button onClick={handleJoinTournament}>Join Tournament</Button>
 *     <UpgradePrompt />
 *   </>
 * );
 * ```
 */
export const useFeatureGate = () => {
  const { canAccess, getRequiredTier } = useTieredAuth();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [pendingFeature, setPendingFeature] = useState<GatedFeature | undefined>();

  /**
   * Returns true if the user can access the feature.
   * If not, opens the upgrade modal and returns false.
   */
  const gate = useCallback((feature: GatedFeature): boolean => {
    if (canAccess(feature)) return true;
    setPendingFeature(feature);
    setUpgradeOpen(true);
    return false;
  }, [canAccess]);

  return {
    gate,
    canAccess,
    upgradeOpen,
    setUpgradeOpen,
    pendingFeature,
  };
};
