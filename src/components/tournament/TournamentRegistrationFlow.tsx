import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Trophy, Wallet, Shield, DollarSign, CheckCircle, 
  AlertCircle, Loader2, ArrowRight 
} from 'lucide-react';
import { Tournament } from '@/types/tournament';
import { useAuth } from '@/hooks/useAuth';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useTournamentRegistrations } from '@/hooks/useTournaments';
import { useSorobanContracts } from '@/hooks/useSorobanContracts';

interface TournamentRegistrationFlowProps {
  tournament: Tournament;
  onSuccess: () => void;
  onCancel: () => void;
}

type RegistrationStep = 'wallet' | 'pass_check' | 'payment' | 'confirm' | 'complete';

export const TournamentRegistrationFlow: React.FC<TournamentRegistrationFlowProps> = ({
  tournament,
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const { primaryWallet, isWalletConnected, connectWallet } = useMultiWallet();
  const { registerForTournament, loading } = useTournamentRegistrations();
  
  const [step, setStep] = useState<RegistrationStep>('wallet');
  const [passVerified, setPassVerified] = useState(false);
  const [passTier, setPassTier] = useState<string | null>(null);
  const [checkingPass, setCheckingPass] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'usdc' | 'stripe'>('usdc');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isWalletConnected && primaryWallet?.address) {
      if (tournament.requires_pass) {
        setStep('pass_check');
      } else {
        setStep(tournament.entry_fee_usd > 0 ? 'payment' : 'confirm');
      }
    }
  }, [isWalletConnected, primaryWallet, tournament]);

  const handlePassCheck = async () => {
    if (!primaryWallet?.address) return;
    
    setCheckingPass(true);
    setError(null);
    
    try {
      // Simulated pass check - in production this would query Soroban NFT Pass contract
      // For now, simulate a successful verification for demo purposes
      const mockResult = {
        hasPass: true,
        tier: 'gold'
      };
      
      if (mockResult.hasPass) {
        // Check tier requirement
        if (tournament.required_pass_tier) {
          const tierOrder = ['bronze', 'silver', 'gold', 'platinum'];
          const requiredIndex = tierOrder.indexOf(tournament.required_pass_tier);
          const userIndex = tierOrder.indexOf(mockResult.tier || '');
          
          if (userIndex < requiredIndex) {
            setError(`This tournament requires ${tournament.required_pass_tier} tier or higher. You have ${mockResult.tier} tier.`);
            return;
          }
        }
        
        setPassVerified(true);
        setPassTier(mockResult.tier || null);
        setStep(tournament.entry_fee_usd > 0 ? 'payment' : 'confirm');
      } else {
        setError('You do not own a Cyber City Pass NFT. Please mint one to participate.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCheckingPass(false);
    }
  };

  const handleRegister = async () => {
    if (!primaryWallet?.address || !user) return;
    
    setError(null);
    
    const result = await registerForTournament(
      tournament.id,
      primaryWallet.address,
      paymentMethod
    );
    
    if (result) {
      setStep('complete');
      setTimeout(onSuccess, 2000);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'wallet':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Wallet className="w-12 h-12 mx-auto text-neon-cyan mb-4" />
              <h3 className="text-xl font-display text-neon-cyan">Connect Wallet</h3>
              <p className="text-muted-foreground mt-2">
                Connect your Stellar wallet to register
              </p>
            </div>
            
            {isWalletConnected && primaryWallet ? (
              <div className="p-4 bg-neon-green/10 rounded-lg border border-neon-green">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span>Wallet Connected</span>
                </div>
                <p className="font-mono text-sm mt-1">
                  {primaryWallet.address.slice(0, 12)}...{primaryWallet.address.slice(-8)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center">
                Please connect your wallet using the wallet button in the top bar
              </p>
            )}
          </div>
        );

      case 'pass_check':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <Shield className="w-12 h-12 mx-auto text-neon-purple mb-4" />
              <h3 className="text-xl font-display text-neon-purple">Pass Verification</h3>
              <p className="text-muted-foreground mt-2">
                This tournament requires a Cyber City Pass
                {tournament.required_pass_tier && ` (${tournament.required_pass_tier} tier or higher)`}
              </p>
            </div>
            
            {error && (
              <div className="p-4 bg-red-500/10 rounded-lg border border-red-500">
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {passVerified ? (
              <div className="p-4 bg-neon-green/10 rounded-lg border border-neon-green">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                  <span>Pass Verified!</span>
                  {passTier && <Badge className="capitalize">{passTier} Tier</Badge>}
                </div>
              </div>
            ) : (
              <Button 
                onClick={handlePassCheck} 
                className="w-full cyber-button"
                disabled={checkingPass}
              >
                {checkingPass ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking Pass...
                  </>
                ) : (
                  'Verify Pass Ownership'
                )}
              </Button>
            )}
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <DollarSign className="w-12 h-12 mx-auto text-neon-green mb-4" />
              <h3 className="text-xl font-display text-neon-green">Entry Fee</h3>
              <p className="text-2xl font-display mt-2">${tournament.entry_fee_usd}</p>
            </div>
            
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant={paymentMethod === 'usdc' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('usdc')}
                  className={paymentMethod === 'usdc' ? 'cyber-button' : ''}
                >
                  Pay with USDC
                </Button>
                <Button
                  variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('stripe')}
                  className={paymentMethod === 'stripe' ? 'cyber-button' : ''}
                >
                  Pay with Card
                </Button>
              </div>
            </div>
            
            <Button 
              onClick={() => setStep('confirm')} 
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
              <Trophy className="w-12 h-12 mx-auto text-neon-pink mb-4" />
              <h3 className="text-xl font-display text-neon-pink">Confirm Registration</h3>
            </div>
            
            <div className="p-4 bg-background/50 rounded-lg border border-border space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tournament</span>
                <span>{tournament.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Game</span>
                <span>{tournament.game}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entry Fee</span>
                <span>${tournament.entry_fee_usd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prize Pool</span>
                <span>${tournament.prize_pool_usd}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wallet</span>
                <span className="font-mono text-sm">
                  {primaryWallet?.address.slice(0, 8)}...
                </span>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-500/10 rounded-lg border border-red-500 text-red-500 text-sm">
                {error}
              </div>
            )}
            
            <Button 
              onClick={handleRegister} 
              className="w-full cyber-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering...
                </>
              ) : (
                'Confirm Registration'
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
        <div className="flex items-center justify-center gap-2 mb-6">
          {['wallet', 'pass_check', 'payment', 'confirm'].map((s, i) => {
            const isActive = step === s;
            const isPast = ['wallet', 'pass_check', 'payment', 'confirm'].indexOf(step) > i;
            const show = s !== 'pass_check' || tournament.requires_pass;
            const showPayment = s !== 'payment' || tournament.entry_fee_usd > 0;
            
            if (!show || !showPayment) return null;
            
            return (
              <React.Fragment key={s}>
                <div className={`w-3 h-3 rounded-full ${
                  isActive ? 'bg-neon-pink' : isPast ? 'bg-neon-green' : 'bg-muted'
                }`} />
                {i < 3 && <div className={`w-8 h-0.5 ${isPast ? 'bg-neon-green' : 'bg-muted'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        {renderStep()}

        {step !== 'complete' && (
          <Button 
            variant="ghost" 
            onClick={onCancel} 
            className="w-full mt-4"
          >
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
