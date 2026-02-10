import React from 'react';
import { TopBar } from '@/components/TopBar';
import PortalBreakerGame from '@/components/games/PortalBreakerGame';
import { CartDrawer } from '@/components/CartDrawer';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CCCBalanceBar } from '@/components/games/CCCBalanceBar';
import { SeasonPassGate } from '@/components/SeasonPassGate';

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

        {/* Header Image */}
        <div className="text-center mb-8">
          <img src="/images/games/cyber-breaker-logo.png" alt="Cyber Breaker" className="max-w-md mx-auto w-full h-auto" />
        </div>

        {/* CCC Balance Bar */}
        <div className="max-w-lg mx-auto mb-6">
          <CCCBalanceBar />
        </div>

        {/* Game - Season Pass Required */}
        <SeasonPassGate featureName="Cyber Breaker">
          <PortalBreakerGame />
        </SeasonPassGate>
      </main>
    </div>
  );
};

export default CyberDropPage;
