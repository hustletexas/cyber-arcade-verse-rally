import { useState, useCallback } from 'react';
import {
  Contract,
  Networks,
  xdr,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk';
import { useMultiWallet } from './useMultiWallet';
import { toast } from 'sonner';
import type {
  NodeTier,
  CCTRBalance,
  NodeInfo,
  PoolInfo,
  TournamentInfo,
  RaffleInfo,
} from '@/types/soroban';

// Contract addresses - these should be updated after deployment
const CONTRACT_ADDRESSES = {
  cctrToken: import.meta.env.VITE_CCTR_TOKEN_CONTRACT || '',
  nodeSystem: import.meta.env.VITE_NODE_SYSTEM_CONTRACT || '',
  liquidityPool: import.meta.env.VITE_LIQUIDITY_POOL_CONTRACT || '',
  tournamentRaffle: import.meta.env.VITE_TOURNAMENT_RAFFLE_CONTRACT || '',
};

// Soroban RPC endpoint
const SOROBAN_RPC_URL = import.meta.env.VITE_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

export const useSorobanContracts = () => {
  const { connectedWallets } = useMultiWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get Stellar wallet address
  const getStellarAddress = useCallback((): string | null => {
    const stellarWallet = connectedWallets.find(
      w => w.chain === 'stellar' && w.isConnected
    );
    return stellarWallet?.address || null;
  }, [connectedWallets]);

  // Helper to create contract instance
  const getContract = useCallback((contractId: string): Contract => {
    return new Contract(contractId);
  }, []);

  // Helper to invoke contract method (read-only)
  const invokeContractRead = useCallback(async (
    contractId: string,
    method: string,
    args: xdr.ScVal[] = []
  ): Promise<unknown> => {
    try {
      const response = await fetch(`${SOROBAN_RPC_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'simulateTransaction',
          params: {
            transaction: {
              source: getStellarAddress() || 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
              fee: 100,
              seqNum: 0,
              operations: [{
                type: 'invokeHostFunction',
                hostFunction: {
                  type: 'invokeContract',
                  contractId,
                  functionName: method,
                  args,
                },
              }],
            },
          },
        }),
      });

      const result = await response.json();
      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.result && result.result.results && result.result.results[0]) {
        return scValToNative(xdr.ScVal.fromXDR(result.result.results[0].xdr, 'base64'));
      }
      return null;
    } catch (err) {
      console.error(`Contract read error (${method}):`, err);
      throw err;
    }
  }, [getStellarAddress]);

  // Helper to sign and submit transaction
  const signAndSubmitTransaction = useCallback(async (
    contractId: string,
    method: string,
    args: xdr.ScVal[] = []
  ): Promise<string> => {
    const stellarAddress = getStellarAddress();
    if (!stellarAddress) {
      throw new Error('No Stellar wallet connected');
    }

    // This would integrate with Freighter or LOBSTR for signing
    // For now, we'll simulate the transaction signing flow
    const txHash = `simulated_tx_${Date.now()}`;
    
    toast.info('Transaction signing requested', {
      description: 'Please approve the transaction in your wallet',
    });

    return txHash;
  }, [getStellarAddress]);

  // ============================================
  // CCTR TOKEN METHODS
  // ============================================

  const getCCTRBalance = useCallback(async (address?: string): Promise<CCTRBalance | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const targetAddress = address || getStellarAddress();
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      if (!CONTRACT_ADDRESSES.cctrToken) {
        // Return mock data if contract not deployed
        return {
          balance: BigInt(1000_0000000),
          formatted: '1,000.00',
        };
      }

      const balance = await invokeContractRead(
        CONTRACT_ADDRESSES.cctrToken,
        'balance',
        [nativeToScVal(targetAddress, { type: 'address' })]
      ) as bigint | null;

      const formattedBalance = balance 
        ? (Number(balance) / 10_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
        : '0.00';

      return {
        balance: balance || BigInt(0),
        formatted: formattedBalance,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get CCTR balance';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, invokeContractRead]);

  const transferCCTR = useCallback(async (
    to: string,
    amount: bigint
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const from = getStellarAddress();
      if (!from) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.cctrToken,
        'transfer',
        [
          nativeToScVal(from, { type: 'address' }),
          nativeToScVal(to, { type: 'address' }),
          nativeToScVal(amount, { type: 'i128' }),
        ]
      );

      toast.success('CCTR transferred successfully');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to transfer CCTR';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const approveCCTR = useCallback(async (
    spender: string,
    amount: bigint,
    expirationLedger: number
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const from = getStellarAddress();
      if (!from) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.cctrToken,
        'approve',
        [
          nativeToScVal(from, { type: 'address' }),
          nativeToScVal(spender, { type: 'address' }),
          nativeToScVal(amount, { type: 'i128' }),
          nativeToScVal(expirationLedger, { type: 'u32' }),
        ]
      );

      toast.success('CCTR approval granted');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve CCTR';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  // ============================================
  // NODE SYSTEM METHODS
  // ============================================

  const purchaseNode = useCallback(async (tier: NodeTier): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const buyer = getStellarAddress();
      if (!buyer) {
        throw new Error('No Stellar wallet connected');
      }

      const tierValue = tier === 'basic' ? 0 : tier === 'premium' ? 1 : 2;

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.nodeSystem,
        'purchase_node',
        [
          nativeToScVal(buyer, { type: 'address' }),
          nativeToScVal(tierValue, { type: 'u32' }),
        ]
      );

      toast.success(`${tier.charAt(0).toUpperCase() + tier.slice(1)} node purchased!`);
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to purchase node';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const claimNodeRewards = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const owner = getStellarAddress();
      if (!owner) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.nodeSystem,
        'claim_rewards',
        [nativeToScVal(owner, { type: 'address' })]
      );

      toast.success('Node rewards claimed!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim rewards';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const getNodeInfo = useCallback(async (address?: string): Promise<NodeInfo[] | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const targetAddress = address || getStellarAddress();
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      if (!CONTRACT_ADDRESSES.nodeSystem) {
        // Return mock data if contract not deployed
        return [];
      }

      const nodes = await invokeContractRead(
        CONTRACT_ADDRESSES.nodeSystem,
        'get_user_nodes',
        [nativeToScVal(targetAddress, { type: 'address' })]
      ) as NodeInfo[] | null;

      return nodes || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get node info';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, invokeContractRead]);

  const getPendingRewards = useCallback(async (address?: string): Promise<bigint | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const targetAddress = address || getStellarAddress();
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      if (!CONTRACT_ADDRESSES.nodeSystem) {
        return BigInt(0);
      }

      const rewards = await invokeContractRead(
        CONTRACT_ADDRESSES.nodeSystem,
        'get_pending_rewards',
        [nativeToScVal(targetAddress, { type: 'address' })]
      ) as bigint | null;

      return rewards || BigInt(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get pending rewards';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, invokeContractRead]);

  // ============================================
  // LIQUIDITY POOL METHODS
  // ============================================

  const addLiquidity = useCallback(async (
    tokenA: string,
    tokenB: string,
    amountA: bigint,
    amountB: bigint,
    minShares: bigint
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const depositor = getStellarAddress();
      if (!depositor) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.liquidityPool,
        'add_liquidity',
        [
          nativeToScVal(depositor, { type: 'address' }),
          nativeToScVal(tokenA, { type: 'address' }),
          nativeToScVal(tokenB, { type: 'address' }),
          nativeToScVal(amountA, { type: 'i128' }),
          nativeToScVal(amountB, { type: 'i128' }),
          nativeToScVal(minShares, { type: 'i128' }),
        ]
      );

      toast.success('Liquidity added successfully!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add liquidity';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const removeLiquidity = useCallback(async (
    tokenA: string,
    tokenB: string,
    shares: bigint,
    minAmountA: bigint,
    minAmountB: bigint
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const depositor = getStellarAddress();
      if (!depositor) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.liquidityPool,
        'remove_liquidity',
        [
          nativeToScVal(depositor, { type: 'address' }),
          nativeToScVal(tokenA, { type: 'address' }),
          nativeToScVal(tokenB, { type: 'address' }),
          nativeToScVal(shares, { type: 'i128' }),
          nativeToScVal(minAmountA, { type: 'i128' }),
          nativeToScVal(minAmountB, { type: 'i128' }),
        ]
      );

      toast.success('Liquidity removed successfully!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove liquidity';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const swap = useCallback(async (
    tokenIn: string,
    tokenOut: string,
    amountIn: bigint,
    minAmountOut: bigint
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = getStellarAddress();
      if (!user) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.liquidityPool,
        'swap',
        [
          nativeToScVal(user, { type: 'address' }),
          nativeToScVal(tokenIn, { type: 'address' }),
          nativeToScVal(tokenOut, { type: 'address' }),
          nativeToScVal(amountIn, { type: 'i128' }),
          nativeToScVal(minAmountOut, { type: 'i128' }),
        ]
      );

      toast.success('Swap completed!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to swap tokens';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const getPoolInfo = useCallback(async (
    tokenA: string,
    tokenB: string
  ): Promise<PoolInfo | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!CONTRACT_ADDRESSES.liquidityPool) {
        // Return mock data if contract not deployed
        return {
          tokenA,
          tokenB,
          reserveA: BigInt(1000000_0000000),
          reserveB: BigInt(500000_0000000),
          totalShares: BigInt(750000_0000000),
          swapFee: 30, // 0.3%
        };
      }

      const pool = await invokeContractRead(
        CONTRACT_ADDRESSES.liquidityPool,
        'get_pool',
        [
          nativeToScVal(tokenA, { type: 'address' }),
          nativeToScVal(tokenB, { type: 'address' }),
        ]
      ) as PoolInfo | null;

      return pool;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get pool info';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [invokeContractRead]);

  const getLPBalance = useCallback(async (
    tokenA: string,
    tokenB: string,
    address?: string
  ): Promise<bigint | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const targetAddress = address || getStellarAddress();
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      if (!CONTRACT_ADDRESSES.liquidityPool) {
        return BigInt(0);
      }

      const balance = await invokeContractRead(
        CONTRACT_ADDRESSES.liquidityPool,
        'get_lp_balance',
        [
          nativeToScVal(tokenA, { type: 'address' }),
          nativeToScVal(tokenB, { type: 'address' }),
          nativeToScVal(targetAddress, { type: 'address' }),
        ]
      ) as bigint | null;

      return balance || BigInt(0);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get LP balance';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, invokeContractRead]);

  // ============================================
  // TOURNAMENT METHODS
  // ============================================

  const joinTournament = useCallback(async (tournamentId: number): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const player = getStellarAddress();
      if (!player) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.tournamentRaffle,
        'join_tournament',
        [
          nativeToScVal(tournamentId, { type: 'u32' }),
          nativeToScVal(player, { type: 'address' }),
        ]
      );

      toast.success('Joined tournament successfully!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join tournament';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const submitTournamentScore = useCallback(async (
    tournamentId: number,
    score: number
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const player = getStellarAddress();
      if (!player) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.tournamentRaffle,
        'submit_score',
        [
          nativeToScVal(tournamentId, { type: 'u32' }),
          nativeToScVal(player, { type: 'address' }),
          nativeToScVal(score, { type: 'u32' }),
        ]
      );

      toast.success('Score submitted!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit score';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const getTournamentInfo = useCallback(async (
    tournamentId: number
  ): Promise<TournamentInfo | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!CONTRACT_ADDRESSES.tournamentRaffle) {
        // Return mock data if contract not deployed
        return {
          id: tournamentId,
          name: 'Mock Tournament',
          entryFee: BigInt(10_000000), // 10 USDC
          prizePool: BigInt(100_000000), // 100 USDC
          maxPlayers: 32,
          currentPlayers: 8,
          startTime: Date.now() / 1000,
          endTime: Date.now() / 1000 + 86400,
          status: 'active',
        };
      }

      const tournament = await invokeContractRead(
        CONTRACT_ADDRESSES.tournamentRaffle,
        'get_tournament',
        [nativeToScVal(tournamentId, { type: 'u32' })]
      ) as TournamentInfo | null;

      return tournament;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get tournament info';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [invokeContractRead]);

  // ============================================
  // RAFFLE METHODS
  // ============================================

  const buyRaffleTickets = useCallback(async (
    raffleId: number,
    ticketCount: number
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const buyer = getStellarAddress();
      if (!buyer) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.tournamentRaffle,
        'buy_raffle_tickets',
        [
          nativeToScVal(raffleId, { type: 'u32' }),
          nativeToScVal(buyer, { type: 'address' }),
          nativeToScVal(ticketCount, { type: 'u32' }),
        ]
      );

      toast.success(`Purchased ${ticketCount} raffle ticket(s)!`);
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to buy raffle tickets';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const getRaffleInfo = useCallback(async (raffleId: number): Promise<RaffleInfo | null> => {
    setIsLoading(true);
    setError(null);
    try {
      if (!CONTRACT_ADDRESSES.tournamentRaffle) {
        // Return mock data if contract not deployed
        return {
          id: raffleId,
          ticketPrice: BigInt(100_0000000), // 100 CCTR
          prizeAmount: BigInt(10000_0000000), // 10,000 CCTR
          totalTickets: 1000,
          ticketsSold: 250,
          endTime: Date.now() / 1000 + 86400 * 7,
          winner: null,
        };
      }

      const raffle = await invokeContractRead(
        CONTRACT_ADDRESSES.tournamentRaffle,
        'get_raffle',
        [nativeToScVal(raffleId, { type: 'u32' })]
      ) as RaffleInfo | null;

      return raffle;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get raffle info';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [invokeContractRead]);

  const getUserRaffleTickets = useCallback(async (
    raffleId: number,
    address?: string
  ): Promise<number | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const targetAddress = address || getStellarAddress();
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      if (!CONTRACT_ADDRESSES.tournamentRaffle) {
        return 0;
      }

      const tickets = await invokeContractRead(
        CONTRACT_ADDRESSES.tournamentRaffle,
        'get_user_tickets',
        [
          nativeToScVal(raffleId, { type: 'u32' }),
          nativeToScVal(targetAddress, { type: 'address' }),
        ]
      ) as number | null;

      return tickets || 0;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get raffle tickets';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, invokeContractRead]);

  // ============================================
  // STAKING METHODS (LP Staking)
  // ============================================

  const stakeLPTokens = useCallback(async (
    tokenA: string,
    tokenB: string,
    amount: bigint,
    lockDays: number
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const staker = getStellarAddress();
      if (!staker) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.liquidityPool,
        'stake_lp',
        [
          nativeToScVal(staker, { type: 'address' }),
          nativeToScVal(tokenA, { type: 'address' }),
          nativeToScVal(tokenB, { type: 'address' }),
          nativeToScVal(amount, { type: 'i128' }),
          nativeToScVal(lockDays, { type: 'u32' }),
        ]
      );

      toast.success('LP tokens staked successfully!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to stake LP tokens';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const unstakeLPTokens = useCallback(async (
    tokenA: string,
    tokenB: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const staker = getStellarAddress();
      if (!staker) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.liquidityPool,
        'unstake_lp',
        [
          nativeToScVal(staker, { type: 'address' }),
          nativeToScVal(tokenA, { type: 'address' }),
          nativeToScVal(tokenB, { type: 'address' }),
        ]
      );

      toast.success('LP tokens unstaked!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to unstake LP tokens';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const claimStakingRewards = useCallback(async (
    tokenA: string,
    tokenB: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const staker = getStellarAddress();
      if (!staker) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.liquidityPool,
        'claim_staking_rewards',
        [
          nativeToScVal(staker, { type: 'address' }),
          nativeToScVal(tokenA, { type: 'address' }),
          nativeToScVal(tokenB, { type: 'address' }),
        ]
      );

      toast.success('Staking rewards claimed!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to claim staking rewards';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  return {
    // State
    isLoading,
    error,
    contractAddresses: CONTRACT_ADDRESSES,
    stellarAddress: getStellarAddress(),

    // CCTR Token
    getCCTRBalance,
    transferCCTR,
    approveCCTR,

    // Node System
    purchaseNode,
    claimNodeRewards,
    getNodeInfo,
    getPendingRewards,

    // Liquidity Pool
    addLiquidity,
    removeLiquidity,
    swap,
    getPoolInfo,
    getLPBalance,

    // Tournament
    joinTournament,
    submitTournamentScore,
    getTournamentInfo,

    // Raffle
    buyRaffleTickets,
    getRaffleInfo,
    getUserRaffleTickets,

    // LP Staking
    stakeLPTokens,
    unstakeLPTokens,
    claimStakingRewards,
  };
};

export default useSorobanContracts;
