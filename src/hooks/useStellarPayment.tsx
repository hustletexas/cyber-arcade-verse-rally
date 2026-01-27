import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { PAYMENT_CONFIG } from '@/types/wallet';
import { STELLAR_NETWORK } from '@/config/stellar';

// Stellar USDC asset configuration (using network config)
export const STELLAR_USDC = STELLAR_NETWORK.assets.USDC;

// CCC Rewards Token on Soroban (placeholder contract)
export const CCC_TOKEN = {
  code: 'CCC',
  contractId: 'PLACEHOLDER_CCC_CONTRACT_ID', // Will be replaced with actual Soroban contract
  decimals: 7,
};

// Onramp providers for fiat-to-USDC
export const ONRAMP_PROVIDERS = [
  {
    id: 'moonpay',
    name: 'MoonPay',
    url: 'https://www.moonpay.com/buy/usdc_xlm',
    description: 'Buy USDC with card or bank transfer',
    fees: '~3.5%',
  },
  {
    id: 'transak',
    name: 'Transak',
    url: 'https://global.transak.com/',
    description: 'Global fiat onramp',
    fees: '~1-5%',
  },
  {
    id: 'ramp',
    name: 'Ramp Network',
    url: 'https://ramp.network/',
    description: 'Fast and easy USDC purchase',
    fees: '~2.5%',
  },
];

export interface StellarPaymentResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface PaymentDetails {
  amount: number;
  currency: string;
  description: string;
  recipientAddress?: string;
}

