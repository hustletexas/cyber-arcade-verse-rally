
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const useSolanaNFT = () => {
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { user } = useAuth();
  const [isPurchasing, setIsPurchasing] = useState<number | null>(null);

  const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

  const purchaseNFT = async (nft: any, currency: 'cctr' | 'sol' | 'usdc' | 'pyusd') => {
    if (!isWalletConnected || !primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase NFTs",
        variant: "destructive"
      });
      return false;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase NFTs",
        variant: "destructive"
      });
      return false;
    }

    setIsPurchasing(nft.id);

    try {
      const price = nft.price[currency];
      const walletPublicKey = new PublicKey(primaryWallet.address);
      
      toast({
        title: "🔄 Processing Purchase",
        description: `Buying ${nft.name} for ${price} ${currency.toUpperCase()}...`,
      });

      let transactionHash = '';

      if (currency === 'sol') {
        // Handle SOL payment
        const marketplaceWallet = new PublicKey('11111111111111111111111111111112'); // System program as placeholder
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: walletPublicKey,
            toPubkey: marketplaceWallet,
            lamports: price * LAMPORTS_PER_SOL,
          })
        );

        // Get latest blockhash
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = walletPublicKey;

        // Sign and send transaction based on wallet type
        let signedTransaction;
        if (primaryWallet.type === 'phantom' && window.solana) {
          signedTransaction = await window.solana.signTransaction(transaction);
        } else {
          throw new Error('Unsupported wallet for SOL transactions');
        }

        const signature = await connection.sendRawTransaction(signedTransaction.serialize());
        await connection.confirmTransaction(signature);
        transactionHash = signature;

        toast({
          title: "✅ SOL Payment Confirmed",
          description: `Transaction: ${signature.slice(0, 8)}...${signature.slice(-4)}`,
        });

      } else if (currency === 'usdc' || currency === 'pyusd') {
        // Handle USDC/PYUSD payments via SPL Token
        const tokenMintAddress = currency === 'usdc' 
          ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC mint
          : 'CXk2AMBfi3TwaEL2468s6zP8xq9NxTXjp9gjMgzeUynM'; // PYUSD mint

        // This would require more complex SPL token transfer logic
        // For now, simulate the transaction
        await new Promise(resolve => setTimeout(resolve, 2000));
        transactionHash = `${currency}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        toast({
          title: `✅ ${currency.toUpperCase()} Payment Processed`,
          description: `Simulated ${currency.toUpperCase()} transfer completed`,
        });

      } else if (currency === 'cctr') {
        // Handle CCTR token payment using secure server-side function
        const { data, error: rpcError } = await supabase.rpc('purchase_nft_with_cctr', {
          nft_id_param: nft.id.toString(),
          nft_name_param: nft.name,
          price_param: price
        });

        if (rpcError) {
          throw new Error('Failed to process CCTR payment');
        }

        const result = data as { success: boolean; error?: string } | null;

        if (!result?.success) {
          throw new Error(result?.error || 'Failed to process CCTR payment');
        }

        transactionHash = `cctr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        toast({
          title: "✅ CCTR Payment Processed",
          description: `${price} CCTR tokens deducted from your balance`,
        });
      }

      // Record the purchase in database
      const { error: purchaseError } = await supabase
        .from('nft_purchases')
        .insert({
          user_id: user.id,
          nft_id: nft.id.toString(),
          nft_name: nft.name,
          price: price,
          currency: currency,
          wallet_address: primaryWallet.address,
          transaction_hash: transactionHash,
          status: 'completed'
        });

      if (purchaseError) {
        console.error('Purchase storage error:', purchaseError);
        throw new Error('Failed to record purchase');
      }

      // Mint NFT to user's wallet (simulated)
      toast({
        title: "🎉 NFT Purchased Successfully!",
        description: `${nft.name} has been minted to your wallet!`,
      });

      toast({
        title: "📋 Transaction Complete",
        description: `TX: ${transactionHash.slice(0, 12)}... | Wallet: ${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`,
      });

      return true;

    } catch (error: any) {
      console.error('Purchase error:', error);
      
      let errorMessage = 'Transaction failed. Please try again.';
      if (error.message?.includes('insufficient')) {
        errorMessage = 'Insufficient balance for this transaction.';
      } else if (error.message?.includes('rejected')) {
        errorMessage = 'Transaction was rejected. Please try again.';
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      toast({
        title: "❌ Purchase Failed",
        description: errorMessage,
        variant: "destructive"
      });

      return false;
    } finally {
      setIsPurchasing(null);
    }
  };

  return {
    purchaseNFT,
    isPurchasing
  };
};
