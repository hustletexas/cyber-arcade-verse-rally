import React, { useRef } from 'react';
import { useNeonMatch, GameMode } from '@/hooks/useNeonMatch';
import { NeonMatchGrid } from '@/components/games/neon-match/NeonMatchGrid';
import { NeonMatchHUD } from '@/components/games/neon-match/NeonMatchHUD';
import { NeonMatchLeaderboard } from '@/components/games/neon-match/NeonMatchLeaderboard';
import { NeonMatchEndModal } from '@/components/games/neon-match/NeonMatchEndModal';
import { NeonMatchAchievements } from '@/components/games/neon-match/NeonMatchAchievements';
import { NeonMatchAchievementToast } from '@/components/games/neon-match/NeonMatchAchievementToast';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Play, RotateCcw, Trophy, Gamepad2, Coins, Wallet, Sparkles, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { Badge } from '@/components/ui/badge';

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
    backToModeSelect,
    isAuthenticated,
    cctrBalance,
    hasEnoughCCTR,
    entryFee,
    gameMode,
    achievements,
    newlyUnlocked,
    clearNewlyUnlocked,
    unlockedCount,
    totalCount,
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
      {/* Animated Neon Grid Overlay */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none animate-grid-pulse"
        style={{
          backgroundImage: `
            linear-gradient(rgba(6, 182, 212, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(236, 72, 153, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-20"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />

      {/* Animated Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none animate-breathe" />

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-float-particle-1 opacity-60" style={{ left: '10%', top: '20%' }} />
        <div className="absolute w-1 h-1 bg-pink-400 rounded-full animate-float-particle-2 opacity-60" style={{ left: '80%', top: '30%' }} />
        <div className="absolute w-1.5 h-1.5 bg-purple-400 rounded-full animate-float-particle-3 opacity-60" style={{ left: '30%', top: '70%' }} />
        <div className="absolute w-2 h-2 bg-cyan-300 rounded-full animate-float-particle-4 opacity-40" style={{ left: '70%', top: '60%' }} />
        <div className="absolute w-1 h-1 bg-pink-300 rounded-full animate-float-particle-5 opacity-50" style={{ left: '50%', top: '40%' }} />
      </div>

      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Wallet Status Bar */}
        <div className="mb-4 animate-fade-in">
          <WalletStatusBar />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-text-shimmer drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
            NEON MATCH 36
          </h1>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <span className="bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-400 text-sm flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {cctrBalance} CCTR
                </span>
                {gameMode === 'ranked' && (
                  <span className="bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30 text-cyan-400 text-sm">
                    {playsRemaining} ranked left
                  </span>
                )}
              </>
            )}
            {gameMode && (
              <Badge 
                variant="outline" 
                className={gameMode === 'ranked' 
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' 
                  : 'bg-green-500/20 text-green-400 border-green-500/50'
                }
              >
                {gameMode === 'ranked' ? <Crown className="w-3 h-3 mr-1" /> : <Gamepad2 className="w-3 h-3 mr-1" />}
              {gameMode === 'ranked' ? 'Ranked' : 'Free Play'}
            </Badge>
            )}
            {/* Compact achievement display */}
            {unlockedCount > 0 && (
              <NeonMatchAchievements achievements={achievements} compact />
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-3xl mx-auto">
          {/* Loading */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-cyan-400/70">Loading...</p>
            </div>
          )}

          {/* Mode Selection (when not playing) */}
          {!isLoading && !gameState.isPlaying && !gameMode && (
            <div className="py-8 px-4">
              <div className="text-center mb-8">
                <div className="text-6xl sm:text-8xl mb-4">🎮</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Choose Your Mode</h2>
                <p className="text-cyan-400/70 max-w-md mx-auto">
                  Match all 18 pairs of neon NFT icons. Get bonuses for speed, efficiency, and perfect runs!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* Free Play Card */}
                <Card className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border-green-500/30 hover:border-green-400/50 transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.2)] cursor-pointer group hover:scale-[1.02]"
                  onClick={() => startGame('free')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Gamepad2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-green-400 mb-2">Free Play</h3>
                    <p className="text-green-400/70 text-sm mb-4">
                      Practice and have fun! No cost, unlimited plays.
                    </p>
                    <div className="space-y-2 text-left text-sm">
                      <div className="flex items-center gap-2 text-green-400/80">
                        <Sparkles className="w-4 h-4" />
                        <span>No entry fee</span>
                      </div>
                      <div className="flex items-center gap-2 text-green-400/80">
                        <Play className="w-4 h-4" />
                        <span>Unlimited plays</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Trophy className="w-4 h-4" />
                        <span>Score not saved to leaderboard</span>
                      </div>
                    </div>
                    <div className="w-full mt-4 py-2 px-4 rounded-md bg-green-600 text-white font-medium flex items-center justify-center gap-2 group-hover:bg-green-500 transition-colors">
                      <Play className="w-4 h-4" />
                      Click to Play Free
                    </div>
                  </CardContent>
                </Card>

                {/* Ranked Play Card */}
                <Card 
                  className={`bg-gradient-to-br from-yellow-900/30 to-orange-900/20 border-yellow-500/30 transition-all hover:shadow-[0_0_30px_rgba(234,179,8,0.2)] group ${
                    isAuthenticated && hasEnoughCCTR && canPlay 
                      ? 'cursor-pointer hover:border-yellow-400/50 hover:scale-[1.02]' 
                      : 'opacity-80'
                  }`}
                  onClick={() => isAuthenticated && hasEnoughCCTR && canPlay && startGame('ranked')}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Crown className="w-8 h-8 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-bold text-yellow-400 mb-2">Play to Win</h3>
                    <p className="text-yellow-400/70 text-sm mb-4">
                      Compete for the leaderboard! Entry fee required.
                    </p>
                    <div className="space-y-2 text-left text-sm">
                      <div className="flex items-center gap-2 text-yellow-400/80">
                        <Coins className="w-4 h-4" />
                        <span>{entryFee} CCTR entry fee</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400/80">
                        <Trophy className="w-4 h-4" />
                        <span>Score saved to leaderboard</span>
                      </div>
                      <div className="flex items-center gap-2 text-yellow-400/80">
                        <Sparkles className="w-4 h-4" />
                        <span>{playsRemaining} ranked plays remaining today</span>
                      </div>
                    </div>

                    {!isAuthenticated ? (
                      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                        <p className="text-yellow-400/60 text-xs mb-2">Connect wallet to play ranked</p>
                        <WalletStatusBar />
                      </div>
                    ) : !hasEnoughCCTR ? (
                      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                        <p className="text-yellow-400/60 text-xs mb-2">
                          Need {entryFee} CCTR (You have {cctrBalance})
                        </p>
                        <Link to="/">
                          <Button variant="outline" className="w-full border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10">
                            Get More CCTR
                          </Button>
                        </Link>
                      </div>
                    ) : !canPlay ? (
                      <div className="w-full mt-4 py-2 px-4 rounded-md bg-gray-600 text-gray-400 font-medium flex items-center justify-center gap-2">
                        Daily Limit Reached
                      </div>
                    ) : (
                      <div className="w-full mt-4 py-2 px-4 rounded-md bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold flex items-center justify-center gap-2 group-hover:from-yellow-600 group-hover:to-orange-600 transition-colors">
                        <Crown className="w-4 h-4" />
                        Click to Play ({entryFee} CCTR)
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Game In Progress */}
          {gameState.isPlaying && (
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

              <div className="flex justify-center gap-3 mt-4 sm:mt-6">
                <Button
                  onClick={backToModeSelect}
                  variant="outline"
                  className="border-gray-500/50 text-gray-400 hover:bg-gray-500/10"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit
                </Button>
                {gameMode === 'free' && (
                  <Button
                    onClick={restartGame}
                    variant="outline"
                    className="border-pink-500/50 text-pink-400 hover:bg-pink-500/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Leaderboard (always visible when not in mode select) */}
          {gameMode && (
            <div ref={leaderboardRef}>
              <NeonMatchLeaderboard
                todayLeaderboard={todayLeaderboard}
                allTimeLeaderboard={allTimeLeaderboard}
              />
            </div>
          )}

          {/* Achievements Section (always visible when not in mode select) */}
          {gameMode && (
            <div className="mt-6">
              <NeonMatchAchievements achievements={achievements} />
            </div>
          )}
        </div>
      </div>

      {/* Achievement Unlock Toast */}
      {newlyUnlocked.length > 0 && (
        <NeonMatchAchievementToast
          achievements={newlyUnlocked}
          onComplete={clearNewlyUnlocked}
        />
      )}

      {/* End Game Modal */}
      <NeonMatchEndModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        gameState={gameState}
        finalScore={finalScore}
        onPlayAgain={gameMode === 'free' ? restartGame : (canPlay && hasEnoughCCTR ? restartGame : backToModeSelect)}
        onViewLeaderboard={gameMode === 'ranked' ? scrollToLeaderboard : backToModeSelect}
        canPlayAgain={gameMode === 'free' || (canPlay && hasEnoughCCTR)}
        gameMode={gameMode}
      />

      {/* Custom CSS for neon animations */}
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.3); }
          50% { box-shadow: 0 0 25px rgba(236, 72, 153, 0.4); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }
        
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        .animate-grid-pulse {
          animation: grid-pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-pulse-glow-delayed {
          animation: pulse-glow 3s ease-in-out infinite 1.5s;
        }
        
        @keyframes breathe {
          0%, 100% { opacity: 0.08; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.15; transform: translate(-50%, -50%) scale(1.2); }
        }
        .animate-breathe {
          animation: breathe 5s ease-in-out infinite;
        }
        
        @keyframes float-particle-1 {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-30px) translateX(15px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-40px) translateX(5px); }
        }
        .animate-float-particle-1 { animation: float-particle-1 8s ease-in-out infinite; }
        
        @keyframes float-particle-2 {
          0%, 100% { transform: translateY(0) translateX(0); }
          33% { transform: translateY(-20px) translateX(-20px); }
          66% { transform: translateY(-35px) translateX(10px); }
        }
        .animate-float-particle-2 { animation: float-particle-2 10s ease-in-out infinite; }
        
        @keyframes float-particle-3 {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-25px) translateX(-15px); }
        }
        .animate-float-particle-3 { animation: float-particle-3 6s ease-in-out infinite; }
        
        @keyframes float-particle-4 {
          0%, 100% { transform: translateY(0) translateX(0); }
          40% { transform: translateY(-15px) translateX(20px); }
          80% { transform: translateY(-30px) translateX(-5px); }
        }
        .animate-float-particle-4 { animation: float-particle-4 9s ease-in-out infinite; }
        
        @keyframes float-particle-5 {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(-10px); }
          75% { transform: translateY(-10px) translateX(15px); }
        }
        .animate-float-particle-5 { animation: float-particle-5 7s ease-in-out infinite; }
        
        @keyframes text-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .animate-text-shimmer {
          background-size: 200% auto;
          animation: text-shimmer 3s linear infinite;
        }
        
        @keyframes neon-flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.8; }
          94% { opacity: 1; }
          96% { opacity: 0.9; }
          97% { opacity: 1; }
        }
        .animate-neon-flicker {
          animation: neon-flicker 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NeonMatch;