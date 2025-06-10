
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/TopBar';
import { TournamentSection } from '@/components/TournamentSection';
import { TokenDashboard } from '@/components/TokenDashboard';
import { VotingSection } from '@/components/VotingSection';
import { Marketplace } from '@/components/Marketplace';
import { SocialMediaHub } from '@/components/SocialMediaHub';
import { PlayerDashboard } from '@/components/PlayerDashboard';
import { PacManGame } from '@/components/games/PacManGame';
import { TetrisGame } from '@/components/games/TetrisGame';
import { PrizeSection } from '@/components/PrizeSection';
import { SponsorshipSection } from '@/components/SponsorshipSection';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [activeGame, setActiveGame] = useState<'pacman' | 'tetris' | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Gaming background elements
  const gamingElements = [
    { icon: '🎮', top: '10%', left: '5%', delay: '0s' },
    { icon: '🕹️', top: '20%', right: '10%', delay: '1s' },
    { icon: '🥽', top: '40%', left: '8%', delay: '2s' },
    { icon: '⚡', top: '60%', right: '15%', delay: '0.5s' },
    { icon: '🎯', top: '80%', left: '10%', delay: '1.5s' },
    { icon: '🏆', top: '15%', left: '85%', delay: '3s' },
    { icon: '💎', top: '45%', left: '90%', delay: '2.5s' },
    { icon: '🚀', top: '75%', right: '8%', delay: '4s' },
  ];

  const handleGameEnd = (score: number, gameType: 'pacman' | 'tetris') => {
    toast({
      title: "Game Over!",
      description: `Your ${gameType} score: ${score}. Check leaderboards for prizes!`,
    });
    setActiveGame(null);
  };

  return (
    <div className="min-h-screen bg-background vhs-glitch">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-purple/10 to-neon-cyan/10 animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-neon-cyan/5 rounded-full blur-3xl animate-float transform -translate-x-1/2 -translate-y-1/2" />
        
        {/* Gaming Background Elements */}
        {gamingElements.map((element, index) => (
          <div
            key={index}
            className="gaming-background-element text-4xl"
            style={{
              top: element.top,
              left: element.left,
              right: element.right,
              animationDelay: element.delay,
            }}
          >
            {element.icon}
          </div>
        ))}
      </div>

      <TopBar />

      <main className="container mx-auto px-4 py-4 md:py-8 relative z-10">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="font-display text-4xl md:text-6xl font-black mb-4 text-neon-cyan electric-title electric-flicker">
            <span className="inline-block animate-pulse" style={{animationDelay: '0s'}}>C</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '0.1s'}}>Y</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '0.2s'}}>B</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '0.3s'}}>E</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '0.4s'}}>R</span>
            <span className="mx-4 text-neon-pink">⚡</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '0.5s'}}>C</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '0.6s'}}>I</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '0.7s'}}>T</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '0.8s'}}>Y</span>
            <span className="mx-4 text-neon-green">🔥</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '0.9s'}}>A</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '1.0s'}}>R</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '1.1s'}}>C</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '1.2s'}}>A</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '1.3s'}}>D</span>
            <span className="inline-block animate-pulse" style={{animationDelay: '1.4s'}}>E</span>
          </h1>
          <p className="text-lg md:text-xl text-neon-purple mb-6 md:mb-8 animate-neon-flicker electric-flicker">
            🚀 The Ultimate Web3 Gaming Experience • Tournament NFTs • $CCTR Rewards • VR Ready 🥽
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
            <Badge className="bg-neon-pink text-black px-3 py-2 text-xs md:text-sm font-bold neon-glow animate-pulse">
              🏆 LIVE TOURNAMENTS
            </Badge>
            <Badge className="bg-neon-cyan text-black px-3 py-2 text-xs md:text-sm font-bold neon-glow animate-pulse">
              💎 NFT PASSES
            </Badge>
            <Badge className="bg-neon-green text-black px-3 py-2 text-xs md:text-sm font-bold neon-glow animate-pulse">
              🪙 $CCTR REWARDS
            </Badge>
            <Badge className="bg-neon-purple text-black px-3 py-2 text-xs md:text-sm font-bold neon-glow animate-pulse">
              🔗 WALLET CONNECT
            </Badge>
          </div>
        </div>

        {/* Quick Play Games Section */}
        <div className="mb-8 md:mb-12">
          <Card className="arcade-frame">
            <CardHeader>
              <CardTitle className="font-display text-xl md:text-2xl text-neon-cyan flex items-center gap-3">
                🎮 QUICK PLAY - COMPETE FOR PRIZES
                <Badge className="bg-neon-green text-black animate-pulse">LIVE SCORES</Badge>
                <Badge className="bg-neon-pink text-black animate-pulse">⚡ HIGH VOLTAGE</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeGame ? (
                <div className="space-y-4">
                  {activeGame === 'pacman' && (
                    <PacManGame 
                      onGameEnd={(score) => handleGameEnd(score, 'pacman')} 
                      isActive={true} 
                    />
                  )}
                  {activeGame === 'tetris' && (
                    <TetrisGame 
                      onGameEnd={(score) => handleGameEnd(score, 'tetris')} 
                      isActive={true} 
                    />
                  )}
                  <Button 
                    onClick={() => setActiveGame(null)}
                    variant="outline"
                    className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                  >
                    🏠 Back to Games
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Card className="vending-machine p-4 md:p-6 hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => user ? setActiveGame('pacman') : toast({title: "Please login to play!", variant: "destructive"})}>
                    <div className="text-center space-y-4">
                      <div className="text-4xl md:text-6xl animate-float">👻</div>
                      <h3 className="font-display text-lg md:text-xl font-bold text-neon-pink electric-flicker">PAC-MAN</h3>
                      <p className="text-sm text-muted-foreground">Classic arcade action • Eat pellets • Avoid ghosts</p>
                      <div className="text-xs md:text-sm text-neon-green font-mono">High Score: 15,420 🏆</div>
                      <Button className="cyber-button w-full">
                        {user ? "🎮 PLAY NOW" : "🔐 LOGIN TO PLAY"}
                      </Button>
                    </div>
                  </Card>

                  <Card className="vending-machine p-4 md:p-6 hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => user ? setActiveGame('tetris') : toast({title: "Please login to play!", variant: "destructive"})}>
                    <div className="text-center space-y-4">
                      <div className="text-4xl md:text-6xl animate-float">🧩</div>
                      <h3 className="font-display text-lg md:text-xl font-bold text-neon-cyan electric-flicker">TETRIS</h3>
                      <p className="text-sm text-muted-foreground">Block stacking mastery • Complete lines • Level up</p>
                      <div className="text-xs md:text-sm text-neon-green font-mono">High Score: 8,750 🏆</div>
                      <Button className="cyber-button w-full">
                        {user ? "🎮 PLAY NOW" : "🔐 LOGIN TO PLAY"}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Prize Section */}
        <PrizeSection />

        {/* Sponsorship Section */}
        <SponsorshipSection />

        {/* Main Navigation Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6 md:mb-8 arcade-frame p-2">
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
            <TabsTrigger value="account" className="cyber-button text-xs md:text-sm">
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

          <TabsContent value="account" className="space-y-6">
            <PlayerDashboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* Enhanced Footer */}
      <footer className="border-t border-neon-cyan/30 mt-12 md:mt-20 py-6 md:py-8 bg-card/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center">
          <p className="text-neon-purple font-mono text-sm md:text-base electric-flicker">
            © 2024 Cyber City Arcade • Powered by Web3 Technology ⚡
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-4 text-xs md:text-sm text-muted-foreground">
            <span>🔗 Solana Network</span>
            <span>•</span>
            <span>👻 Phantom Wallet</span>
            <span>•</span>
            <span>🔵 Coinbase Wallet</span>
            <span>•</span>
            <span>⭐ Stellar Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
