
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LiveTournaments } from '@/components/LiveTournaments';
import { TriviaGame } from '@/components/TriviaGame';
import { CommunityHub } from '@/components/CommunityHub';
import { LiveStreaming } from '@/components/LiveStreaming';
import { Marketplace } from '@/components/Marketplace';
import { CCTRStaking } from '@/components/CCTRStaking';
import { DexSwap } from '@/components/dex/DexSwap';
import { PlayerDashboard } from '@/components/PlayerDashboard';
import { useAuth } from '@/hooks/useAuth';
import { CyberMusicPlayer } from '@/components/CyberMusicPlayer';
import { Toaster } from '@/components/ui/toaster';
import { TopBar } from '@/components/TopBar';
import { AIGamingCoach } from '@/components/AIGamingCoach';

export default function Index() {
  const [activeSection, setActiveSection] = useState('home');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeSection) {
      case 'tournaments':
        return <LiveTournaments />;
      case 'trivia':
        return <TriviaGame />;
      case 'ai-coach':
        return <AIGamingCoach />;
      case 'community':
        return <CommunityHub />;
      case 'streaming':
        return <LiveStreaming />;
      case 'marketplace':
        return <Marketplace />;
      case 'staking':
        return <CCTRStaking />;
      case 'dex':
        return <DexSwap />;
      case 'profile':
        return user ? <PlayerDashboard /> : <div>Please log in to view your profile</div>;
      case 'music':
        return <CyberMusicPlayer />;
      default:
        return (
          <div className="space-y-8">
            <section className="text-center">
              <h1 className="font-display text-5xl md:text-6xl font-bold text-neon-cyan mb-4">
                WELCOME TO CYBER CITY RETRO
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Explore retro gaming tournaments, trivia challenges, community hubs, and more.
              </p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => setActiveSection('tournaments')} className="cyber-button">
                  🎮 LIVE TOURNAMENTS
                </Button>
                <Button onClick={() => setActiveSection('trivia')} className="cyber-button">
                  🧠 GAMING TRIVIA
                </Button>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="arcade-frame p-4 text-center">
                <h3 className="font-bold text-xl text-neon-purple mb-2">COMMUNITY HUB</h3>
                <p className="text-sm text-muted-foreground">Connect with fellow retro gamers, share strategies, and join clubs.</p>
                <Button onClick={() => setActiveSection('community')} variant="secondary" className="w-full mt-4">
                  Explore
                </Button>
              </div>

              <div className="arcade-frame p-4 text-center">
                <h3 className="font-bold text-xl text-neon-pink mb-2">LIVE STREAMING</h3>
                <p className="text-sm text-muted-foreground">Watch live gameplay, retro speedruns, and esports events.</p>
                <Button onClick={() => setActiveSection('streaming')} variant="secondary" className="w-full mt-4">
                  Watch Now
                </Button>
              </div>

              <div className="arcade-frame p-4 text-center">
                <h3 className="font-bold text-xl text-neon-green mb-2">MARKETPLACE</h3>
                <p className="text-sm text-muted-foreground">Buy, sell, and trade retro games, consoles, and merchandise.</p>
                <Button onClick={() => setActiveSection('marketplace')} variant="secondary" className="w-full mt-4">
                  Visit Store
                </Button>
              </div>
            </section>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      <TopBar />

      <main className="container mx-auto px-4 py-8">
        <nav className="flex flex-wrap justify-center gap-4 mb-8">
          <Button
            onClick={() => setActiveSection('home')}
            variant={activeSection === 'home' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'home' ? 'active' : ''}`}
          >
            🏠 Home
          </Button>
          <Button
            onClick={() => setActiveSection('tournaments')}
            variant={activeSection === 'tournaments' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'tournaments' ? 'active' : ''}`}
          >
            🏆 Tournaments
          </Button>
          <Button
            onClick={() => setActiveSection('trivia')}
            variant={activeSection === 'trivia' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'trivia' ? 'active' : ''}`}
          >
            🧠 Trivia
          </Button>
          <Button
            onClick={() => setActiveSection('ai-coach')}
            variant={activeSection === 'ai-coach' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'ai-coach' ? 'active' : ''}`}
          >
            🤖 AI Coach
          </Button>
          <Button
            onClick={() => setActiveSection('community')}
            variant={activeSection === 'community' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'community' ? 'active' : ''}`}
          >
            💬 Community
          </Button>
          <Button
            onClick={() => setActiveSection('streaming')}
            variant={activeSection === 'streaming' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'streaming' ? 'active' : ''}`}
          >
            📺 Streaming
          </Button>
          <Button
            onClick={() => setActiveSection('marketplace')}
            variant={activeSection === 'marketplace' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'marketplace' ? 'active' : ''}`}
          >
            🛒 Marketplace
          </Button>
          <Button
            onClick={() => setActiveSection('staking')}
            variant={activeSection === 'staking' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'staking' ? 'active' : ''}`}
          >
            🏦 Staking
          </Button>
          <Button
            onClick={() => setActiveSection('dex')}
            variant={activeSection === 'dex' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'dex' ? 'active' : ''}`}
          >
            💱 DEX
          </Button>
          <Button
            onClick={() => setActiveSection('profile')}
            variant={activeSection === 'profile' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'profile' ? 'active' : ''}`}
          >
            👤 Profile
          </Button>
           <Button
            onClick={() => setActiveSection('music')}
            variant={activeSection === 'music' ? 'default' : 'outline'}
            className={`cyber-button ${activeSection === 'music' ? 'active' : ''}`}
          >
            🎵 Music
          </Button>
        </nav>

        {renderContent()}
      </main>

      <Toaster />
    </div>
  );
}
