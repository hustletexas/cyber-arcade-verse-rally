import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useWallet } from '@/hooks/useWallet';
import { ProfileDashboard } from '@/components/ProfileDashboard';
import { CCTRStaking } from '@/components/CCTRStaking';
import { TriviaGame } from '@/components/TriviaGame';
import { TournamentBracket } from '@/components/TournamentBracket';
import { Web3Gaming } from '@/components/Web3Gaming';
import { AIGamingCoach } from '@/components/AIGamingCoach';
import { CyberMusicPlayer } from '@/components/CyberMusicPlayer';
import { SocialFeatures } from '@/components/SocialFeatures';
import { CommunityMarketplace } from '@/components/CommunityMarketplace';
import { BlockchainIntegration } from '@/components/BlockchainIntegration';
import { CommunityHub } from '@/components/CommunityHub';
import { NodePurchase } from '@/components/NodePurchase';
import JeopardyGame from "@/components/JeopardyGame";

const Index = () => {
  const { user } = useAuth();
  const { walletState, getConnectedWallet, isWalletConnected } = useWallet();
  const [currentSection, setCurrentSection] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-blue-900">
      {/* Top Bar */}
      <header className="bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-white">
            Cyber City Arcade <Badge className="ml-2">BETA</Badge>
          </Link>
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="secondary" asChild>
                  <Link to="/profile">My Profile</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/logout">Logout</Link>
                </Button>
              </>
            ) : (
              <>
                {!isWalletConnected() && (
                  <Button variant="secondary" asChild>
                    <Link to="/auth">Login</Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/auth">Register</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Navigation Sections */}
      <section id="navigation" className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('dashboard')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">👤</div>
                <h3 className="font-bold text-lg text-neon-cyan mb-2">Profile</h3>
                <p className="text-sm text-muted-foreground">View your stats and achievements</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('staking')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">💎</div>
                <h3 className="font-bold text-lg text-neon-purple mb-2">CCTR Staking</h3>
                <p className="text-sm text-muted-foreground">Stake CCTR tokens and earn rewards</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('trivia')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🎮</div>
                <h3 className="font-bold text-lg text-neon-pink mb-2">Gaming Trivia</h3>
                <p className="text-sm text-muted-foreground">Test your gaming knowledge</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('tournaments')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🏆</div>
                <h3 className="font-bold text-lg text-neon-green mb-2">Tournaments</h3>
                <p className="text-sm text-muted-foreground">Compete in gaming tournaments</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('web3games')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🌐</div>
                <h3 className="font-bold text-lg text-neon-cyan mb-2">Web3 Games</h3>
                <p className="text-sm text-muted-foreground">Explore blockchain-based games</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('ai-coach')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="font-bold text-lg text-neon-purple mb-2">AI Gaming Coach</h3>
                <p className="text-sm text-muted-foreground">Get AI-powered gaming advice</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('music')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🎵</div>
                <h3 className="font-bold text-lg text-neon-pink mb-2">Cyber Music</h3>
                <p className="text-sm text-muted-foreground">Listen to curated cyberpunk music</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('social')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="font-bold text-lg text-neon-green mb-2">Social</h3>
                <p className="text-sm text-muted-foreground">Connect with other gamers</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('marketplace')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🛒</div>
                <h3 className="font-bold text-lg text-neon-cyan mb-2">Marketplace</h3>
                <p className="text-sm text-muted-foreground">Buy and sell gaming assets</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('blockchain')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🔗</div>
                <h3 className="font-bold text-lg text-neon-purple mb-2">Blockchain</h3>
                <p className="text-sm text-muted-foreground">Explore blockchain integrations</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('community')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="font-bold text-lg text-neon-pink mb-2">Community</h3>
                <p className="text-sm text-muted-foreground">Join our community discussions</p>
              </CardContent>
            </Card>

            <Card className="holographic hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setCurrentSection('nodes')}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">⚙️</div>
                <h3 className="font-bold text-lg text-neon-green mb-2">Solana Nodes</h3>
                <p className="text-sm text-muted-foreground">Operate Solana validator nodes</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {currentSection === 'dashboard' && <ProfileDashboard />}
      {currentSection === 'staking' && <CCTRStaking />}
      {currentSection === 'trivia' && <TriviaGame />}
      {currentSection === 'tournaments' && <TournamentBracket />}
      {currentSection === 'web3games' && <Web3Gaming />}
      {currentSection === 'ai-coach' && <AIGamingCoach />}
      {currentSection === 'music' && <CyberMusicPlayer />}
      {currentSection === 'social' && <SocialFeatures />}
      {currentSection === 'marketplace' && <CommunityMarketplace />}
      {currentSection === 'blockchain' && <BlockchainIntegration />}
      {currentSection === 'community' && <CommunityHub />}
      {currentSection === 'nodes' && <NodePurchase />}
      {currentSection === 'jeopardy' && <JeopardyGame />}

      {/* Add Jeopardy Game Section */}
      <section id="jeopardy" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              🎯 Jeopardy Challenge
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Test your knowledge in our interactive Jeopardy-style game with categories covering blockchain, gaming, and Cyber City Arcade
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto">
            <Card className="arcade-frame p-8 text-center">
              <div className="space-y-6">
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-3xl font-bold text-neon-cyan mb-4">
                  Gaming Knowledge Challenge
                </h3>
                <p className="text-gray-300 text-lg mb-6">
                  Compete with friends and test your expertise across multiple categories including blockchain technology, gaming history, and arcade classics
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl mb-2">🎮</div>
                    <h4 className="font-bold text-neon-purple">Gaming Categories</h4>
                    <p className="text-sm text-gray-400">Arcade, Gaming, Retro Classics</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl mb-2">🔗</div>
                    <h4 className="font-bold text-neon-cyan">Blockchain Knowledge</h4>
                    <p className="text-sm text-gray-400">Crypto, DeFi, Smart Contracts</p>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl mb-2">🏰</div>
                    <h4 className="font-bold text-neon-pink">Cyber City Arcade</h4>
                    <p className="text-sm text-gray-400">Platform-specific trivia</p>
                  </div>
                </div>

                <Button
                  onClick={() => setCurrentSection('jeopardy')}
                  className="cyber-button text-lg px-8 py-3"
                >
                  🚀 Start Jeopardy Game
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/50 backdrop-blur-md py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p className="text-sm">
            © {new Date().getFullYear()} Cyber City Arcade. All rights reserved.
          </p>
          <p className="text-xs mt-2">
            Built with ❤️ using React, Tailwind CSS, and deployed on Vercel.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
