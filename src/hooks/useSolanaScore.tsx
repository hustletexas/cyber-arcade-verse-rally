
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';

export const useSolanaScore = () => {
  const { toast } = useToast();
  const { getConnectedWallet } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitScore = async (score: number, gameType: string = 'trivia') => {
    const connectedWallet = getConnectedWallet();
    
    if (!connectedWallet || connectedWallet.type !== 'phantom') {
      toast({
        title: "Wallet Required",
        description: "Please connect your Phantom wallet to submit scores",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting score to Solana:', { 
        playerPubkey: connectedWallet.address, 
        score, 
        gameType 
      });

      // Call the Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('submit-score', {
        body: {
          playerPubkey: connectedWallet.address,
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
          description: `Earned ${data.tokensEarned} CCTR tokens! TX: ${data.txHash.slice(0, 8)}...`,
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
