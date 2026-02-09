import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from './useMultiWallet';

interface CyberDropState {
  isPlaying: boolean;
  playsRemaining: number;
  balance: number;
  lastResult: { playId: string; slotIndex: number; rewardAmount: number } | null;
  isLoading: boolean;
  nextResetTime: Date | null;
}

const MAX_DAILY_PLAYS = 3;

const getChicagoMidnight = (): Date => {
  const now = new Date();
  const chicagoStr = now.toLocaleString('en-US', { timeZone: 'America/Chicago' });
  const chicagoNow = new Date(chicagoStr);
  const nextMidnight = new Date(chicagoNow);
  nextMidnight.setDate(nextMidnight.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);
  const diff = nextMidnight.getTime() - chicagoNow.getTime();
  return new Date(now.getTime() + diff);
};

export const useCyberDrop = () => {
  const { primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;

  const [state, setState] = useState<CyberDropState>({
    isPlaying: false,
    playsRemaining: MAX_DAILY_PLAYS,
    balance: 0,
    lastResult: null,
    isLoading: true,
    nextResetTime: null,
  });

  const checkStatus = useCallback(async () => {
    if (!walletAddress) {
      setState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const chicagoDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });

      const [playsRes, balanceRes] = await Promise.all([
        supabase
          .from('cyberdrop_plays')
          .select('id')
          .eq('user_id', walletAddress)
          .eq('played_on_date', chicagoDate),
        supabase
          .from('user_points')
          .select('balance')
          .eq('user_id', walletAddress)
          .maybeSingle(),
      ]);

      const playsToday = playsRes.data?.length ?? 0;
      const remaining = Math.max(0, MAX_DAILY_PLAYS - playsToday);

      setState(prev => ({
        ...prev,
        playsRemaining: remaining,
        balance: balanceRes.data?.balance ?? 0,
        isLoading: false,
        nextResetTime: remaining === 0 ? getChicagoMidnight() : null,
      }));
    } catch (err) {
      console.error('[CyberDrop] Status check failed:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [walletAddress]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const play = useCallback(async (): Promise<{ slotIndex: number; rewardAmount: number } | null> => {
    if (!walletAddress || state.playsRemaining <= 0 || state.isPlaying) return null;

    setState(prev => ({ ...prev, isPlaying: true }));

    try {
      const { data, error } = await supabase.rpc('play_cyberdrop', {
        p_wallet_address: walletAddress,
      });

      if (error) throw error;

      const result = data as any;

      if (!result.success) {
        if (result.error === 'DAILY_LIMIT_REACHED') {
          setState(prev => ({
            ...prev,
            isPlaying: false,
            playsRemaining: 0,
            nextResetTime: getChicagoMidnight(),
          }));
        } else {
          setState(prev => ({ ...prev, isPlaying: false }));
        }
        return null;
      }

      const remaining = result.playsRemaining ?? Math.max(0, state.playsRemaining - 1);

      setState(prev => ({
        ...prev,
        isPlaying: false,
        playsRemaining: remaining,
        balance: result.updatedBalance,
        lastResult: {
          playId: result.playId,
          slotIndex: result.slotIndex,
          rewardAmount: result.rewardAmount,
        },
        nextResetTime: remaining === 0 ? getChicagoMidnight() : null,
      }));

      return { slotIndex: result.slotIndex, rewardAmount: result.rewardAmount };
    } catch (err) {
      console.error('[CyberDrop] Play failed:', err);
      setState(prev => ({ ...prev, isPlaying: false }));
      return null;
    }
  }, [walletAddress, state.playsRemaining, state.isPlaying]);

  return { ...state, play, refetch: checkStatus, maxPlays: MAX_DAILY_PLAYS };
};
