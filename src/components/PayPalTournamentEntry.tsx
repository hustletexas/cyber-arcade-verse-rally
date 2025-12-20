import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRenderedRef = useRef(false);

  const renderPayPalButton = useCallback(() => {
    if (!window.paypal || !containerRef.current || buttonsRenderedRef.current) return;

    // Clear container using React-safe method
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    buttonsRenderedRef.current = true;

    window.paypal.Buttons({
      createOrder: (data: unknown, actions: { order: { create: (config: unknown) => Promise<string> } }) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: entryFee.toString()
            },
            description: `Tournament Entry Fee - ${tournamentId}`
          }]
        });
      },
      onApprove: async (data: unknown, actions: { order: { capture: () => Promise<unknown> } }) => {
        setProcessing(true);
        try {
          await actions.order.capture();
          
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
      onError: (err: unknown) => {
        console.error('PayPal error:', err);
        toast({
          title: "Payment Error",
          description: "An error occurred during payment processing",
          variant: "destructive"
        });
      }
    }).render(`#paypal-container-${tournamentId}`);
  }, [entryFee, tournamentId, onPaymentSuccess, toast]);

  useEffect(() => {
    const loadPayPalScript = () => {
      if (window.paypal) {
        setPaypalLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.paypal.com/sdk/js?client-id=sb';
      script.onload = () => {
        setPaypalLoaded(true);
      };
      document.body.appendChild(script);

      return () => {
        // Cleanup on unmount
        buttonsRenderedRef.current = false;
      };
    };

    loadPayPalScript();
  }, []);

  useEffect(() => {
    if (paypalLoaded && containerRef.current) {
      renderPayPalButton();
    }
  }, [paypalLoaded, renderPayPalButton]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      buttonsRenderedRef.current = false;
    };
  }, []);

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
              <div ref={containerRef} id={`paypal-container-${tournamentId}`} className="min-h-[45px]" />
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

