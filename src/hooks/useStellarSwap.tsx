import { useState, useCallback } from 'react';
import {
  TransactionBuilder,
  Account,
  Operation,
  Asset,
  Networks,
  BASE_FEE,
} from '@stellar/stellar-sdk';
import { StellarWalletsKit, WalletNetwork, allowAllModules, LOBSTR_ID } from '@creit.tech/stellar-wallets-kit';
import freighterApi from '@stellar/freighter-api';
import { STELLAR_NETWORK } from '@/config/stellar';
import { useMultiWallet } from './useMultiWallet';
import { useToast } from '@/hooks/use-toast';

const HORIZON_URL = STELLAR_NETWORK.horizonUrl;
const NETWORK_PASSPHRASE = STELLAR_NETWORK.networkPassphrase;

// Build Asset objects from config
const ASSETS: Record<string, Asset> = {
  XLM: Asset.native(),
  USDC: new Asset(STELLAR_NETWORK.assets.USDC.code, STELLAR_NETWORK.assets.USDC.issuer),
  PYUSD: new Asset(STELLAR_NETWORK.assets.PYUSD.code, STELLAR_NETWORK.assets.PYUSD.issuer),
};

export interface SwapQuote {
  sourceAsset: string;
  destAsset: string;
  sourceAmount: string;
  destAmount: string;
  path: Array<{ asset_code: string; asset_issuer?: string; asset_type: string }>;
}

