
import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { CyberMusicPlayer } from "@/components/CyberMusicPlayer";
import { CommunityHub } from "@/components/CommunityHub";
import { SocialFeatures } from "@/components/SocialFeatures";
import { LiveStreaming } from "@/components/LiveStreaming";
import { TournamentSection } from "@/components/TournamentSection";
import { TokenDashboard } from "@/components/TokenDashboard";
import { MerchandiseStore } from "@/components/MerchandiseStore";
import { Marketplace } from "@/components/Marketplace";
import { VotingSection } from "@/components/VotingSection";
import { TriviaGame } from "@/components/TriviaGame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [activeTab, setActiveTab] = useState("community");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-black text-white relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-cyan/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-128 h-128 bg-neon-purple/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Matrix-like falling code effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="matrix-bg"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <TopBar />
        
        {/* Hero Section */}
        <div className="text-center py-8 px-4">
          <h1 
            className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-purple bg-clip-text text-transparent"
            style={{
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 30px rgba(0, 255, 255, 0.5), 0 0 60px rgba(255, 0, 255, 0.3)',
              filter: 'drop-shadow(0 0 10px #00ffcc)'
            }}
          >
            CYBER CITY
          </h1>
          <p 
            className="text-xl md:text-2xl text-neon-cyan mb-8"
            style={{
              fontFamily: 'Orbitron, monospace',
              textShadow: '0 0 10px #00ffcc'
            }}
          >
            🕹️ THE ULTIMATE WEB3 ARCADE EXPERIENCE 🎮
          </p>
          
          {/* Animated Tagline */}
          <div className="animate-pulse">
            <p className="text-neon-pink text-lg">
              ⚡ PLAY • EARN • CONNECT • STREAM ⚡
            </p>
          </div>
        </div>

        {/* Music Player */}
        <div className="px-4 mb-8">
          <CyberMusicPlayer />
        </div>

        {/* Main Tabs Navigation */}
        <div className="px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 bg-black/50 border border-neon-cyan/30 rounded-lg p-1 mb-8">
              <TabsTrigger 
                value="community" 
                className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan text-gray-300 hover:text-white transition-all"
              >
                💬 Community
              </TabsTrigger>
              <TabsTrigger 
                value="streaming" 
                className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink text-gray-300 hover:text-white transition-all"
              >
                📺 Streaming
              </TabsTrigger>
              <TabsTrigger 
                value="tournaments" 
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple text-gray-300 hover:text-white transition-all"
              >
                🏆 Tournaments
              </TabsTrigger>
              <TabsTrigger 
                value="tokens" 
                className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green text-gray-300 hover:text-white transition-all"
              >
                💰 Tokens
              </TabsTrigger>
              <TabsTrigger 
                value="marketplace" 
                className="data-[state=active]:bg-neon-cyan/20 data-[state=active]:text-neon-cyan text-gray-300 hover:text-white transition-all"
              >
                🛍️ Market
              </TabsTrigger>
              <TabsTrigger 
                value="store" 
                className="data-[state=active]:bg-neon-pink/20 data-[state=active]:text-neon-pink text-gray-300 hover:text-white transition-all"
              >
                👕 Store
              </TabsTrigger>
              <TabsTrigger 
                value="voting" 
                className="data-[state=active]:bg-neon-purple/20 data-[state=active]:text-neon-purple text-gray-300 hover:text-white transition-all"
              >
                🗳️ Vote
              </TabsTrigger>
              <TabsTrigger 
                value="trivia" 
                className="data-[state=active]:bg-neon-green/20 data-[state=active]:text-neon-green text-gray-300 hover:text-white transition-all"
              >
                🧠 Trivia
              </TabsTrigger>
            </TabsList>

            <div className="space-y-8">
              <TabsContent value="community" className="mt-0">
                <div className="space-y-8">
                  <CommunityHub />
                  <SocialFeatures />
                </div>
              </TabsContent>

              <TabsContent value="streaming" className="mt-0">
                <LiveStreaming />
              </TabsContent>

              <TabsContent value="tournaments" className="mt-0">
                <TournamentSection />
              </TabsContent>

              <TabsContent value="tokens" className="mt-0">
                <TokenDashboard />
              </TabsContent>

              <TabsContent value="marketplace" className="mt-0">
                <Marketplace />
              </TabsContent>

              <TabsContent value="store" className="mt-0">
                <MerchandiseStore />
              </TabsContent>

              <TabsContent value="voting" className="mt-0">
                <VotingSection />
              </TabsContent>

              <TabsContent value="trivia" className="mt-0">
                <TriviaGame />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer */}
        <footer className="text-center py-8 mt-16 border-t border-neon-cyan/20">
          <p className="text-neon-cyan">
            🎮 Powered by Web3 Technology • Built for Gamers, by Gamers 🚀
          </p>
          <p className="text-neon-purple text-sm mt-2">
            © 2024 Cyber City Arcade • The Future of Gaming is Here
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
