import React, { useRef } from 'react';
import { useNeonMatch } from '@/hooks/useNeonMatch';
import { NeonMatchGrid } from '@/components/games/neon-match/NeonMatchGrid';
import { NeonMatchHUD } from '@/components/games/neon-match/NeonMatchHUD';
import { NeonMatchLeaderboard } from '@/components/games/neon-match/NeonMatchLeaderboard';
import { NeonMatchEndModal } from '@/components/games/neon-match/NeonMatchEndModal';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, RotateCcw, Lock, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';

const NeonMatch: React.FC = () => {
  const {
    gameState,
    canPlay,
    playsRemaining,
    isLoading,
    finalScore,
    showEndModal,
    setShowEndModal,
    todayLeaderboard,
    allTimeLeaderboard,
    startGame,
    onCardClick,
    restartGame,
    isAuthenticated,
  } = useNeonMatch();

  const leaderboardRef = useRef<HTMLDivElement>(null);

  const scrollToLeaderboard = () => {
    setShowEndModal(false);
    setTimeout(() => {
      leaderboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-blue-950 relative overflow-hidden">
      {/* Neon Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            NEON MATCH 36
          </h1>

          <div className="text-cyan-400/70 text-sm">
            {isAuthenticated && (
              <span className="bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
                {playsRemaining} plays left
              </span>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-3xl mx-auto">
          {/* Not Authenticated */}
          {!isAuthenticated && (
            <div className="text-center py-12 px-4">
              <LogIn className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
              <h2 className="text-2xl font-bold text-white mb-2">Login Required</h2>
              <p className="text-cyan-400/70 mb-6">
                Please log in to play and save your scores to the leaderboard.
              </p>
              <Link to="/">
                <Button className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600">
                  <LogIn className="w-4 h-4 mr-2" />
                  Go to Login
                </Button>
              </Link>
            </div>
          )}

          {/* Loading */}
          {isAuthenticated && isLoading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-cyan-400/70">Loading...</p>
            </div>
          )}

          {/* Daily Limit Reached */}
          {isAuthenticated && !isLoading && !canPlay && !gameState.isPlaying && (
            <div className="text-center py-12 px-4">
              <Lock className="w-16 h-16 mx-auto mb-4 text-yellow-400/50" />
              <h2 className="text-2xl font-bold text-white mb-2">Daily Limit Reached</h2>
              <p className="text-yellow-400/70 mb-6">
                You've used all 3 daily plays. Come back tomorrow for more!
              </p>
            </div>
          )}

          {/* Ready to Play */}
          {isAuthenticated && !isLoading && canPlay && !gameState.isPlaying && (
            <div className="text-center py-8 sm:py-12 px-4">
              <div className="text-6xl sm:text-8xl mb-4 animate-bounce">🎮</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to Play?</h2>
              <p className="text-cyan-400/70 mb-6 max-w-md mx-auto">
                Match all 18 pairs of neon icons. Get bonuses for speed, efficiency, and perfect runs!
              </p>
              <Button
                onClick={startGame}
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-6 shadow-[0_0_30px_rgba(6,182,212,0.4)]"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </Button>
            </div>
          )}

          {/* Game In Progress */}
          {isAuthenticated && gameState.isPlaying && (
            <>
              <NeonMatchHUD
                timeSeconds={gameState.timeSeconds}
                moves={gameState.moves}
                matchedPairs={gameState.matchedPairs}
                totalPairs={18}
              />
              
              <NeonMatchGrid
                cards={gameState.cards}
                onCardClick={onCardClick}
                isLocked={gameState.isLocked}
              />

              <div className="flex justify-center mt-4 sm:mt-6">
                <Button
                  onClick={restartGame}
                  variant="outline"
                  className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                  disabled={!canPlay}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart
                </Button>
              </div>
            </>
          )}

          {/* Leaderboard */}
          {isAuthenticated && (
            <div ref={leaderboardRef}>
              <NeonMatchLeaderboard
                todayLeaderboard={todayLeaderboard}
                allTimeLeaderboard={allTimeLeaderboard}
              />
            </div>
          )}
        </div>
      </div>

      {/* End Game Modal */}
      <NeonMatchEndModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        gameState={gameState}
        finalScore={finalScore}
        onPlayAgain={restartGame}
        onViewLeaderboard={scrollToLeaderboard}
        canPlayAgain={canPlay}
      />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 25px rgba(236, 72, 153, 0.4); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

export default NeonMatch;
