import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from './useMultiWallet';

interface CyberDropState {
  isPlaying: boolean;
  hasPlayedToday: boolean;
  balance: number;
  lastResult: { playId: string; slotIndex: number; rewardAmount: number } | null;
  isLoading: boolean;
  nextResetTime: Date | null;
}

const getChicagoMidnight = (): Date => {
  // Get current time in Chicago
  const now = new Date();
  const chicagoStr = now.toLocaleString('en-US', { timeZone: 'America/Chicago' });
  const chicagoNow = new Date(chicagoStr);

  // Next midnight Chicago time
  const nextMidnight = new Date(chicagoNow);
  nextMidnight.setDate(nextMidnight.getDate() + 1);
  nextMidnight.setHours(0, 0, 0, 0);

  // Convert back to UTC by calculating offset
  const diff = nextMidnight.getTime() - chicagoNow.getTime();
  return new Date(now.getTime() + diff);
};

export const useCyberDrop = () => {
  const { primaryWallet } = useMultiWallet();
  const walletAddress = primaryWallet?.address;

  const [state, setState] = useState<CyberDropState>({
    isPlaying: false,
    hasPlayedToday: false,
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
      // Get today's date in Chicago timezone
      const chicagoDate = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });

      const [playsRes, balanceRes] = await Promise.all([
        supabase
          .from('cyberdrop_plays')
          .select('id')
          .eq('user_id', walletAddress)
          .eq('played_on_date', chicagoDate)
          .limit(1),
        supabase
          .from('user_points')
          .select('balance')
          .eq('user_id', walletAddress)
          .maybeSingle(),
      ]);

      const hasPlayed = (playsRes.data?.length ?? 0) > 0;

      setState(prev => ({
        ...prev,
        hasPlayedToday: hasPlayed,
        balance: balanceRes.data?.balance ?? 0,
        isLoading: false,
        nextResetTime: hasPlayed ? getChicagoMidnight() : null,
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
    if (!walletAddress || state.hasPlayedToday || state.isPlaying) return null;

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
            hasPlayedToday: true,
            nextResetTime: getChicagoMidnight(),
          }));
        } else {
          setState(prev => ({ ...prev, isPlaying: false }));
        }
        return null;
      }

      setState(prev => ({
        ...prev,
        isPlaying: false,
        hasPlayedToday: true,
        balance: result.updatedBalance,
        lastResult: {
          playId: result.playId,
          slotIndex: result.slotIndex,
          rewardAmount: result.rewardAmount,
        },
        nextResetTime: getChicagoMidnight(),
      }));

      return { slotIndex: result.slotIndex, rewardAmount: result.rewardAmount };
    } catch (err) {
      console.error('[CyberDrop] Play failed:', err);
      setState(prev => ({ ...prev, isPlaying: false }));
      return null;
    }
  }, [walletAddress, state.hasPlayedToday, state.isPlaying]);

  return { ...state, play, refetch: checkStatus };
};
