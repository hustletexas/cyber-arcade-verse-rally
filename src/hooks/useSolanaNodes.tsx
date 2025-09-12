import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface NodePurchase {
  nodeType: 'basic' | 'premium' | 'legendary';
  price: number;
  onSuccess?: () => void;
}

export const useSolanaNodes = () => {
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userNodes, setUserNodes] = useState({ basic: 0, premium: 0, legendary: 0 });

  // Solana connection
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  // Node system program ID (replace with actual deployed program)
  const NODE_PROGRAM_ID = new PublicKey('7WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWN');

  const fetchUserNodes = async () => {
    if (!user || !primaryWallet) return;

    try {
      const { data, error } = await supabase
        .from('node_purchases')
        .select('node_type, quantity')
        .eq('user_id', user.id)
        .eq('wallet_address', primaryWallet.address);

      if (error) throw error;

      const nodes = { basic: 0, premium: 0, legendary: 0 };
      data?.forEach(purchase => {
        nodes[purchase.node_type as keyof typeof nodes] += purchase.quantity;
      });
      setUserNodes(nodes);
    } catch (error) {
      console.error('Error fetching user nodes:', error);
    }
  };

  const purchaseNode = async ({ nodeType, price, onSuccess }: NodePurchase) => {
    if (!isWalletConnected || !primaryWallet) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to purchase a node",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase a node",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Get wallet provider
      const provider = (window as any).solana;
      if (!provider) throw new Error('Solana wallet not found');

      const publicKey = new PublicKey(primaryWallet.address);
      
      // Create payment transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: NODE_PROGRAM_ID, // In real implementation, this would be the program's treasury
          lamports: price * LAMPORTS_PER_SOL,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign and send transaction
      const signedTx = await provider.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTx.serialize());
      
      // Confirm transaction
      await connection.confirmTransaction(signature, 'confirmed');

      // Record purchase in database
      const { error } = await supabase
        .from('node_purchases')
        .insert({
          user_id: user.id,
          wallet_address: primaryWallet.address,
          node_type: nodeType,
          quantity: 1,
          price_sol: price,
          transaction_hash: signature,
        });

      if (error) throw error;

      toast({
        title: "Node Purchased Successfully!",
        description: `Your ${nodeType} node is now active and earning rewards`,
      });

      // Refresh user nodes
      await fetchUserNodes();
      onSuccess?.();

    } catch (error: any) {
      console.error('Node purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Failed to purchase node. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const claimRewards = async () => {
    if (!isWalletConnected || !primaryWallet || !user) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to claim rewards",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Calculate claimable rewards
      const dailyRewards = {
        basic: userNodes.basic * 0.05,
        premium: userNodes.premium * 0.3,
        legendary: userNodes.legendary * 0.7,
      };
      
      const totalDaily = dailyRewards.basic + dailyRewards.premium + dailyRewards.legendary;
      
      if (totalDaily === 0) {
        toast({
          title: "No Rewards",
          description: "You don't have any nodes to claim rewards from",
          variant: "destructive",
        });
        return;
      }

      // Check last claim time
      const { data: lastReward } = await supabase
        .from('node_rewards')
        .select('reward_date')
        .eq('user_id', user.id)
        .eq('wallet_address', primaryWallet.address)
        .order('reward_date', { ascending: false })
        .limit(1);

      const today = new Date().toISOString().split('T')[0];
      const lastClaimDate = lastReward?.[0]?.reward_date;

      if (lastClaimDate === today) {
        toast({
          title: "Already Claimed",
          description: "You've already claimed rewards today. Come back tomorrow!",
          variant: "destructive",
        });
        return;
      }

      // Record reward claim
      const { error } = await supabase
        .from('node_rewards')
        .insert({
          user_id: user.id,
          wallet_address: primaryWallet.address,
          reward_amount: totalDaily,
          reward_date: today,
          claimed_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Rewards Claimed!",
        description: `You claimed ${totalDaily} SOL in daily rewards`,
      });

    } catch (error: any) {
      console.error('Claim rewards error:', error);
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim rewards. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchUserNodes();
  }, [user, primaryWallet]);

  return {
    purchaseNode,
    claimRewards,
    isProcessing,
    userNodes,
    fetchUserNodes,
  };
};