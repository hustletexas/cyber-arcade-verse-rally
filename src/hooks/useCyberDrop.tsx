import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from './useMultiWallet';

interface CyberDropState {
  isPlaying: boolean;
  freePlayUsed: boolean;
  balance: number;
  lastResult: { playId: string; slotIndex: number; rewardAmount: number; isPaid: boolean } | null;
  isLoading: boolean;
  nextResetTime: Date | null;
}

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
    freePlayUsed: false,
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
          .select('id, is_paid')
          .eq('user_id', walletAddress)
          .eq('played_on_date', chicagoDate)
          .eq('is_paid', false),
        supabase
          .from('user_points')
          .select('balance')
          .eq('user_id', walletAddress)
          .maybeSingle(),
      ]);

      const freePlaysToday = playsRes.data?.length ?? 0;

      setState(prev => ({
        ...prev,
        freePlayUsed: freePlaysToday >= 1,
        balance: balanceRes.data?.balance ?? 0,
        isLoading: false,
        nextResetTime: freePlaysToday >= 1 ? getChicagoMidnight() : null,
      }));
    } catch (err) {
      console.error('[CyberDrop] Status check failed:', err);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [walletAddress]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const play = useCallback(async (isPaid: boolean): Promise<{ slotIndex: number; rewardAmount: number; isPaid: boolean } | null> => {
    if (!walletAddress || state.isPlaying) return null;

    setState(prev => ({ ...prev, isPlaying: true }));

    try {
      const { data, error } = await supabase.rpc('play_cyberdrop', {
        p_wallet_address: walletAddress,
        p_is_paid: isPaid,
      });

      if (error) throw error;

      const result = data as any;

      if (!result.success) {
        if (result.error === 'DAILY_LIMIT_REACHED') {
          setState(prev => ({
            ...prev,
            isPlaying: false,
            freePlayUsed: true,
            nextResetTime: getChicagoMidnight(),
          }));
        } else if (result.error === 'INSUFFICIENT_BALANCE') {
          setState(prev => ({ ...prev, isPlaying: false }));
        } else {
          setState(prev => ({ ...prev, isPlaying: false }));
        }
        return null;
      }

      setState(prev => ({
        ...prev,
        isPlaying: false,
        freePlayUsed: isPaid ? prev.freePlayUsed : true,
        balance: result.updatedBalance,
        lastResult: {
          playId: result.playId,
          slotIndex: result.slotIndex,
          rewardAmount: result.rewardAmount,
          isPaid: result.isPaid,
        },
        nextResetTime: prev.freePlayUsed || !isPaid ? getChicagoMidnight() : prev.nextResetTime,
      }));

      return { slotIndex: result.slotIndex, rewardAmount: result.rewardAmount, isPaid: result.isPaid };
    } catch (err) {
      console.error('[CyberDrop] Play failed:', err);
      setState(prev => ({ ...prev, isPlaying: false }));
      return null;
    }
  }, [walletAddress, state.freePlayUsed, state.isPlaying, state.balance]);

  return { ...state, play, refetch: checkStatus };
};
