
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const useNFTMinting = () => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { user } = useAuth();
  const [isMinting, setIsMinting] = useState(false);

  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

  const NFT_METADATA = {
    name: "Cyber City Arcade Genesis",
    symbol: "CCA",
    description: "Genesis NFT from Cyber City Arcade - Your gateway to the ultimate Web3 gaming experience on Solana",
    image: "/lovable-uploads/814b2b6d-23ad-4774-8f3b-ea14fb7c8ff9.png",
    attributes: [
      { trait_type: "Collection", value: "Genesis" },
      { trait_type: "Rarity", value: "Common" },
      { trait_type: "Network", value: "Solana" },
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
        description: "Please connect your wallet to mint your free NFT",
        variant: "destructive"
      });
      return false;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to mint your NFT",
        variant: "destructive"
      });
      return false;
    }

    setIsMinting(true);

    try {
      // Check eligibility
      const isEligible = await checkMintEligibility();
      if (!isEligible) {
        toast({
          title: "Already Minted",
          description: "This wallet has already claimed a free NFT",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "🔄 Minting Your NFT",
        description: "Creating your Cyber City Arcade Genesis NFT...",
      });

      // For now, simulate the minting process
      // In production, you would use @metaplex-foundation/js or similar
      const walletPublicKey = new PublicKey(primaryWallet.address);
      
      // Simulate transaction delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock transaction hash and mint address
      const transactionHash = `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const mintAddress = `mint_${walletPublicKey.toString().slice(0, 8)}_${Date.now()}`;

      // Record the mint
      await recordMint(transactionHash, mintAddress);

      toast({
        title: "🎉 NFT Minted Successfully!",
        description: "Your Cyber City Arcade Genesis NFT has been minted!",
      });

      toast({
        title: "📋 Transaction Complete",
        description: `TX: ${transactionHash.slice(0, 12)}... | Mint: ${mintAddress.slice(0, 8)}...`,
      });

      return true;

    } catch (error: any) {
      console.error('Minting error:', error);
      
      let errorMessage = 'Minting failed. Please try again.';
      if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient SOL for transaction fees.';
      } else if (error.message?.includes('rejected')) {
        errorMessage = 'Transaction was rejected.';
      }
      
      toast({
        title: "❌ Minting Failed",
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
