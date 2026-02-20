import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowDownUp, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { useStellarSwap } from '@/hooks/useStellarSwap';
import { useToast } from '@/hooks/use-toast';
import { getTransactionExplorerUrl } from '@/config/stellar';

interface Token {
  symbol: string;
  name: string;
  icon: string;
  balance: number;
}

const SUPPORTED_TOKENS: Token[] = [
  { symbol: 'XLM', name: 'Stellar Lumens', icon: '✦', balance: 0 },
  { symbol: 'USDC', name: 'USD Coin', icon: '💵', balance: 0 },
  { symbol: 'PYUSD', name: 'PayPal USD', icon: '🅿️', balance: 0 },
];

interface StellarSwapProps {
  compact?: boolean;
}

export const StellarSwap: React.FC<StellarSwapProps> = ({ compact = false }) => {
  const { primaryWallet, isWalletConnected, connectedWallets } = useMultiWallet();
  const { getStellarAssets, refreshBalances: refreshWalletBalances } = useWalletBalances(connectedWallets);
  const { fetchQuote, executeSwap, quote, isFetchingQuote, isSwapping } = useStellarSwap();
  const { toast } = useToast();

  const tokensWithBalances = useMemo(() => {
    if (!primaryWallet?.address) return SUPPORTED_TOKENS;
    const assets = getStellarAssets(primaryWallet.address);
    return SUPPORTED_TOKENS.map(token => {
      const match = assets.find(a => a.code === token.symbol);
      return { ...token, balance: match?.balance ?? 0 };
    });
  }, [primaryWallet?.address, getStellarAssets]);

  const [fromToken, setFromToken] = useState<Token>(SUPPORTED_TOKENS[0]);
  const [toToken, setToToken] = useState<Token>(SUPPORTED_TOKENS[1]);
  const [fromAmount, setFromAmount] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const quoteTimeout = useRef<NodeJS.Timeout | null>(null);

  // Keep balances in sync
  useEffect(() => {
    const updatedFrom = tokensWithBalances.find(t => t.symbol === fromToken.symbol);
    const updatedTo = tokensWithBalances.find(t => t.symbol === toToken.symbol);
    if (updatedFrom) setFromToken(updatedFrom);
    if (updatedTo) setToToken(updatedTo);
  }, [tokensWithBalances]);

  // Debounced quote fetch from Stellar DEX
  useEffect(() => {
    if (quoteTimeout.current) clearTimeout(quoteTimeout.current);

    if (!fromAmount || parseFloat(fromAmount) <= 0 || fromToken.symbol === toToken.symbol) {
      return;
    }

    quoteTimeout.current = setTimeout(() => {
      fetchQuote(fromToken.symbol, toToken.symbol, fromAmount);
    }, 500);

    return () => {
      if (quoteTimeout.current) clearTimeout(quoteTimeout.current);
    };
  }, [fromAmount, fromToken.symbol, toToken.symbol, fetchQuote]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount('');
    setLastTxHash(null);
  };

  const handleFromTokenChange = (symbol: string) => {
    const token = tokensWithBalances.find(t => t.symbol === symbol);
    if (token) {
      if (token.symbol === toToken.symbol) setToToken(fromToken);
      setFromToken(token);
      setLastTxHash(null);
    }
  };

  const handleToTokenChange = (symbol: string) => {
    const token = tokensWithBalances.find(t => t.symbol === symbol);
    if (token) {
      if (token.symbol === fromToken.symbol) setFromToken(toToken);
      setToToken(token);
      setLastTxHash(null);
    }
  };

  const refreshRates = async () => {
    setIsRefreshing(true);
    await refreshWalletBalances();
    if (fromAmount && parseFloat(fromAmount) > 0) {
      await fetchQuote(fromToken.symbol, toToken.symbol, fromAmount);
    }
    setIsRefreshing(false);
    toast({
      title: "Refreshed",
      description: "Balances and rates updated from network.",
    });
  };

  const handleSwap = async () => {
    if (!isWalletConnected) {
      toast({ title: "Wallet Required", description: "Connect your Stellar wallet to swap.", variant: "destructive" });
      return;
    }
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({ title: "Invalid Amount", description: "Enter a valid amount.", variant: "destructive" });
      return;
    }
    if (!quote) {
      toast({ title: "No Route", description: "No swap path found. Try a different pair or amount.", variant: "destructive" });
      return;
    }
    if (parseFloat(fromAmount) > fromToken.balance) {
      toast({ title: "Insufficient Balance", description: `You only have ${fromToken.balance.toFixed(4)} ${fromToken.symbol}.`, variant: "destructive" });
      return;
    }

    try {
      const txHash = await executeSwap(
        fromToken.symbol,
        toToken.symbol,
        fromAmount,
        quote.destAmount,
        quote.path,
      );

      setLastTxHash(txHash);
      toast({
        title: "Swap Successful! ✦",
        description: `Swapped ${fromAmount} ${fromToken.symbol} → ${parseFloat(quote.destAmount).toFixed(4)} ${toToken.symbol}`,
      });
      setFromAmount('');
      await refreshWalletBalances();
    } catch (error: any) {
      console.error('Swap failed:', error);
      toast({
        title: "Swap Failed",
        description: error.message || "Transaction was rejected or failed.",
        variant: "destructive",
      });
    }
  };

  const displayDestAmount = quote?.destAmount
    ? parseFloat(quote.destAmount).toFixed(4)
    : '';

  const displayRate = quote && fromAmount && parseFloat(fromAmount) > 0
    ? (parseFloat(quote.destAmount) / parseFloat(fromAmount)).toFixed(6)
    : null;

  return (
    <Card className={`arcade-frame ${compact ? '' : 'max-w-md mx-auto'}`}>
      {!compact && (
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-display text-xl text-neon-pink flex items-center gap-2">
            <ArrowDownUp className="w-5 h-5" />
            Stellar Swap
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={refreshRates}
              disabled={isRefreshing}
              className="text-neon-cyan hover:text-neon-cyan/80"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Badge className="bg-neon-cyan text-black">
              ✦ On-Chain DEX
            </Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="bg-black/50 rounded-xl p-4 border border-neon-purple/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">You send</span>
            {isWalletConnected && (
              <button
                onClick={() => setFromAmount(fromToken.balance.toFixed(7))}
                className="text-xs text-muted-foreground hover:text-neon-cyan transition-colors"
              >
                Balance: {fromToken.balance.toFixed(2)} {fromToken.symbol}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => {
                setFromAmount(e.target.value);
                setLastTxHash(null);
              }}
              className="flex-1 bg-transparent border-none text-2xl font-bold text-neon-cyan placeholder:text-neon-cyan/30 focus-visible:ring-0"
            />
            <select
              value={fromToken.symbol}
              onChange={(e) => handleFromTokenChange(e.target.value)}
              className="bg-neon-purple/20 border border-neon-purple/50 rounded-lg px-3 py-2 text-neon-purple font-bold cursor-pointer hover:bg-neon-purple/30 transition-colors"
            >
              {SUPPORTED_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol} className="bg-black text-neon-purple">
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Direction */}
        <div className="flex justify-center -my-2 relative z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapTokens}
            className="rounded-full border-2 border-neon-pink bg-black hover:bg-neon-pink/20 hover:border-neon-pink"
          >
            <ArrowDownUp className="w-4 h-4 text-neon-pink" />
          </Button>
        </div>

        {/* To Token */}
        <div className="bg-black/50 rounded-xl p-4 border border-neon-cyan/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">You receive</span>
            {isWalletConnected && (
              <span className="text-xs text-muted-foreground">
                Balance: {toToken.balance.toFixed(2)} {toToken.symbol}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center">
              {isFetchingQuote ? (
                <Loader2 className="w-5 h-5 animate-spin text-neon-green/50" />
              ) : (
                <span className="text-2xl font-bold text-neon-green">
                  {displayDestAmount || '0.00'}
                </span>
              )}
            </div>
            <select
              value={toToken.symbol}
              onChange={(e) => handleToTokenChange(e.target.value)}
              className="bg-neon-cyan/20 border border-neon-cyan/50 rounded-lg px-3 py-2 text-neon-cyan font-bold cursor-pointer hover:bg-neon-cyan/30 transition-colors"
            >
              {SUPPORTED_TOKENS.map(token => (
                <option key={token.symbol} value={token.symbol} className="bg-black text-neon-cyan">
                  {token.icon} {token.symbol}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Rate from DEX */}
        <div className="flex justify-between items-center text-sm text-muted-foreground px-2">
          <span>Rate {isFetchingQuote && <Loader2 className="inline w-3 h-3 animate-spin ml-1" />}</span>
          <span className="font-mono">
            {displayRate
              ? `1 ${fromToken.symbol} ≈ ${displayRate} ${toToken.symbol}`
              : '—'
            }
          </span>
        </div>

        {/* Slippage info */}
        <div className="flex justify-between items-center text-xs text-muted-foreground/60 px-2">
          <span>Slippage tolerance</span>
          <span className="font-mono">1%</span>
        </div>

        {/* Swap Action Button */}
        <Button
          onClick={handleSwap}
          disabled={isSwapping || isFetchingQuote || !fromAmount || parseFloat(fromAmount) <= 0 || !quote}
          className="w-full h-12 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-bold text-lg"
        >
          {isSwapping ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Signing & Submitting...
            </>
          ) : !isWalletConnected ? (
            'Connect Wallet to Swap'
          ) : !quote && fromAmount && parseFloat(fromAmount) > 0 ? (
            'No Route Found'
          ) : (
            `Swap ${fromToken.symbol} → ${toToken.symbol}`
          )}
        </Button>

        {/* Last transaction link */}
        {lastTxHash && (
          <a
            href={getTransactionExplorerUrl(lastTxHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 text-xs text-neon-cyan hover:text-neon-cyan/80 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View transaction on Stellar Expert
          </a>
        )}

        {/* Micro-protections */}
        <div className="space-y-1 mt-1">
          <p className="text-[9px] text-center text-muted-foreground/70 leading-tight">
            Swaps are executed directly on the Stellar network. Cyber City Arcade does not custody funds.
          </p>
          <p className="text-[9px] text-center text-muted-foreground/50 leading-tight">
            Rates are determined by on-chain liquidity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default StellarSwap;
