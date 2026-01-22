import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useToast } from '@/hooks/use-toast';

interface NodePurchase {
  nodeType: 'basic' | 'premium' | 'legendary';
  price: number;
  onSuccess?: () => void;
}

// Node prices in CCTR
const NODE_PRICES = {
  basic: 1000,
  premium: 10000,
  legendary: 100000
};

export const useSolanaNodes = () => {
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [userNodes, setUserNodes] = useState({ basic: 0, premium: 0, legendary: 0 });

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
      // Check user's CCTR balance
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_balances')
        .select('cctr_balance')
        .eq('user_id', user.id)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') throw balanceError;
      
      const cctrBalance = balanceData?.cctr_balance || 0;
      const nodePrice = NODE_PRICES[nodeType];

      if (cctrBalance < nodePrice) {
        toast({
          title: "Insufficient CCTR Balance",
          description: `You need ${nodePrice.toLocaleString()} CCTR to purchase this node. Current balance: ${cctrBalance.toLocaleString()} CCTR`,
          variant: "destructive",
        });
        return;
      }

      // Deduct CCTR from balance
      const newBalance = cctrBalance - nodePrice;
      const { error: updateError } = await supabase
        .from('user_balances')
        .upsert({
          user_id: user.id,
          cctr_balance: newBalance,
          updated_at: new Date().toISOString()
        });

      if (updateError) throw updateError;

      // Generate a transaction hash for record-keeping
      const transactionHash = `cctr_node_${nodeType}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Record purchase in database
      const { error } = await supabase
        .from('node_purchases')
        .insert({
          user_id: user.id,
          wallet_address: primaryWallet.address,
          node_type: nodeType,
          quantity: 1,
          price_sol: nodePrice, // Using price_sol column but storing CCTR value
          transaction_hash: transactionHash,
        });

      if (error) throw error;

      // Record the token transaction
      await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: -nodePrice,
          transaction_type: 'node_purchase',
          description: `Purchased ${nodeType} CCTR node`
        });

      toast({
        title: "Node Purchased Successfully!",
        description: `Your ${nodeType} node is now active and earning CCTR rewards`,
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
      // Calculate claimable rewards in CCTR
      const dailyRewards = {
        basic: userNodes.basic * 5,      // 5 CCTR per basic node
        premium: userNodes.premium * 60,  // 60 CCTR per premium node
        legendary: userNodes.legendary * 700, // 700 CCTR per legendary node
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

      // Add rewards to user balance
      const { data: balanceData } = await supabase
        .from('user_balances')
        .select('cctr_balance')
        .eq('user_id', user.id)
        .single();

      const currentBalance = balanceData?.cctr_balance || 0;
      const newBalance = currentBalance + totalDaily;

      await supabase
        .from('user_balances')
        .upsert({
          user_id: user.id,
          cctr_balance: newBalance,
          updated_at: new Date().toISOString()
        });

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

      // Record the token transaction
      await supabase
        .from('token_transactions')
        .insert({
          user_id: user.id,
          amount: totalDaily,
          transaction_type: 'node_reward',
          description: `Claimed daily CCTR node rewards`
        });

      toast({
        title: "Rewards Claimed!",
        description: `You claimed ${totalDaily.toLocaleString()} CCTR in daily rewards`,
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