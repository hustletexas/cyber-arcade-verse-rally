import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useUserBalance } from '@/hooks/useUserBalance';
import { Copy, Send, ArrowDownToLine, CreditCard, QrCode, ArrowUpDown, RefreshCw } from 'lucide-react';

export const WalletActions = () => {
  const { toast } = useToast();
  const { primaryWallet } = useMultiWallet();
  const { balance } = useUserBalance();
  const [sendAmount, setSendAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [swapFromToken, setSwapFromToken] = useState('CCTR');
  const [swapToToken, setSwapToToken] = useState('SOL');
  const [swapAmount, setSwapAmount] = useState('');
  const [estimatedOutput, setEstimatedOutput] = useState('0');

  // Available tokens for swapping
  const availableTokens = [
    { symbol: 'CCTR', name: 'Cyber City Token', balance: balance.cctr_balance },
    { symbol: 'XLM', name: 'Stellar Lumens', balance: 150.0 },
    { symbol: 'USDC', name: 'USD Coin', balance: 25.00 },
    { symbol: 'PYUSD', name: 'PayPal USD', balance: 50.00 },
    { symbol: 'AQUA', name: 'Aqua Network', balance: 500 }
  ];

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const calculateSwapEstimate = (amount: string, fromToken: string, toToken: string) => {
    if (!amount || parseFloat(amount) <= 0) return '0';
    
    // Simple mock exchange rates for demo purposes
    const rates: { [key: string]: number } = {
      'CCTR': 0.045,  // $0.045 per CCTR
      'SOL': 95.00,   // $95 per SOL
      'USDC': 1.00,   // $1 per USDC
      'BONK': 0.000015, // $0.000015 per BONK
      'RAY': 1.85     // $1.85 per RAY
    };

    const fromValue = parseFloat(amount) * rates[fromToken];
    const toAmount = fromValue / rates[toToken];
    return toAmount.toFixed(6);
  };

  const handleSwapAmountChange = (value: string) => {
    setSwapAmount(value);
    const estimate = calculateSwapEstimate(value, swapFromToken, swapToToken);
    setEstimatedOutput(estimate);
  };

  const handleTokenSwap = () => {
    setSwapFromToken(swapToToken);
    setSwapToToken(swapFromToken);
    if (swapAmount) {
      const estimate = calculateSwapEstimate(swapAmount, swapToToken, swapFromToken);
      setEstimatedOutput(estimate);
    }
  };

  const handleExecuteSwap = async () => {
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to swap",
        variant: "destructive",
      });
      return;
    }

    const fromTokenData = availableTokens.find(t => t.symbol === swapFromToken);
    if (!fromTokenData || parseFloat(swapAmount) > fromTokenData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${swapFromToken} to swap`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Swap Initiated",
      description: `Swapping ${swapAmount} ${swapFromToken} for ${estimatedOutput} ${swapToToken}...`,
    });
    // Blockchain swap transaction would go here
  };

  const handleBuy = async () => {
    if (!buyAmount || parseFloat(buyAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount to buy",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Buy Feature",
      description: "Redirecting to payment processor...",
    });
    // Integration with payment processor would go here
  };

  const handleSend = async () => {
    if (!sendAmount || !recipientAddress) {
      toast({
        title: "Missing Information",
        description: "Please enter both amount and recipient address",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(sendAmount) > balance.cctr_balance) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough $CCTR to send",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Transaction Initiated",
      description: `Sending ${sendAmount} $CCTR to ${recipientAddress.slice(0, 8)}...`,
    });
    // Blockchain transaction would go here
  };

  if (!primaryWallet) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Please connect a wallet to access wallet actions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-4 arcade-frame">
          <TabsTrigger value="buy" className="data-[state=active]:bg-neon-green data-[state=active]:text-black">
            <CreditCard size={16} className="mr-2" />
            Buy
          </TabsTrigger>
          <TabsTrigger value="swap" className="data-[state=active]:bg-neon-pink data-[state=active]:text-black">
            <ArrowUpDown size={16} className="mr-2" />
            Swap
          </TabsTrigger>
          <TabsTrigger value="send" className="data-[state=active]:bg-neon-cyan data-[state=active]:text-black">
            <Send size={16} className="mr-2" />
            Send
          </TabsTrigger>
          <TabsTrigger value="receive" className="data-[state=active]:bg-neon-purple data-[state=active]:text-black">
            <ArrowDownToLine size={16} className="mr-2" />
            Receive
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buy" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="text-neon-green flex items-center gap-2">
                <CreditCard size={20} />
                Buy $CCTR Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="buyAmount" className="text-sm font-medium">
                  Amount (USD)
                </Label>
                <Input
                  id="buyAmount"
                  type="number"
                  placeholder="0.00"
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="bg-background/50 border-neon-green"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  ≈ {buyAmount ? (parseFloat(buyAmount) / 0.045).toFixed(0) : '0'} $CCTR
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Payment Methods</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black">
                    Credit Card
                  </Button>
                  <Button variant="outline" className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black">
                    PayPal
                  </Button>
                </div>
              </div>

              <Button onClick={handleBuy} className="cyber-button w-full">
                Buy $CCTR
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swap" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="text-neon-pink flex items-center gap-2">
                <ArrowUpDown size={20} />
                Swap Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* From Token Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">From</Label>
                <div className="flex gap-2">
                  <Select value={swapFromToken} onValueChange={setSwapFromToken}>
                    <SelectTrigger className="w-[120px] bg-background/50 border-neon-pink">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTokens.map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          {token.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={swapAmount}
                    onChange={(e) => handleSwapAmountChange(e.target.value)}
                    className="bg-background/50 border-neon-pink flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Available: {availableTokens.find(t => t.symbol === swapFromToken)?.balance.toLocaleString()} {swapFromToken}
                </p>
              </div>

              {/* Swap Direction Button */}
              <div className="flex justify-center">
                <Button
                  onClick={handleTokenSwap}
                  variant="outline"
                  size="sm"
                  className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-black rounded-full w-10 h-10 p-0"
                >
                  <RefreshCw size={16} />
                </Button>
              </div>

              {/* To Token Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">To</Label>
                <div className="flex gap-2">
                  <Select value={swapToToken} onValueChange={setSwapToToken}>
                    <SelectTrigger className="w-[120px] bg-background/50 border-neon-pink">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTokens.filter(t => t.symbol !== swapFromToken).map((token) => (
                        <SelectItem key={token.symbol} value={token.symbol}>
                          {token.symbol}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex-1 bg-background/50 border border-neon-pink rounded-md px-3 py-2 text-neon-green">
                    ≈ {estimatedOutput}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Balance: {availableTokens.find(t => t.symbol === swapToToken)?.balance.toLocaleString()} {swapToToken}
                </p>
              </div>

              {/* Swap Details */}
              {swapAmount && parseFloat(swapAmount) > 0 && (
                <div className="bg-muted/20 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Exchange Rate:</span>
                    <span className="text-neon-cyan">1 {swapFromToken} ≈ {calculateSwapEstimate('1', swapFromToken, swapToToken)} {swapToToken}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Network Fee:</span>
                    <span className="text-yellow-400">~0.0001 SOL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Slippage Tolerance:</span>
                    <span className="text-neon-purple">0.5%</span>
                  </div>
                </div>
              )}

              <Button onClick={handleExecuteSwap} className="cyber-button w-full">
                <ArrowUpDown className="mr-2" size={16} />
                Execute Swap
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="text-neon-cyan flex items-center gap-2">
                <Send size={20} />
                Send Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipientAddress" className="text-sm font-medium">
                  Recipient Address
                </Label>
                <Input
                  id="recipientAddress"
                  type="text"
                  placeholder="Enter wallet address..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="bg-background/50 border-neon-cyan"
                />
              </div>

              <div>
                <Label htmlFor="sendAmount" className="text-sm font-medium">
                  Amount ($CCTR)
                </Label>
                <Input
                  id="sendAmount"
                  type="number"
                  placeholder="0"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-background/50 border-neon-cyan"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {balance.cctr_balance.toLocaleString()} $CCTR
                </p>
              </div>

              <Button onClick={handleSend} className="cyber-button w-full">
                Send Tokens
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receive" className="space-y-4">
          <Card className="holographic">
            <CardHeader>
              <CardTitle className="text-neon-purple flex items-center gap-2">
                <ArrowDownToLine size={20} />
                Receive Tokens
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="bg-white p-4 rounded-lg inline-block mb-4">
                  <QrCode size={120} className="text-black" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Scan QR code or copy address below
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium">Your Wallet Address</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-neon-purple bg-background/50 px-3 py-2 rounded flex-1 text-sm">
                    {primaryWallet.address}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(primaryWallet.address, 'Wallet address')}
                    className="border-neon-purple text-neon-purple hover:bg-neon-purple hover:text-black"
                  >
                    <Copy size={14} />
                  </Button>
                </div>
              </div>

              <div className="bg-muted/20 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> Only send Stellar-based tokens to this address. 
                  Sending tokens from other networks may result in permanent loss.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
