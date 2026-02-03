import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/TopBar';
import { VotingSection } from '@/components/VotingSection';
import { Marketplace } from '@/components/Marketplace';
import { PlayerDashboard } from '@/components/PlayerDashboard';
import { MerchandiseStore } from '@/components/MerchandiseStore';
import { RaffleSection } from '@/components/RaffleSection';
import { CreditsRewardsShowcase } from '@/components/CreditsRewardsShowcase';
import { CyberMusicPlayer } from '@/components/CyberMusicPlayer';
import { CommunityHub } from '@/components/CommunityHub';
import { CartDrawer } from '@/components/CartDrawer';
import { WelcomeTutorial } from '@/components/WelcomeTutorial';
import { TournamentHub } from '@/components/tournament/TournamentHub';
import { CyberGamesSection } from '@/components/CyberGamesSection';
import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useSeasonPassPurchase } from '@/hooks/useSeasonPassPurchase';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import { useNavigate, Link } from 'react-router-dom';
import { AIGamingCoach } from '@/components/AIGamingCoach';
import { Web3Gaming } from '@/components/Web3Gaming';
const Index = () => {
  const {
    toast
  } = useToast();
  const {
    isWalletConnected
  } = useMultiWallet();
  const {
    purchaseSeasonPass,
    status,
    price
  } = useSeasonPassPurchase();
  const {
    user,
    loading
  } = useAuth();
  const {
    trackAchievement
  } = useAchievements();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(false);
  const isPurchasing = status !== 'idle' && status !== 'success' && status !== 'error';
  const getButtonText = () => {
    switch (status) {
      case 'checkout':
        return 'PROCESSING PAYMENT...';
      case 'processing':
        return 'CONFIRMING...';
      case 'delivering':
        return 'DELIVERING NFT...';
      case 'success':
        return 'PURCHASED ✓';
      default:
        return `BUY SEASON PASS - $${price}`;
    }
  };
  const handlePurchase = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet first to purchase",
        variant: "destructive"
      });
      return;
    }
    const result = await purchaseSeasonPass();
    if (result.success) {
      trackAchievement('nft_minted');
    }
  };
  return <div className="min-h-screen bg-transparent relative">
      {/* Galaxy Background - Exact match to NFT interior */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{
      background: `
          radial-gradient(ellipse 100% 60% at 50% 0%, rgba(100, 50, 150, 0.4) 0%, transparent 50%),
          radial-gradient(ellipse 80% 50% at 30% 70%, rgba(80, 40, 120, 0.3) 0%, transparent 45%),
          radial-gradient(ellipse 70% 50% at 70% 80%, rgba(60, 30, 100, 0.25) 0%, transparent 40%),
          linear-gradient(180deg, 
            rgb(25, 15, 45) 0%, 
            rgb(20, 12, 40) 30%,
            rgb(15, 10, 35) 60%,
            rgb(12, 8, 30) 100%)
        `
    }}>
        {/* Star field matching NFT */}
        <div className="absolute inset-0" style={{
        backgroundImage: `
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.9) 1px, transparent 0),
            radial-gradient(1px 1px at 25% 45%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(1.5px 1.5px at 35% 15%, rgba(255,200,255,0.8) 1px, transparent 0),
            radial-gradient(1px 1px at 45% 75%, rgba(255,255,255,0.6) 1px, transparent 0),
            radial-gradient(1px 1px at 55% 35%, rgba(200,200,255,0.7) 1px, transparent 0),
            radial-gradient(1.5px 1.5px at 65% 85%, rgba(255,180,255,0.6) 1px, transparent 0),
            radial-gradient(1px 1px at 75% 25%, rgba(255,255,255,0.8) 1px, transparent 0),
            radial-gradient(1px 1px at 85% 55%, rgba(180,180,255,0.7) 1px, transparent 0),
            radial-gradient(1px 1px at 95% 10%, rgba(255,255,255,0.5) 1px, transparent 0),
            radial-gradient(1px 1px at 5% 65%, rgba(255,220,255,0.6) 1px, transparent 0),
            radial-gradient(1px 1px at 15% 90%, rgba(255,255,255,0.7) 1px, transparent 0),
            radial-gradient(1.5px 1.5px at 40% 5%, rgba(255,150,255,0.5) 1px, transparent 0),
            radial-gradient(1px 1px at 60% 95%, rgba(200,220,255,0.6) 1px, transparent 0),
            radial-gradient(1px 1px at 80% 70%, rgba(255,255,255,0.5) 1px, transparent 0),
            radial-gradient(2px 2px at 50% 50%, rgba(255,200,255,0.4) 1px, transparent 0)
          `,
        backgroundSize: '250px 250px'
      }} />
      </div>

      <TopBar />
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative z-10">
        {/* Mobile-Enhanced Hero Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          {/* Mobile-Optimized Main Logo */}
          <div className="flex justify-center mb-4 sm:mb-6">
            <img alt="Cyber City Arcade NFT" className="w-80 h-auto sm:w-[500px] md:w-[700px] lg:w-[900px] object-contain hover:scale-105 transition-transform duration-300 touch-manipulation" style={{
            filter: 'drop-shadow(0 0 30px rgba(0, 255, 255, 0.5)) drop-shadow(0 0 60px rgba(191, 0, 255, 0.3))'
          }} src="/lovable-uploads/dd23db05-56ce-4fcd-8593-c174a3d2f9a7.png" />
          </div>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-neon-purple mb-4 sm:mb-6 md:mb-8 animate-neon-flicker px-2 sm:px-4 leading-relaxed">
            The Ultimate Web3 Gaming Experience • Stellar Powered • Real Prizes
          </p>

          {/* Mobile-Enhanced Action Buttons */}
          <div className="flex flex-col items-center gap-3 sm:gap-4 mb-6 md:mb-8 px-2 sm:px-4">
            <Button onClick={handlePurchase} disabled={isPurchasing || status === 'success'} className="cyber-button flex items-center gap-2 text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 disabled:opacity-50 w-full max-w-xs sm:max-w-sm touch-manipulation min-h-[3rem]">
              {isPurchasing ? <>
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm sm:text-base">{getButtonText()}</span>
                </> : <>
                  <span className="text-xl sm:text-2xl">{status === 'success' ? '✅' : '🎫'}</span>
                  <span className="text-sm sm:text-base font-semibold">{getButtonText()}</span>
                </>}
            </Button>
            
            {/* Mobile-Optimized Tutorial Button */}
            <Button onClick={() => setShowTutorial(true)} variant="outline" className="text-neon-cyan border-neon-cyan hover:bg-neon-cyan/10 px-4 sm:px-6 py-2 sm:py-3 w-full max-w-xs sm:max-w-sm touch-manipulation min-h-[2.5rem] text-sm sm:text-base">
              <span className="text-base sm:text-lg mr-2">📚</span>
              Take Tutorial
            </Button>
          </div>
        </div>

        {/* Mobile-Optimized Sections Layout */}
        <div className="space-y-8 sm:space-y-12 md:space-y-16">
          {/* Music Player Section */}
          <section className="px-2 sm:px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-neon-cyan mb-4 sm:mb-6 text-center">
            </h2>
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                <CyberMusicPlayer />
              </div>
            </div>
          </section>

          {/* Community Hub Section */}
          <section className="px-2 sm:px-4">
            <CommunityHub />
          </section>

          {/* Tournament Hub Section */}
          <section className="px-2 sm:px-4">
            <TournamentHub />
          </section>

          {/* Web3 Gaming Section - Mobile Optimized */}
          <section className="px-2 sm:px-4">
            <Web3Gaming />
          </section>

          {/* AI Gaming Coach Section - Mobile Optimized */}
          <section className="px-2 sm:px-4">
            <AIGamingCoach />
          </section>


          {/* Merchandise Store Section - Touch Friendly */}
          <section className="px-2 sm:px-4">
            <MerchandiseStore />
          </section>

          {/* NFT Marketplace Section - Mobile Optimized */}
          <section className="px-2 sm:px-4">
            <Marketplace />
          </section>


          {/* Cyber Arcade Games Section */}
          <section className="px-2 sm:px-4">
            <CyberGamesSection />
          </section>

          {/* Raffles Section - Mobile Friendly */}
          <section className="px-2 sm:px-4">
            <RaffleSection />
          </section>

          {/* Voting Section - Touch Optimized */}
          <section className="px-2 sm:px-4">
            <VotingSection />
          </section>

          {/* CCC Credits Section - How to Earn */}
          <section className="px-2 sm:px-4">
            <CreditsRewardsShowcase />
          </section>

        </div>
      </main>
      {/* Mobile-Enhanced Footer */}
      <footer className="border-t border-neon-cyan/30 mt-8 sm:mt-12 md:mt-20 py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Mobile-Optimized Footer Links */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
            <Link to="/privacy" className="text-neon-cyan hover:text-neon-purple transition-colors text-xs sm:text-sm md:text-base underline touch-manipulation py-2">
              Privacy
            </Link>
            <span className="text-neon-purple text-xs sm:text-sm md:text-base">•</span>
            <a href="mailto:cybercityarcade@gmail.com" className="text-neon-cyan hover:text-neon-purple transition-colors text-xs sm:text-sm md:text-base underline touch-manipulation py-2">
              Support
            </a>
            <span className="text-neon-purple text-xs sm:text-sm md:text-base">•</span>
            <Link to="/terms" className="text-neon-cyan hover:text-neon-purple transition-colors text-xs sm:text-sm md:text-base underline touch-manipulation py-2">
              Terms
            </Link>
            <span className="text-neon-purple text-xs sm:text-sm md:text-base">•</span>
            <button onClick={() => window.scrollTo({
            top: 0,
            behavior: 'smooth'
          })} className="text-neon-cyan hover:text-neon-purple transition-colors text-xs sm:text-sm md:text-base underline touch-manipulation py-2">
              About
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-neon-purple font-mono text-xs sm:text-sm md:text-base mb-3 sm:mb-4 leading-relaxed">
              © 2024 Cyber City Arcade LLC • Powered by Stellar
            </p>
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-6 text-xs md:text-sm text-muted-foreground">
              <span>Stellar</span>
              <span>•</span>
              <button onClick={() => window.open('https://aqua.network/', '_blank')} className="hover:text-neon-cyan transition-colors cursor-pointer touch-manipulation py-1">
                Aqua Network
              </button>
              <span>•</span>
              <span>LOBSTR</span>
              <span>•</span>
              <span>Freighter</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Cart Drawer */}
      <CartDrawer />
      
      {/* Welcome Tutorial */}
      <WelcomeTutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
    </div>;
};
export default Index;