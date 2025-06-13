
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopBar } from '@/components/TopBar';
import { TournamentSection } from '@/components/TournamentSection';
import { TokenDashboard } from '@/components/TokenDashboard';
import { VotingSection } from '@/components/VotingSection';
import { Marketplace } from '@/components/Marketplace';
import { SocialMediaHub } from '@/components/SocialMediaHub';
import { PlayerDashboard } from '@/components/PlayerDashboard';
import { PrizeSection } from '@/components/PrizeSection';
import { BlockchainIntegration } from '@/components/BlockchainIntegration';
import { PaymentIntegration } from '@/components/PaymentIntegration';
import { SocialFeatures } from '@/components/SocialFeatures';
import { TetrisGame } from '@/components/games/TetrisGame';
import { PacManGame } from '@/components/games/PacManGame';

const Index = () => {
  const [activeTab, setActiveTab] = useState('tournaments');

  return (
    <div className="min-h-screen bg-background vhs-glitch">
      {/* Enhanced Animated Background to match logo */}
      <div className="fixed inset-0 opacity-25 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/15 via-neon-purple/20 to-neon-cyan/15 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-neon-pink/8 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-neon-cyan/12 rounded-full blur-3xl animate-float" />
        
        {/* Enhanced Gaming Icons Background */}
        <div className="absolute top-10 left-10 text-4xl opacity-35 animate-float text-neon-pink">🕹️</div>
        <div className="absolute top-20 right-20 text-3xl opacity-25 animate-pulse text-neon-cyan">🎮</div>
        <div className="absolute bottom-20 left-20 text-3xl opacity-30 animate-bounce text-neon-purple">👾</div>
        <div className="absolute bottom-10 right-10 text-4xl opacity-35 animate-float text-neon-green">🎯</div>
        <div className="absolute top-1/3 left-1/4 text-2xl opacity-25 animate-pulse text-neon-pink">🏆</div>
        <div className="absolute top-2/3 right-1/4 text-3xl opacity-30 animate-bounce text-neon-cyan">⚡</div>
        <div className="absolute top-1/2 left-10 text-2xl opacity-25 animate-float text-neon-purple">🚀</div>
        <div className="absolute top-1/4 right-1/3 text-3xl opacity-35 animate-pulse text-neon-green">💎</div>
      </div>

      <TopBar />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/e69784e2-74e3-4705-8685-3738058bf5e2.png" 
              alt="Cyber City Arcade" 
              className="w-80 md:w-96 h-auto object-contain neon-glow hover:scale-105 transition-transform duration-300"
            />
          </div>
          <p className="text-lg md:text-xl text-neon-purple mb-8 animate-neon-flicker">
            The Ultimate Web3 Gaming Experience • Solana Powered • Real Prizes
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-8">
            <Badge className="bg-neon-pink text-black px-3 md:px-4 py-2 text-xs md:text-sm font-bold neon-glow">
              🏆 LIVE TOURNAMENTS
            </Badge>
            <Badge className="bg-neon-cyan text-black px-3 md:px-4 py-2 text-xs md:text-sm font-bold neon-glow">
              💎 FREE NFT MINTS
            </Badge>
            <Badge className="bg-neon-green text-black px-3 md:px-4 py-2 text-xs md:text-sm font-bold neon-glow">
              🪙 $CCTR REWARDS
            </Badge>
          </div>

          {/* Quick Play Games */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <div className="arcade-frame p-6">
              <h3 className="font-display text-xl text-neon-pink mb-4">🧩 TETRIS CHALLENGE</h3>
              <TetrisGame onGameEnd={(score) => console.log('Tetris score:', score)} isActive={false} />
            </div>
            <div className="arcade-frame p-6">
              <h3 className="font-display text-xl text-neon-cyan mb-4">👻 PAC-MAN ARENA</h3>
              <PacManGame onGameEnd={(score) => console.log('Pac-Man score:', score)} isActive={false} />
            </div>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 arcade-frame p-2">
            <TabsTrigger value="tournaments" className="cyber-button text-xs md:text-sm">
              🏆 TOURNAMENTS
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="cyber-button text-xs md:text-sm">
              📊 DASHBOARD
            </TabsTrigger>
            <TabsTrigger value="voting" className="cyber-button text-xs md:text-sm">
              🗳️ VOTING
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="cyber-button text-xs md:text-sm">
              🛒 MARKETPLACE
            </TabsTrigger>
            <TabsTrigger value="social" className="cyber-button text-xs md:text-sm">
              📱 SOCIAL
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tournaments" className="space-y-6">
            <TournamentSection />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <TokenDashboard />
          </TabsContent>

          <TabsContent value="voting" className="space-y-6">
            <VotingSection />
          </TabsContent>

          <TabsContent value="marketplace" className="space-y-6">
            <Marketplace />
          </TabsContent>

          <TabsContent value="social" className="space-y-6">
            <SocialMediaHub />
          </TabsContent>
        </Tabs>

        {/* New Sections */}
        <div className="space-y-8 mt-12">
          <PrizeSection />
          <SocialFeatures />
          <PaymentIntegration />
          <BlockchainIntegration />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/30 mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neon-purple font-mono text-sm md:text-base">
            © 2024 Cyber City Arcade • Powered by Solana Blockchain
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-6 mt-4 text-xs md:text-sm text-muted-foreground">
            <span>Solana Network</span>
            <span>•</span>
            <span>Magic Eden</span>
            <span>•</span>
            <span>PayPal Integration</span>
            <span>•</span>
            <span>Phantom Wallet</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
