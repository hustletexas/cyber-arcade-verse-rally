import React from 'react';
import { TopBar } from '@/components/TopBar';
import PortalBreakerGame from '@/components/games/PortalBreakerGame';
import { CartDrawer } from '@/components/CartDrawer';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CCCBalanceBar } from '@/components/games/CCCBalanceBar';
import { GalaxyBackground } from '@/components/games/GalaxyBackground';


const CyberBreakerPage = () => {
  return (
    <div className="cyber-columns-container min-h-screen relative">
      <GalaxyBackground />
      <TopBar />
      <CartDrawer />

      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-neon-cyan transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Arcade</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl sm:text-4xl text-neon-cyan tracking-wider mb-2">
            CYBER BREAKER
          </h1>
          <p className="text-purple-300 text-lg font-mono">Neon Brick Breaker</p>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2">
            Smash through neon bricks, collect power-ups and climb the leaderboard!
          </p>
        </div>

        <div className="max-w-lg mx-auto mb-6">
          <CCCBalanceBar />
        </div>

        <PortalBreakerGame />
      </main>
    </div>
  );
};

export default CyberBreakerPage;
