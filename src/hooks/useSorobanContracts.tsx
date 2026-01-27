import { useState, useCallback } from 'react';
import {
  Contract,
  Networks,
  xdr,
  nativeToScVal,
  scValToNative,
  TransactionBuilder,
  Account,
  Operation,
  Asset,
  Memo,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { StellarWalletsKit, WalletNetwork, allowAllModules, LOBSTR_ID } from '@creit.tech/stellar-wallets-kit';
import freighterApi from '@stellar/freighter-api';
import { useMultiWallet } from './useMultiWallet';
import { toast } from 'sonner';
import type {
  NodeTier,
  CCTRBalance,
  NodeInfo,
  PoolInfo,
  TournamentInfo,
  RaffleInfo,
  PassTier,
  PassInfo,
  AccessGate,
  TournamentEscrow,
  PayoutRecord,
  MatchAttestation,
  Dispute,
  CreditPackage,
  UserCredits,
  HostProvider,
  ComputeJob,
} from '@/types/soroban';

// Contract addresses - these should be updated after deployment
const CONTRACT_ADDRESSES = {
  cctrToken: import.meta.env.VITE_CCTR_TOKEN_CONTRACT || '',
  nodeSystem: import.meta.env.VITE_NODE_SYSTEM_CONTRACT || '',
  liquidityPool: import.meta.env.VITE_LIQUIDITY_POOL_CONTRACT || '',
  tournamentRaffle: import.meta.env.VITE_TOURNAMENT_RAFFLE_CONTRACT || '',
  nftPass: import.meta.env.VITE_NFT_PASS_CONTRACT || '',
  rewardsVault: import.meta.env.VITE_REWARDS_VAULT_CONTRACT || '',
  resultsAttestation: import.meta.env.VITE_RESULTS_ATTESTATION_CONTRACT || '',
  computeCredits: import.meta.env.VITE_COMPUTE_CREDITS_CONTRACT || '',
  hostRewards: import.meta.env.VITE_HOST_REWARDS_CONTRACT || '',
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

  // Get connected wallet type (freighter or lobstr)
  const getConnectedWalletType = useCallback((): 'freighter' | 'lobstr' | null => {
    const stellarWallet = connectedWallets.find(
      w => w.chain === 'stellar' && w.isConnected
    );
    if (!stellarWallet) return null;
    return stellarWallet.type === 'freighter' ? 'freighter' : 'lobstr';
  }, [connectedWallets]);

  // Build transaction for contract invocation
  const buildContractTransaction = useCallback(async (
    sourceAddress: string,
    contractId: string,
    method: string,
    args: xdr.ScVal[] = []
  ): Promise<string> => {
    // Fetch account sequence number from Horizon
    const horizonUrl = NETWORK_PASSPHRASE === Networks.TESTNET 
      ? 'https://horizon-testnet.stellar.org' 
      : 'https://horizon.stellar.org';
    
    const accountResponse = await fetch(`${horizonUrl}/accounts/${sourceAddress}`);
    if (!accountResponse.ok) {
      throw new Error('Failed to fetch account details');
    }
    const accountData = await accountResponse.json();
    const account = new Account(sourceAddress, accountData.sequence);

    // Build the contract invocation
    const contract = new Contract(contractId);
    const invokeOp = contract.call(method, ...args);

    // Build the transaction
    const transaction = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(invokeOp)
      .setTimeout(300)
      .build();

    return transaction.toXDR();
  }, []);

  // Sign transaction with Freighter
  const signWithFreighter = useCallback(async (txXdr: string): Promise<string> => {
    const networkDetails = await freighterApi.getNetworkDetails();
    const network = networkDetails.networkPassphrase === Networks.TESTNET ? 'TESTNET' : 'PUBLIC';
    
    const signResult = await freighterApi.signTransaction(txXdr, {
      networkPassphrase: networkDetails.networkPassphrase,
    });

    if (signResult.error) {
      throw new Error(signResult.error.message || 'Failed to sign transaction with Freighter');
    }

    return signResult.signedTxXdr;
  }, []);

  // Sign transaction with LOBSTR via Stellar Wallets Kit
  const signWithLobstr = useCallback(async (txXdr: string): Promise<string> => {
    const kit = new StellarWalletsKit({
      network: NETWORK_PASSPHRASE === Networks.TESTNET ? WalletNetwork.TESTNET : WalletNetwork.PUBLIC,
      selectedWalletId: LOBSTR_ID,
      modules: allowAllModules()
    });

    const { signedTxXdr } = await kit.signTransaction(txXdr);
    return signedTxXdr;
  }, []);

  // Submit signed transaction to network
  const submitTransaction = useCallback(async (signedTxXdr: string): Promise<string> => {
    const response = await fetch(`${SOROBAN_RPC_URL}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: {
          transaction: signedTxXdr,
        },
      }),
    });

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error.message || 'Failed to submit transaction');
    }

    // Return the transaction hash
    return result.result?.hash || result.result?.id || signedTxXdr.slice(0, 16);
  }, []);

  // Helper to sign and submit transaction with real wallet integration
  const signAndSubmitTransaction = useCallback(async (
    contractId: string,
    method: string,
    args: xdr.ScVal[] = []
  ): Promise<string> => {
    const stellarAddress = getStellarAddress();
    if (!stellarAddress) {
      throw new Error('No Stellar wallet connected');
    }

    const walletType = getConnectedWalletType();
    if (!walletType) {
      throw new Error('No supported Stellar wallet connected');
    }

    toast.info('Transaction signing requested', {
      description: 'Please approve the transaction in your wallet',
    });

    try {
      // Build the transaction XDR
      const txXdr = await buildContractTransaction(stellarAddress, contractId, method, args);

      // Sign with appropriate wallet
      let signedTxXdr: string;
      if (walletType === 'freighter') {
        signedTxXdr = await signWithFreighter(txXdr);
      } else {
        signedTxXdr = await signWithLobstr(txXdr);
      }

      // Submit the signed transaction
      const txHash = await submitTransaction(signedTxXdr);

      toast.success('Transaction submitted!', {
        description: `Hash: ${txHash.slice(0, 8)}...${txHash.slice(-4)}`,
      });

      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      toast.error('Transaction failed', { description: message });
      throw err;
    }
  }, [getStellarAddress, getConnectedWalletType, buildContractTransaction, signWithFreighter, signWithLobstr, submitTransaction]);

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

  // ============================================
  // NFT PASS METHODS
  // ============================================

  const mintPass = useCallback(async (
    tier: PassTier,
    isSoulbound: boolean,
    expiresAt: number,
    metadataUri: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const recipient = getStellarAddress();
      if (!recipient) {
        throw new Error('No Stellar wallet connected');
      }

      const tierValue = tier === 'bronze' ? 0 : tier === 'silver' ? 1 : tier === 'gold' ? 2 : 3;

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.nftPass,
        'mint_pass',
        [
          nativeToScVal(recipient, { type: 'address' }),
          nativeToScVal(tierValue, { type: 'u32' }),
          nativeToScVal(isSoulbound, { type: 'bool' }),
          nativeToScVal(expiresAt, { type: 'u64' }),
          nativeToScVal(metadataUri, { type: 'string' }),
          nativeToScVal(CONTRACT_ADDRESSES.cctrToken, { type: 'address' }),
        ]
      );

      toast.success(`${tier.charAt(0).toUpperCase() + tier.slice(1)} Pass minted!`);
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mint pass';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const checkPassAccess = useCallback(async (gateId: string): Promise<boolean> => {
    try {
      const user = getStellarAddress();
      if (!user) return false;

      if (!CONTRACT_ADDRESSES.nftPass) return false;

      const hasAccess = await invokeContractRead(
        CONTRACT_ADDRESSES.nftPass,
        'check_access',
        [
          nativeToScVal(user, { type: 'address' }),
          nativeToScVal(gateId, { type: 'symbol' }),
        ]
      ) as boolean;

      return hasAccess;
    } catch (err) {
      console.error('Failed to check access:', err);
      return false;
    }
  }, [getStellarAddress, invokeContractRead]);

  const getUserPasses = useCallback(async (address?: string): Promise<number[]> => {
    try {
      const targetAddress = address || getStellarAddress();
      if (!targetAddress) return [];

      if (!CONTRACT_ADDRESSES.nftPass) return [];

      const passes = await invokeContractRead(
        CONTRACT_ADDRESSES.nftPass,
        'get_owner_passes',
        [nativeToScVal(targetAddress, { type: 'address' })]
      ) as number[];

      return passes || [];
    } catch (err) {
      console.error('Failed to get user passes:', err);
      return [];
    }
  }, [getStellarAddress, invokeContractRead]);

  // ============================================
  // REWARDS VAULT METHODS
  // ============================================

  const enterTournamentEscrow = useCallback(async (
    tournamentId: string,
    token: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const player = getStellarAddress();
      if (!player) {
        throw new Error('No Stellar wallet connected');
      }

      // Convert tournament ID to bytes32
      const tournamentIdBytes = new Uint8Array(32);
      const encoder = new TextEncoder();
      const encoded = encoder.encode(tournamentId);
      tournamentIdBytes.set(encoded.slice(0, 32));

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.rewardsVault,
        'enter_tournament',
        [
          nativeToScVal(player, { type: 'address' }),
          nativeToScVal(tournamentIdBytes, { type: 'bytes' }),
          nativeToScVal(token, { type: 'address' }),
        ]
      );

      toast.success('Tournament entry successful!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to enter tournament';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const getTournamentEscrow = useCallback(async (tournamentId: string): Promise<TournamentEscrow | null> => {
    try {
      if (!CONTRACT_ADDRESSES.rewardsVault) return null;

      const tournamentIdBytes = new Uint8Array(32);
      const encoder = new TextEncoder();
      const encoded = encoder.encode(tournamentId);
      tournamentIdBytes.set(encoded.slice(0, 32));

      const escrow = await invokeContractRead(
        CONTRACT_ADDRESSES.rewardsVault,
        'get_tournament',
        [nativeToScVal(tournamentIdBytes, { type: 'bytes' })]
      ) as TournamentEscrow | null;

      return escrow;
    } catch (err) {
      console.error('Failed to get tournament escrow:', err);
      return null;
    }
  }, [invokeContractRead]);

  // ============================================
  // RESULTS ATTESTATION METHODS
  // ============================================

  const getMatchAttestation = useCallback(async (matchId: string): Promise<MatchAttestation | null> => {
    try {
      if (!CONTRACT_ADDRESSES.resultsAttestation) return null;

      const matchIdBytes = new Uint8Array(32);
      const encoder = new TextEncoder();
      const encoded = encoder.encode(matchId);
      matchIdBytes.set(encoded.slice(0, 32));

      const attestation = await invokeContractRead(
        CONTRACT_ADDRESSES.resultsAttestation,
        'get_match',
        [nativeToScVal(matchIdBytes, { type: 'bytes' })]
      ) as MatchAttestation | null;

      return attestation;
    } catch (err) {
      console.error('Failed to get match attestation:', err);
      return null;
    }
  }, [invokeContractRead]);

  const verifyResult = useCallback(async (matchId: string, resultHash: string): Promise<boolean> => {
    try {
      if (!CONTRACT_ADDRESSES.resultsAttestation) return false;

      const matchIdBytes = new Uint8Array(32);
      const encoder = new TextEncoder();
      matchIdBytes.set(encoder.encode(matchId).slice(0, 32));

      const resultHashBytes = new Uint8Array(32);
      resultHashBytes.set(encoder.encode(resultHash).slice(0, 32));

      const isValid = await invokeContractRead(
        CONTRACT_ADDRESSES.resultsAttestation,
        'verify_result',
        [
          nativeToScVal(matchIdBytes, { type: 'bytes' }),
          nativeToScVal(resultHashBytes, { type: 'bytes' }),
        ]
      ) as boolean;

      return isValid;
    } catch (err) {
      console.error('Failed to verify result:', err);
      return false;
    }
  }, [invokeContractRead]);

  const fileDispute = useCallback(async (matchId: string, reasonHash: string): Promise<number | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const challenger = getStellarAddress();
      if (!challenger) {
        throw new Error('No Stellar wallet connected');
      }

      const matchIdBytes = new Uint8Array(32);
      const reasonHashBytes = new Uint8Array(32);
      const encoder = new TextEncoder();
      matchIdBytes.set(encoder.encode(matchId).slice(0, 32));
      reasonHashBytes.set(encoder.encode(reasonHash).slice(0, 32));

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.resultsAttestation,
        'file_dispute',
        [
          nativeToScVal(challenger, { type: 'address' }),
          nativeToScVal(matchIdBytes, { type: 'bytes' }),
          nativeToScVal(reasonHashBytes, { type: 'bytes' }),
        ]
      );

      toast.success('Dispute filed successfully');
      // Note: The actual dispute ID is returned from the contract
      return txHash ? 1 : null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to file dispute';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  // ============================================
  // COMPUTE CREDITS METHODS
  // ============================================

  const buyCredits = useCallback(async (packageId: number): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const buyer = getStellarAddress();
      if (!buyer) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.computeCredits,
        'buy_credits',
        [
          nativeToScVal(buyer, { type: 'address' }),
          nativeToScVal(packageId, { type: 'u32' }),
        ]
      );

      toast.success('Credits purchased!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to buy credits';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const getCreditsBalance = useCallback(async (address?: string): Promise<bigint> => {
    try {
      const targetAddress = address || getStellarAddress();
      if (!targetAddress) return BigInt(0);

      if (!CONTRACT_ADDRESSES.computeCredits) return BigInt(0);

      const balance = await invokeContractRead(
        CONTRACT_ADDRESSES.computeCredits,
        'get_balance',
        [nativeToScVal(targetAddress, { type: 'address' })]
      ) as bigint;

      return balance || BigInt(0);
    } catch (err) {
      console.error('Failed to get credits balance:', err);
      return BigInt(0);
    }
  }, [getStellarAddress, invokeContractRead]);

  const spendCredits = useCallback(async (amount: bigint, description: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const user = getStellarAddress();
      if (!user) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.computeCredits,
        'spend_credits',
        [
          nativeToScVal(user, { type: 'address' }),
          nativeToScVal(amount, { type: 'i128' }),
          nativeToScVal(description, { type: 'string' }),
        ]
      );

      toast.success('Credits spent successfully');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to spend credits';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const getCreditPackages = useCallback(async (): Promise<CreditPackage[]> => {
    try {
      if (!CONTRACT_ADDRESSES.computeCredits) return [];

      const packages = await invokeContractRead(
        CONTRACT_ADDRESSES.computeCredits,
        'get_all_packages',
        []
      ) as CreditPackage[];

      return packages || [];
    } catch (err) {
      console.error('Failed to get credit packages:', err);
      return [];
    }
  }, [invokeContractRead]);

  // ============================================
  // HOST REWARDS METHODS
  // ============================================

  const registerHost = useCallback(async (stakeAmount: bigint): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const host = getStellarAddress();
      if (!host) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.hostRewards,
        'register_host',
        [
          nativeToScVal(host, { type: 'address' }),
          nativeToScVal(stakeAmount, { type: 'i128' }),
        ]
      );

      toast.success('Registered as compute host!');
      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to register host';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getStellarAddress, signAndSubmitTransaction]);

  const getHostInfo = useCallback(async (address?: string): Promise<HostProvider | null> => {
    try {
      const targetAddress = address || getStellarAddress();
      if (!targetAddress) return null;

      if (!CONTRACT_ADDRESSES.hostRewards) return null;

      const host = await invokeContractRead(
        CONTRACT_ADDRESSES.hostRewards,
        'get_host',
        [nativeToScVal(targetAddress, { type: 'address' })]
      ) as HostProvider | null;

      return host;
    } catch (err) {
      console.error('Failed to get host info:', err);
      return null;
    }
  }, [getStellarAddress, invokeContractRead]);

  const hostHeartbeat = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const host = getStellarAddress();
      if (!host) {
        throw new Error('No Stellar wallet connected');
      }

      const txHash = await signAndSubmitTransaction(
        CONTRACT_ADDRESSES.hostRewards,
        'heartbeat',
        [nativeToScVal(host, { type: 'address' })]
      );

      return txHash;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send heartbeat';
      setError(message);
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

    // NFT Pass (NEW)
    mintPass,
    checkPassAccess,
    getUserPasses,

    // Rewards Vault (NEW)
    enterTournamentEscrow,
    getTournamentEscrow,

    // Results Attestation (NEW)
    getMatchAttestation,
    verifyResult,
    fileDispute,

    // Compute Credits (NEW)
    buyCredits,
    getCreditsBalance,
    spendCredits,
    getCreditPackages,

    // Host Rewards (NEW)
    registerHost,
    getHostInfo,
    hostHeartbeat,
  };
};

export default useSorobanContracts;
