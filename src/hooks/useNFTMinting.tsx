import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface MintResponse {
  success?: boolean;
  transactionHash?: string;
  mintAddress?: string;
  ledger?: number;
  error?: string;
  details?: string;
}

export const useNFTMinting = () => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { user } = useAuth();
  const [isMinting, setIsMinting] = useState(false);

  const NFT_METADATA = {
    name: "Cyber City Arcade Genesis",
    symbol: "CCA",
    description: "Genesis NFT from Cyber City Arcade - Your gateway to the ultimate Web3 gaming experience on Stellar",
    image: "/lovable-uploads/814b2b6d-23ad-4774-8f3b-ea14fb7c8ff9.png",
    attributes: [
      { trait_type: "Collection", value: "Genesis" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Network", value: "Stellar" },
      { trait_type: "Utility", value: "Gaming Access" }
    ],
    properties: {
      category: "image",
      files: [{
        uri: "/lovable-uploads/814b2b6d-23ad-4774-8f3b-ea14fb7c8ff9.png",
        type: "image/png"
      }]
    }
  };

  const checkMintEligibility = async (): Promise<boolean> => {
    if (!primaryWallet) return false;

    try {
      // Check if wallet has already minted
      const { data: existingMint, error } = await supabase
        .from('nft_mints')
        .select('*')
        .eq('wallet_address', primaryWallet.address)
        .maybeSingle();

      if (error) {
        console.error('Error checking mint eligibility:', error);
        return false;
      }

      return !existingMint;
    } catch (error) {
      console.error('Eligibility check failed:', error);
      return false;
    }
  };

  const mintFreeNFT = async (): Promise<boolean> => {
    if (!isWalletConnected || !primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Stellar wallet to claim your NFT",
        variant: "destructive"
      });
      return false;
    }

    // Generate deterministic user ID from wallet address for wallet-only architecture
    const walletUserId = primaryWallet.address;

    setIsMinting(true);

    try {
      // Check eligibility first (quick client-side check)
      const isEligible = await checkMintEligibility();
      if (!isEligible) {
        toast({
          title: "Already Claimed",
          description: "This wallet has already claimed an NFT (limit: 1 per wallet)",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "🔄 Claiming Your NFT",
        description: "Creating claimable balance on Stellar Mainnet...",
      });

      // Call the Edge Function to create the claimable balance
      const { data, error } = await supabase.functions.invoke('mint-nft-claimable', {
        body: {
          claimantPublicKey: primaryWallet.address,
          nftName: NFT_METADATA.name,
          metadata: NFT_METADATA,
          userId: walletUserId
        }
      });

      const response = data as MintResponse | null;

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to create claimable balance');
      }

      if (!response?.success) {
        throw new Error(response?.error || 'Failed to create claimable balance');
      }

      toast({
        title: "🎉 NFT Claimed Successfully!",
        description: "A claimable balance has been created for your Stellar wallet!",
      });

      toast({
        title: "📋 Transaction Complete",
        description: `TX: ${response.transactionHash?.slice(0, 12)}... | Ledger: ${response.ledger}`,
      });

      return true;

    } catch (error: unknown) {
      console.error('Claim error:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Claim failed. Please try again.';
      
      toast({
        title: "❌ Claim Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return false;
    } finally {
      setIsMinting(false);
    }
  };

  return {
    mintFreeNFT,
    isMinting,
    nftMetadata: NFT_METADATA,
    checkMintEligibility
  };
};
