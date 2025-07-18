
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface PayPalTournamentEntryProps {
  entryFee: number;
  tournamentId: string;
  onSuccess: () => void;
}

export const PayPalTournamentEntry: React.FC<PayPalTournamentEntryProps> = ({
  entryFee,
  tournamentId,
  onSuccess
}) => {
  const { toast } = useToast();
  const paypalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.paypal && paypalRef.current) {
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
        onApprove: (data: any, actions: any) => {
          return actions.order.capture().then((details: any) => {
            toast({
              title: "Payment Successful!",
              description: `Tournament entry confirmed. Transaction ID: ${details.id}`
            });
            onSuccess();
          });
        },
        onError: (err: any) => {
          console.error('PayPal payment error:', err);
          toast({
            title: "Payment Failed",
            description: "There was an error processing your payment. Please try again.",
            variant: "destructive"
          });
        },
        onCancel: (data: any) => {
          toast({
            title: "Payment Cancelled",
            description: "Payment was cancelled. You can try again anytime.",
            variant: "destructive"
          });
        }
      }).render(paypalRef.current);
    }
  }, [entryFee, tournamentId, onSuccess, toast]);

  return (
    <Card className="arcade-frame">
      <CardHeader>
        <CardTitle className="font-display text-xl text-neon-green">
          💳 PayPal Tournament Entry
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-300 mb-2">Entry Fee:</p>
            <p className="text-2xl font-bold text-neon-green">${entryFee}</p>
          </div>
          
          <div ref={paypalRef} className="w-full"></div>
          
          <p className="text-xs text-gray-400 text-center">
            Secure payment processing powered by PayPal
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
