
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TopBar } from '@/components/TopBar';
import { TournamentSection } from '@/components/TournamentSection';
import { TokenDashboard } from '@/components/TokenDashboard';
import { VotingSection } from '@/components/VotingSection';
import { Marketplace } from '@/components/Marketplace';
import { SocialMediaHub } from '@/components/SocialMediaHub';
import { PlayerDashboard } from '@/components/PlayerDashboard';

const Index = () => {
  const [activeTab, setActiveTab] = useState('tournaments');

  return (
    <div className="min-h-screen bg-background vhs-glitch">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-purple/10 to-neon-cyan/10 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2" />
      </div>

      <TopBar />

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="font-display text-6xl font-black mb-4 glitch-text text-neon-cyan" data-text="CYBER CITY ARCADE">
            CYBER CITY ARCADE
          </h1>
          <p className="text-xl text-neon-purple mb-8 animate-neon-flicker">
            The Ultimate Web3 Gaming Experience • Tournament NFTs • $CCTR Rewards
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <Badge className="bg-neon-pink text-black px-4 py-2 text-sm font-bold neon-glow">
              🏆 LIVE TOURNAMENTS
            </Badge>
            <Badge className="bg-neon-cyan text-black px-4 py-2 text-sm font-bold neon-glow">
              💎 NFT PASSES
            </Badge>
            <Badge className="bg-neon-green text-black px-4 py-2 text-sm font-bold neon-glow">
              🪙 $CCTR REWARDS
            </Badge>
          </div>
        </div>

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 arcade-frame p-2">
            <TabsTrigger value="tournaments" className="cyber-button">
              🏆 TOURNAMENTS
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="cyber-button">
              📊 DASHBOARD
            </TabsTrigger>
            <TabsTrigger value="voting" className="cyber-button">
              🗳️ VOTING
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="cyber-button">
              🛒 MARKETPLACE
            </TabsTrigger>
            <TabsTrigger value="social" className="cyber-button">
              📱 SOCIAL
            </TabsTrigger>
            <TabsTrigger value="account" className="cyber-button">
              👤 ACCOUNT
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

          <TabsContent value="account" className="space-y-6">
            <PlayerDashboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/30 mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neon-purple font-mono">
            © 2024 Cyber City Arcade • Powered by Web3 Technology
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <span>Solana Network</span>
            <span>•</span>
            <span>Thirdweb SDK</span>
            <span>•</span>
            <span>PayPal Integration</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
