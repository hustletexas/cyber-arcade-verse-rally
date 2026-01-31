import React, { useRef } from 'react';
import { useCyberMatch } from '@/hooks/useCyberMatch';
import { 
  CyberMatchGrid, 
  CyberMatchHUD, 
  CyberMatchModeSelect,
  CyberMatchEndModal,
  CyberMatchLeaderboard,
  CyberMatchPlayerStats
} from '@/components/games/cyber-match';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, RotateCcw, Coins, Crown, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WalletStatusBar } from '@/components/WalletStatusBar';
import { cn } from '@/lib/utils';

const CyberMatch: React.FC = () => {
  const {
    gameState,
    canPlay,
    playsRemaining,
    isLoading,
    finalScore,
    ticketsEarned,
    showEndModal,
    setShowEndModal,
    todayLeaderboard,
    allTimeLeaderboard,
    playerStats,
    startGame,
    onCardClick,
    restartGame,
    backToModeSelect,
    isAuthenticated,
    cctrBalance,
    hasEnoughCCTR,
    entryFee,
    gameMode,
    difficulty,
    totalPairs,
    chestEarned,
    screenShake,
    comboPulse,
  } = useCyberMatch();

  const leaderboardRef = useRef<HTMLDivElement>(null);

  const scrollToLeaderboard = () => {
    setShowEndModal(false);
    setTimeout(() => {
      leaderboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-black via-purple-950 to-blue-950 relative overflow-hidden",
      screenShake && "animate-shake"
    )}>
      {/* Animated Cyber Grid Overlay */}
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Wallet Status Bar */}
        <div className="mb-4 animate-fade-in">
          <WalletStatusBar />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <Link to="/">
            <Button variant="ghost" className="text-neon-cyan hover:text-cyan-300 hover:bg-cyan-500/10 transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-purple bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
            CYBER MATCH
          </h1>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <span className="bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/30 text-yellow-400 text-sm flex items-center gap-1">
                <Coins className="w-3 h-3" />
                {cctrBalance} CCTR
              </span>
            )}
            {gameMode && (
              <Badge 
                variant="outline" 
                className={gameMode === 'daily' 
                  ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' 
                  : 'bg-green-500/20 text-green-400 border-green-500/50'
                }
              >
                {gameMode === 'daily' ? <Crown className="w-3 h-3 mr-1" /> : <Gamepad2 className="w-3 h-3 mr-1" />}
                {gameMode === 'daily' ? 'Daily Run' : 'Free Match'}
              </Badge>
            )}
          </div>
        </div>

        {/* Game Area */}
        <div className="max-w-3xl mx-auto">
          {/* Loading */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neon-cyan/70">Loading...</p>
            </div>
          )}

          {/* Mode Selection */}
          {!isLoading && !gameState.isPlaying && !gameMode && (
            <CyberMatchModeSelect
              isAuthenticated={isAuthenticated}
              hasEnoughCCTR={hasEnoughCCTR}
              cctrBalance={cctrBalance}
              canPlay={canPlay}
              playsRemaining={playsRemaining}
              onStartGame={startGame}
            />
          )}

          {/* Game In Progress */}
          {gameState.isPlaying && (
            <>
              <CyberMatchHUD
                timeSeconds={gameState.timeSeconds}
                moves={gameState.moves}
                matchedPairs={gameState.matchedPairs}
                totalPairs={totalPairs}
                streak={gameState.streak}
                comboMultiplier={gameState.comboMultiplier}
                mistakesRemaining={gameState.mistakesRemaining}
                mismatches={gameState.mismatches}
                totalScore={gameState.totalScore}
                gameMode={gameMode}
                comboPulse={comboPulse}
              />
              
              <CyberMatchGrid
                cards={gameState.cards}
                onCardClick={onCardClick}
                isLocked={gameState.isLocked}
                difficulty={difficulty}
                screenShake={screenShake}
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
                    className="border-neon-pink/50 text-neon-pink hover:bg-pink-500/10"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                )}
              </div>
            </>
          )}

          {/* Leaderboard & Stats (visible when mode selected) */}
          {gameMode && (
            <>
              <div ref={leaderboardRef}>
                <CyberMatchLeaderboard
                  todayLeaderboard={todayLeaderboard}
                  allTimeLeaderboard={allTimeLeaderboard}
                />
              </div>
              <CyberMatchPlayerStats stats={playerStats} />
            </>
          )}
        </div>
      </div>

      {/* End Game Modal */}
      <CyberMatchEndModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        gameState={gameState}
        finalScore={finalScore}
        ticketsEarned={ticketsEarned}
        onPlayAgain={gameMode === 'free' ? restartGame : (canPlay && hasEnoughCCTR ? restartGame : backToModeSelect)}
        onViewLeaderboard={gameMode === 'daily' ? scrollToLeaderboard : backToModeSelect}
        canPlayAgain={gameMode === 'free' || (canPlay && hasEnoughCCTR)}
        gameMode={gameMode}
        difficulty={difficulty}
        chestEarned={chestEarned}
      />

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        
        @keyframes match-glow {
          0% { box-shadow: 0 0 20px rgba(74, 222, 128, 0.5); }
          50% { box-shadow: 0 0 40px rgba(74, 222, 128, 0.8); }
          100% { box-shadow: 0 0 20px rgba(74, 222, 128, 0.5); }
        }
        .animate-match-glow {
          animation: match-glow 0.5s ease-out;
        }
        
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.25; }
        }
        .animate-grid-pulse {
          animation: grid-pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default CyberMatch;
