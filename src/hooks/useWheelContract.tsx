
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useWallet } from '@/hooks/useWallet';

export const useWheelContract = () => {
  const { toast } = useToast();
  const { getConnectedWallet } = useWallet();
  const [isProcessing, setIsProcessing] = useState(false);

  const spinWheel = async (cctrAmount: number, prizeType: string) => {
    const connectedWallet = getConnectedWallet();
    
    if (!connectedWallet || connectedWallet.type !== 'phantom') {
      toast({
        title: "Wallet Required",
        description: "Please connect your Phantom wallet to spin the wheel",
        variant: "destructive",
      });
      return { success: false };
    }

    setIsProcessing(true);

    try {
      console.log('Processing wheel spin on Solana:', { 
        playerPubkey: connectedWallet.address, 
        cctrAmount,
        prizeType
      });

      // Call the Supabase Edge Function for wheel game
      const { data, error } = await supabase.functions.invoke('submit-score', {
        body: {
          playerPubkey: connectedWallet.address,
          score: cctrAmount,
          gameType: 'wheel-of-gaming',
          metadata: {
            prizeType,
            spinTimestamp: Date.now()
          }
        }
      });

      if (error) {
        console.error('Wheel contract error:', error);
        throw new Error(error.message);
      }

      if (data?.success) {
        console.log('Wheel spin processed successfully:', data);
        
        toast({
          title: "🎊 Prize Awarded!",
          description: `You won ${cctrAmount} CCTR tokens! TX: ${data.txHash.slice(0, 8)}...`,
          duration: 5000,
        });

        return { 
          success: true, 
          txHash: data.txHash, 
          tokensEarned: data.tokensEarned,
          prizeType
        };
      } else {
        throw new Error(data?.error || 'Wheel spin failed');
      }

    } catch (error) {
      console.error('Error processing wheel spin:', error);
      
      toast({
        title: "Spin Failed",
        description: error instanceof Error ? error.message : "Failed to process wheel spin on blockchain",
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
