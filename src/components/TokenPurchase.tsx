
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, DollarSign, Coins } from 'lucide-react';

export const TokenPurchase = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<string>('paypal');
  const [processing, setProcessing] = useState(false);

  const tokenPrice = 0.045; // $0.045 per CCTR token

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase tokens",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          amount: amount,
          payment_method: paymentMethod,
          payment_currency: paymentMethod === 'usdc' ? 'USDC' : 'USD'
        }
      });

      if (error) throw error;

      // Open payment URL in new tab
      if (data.payment_url) {
        window.open(data.payment_url, '_blank');
      }

      toast({
        title: "💳 Payment Initiated",
        description: `Redirecting to ${paymentMethod.toUpperCase()} for ${amount.toLocaleString()} $CCTR tokens`,
      });

    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { value: 'paypal', label: '💳 PayPal', icon: '💳' },
    { value: 'usdc', label: '🪙 USDC', icon: '🪙' }
  ];

  const presetAmounts = [500, 1000, 2500, 5000, 10000];

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-green flex items-center gap-3">
          💰 BUY $CCTR TOKENS
          <Badge className="bg-neon-cyan text-black">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Purchase Form */}
          <div className="space-y-6">
            <div className="bg-black/30 rounded-lg p-6 border border-neon-purple/30">
              <h3 className="font-bold text-neon-cyan mb-4">📊 Token Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Token Price:</span>
                  <span className="text-neon-green font-bold">${tokenPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network:</span>
                  <span className="text-neon-purple font-bold">Solana</span>
                </div>
                <div className="flex justify-between">
                  <span>Contract:</span>
                  <span className="text-neon-cyan font-mono text-xs">CCTR...xyz</span>
                </div>
              </div>
            </div>

            {/* Amount Selection */}
            <div className="space-y-4">
              <h3 className="font-bold text-neon-pink">Amount to Purchase</h3>
              <div className="grid grid-cols-3 gap-2">
                {presetAmounts.map((preset) => (
                  <Button
                    key={preset}
                    variant={amount === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAmount(preset)}
                    className={amount === preset ? "cyber-button" : "border-neon-cyan text-neon-cyan"}
                  >
                    {preset.toLocaleString()}
                  </Button>
                ))}
              </div>
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                placeholder="Custom amount"
                min="1"
                className="text-center text-lg font-bold"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-4">
              <h3 className="font-bold text-neon-pink">Payment Method</h3>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Purchase Summary */}
            <div className="bg-black/50 rounded-lg p-4 border border-neon-green/30">
              <h4 className="font-bold text-neon-green mb-3">💰 Purchase Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tokens:</span>
                  <span className="text-neon-cyan font-bold">{amount.toLocaleString()} $CCTR</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Cost:</span>
                  <span className="text-neon-green font-bold">
                    ${(amount * tokenPrice).toFixed(2)} {paymentMethod === 'usdc' ? 'USDC' : 'USD'}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Gas Fees:</span>
                  <span>Included</span>
                </div>
              </div>
            </div>

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={processing || !amount || !user}
              className="w-full cyber-button text-lg py-6"
            >
              {processing ? (
                "💳 Processing..."
              ) : !user ? (
                "🔐 LOGIN TO PURCHASE"
              ) : (
                `💰 BUY ${amount.toLocaleString()} $CCTR`
              )}
            </Button>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="vending-machine p-6">
              <h3 className="font-display text-xl text-neon-cyan mb-4">💡 Why Buy $CCTR?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-neon-green text-xl">🎮</span>
                  <div>
                    <h4 className="font-bold text-neon-pink">Tournament Entry</h4>
                    <p className="text-sm text-muted-foreground">
                      Enter exclusive gaming tournaments with $CCTR entry fees
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-neon-purple text-xl">🎫</span>
                  <div>
                    <h4 className="font-bold text-neon-pink">Raffle Tickets</h4>
                    <p className="text-sm text-muted-foreground">
                      Purchase raffle tickets for exclusive prizes and NFTs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-neon-cyan text-xl">🛒</span>
                  <div>
                    <h4 className="font-bold text-neon-pink">Marketplace</h4>
                    <p className="text-sm text-muted-foreground">
                      Buy and sell NFTs and in-game items
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-neon-pink text-xl">💎</span>
                  <div>
                    <h4 className="font-bold text-neon-pink">Staking Rewards</h4>
                    <p className="text-sm text-muted-foreground">
                      Stake $CCTR to earn passive rewards (Coming Soon)
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="holographic p-6">
              <h3 className="font-display text-xl text-neon-pink mb-4">🔒 Security Features</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-neon-green">✅</span>
                  <span className="text-sm">Secure PayPal Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-green">✅</span>
                  <span className="text-sm">USDC Cryptocurrency Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-green">✅</span>
                  <span className="text-sm">Instant Token Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neon-green">✅</span>
                  <span className="text-sm">24/7 Customer Support</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
