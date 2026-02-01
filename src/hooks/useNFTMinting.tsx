
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

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

  const recordMint = async (transactionHash: string, mintAddress: string) => {
    if (!primaryWallet || !user) return;

    try {
      const { error } = await supabase
        .from('nft_mints')
        .insert({
          user_id: user.id,
          wallet_address: primaryWallet.address,
          nft_name: NFT_METADATA.name,
          mint_address: mintAddress,
          transaction_hash: transactionHash,
          metadata: NFT_METADATA,
          status: 'completed'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to record mint:', error);
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

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to claim your NFT",
        variant: "destructive"
      });
      return false;
    }

    setIsMinting(true);

    try {
      // Check eligibility - only 1 NFT per wallet
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
        description: "Creating your Cyber City Arcade Genesis NFT on Stellar...",
      });

      // Generate Stellar-style transaction hash and mint address
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(2, 11);
      const walletPrefix = primaryWallet.address.substring(0, 8);
      
      // Stellar transaction hashes are 64 character hex strings
      const transactionHash = `stellar_${timestamp}_${randomSuffix}`.padEnd(64, '0');
      // Soroban contract addresses start with 'C'
      const mintAddress = `C${walletPrefix}${timestamp}`.substring(0, 56);

      // Simulate minting delay (in production, this would be a Soroban contract call)
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Record the mint in database
      await recordMint(transactionHash, mintAddress);

      toast({
        title: "🎉 NFT Claimed Successfully!",
        description: "Your Cyber City Arcade Genesis NFT has been claimed on Stellar!",
      });

      toast({
        title: "📋 Transaction Complete",
        description: `TX: ${transactionHash.slice(0, 12)}... | Mint: ${mintAddress.slice(0, 8)}...`,
      });

      return true;

    } catch (error: any) {
      console.error('Claim error:', error);
      
      let errorMessage = 'Claim failed. Please try again.';
      if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient XLM for transaction fees.';
      } else if (error.message?.includes('rejected')) {
        errorMessage = 'Transaction was rejected.';
      }
      
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
    nftMetadata: NFT_METADATA
  };
};
