import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Mail, Wallet, Zap, Trophy, BarChart3, Shield, Loader2, CheckCircle, ExternalLink } from 'lucide-react';
import { useTieredAuth, AuthTier, GatedFeature } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requiredFeature?: GatedFeature;
  requiredTier?: AuthTier;
}

const TIER_BENEFITS = {
  magic_link: [
    { icon: Trophy, label: 'Ranked play & tournaments' },
    { icon: BarChart3, label: 'Save stats & progress' },
    { icon: Zap, label: 'Earn off-chain credits (CCC)' },
    { icon: Shield, label: 'Community chat access' },
  ],
  wallet: [
    { icon: Wallet, label: 'Claim on-chain rewards' },
    { icon: Shield, label: 'NFT badge ownership verification' },
  ],
};

const FEATURE_LABELS: Partial<Record<GatedFeature, string>> = {
  ranked_play: 'ranked play',
  tournaments: 'tournaments',
  save_stats: 'saving your stats',
  earn_credits: 'earning credits',
  submit_score: 'submitting scores',
  community_chat: 'community chat',
  claim_onchain: 'on-chain claiming',
  nft_badges: 'NFT badge verification',
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  open,
  onOpenChange,
  requiredFeature,
  requiredTier,
}) => {
  const { tier, signInWithMagicLink } = useTieredAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const targetTier = requiredTier || (requiredFeature ? (tier === 'guest' ? 'magic_link' : 'wallet') : 'magic_link');
  const featureLabel = requiredFeature ? FEATURE_LABELS[requiredFeature] : null;

  const handleSendMagicLink = async () => {
    if (!email.trim() || !email.includes('@')) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }
    setSending(true);
    const result = await signInWithMagicLink(email.trim());
    setSending(false);
    if (result.success) {
      setSent(true);
      toast({ title: 'Check your email! 📧', description: 'We sent you a magic link to sign in.' });
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSent(false);
    setEmail('');
  };

  // Show magic link signup for guests
  const showMagicLinkUpgrade = tier === 'guest' && (targetTier === 'magic_link' || targetTier === 'wallet');
  // Show wallet connect for magic_link users
  const showWalletUpgrade = tier === 'magic_link' && targetTier === 'wallet';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-primary/30 bg-background/95 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-accent flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            {showWalletUpgrade ? 'Connect Wallet' : 'Create Your Account'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {featureLabel
              ? `Sign up to unlock ${featureLabel} and more!`
              : 'Upgrade your experience to unlock competitive features.'}
          </DialogDescription>
        </DialogHeader>

        {showMagicLinkUpgrade && !sent && (
          <div className="space-y-5 pt-2">
            {/* Benefits */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground/80">What you'll unlock:</p>
              {TIER_BENEFITS.magic_link.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {/* Email input */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground/80">Quick sign up — no password needed</span>
              </div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMagicLink()}
                className="bg-muted/50 border-primary/30"
                autoFocus
              />
              <Button
                onClick={handleSendMagicLink}
                disabled={sending || !email.trim()}
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-display"
              >
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Mail className="w-4 h-4 mr-2" />}
                {sending ? 'Sending...' : 'Send Magic Link'}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Parent-friendly • No password • Works for all ages
              </p>
            </div>
          </div>
        )}

        {showMagicLinkUpgrade && sent && (
          <div className="text-center space-y-4 py-4">
            <CheckCircle className="w-12 h-12 text-accent mx-auto" />
            <div>
              <p className="font-display text-lg text-foreground">Check your email!</p>
              <p className="text-sm text-muted-foreground mt-1">
                We sent a magic link to <strong className="text-foreground">{email}</strong>
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Click the link in the email to sign in. You can close this modal.
              </p>
            </div>
            <Button variant="outline" onClick={handleClose} className="border-accent text-accent">
              Got it
            </Button>
          </div>
        )}

        {showWalletUpgrade && (
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground/80">Connect a Stellar wallet to:</p>
              {TIER_BENEFITS.wallet.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <Button
                onClick={() => {
                  handleClose();
                  // Trigger wallet connection modal (TopBar wallet button)
                  document.querySelector<HTMLButtonElement>('[data-wallet-connect]')?.click();
                }}
                className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-display"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
              <div className="flex items-center gap-2 justify-center">
                <span className="text-xs text-muted-foreground">Don't have a wallet?</span>
                <a
                  href="https://lobstr.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent hover:underline flex items-center gap-1"
                >
                  Get LOBSTR <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Current tier badge */}
        <div className="flex justify-center pt-2">
          <Badge variant="outline" className="text-xs text-muted-foreground border-muted-foreground/30">
            Current: {tier === 'guest' ? '👤 Guest' : tier === 'magic_link' ? '📧 Signed In' : '🔗 Wallet Connected'}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
};
