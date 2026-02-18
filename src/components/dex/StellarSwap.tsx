import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowDownUp, Loader2, RefreshCw } from 'lucide-react';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { useToast } from '@/hooks/use-toast';

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

// Mock exchange rates (in production, fetch from Stellar DEX or API)
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  XLM: { USDC: 0.09, PYUSD: 0.09, XLM: 1 },
  USDC: { XLM: 11.11, PYUSD: 1, USDC: 1 },
  PYUSD: { XLM: 11.11, USDC: 1, PYUSD: 1 },
};

interface StellarSwapProps {
  compact?: boolean;
}

export const StellarSwap: React.FC<StellarSwapProps> = ({ compact = false }) => {
  const { primaryWallet, isWalletConnected, connectedWallets } = useMultiWallet();
  const { getStellarAssets, refreshBalances: refreshWalletBalances } = useWalletBalances(connectedWallets);
  const { toast } = useToast();

  // Build tokens with real balances from connected wallet
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
  const [toAmount, setToAmount] = useState<string>('');
  const [isSwapping, setIsSwapping] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Keep fromToken/toToken balances in sync with wallet
  useEffect(() => {
    const updatedFrom = tokensWithBalances.find(t => t.symbol === fromToken.symbol);
    const updatedTo = tokensWithBalances.find(t => t.symbol === toToken.symbol);
    if (updatedFrom) setFromToken(updatedFrom);
    if (updatedTo) setToToken(updatedTo);
  }, [tokensWithBalances]);

  // Calculate output amount based on exchange rate
  useEffect(() => {
    if (fromAmount && !isNaN(parseFloat(fromAmount))) {
      const rate = EXCHANGE_RATES[fromToken.symbol][toToken.symbol];
      const output = parseFloat(fromAmount) * rate;
      setToAmount(output.toFixed(4));
    } else {
      setToAmount('');
    }
  }, [fromAmount, fromToken, toToken]);

  const handleSwapTokens = () => {
    const temp = fromToken;
    setFromToken(toToken);
    setToToken(temp);
    setFromAmount(toAmount);
  };

  const handleFromTokenChange = (symbol: string) => {
    const token = tokensWithBalances.find(t => t.symbol === symbol);
    if (token) {
      if (token.symbol === toToken.symbol) {
        setToToken(fromToken);
      }
      setFromToken(token);
    }
  };

  const handleToTokenChange = (symbol: string) => {
    const token = tokensWithBalances.find(t => t.symbol === symbol);
    if (token) {
      if (token.symbol === fromToken.symbol) {
        setFromToken(toToken);
      }
      setToToken(token);
    }
  };

  const refreshRates = async () => {
    setIsRefreshing(true);
    await refreshWalletBalances();
    setIsRefreshing(false);
    toast({
      title: "Rates Refreshed",
      description: "Exchange rates and balances have been updated.",
    });
  };

  const handleSwap = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your Stellar wallet to swap tokens.",
        variant: "destructive"
      });
      return;
    }

    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap.",
        variant: "destructive"
      });
      return;
    }

    setIsSwapping(true);
    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Swap Successful! ✦",
        description: `Swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`,
      });
      
      setFromAmount('');
      setToAmount('');
    } catch (error) {
      toast({
        title: "Swap Failed",
        description: "Transaction failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const rate = EXCHANGE_RATES[fromToken.symbol][toToken.symbol];

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
              Stellar Network
            </Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* From Token */}
        <div className="bg-black/50 rounded-xl p-4 border border-neon-purple/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">From</span>
            {isWalletConnected && (
              <span className="text-xs text-muted-foreground">
                Balance: {fromToken.balance.toFixed(2)} {fromToken.symbol}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
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

        {/* Swap Button */}
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
            <span className="text-sm text-muted-foreground">To</span>
            {isWalletConnected && (
              <span className="text-xs text-muted-foreground">
                Balance: {toToken.balance.toFixed(2)} {toToken.symbol}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <Input
              type="number"
              placeholder="0.00"
              value={toAmount}
              readOnly
              className="flex-1 bg-transparent border-none text-2xl font-bold text-neon-green placeholder:text-neon-green/30 focus-visible:ring-0"
            />
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

        {/* Exchange Rate */}
        <div className="flex justify-between items-center text-sm text-muted-foreground px-2">
          <span>Rate</span>
          <span className="font-mono">
            1 {fromToken.symbol} = {rate.toFixed(4)} {toToken.symbol}
          </span>
        </div>

        {/* Swap Action Button */}
        <Button
          onClick={handleSwap}
          disabled={isSwapping || !fromAmount || parseFloat(fromAmount) <= 0}
          className="w-full h-12 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-pink/80 hover:to-neon-purple/80 text-white font-bold text-lg"
        >
          {isSwapping ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Swapping...
            </>
          ) : !isWalletConnected ? (
            'Connect Wallet to Swap'
          ) : (
            `Swap ${fromToken.symbol} for ${toToken.symbol}`
          )}
        </Button>

        {/* Info */}
        <p className="text-xs text-center text-muted-foreground">
          Swap between XLM, USDC, and PYUSD on the Stellar Network
        </p>
      </CardContent>
    </Card>
  );
};

export default StellarSwap;
