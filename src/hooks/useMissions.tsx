import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';

export type MissionTier = 'player' | 'creator' | 'ambassador';
export type MissionStatus = 'not_started' | 'in_progress' | 'complete';

export interface Mission {
  id: string;
  title: string;
  description: string;
  icon: string;
  tier: MissionTier;
  link?: string;
  status: MissionStatus;
}

export interface CreatorSubmission {
  platform: string;
  url: string;
  screenshotUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
}

const STORAGE_KEY = 'cyberCity_missions';

const PLAYER_MISSIONS: Omit<Mission, 'status'>[] = [
  { id: 'p1', title: 'Create Account', description: 'Sign up with your email via Magic Link', icon: '👤', tier: 'player', link: '/profile' },
  { id: 'p2', title: 'Connect Wallet', description: 'Link a Stellar wallet to your profile', icon: '💳', tier: 'player', link: '/wallet' },
  { id: 'p3', title: 'Play 3 Games', description: 'Try out any 3 arcade games', icon: '🎮', tier: 'player', link: '/' },
  { id: 'p4', title: 'Join a Tournament', description: 'Register for your first tournament', icon: '🏆', tier: 'player', link: '/tournaments' },
  { id: 'p5', title: 'Customize Profile', description: 'Update your username or avatar', icon: '✨', tier: 'player', link: '/profile' },
];

const CREATOR_MISSIONS: Omit<Mission, 'status'>[] = [
  { id: 'c1', title: 'Record Gameplay', description: 'Capture 30+ seconds of gameplay footage', icon: '📹', tier: 'creator' },
  { id: 'c2', title: 'Post on Social', description: 'Share your content on any social platform', icon: '📱', tier: 'creator' },
  { id: 'c3', title: 'Tag @CyberCityArcade', description: 'Mention us in your post', icon: '🏷️', tier: 'creator' },
  { id: 'c4', title: 'Use #CyberCityArcade', description: 'Include our hashtag', icon: '#️⃣', tier: 'creator' },
  { id: 'c5', title: 'Submit Content Link', description: 'Upload your content link for review', icon: '🔗', tier: 'creator' },
  { id: 'c6', title: 'Join 2 Tournaments', description: 'Participate in two competitive events', icon: '⚔️', tier: 'creator', link: '/tournaments' },
];

const AMBASSADOR_MISSIONS: Omit<Mission, 'status'>[] = [
  { id: 'a1', title: '3 Approved Posts', description: 'Get three creator submissions approved', icon: '✅', tier: 'ambassador' },
  { id: 'a2', title: '5 Verified Referrals', description: 'Refer five new players who sign up', icon: '👥', tier: 'ambassador' },
  { id: 'a3', title: '5 Tournament Entries', description: 'Participate in five tournaments', icon: '🏅', tier: 'ambassador', link: '/tournaments' },
  { id: 'a4', title: 'Weekly Activity', description: 'Maintain consistent weekly engagement', icon: '📊', tier: 'ambassador' },
  { id: 'a5', title: 'Positive Community', description: 'Demonstrate positive community behavior', icon: '💎', tier: 'ambassador' },
];

export const useMissions = () => {
  const { user } = useAuth();
  const { isWalletConnected, primaryWallet } = useMultiWallet();

  const userId = user?.id || primaryWallet?.address || 'guest';

  // Load completed missions from localStorage
  const [completedMissions, setCompletedMissions] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [claimedRewards, setClaimedRewards] = useState<MissionTier[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_claimed_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [creatorSubmissions, setCreatorSubmissions] = useState<CreatorSubmission[]>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_creator_${userId}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [ambassadorStatus, setAmbassadorStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_ambassador_${userId}`);
      return (stored as any) || 'none';
    } catch { return 'none'; }
  });

  // Re-derive missions based on user state  
  useEffect(() => {
    // Auto-complete missions based on real state
    const autoComplete: string[] = [];
    if (user) autoComplete.push('p1'); // has account
    if (isWalletConnected) autoComplete.push('p2'); // wallet connected

    if (autoComplete.length > 0) {
      setCompletedMissions(prev => {
        const merged = [...new Set([...prev, ...autoComplete])];
        localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(merged));
        return merged;
      });
    }
  }, [user, isWalletConnected, userId]);

  // Save state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(completedMissions));
  }, [completedMissions, userId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_claimed_${userId}`, JSON.stringify(claimedRewards));
  }, [claimedRewards, userId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_creator_${userId}`, JSON.stringify(creatorSubmissions));
  }, [creatorSubmissions, userId]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_ambassador_${userId}`, JSON.stringify(ambassadorStatus));
  }, [ambassadorStatus, userId]);

  const getMissionStatus = (id: string): MissionStatus => {
    if (completedMissions.includes(id)) return 'complete';
    return 'not_started';
  };

  const buildMissions = (defs: Omit<Mission, 'status'>[]): Mission[] =>
    defs.map(m => ({ ...m, status: getMissionStatus(m.id) }));

  const playerMissions = buildMissions(PLAYER_MISSIONS);
  const creatorMissions = buildMissions(CREATOR_MISSIONS);
  const ambassadorMissions = buildMissions(AMBASSADOR_MISSIONS);

  const playerComplete = playerMissions.every(m => m.status === 'complete');
  const creatorComplete = creatorMissions.every(m => m.status === 'complete');
  const ambassadorComplete = ambassadorMissions.every(m => m.status === 'complete');

  const completeMission = (id: string) => {
    setCompletedMissions(prev => [...new Set([...prev, id])]);
  };

  const claimReward = async (tier: MissionTier) => {
    if (claimedRewards.includes(tier)) return false;
    
    // Record claim via edge function if available
    if (user?.id || primaryWallet?.address) {
      try {
        await supabase.functions.invoke('claim-reward', {
          body: {
            source_type: 'mission',
            source_id: `mission_${tier}`,
            wallet_address: primaryWallet?.address || '',
            claim_reason: `${tier} tier mission completion`,
          },
        });
      } catch (e) {
        console.log('Claim recorded locally, server sync pending');
      }
    }

    setClaimedRewards(prev => [...prev, tier]);
    return true;
  };

  const submitCreatorContent = (submission: Omit<CreatorSubmission, 'status' | 'submittedAt'>) => {
    const newSub: CreatorSubmission = {
      ...submission,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    setCreatorSubmissions(prev => [...prev, newSub]);
  };

  const applyForAmbassador = () => {
    setAmbassadorStatus('pending');
  };

  const totalMissions = PLAYER_MISSIONS.length + CREATOR_MISSIONS.length + AMBASSADOR_MISSIONS.length;
  const totalComplete = completedMissions.length;
  const overallProgress = Math.round((totalComplete / totalMissions) * 100);

  return {
    playerMissions,
    creatorMissions,
    ambassadorMissions,
    playerComplete,
    creatorComplete,
    ambassadorComplete,
    completedMissions,
    claimedRewards,
    completeMission,
    claimReward,
    creatorSubmissions,
    submitCreatorContent,
    ambassadorStatus,
    applyForAmbassador,
    overallProgress,
    tier: user ? (isWalletConnected ? 'wallet' : 'magic_link') : 'guest',
  };
};
