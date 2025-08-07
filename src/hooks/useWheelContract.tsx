
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';

export const useWheelContract = () => {
  const { toast } = useToast();
  const { getConnectedWallet } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const spinWheel = async (cctrAmount: number, gameType: string) => {
    const connectedWallet = getConnectedWallet();
    
    if (!connectedWallet || connectedWallet.type !== 'phantom') {
      toast({
        title: "Wallet Required",
        description: "Please connect your Phantom wallet to claim rewards",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsProcessing(true);

    try {
      console.log('Processing reward on Solana:', { 
        playerPubkey: connectedWallet.address, 
        cctrAmount,
        gameType
      });

      // Call the Supabase Edge Function for rewards
      const { data, error } = await supabase.functions.invoke('submit-score', {
        body: {
          playerPubkey: connectedWallet.address,
          score: cctrAmount,
          gameType: gameType,
          metadata: {
            gameType: gameType,
            rewardTimestamp: Date.now()
          }
        }
      });

      if (error) {
        console.error('Reward processing error:', error);
        throw new Error(error.message);
      }

      if (data?.success) {
        console.log('Reward processed successfully:', data);
        
        toast({
          title: "🎊 Reward Claimed!",
          description: `${cctrAmount} CCTR tokens sent to your wallet! TX: ${data.txHash.slice(0, 8)}...`,
          duration: 8000,
        });

        return { 
          success: true, 
          txHash: data.txHash, 
          tokensEarned: data.tokensEarned,
          gameType
        };
      } else {
        throw new Error(data?.error || 'Reward processing failed');
      }

    } catch (error) {
      console.error('Error processing reward:', error);
      
      toast({
        title: "Reward Failed",
        description: error instanceof Error ? error.message : "Failed to process reward on blockchain",
        variant: "destructive",
      });

      return { success: false };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    spinWheel,
    isProcessing
  };
};
