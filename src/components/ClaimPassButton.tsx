import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useSeasonPass } from '@/hooks/useSeasonPass';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const MAX_COMMON_PASSES = 100;

export const ClaimPassButton: React.FC = () => {
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { hasPass, refetchPass } = useSeasonPass();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);
  const [claimedCount, setClaimedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchClaimedCount = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('nft_mints')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .contains('metadata', { tier: 'common' });

      if (!error) {
        setClaimedCount(count ?? 0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaimedCount();
  }, [fetchClaimedCount]);

  const isSoldOut = claimedCount !== null && claimedCount >= MAX_COMMON_PASSES;

  const handleClaim = async () => {
    if (!isWalletConnected || !primaryWallet) {
      toast({ title: '🔗 Wallet Required', description: 'Please connect your Stellar wallet first.' });
      return;
    }

    if (hasPass) {
      toast({ title: '🎮 Already Claimed', description: 'You already have a Season Pass!' });
      return;
    }

    if (isSoldOut) {
      toast({ title: 'Sold Out', description: 'All 100 Common passes have been claimed.', variant: 'destructive' });
      return;
    }

    setClaiming(true);
    try {
      // Check if this wallet already claimed
      const { data: existing } = await supabase
        .from('nft_mints')
        .select('id')
        .eq('wallet_address', primaryWallet.address)
        .eq('status', 'completed')
        .maybeSingle();

      if (existing) {
        toast({ title: '🎮 Already Claimed', description: 'This wallet already has a Season Pass.' });
        setClaiming(false);
        return;
      }

      const txHash = `COMMON_PASS_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

      const { error: dbError } = await supabase
        .from('nft_mints')
        .insert({
          user_id: primaryWallet.address,
          wallet_address: primaryWallet.address,
          nft_name: 'Cyber City Common Season Pass',
          mint_address: `COMMON_PASS_${Date.now()}`,
          transaction_hash: txHash,
          status: 'completed',
          metadata: {
            type: 'season_pass',
            tier: 'common',
            price_usd: 0,
            claimed_at: new Date().toISOString(),
            network: 'stellar_testnet',
          },
        });

      if (dbError) {
        console.error('[ClaimPass] DB error:', dbError);
        toast({ title: '❌ Claim Failed', description: 'Could not record your pass. Please try again.', variant: 'destructive' });
        setClaiming(false);
        return;
      }

      toast({ title: '🎉 Common Pass Claimed!', description: 'You now have access to Season Pass benefits!' });
      await refetchPass();
      await fetchClaimedCount();
    } catch (err) {
      console.error('[ClaimPass] Error:', err);
      toast({ title: '❌ Error', description: 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setClaiming(false);
    }
  };

  const getLabel = () => {
    if (loading) return '...';
    if (hasPass) return '✅ PASS CLAIMED';
    if (!isWalletConnected) return '🔗 CONNECT TO CLAIM';
    if (isSoldOut) return '❌ SOLD OUT';
    if (claiming) return 'CLAIMING...';
    return '🎮 CLAIM PASS';
  };

  const isDisabled = loading || hasPass || isSoldOut || claiming;

  return (
    <button
      onClick={handleClaim}
      disabled={isDisabled && isWalletConnected}
      className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-bold border backdrop-blur-md transition-all duration-300 ${
        hasPass
          ? 'border-green-400/60 bg-green-400/10 text-green-400 cursor-default'
          : isSoldOut
          ? 'border-red-400/60 bg-red-400/10 text-red-400 cursor-not-allowed'
          : 'border-neon-cyan/60 bg-black/60 text-neon-cyan hover:bg-neon-cyan/20 hover:shadow-[0_0_20px_rgba(0,255,204,0.4)]'
      }`}
    >
      {claiming ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin" /> CLAIMING...
        </span>
      ) : (
        <span className="flex flex-col items-center">
          <span>{getLabel()}</span>
          {!loading && !hasPass && !isSoldOut && claimedCount !== null && (
            <span className="text-[10px] opacity-70">{claimedCount}/{MAX_COMMON_PASSES} claimed</span>
          )}
        </span>
      )}
    </button>
  );
};
