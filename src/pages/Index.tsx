import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/TopBar';
import { WalletManager } from '@/components/WalletManager';
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
import { CCTRStaking } from '@/components/CCTRStaking';
import { CyberMusicPlayer } from '@/components/CyberMusicPlayer';
import { CommunityHub } from '@/components/CommunityHub';
import { CartDrawer } from '@/components/CartDrawer';
import { TriviaGame } from '@/components/TriviaGame';
import { useToast } from '@/hooks/use-toast';
import { useWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import WheelOfFortuneGame from '@/components/games/WheelOfFortuneGame';
import WheelOfGaming from '@/components/games/WheelOfGaming';

const Index = () => {
  const { toast } = useToast();
  const { isWalletConnected } = useWallet();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  const mintFreeNFT = async () => {
    if (!isWalletConnected()) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first to mint your free NFT",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Minting NFT",
      description: "Free NFT mint in progress..."
    });

    // Simulate minting process
    setTimeout(() => {
      toast({
        title: "NFT Minted Successfully!",
        description: "Your free Cyber City Arcade NFT has been minted to your wallet"
      });
    }, 3000);
  };

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

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          {/* Main Logo - Centered */}
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/e69784e2-74e3-4705-8685-3738058bf5e2.png" 
              alt="Cyber City Arcade" 
              className="w-[6in] h-[8in] md:w-[8in] md:h-[10in] object-contain hover:scale-105 transition-transform duration-300" 
              style={{
                filter: 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.3))'
              }} 
            />
          </div>

          <p className="text-base md:text-lg lg:text-xl text-neon-purple mb-6 md:mb-8 animate-neon-flicker px-4">
            The Ultimate Web3 Gaming Experience • Solana Powered • Real Prizes
          </p>
          
          {/* Login/Signup Button */}
          <div className="flex justify-center mb-4 px-4">
            {loading ? (
              <div className="text-neon-cyan">Loading...</div>
            ) : !user ? (
              <Button 
                onClick={() => navigate('/auth')}
                className="cyber-button flex items-center gap-2 text-lg px-8 py-4"
              >
                <span className="text-lg">🔐</span>
                LOGIN / SIGNUP
              </Button>
            ) : null}
          </div>

          {/* Wallet Manager - Between Login and Mint NFT */}
          <div className="flex justify-center mb-4 px-4">
            <WalletManager />
          </div>

          {/* Centered Mint Free NFT Button */}
          <div className="flex justify-center mb-6 md:mb-8 px-4">
            <Button 
              onClick={mintFreeNFT} 
              className="cyber-button flex items-center gap-2 text-lg px-8 py-4"
            >
              🔨 MINT FREE NFT
            </Button>
          </div>
        </div>

        {/* All Sections Stacked Vertically */}
        <div className="space-y-12 md:space-y-16">
          {/* Dashboard Section */}
          <section>
            <TokenDashboard />
          </section>

          {/* Music Player Section - Added under Dashboard */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-neon-cyan mb-6 text-center">
            </h2>
            <div className="flex justify-center mx-0 px-0">
              <CyberMusicPlayer />
            </div>
          </section>

          {/* Community Hub Section - Added after Dashboard */}
          <section>
            <CommunityHub />
          </section>

          {/* Merchandise Store Section */}
          <section>
            <MerchandiseStore />
          </section>

          {/* NFT Marketplace Section */}
          <section>
            <Marketplace />
          </section>

          {/* Tournaments Section - Now includes Live Tournaments and Statistics */}
          <section>
            <TournamentSection />
          </section>

          {/* Gaming Trivia Challenge Section - Single trivia section */}
          <section>
            <TriviaGame />
          </section>

          {/* Wheel of Gaming Section - Futuristic spinning wheel with prizes */}
          <section>
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-neon-cyan mb-4">
                🎰 Wheel of Gaming
              </h2>
              <p className="text-lg text-neon-purple">
                Spin the futuristic wheel for a chance to win CCTR tokens and exclusive prizes!
              </p>
            </div>
            <WheelOfGaming />
          </section>

          {/* Raffles Section */}
          <section>
            <RaffleSection />
          </section>

          {/* Prize Pool Section - Moved after Raffles */}
          <section>
            <PrizeSection />
          </section>

          {/* Voting Section */}
          <section>
            <VotingSection />
          </section>

          {/* DEX Section - Moved under Voting */}
          <section>
            <SolanaDexChart />
          </section>

          {/* Buy CCTR Section - Moved under DEX */}
          <section>
            <TokenPurchase />
          </section>

          {/* CCTR Staking Section - Moved under Buy CCTR */}
          <section>
            <CCTRStaking />
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neon-cyan/30 mt-12 md:mt-20 py-6 md:py-8">
        <div className="container mx-auto px-4">
          {/* Privacy, Support, and Terms Links */}
          <div className="flex justify-center gap-6 mb-6">
            <button 
              onClick={() => window.open('#', '_blank')} 
              className="text-neon-cyan hover:text-neon-purple transition-colors text-sm md:text-base underline"
            >
              Privacy Policy
            </button>
            <span className="text-neon-purple">•</span>
            <button 
              onClick={() => window.open('#', '_blank')} 
              className="text-neon-cyan hover:text-neon-purple transition-colors text-sm md:text-base underline"
            >
              Support
            </button>
            <span className="text-neon-purple">•</span>
            <button 
              onClick={() => window.open('#', '_blank')} 
              className="text-neon-cyan hover:text-neon-purple transition-colors text-sm md:text-base underline"
            >
              Terms
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-neon-purple font-mono text-sm md:text-base mb-4">
              © 2024 Cyber City Arcade • Powered by Solana Blockchain
            </p>
            <div className="flex flex-wrap justify-center gap-2 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <span>Solana Network</span>
              <span>•</span>
              <button onClick={() => window.open('https://magiceden.io/', '_blank')} className="hover:text-neon-cyan transition-colors cursor-pointer">
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
        </div>
      </footer>
      
      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  );
};

export default Index;
