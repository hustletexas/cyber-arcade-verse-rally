
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
import { ArcadeTetris } from '@/components/ArcadeTetris';

const Index = () => {
  const [activeTab, setActiveTab] = useState('tournaments');

  return (
    <div className="min-h-screen bg-black text-white vhs-glitch">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-purple/10 to-neon-cyan/10 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Gaming Icons Background */}
        <div className="absolute top-10 left-10 text-4xl opacity-30 animate-float">🕹️</div>
        <div className="absolute top-20 right-20 text-3xl opacity-20 animate-pulse">🎮</div>
        <div className="absolute bottom-20 left-20 text-3xl opacity-25 animate-bounce">👾</div>
        <div className="absolute bottom-10 right-10 text-4xl opacity-30 animate-float">🎯</div>
        <div className="absolute top-1/3 left-1/4 text-2xl opacity-20 animate-pulse">🏆</div>
        <div className="absolute top-2/3 right-1/4 text-3xl opacity-25 animate-bounce">⚡</div>
        <div className="absolute top-1/2 left-10 text-2xl opacity-20 animate-float">🚀</div>
        <div className="absolute top-1/4 right-1/3 text-3xl opacity-30 animate-pulse">💎</div>
      </div>

      <TopBar />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Hero Section with Arcade Tetris */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <ArcadeTetris />
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
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-8 bg-gray-900/80 backdrop-blur-sm border border-neon-cyan/30 p-2 rounded-lg">
            <TabsTrigger 
              value="tournaments" 
              className="text-neon-cyan bg-transparent border border-neon-cyan/50 hover:bg-neon-cyan/20 data-[state=active]:bg-neon-cyan data-[state=active]:text-black font-bold text-xs md:text-sm"
            >
              🏆 TOURNAMENTS
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              className="text-neon-pink bg-transparent border border-neon-pink/50 hover:bg-neon-pink/20 data-[state=active]:bg-neon-pink data-[state=active]:text-black font-bold text-xs md:text-sm"
            >
              📊 DASHBOARD
            </TabsTrigger>
            <TabsTrigger 
              value="voting" 
              className="text-neon-purple bg-transparent border border-neon-purple/50 hover:bg-neon-purple/20 data-[state=active]:bg-neon-purple data-[state=active]:text-black font-bold text-xs md:text-sm"
            >
              🗳️ VOTING
            </TabsTrigger>
            <TabsTrigger 
              value="marketplace" 
              className="text-neon-green bg-transparent border border-neon-green/50 hover:bg-neon-green/20 data-[state=active]:bg-neon-green data-[state=active]:text-black font-bold text-xs md:text-sm"
            >
              🛒 MARKETPLACE
            </TabsTrigger>
            <TabsTrigger 
              value="social" 
              className="text-neon-cyan bg-transparent border border-neon-cyan/50 hover:bg-neon-cyan/20 data-[state=active]:bg-neon-cyan data-[state=active]:text-black font-bold text-xs md:text-sm"
            >
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
      <footer className="border-t border-neon-cyan/30 mt-20 py-8 bg-gray-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neon-purple font-mono text-sm md:text-base">
            © 2024 Cyber City Arcade • Powered by Solana Blockchain
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-6 mt-4 text-xs md:text-sm text-neon-cyan/70">
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
