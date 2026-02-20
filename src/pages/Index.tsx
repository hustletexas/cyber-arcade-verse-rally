import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TopBar } from '@/components/TopBar';
import { VotingSection } from '@/components/VotingSection';
import { Marketplace } from '@/components/Marketplace';
import { PlayerDashboard } from '@/components/PlayerDashboard';
import { CreditsRewardsShowcase } from '@/components/CreditsRewardsShowcase';

import { CommunityHub } from '@/components/CommunityHub';
import { CartDrawer } from '@/components/CartDrawer';
import { WelcomeTutorial } from '@/components/WelcomeTutorial';
import { CyberGamesSection } from '@/components/CyberGamesSection';

import { useToast } from '@/hooks/use-toast';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { useSeasonPassPurchase } from '@/hooks/useSeasonPassPurchase';
import { useAuth } from '@/hooks/useAuth';
import { useAchievements } from '@/hooks/useAchievements';
import { useNavigate, Link } from 'react-router-dom';
import { AIGamingCoach } from '@/components/AIGamingCoach';
import { Web3Gaming } from '@/components/Web3Gaming';
import { SponsorshipSection } from '@/components/SponsorshipSection';
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
            ​Cyber City Arcade blends gaming and esports with education, skill-building, community engagement, and responsible technology use.                 
          </p>

        </div>

        {/* Mobile-Optimized Sections Layout */}
        <div className="space-y-8 sm:space-y-12 md:space-y-16">

          {/* Cyber Arcade Games Section */}
         <section id="arcade-hub" className="px-2 sm:px-4">
            <CyberGamesSection />
          </section>

          {/* NFT Marketplace Section - Mobile Optimized */}
         <section id="marketplace" className="px-2 sm:px-4">
            <Marketplace />
          </section>

          {/* Web3 Gaming Section - Mobile Optimized */}
         <section id="web3-gaming" className="px-2 sm:px-4">
            <Web3Gaming />
          </section>


          {/* Community Hub Section */}
         <section id="community-hub" className="px-2 sm:px-4">
            <CommunityHub />
          </section>

          {/* Voting Section - Touch Optimized */}
          <section className="px-2 sm:px-4">
            <VotingSection />
          </section>




          {/* Sponsorships & Partnerships */}
          <section id="sponsorships" className="px-2 sm:px-4">
            <SponsorshipSection />
          </section>

        </div>
      </main>
      {/* Professional Footer */}
      <footer className="relative z-10 border-t border-neon-cyan/30 mt-8 sm:mt-12 md:mt-20 py-6 sm:py-8 md:py-12 bg-black/80">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
            {/* Brand Column */}
            <div className="text-center md:text-left">
              <h3 className="font-display text-xl sm:text-2xl text-neon-cyan mb-2">CYBER CITY ARCADE</h3>
              <p className="text-muted-foreground text-xs sm:text-sm mb-3">The Ultimate Web3 Gaming Experience</p>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <img src="/lovable-uploads/stellar.png" alt="Stellar" className="w-5 h-5 opacity-80" onError={e => e.currentTarget.style.display = 'none'} />
                <span className="text-neon-purple text-xs sm:text-sm font-mono">Powered by Stellar Blockchain</span>
              </div>
            </div>
            
            {/* Quick Links Column */}
            <div className="text-center">
              <h4 className="text-neon-pink font-semibold mb-3 text-sm sm:text-base">Quick Links</h4>
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                <Link to="/about" className="text-neon-cyan hover:text-neon-purple transition-colors text-xs sm:text-sm underline touch-manipulation">
                  About
                </Link>
                <a href="mailto:cybercityarcade@gmail.com" className="text-neon-cyan hover:text-neon-purple transition-colors text-xs sm:text-sm underline touch-manipulation">
                  Support
                </a>
                <Link to="/terms" className="text-neon-cyan hover:text-neon-purple transition-colors text-xs sm:text-sm underline touch-manipulation">
                  Terms
                </Link>
                <Link to="/privacy" className="text-neon-cyan hover:text-neon-purple transition-colors text-xs sm:text-sm underline touch-manipulation">
                  Privacy
                </Link>
                <Link to="/refund-policy" className="text-neon-cyan hover:text-neon-purple transition-colors text-xs sm:text-sm underline touch-manipulation">
                  Refunds
                </Link>
              </div>
            </div>
            
            {/* Social Column */}
            <div className="text-center md:text-right">
              <h4 className="text-neon-pink font-semibold mb-3 text-sm sm:text-base">Connect With Us</h4>
              <div className="flex justify-center md:justify-end gap-4">
                <a href="https://x.com/stellarhustle_" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-neon-cyan transition-colors" title="X (Twitter)">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="https://discord.gg/83vpV7NBUU" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-neon-purple transition-colors" title="Discord">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                </a>
                <a href="mailto:cybercityarcade@gmail.com" className="text-muted-foreground hover:text-neon-green transition-colors" title="Email">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Partners Row */}
          <div className="border-t border-neon-purple/20 pt-4 mb-4">
            <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6 text-xs text-muted-foreground">
              <span className="text-neon-purple/60">Partners:</span>
              <span className="hover:text-neon-cyan transition-colors">Stellar</span>
              <span>•</span>
              <button onClick={() => window.open('https://aqua.network/', '_blank')} className="hover:text-neon-cyan transition-colors cursor-pointer">
                Aqua Network
              </button>
              <span>•</span>
              <span className="hover:text-neon-cyan transition-colors">LOBSTR</span>
              <span>•</span>
              <span className="hover:text-neon-cyan transition-colors">Freighter</span>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="text-center border-t border-neon-purple/20 pt-4">
            <p className="text-muted-foreground text-xs sm:text-sm">
              © 2024 <span className="text-neon-cyan">Cyber City Arcade LLC</span> • All Rights Reserved
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Built on the Stellar Blockchain • Play responsibly
            </p>
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