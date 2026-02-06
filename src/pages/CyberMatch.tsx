import React, { useRef, useEffect } from 'react';
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
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMultiWallet } from '@/hooks/useMultiWallet';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CCCBalanceBar } from '@/components/games/CCCBalanceBar';

import '@/components/games/cyber-match/cyber-match.css';

const CyberMatch: React.FC = () => {
  const navigate = useNavigate();
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
    cccBalance,
    hasEnoughCCC,
    entryFee,
    gameMode,
    difficulty,
    totalPairs,
    chestEarned,
    screenShake,
    comboPulse,
  } = useCyberMatch();

  const { isWalletConnected } = useMultiWallet();
  const leaderboardRef = useRef<HTMLDivElement>(null);

  const scrollToLeaderboard = () => {
    setShowEndModal(false);
    setTimeout(() => {
      leaderboardRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="cyber-match-container min-h-screen bg-gradient-to-br from-black via-purple-950/50 to-blue-950/50">
      {/* Animated background grid */}
      <div className="cyber-grid-bg" />
      
      {/* Animated Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-4xl">
        {/* Navigation + CCC Balance Bar */}
        <div className="relative z-20 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="text-neon-cyan hover:text-cyan-300 hover:bg-cyan-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
          <CCCBalanceBar />
        </div>

        <AnimatePresence mode="wait">
          {/* Loading State */}
          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12"
            >
              <div className="w-12 h-12 border-4 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neon-cyan/70">Loading...</p>
            </motion.div>
          )}

          {/* Mode Selection */}
          {!isLoading && !gameState.isPlaying && !gameMode && (
            <motion.div
              key="mode-select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Hero Section */}
              <div className="text-center py-8">
                <h1 
                  className="cyber-title font-display text-4xl md:text-5xl lg:text-6xl text-neon-cyan mb-4"
                  data-text="CYBER MATCH"
                >
                  CYBER MATCH
                </h1>
                <p className="text-lg text-gray-400 max-w-xl mx-auto">
                  Match pairs • Build combos • Earn rewards
                </p>
                
                {/* Live Activity Ticker */}
                <div className="mt-6 py-2 border-y border-neon-cyan/20 overflow-hidden">
                  <div className="activity-ticker">
                    <div className="activity-ticker-content text-sm text-neon-cyan/70">
                      🔥 Player #28 just hit a perfect clear! • 🎁 5x Combo unlocked • 
                      🏆 New daily high score: 8,450 pts • ⚡ 156 players online now • 
                      🎮 Hard mode trending • 🔥 Player #28 just hit a perfect clear!
                    </div>
                  </div>
                </div>
              </div>

              <CyberMatchModeSelect
                isAuthenticated={isAuthenticated}
                hasEnoughCCC={hasEnoughCCC}
                cccBalance={cccBalance}
                canPlay={canPlay}
                playsRemaining={playsRemaining}
                onStartGame={startGame}
              />

              {/* Stats & Leaderboard Preview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <CyberMatchPlayerStats stats={playerStats} />
                <div ref={leaderboardRef}>
                  <CyberMatchLeaderboard
                    todayLeaderboard={todayLeaderboard}
                    allTimeLeaderboard={allTimeLeaderboard}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Game In Progress */}
          {gameState.isPlaying && (
            <motion.div
              key="gameplay"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              {/* Game Header */}
              <div className="text-center mb-4">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "mt-2",
                    difficulty === 'easy' && "border-green-500/50 text-green-400",
                    difficulty === 'normal' && "border-yellow-500/50 text-yellow-400",
                    difficulty === 'hard' && "border-red-500/50 text-red-400"
                  )}
                >
                  {difficulty.toUpperCase()} MODE
                </Badge>
              </div>

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

              <div className="flex justify-center gap-3 mt-6">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* End Game Modal */}
      <CyberMatchEndModal
        isOpen={showEndModal}
        onClose={() => setShowEndModal(false)}
        gameState={gameState}
        finalScore={finalScore}
        ticketsEarned={ticketsEarned}
        onPlayAgain={gameMode === 'free' ? restartGame : (canPlay && hasEnoughCCC ? restartGame : backToModeSelect)}
        onViewLeaderboard={gameMode === 'daily' ? scrollToLeaderboard : backToModeSelect}
        canPlayAgain={gameMode === 'free' || (canPlay && hasEnoughCCC)}
        gameMode={gameMode}
        difficulty={difficulty}
        chestEarned={chestEarned}
      />
    </div>
  );
};

export default CyberMatch;
