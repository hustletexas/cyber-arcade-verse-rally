// Backward-compatible wrapper around the tiered auth system
// Components that import useAuth will continue to work
import React, { ReactNode, useContext, createContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useTieredAuth } from '@/contexts/AuthContext';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

// This hook now delegates to TieredAuthProvider
export const useAuth = (): AuthContextType => {
  const tiered = useTieredAuth();
  return {
    user: tiered.user,
    session: tiered.session,
    loading: tiered.loading,
    isAdmin: tiered.isAdmin,
    signOut: tiered.signOut,
  };
};

// Legacy AuthProvider kept for compatibility — now a pass-through
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  return <>{children}</>;
};
