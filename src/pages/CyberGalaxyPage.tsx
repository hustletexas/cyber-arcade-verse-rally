import React from 'react';
import { TopBar } from '@/components/TopBar';
import CyberGalaxyGame from '@/components/games/CyberGalaxyGame';
import { CartDrawer } from '@/components/CartDrawer';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { CCCBalanceBar } from '@/components/games/CCCBalanceBar';
import '@/components/games/cyber-columns/cyber-columns.css';


const CyberGalaxyPage = () => {
  return (
    <div className="cyber-columns-container min-h-screen relative">
      {/* ── Galaxy Background Layers ── */}
      <div className="cc-starfield" />
      <div className="cc-nebula" />
      <div className="cc-orbit-ring" />

      <TopBar />
      <CartDrawer />

      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-24 pb-16">
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
            CYBER GALAXY
          </h1>
          <p className="text-purple-300 text-lg font-mono">Arcade Defense</p>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mt-2">
            Defend the portal from waves of neon drones. Collect power-ups and survive!
          </p>
        </div>

        {/* CCC Balance Bar */}
        <div className="max-w-lg mx-auto mb-6">
          <CCCBalanceBar />
        </div>

        {/* Game - Season Pass Required */}
        <CyberGalaxyGame />
      </main>
    </div>
  );
};

export default CyberGalaxyPage;
