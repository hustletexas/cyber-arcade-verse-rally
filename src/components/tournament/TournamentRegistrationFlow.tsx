import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, Wallet, Shield, DollarSign, CheckCircle, 
  AlertCircle, Loader2, ArrowRight, CreditCard, Coins, Sparkles
} from 'lucide-react';
import { Tournament } from '@/types/tournament';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useTournamentRegistrations } from '@/hooks/useTournaments';
import { useSeasonPass } from '@/hooks/useSeasonPass';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TournamentRegistrationFlowProps {
  tournament: Tournament;
  onSuccess: () => void;
  onCancel: () => void;
}

type RegistrationStep = 'payment' | 'confirm' | 'complete';

export const TournamentRegistrationFlow: React.FC<TournamentRegistrationFlowProps> = ({
  tournament,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { primaryWallet, isWalletConnected } = useMultiWallet();
  const { registerForTournament, loading } = useTournamentRegistrations();
  const { hasPass: hasSeasonPass, isLoading: isPassLoading } = useSeasonPass();
  
  const [step, setStep] = useState<RegistrationStep>('payment');
  const [paymentMethod, setPaymentMethod] = useState<'usdc' | 'stripe'>('usdc');
  const [error, setError] = useState<string | null>(null);
  const [processingStripe, setProcessingStripe] = useState(false);

  const fullPrice = tournament.entry_fee_usd;
  const discountedPrice = Math.round(fullPrice * 50) / 100; // 50% off
  const walletPrice = hasSeasonPass ? discountedPrice : fullPrice;
  const cardPrice = fullPrice; // Credit card always full price

  const getEffectivePrice = () => {
    if (paymentMethod === 'usdc') return walletPrice;
    return cardPrice;
  };

  const handleStripePayment = async () => {
    setProcessingStripe(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('create-payment', {
        body: {
          tournament_id: tournament.id,
          tournament_title: tournament.title,
          amount: cardPrice,
          wallet_address: primaryWallet?.address || null,
          type: 'tournament_entry'
        }
      });

      if (fnError) throw fnError;
      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: 'Redirecting to Checkout',
          description: 'Complete your payment in the new tab. Return here when done.',
        });
        // Don't close modal yet — user might return
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create checkout session');
    } finally {
      setProcessingStripe(false);
    }
  };

  const handleWalletPayment = async () => {
    if (!primaryWallet?.address) {
      setError('Please connect your Stellar wallet first');
      return;
    }
    
    setError(null);
    const result = await registerForTournament(
      tournament.id,
      primaryWallet.address,
      'usdc'
    );
    
    if (result) {
      setStep('complete');
      setTimeout(onSuccess, 2000);
    }
  };

  const handleConfirm = async () => {
    if (paymentMethod === 'stripe') {
      await handleStripePayment();
    } else {
      await handleWalletPayment();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'payment':
        return (
          <div className="space-y-5">
            {/* Tournament Summary */}
            <div className="text-center">
              <Trophy className="w-10 h-10 mx-auto text-neon-pink mb-2" />
              <h3 className="text-lg font-display text-neon-pink">{tournament.title}</h3>
              <p className="text-sm text-muted-foreground">{tournament.game}</p>
            </div>

            {/* Season Pass Discount Banner */}
            {hasSeasonPass && fullPrice > 0 && (
              <div className="p-3 bg-neon-green/10 rounded-lg border border-neon-green/30 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-neon-green flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-neon-green">Season Pass Holder — 50% OFF with Wallet!</p>
                  <p className="text-xs text-muted-foreground">Pay ${walletPrice.toFixed(2)} instead of ${fullPrice.toFixed(2)} with USDC</p>
                </div>
              </div>
            )}

            {!hasSeasonPass && !isPassLoading && fullPrice > 0 && (
              <div className="p-3 bg-neon-purple/10 rounded-lg border border-neon-purple/30 flex items-center gap-3">
                <Shield className="w-5 h-5 text-neon-purple flex-shrink-0" />
                <div>
                  <p className="text-sm text-neon-purple font-medium">Get a Season Pass for 50% off entry fees!</p>
                  <p className="text-xs text-muted-foreground">Visit the Store to unlock discounted tournament entry</p>
                </div>
              </div>
            )}

            {/* Payment Options */}
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground font-medium">Choose Payment Method</p>
              
              {/* Wallet Payment Option */}
              <button
                onClick={() => setPaymentMethod('usdc')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  paymentMethod === 'usdc' 
                    ? 'border-neon-cyan bg-neon-cyan/10' 
                    : 'border-border hover:border-neon-cyan/50 bg-background/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center">
                      <Coins className="w-5 h-5 text-neon-cyan" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Pay with Stellar Wallet</p>
                      <p className="text-xs text-muted-foreground">USDC on Stellar Network</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {hasSeasonPass && fullPrice > 0 ? (
                      <>
                        <p className="text-lg font-bold text-neon-green">${walletPrice.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground line-through">${fullPrice.toFixed(2)}</p>
                      </>
                    ) : (
                      <p className="text-lg font-bold">${fullPrice > 0 ? fullPrice.toFixed(2) : 'FREE'}</p>
                    )}
                  </div>
                </div>
                {!isWalletConnected && (
                  <p className="text-xs text-yellow-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Connect wallet first via the top bar
                  </p>
                )}
              </button>

              {/* Credit Card Option */}
              <button
                onClick={() => setPaymentMethod('stripe')}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  paymentMethod === 'stripe' 
                    ? 'border-neon-purple bg-neon-purple/10' 
                    : 'border-border hover:border-neon-purple/50 bg-background/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Pay with Credit Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Apple Pay</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">${fullPrice > 0 ? fullPrice.toFixed(2) : 'FREE'}</p>
                    <p className="text-xs text-muted-foreground">Full price</p>
                  </div>
                </div>
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500 text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button 
              onClick={() => {
                if (paymentMethod === 'usdc' && !isWalletConnected) {
                  setError('Please connect your Stellar wallet first using the wallet button in the top bar');
                  return;
                }
                if (fullPrice === 0) {
                  handleConfirm();
                  return;
                }
                setStep('confirm');
              }}
              className="w-full cyber-button"
            >
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        );

      case 'confirm':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Trophy className="w-10 h-10 mx-auto text-neon-pink mb-2" />
              <h3 className="text-lg font-display text-neon-pink">Confirm Registration</h3>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg border border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tournament</span>
                <span className="font-medium">{tournament.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Game</span>
                <span>{tournament.game}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment</span>
                <span>{paymentMethod === 'usdc' ? '🌟 USDC (Stellar)' : '💳 Credit Card'}</span>
              </div>
              <div className="flex justify-between items-center border-t border-border pt-2 mt-2">
                <span className="text-muted-foreground font-medium">Total</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-neon-green">${getEffectivePrice().toFixed(2)}</span>
                  {paymentMethod === 'usdc' && hasSeasonPass && fullPrice > 0 && (
                    <span className="block text-xs text-muted-foreground line-through">${fullPrice.toFixed(2)}</span>
                  )}
                </div>
              </div>
              {paymentMethod === 'usdc' && hasSeasonPass && fullPrice > 0 && (
                <div className="flex items-center gap-1 text-neon-green text-xs">
                  <Sparkles className="w-3 h-3" />
                  Season Pass 50% discount applied
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prize Pool</span>
                <span>${tournament.prize_pool_usd}</span>
              </div>
              {primaryWallet?.address && paymentMethod === 'usdc' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wallet</span>
                  <span className="font-mono text-xs">
                    {primaryWallet.address.slice(0, 8)}...{primaryWallet.address.slice(-4)}
                  </span>
                </div>
              )}
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <Button 
              onClick={handleConfirm} 
              className="w-full cyber-button"
              disabled={loading || processingStripe}
            >
              {loading || processingStripe ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : paymentMethod === 'stripe' ? (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Pay ${getEffectivePrice().toFixed(2)} with Card
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Pay ${getEffectivePrice().toFixed(2)} USDC
                </>
              )}
            </Button>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-neon-green/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-neon-green" />
            </div>
            <h3 className="text-xl font-display text-neon-green">Registration Complete!</h3>
            <p className="text-muted-foreground">
              You're now registered for {tournament.title}. Good luck!
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="arcade-frame max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="font-display text-neon-pink text-center">
          Register for Tournament
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Progress Steps */}
        {step !== 'complete' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {['payment', 'confirm'].map((s, i) => {
              const isActive = step === s;
              const isPast = ['payment', 'confirm'].indexOf(step) > i;
              return (
                <React.Fragment key={s}>
                  <div className={`w-3 h-3 rounded-full ${
                    isActive ? 'bg-neon-pink' : isPast ? 'bg-neon-green' : 'bg-muted'
                  }`} />
                  {i < 1 && <div className={`w-8 h-0.5 ${isPast ? 'bg-neon-green' : 'bg-muted'}`} />}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {renderStep()}

        {step !== 'complete' && (
          <Button 
            variant="ghost" 
            onClick={step === 'confirm' ? () => setStep('payment') : onCancel} 
            className="w-full mt-4"
          >
            {step === 'confirm' ? 'Back' : 'Cancel'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
