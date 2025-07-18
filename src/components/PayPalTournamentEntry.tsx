
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface PayPalTournamentEntryProps {
  tournamentId: string;
  entryFee: number;
  onPaymentSuccess: () => void;
}

export const PayPalTournamentEntry: React.FC<PayPalTournamentEntryProps> = ({
  tournamentId,
  entryFee,
  onPaymentSuccess
}) => {
  const { toast } = useToast();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPayPalScript();
  }, []);

  const loadPayPalScript = () => {
    if (window.paypal) {
      setPaypalLoaded(true);
      renderPayPalButton();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=sb'; // Use sandbox for testing
    script.onload = () => {
      setPaypalLoaded(true);
      renderPayPalButton();
    };
    document.body.appendChild(script);
  };

  const renderPayPalButton = () => {
    if (!window.paypal || !paypalLoaded) return;

    // Clear any existing buttons
    const container = document.getElementById(`paypal-button-${tournamentId}`);
    if (container) {
      container.innerHTML = '';
    }

    window.paypal.Buttons({
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: entryFee.toString()
            },
            description: `Tournament Entry Fee - ${tournamentId}`
          }]
        });
      },
      onApprove: async (data: any, actions: any) => {
        setProcessing(true);
        try {
          const order = await actions.order.capture();
          
          toast({
            title: "Payment Successful!",
            description: "You've successfully paid the tournament entry fee",
          });
          
          onPaymentSuccess();
        } catch (error) {
          toast({
            title: "Payment Failed",
            description: "Failed to process payment. Please try again.",
            variant: "destructive"
          });
        } finally {
          setProcessing(false);
        }
      },
      onError: (err: any) => {
        console.error('PayPal error:', err);
        toast({
          title: "Payment Error",
          description: "An error occurred during payment processing",
          variant: "destructive"
        });
      }
    }).render(`#paypal-button-${tournamentId}`);
  };

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-lg text-neon-green flex items-center gap-2">
          💳 PayPal Entry Payment
          <Badge className="bg-neon-green text-black">${entryFee}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            Pay the tournament entry fee using PayPal to secure your spot.
          </p>
          
          {paypalLoaded ? (
            <div>
              <div id={`paypal-button-${tournamentId}`} className="min-h-[45px]"></div>
              {processing && (
                <div className="text-center text-neon-cyan mt-2">
                  Processing payment...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              Loading PayPal...
            </div>
          )}
          
          <div className="text-xs text-gray-400">
            <p>✅ Secure payment processing</p>
            <p>✅ Instant tournament access</p>
            <p>✅ Full refund if tournament is cancelled</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
