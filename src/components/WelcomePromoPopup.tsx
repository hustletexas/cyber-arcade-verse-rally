import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, ShoppingBag, Sparkles, X, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PROMO_STORAGE_KEY = 'cyberCity_promoSeen';

const WelcomePromoPopup: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = localStorage.getItem(PROMO_STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    localStorage.setItem(PROMO_STORAGE_KEY, 'true');
  };

  const handleShopNow = () => {
    handleClose();
    navigate('/store');
  };

  const handleConnectWallet = () => {
    handleClose();
    // Dispatch a custom event that WalletConnectionModal listens to
    window.dispatchEvent(new CustomEvent('openWalletModal'));
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md p-0 border-0 bg-transparent overflow-hidden [&>button]:hidden">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Animated border glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[hsl(var(--neon-pink))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-cyan))] p-[2px]">
            <div className="w-full h-full rounded-2xl bg-[hsl(var(--dark-bg))]" />
          </div>

          <div className="relative z-10 p-6 space-y-5">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="flex justify-center">
                <div className="relative">
                  <Sparkles className="w-10 h-10 text-[hsl(var(--neon-cyan))] animate-pulse" />
                </div>
              </div>
              <h2 className="font-['Orbitron'] text-xl font-bold text-foreground tracking-wide">
                WELCOME TO THE ARCADE
              </h2>
              <p className="text-sm text-muted-foreground">
                Exclusive rewards for new players
              </p>
            </div>

            {/* Promo Cards */}
            <div className="space-y-3">
              {/* Merch Discount */}
              <div className="group relative rounded-xl border border-[hsl(var(--neon-pink)/0.3)] bg-[hsl(var(--card-bg))] p-4 hover:border-[hsl(var(--neon-pink)/0.6)] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[hsl(var(--neon-pink)/0.15)]">
                    <ShoppingBag className="w-5 h-5 text-[hsl(var(--neon-pink))]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Orbitron'] text-sm font-bold text-foreground">
                      20% OFF MERCH
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Connect a Stellar wallet and unlock <span className="text-[hsl(var(--neon-pink))] font-semibold">20% off</span> all Cyber City apparel — hoodies, tees & more.
                    </p>
                  </div>
                </div>
              </div>

              {/* NFT Giveaway */}
              <div className="group relative rounded-xl border border-[hsl(var(--neon-cyan)/0.3)] bg-[hsl(var(--card-bg))] p-4 hover:border-[hsl(var(--neon-cyan)/0.6)] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[hsl(var(--neon-cyan)/0.15)]">
                    <Gift className="w-5 h-5 text-[hsl(var(--neon-cyan))]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-['Orbitron'] text-sm font-bold text-foreground">
                      FREE NFT AIRDROP
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Every new wallet gets entered into our <span className="text-[hsl(var(--neon-cyan))] font-semibold">weekly NFT giveaway</span> — exclusive collectible badges & arcade passes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-1">
              <Button
                onClick={handleConnectWallet}
                className="w-full font-['Orbitron'] text-sm font-bold bg-gradient-to-r from-[hsl(var(--neon-pink))] to-[hsl(var(--neon-purple))] hover:opacity-90 text-primary-foreground h-11"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet & Claim
              </Button>
              <Button
                onClick={handleShopNow}
                variant="outline"
                className="w-full font-['Orbitron'] text-xs border-[hsl(var(--neon-cyan)/0.4)] text-[hsl(var(--neon-cyan))] hover:bg-[hsl(var(--neon-cyan)/0.1)] h-9"
              >
                Browse Merch Store
              </Button>
              <button
                onClick={handleClose}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePromoPopup;
