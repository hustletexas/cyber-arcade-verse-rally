import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MusicPlayer } from '@/components/MusicPlayer';
import { CartDrawer } from '@/components/CartDrawer';
import { MerchandiseStore } from '@/components/MerchandiseStore';
import { BlockchainIntegration } from '@/components/BlockchainIntegration';
import { VotingSection } from '@/components/VotingSection';
import { useAuth } from '@/hooks/useAuth';
import { Wallet } from 'lucide-react';

const Index = () => {
  const { user, isWalletConnected, walletAddress, phantomConnect, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background vhs-glitch">
      {/* Navigation */}
      <nav className="border-b border-neon-cyan/30 bg-black/90 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-purple rounded-lg flex items-center justify-center neon-glow">
                <span className="text-lg font-black">🕹️</span>
              </div>
              <h1 className="font-display text-xl text-neon-green">CYBER CITY ARCADE</h1>
            </div>
            
            <div className="flex items-center gap-3">
              {isWalletConnected && user ? (
                <div className="flex items-center gap-3">
                  <Badge className="bg-neon-green text-black">
                    <Wallet size={14} className="mr-1" />
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </Badge>
                  <Button
                    onClick={signOut}
                    variant="outline"
                    size="sm"
                    className="border-neon-pink text-neon-pink hover:bg-neon-pink hover:text-black"
                  >
                    Disconnect
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Button
                    onClick={phantomConnect}
                    className="cyber-button"
                    size="sm"
                  >
                    <Wallet size={16} className="mr-2" />
                    Connect Wallet
                  </Button>
                  <Link to="/auth">
                    <Button variant="outline" size="sm" className="border-neon-cyan text-neon-cyan">
                      Enter Arcade
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-6">
          <div className="relative">
            <h1 className="font-display text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-pink via-neon-purple to-neon-cyan animate-pulse">
              CYBER CITY
            </h1>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-neon-green mt-2">
              ARCADE
            </h2>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-neon-yellow rounded-full animate-bounce opacity-80"></div>
            <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-neon-pink rounded-full animate-bounce opacity-60" style={{ animationDelay: '0.5s' }}></div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            The ultimate retro gaming destination on Solana. Play classic arcade games, win NFT prizes, and compete in tournaments.
          </p>
          
          {!isWalletConnected || !user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={phantomConnect}
                className="cyber-button text-lg px-8 py-3"
              >
                <Wallet size={20} className="mr-2" />
                CONNECT PHANTOM WALLET
              </Button>
              <Badge className="bg-neon-yellow text-black px-4 py-2">
                🎮 Web3 Gaming • 🏆 NFT Prizes • 💰 Solana Rewards
              </Badge>
            </div>
          ) : (
            <div className="space-y-4">
              <Badge className="bg-neon-green text-black text-lg px-6 py-3">
                <Wallet size={20} className="mr-2" />
                WALLET CONNECTED - READY TO PLAY!
              </Badge>
              <div className="flex justify-center">
                <Badge className="bg-neon-cyan text-black px-4 py-2">
                  {walletAddress.slice(0, 8)}...{walletAddress.slice(-4)}
                </Badge>
              </div>
            </div>
          )}
        </section>

        {/* Voting Section */}
        <VotingSection />

        {/* Merchandise Store */}
        <MerchandiseStore />

        {/* Blockchain Integration */}
        <BlockchainIntegration />
      </main>

      <MusicPlayer />
      <CartDrawer />
    </div>
  );
};

export default Index;
