import React from 'react';
import { TopBar } from '@/components/TopBar';
import { CyberDropGame } from '@/components/games/CyberDropGame';
import { CartDrawer } from '@/components/CartDrawer';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { WalletStatusBar } from '@/components/WalletStatusBar';

const CyberDropPage = () => {
  return (
    <div className="min-h-screen bg-transparent relative">
      <TopBar />
      <CartDrawer />

      <main className="container mx-auto px-4 pt-24 pb-16">
        {/* Back navigation */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-neon-cyan transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Arcade</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl text-neon-cyan tracking-wider mb-2">
            CYBER DROP
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Drop a chip through the Plinko board and earn points! One free drop per day.
          </p>
        </div>

        {/* Wallet Status */}
        <div className="max-w-md mx-auto mb-6">
          <WalletStatusBar />
        </div>

        {/* Game - full width */}
        <div className="max-w-4xl mx-auto">
          <CyberDropGame />
        </div>
      </main>
    </div>
  );
};

export default CyberDropPage;
