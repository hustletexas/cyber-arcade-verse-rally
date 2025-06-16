
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { TopBar } from '@/components/TopBar';
import { TournamentSection } from '@/components/TournamentSection';
import { TokenDashboard } from '@/components/TokenDashboard';
import { VotingSection } from '@/components/VotingSection';
import { Marketplace } from '@/components/Marketplace';
import { PlayerDashboard } from '@/components/PlayerDashboard';
import { PrizeSection } from '@/components/PrizeSection';
import { MerchandiseStore } from '@/components/MerchandiseStore';
import { SolanaDexChart } from '@/components/SolanaDexChart';
import { RaffleSection } from '@/components/RaffleSection';
import { TokenPurchase } from '@/components/TokenPurchase';
import { LiveTournaments } from '@/components/LiveTournaments';
import { CyberMusicPlayer } from '@/components/CyberMusicPlayer';

const Index = () => {
  return (
    <div className="min-h-screen bg-black">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-purple/10 to-neon-cyan/10 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Gaming Icons Background */}
        <div className="absolute top-10 left-10 text-2xl md:text-4xl opacity-30 animate-float">🕹️</div>
        <div className="absolute top-20 right-20 text-xl md:text-3xl opacity-20 animate-pulse">🎮</div>
        <div className="absolute bottom-20 left-20 text-xl md:text-3xl opacity-25 animate-bounce">👾</div>
        <div className="absolute bottom-10 right-10 text-2xl md:text-4xl opacity-30 animate-float">🎯</div>
        <div className="absolute top-1/3 left-1/4 text-lg md:text-2xl opacity-20 animate-pulse">🏆</div>
        <div className="absolute top-2/3 right-1/4 text-xl md:text-3xl opacity-25 animate-bounce">⚡</div>
        <div className="absolute top-1/2 left-10 text-lg md:text-2xl opacity-20 animate-float">🚀</div>
        <div className="absolute top-1/4 right-1/3 text-xl md:text-3xl opacity-30 animate-pulse">💎</div>
      </div>

      <TopBar />
      <CyberMusicPlayer />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <div className="flex justify-center mb-6 relative">
            <img 
              src="/lovable-uploads/e69784e2-74e3-4705-8685-3738058bf5e2.png" 
              alt="Cyber City Arcade" 
              className="w-[6in] h-[8in] md:w-[8in] md:h-[10in] object-contain hover:scale-105 transition-transform duration-300"
              style={{ filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.3))' }}
            />
          </div>
          <p className="text-base md:text-lg lg:text-xl text-neon-purple mb-6 md:mb-8 animate-neon-flicker px-4">
            The Ultimate Web3 Gaming Experience • Solana Powered • Real Prizes
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8 px-4">
            <Badge className="bg-neon-pink text-black px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-bold neon-glow">
              🏆 LIVE TOURNAMENTS
            </Badge>
            <Badge className="bg-neon-cyan text-black px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-bold neon-glow">
              💎 FREE NFT MINTS
            </Badge>
            <Badge className="bg-neon-green text-black px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm font-bold neon-glow">
              🪙 $CCTR REWARDS
            </Badge>
          </div>
        </div>

        {/* All Sections Stacked Vertically */}
        <div className="space-y-12 md:space-y-16">
          {/* Dashboard Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
              📊 DASHBOARD
            </h2>
            <TokenDashboard />
          </section>

          {/* Merchandise Store Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
              🛍️ MERCHANDISE STORE
            </h2>
            <MerchandiseStore />
          </section>

          {/* Live Tournaments Section - Moved under Store */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
              🔴 LIVE TOURNAMENTS
            </h2>
            <LiveTournaments />
          </section>

          {/* NFT Marketplace Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
              🛒 NFT MARKETPLACE
            </h2>
            <Marketplace />
          </section>

          {/* Buy CCTR Section - Moved under NFT Marketplace */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
              💰 BUY $CCTR
            </h2>
            <TokenPurchase />
          </section>

          {/* Tournaments Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
              🏆 TOURNAMENTS
            </h2>
            <TournamentSection />
          </section>

          {/* Prize Pool Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
              🏆 PRIZE POOL
            </h2>
            <PrizeSection />
          </section>

          {/* Raffles Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
              🎫 RAFFLES
            </h2>
            <RaffleSection />
          </section>

          {/* Voting Section */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
              🗳️ VOTING
            </h2>
            <VotingSection />
          </section>

          {/* DEX Section - Moved under Voting */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
              📈 DEX
            </h2>
            <SolanaDexChart />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/30 mt-12 md:mt-20 py-6 md:py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neon-purple font-mono text-sm md:text-base mb-4">
            © 2024 Cyber City Arcade • Powered by Solana Blockchain
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-6 text-xs md:text-sm text-muted-foreground">
            <span>Solana Network</span>
            <span>•</span>
            <button 
              onClick={() => window.open('https://magiceden.io/', '_blank')}
              className="hover:text-neon-cyan transition-colors cursor-pointer"
            >
              Magic Eden
            </button>
            <span>•</span>
            <span>PayPal Integration</span>
            <span>•</span>
            <span>Phantom Wallet</span>
            <span>•</span>
            <span>Coinbase Wallet</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