export const useStellarPayment = () => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const [isProcessing, setIsProcessing] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);

  // Check if user has a Stellar wallet connected
  const hasStellarWallet = primaryWallet?.chain === 'stellar';

  // Get USDC balance on Stellar
  const fetchUSDCBalance = useCallback(async (address: string): Promise<number> => {
    try {
      // Stellar Horizon API call to get account balances
      const response = await fetch(
        `${STELLAR_NETWORK.horizonUrl}/accounts/${address}`
      );
      
      if (!response.ok) {
        console.log('Account not found or no trustline');
        return 0;
      }

      const account = await response.json();
      const usdcBalance = account.balances?.find(
        (b: any) => b.asset_code === STELLAR_USDC.code && 
                    b.asset_issuer === STELLAR_USDC.issuer
      );

      const balance = usdcBalance ? parseFloat(usdcBalance.balance) : 0;
      setUsdcBalance(balance);
      return balance;
    } catch (error) {
      console.error('Error fetching USDC balance:', error);
      return 0;
    }
  }, []);

  // Check if user has USDC trustline
  const hasUSDCTrustline = useCallback(async (address: string): Promise<boolean> => {
    try {
      const response = await fetch(
        `${STELLAR_NETWORK.horizonUrl}/accounts/${address}`
      );
      
      if (!response.ok) return false;

      const account = await response.json();
      return account.balances?.some(
        (b: any) => b.asset_code === STELLAR_USDC.code && 
                    b.asset_issuer === STELLAR_USDC.issuer
      );
    } catch (error) {
      console.error('Error checking trustline:', error);
      return false;
    }
  }, []);

  // Pay tournament entry fee with USDC
  const payEntryFee = useCallback(async (
    tournamentId: string,
    amount: number,
    recipientAddress: string
  ): Promise<StellarPaymentResult> => {
    if (!hasStellarWallet || !primaryWallet) {
      return { 
        success: false, 
        error: 'Please connect a Stellar wallet (Freighter or LOBSTR) to pay entry fees' 
      };
    }

    setIsProcessing(true);

    try {
      // Check USDC balance
      const balance = await fetchUSDCBalance(primaryWallet.address);
      if (balance < amount) {
        return { 
          success: false, 
          error: `Insufficient USDC balance. You have ${balance.toFixed(2)} USDC but need ${amount} USDC` 
        };
      }

      // For now, simulate the payment (actual implementation requires Stellar SDK transaction building)
      // In production, this would use freighterApi.signTransaction or LOBSTR signing
      console.log(`Paying ${amount} USDC for tournament ${tournamentId}`);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock transaction hash
      const mockTxHash = `stellar_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      toast({
        title: "Entry Fee Paid!",
        description: `Successfully paid ${amount} USDC for tournament entry`,
      });

      return {
        success: true,
        transactionHash: mockTxHash,
      };
    } catch (error: any) {
      console.error('Payment error:', error);
      return {
        success: false,
        error: error?.message || 'Payment failed. Please try again.',
      };
    } finally {
      setIsProcessing(false);
    }
  }, [hasStellarWallet, primaryWallet, fetchUSDCBalance, toast]);

  // Claim tournament payout
  const claimPayout = useCallback(async (
    tournamentId: string,
    amount: number
  ): Promise<StellarPaymentResult> => {
    if (!hasStellarWallet || !primaryWallet) {
      return { 
        success: false, 
        error: 'Please connect a Stellar wallet to claim your payout' 
      };
    }

    setIsProcessing(true);

    try {
      console.log(`Claiming ${amount} USDC payout for tournament ${tournamentId}`);
      
      // Simulate payout processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTxHash = `stellar_payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      toast({
        title: "Payout Claimed!",
        description: `Successfully received ${amount} USDC`,
      });

      return {
        success: true,
        transactionHash: mockTxHash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to claim payout',
      };
    } finally {
      setIsProcessing(false);
    }
  }, [hasStellarWallet, primaryWallet, toast]);

  // Claim CCC rewards (Soroban token)
  const claimCCCRewards = useCallback(async (
    amount: number
  ): Promise<StellarPaymentResult> => {
    if (!hasStellarWallet || !primaryWallet) {
      return { 
        success: false, 
        error: 'Please connect a Stellar wallet to claim CCC rewards' 
      };
    }

    setIsProcessing(true);

    try {
      console.log(`Claiming ${amount} CCC rewards via Soroban contract`);
      
      // Simulate Soroban contract interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockTxHash = `soroban_ccc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      toast({
        title: "CCC Rewards Claimed!",
        description: `Successfully received ${amount} CCC tokens`,
      });

      return {
        success: true,
        transactionHash: mockTxHash,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error?.message || 'Failed to claim CCC rewards',
      };
    } finally {
      setIsProcessing(false);
    }
  }, [hasStellarWallet, primaryWallet, toast]);

  // Check pass gating (Soroban NFT/token ownership)
  const checkPassAccess = useCallback(async (
    passType: string
  ): Promise<boolean> => {
    if (!hasStellarWallet || !primaryWallet) {
      return false;
    }

    try {
      console.log(`Checking ${passType} pass ownership via Soroban`);
      
      // Simulate Soroban contract query
      // In production, this would query the pass NFT contract
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo, return true for any pass check
      return true;
    } catch (error) {
      console.error('Pass check error:', error);
      return false;
    }
  }, [hasStellarWallet, primaryWallet]);

  // Get onramp URL for user's wallet
  const getOnrampUrl = useCallback((providerId: string): string | null => {
    if (!primaryWallet?.address) return null;

    const provider = ONRAMP_PROVIDERS.find(p => p.id === providerId);
    if (!provider) return null;

    // Add wallet address to onramp URL
    const url = new URL(provider.url);
    url.searchParams.set('walletAddress', primaryWallet.address);
    url.searchParams.set('cryptoCurrency', 'USDC_XLM');
    
    return url.toString();
  }, [primaryWallet?.address]);

  return {
    // State
    isProcessing,
    hasStellarWallet,
    usdcBalance,
    
    // Payment methods
    payEntryFee,
    claimPayout,
    claimCCCRewards,
    
    // Utility
    fetchUSDCBalance,
    hasUSDCTrustline,
    checkPassAccess,
    getOnrampUrl,
    
    // Config exports
    STELLAR_USDC,
    CCC_TOKEN,
    ONRAMP_PROVIDERS,
    PAYMENT_CONFIG,
  };
};