export const useStellarSwap = () => {
  const { connectedWallets, primaryWallet } = useMultiWallet();
  const { toast } = useToast();
  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [quote, setQuote] = useState<SwapQuote | null>(null);

  // Get wallet type for signing
  const getWalletType = useCallback((): 'freighter' | 'lobstr' | null => {
    const w = connectedWallets.find(w => w.chain === 'stellar' && w.isConnected);
    if (!w) return null;
    return w.type === 'freighter' ? 'freighter' : 'lobstr';
  }, [connectedWallets]);

  // Build Horizon query params for an asset
  const assetParams = (asset: Asset, prefix: string): Record<string, string> => {
    if (asset.isNative()) {
      return { [`${prefix}_asset_type`]: 'native' };
    }
    return {
      [`${prefix}_asset_type`]: 'credit_alphanum4',
      [`${prefix}_asset_code`]: asset.getCode(),
      [`${prefix}_asset_issuer`]: asset.getIssuer(),
    };
  };

  // Fetch a swap quote from Horizon strict-send paths
  const fetchQuote = useCallback(async (
    fromSymbol: string,
    toSymbol: string,
    amount: string,
  ): Promise<SwapQuote | null> => {
    if (!amount || parseFloat(amount) <= 0) {
      setQuote(null);
      return null;
    }

    const address = primaryWallet?.address;
    if (!address) {
      setQuote(null);
      return null;
    }

    const sourceAsset = ASSETS[fromSymbol];
    const destAsset = ASSETS[toSymbol];
    if (!sourceAsset || !destAsset) return null;

    setIsFetchingQuote(true);
    try {
      const params = new URLSearchParams({
        ...assetParams(sourceAsset, 'source'),
        ...assetParams(destAsset, 'destination'),
        source_amount: amount,
        destination_account: address,
      });

      const res = await fetch(`${HORIZON_URL}/paths/strict-send?${params}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error('Horizon paths error:', res.status, errData);
        throw new Error(errData.detail || 'Failed to fetch swap paths');
      }

      const data = await res.json();
      const records = data._embedded?.records;

      if (!records || records.length === 0) {
        setQuote(null);
        return null;
      }

      // Pick the best path (highest destination amount)
      const best = records.reduce((a: any, b: any) =>
        parseFloat(b.destination_amount) > parseFloat(a.destination_amount) ? b : a
      );

      const swapQuote: SwapQuote = {
        sourceAsset: fromSymbol,
        destAsset: toSymbol,
        sourceAmount: amount,
        destAmount: best.destination_amount,
        path: best.path || [],
      };

      setQuote(swapQuote);
      return swapQuote;
    } catch (err) {
      console.error('Quote fetch error:', err);
      setQuote(null);
      return null;
    } finally {
      setIsFetchingQuote(false);
    }
  }, [primaryWallet?.address]);

  // Sign with Freighter
  const signWithFreighter = useCallback(async (txXdr: string): Promise<string> => {
    const signResult = await freighterApi.signTransaction(txXdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    if (signResult.error) {
      throw new Error(signResult.error.message || 'Freighter signing failed');
    }
    return signResult.signedTxXdr;
  }, []);

  // Sign with LOBSTR via Stellar Wallets Kit
  const signWithLobstr = useCallback(async (txXdr: string): Promise<string> => {
    const kit = new StellarWalletsKit({
      network: NETWORK_PASSPHRASE === Networks.TESTNET ? WalletNetwork.TESTNET : WalletNetwork.PUBLIC,
      selectedWalletId: LOBSTR_ID,
      modules: allowAllModules(),
    });
    const { signedTxXdr } = await kit.signTransaction(txXdr);
    return signedTxXdr;
  }, []);

  // Execute the swap: build tx → user signs → submit on-chain
  const executeSwap = useCallback(async (
    fromSymbol: string,
    toSymbol: string,
    amount: string,
    minDestAmount: string,
    pathAssets: Array<{ asset_code: string; asset_issuer?: string; asset_type: string }>,
  ): Promise<string> => {
    const address = primaryWallet?.address;
    if (!address) throw new Error('No wallet connected');

    const walletType = getWalletType();
    if (!walletType) throw new Error('No supported wallet connected');

    setIsSwapping(true);
    try {
      // 1. Load account from Horizon
      const accRes = await fetch(`${HORIZON_URL}/accounts/${address}`);
      if (!accRes.ok) throw new Error('Failed to load account');
      const accData = await accRes.json();
      const account = new Account(address, accData.sequence);

      // 2. Build assets
      const sendAsset = ASSETS[fromSymbol];
      const destAsset = ASSETS[toSymbol];

      // Build path intermediary assets
      const path = pathAssets.map(p => {
        if (p.asset_type === 'native') return Asset.native();
        return new Asset(p.asset_code, p.asset_issuer);
      });

      // Apply 1% slippage tolerance
      const destMin = (parseFloat(minDestAmount) * 0.99).toFixed(7);

      // 3. Build transaction with pathPaymentStrictSend
      const tx = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASSPHRASE,
      })
        .addOperation(
          Operation.pathPaymentStrictSend({
            sendAsset,
            sendAmount: amount,
            destination: address, // swap to self
            destAsset,
            destMin,
            path,
          })
        )
        .setTimeout(300)
        .build();

      const txXdr = tx.toXDR();

      // 4. User signs the transaction
      toast({
        title: '🔐 Sign Transaction',
        description: 'Please approve the swap in your wallet...',
      });

      let signedXdr: string;
      if (walletType === 'freighter') {
        signedXdr = await signWithFreighter(txXdr);
      } else {
        signedXdr = await signWithLobstr(txXdr);
      }

      // 5. Submit to Horizon
      toast({
        title: '⏳ Submitting...',
        description: 'Broadcasting transaction to Stellar network...',
      });

      const submitRes = await fetch(`${HORIZON_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `tx=${encodeURIComponent(signedXdr)}`,
      });

      const submitData = await submitRes.json();

      if (!submitRes.ok) {
        const extras = submitData.extras?.result_codes;
        const opError = extras?.operations?.[0] || extras?.transaction || 'Unknown error';
        throw new Error(`Transaction failed: ${opError}`);
      }

      return submitData.hash;
    } finally {
      setIsSwapping(false);
    }
  }, [primaryWallet, getWalletType, signWithFreighter, signWithLobstr, toast]);

  return {
    fetchQuote,
    executeSwap,
    quote,
    isFetchingQuote,
    isSwapping,
  };
};
