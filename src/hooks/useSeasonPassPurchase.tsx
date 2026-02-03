import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { supabase } from '@/integrations/supabase/client';

export type PurchaseStatus = 'idle' | 'checkout' | 'processing' | 'delivering' | 'success' | 'error';

interface PurchaseResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

const SEASON_PASS_PRICE_USD = 29.99;

export const useSeasonPassPurchase = () => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const [status, setStatus] = useState<PurchaseStatus>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const checkPurchaseEligibility = async (): Promise<boolean> => {
    if (!primaryWallet) return false;

    try {
      const { data: existingPurchase, error } = await supabase
        .from('nft_mints')
        .select('*')
        .eq('wallet_address', primaryWallet.address)
        .maybeSingle();

      if (error) {
        console.error('Error checking purchase eligibility:', error);
        return false;
      }

      return !existingPurchase;
    } catch (error) {
      console.error('Eligibility check failed:', error);
      return false;
    }
  };

  const simulateStripeCheckout = async (): Promise<boolean> => {
    // Simulate Stripe checkout session creation and payment
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 95% success rate for testing
    return Math.random() > 0.05;
  };

  const simulateStellarDelivery = async (): Promise<{ txHash: string }> => {
    // Simulate NFT delivery on Stellar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate fake transaction hash
    const txHash = `TEST_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    return { txHash };
  };

  const purchaseSeasonPass = async (): Promise<PurchaseResult> => {
    if (!isWalletConnected || !primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Stellar wallet to purchase the Season Pass",
        variant: "destructive"
      });
      return { success: false, error: "Wallet not connected" };
    }

    try {
      // Check eligibility
      const isEligible = await checkPurchaseEligibility();
      if (!isEligible) {
        toast({
          title: "Already Purchased",
          description: "This wallet already has a Season Pass",
          variant: "destructive"
        });
        return { success: false, error: "Already purchased" };
      }

      // Step 1: Stripe Checkout
      setStatus('checkout');
      toast({
        title: "💳 Opening Checkout",
        description: `Season Pass: $${SEASON_PASS_PRICE_USD} USD`,
      });

      const paymentSuccess = await simulateStripeCheckout();
      
      if (!paymentSuccess) {
        setStatus('error');
        toast({
          title: "❌ Payment Failed",
          description: "Payment was declined. Please try again.",
          variant: "destructive"
        });
        return { success: false, error: "Payment failed" };
      }

      // Step 2: Processing payment confirmation
      setStatus('processing');
      toast({
        title: "✅ Payment Confirmed",
        description: "Processing your Season Pass...",
      });

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: Deliver NFT on Stellar
      setStatus('delivering');
      toast({
        title: "🚀 Delivering NFT",
        description: "Sending Season Pass to your Stellar wallet...",
      });

      const { txHash } = await simulateStellarDelivery();
      setTransactionHash(txHash);

      // Step 4: Record in database
      const walletUserId = primaryWallet.address;
      
      const { error: dbError } = await supabase
        .from('nft_mints')
        .insert({
          user_id: walletUserId,
          wallet_address: primaryWallet.address,
          nft_name: "Cyber City Arcade Season Pass",
          mint_address: `SEASON_PASS_${Date.now()}`,
          transaction_hash: txHash,
          status: 'completed',
          metadata: {
            type: 'season_pass',
            price_usd: SEASON_PASS_PRICE_USD,
            purchased_at: new Date().toISOString(),
            network: 'stellar_testnet'
          }
        });

      if (dbError) {
        console.error('Database error:', dbError);
        // Continue anyway - NFT was delivered
      }

      // Step 5: Success!
      setStatus('success');
      toast({
        title: "🎉 Season Pass Delivered!",
        description: "Your NFT has been sent to your Stellar wallet!",
      });

      return { success: true, transactionHash: txHash };

    } catch (error) {
      console.error('Purchase error:', error);
      setStatus('error');
      
      toast({
        title: "❌ Purchase Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });

      return { success: false, error: String(error) };
    }
  };

  const resetStatus = () => {
    setStatus('idle');
    setTransactionHash(null);
  };

  return {
    purchaseSeasonPass,
    status,
    transactionHash,
    resetStatus,
    price: SEASON_PASS_PRICE_USD,
    checkPurchaseEligibility
  };
};
