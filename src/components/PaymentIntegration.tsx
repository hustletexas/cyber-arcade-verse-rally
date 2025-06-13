
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const PaymentIntegration = () => {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  const handlePayPalPayment = async () => {
    setProcessing(true);
    toast({
      title: "PayPal Payment",
      description: "Redirecting to PayPal...",
    });

    // Simulate PayPal integration
    setTimeout(() => {
      setProcessing(false);
      toast({
        title: "Payment Successful!",
        description: "Your purchase has been completed via PayPal",
      });
    }, 3000);
  };

  const handleCryptoPayment = async () => {
    setProcessing(true);
    toast({
      title: "Crypto Payment",
      description: "Processing SOL payment...",
    });

    // Simulate crypto payment
    setTimeout(() => {
      setProcessing(false);
      toast({
        title: "Crypto Payment Successful!",
        description: "Payment received in SOL",
      });
    }, 2000);
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-2xl text-neon-green flex items-center gap-3">
          💳 PAYMENT OPTIONS
          <Badge className="bg-neon-cyan text-black">SECURE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="holographic p-6 text-center">
            <h3 className="font-bold text-neon-pink mb-4">PayPal Payment</h3>
            <div className="text-4xl mb-4">💳</div>
            <p className="text-sm text-muted-foreground mb-4">
              Pay with PayPal for fiat purchases
            </p>
            <Button 
              onClick={handlePayPalPayment}
              disabled={processing}
              className="cyber-button w-full"
            >
              💰 PAY WITH PAYPAL
            </Button>
          </Card>

          <Card className="holographic p-6 text-center">
            <h3 className="font-bold text-neon-cyan mb-4">Crypto Payment</h3>
            <div className="text-4xl mb-4">🪙</div>
            <p className="text-sm text-muted-foreground mb-4">
              Pay with SOL or USDC
            </p>
            <Button 
              onClick={handleCryptoPayment}
              disabled={processing}
              className="cyber-button w-full"
            >
              ⚡ PAY WITH CRYPTO
            </Button>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};
