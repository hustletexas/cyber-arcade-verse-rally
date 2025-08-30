
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMultiWallet } from '@/hooks/useMultiWallet';

export const useSolanaScore = () => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitScore = async (score: number, gameType: string = 'trivia') => {
    // Ensure a connected Solana wallet (exclude Coinbase)
    const supportedTypes = ['phantom', 'solflare', 'backpack', 'created'] as const;

    if (!isWalletConnected || !primaryWallet || !supportedTypes.includes(primaryWallet.type as any)) {
      toast({
        title: "Solana Wallet Required",
        description: "Connect a Solana wallet (Phantom, Solflare, Backpack, or Created) to continue",
        variant: "destructive",
      });
      return { success: false };
    }

    const playerPubkey = primaryWallet.address;
    setIsSubmitting(true);

    try {
      console.log('Submitting score to Solana via Edge Function:', { 
        playerPubkey, 
        score, 
        gameType,
        walletType: primaryWallet.type
      });

      const { data, error } = await supabase.functions.invoke('submit-score', {
        body: {
          playerPubkey,
          score,
          gameType
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (data?.success) {
        console.log('Score submitted successfully:', data);
        
        toast({
          title: "Score Submitted! 🎉",
          description: `Earned ${data.tokensEarned} CCTR tokens! TX: ${String(data.txHash).slice(0, 8)}...`,
        });

        return { 
          success: true, 
          txHash: data.txHash, 
          tokensEarned: data.tokensEarned 
        };
      } else {
        throw new Error(data?.error || 'Unknown error occurred');
      }

    } catch (error) {
      console.error('Error submitting score:', error);
      
      toast({
        title: "Submission Failed",
        description: error instanceof Error ? error.message : "Failed to submit score to blockchain",
        variant: "destructive",
      });

      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitScore,
    isSubmitting
  };
};
