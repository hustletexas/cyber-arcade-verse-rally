import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Auth tiers
export type AuthTier = 'guest' | 'magic_link' | 'wallet';

// What each tier unlocks
export type GatedFeature = 
  | 'ranked_play' 
  | 'tournaments' 
  | 'save_stats'
  | 'earn_credits'
  | 'claim_onchain'
  | 'nft_badges'
  | 'submit_score'
  | 'community_chat';

// Minimum tier required for each feature
const FEATURE_REQUIREMENTS: Record<GatedFeature, AuthTier> = {
  ranked_play: 'magic_link',
  tournaments: 'magic_link',
  save_stats: 'magic_link',
  earn_credits: 'magic_link',
  submit_score: 'magic_link',
  community_chat: 'magic_link',
  claim_onchain: 'wallet',
  nft_badges: 'wallet',
};

const TIER_RANK: Record<AuthTier, number> = {
  guest: 0,
  magic_link: 1,
  wallet: 2,
};

// Guest data stored in localStorage
const GUEST_STORAGE_KEY = 'cyberCity_guestData';

export interface GuestData {
  id: string; // random guest ID
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    theme: string;
  };
  tutorialCompleted: boolean;
  gameProgress: Record<string, {
    highScore: number;
    gamesPlayed: number;
    lastPlayed: string;
  }>;
  createdAt: string;
}

interface TieredAuthContextType {
  // Current state
  tier: AuthTier;
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  guestData: GuestData;
  walletAddress: string | null;
  
  // Auth actions
  signInWithMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  linkWallet: (address: string) => void;
  
  // Feature gating
  canAccess: (feature: GatedFeature) => boolean;
  getRequiredTier: (feature: GatedFeature) => AuthTier;
  requireUpgrade: (feature: GatedFeature) => boolean; // true if should show modal
  
  // Guest data management
  updateGuestProgress: (game: string, score: number) => void;
  updateGuestSettings: (settings: Partial<GuestData['settings']>) => void;
  markTutorialComplete: () => void;
}

const TieredAuthContext = createContext<TieredAuthContextType | undefined>(undefined);

export const useTieredAuth = () => {
  const ctx = useContext(TieredAuthContext);
  if (!ctx) throw new Error('useTieredAuth must be used within TieredAuthProvider');
  return ctx;
};

// Generate a random guest ID
const generateGuestId = () => 'guest_' + Math.random().toString(36).substring(2, 15);

// Load/create guest data
const loadGuestData = (): GuestData => {
  try {
    const stored = localStorage.getItem(GUEST_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  
  const data: GuestData = {
    id: generateGuestId(),
    settings: { soundEnabled: true, musicEnabled: true, theme: 'cyber' },
    tutorialCompleted: false,
    gameProgress: {},
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
  return data;
};

const saveGuestData = (data: GuestData) => {
  localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(data));
};

export const TieredAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [guestData, setGuestData] = useState<GuestData>(loadGuestData);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Derive the tier
  const tier: AuthTier = walletAddress && user ? 'wallet' : user ? 'magic_link' : 'guest';

  // Check admin role
  const checkAdminRole = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      setIsAdmin(!!data);
    } catch {
      setIsAdmin(false);
    }
  };

  // Listen for auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user?.id) {
        setTimeout(() => checkAdminRole(session.user.id), 0);
        // Check if user has a linked wallet
        supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.wallet_address) setWalletAddress(data.wallet_address);
          });
      } else {
        setIsAdmin(false);
        // Don't clear wallet if user just hasn't logged in with email
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user?.id) {
        checkAdminRole(session.user.id);
        supabase
          .from('profiles')
          .select('wallet_address')
          .eq('id', session.user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.wallet_address) setWalletAddress(data.wallet_address);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Also check wallet from useMultiWallet storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cyberCity_primaryWallet');
      if (stored) {
        const wallet = JSON.parse(stored);
        if (wallet?.address) setWalletAddress(wallet.address);
      }
    } catch {}
  }, []);

  // Magic link sign in
  const signInWithMagicLink = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unknown error' };
    }
  };

  // Sign out (goes back to guest)
  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setUser(null);
    setSession(null);
    // Keep wallet connection for optional re-link
  };

  // Link wallet to current user
  const linkWallet = useCallback(async (address: string) => {
    setWalletAddress(address);
    if (user) {
      // Merge: update profile with wallet address
      await supabase
        .from('profiles')
        .update({ wallet_address: address })
        .eq('id', user.id);
    }
  }, [user]);

  // Feature gating
  const canAccess = (feature: GatedFeature) => {
    const required = FEATURE_REQUIREMENTS[feature];
    return TIER_RANK[tier] >= TIER_RANK[required];
  };

  const getRequiredTier = (feature: GatedFeature) => FEATURE_REQUIREMENTS[feature];

  const requireUpgrade = (feature: GatedFeature) => !canAccess(feature);

  // Guest data management
  const updateGuestProgress = (game: string, score: number) => {
    setGuestData(prev => {
      const existing = prev.gameProgress[game] || { highScore: 0, gamesPlayed: 0, lastPlayed: '' };
      const updated = {
        ...prev,
        gameProgress: {
          ...prev.gameProgress,
          [game]: {
            highScore: Math.max(existing.highScore, score),
            gamesPlayed: existing.gamesPlayed + 1,
            lastPlayed: new Date().toISOString(),
          },
        },
      };
      saveGuestData(updated);
      return updated;
    });
  };

  const updateGuestSettings = (settings: Partial<GuestData['settings']>) => {
    setGuestData(prev => {
      const updated = { ...prev, settings: { ...prev.settings, ...settings } };
      saveGuestData(updated);
      return updated;
    });
  };

  const markTutorialComplete = () => {
    setGuestData(prev => {
      const updated = { ...prev, tutorialCompleted: true };
      saveGuestData(updated);
      return updated;
    });
  };

  const value: TieredAuthContextType = {
    tier,
    user,
    session,
    loading,
    isAdmin,
    guestData,
    walletAddress,
    signInWithMagicLink,
    signOut,
    linkWallet,
    canAccess,
    getRequiredTier,
    requireUpgrade,
    updateGuestProgress,
    updateGuestSettings,
    markTutorialComplete,
  };

  return (
    <TieredAuthContext.Provider value={value}>
      {children}
    </TieredAuthContext.Provider>
  );
};
