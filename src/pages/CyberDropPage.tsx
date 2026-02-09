import React from 'react';
import { TopBar } from '@/components/TopBar';
import PortalBreakerGame from '@/components/games/PortalBreakerGame';
import { CartDrawer } from '@/components/CartDrawer';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

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
          <h1 className="font-display text-3xl sm:text-4xl text-purple-300 tracking-wider mb-2">
            PORTAL BREAKER
          </h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Smash through portal shards, catch power-ups, and stabilize the gateway!
          </p>
        </div>

        {/* Game */}
        <PortalBreakerGame />
      </main>
    </div>
  );
};

export default CyberDropPage;
